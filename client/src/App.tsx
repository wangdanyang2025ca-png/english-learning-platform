import React from 'react';
import './App.css';
import { AdvancedLearnPage } from './pages/AdvancedLearnPage';

/**
 * 英语学习平台主应用
 * 参考：墨墨背单词、背duo单词、百词斩等主流应用
 * 功能：多轮学习、进度追踪、发音速度控制、英美音切换、自动播放
 */

function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AdvancedLearnPage />
    </div>
  );
}

export default App;
