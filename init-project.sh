#!/bin/bash

# 英语学习平台项目初始化脚本

echo "🚀 开始初始化英语学习平台..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装。请先安装 Node.js 18+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) 已安装"
echo "✅ npm $(npm --version) 已安装"

# 创建后端项目
echo ""
echo "📦 初始化后端项目..."
mkdir -p server/src/{models,routes,controllers,middleware,services,config}

cd server

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "english-learning-platform-server",
  "version": "0.1.0",
  "description": "英语学习平台后端服务",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "axios": "^1.4.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.17",
    "ts-node-dev": "^2.0.0"
  }
}
EOF

# 创建 tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# 创建 .env.example
cat > .env.example << 'EOF'
# 服务器配置
PORT=5000
NODE_ENV=development

# MongoDB 连接
MONGODB_URI=mongodb://localhost:27017/english-learning-platform

# JWT 密钥
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
EOF

echo "✅ 后端项目初始化完成"
cd ..

# 创建前端项目结构
echo ""
echo "📦 创建前端项目结构..."
mkdir -p client/src/{pages,components,hooks,services,types,styles}

# 返回项目根目录
cd ..

# 创建项目总的 .gitignore
cat > .gitignore << 'EOF'
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env
.env.local
.env.*.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor
.vscode/
.idea/
*.swp
*.swo

# 开发工具
.claude/
EOF

echo ""
echo "✅ 项目初始化完成！"
echo ""
echo "📝 下一步:"
echo "1. 安装后端依赖: cd server && npm install"
echo "2. 配置环境变量: cp server/.env.example server/.env"
echo "3. 启动后端: npm run dev"
echo "4. 在另一个终端启动前端: cd client && npm start"
echo ""
echo "📖 详见 README.md 和 PROJECT_PLAN.md"
