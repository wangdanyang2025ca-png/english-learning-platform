import React, { useState, useEffect } from 'react';
import { WordCard } from '../components/WordCard';

interface Word {
  _id: string;
  word: string;
  pronunciation: { ipa: string };
  meanings: Array<{
    partOfSpeech: string;
    definition_cn: string;
    examples: Array<{ sentence: string }>;
  }>;
  difficulty: number;
  categories: string[];
}

// 转换后端数据格式为前端期望的格式
function transformWord(rawWord: any): Word {
  const examples = Array.isArray(rawWord.examples) ? rawWord.examples : [];
  const examplesArray = examples.map((ex: any) => ({
    sentence: typeof ex === 'string' ? ex : (ex?.sentence || '')
  }));

  return {
    _id: rawWord._id || rawWord.word || 'unknown',
    word: rawWord.word || '',
    pronunciation: {
      ipa: rawWord.pronunciation?.ipa || rawWord.ipa || `/${rawWord.word?.charAt(0) || 'a'}/`
    },
    meanings: [{
      partOfSpeech: rawWord.pos || 'n',
      definition_cn: rawWord.definition_cn || '未知',
      examples: examplesArray.length > 0 ? examplesArray : [{ sentence: '示例句子' }]
    }],
    difficulty: rawWord.difficulty || 1,
    categories: rawWord.categories || ['CET4']
  };
}

export const LearnPage: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('CET4');
  const [learned, setLearned] = useState(0);
  const [skipped, setSkipped] = useState(0);

  useEffect(() => {
    fetchWords();
  }, [category]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.REACT_APP_API_URL}/words?category=${category}`;
      console.log('📡 正在加载词汇:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('✅ API 响应:', data);

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // 转换数据格式
        const transformedWords = data.data.map((w: any) => transformWord(w));
        console.log('🔄 转换后的词汇数:', transformedWords.length);
        console.log('📝 第一个词汇:', transformedWords[0]);

        setWords(transformedWords);
        setCurrentIndex(0);
        setLearned(0);
        setSkipped(0);
      } else {
        console.warn('⚠️ API 返回的数据格式不正确:', data);
        setError(`未找到${category}分类的词汇`);
      }
    } catch (err: any) {
      console.error('❌ 加载错误:', err);
      setError(`网络错误: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('🎉 本轮学习完成！');
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>⏳ 加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        background: '#ffe0e0',
        borderRadius: '8px',
        color: '#c92a2a'
      }}>
        {error}
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>暂无单词数据</p>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* 头部 */}
      <div style={{
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>📚 单词学习</h1>
          <p style={{ color: '#666' }}>
            点击卡片翻转，看看你认不认识这个单词
          </p>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '6px',
            border: '2px solid #667eea',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          <option value="CET4">四级</option>
          <option value="CET6">六级</option>
          <option value="IELTS">雅思</option>
          <option value="TOEFL">托福</option>
        </select>
      </div>

      {/* 进度条 */}
      <div style={{
        marginBottom: '30px',
        background: '#f0f0f0',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            width: `${((currentIndex + 1) / words.length) * 100}%`,
            transition: 'width 0.3s'
          }}
        />
      </div>

      {/* 统计信息 */}
      <div style={{
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        textAlign: 'center'
      }}>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
            {currentIndex + 1}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>当前</div>
        </div>
        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>
            {words.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>总数</div>
        </div>
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
            {learned}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>学会</div>
        </div>
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
            {skipped}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>跳过</div>
        </div>
      </div>

      {/* 卡片 */}
      <WordCard
        word={currentWord}
        onNext={handleNext}
      />

      {/* 底部提示 */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        💡 <strong>学习建议</strong>: 每天学习 10-20 个新单词，复习 30-50 个已学单词，效果最佳
      </div>
    </div>
  );
};
