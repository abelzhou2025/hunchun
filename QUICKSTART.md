# 🚀 快速开始

## 本地开发测试

### 1. 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd server
npm install
cd ..
```

### 2. 配置环境变量

#### 前端 (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:3001
```

#### 后端 (server/.env)
```bash
PORT=3001
DEEPSEEK_API_KEY=sk-fb3931df91f5401a8502931eeba9725c
NANO_BANANA_API_KEY=sk-5VHmN7OWykDPc9MZgCUdCCbcMoBTZjJxvCiVtDh7rpJgSudH
```

### 3. 启动服务

```bash
# 终端 1：启动后端（3001）
cd server
node server.js

# 终端 2：启动前端（3000）
npm run dev
```

### 4. 测试功能

访问 http://localhost:3000

#### 模式 1：生成对联文字
1. 输入赠送对象（如：父母）
2. 输入祝福主题（如：身体健康）
3. 点击"生成对联"
4. 复制文字或生成图片

#### 模式 2：手持对联自拍 🆕
1. 点击顶部"手持对联自拍"按钮
2. 上传一张自拍照（JPG/PNG，<5MB）
3. 输入赠送对象和祝福主题
4. 点击"生成手持对联照片"
5. 等待 AI 生成（约 10-30 秒）
6. 查看原图和生成图对比
7. 下载或重新生成

## Cloudflare 部署

详细的 Cloudflare 部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署命令

```bash
# 1. 部署 Workers（后端）
cd cloudflare
npm install
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put NANO_BANANA_API_KEY
npx wrangler deploy

# 2. 部署 Pages（前端）
cd ..
npm run build
npx wrangler pages deploy dist --project-name=hunchun
```

## 功能截图说明

### 主界面
- 顶部：两个模式切换按钮
  - 📜 生成对联文字
  - 📸 手持对联自拍

### 模式 1：对联生成
- 输入表单
- 对联文字展示
- 复制文字按钮
- 生成图片按钮

### 模式 2：自拍生成 🆕
- 图片上传区域（支持预览）
- 赠送对象输入
- 祝福主题输入
- 生成按钮（"🧧 生成手持对联照片"）
- 结果对比展示：
  - 左侧：原始照片
  - 右侧：生成照片
- 对联文字展示
- 下载和重新生成按钮

## API 端点

### 后端 (http://localhost:3001)

```
POST /api/generate-couplet-text     # 生成对联文字
POST /api/generate-couplet-image    # 生成对联图片
POST /api/generate-selfie           # 生成手持对联自拍 🆕
GET  /health                        # 健康检查
```

### Cloudflare Workers (部署后)

```
GET  /api/upload-url                # 获取 R2 上传 URL 🆕
POST /api/generate-selfie           # 生成手持对联自拍 🆕
GET  /api/task-status/:id           # 查询任务状态 🆕
GET  /health                        # 健康检查
```

## 常见问题

### Q: 上传图片失败？
A: 检查图片格式（JPG/PNG）和大小（<5MB）

### Q: 生成很慢？
A: AI 图片生成需要 10-30 秒，请耐心等待

### Q: 生成的对联效果不好？
A: 可以点击"重新生成"尝试不同效果

### Q: 本地开发时 CORS 错误？
A: 确保后端服务器在 3001 端口运行

### Q: Cloudflare 部署后无法访问？
A: 检查环境变量配置和 Workers 日志

## 下一步

- [ ] 阅读完整的 [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] 查看功能实现细节 [SELFIE_FEATURE.md](./SELFIE_FEATURE.md)
- [ ] 推送代码到 GitHub
- [ ] 配置 GitHub Secrets
- [ ] 启用 GitHub Actions 自动部署

---

**需要帮助？** 请查看 DEPLOYMENT.md 的故障排查部分
