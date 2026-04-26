import React, { useState } from 'react';

/**
 * 学习设置模态框
 * 功能：用户选择每轮学习的单词数量
 */

interface StudySettings {
  wordsPerRound: number; // 每轮单词数
  autoPlay: boolean;     // 是否自动播放
  accent: 'us' | 'uk';   // 口音选择
}

interface StudySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: StudySettings) => void;
  initialSettings?: StudySettings;
}

export const StudySettingsModal: React.FC<StudySettingsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSettings = {
    wordsPerRound: 30,
    autoPlay: true,
    accent: 'us'
  }
}) => {
  const [wordsPerRound, setWordsPerRound] = useState(initialSettings.wordsPerRound);
  const [isCustom, setIsCustom] = useState(
    ![30, 50, 100].includes(initialSettings.wordsPerRound)
  );
  const [customValue, setCustomValue] = useState(initialSettings.wordsPerRound);
  const [autoPlay, setAutoPlay] = useState(initialSettings.autoPlay);
  const [accent, setAccent] = useState<'us' | 'uk'>(initialSettings.accent);

  // 处理预设值选择
  const handlePresetSelect = (value: number) => {
    setWordsPerRound(value);
    setCustomValue(value);
    setIsCustom(false);
  };

  // 处理自定义值
  const handleCustomChange = (value: number) => {
    setCustomValue(Math.max(5, Math.min(1000, value))); // 限制在 5-1000 之间
    setWordsPerRound(value);
  };

  // 确认设置
  const handleConfirm = () => {
    onConfirm({
      wordsPerRound: isCustom ? customValue : wordsPerRound,
      autoPlay,
      accent
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* 标题 */}
        <h2 style={{ margin: '0 0 30px 0', color: '#333', fontSize: '24px' }}>
          ⚙️ 学习设置
        </h2>

        {/* 每轮单词数设置 */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '16px' }}>
            📚 每轮学习单词数
          </h3>
          <p style={{ margin: '0 0 15px 0', color: '#999', fontSize: '14px' }}>
            选择每一轮要学习的单词数量
          </p>

          {/* 预设选项 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
            {[30, 50, 100].map(value => (
              <button
                key={value}
                onClick={() => handlePresetSelect(value)}
                style={{
                  padding: '15px',
                  border: '2px solid',
                  borderColor: !isCustom && wordsPerRound === value ? '#667eea' : '#ddd',
                  background: !isCustom && wordsPerRound === value ? '#f0f3ff' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: !isCustom && wordsPerRound === value ? 'bold' : 'normal',
                  color: !isCustom && wordsPerRound === value ? '#667eea' : '#333',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  if (!isCustom || wordsPerRound !== value) {
                    e.currentTarget.style.borderColor = '#667eea';
                  }
                }}
                onMouseOut={(e) => {
                  if (isCustom || wordsPerRound !== value) {
                    e.currentTarget.style.borderColor = '#ddd';
                  }
                }}
              >
                {value} 词
              </button>
            ))}
          </div>

          {/* 自定义选项 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <input
              type="checkbox"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>
              自定义数量
            </label>
          </div>

          {/* 自定义输入框 */}
          {isCustom && (
            <div style={{ marginBottom: '15px' }}>
              <input
                type="number"
                min="5"
                max="1000"
                value={customValue}
                onChange={(e) => handleCustomChange(parseInt(e.target.value) || 5)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                输入范围：5-1000（推荐：30、50、100）
              </p>
            </div>
          )}
        </div>

        {/* 自动播放设置 */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '16px' }}>
            🔊 自动播放
          </h3>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>
              进入新单词时自动播放发音
            </span>
          </label>
        </div>

        {/* 口音选择 */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '16px' }}>
            🎯 默认口音
          </h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setAccent('us')}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid',
                borderColor: accent === 'us' ? '#667eea' : '#ddd',
                background: accent === 'us' ? '#f0f3ff' : 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: accent === 'us' ? '#667eea' : '#333',
                fontWeight: accent === 'us' ? 'bold' : 'normal'
              }}
            >
              🇺🇸 美式英语
            </button>
            <button
              onClick={() => setAccent('uk')}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid',
                borderColor: accent === 'uk' ? '#667eea' : '#ddd',
                background: accent === 'uk' ? '#f0f3ff' : 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: accent === 'uk' ? '#667eea' : '#333',
                fontWeight: accent === 'uk' ? 'bold' : 'normal'
              }}
            >
              🇬🇧 英式英语
            </button>
          </div>
        </div>

        {/* 按钮区域 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              border: '2px solid #ddd',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#333';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            取消
          </button>

          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            开始学习
          </button>
        </div>

        {/* 设置说明 */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: '#f0f7ff',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          💡 <strong>提示：</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>每轮词汇完全不同，确保全面学习</li>
            <li>单词数越少，每轮完成越快</li>
            <li>建议新手从 30 个开始</li>
            <li>可随时修改设置重新开始</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
