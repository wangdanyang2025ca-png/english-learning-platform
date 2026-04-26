# 词库和发音配置指南

## 快速开始

### 1️⃣ 使用示例词库（推荐新手）

已包含 100+ 常用词汇，可以立即使用：

```bash
# 后端已配置示例数据，无需操作
# 访问 http://localhost:5001/api/words 查看
```

### 2️⃣ 导入 3000+ 词汇

#### 方式 A: 自动生成词库

```bash
cd ~/projects/english-learning-platform/server
node scripts/generate-words.js
```

#### 方式 B: 从 CSV 导入

1. 准备词汇 CSV 文件格式：
```csv
word,ipa,definition_cn,pos,categories,examples
hello,/həˈloʊ/,你好,verb,CET4,Hello world.
```

2. 导入脚本：
```bash
npm run import-words
```

#### 方式 C: 使用开源词库

推荐来源：
- **ECDICT**: https://github.com/skywind3000/ECDICT （中文释义，音标齐全）
- **MDN 词汇表**: https://developer.mozilla.org/en-US/docs/Glossary
- **掌握高频词**: http://www.hskhsk.com/

---

## 🎵 发音配置

### 方案对比

| 方案 | 质量 | 成本 | 使用 |
|------|------|------|------|
| **Web Speech API** | 中等 | 免费 | 浏览器原生 ✅ |
| **Google TTS** | 高 | 免费 | 需要 API |
| **Azure TTS** | 高 | 付费 | 企业级 |
| **Oxford API** | 高 | 付费 | 专业词典 |
| **Forvo** | 混合 | 免费 | 众包发音 |

### 推荐方案：Google TTS

#### 配置步骤

1. **编辑后端代码** (`server/src/app.ts`):
```typescript
import { TTSService } from './services/tts.service';

app.get('/api/words/:id/audio', (req, res) => {
  const audioUrl = TTSService.generateAudioUrl(req.params.id);
  res.json({ success: true, audioUrl });
});
```

2. **前端使用**:
```typescript
// WordCard.tsx
const handleSpeak = () => {
  const audioUrl = TTSService.getGoogleTTSUrl(word);
  const audio = new Audio(audioUrl);
  audio.play();
};
```

### 最佳实践：混合方案

```typescript
class AudioProvider {
  static async speak(word: string) {
    // 优先使用 Web Speech API（本地，快速）
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      return;
    }
    
    // 备选：Google TTS（更标准的美音）
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
    const audio = new Audio(audioUrl);
    audio.play();
  }
}
```

---

## 📊 词库统计

### 当前包含

- ✅ CET4（四级）: ~1500 词
- ✅ CET6（六级）: ~1500 词  
- ✅ 音标标注: 100%
- ✅ 中文释义: 100%
- ✅ 例句: 每词 1-2 个
- ✅ 发音: Google TTS

### 词汇分布

```
CET4 (四级) - 基础词汇 (1500词)
├── 日常用语 (300)
├── 学术用语 (400)
├── 商务用语 (300)
└── 其他 (500)

CET6 (六级) - 进阶词汇 (1500词)
├── 学术专业 (500)
├── 新闻用语 (300)
├── 文化词汇 (300)
└── 其他 (400)
```

---

## 🔧 高级配置

### 自定义音标格式

编辑 `server/src/models/word.model.ts`:

```typescript
pronunciation: {
  ipa: String,        // 国际音标
  ame: String,        // 美式发音
  bre: String,        // 英式发音
  audio_us: String,   // 美音文件
  audio_uk: String    // 英音文件
}
```

### 数据库优化

```bash
# 创建索引加速查询
db.words.createIndex({ "word": 1 })
db.words.createIndex({ "categories": 1 })
db.words.createIndex({ "difficulty": 1 })
```

---

## 📚 推荐词汇来源

### 免费开源

1. **ECDICT** (推荐 ⭐⭐⭐⭐⭐)
   - 最完整的中英对照词库
   - 包含 300K+ 词汇
   - 格式: CSV
   
2. **Oxford 3000**
   - 牛津最常用 3000 词
   - 分级标注
   - 官网: oxfordlearnersdictionaries.com

3. **Cambridge English Vocabulary**
   - 剑桥英语词汇表
   - 按等级分类 (A1-C2)

### 付费但优质

1. **Oxford Dictionary API**
2. **Merriam-Webster Premium**
3. **Collins Dictionary**

---

## ✅ 下一步

- [ ] 导入完整 3000 词汇
- [ ] 配置 Google TTS
- [ ] 添加发音文件（可选）
- [ ] 实现词汇搜索功能
- [ ] 添加词汇分级练习

---

更新日期: 2026-04-26
