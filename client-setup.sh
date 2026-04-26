#!/bin/bash

# 前端项目初始化脚本

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd ~/projects/english-learning-platform/client

# 创建环境变量文件
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5001/api
SKIP_PREFLIGHT_CHECK=true
EOF

# 创建基础组件
mkdir -p src/components src/pages src/services src/types

# 创建 API 服务
cat > src/services/api.ts << 'EOFAPI'
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
EOFAPI

# 创建类型定义
cat > src/types/index.ts << 'EOFTYPE'
export interface IWord {
  _id: string;
  word: string;
  pronunciation: {
    ipa: string;
  };
  meanings: Array<{
    partOfSpeech: string;
    definition_cn: string;
    examples: Array<{
      sentence: string;
    }>;
  }>;
  difficulty: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
EOFTYPE

echo "✅ 前端初始化完成"
