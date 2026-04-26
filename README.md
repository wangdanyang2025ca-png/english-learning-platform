# 英语学习平台

一个综合的英语学习网页应用，包含单词学习（百词斩风格）和英语视频库（YouTube风格）。

## 快速开始

### 前置条件
- Node.js 18+ 和 npm
- MongoDB（本地或云服务）

### 安装步骤

```bash
# 1. 克隆或进入项目目录
cd ~/projects/english-learning-platform

# 2. 安装后端依赖
cd server
npm install

# 3. 创建 .env 文件
cp .env.example .env
# 编辑 .env，配置 MongoDB 和其他环境变量

# 4. 启动后端服务器
npm run dev

# 5. 在另一个终端，进入前端目录
cd ../client
npm install

# 6. 启动前端开发服务器
npm start
```

访问 `http://localhost:3000` 即可使用应用。

## 项目结构

```
english-learning-platform/
├── server/                 # 后端项目
│   ├── src/
│   │   ├── models/         # 数据库模型
│   │   ├── routes/         # API 路由
│   │   ├── controllers/    # 业务逻辑
│   │   ├── middleware/     # 中间件（认证等）
│   │   ├── services/       # 业务服务
│   │   └── app.ts          # Express 应用
│   ├── .env.example        # 环境变量示例
│   └── package.json
│
├── client/                 # 前端项目（React）
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── hooks/          # 自定义 Hook
│   │   ├── services/       # API 调用
│   │   ├── types/          # TypeScript 类型
│   │   ├── App.tsx         # 主应用组件
│   │   └── index.tsx       # 入口文件
│   └── package.json
│
├── PROJECT_PLAN.md         # 详细项目规划
└── README.md               # 本文件
```

## 核心功能

### Phase 1: 单词学习（优先）
- 📚 单词库：4级、6级、雅思、托福等
- 🎴 卡片学习模式
- 🔊 发音功能
- 📊 学习统计和进度追踪
- ⏮️ SRS 复习系统

### Phase 2: 视频库
- 🎥 精选英语视频
- 🏷️ 视频分类：教育、科技、体育等
- 📝 学习笔记和字幕
- ❤️ 收藏功能

## 开发指南

### 后端开发

```bash
cd server
npm install           # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 编译 TypeScript
npm test             # 运行测试
```

### 前端开发

```bash
cd client
npm install          # 安装依赖
npm start            # 启动开发服务器
npm run build        # 生产构建
```

## API 文档

详见 `server/API.md`（待补充）

## 数据源

### 单词数据
- [ ] ECDICT 词库（开源）
- [ ] 手工编写的例句和图片

### 视频数据
- [ ] YouTube API（需要 API Key）
- [ ] 精选频道列表

### 发音
- [ ] Web Speech API（浏览器内置）
- [ ] Google TTS API（可选，付费）

## 常见问题

**Q: 如何配置 MongoDB？**
A: 在 `.env` 中配置 `MONGODB_URI`，可以使用本地 MongoDB 或 MongoDB Atlas 云服务。

**Q: 如何获得 YouTube API Key？**
A: 访问 [Google Cloud Console](https://console.cloud.google.com)，创建项目并启用 YouTube Data API。

**Q: 如何修改学习卡片？**
A: 前端组件位于 `client/src/components/WordCard.tsx`。

## 贡献指南

欢迎提交 PR！请确保：
- 遵循现有代码风格
- 添加相关的测试
- 更新文档

## 许可证

MIT

## 联系方式

有问题？提交 Issue 或直接联系开发者。

---

**最后更新**: 2026-04-26
