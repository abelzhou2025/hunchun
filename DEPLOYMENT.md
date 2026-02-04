# 🚀 Cloudflare 部署指南

本指南将帮助你将"珲春"春节对联生成器部署到 Cloudflare。

## 📋 部署架构

```
┌─────────────────────────────────────────────┐
│          Cloudflare Pages (前端)            │
│         React + Vite 应用                   │
│         https://your-domain.pages.dev       │
└──────────────┬──────────────────────────────┘
               │
               │ API 调用
               ▼
┌─────────────────────────────────────────────┐
│       Cloudflare Workers (后端 API)         │
│         Hono + R2 Storage                   │
│         https://your-api.workers.dev        │
└──────────────┬──────────────────────────────┘
               │
               ├──────────────┬───────────────┐
               ▼              ▼               ▼
          ┌────────┐    ┌─────────┐    ┌──────────┐
          │   R2   │    │DeepSeek │    │Nano Banana│
          │ Storage│    │   API   │    │   API    │
          └────────┘    └─────────┘    └──────────┘
```

## 🔧 部署步骤

### 1. 准备 Cloudflare 账号

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 确保已升级到 Pro 或以上套餐（支持 Workers 和 Pages）

### 2. 创建 R2 Bucket

1. 在 Cloudflare Dashboard 中，进入 **R2 Object Storage**
2. 点击 **Create bucket**
3. 输入 bucket 名称：`couplet-images`
4. 选择区域（推荐离用户最近的区域）
5. 点击 **Create bucket**

#### 配置 R2 公共访问（可选）

如果要直接通过 URL 访问上传的图片：

1. 在 bucket 设置中，找到 **Public access**
2. 添加自定义域名或使用默认的 `*.r2.dev` 域名
3. 配置 CORS 规则：

```json
[
  {
    "AllowedOrigins": ["https://your-domain.pages.dev"],
    "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

### 3. 配置环境变量

#### 通过 Cloudflare Dashboard 配置：

1. 进入 **Workers & Pages**
2. 创建或选择你的 Worker
3. 在 **Settings** → **Variables and Secrets** 中添加：

**环境变量 (Environment Variables):**
```
DEEPSEEK_API_KEY=your_deepseek_api_key
NANO_BANANA_API_KEY=your_nano_banana_api_key
```

#### 通过 wrangler CLI 配置：

```bash
# 上传敏感信息（安全）
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put NANO_BANANA_API_KEY
```

### 4. 部署后端 (Cloudflare Workers)

```bash
# 进入 cloudflare 目录
cd cloudflare

# 安装依赖
npm install

# 首次部署
npx wrangler deploy

# 或开发模式测试
npm run dev
```

部署成功后，你会看到：
```
✨ Successfully published your Worker to
  https://hunchun-api.your-subdomain.workers.dev
```

**记录这个 URL**，稍后配置前端时需要用到。

### 5. 部署前端 (Cloudflare Pages)

#### 方法 A：通过 GitHub 连接（推荐）

1. 将项目推送到 GitHub
2. 在 Cloudflare Dashboard 中，进入 **Pages**
3. 点击 **Create a project** → **Connect to Git**
4. 选择你的 GitHub 仓库
5. 配置构建设置：

```
Build command: npm run build
Build output directory: dist
Root directory: /
```

6. 在 **Environment variables** 中添加：

```
VITE_API_BASE_URL=https://hunchun-api.your-subdomain.workers.dev
```

7. 点击 **Save and Deploy**

#### 方法 B：通过 Direct Upload

```bash
# 构建前端
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=hunchun
```

### 6. 配置自定义域名（可选）

#### 前端自定义域名：

1. 在 Pages 项目设置中，点击 **Custom domains**
2. 添加你的域名，例如：`hunchun.yourdomain.com`
3. 按照提示配置 DNS 记录

#### 后端自定义域名：

1. 在 Workers 项目设置中，点击 **Triggers**
2. 添加自定义域名，例如：`api.yourdomain.com`

### 7. 更新 CORS 配置

在 `cloudflare/worker.ts` 中，更新 CORS 允许的域名：

```typescript
app.use('*', cors({
  origin: 'https://hunchun.yourdomain.com', // 你的前端域名
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

重新部署 Workers：

```bash
cd cloudflare
npx wrangler deploy
```

## 📝 部署检查清单

- [ ] R2 Bucket 已创建
- [ ] R2 CORS 已配置
- [ ] DeepSeek API Key 已配置
- [ ] Nano Banana API Key 已配置
- [ ] Workers 已部署并可访问
- [ ] Pages 已部署并可访问
- [ ] 前端 API_BASE_URL 已指向 Workers URL
- [ ] CORS 配置正确
- [ ] 测试上传和生成功能

## 🧪 测试部署

### 测试健康检查

```bash
curl https://hunchun-api.your-subdomain.workers.dev/health
```

应返回：
```json
{"status":"ok","message":"Cloudflare Workers API 运行正常"}
```

### 测试上传 URL 生成

```bash
curl "https://hunchun-api.your-subdomain.workers.dev/api/upload-url?filename=test.jpg"
```

### 测试自拍生成功能

1. 访问前端：https://hunchun.yourdomain.com
2. 切换到"手持对联自拍"模式
3. 上传一张照片并输入主题
4. 检查是否能正常生成

## 🔍 故障排查

### Workers 部署失败

检查 `wrangler.toml` 配置：
```toml
name = "hunchun-api"
main = "cloudflare/worker.ts"
compatibility_date = "2024-01-01"
```

### R2 上传失败

1. 检查 R2 Bucket 名称是否正确
2. 检查 CORS 配置
3. 查看 Workers 日志：`npx wrangler tail`

### API 调用超时

- Workers 有 30 秒执行时间限制
- 如果 AI 生成耗时较长，考虑使用异步任务队列

### 前端无法连接后端

1. 检查 `VITE_API_BASE_URL` 是否正确
2. 检查 Workers 的 CORS 配置
3. 查看浏览器控制台的错误信息

## 💰 成本估算

### Cloudflare 免费套餐

- **Workers**: 每天 100,000 次请求
- **Pages**: 无限带宽
- **R2**: 每月 10GB 存储，每月 100万次 Class A 操作

### 付费计划（如需要）

- **Workers Paid**: $5/月（1000万请求/月）
- **R2**: $0.015/GB/月存储 + 请求费用

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [R2 Storage 文档](https://developers.cloudflare.com/r2/)
- [Hono 框架文档](https://hono.dev/)

## 🆘 获取帮助

如有问题，请：
1. 查看 Cloudflare Dashboard 中的日志
2. 运行 `npx wrangler tail` 查看 Workers 实时日志
3. 检查浏览器控制台和开发者工具的网络请求

---

**部署完成后，你的应用将在全球各地的 Cloudflare 边缘节点运行，享受超快的访问速度！** 🚀
