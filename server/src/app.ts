import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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
