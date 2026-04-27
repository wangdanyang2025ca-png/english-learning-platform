#!/bin/bash
cd client

# 创建 .vercelignore
cat > .vercelignore << 'IGNORE'
node_modules
.git
.env.local
.env
build
IGNORE

# 创建 .env.local
cat > .env.local << 'ENV'
REACT_APP_API_URL=https://english-learning-backend-w72c.onrender.com/api
ENV

echo "✅ 配置文件已准备"
echo "现在需要你在浏览器中访问 https://vercel.com/new 来完成部署"
echo "或者在终端中运行: vercel --prod"
