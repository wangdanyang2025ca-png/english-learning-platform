# 快速开始指南

## ✅ 已完成

- [x] 项目文件夹创建：`~/projects/english-learning-platform`
- [x] 详细规划文档：`PROJECT_PLAN.md`
- [x] 开发指南：`DEVELOPMENT_GUIDE.md`
- [x] 数据模型定义：`server/src/models/schemas.ts`
- [x] 项目初始化脚本：`init-project.sh`

## 📋 后续步骤

### 1️⃣ 安装 Node.js（必须）

如果还没有安装 Node.js，请访问：https://nodejs.org/

**推荐版本**: Node.js 18 LTS 或更新版本

验证安装：
```bash
node --version  # 应该显示 v18.x 或更高
npm --version   # 应该显示 8.x 或更高
```

### 2️⃣ 初始化项目结构

```bash
cd ~/projects/english-learning-platform
bash init-project.sh
```

这会创建所有必要的文件夹和配置文件。

### 3️⃣ 安装后端依赖

```bash
cd ~/projects/english-learning-platform/server
npm install
```

预期输出：
```
added XXX packages in X.XXs
```

### 4️⃣ 配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑 .env 文件
nano .env
```

修改以下内容：
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/english-learning-platform
JWT_SECRET=your_secret_key_12345_change_this
NODE_ENV=development
```

### 5️⃣ 启动后端服务器

```bash
npm run dev
```

预期输出：
```
[INFO] Starting server on port 5000...
[INFO] MongoDB connected successfully!
```

### 6️⃣ 在另一个终端，初始化前端

```bash
# 打开新终端
cd ~/projects/english-learning-platform
npx create-react-app client --template typescript
```

这需要几分钟。

### 7️⃣ 启动前端开发服务器

```bash
cd client
npm start
```

预期输出：
```
webpack compiled with X warnings
  Local:        http://localhost:3000
```

### 8️⃣ 访问应用

打开浏览器访问：`http://localhost:3000`

---

## 🔌 数据库设置（可选，初期可用内存数据）

### 选项 A: 本地 MongoDB（推荐）

```bash
# macOS（使用 Homebrew）
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Linux（Ubuntu/Debian）
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# 下载 MongoDB 安装程序: https://www.mongodb.com/try/download/community
```

### 选项 B: MongoDB Atlas（云服务，推荐新手）

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册免费账户
3. 创建集群（免费层）
4. 获得连接字符串
5. 在 `.env` 中替换 `MONGODB_URI`

---

## 📚 推荐学习路径

### 第一周：后端基础
1. 完成用户认证系统
2. 实现单词 CRUD API
3. 添加学习记录功能

### 第二周：前端页面
1. 搭建页面布局
2. 实现卡片学习模式
3. 连接后端 API

### 第三周：优化和功能扩展
1. 添加音标和发音
2. 实现进度追踪
3. 优化 UI/UX

---

## 🆘 常见问题排查

### 问题 1: npm install 失败

**症状**: `npm ERR! code ERESOLVE`

**解决**:
```bash
npm install --legacy-peer-deps
```

### 问题 2: MongoDB 连接失败

**症状**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**解决**:
```bash
# 确认 MongoDB 服务已启动
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# 如果没启动，启动它
brew services start mongodb-community@7.0
```

### 问题 3: 端口已被占用

**症状**: `Error: listen EADDRINUSE :::5000`

**解决**:
```bash
# 更改端口（在 .env 中）
PORT=5001
```

### 问题 4: CORS 错误

**症状**: `Cross-Origin Request Blocked`

**解决**: 确保后端 CORS 配置正确（已在代码中完成）

---

## 📖 重要文档位置

| 文档 | 描述 |
|------|------|
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | 完整的项目规划和功能设计 |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | 代码规范和开发流程 |
| [README.md](README.md) | 项目概览 |
| [server/src/models/schemas.ts](server/src/models/schemas.ts) | 数据类型定义 |

---

## 💡 开发小贴士

### 后端开发
- 使用 Postman 或 Insomnia 测试 API
- 查看 server.log 诊断问题
- 经常提交代码（每个小功能）

### 前端开发
- 使用 React DevTools 浏览器扩展
- 查看浏览器控制台找出 JavaScript 错误
- 使用 `console.log()` 调试

### 全栈开发
- 前后端分别启动，互不阻塞
- 定期查看网络标签看请求/响应
- 保持 .env 配置一致

---

## 🎯 下一个里程碑

完成以下任务后，项目会有初步可用：

- [ ] 后端 API 完全可用（用户、单词、学习记录）
- [ ] 前端可以加载并显示单词列表
- [ ] 用户可以进行基本的卡片学习
- [ ] 学习进度被正确记录

**预计时间**: 2-3 周（每天 2-3 小时）

---

## 需要帮助？

1. 检查文档：先看 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
2. 查看源代码：`server/src/` 和 `client/src/` 都有示例代码
3. 调试错误：检查浏览器控制台和服务器日志

---

**祝你编码愉快！🚀**

最后更新：2026-04-26
