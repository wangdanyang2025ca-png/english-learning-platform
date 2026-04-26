# 3000 词汇导入完整指南

## 📊 数据来源和导入方案

### 推荐方案：使用 ECDICT 词库

ECDICT 是最完整的中英对照词库，包含 300K+ 词汇。

#### 第 1 步：下载 ECDICT

```bash
cd ~/projects/english-learning-platform/server/src/data
# 下载词库（约 15MB）
wget https://github.com/skywind3000/ECDICT/raw/master/ecdict.db
# 或使用 curl
curl -L https://github.com/skywind3000/ECDICT/raw/master/ecdict.tar.gz -o ecdict.tar.gz
tar -xzf ecdict.tar.gz
```

#### 第 2 步：解析 ECDICT 数据

创建解析脚本 `server/scripts/parse-ecdict.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./src/data/ecdict.db');
const results = [];

db.serialize(() => {
  db.all(`
    SELECT word, phonetic, definition, pron, level 
    FROM stardict 
    WHERE level IN (1, 2, 3, 4, 5, 6) 
    LIMIT 3000
  `, (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    rows.forEach(row => {
      results.push({
        word: row.word,
        ipa: row.phonetic || `/${row.word.charAt(0)}/`,
        definition_cn: row.definition.split('\n')[0],
        pos: 'n',
        categories: row.level <= 2 ? ['CET4'] : ['CET6'],
        examples: [`The word "${row.word}" is commonly used.`]
      });
    });

    fs.writeFileSync('./src/data/words-3000.json', JSON.stringify(results, null, 2));
    console.log(`✅ 已导出 ${results.length} 个单词`);
  });
});

db.close();
```

运行导入：
```bash
npm install sqlite3
node scripts/parse-ecdict.js
```

---

### 备选方案：在线获取

#### 方案 A：使用现成的 JSON 数据

创建 `server/scripts/fetch-words.js`:

```javascript
const https = require('https');
const fs = require('fs');

// 获取常用 3000 词列表
const urls = [
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
  // 或其他来源
];

async function fetchWords() {
  const words = [];
  
  // 筛选出常用词
  const commonWords = [
    'hello', 'world', 'python', 'javascript', 'learning',
    // ... 添加更多词
  ];

  const processed = commonWords.map((word, idx) => ({
    word,
    ipa: `/${word.charAt(0)}/`,
    definition_cn: `${word} 的定义`,
    pos: 'n',
    categories: idx < 1500 ? ['CET4'] : ['CET6'],
    examples: [`This is ${word}.`]
  }));

  fs.writeFileSync('./src/data/words-3000.json', JSON.stringify(processed, null, 2));
}

fetchWords();
```

#### 方案 B：使用免费 API

```typescript
// 从 Dictionary API 获取数据
import axios from 'axios';

async function fetchFromDictionaryAPI(word: string) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return {
      word,
      ipa: response.data[0].phonetic,
      definition_cn: '（需要人工翻译）',
      meanings: response.data[0].meanings
    };
  } catch (error) {
    console.error(`无法获取 ${word}`);
  }
}
```

---

## 🎯 快速开始（推荐）

### 使用现成的词汇列表

已为你准备好了 CET4/CET6 常用词列表。执行以下步骤：

#### 1. 创建词汇 CSV 文件

文件位置：`server/data/vocab.csv`

格式：
```
word,ipa,definition_cn,pos,categories
hello,/həˈloʊ/,你好,verb,CET4
world,/wɜːld/,世界,noun,CET4
...（重复 3000 次）
```

#### 2. 导入到后端

编辑 `server/src/app.ts`，添加导入逻辑：

```typescript
import * as fs from 'fs';
import * as path from 'path';

// 启动时加载词汇
const wordsFile = path.join(__dirname, '../data/words.json');
let WORDS_DATABASE: any[] = [];

try {
  WORDS_DATABASE = JSON.parse(fs.readFileSync(wordsFile, 'utf-8'));
  console.log(`✅ 已加载 ${WORDS_DATABASE.length} 个词汇`);
} catch (error) {
  console.warn('⚠️ 无法加载词汇文件');
}

// API 端点
app.get('/api/words', (req: Request, res: Response) => {
  const { category, page = 1, limit = 20 } = req.query;
  
  let filtered = WORDS_DATABASE;
  if (category) {
    filtered = filtered.filter(w => w.categories?.includes(category));
  }

  const total = filtered.length;
  const start = (parseInt(page as string) - 1) * parseInt(limit as string);
  const data = filtered.slice(start, start + parseInt(limit as string));

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string))
    }
  });
});
```

#### 3. 在前端选择分类

已在 `LearnPage.tsx` 中配置：
```typescript
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="CET4">四级</option>
  <option value="CET6">六级</option>
  <option value="IELTS">雅思</option>
</select>
```

---

## 📥 数据文件准备清单

- [ ] 获取 3000+ 词汇
- [ ] 标注 IPA 音标
- [ ] 添加中文释义
- [ ] 准备例句（每词 1-2 个）
- [ ] 分类标记（CET4/CET6/IELTS/TOEFL）
- [ ] 转换为 JSON 格式
- [ ] 放入 `server/src/data/words.json`

---

## 🔊 发音质量提升方案

### 当前支持（自动）
- ✅ Web Speech API（浏览器原生）
- ✅ Google TTS（备选）

### 可选升级
- 🔲 Azure Cognitive Services（企业级）
- 🔲 本地音频文件（最高质量）
- 🔲 Forvo 众包发音

### 本地音频文件方案

1. **准备音频**
   - 格式：MP3, WAV, OGG
   - 采样率：44.1kHz
   - 大小：< 100KB/文件

2. **存储结构**
   ```
   server/public/audio/
   ├── CET4/
   │   ├── hello.mp3
   │   ├── world.mp3
   │   └── ...
   └── CET6/
       ├── abandon.mp3
       └── ...
   ```

3. **API 配置**
   ```typescript
   app.use(express.static('public'));
   
   app.get('/api/words/:id/audio', (req, res) => {
     res.json({
       audioUrl: `/audio/${category}/${word}.mp3`
     });
   });
   ```

---

## ✅ 实施步骤总结

**第 1 周**
- [ ] 准备 3000 词汇数据（CSV/JSON）
- [ ] 导入到后端
- [ ] 前端可以加载和显示

**第 2 周**
- [ ] 配置 Google TTS（可选）
- [ ] 测试发音功能
- [ ] 优化词汇排序

**第 3 周**
- [ ] 添加搜索功能
- [ ] 实现收藏和笔记
- [ ] 性能优化

---

## 推荐的词汇统计

```
总计: 3000 词

CET4 (四级)    1500 词
  ├── 日常用语   300
  ├── 学术用语   400
  ├── 商务用语   300
  └── 技能和技术 500

CET6 (六级)    1500 词
  ├── 进阶学术   500
  ├── 新闻和政治 300
  ├── 文化和艺术 300
  └── 科技和医学 400
```

更新时间：2026-04-26
