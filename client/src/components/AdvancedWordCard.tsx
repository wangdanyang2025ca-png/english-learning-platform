import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 高级单词卡片组件
 * 功能：英式/美式发音、发音速度控制、自动播放、多样化例句
 */

// 词性标签映射
const getPosLabel = (pos?: string): string => {
  const posMap: { [key: string]: string } = {
    'n': '名词',
    'v': '动词',
    'adj': '形容词',
    'adv': '副词',
    'prep': '介词',
    'conj': '连词',
    'pron': '代词',
    'int': '感叹词',
    'art': '冠词',
    'num': '数词'
  };
  return posMap[pos || ''] || pos || '';
};

// 获取格式化的定义文本 (v. 超过；n. 上方)
const getFormattedDefinition = (word: AdvancedWord): string => {
  // 如果有新格式的 definitions，使用多词性格式
  if (word.definitions && word.definitions.length > 0) {
    return word.definitions
      .map(def => {
        const posLabel = getPosLabel(def.pos);
        return posLabel ? `${posLabel}. ${def.meaning}` : def.meaning;
      })
      .join('；');
  }

  // 兼容旧格式
  if (word.definition_cn) {
    // 如果有旧格式的词性，添加到前面
    if (word.pos) {
      const posLabel = getPosLabel(word.pos);
      return posLabel ? `${posLabel}. ${word.definition_cn}` : word.definition_cn;
    }
    return word.definition_cn;
  }

  return '';
};

// 定义 - 支持多词性
interface Definition {
  pos: string;       // 词性: n, v, adj, adv, prep等
  meaning: string;   // 释义
}

interface AdvancedWord {
  word: string;
  pronunciation: {
    ipa: string;
    us: string;
    uk: string;
  };
  definition_cn?: string;           // 兼容旧格式
  definitions?: Definition[];       // 新格式：支持多词性
  definition_en?: string;
  examples: Array<{ sentence: string; sentence_cn?: string }>;
  difficulty: number;
  categories: string[];
  round: number;
  pos?: string;                     // 兼容旧格式
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
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentWordRef = useRef<string>(word.word); // 追踪当前单词

  // 语音播放函数 - 使用后端TTS服务生成真实音频
  const handleSpeak = useCallback((accent: 'us' | 'uk' = accentMode) => {
    try {
      // 检查是否还是当前单词（防止旧单词的音频继续播放）
      if (currentWordRef.current !== word.word) {
        console.log(`⚠️ 跳过过期单词的音频: ${currentWordRef.current} -> ${word.word}`);
        return;
      }

      const lang = accent === 'us' ? 'en-us' : 'en-gb';
      const voiceType = accent === 'us' ? '美音' : '英音';
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const audioUrl = `${apiUrl}/tts?word=${encodeURIComponent(word.word)}&lang=${lang}&t=${Date.now()}`;

      console.log(`🔊 播放发音: "${word.word}" (${voiceType})`);

      // 强制停止当前音频
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.currentTime = 0;
          audioRef.current.load();
        } catch (e) {
          // 忽略停止错误
        }
      }

      // 创建新的音频元素
      const audio = new Audio();
      audioRef.current = audio;
      audio.volume = 1.0;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      let isCleanedUp = false;

      const cleanup = () => {
        if (!isCleanedUp) {
          isCleanedUp = true;
          try {
            audio.pause();
            audio.src = '';
            audio.load();
          } catch (e) {
            // 忽略错误
          }
        }
      };

      const handlePlay = () => {
        console.log(`✅ 开始播放: ${word.word} (${voiceType})`);
      };

      const handleEnded = () => {
        console.log('✅ 播放完成');
        isPlayingRef.current = false;
        cleanup();
      };

      const handleError = (e: Event) => {
        const error = (e.target as HTMLAudioElement)?.error;
        console.error('❌ 音频错误:', error?.message || error?.code);
        isPlayingRef.current = false;
        cleanup();
      };

      const handleCanPlay = () => {
        console.log('📦 音频已加载，开始播放...');
      };

      // 先设置 src，然后添加事件监听器
      audio.src = audioUrl;

      audio.addEventListener('canplay', handleCanPlay, { once: true });
      audio.addEventListener('play', handlePlay, { once: true });
      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      isPlayingRef.current = true;

      // 触发加载
      audio.load();

      // 延迟100ms确保src已设置
      setTimeout(() => {
        if (currentWordRef.current === word.word && isPlayingRef.current) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('❌ 播放失败:', err.message);
              isPlayingRef.current = false;
              cleanup();
            });
          }
        }
      }, 100);
    } catch (error) {
      console.error('❌ 异常:', error);
      isPlayingRef.current = false;
    }
  }, [word.word, accentMode]);

  // 每次新单词出现时自动播放发音
  useEffect(() => {
    console.log('📋 新单词出现:', word.word);

    // 更新当前单词引用
    currentWordRef.current = word.word;

    // 停止旧音频
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
      } catch (e) {
        // 忽略错误
      }
    }

    isPlayingRef.current = false;

    let isMounted = true;
    let timer: NodeJS.Timeout;

    const playAudio = () => {
      if (isMounted && !isPlayingRef.current && currentWordRef.current === word.word) {
        handleSpeak(accentMode);
      }
    };

    // 延迟500ms后自动播放
    timer = setTimeout(playAudio, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [word.word, accentMode, handleSpeak]);

  return (
    <div style={{ perspective: '1000px', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
      {/* 卡片容器（3D 翻转效果）*/}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          cursor: 'pointer',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          marginBottom: '30px'
        }}
      >
        {/* 正面：单词和发音 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '380px',
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

          {/* 单词和播放按钮容器 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '12px', position: 'relative' }}>
            {/* 单词 */}
            <h2 style={{ fontSize: '56px', margin: 0, fontWeight: 'bold' }}>
              {word.word}
            </h2>

            {/* 小播放按钮 - 在单词右下角 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(accentMode);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid white',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                marginBottom: '2px',
                padding: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.transform = 'scale(1.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🔊
            </button>
          </div>

          {/* 中文释义 + 词性 (格式: v. 超过；n. 上方) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.95)', fontWeight: '500', lineHeight: '1.6' }}>
              {getFormattedDefinition(word)}
            </div>
          </div>

          {/* 英文定义 */}
          <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
            {word.definition_en}
          </div>

          {/* IPA 音标 */}
          <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px', color: 'rgba(255,255,255,0.8)' }}>
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
            height: '380px',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transform: 'rotateY(180deg)',
            WebkitBackfaceVisibility: 'hidden',
            overflowY: 'auto'
          } as React.CSSProperties}
        >
          {/* 英文单词和中文注释 */}
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {word.word}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}>
              {getFormattedDefinition(word)}
            </div>
          </div>

          {/* 分割线 */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.3)', margin: '15px 0' }} />

          {/* 英文定义 */}
          {word.definition_en && (
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '10px', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', lineHeight: '1.5' }}>
              📖 {word.definition_en}
            </div>
          )}

          {/* 例句显示 */}
          <div style={{ fontSize: '12px', opacity: 0.95, lineHeight: '1.6', marginBottom: '10px', flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>📝 例句：</div>
            {word.examples.slice(0, 2).map((example, idx) => (
              <div key={idx} style={{ marginBottom: '10px', paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.5)' }}>
                <div style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '3px', fontSize: '11px' }}>
                  {idx + 1}. {example.sentence}
                </div>
                {example.sentence_cn && (
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontStyle: 'italic' }}>
                    {example.sentence_cn}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 学习提示 */}
          <div style={{ fontSize: '11px', opacity: 0.8, fontStyle: 'italic', marginTop: 'auto' }}>
            💡 点击卡片返回正面
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => {
            setFlipped(true);
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
            handleSpeak('uk');
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
