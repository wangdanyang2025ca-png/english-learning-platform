import React, { useState, useEffect } from 'react';
import { AdvancedWordCard } from '../components/AdvancedWordCard';
import { StudySettingsModal } from '../components/StudySettingsModal';

/**
 * 高级学习页面
 * 功能：多轮学习、进度追踪、发音控制、参考主流背单词应用
 */

interface Word {
  word: string;
  pronunciation: { ipa: string; us: string; uk: string };
  definition_cn: string;
  examples: Array<{ sentence: string }>;
  difficulty: number;
  categories: string[];
  round: number;
}

interface StudyProgress {
  totalWords: number;           // 总词汇数
  learnedToday: number;        // 今日学习数
  totalLearned: number;        // 总学习数
  masteredWords: number;       // 已掌握数
  reviewNeeded: number;        // 需要复习数
  currentStreak: number;       // 连续学习天数
  accuracy: number;            // 准确率
}

interface StudySettings {
  wordsPerRound: number;
  autoPlay: boolean;
  accent: 'us' | 'uk';
}

export const AdvancedLearnPage: React.FC = () => {
  // 状态管理
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 学习设置
  const [showSettings, setShowSettings] = useState(true);           // 初始显示设置模态框
  const [wordsPerRound, setWordsPerRound] = useState(30);          // 每轮单词数

  // 学习控制
  const [speechRate, setSpeechRate] = useState(0.85);           // 发音速度
  const [autoPlayAccent, setAutoPlayAccent] = useState<'us' | 'uk'>('us'); // 自动播放口音
  const [studyProgress, setStudyProgress] = useState<StudyProgress>({
    totalWords: 3000,
    learnedToday: 0,
    totalLearned: 0,
    masteredWords: 0,
    reviewNeeded: 0,
    currentStreak: 1,
    accuracy: 0
  });

  // 已学习的单词集合（用于防止重复）
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

  // 加载词汇数据
  useEffect(() => {
    // 只在设置完成后才加载词汇
    if (!showSettings) {
      fetchWords();
    }
  }, [currentRound, showSettings, wordsPerRound]);

  // 处理设置确认
  const handleSettingsConfirm = (settings: StudySettings) => {
    setWordsPerRound(settings.wordsPerRound);
    setAutoPlayAccent(settings.accent);
    setShowSettings(false);
  };

  // 获取词汇数据
  const fetchWords = async () => {
    try {
      setLoading(true);
      // 计算每轮的分页偏移（用来获取不同的词汇）
      const offset = (currentRound - 1) * wordsPerRound;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/words?limit=${wordsPerRound}&page=${currentRound}`
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const transformedWords = data.data.map((w: any) => ({
          word: w.word,
          pronunciation: {
            ipa: w.pronunciation?.ipa || w.ipa || '',
            us: w.pronunciation?.us || w.ipa || '',
            uk: w.pronunciation?.uk || w.ipa || ''
          },
          definition_cn: w.definition_cn || '',
          examples: (Array.isArray(w.examples) ? w.examples : []).slice(0, 3),
          difficulty: w.difficulty || 1,
          categories: w.categories || [],
          round: currentRound
        }));

        setWords(transformedWords);
        setCurrentIndex(0);
        setError(null);
      } else {
        setError('无法加载词汇');
      }
    } catch (err) {
      setError('加载失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理下一个单词
  const handleNext = (isLearned: boolean = true) => {
    // 更新进度
    if (isLearned && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      // 记录已学习的单词
      setLearnedWords(prev => new Set(prev).add(currentWord.word));

      setStudyProgress(prev => ({
        ...prev,
        learnedToday: prev.learnedToday + 1,
        totalLearned: prev.totalLearned + 1,
        masteredWords: Math.floor((prev.totalLearned + 1) / 10)
      }));
    }

    // 移动到下一个单词
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 本轮完成，进入下一轮
      // 计算总共需要学习的轮数（3000 / 用户选择的每轮词数）
      const totalRounds = Math.ceil(3000 / wordsPerRound);

      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1);
      } else {
        // 全部完成
        alert(`🎉 恭喜！你已经完成了全部3000个单词的学习！共${totalRounds}轮，继续加油！`);
      }
    }
  };

  // 加载状态
  if (loading && !showSettings) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>⏳ 加载词汇中...</p>
      </div>
    );
  }

  // 错误状态
  if (error && !showSettings) {
    return (
      <div style={{
        padding: '40px',
        background: '#ffe0e0',
        borderRadius: '8px',
        color: '#c92a2a',
        textAlign: 'center'
      }}>
        ❌ {error}
      </div>
    );
  }

  // 无数据状态
  if (words.length === 0 && !showSettings) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>暂无词汇数据</p>
      </div>
    );
  }

  // 显示设置模态框
  if (showSettings) {
    return (
      <StudySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfirm={handleSettingsConfirm}
        initialSettings={{
          wordsPerRound: 30,
          autoPlay: true,
          accent: 'us'
        }}
      />
    );
  }

  const currentWord = words[currentIndex];
  const progressPercentage = ((currentIndex + 1) / words.length) * 100;
  const globalProgress = ((studyProgress.totalLearned) / studyProgress.totalWords) * 100;
  const totalRounds = Math.ceil(3000 / wordsPerRound);

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingBottom: '40px' }}>
      {/* 顶部进度条 */}
      <div style={{
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h1 style={{ margin: 0 }}>📚 英语学习平台</h1>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                第 {currentRound} / {totalRounds} 轮 • 第 {currentIndex + 1} / {words.length} 词
              </div>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                ⚙️ 修改设置
              </button>
            </div>
          </div>

          {/* 本轮进度条 */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              height: '100%',
              background: 'white',
              width: `${progressPercentage}%`,
              transition: 'width 0.3s'
            }} />
          </div>

          {/* 总体进度 */}
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            总体进度：{Math.round(globalProgress)}% (已学 {studyProgress.totalLearned} / 3000)
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          {/* 左侧：单词卡片 */}
          <div style={{ flex: 1, minWidth: '400px' }}>
            <AdvancedWordCard
              word={currentWord}
              onNext={() => handleNext(true)}
              autoPlayAccent={autoPlayAccent}
              speechRate={speechRate}
            />
          </div>

          {/* 右侧：学习面板 */}
          <div style={{ width: '280px' }}>
            {/* 控制面板 */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⚙️ 设置</h3>

              {/* 发音速度控制 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                  🔊 发音速度
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  当前: {speechRate.toFixed(1)}x
                </div>
              </div>

              {/* 口音选择 */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                  🎯 自动播放口音
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setAutoPlayAccent('us')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: autoPlayAccent === 'us' ? '#667eea' : '#f0f0f0',
                      color: autoPlayAccent === 'us' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    🇺🇸 美音
                  </button>
                  <button
                    onClick={() => setAutoPlayAccent('uk')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: autoPlayAccent === 'uk' ? '#667eea' : '#f0f0f0',
                      color: autoPlayAccent === 'uk' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    🇬🇧 英音
                  </button>
                </div>
              </div>
            </div>

            {/* 学习统计 */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 今日统计</h3>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>今日学习</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                    {studyProgress.learnedToday}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>已掌握</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#51cf66' }}>
                    {studyProgress.masteredWords}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>连续学习</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff922b' }}>
                    {studyProgress.currentStreak} 天 🔥
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f0f7ff',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                💡 <strong>学习建议：</strong>
                <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                  <li>每天学习 20-30 个新词汇</li>
                  <li>复习之前学过的词汇</li>
                  <li>连续学习可获得成就</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 设置模态框（在学习过程中修改设置） */}
      <StudySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfirm={handleSettingsConfirm}
        initialSettings={{
          wordsPerRound,
          autoPlay: autoPlayAccent === 'us',
          accent: autoPlayAccent
        }}
      />
    </div>
  );
};
