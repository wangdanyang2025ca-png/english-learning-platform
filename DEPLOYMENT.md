# 🚀 部署指南

本项目已配置为在 **Vercel** (前端) 和 **Render** (后端) 上一键部署。

## 📱 快速部署步骤

### 步骤 1：部署后端到 Render（2分钟）

1. 打开 https://dashboard.render.com/new/web
2. 点击 **"Connect Repository"**
3. 选择 GitHub 账户授权（如果需要）
4. 搜索并选择 `wangdanyang2025ca-png/english-learning-platform`
5. 填写配置：
   - **Name**: `english-learning-backend`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. 向下滚动到 **Environment**，确认这些环境变量：
   ```
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://english-learning-frontend.vercel.app
   ```
7. 点击 **"Create Web Service"**

✅ **等待部署完成**（约2-3分钟）
📝 **复制你的后端 URL**，格式如：`https://english-learning-backend.onrender.com`

---

### 步骤 2：部署前端到 Vercel（2分钟）

1. 打开 https://vercel.com/new
2. 点击 **"Continue with GitHub"**（或登录你的 GitHub）
3. 搜索并导入 `english-learning-platform` 仓库
4. 配置项目：
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
5. 在 **Environment Variables** 中添加：
   ```
   REACT_APP_API_URL=https://你的后端URL/api
   ```
   （替换为从 Render 获得的实际 URL）
6. 点击 **"Deploy"**

✅ **等待部署完成**（约3-5分钟）
🎉 **你的应用上线了！**

---

## 🔗 获取你的应用 URL

部署完成后：
- 🎨 **前端**：Vercel 会自动分配一个 URL（如 `https://english-learning-platform.vercel.app`）
- 🔧 **后端**：Render 会自动分配一个 URL（如 `https://english-learning-backend.onrender.com`）

在浏览器中打开前端 URL，享受你的英语学习应用！

---

## 📋 检查清单

- ✅ GitHub 仓库已创建：`wangdanyang2025ca-png/english-learning-platform`
- ✅ 配置文件已生成：`vercel.json`、`render.yaml`
- ✅ 环境变量已配置
- ✅ 后端已部署到 Render
- ✅ 前端已部署到 Vercel

---

## 🔄 更新应用

更新很简单：
1. 推送代码到 GitHub 的 `main` 分支
2. Vercel 和 Render 会自动部署最新代码

```bash
git add .
git commit -m "Update features"
git push origin main
```

---

## ❓ 常见问题

**Q: 前端无法连接后端？**
A: 确保前端的 `REACT_APP_API_URL` 环境变量正确指向后端 URL

**Q: 后端无法访问？**
A: 检查 Render 控制台的日志，确保没有启动错误

**Q: 如何查看日志？**
A: 登录 Vercel/Render 控制台，进入项目的 "Deployments" 或 "Logs" 标签

---

**更新时间**: 2026-04-26  
**部署平台**: Vercel (前端) + Render (后端)
