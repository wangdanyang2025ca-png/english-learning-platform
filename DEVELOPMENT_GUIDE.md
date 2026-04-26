# 开发指南

本文档说明如何在此项目中进行开发。

## 代码风格

### TypeScript 规范
- 使用 `interface` 定义对象类型
- 函数必须标注参数和返回类型
- 避免使用 `any`，使用具体类型
- 使用 `const` 优于 `let`

```typescript
// ✅ 好
interface UserData {
  id: string;
  name: string;
}

function getUserName(user: UserData): string {
  return user.name;
}

// ❌ 避免
function getUserName(user: any) {
  return user.name;
}
```

### 命名规范
- 文件和文件夹：使用 kebab-case（`user-controller.ts`）
- 类和接口：使用 PascalCase（`UserModel`）
- 变量和函数：使用 camelCase（`getUserName`）
- 常量：使用 UPPER_SNAKE_CASE（`API_BASE_URL`）
- 枚举：使用 PascalCase（`UserStatus`）

### 目录结构说明

```
server/src/
├── models/          # 数据库模型和数据类型定义
│   ├── schemas.ts   # TypeScript interface 定义
│   └── word.model.ts # Mongoose Word 模型
├── routes/          # API 路由定义
│   ├── auth.routes.ts
│   ├── word.routes.ts
│   └── index.ts     # 路由聚合
├── controllers/     # 请求处理逻辑
│   ├── auth.controller.ts
│   ├── word.controller.ts
│   └── study.controller.ts
├── services/        # 业务逻辑层
│   ├── auth.service.ts
│   ├── word.service.ts
│   └── tts.service.ts # TTS 服务
├── middleware/      # Express 中间件
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── config/          # 配置文件
│   ├── database.ts
│   └── constants.ts
├── utils/           # 工具函数
│   ├── jwt.util.ts
│   └── encrypt.util.ts
└── app.ts           # Express 应用启动
```

## 后端开发流程

### 1. 添加新的 API 端点

假设要添加"获取单词列表"的接口：

#### 步骤 1: 定义数据类型（models/schemas.ts）
```typescript
export interface WordsQueryParams {
  category?: string;
  difficulty?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    total: number;
  };
}
```

#### 步骤 2: 创建 Controller（controllers/word.controller.ts）
```typescript
import { Request, Response } from 'express';
import { WordService } from '../services/word.service';
import { PaginatedResponse, IWord } from '../models/schemas';

export class WordController {
  static async getWords(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { category, difficulty, page = 1, limit = 20 } = req.query;

      const result = await WordService.getWords({
        category: category as string,
        difficulty: difficulty as any,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: result.words,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
```

#### 步骤 3: 创建 Service（services/word.service.ts）
```typescript
import { Word } from '../models/word.model';
import { WordsQueryParams, IWord } from '../models/schemas';

export class WordService {
  static async getWords(params: WordsQueryParams) {
    const { category, difficulty, page = 1, limit = 20 } = params;

    const query: any = {};
    if (category) query.categories = category;
    if (difficulty) query.difficulty = difficulty;

    const total = await Word.countDocuments(query);
    const words = await Word.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    return {
      words,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
```

#### 步骤 4: 添加路由（routes/word.routes.ts）
```typescript
import { Router } from 'express';
import { WordController } from '../controllers/word.controller';

const router = Router();

router.get('/words', WordController.getWords);

export default router;
```

#### 步骤 5: 在 app.ts 中注册路由
```typescript
import wordRoutes from './routes/word.routes';

app.use('/api', wordRoutes);
```

### 2. 数据库操作

#### Mongoose 模型示例
```typescript
import mongoose from 'mongoose';
import { IWord } from './schemas';

const wordSchema = new mongoose.Schema<IWord>({
  word: { type: String, required: true, unique: true, lowercase: true },
  pronunciation: {
    ipa: String,
    ame: String,
    bre: String,
  },
  meanings: [{
    partOfSpeech: String,
    definition: String,
    definition_cn: String,
    examples: [{
      sentence: String,
      sentence_cn: String,
    }],
  }],
  categories: [String],
  difficulty: { type: Number, min: 1, max: 5 },
  audioUrl: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Word = mongoose.model<IWord>('Word', wordSchema);
```

## 前端开发流程

### 1. 项目结构

```
client/src/
├── components/          # 可复用组件
│   ├── WordCard.tsx
│   ├── Header.tsx
│   └── Navigation.tsx
├── pages/               # 页面组件
│   ├── LearnPage.tsx
│   ├── StatsPage.tsx
│   └── LoginPage.tsx
├── hooks/               # 自定义 Hook
│   ├── useAuth.ts
│   ├── useWords.ts
│   └── useStudyLog.ts
├── services/            # API 调用
│   └── api.ts
├── types/               # TypeScript 类型
│   └── index.ts
├── styles/              # 全局样式
│   └── globals.css
├── App.tsx              # 主应用
└── index.tsx            # 入口
```

### 2. 创建一个新页面

#### 示例：学习页面（pages/LearnPage.tsx）

```typescript
import React, { useState, useEffect } from 'react';
import { WordCard } from '../components/WordCard';
import { useWords } from '../hooks/useWords';

export const LearnPage: React.FC = () => {
  const [category, setCategory] = useState<string>('CET4');
  const { words, isLoading, error } = useWords(category);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错: {error}</div>;

  return (
    <div className="learn-page">
      <h1>学习单词</h1>
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="CET4">四级</option>
        <option value="CET6">六级</option>
        <option value="IELTS">雅思</option>
      </select>

      <div className="words-container">
        {words.map(word => (
          <WordCard key={word._id} word={word} />
        ))}
      </div>
    </div>
  );
};
```

### 3. 自定义 Hook

#### 示例：useWords.ts

```typescript
import { useState, useEffect } from 'react';
import { IWord } from '../types';
import { api } from '../services/api';

interface UseWordsResult {
  words: IWord[];
  isLoading: boolean;
  error: string | null;
}

export function useWords(category: string): UseWordsResult {
  const [words, setWords] = useState<IWord[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/words?category=${category}`);
        setWords(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [category]);

  return { words, isLoading, error };
}
```

### 4. API 调用服务

#### 示例：services/api.ts

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 测试指南

### 后端测试

```bash
cd server
npm test
```

#### 测试示例
```typescript
import { WordService } from '../services/word.service';

describe('WordService', () => {
  test('should return paginated words', async () => {
    const result = await WordService.getWords({
      category: 'CET4',
      page: 1,
      limit: 20,
    });

    expect(result.words).toBeDefined();
    expect(result.pagination.total).toBeGreaterThan(0);
  });
});
```

## 提交代码

### Commit 消息规范

```
<类型>: <描述>

<详细说明（可选）>

示例：
feat: 添加单词卡片学习模式
fix: 修复用户登录错误
docs: 更新 API 文档
refactor: 重构数据库服务
test: 添加单词服务测试
```

### 常用类型
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `refactor`: 代码重构
- `test`: 添加测试
- `chore`: 构建或依赖更新

## 常见问题

**Q: 如何连接本地 MongoDB？**
```bash
# 启动 MongoDB（需要先安装）
mongod

# 在 .env 中配置
MONGODB_URI=mongodb://localhost:27017/english-learning-platform
```

**Q: 如何处理跨域请求？**
后端已配置 CORS 中间件，默认允许 `http://localhost:3000`。

**Q: 前端如何访问后端 API？**
使用 `services/api.ts` 中定义的 `api` 实例发送请求。

---

有问题？查看 `PROJECT_PLAN.md` 了解更多详情。
