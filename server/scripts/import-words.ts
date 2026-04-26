import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const wordSchema = new mongoose.Schema({
  word: { type: String, unique: true },
  pronunciation: { ipa: String },
  meanings: [{
    partOfSpeech: String,
    definition_cn: String,
    examples: [{ sentence: String }]
  }],
  categories: [String],
  difficulty: Number,
  audioUrl: String
});

const Word = mongoose.model('Word', wordSchema);

async function importWords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning');
    console.log('✅ MongoDB 已连接');

    const data = JSON.parse(fs.readFileSync('./src/data/words.json', 'utf-8'));

    // 转换数据格式
    const words = data.map((item: any) => ({
      word: item.word,
      pronunciation: { ipa: item.ipa },
      meanings: [{
        partOfSpeech: item.pos,
        definition_cn: item.definition_cn,
        examples: item.examples.map((ex: string) => ({ sentence: ex }))
      }],
      categories: item.categories,
      difficulty: item.categories.includes('CET6') ? 3 : 1
    }));

    // 删除旧数据
    await Word.deleteMany({});

    // 导入新数据
    await Word.insertMany(words);
    console.log(`✅ 已导入 ${words.length} 个单词`);

  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importWords();
