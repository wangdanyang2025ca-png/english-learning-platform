/**
 * 数据模型定义
 * 定义所有数据库 schema 的 TypeScript 接口
 */

// ============ 用户相关 ============

export interface IUser {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  preferences: {
    dailyGoal: number;           // 每日学习单词目标
    notificationsEnabled: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============ 单词相关 ============

export interface IMeaning {
  partOfSpeech: string;         // 词性：noun, verb, adj, adv等
  definition: string;            // 英文定义
  definition_cn: string;         // 中文释义
  examples: Array<{
    sentence: string;
    sentence_cn: string;
    source?: string;             // 例句来源（可选）
  }>;
}

export interface IWord {
  _id: string;
  word: string;                  // 单词（小写）
  pronunciation: {
    ipa: string;                 // IPA 音标，如 /həˈləʊ/
    ame: string;                 // 美式发音，如 "huh-LOH"
    bre: string;                 // 英式发音，如 "hel-LOH"
  };
  meanings: IMeaning[];          // 多个含义
  categories: Array<
    'CET4' | 'CET6' | 'IELTS' | 'TOEFL' | 'GRE' | 'GMAT' | 'SAT'
  >;
  difficulty: 1 | 2 | 3 | 4 | 5; // 难度等级
  audioUrl?: string;             // 发音音频 URL
  imageUrl?: string;             // 辅助图片 URL
  etymology?: {
    origin: string;              // 词源
    related: string[];           // 相关词汇
  };
  frequency?: number;            // 使用频率排名（可选）
  tags?: string[];               // 标签：例如 'business', 'medical' 等
  createdAt: Date;
  updatedAt: Date;
}

// ============ 学习记录相关 ============

export interface IStudyLog {
  _id: string;
  userId: string;
  wordId: string;
  status: 'new' | 'reviewing' | 'learned' | 'forgotten';
  reviewCount: number;           // 复习次数
  correctCount: number;          // 正确次数
  intervalDays: number;          // SRS 间隔天数
  nextReviewDate: Date;          // 下一次复习日期
  lastReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============ 用户词本 ============

export interface IWordlist {
  _id: string;
  userId: string;
  name: string;                  // 词本名称
  description?: string;
  words: string[];               // wordId 数组
  isPublic: boolean;             // 是否公开
  totalWords: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ 学习统计 ============

export interface IStudyStats {
  _id: string;
  userId: string;
  date: Date;                    // 统计日期
  wordsLearned: number;          // 当天学习单词数
  totalReviews: number;          // 当天复习总数
  studyDuration: number;         // 学习时长（分钟）
  accuracy: number;              // 准确率 (0-100)
  categories: {
    [category: string]: {
      learned: number;
      total: number;
    };
  };
  createdAt: Date;
}

// ============ 视频相关（Phase 2） ============

export interface IVideo {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;             // YouTube video ID
  category: 'Education' | 'Tech' | 'Sports' | 'Entertainment' | 'News';
  difficulty: 1 | 2 | 3 | 4 | 5; // 英文难度
  duration: number;              // 时长（秒）
  uploadDate: Date;
  youtubeUploadDate?: Date;      // YouTube 上传日期
  views: number;
  rating: number;                // 1-5 星评分
  tags: string[];
  subtitles?: {
    zh_CN?: string;              // 中文字幕 URL
    en_US?: string;              // 英文字幕 URL
  };
  keywords: string[];            // 关键词，用于搜索
  channelName: string;           // 频道名称
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoFavorite {
  _id: string;
  userId: string;
  videoId: string;
  createdAt: Date;
}

export interface IStudyNote {
  _id: string;
  userId: string;
  videoId: string;
  timestamp: number;             // 视频时间戳（秒）
  content: string;               // 笔记内容
  createdAt: Date;
  updatedAt: Date;
}

// ============ API 请求/响应类型 ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<IUser, 'passwordHash'>;
}

export interface WordsQueryParams {
  category?: string;
  difficulty?: number;
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
