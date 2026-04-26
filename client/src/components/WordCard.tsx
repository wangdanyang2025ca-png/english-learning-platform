import React, { useState } from 'react';

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

interface WordCardProps {
  word: Word;
  onNext: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onNext }) => {
  const [flipped, setFlipped] = useState(false);

  const handleSpeak = () => {
    // 方案 1: Web Speech API（浏览器原生）
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // 停止之前的播放
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.95; // 稍微慢一点，便于理解
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
      return;
    }

    // 方案 2: Google TTS（备选，更标准的发音）
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word.word)}&tl=en&client=tw-ob`;
    const audio = new Audio(googleTtsUrl);
    audio.play().catch(err => {
      console.log('播放失败，使用浏览器 TTS');
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    });
  };

  return (
    <div style={{
      perspective: '1000px',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* 卡片容器 */}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '300px',
          cursor: 'pointer',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 正面 - 单词 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          minHeight: '300px',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '40px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>
            点击翻转查看释义
          </div>
          <h2 style={{ fontSize: '48px', margin: '20px 0', fontWeight: 'bold' }}>
            {word.word}
          </h2>
          <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '20px' }}>
            {word.pronunciation.ipa}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            🔊 发音
          </button>
        </div>

        {/* 反面 - 释义 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          minHeight: '300px',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '12px',
          padding: '40px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          transform: 'rotateY(180deg)'
        }}>
          {word.meanings.map((meaning, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                {meaning.partOfSpeech}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                {meaning.definition_cn}
              </div>
              {meaning.examples.length > 0 && (
                <div style={{ fontSize: '14px', opacity: 0.85, fontStyle: 'italic' }}>
                  例: {meaning.examples[0].sentence}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            setFlipped(false);
            onNext();
          }}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
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
            padding: '12px 20px',
            background: '#51cf66',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
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

      {/* 难度指示器 */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        难度: {'⭐'.repeat(word.difficulty)}
      </div>
    </div>
  );
};
