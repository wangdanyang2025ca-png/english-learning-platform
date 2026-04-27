import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';
import { exec } from 'child_process';
import * as util from 'util';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// 加载增强词汇库（包含英式/美式发音、多样化例句、多轮学习）
let wordsDatabase: any[] = [];
try {
  // 尝试加载增强词汇库
  const enhancedPath = path.join(__dirname, 'data/words-enhanced.json');
  const fallbackPath = path.join(__dirname, 'data/words-3000.json');

  let wordsPath = enhancedPath;
  if (!fs.existsSync(enhancedPath)) {
    wordsPath = fallbackPath;
  }

  const rawData = fs.readFileSync(wordsPath, 'utf-8');
  wordsDatabase = JSON.parse(rawData);
  console.log(`✅ 已加载 ${wordsDatabase.length} 个词汇`);
  console.log(`   📁 数据源: ${wordsPath.split('/').pop()}`);
} catch (error) {
  console.warn('⚠️ 无法加载词汇文件，使用默认数据');
}

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// 健康检查路由
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '✅ 服务器运行正常！',
    timestamp: new Date().toISOString(),
    wordsLoaded: wordsDatabase.length
  });
});

// 测试路由
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '欢迎使用英语学习平台 API',
    version: '0.1.0',
    wordsAvailable: wordsDatabase.length
  });
});

// 单词 API
app.get('/api/words', (req: Request, res: Response) => {
  const { category, difficulty, page = '1', limit = '20', search } = req.query;

  let filtered = [...wordsDatabase];

  // 按分类筛选
  if (category && category !== 'all') {
    filtered = filtered.filter(w => w.categories?.includes(category));
  }

  // 按难度筛选
  if (difficulty) {
    filtered = filtered.filter(w => w.difficulty <= parseInt(difficulty as string));
  }

  // 按搜索词筛选
  if (search) {
    filtered = filtered.filter(w =>
      w.word.toLowerCase().includes((search as string).toLowerCase()) ||
      w.definition_cn?.includes(search as string)
    );
  }

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const data = filtered.slice(start, start + limitNum);

  res.json({
    success: true,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

app.get('/api/words/:id', (req: Request, res: Response) => {
  const word = wordsDatabase.find(w => w.word === req.params.id.toLowerCase());
  if (!word) {
    return res.status(404).json({ success: false, message: '单词未找到' });
  }
  res.json({ success: true, data: word });
});

// 统计 API
app.get('/api/words/stats/summary', (req: Request, res: Response) => {
  const cet4 = wordsDatabase.filter(w => w.categories?.includes('CET4')).length;
  const cet6 = wordsDatabase.filter(w => w.categories?.includes('CET6')).length;

  res.json({
    success: true,
    data: {
      total: wordsDatabase.length,
      cet4,
      cet6,
      categories: ['CET4', 'CET6']
    }
  });
});

// TTS (文本转语音) API - 支持美式和英式发音区分
app.get('/api/tts', async (req: Request, res: Response) => {
  const { word, lang = 'en-us' } = req.query;

  if (!word) {
    return res.status(400).json({ success: false, message: 'Missing word parameter' });
  }

  try {
    const wordStr = (word as string);
    const isGb = lang === 'en-gb';
    const voiceType = isGb ? '英式发音' : '美式发音';

    console.log(`🔊 生成TTS音频: "${wordStr}" (${voiceType})`);

    // 使用不同的TTS URL根据语言
    let ttsUrl: string;

    if (isGb) {
      // 英式发音 - 使用英国地区的 Google Translate
      ttsUrl = `https://translate.google.co.uk/translate_tts?ie=UTF-8&client=gtx&tl=en_GB&q=${encodeURIComponent(wordStr)}`;
    } else {
      // 美式发音 - 使用美国地区的 Google Translate
      ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=en_US&q=${encodeURIComponent(wordStr)}`;
    }

    console.log(`📡 调用 Google Translate TTS (${voiceType})...`);

    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': isGb ? 'https://translate.google.co.uk/' : 'https://translate.google.com/',
        'Accept-Language': isGb ? 'en-GB,en;q=0.9' : 'en-US,en;q=0.9',
        'Accept': 'audio/mpeg'
      },
      timeout: 15000
    });

    // 验证返回的是有效的音频数据
    if (!response.data || response.data.length < 500) {
      console.error('❌ 收到无效数据，长度:', response.data?.length);
      throw new Error('Invalid audio data from Google TTS');
    }

    console.log(`✅ 音频生成成功，大小: ${response.data.length} 字节 (${voiceType})`);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30天缓存
    res.setHeader('Content-Length', response.data.length);
    res.send(response.data);

  } catch (error: any) {
    console.error('❌ TTS错误:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate audio',
      error: error.message
    });
  }
});

// 错误处理中间件
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '路由不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});

export default app;
