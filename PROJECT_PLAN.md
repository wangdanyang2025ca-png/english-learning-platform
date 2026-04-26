# 英语学习平台 - 项目规划文档

## 项目概述
一个综合英语学习平台，包含单词学习、视频库等功能，对标百词斩和YouTube。

## 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: MongoDB（单词和用户数据）
- **发音**: Web Speech API / 第三方TTS服务
- **视频源**: YouTube API / 自建爬虫

---

## Phase 1: 单词学习模块（第一阶段）

### 1.1 功能需求

#### 单词库功能
- ✅ 单词分类：四级、六级、雅思、托福、专业词汇等
- ✅ 单词详情页：
  - 单词 + 音标（IPA）
  - 中文释义
  - 例句（1-3个）
  - 发音按钮（纯英文）
  - 词根词缀信息（可选）
  - 助记图片/记忆方法

#### 学习模式
1. **卡片模式**（百词斩风格）
   - 显示单词，点击查看释义
   - 滑左/滑右：不认识/认识
   - 记录学习进度
   
2. **闪卡模式**
   - 快速浏览单词
   - 适合复习
   
3. **测试模式**
   - 选择题：选正确释义
   - 填空题：根据定义填单词
   - 听力题：根据发音选择单词

4. **进度追踪**
   - 每日学习目标
   - 学习统计
   - 复习提醒

#### 用户功能
- 账户注册/登录
- 学习记录保存
- 个人词本管理
- 学习数据统计

### 1.2 数据模型

```
用户 (User)
├── id
├── username
├── email
├── password (hashed)
├── createdAt
└── preferences

单词 (Word)
├── id
├── word: string
├── pronunciation: string (IPA)
├── meanings: [{pos, definition, examples}]
├── audio_url: string
├── category: enum [CET4, CET6, IELTS, TOEFL, ...]
├── difficulty: 1-5
├── image_url: string
├── etymology: string (可选)
└── createdAt

学习记录 (StudyLog)
├── id
├── userId
├── wordId
├── status: enum [learned, reviewing, forgotten]
├── reviewCount: number
├── lastReviewDate
└── createdAt

词本 (Wordlist)
├── id
├── userId
├── name: string
├── words: [wordId]
├── isPublic: boolean
└── createdAt
```

### 1.3 API 端点设计

```
认证相关
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

单词相关
GET    /api/words?category=CET4&page=1
GET    /api/words/:id
GET    /api/words/search?keyword=hello
GET    /api/categories

学习记录
POST   /api/study-logs
GET    /api/study-logs/stats
PUT    /api/study-logs/:id

词本管理
GET    /api/wordlists
POST   /api/wordlists
PUT    /api/wordlists/:id
DELETE /api/wordlists/:id
```

### 1.4 前端页面设计

```
/                          首页
├── /learn                 学习页面
│   ├── 选择分类
│   └── 学习卡片
├── /review                复习页面
├── /stats                 统计页面
├── /wordlists             词本管理
├── /settings              设置
└── /auth                  
    ├── /login             登录
    └── /register          注册
```

---

## Phase 2: 视频库模块（第二阶段）

### 2.1 功能需求

#### 视频分类
- 教育类：英语教学频道、语法讲解、发音训练
- 科技类：科技新闻、产品评测、编程教程
- 体育类：体育评论、赛事解说
- 娱乐类：Vlog、博客、脱口秀
- 新闻类：新闻播报

#### 视频功能
- 视频列表展示（卡片/网格）
- 视频播放（支持字幕）
- 评论和评分
- 添加到收藏
- 学习笔记功能

#### 内容质量控制
- 内容审核机制
- 视频质量评分
- 黑名单机制

### 2.2 数据模型

```
视频 (Video)
├── id
├── title: string
├── description: string
├── youtubeId: string
├── category: enum [Education, Tech, Sports, Entertainment, News]
├── difficulty: 1-5 (英文难度)
├── duration: number (秒)
├── uploadDate: Date
├── views: number
├── rating: number (1-5)
├── subtitles: {
│   ├── zh_CN: URL
│   └── en_US: URL
├── tags: [string]
└── createdAt

用户收藏 (VideoFavorite)
├── id
├── userId
├── videoId
└── createdAt

用户笔记 (StudyNote)
├── id
├── userId
├── videoId
├── timestamp: number (秒)
├── content: string
└── createdAt
```

---

## 数据来源

### 单词数据
- **公开API选项**：
  - Oxford Dictionary API（官方，需付费）
  - 免费在线词库：Word API、Merriam-Webster
  - 本地数据集：可导入现有的四六级词库
  
- **初期方案**：
  1. 使用开源词库（如 ECDICT）
  2. 补充爬虫获取例句
  3. 集成TTS服务获取发音

### 视频数据
- **初期方案**：
  1. YouTube API 搜索和元数据
  2. 手动精选和分类高质量频道
  3. 定期爬虫更新视频列表

### 发音资源
- **Web Speech API**（浏览器原生，有限制）
- **Google TTS API**（付费，质量高）
- **Forvo API**（众包发音库）

---

## 开发时间线

### Week 1-2: 项目初始化 + 后端基础
- [ ] 项目结构搭建
- [ ] 数据库连接
- [ ] User 认证系统
- [ ] Word 数据模型和API

### Week 3-4: 前端 + 学习模式
- [ ] React 项目设置
- [ ] 用户认证UI
- [ ] 卡片学习模式
- [ ] 单词详情页

### Week 5-6: 学习记录 + 统计
- [ ] 学习日志系统
- [ ] 统计仪表板
- [ ] 复习算法（SRS）

### Week 7-8: 视频库开发
- [ ] 视频模型设计
- [ ] YouTube API 集成
- [ ] 视频列表和播放页面

---

## 关键决策点

1. **数据库选择**：MongoDB（灵活）vs PostgreSQL（可靠）
   - 建议：初期用 MongoDB，后期可迁移

2. **认证方式**：JWT vs Session
   - 建议：JWT（便于扩展）

3. **发音方案**：Web Speech API vs TTS 服务
   - 建议：先用 Web Speech API，后期集成付费服务

4. **视频内容审核**：AI 审核 vs 人工审核
   - 建议：初期人工精选 + 社区举报

5. **部署方案**：自建服务器 vs 云服务（AWS/Vercel/Render）
   - 建议：Vercel（前端）+ Render（后端）用于快速启动

---

## 成功指标

- [ ] Phase 1：1000+ 个单词，5+ 个分类
- [ ] 单日活跃用户（DAU）> 100
- [ ] 平均学习时长 > 15 分钟
- [ ] Phase 2：500+ 精选视频
- [ ] 用户留存率 > 30%（7日）

---

## 下一步

1. **安装 Node.js**（v18+）
2. **初始化项目**（运行初始化脚本）
3. **搭建后端项目**
4. **连接数据库**
5. **实现用户认证**

