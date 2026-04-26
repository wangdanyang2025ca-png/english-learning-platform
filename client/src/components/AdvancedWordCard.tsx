import React, { useState, useEffect } from 'react';

/**
 * 高级单词卡片组件
 * 功能：英式/美式发音、发音速度控制、自动播放、多样化例句
 */

interface AdvancedWord {
  word: string;
  pronunciation: {
    ipa: string;
    us: string;
    uk: string;
  };
  definition_cn: string;
  examples: Array<{ sentence: string }>;
  difficulty: number;
  categories: string[];
  round: number;
}

interface AdvancedWordCardProps {
  word: AdvancedWord;
  onNext: () => void;
  autoPlayAccent: 'us' | 'uk';
  speechRate: number;
}

export const AdvancedWordCard: React.FC<AdvancedWordCardProps> = ({
  word,
  onNext,
  autoPlayAccent,
  speechRate
}) => {
  const [flipped, setFlipped] = useState(false);
  const [accentMode, setAccentMode] = useState<'us' | 'uk'>(autoPlayAccent);
  const [hasPlayedAuto, setHasPlayedAuto] = useState(false);

  // 组件加载时自动播放一次发音
  useEffect(() => {
    if (!hasPlayedAuto) {
      setTimeout(() => {
        handleSpeak(accentMode);
        setHasPlayedAuto(true);
      }, 500);
    }
  }, [word.word]);

  // 语音播放函数
  const handleSpeak = (accent: 'us' | 'uk' = accentMode) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = accent === 'us' ? 'en-US' : 'en-GB';
      utterance.rate = Math.max(0.5, Math.min(2, speechRate || 1));
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthesis.speak(utterance);
      return;
    }

    // 备选：Google TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word.word)}&tl=${accent === 'us' ? 'en' : 'en'}&client=tw-ob`;
    const audio = new Audio(ttsUrl);
    audio.play().catch(() => console.log('TTS 不可用'));
  };

  return (
    <div style={{ perspective: '1000px', width: '100%', maxWidth: '450px', margin: '0 auto' }}>
      {/* 卡片容器（3D 翻转效果）*/}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '350px',
          cursor: 'pointer',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 正面：单词和发音 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            minHeight: '350px',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            WebkitBackfaceVisibility: 'hidden',
          } as React.CSSProperties}
        >
          {/* 难度指示器 */}
          <div style={{ position: 'absolute', top: 20, right: 20, fontSize: '14px' }}>
            难度: {'⭐'.repeat(Math.min(word.difficulty, 5))}
          </div>

          {/* 第几轮提示 */}
          <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '12px', opacity: 0.9 }}>
            第 {word.round} 轮
          </div>

          {/* 单词 */}
          <h2 style={{ fontSize: '56px', margin: '0 0 20px 0', fontWeight: 'bold' }}>
            {word.word}
          </h2>

          {/* IPA 音标 */}
          <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px' }}>
            {word.pronunciation.ipa}
          </div>

          {/* 发音按钮组 */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            {/* 美式发音按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAccentMode('us');
                handleSpeak('us');
              }}
              style={{
                background: accentMode === 'us' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                border: '2px solid white',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s',
                fontWeight: accentMode === 'us' ? 'bold' : 'normal'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = accentMode === 'us' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)';
              }}
            >
              🇺🇸 美音
            </button>

            {/* 英式发音按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAccentMode('uk');
                handleSpeak('uk');
              }}
              style={{
                background: accentMode === 'uk' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                border: '2px solid white',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s',
                fontWeight: accentMode === 'uk' ? 'bold' : 'normal'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = accentMode === 'uk' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)';
              }}
            >
              🇬🇧 英音
            </button>
          </div>

          {/* 点击翻转提示 */}
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '20px' }}>
            点击卡片翻转查看释义
          </div>
        </div>

        {/* 背面：释义和例句 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            minHeight: '350px',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transform: 'rotateY(180deg)',
            WebkitBackfaceVisibility: 'hidden',
          } as React.CSSProperties}
        >
          {/* 中文释义 */}
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '25px' }}>
            {word.definition_cn}
          </div>

          {/* 例句显示 */}
          <div style={{ fontSize: '14px', opacity: 0.95, lineHeight: '1.8' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>例句：</div>
            {word.examples.slice(0, 2).map((example, idx) => (
              <div key={idx} style={{ marginBottom: '12px', fontStyle: 'italic' }}>
                {idx + 1}. {example.sentence}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => {
            setFlipped(false);
            onNext();
          }}
          style={{
            flex: 1,
            padding: '16px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#ff5252';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ff6b6b';
          }}
        >
          ❌ 不认识
        </button>

        <button
          onClick={() => {
            setFlipped(false);
            onNext();
          }}
          style={{
            flex: 1,
            padding: '16px',
            background: '#51cf66',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#40c057';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#51cf66';
          }}
        >
          ✅ 认识
        </button>
      </div>
    </div>
  );
};
