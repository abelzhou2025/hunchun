# 珲春 - 春节对联生成器

<div align="center">
  <h3>🧧 AI 驱动的中国春节对联生成器 🧧</h3>
  <p>生成个性化对联文字、精美对联图片，以及 AI 手持对联自拍照片</p>
</div>

---

## 📋 项目简介

珲春是一个基于 AI 的春节对联生成 Web 应用，支持两种模式：

### 模式 1：传统对联生成
- 输入赠送对象（如：父母、老板、好友）
- 输入祝福主题（如：身体健康、财源广进）
- 自动生成符合中国传统文化韵律的对联文字
- 可选生成精美的红底洒金对联图片

### 模式 2：AI 手持对联自拍 🆕
- 上传您的自拍照
- AI 自动生成对联文字
- 使用 Img2Img 技术，将对联合成到您的照片中
- 生成手持对联的拜年大片

## ✨ 功能特点

- ✅ **AI 智能生成对联** - 基于 DeepSeek AI，自动创作符合对仗和平仄规律的对联
- ✅ **多样化输出** - 避免重复，每次生成都力求新颖
- ✅ **高清图片生成** - 使用 Nano Banana API 生成 4K 画质对联图片
- ✅ **AI 手持对联自拍** - Img2Img 技术，将对联合成到自拍照中
- ✅ **一键复制** - 快速复制对联文字到剪贴板
- ✅ **图片下载** - 下载生成的对联高清图片
- ✅ **完全中文化** - 纯中文界面，符合国内用户习惯
- ✅ **Cloudflare 部署支持** - 支持 Cloudflare Workers + Pages 全球部署

## 🛠 技术栈

### 前端
- **框架**: React 19.2.4 + TypeScript
- **构建工具**: Vite 6.2.0
- **样式**: Tailwind CSS (CDN)
- **状态管理**: React Hooks (useState)

### 后端 (本地开发)
- **运行时**: Node.js (ES Modules)
- **框架**: Express.js
- **中间件**: CORS, dotenv

### 后端 (Cloudflare 部署)
- **运行时**: Cloudflare Workers
- **框架**: Hono
- **存储**: Cloudflare R2 (图片存储)
- **配置**: Wrangler

### AI API
- **文字生成**: DeepSeek API (deepseek-chat 模型)
- **图片生成**: Nano Banana API (gemini-3-pro-image-preview 模型)

## 📁 项目结构

```
hunchun/
├── App.tsx                      # 主应用组件
├── index.html                   # HTML 入口
├── index.tsx                    # React 入口
├── types.ts                     # TypeScript 类型定义
├── components/
│   ├── InputForm.tsx           # 输入表单组件
│   ├── SelfieUpload.tsx        # 自拍上传组件 🆕
│   ├── SelfieResult.tsx        # 自拍结果展示组件 🆕
│   ├── CoupletDisplay.tsx      # 对联展示组件（已废弃）
│   └── GeneratedImageDisplay.tsx # 图片预览组件（已废弃）
├── services/
│   ├── apiService.ts           # API 调用服务（前端）
│   ├── jimengService.ts        # 即梦图片服务
│   └── canvasService.ts        # Canvas 渲染服务（未使用）
├── cloudflare/                 # Cloudflare Workers 部署 🆕
│   ├── worker.ts               # Workers 入口文件
│   └── package.json            # Workers 依赖配置
├── server/                     # 本地后端服务目录
│   ├── server.js               # Express 服务器
│   ├── package.json            # 后端依赖配置
│   └── node_modules/           # 后端依赖
├── .env.local                  # 环境变量（前端）
├── wrangler.toml               # Cloudflare Workers 配置 🆕
├── package.json                # 前端依赖配置
├── tsconfig.json               # TypeScript 配置
├── README.md                   # 项目说明文档
└── DEPLOYMENT.md               # Cloudflare 部署指南 🆕
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 2. 配置环境变量

#### 前端环境变量 (`./env.local`)

```bash
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3001
```

#### 后端环境变量 (`server/.env`)

```bash
PORT=3001

# DeepSeek API（用于生成对联文字）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Nano Banana API（用于生成对联图片）
NANO_BANANA_API_KEY=your_nano_banana_api_key_here
NANO_BANANA_BASE_URL=http://zx2.52youxi.cc:3000
```

### 3. 启动服务

#### 开发模式

```bash
# 终端 1：启动后端服务
cd server
npm run dev
# 或
node server.js

# 终端 2：启动前端开发服务器
npm run dev
```

访问: http://localhost:3000

#### 生产构建

```bash
# 构建前端
npm run build

# 构建产物在 dist/ 目录
```

## 🔌 API 端点

### 后端 API (http://localhost:3001)

#### 1. 生成对联文字
```http
POST /api/generate-couplet-text
Content-Type: application/json

{
  "recipient": "父母",
  "theme": "身体健康"
}

响应:
{
  "upper": "龙腾盛世千家喜",
  "lower": "春满神州万物荣",
  "horizontal": "国泰民安"
}
```

#### 2. 生成对联图片
```http
POST /api/generate-couplet-image
Content-Type: application/json

{
  "upper": "龙腾盛世千家喜",
  "lower": "春满神州万物荣",
  "horizontal": "国泰民安"
}

响应:
{
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### 3. 健康检查
```http
GET /health

响应:
{
  "status": "ok",
  "message": "后端服务运行正常",
  "api": "Nano Banana Chat"
}
```

## 🎨 设计特点

### UI/UX
- 红色春节主题配色
- 响应式设计，支持移动端
- 加载动画和状态提示
- 错误处理和用户反馈

### 生成策略
- **文字生成**: temperature=1.0, top_p=0.9（高随机性避免重复）
- **图片生成**: 4K 分辨率提示，红底洒金质感，45-80度拍摄视角

## 📝 待优化事项

- [ ] 添加用户历史记录功能
- [ ] 支持对联收藏和分享
- [ ] 添加更多书法字体选择
- [ ] 优化图片生成速度
- [ ] 添加批量生成功能
- [ ] 前端单元测试

## 🏗 部署相关

### 当前配置

**端口配置**:
- 前端: 3000 (Vite dev server)
- 后端: 3001 (Express server)

**CORS 配置**:
- 后端已启用 CORS，允许跨域请求

**环境变量**:
- 前端使用 `VITE_` 前缀（Vite 要求）
- 后端使用 dotenv 加载 `.env` 文件

### 需要部署建议的问题

1. **服务器选择**:
   - 是否适合部署到 Vercel/Netlify 等无服务器平台？
   - 是否需要独立服务器？

2. **后端部署**:
   - Express 后端如何与前端一起部署？
   - 是否需要使用 serverless 函数替代？

3. **API 密钥安全**:
   - 生产环境如何保护 API 密钥？
   - 是否需要 API 限流和鉴权？

4. **图片生成优化**:
   - Base64 图片数据较大，是否需要改用 URL 返回？
   - 是否需要 CDN 加速？

5. **性能优化**:
   - 是否需要添加 Redis 缓存常见对联？
   - 图片生成是否需要异步处理？

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**生成时间**: 2026-02-03
**版本**: 1.0.0
