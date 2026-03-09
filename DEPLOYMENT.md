# 学生抽签系统 - 部署文档

## 目录
- [系统要求](#系统要求)
- [本地部署](#本地部署)
- [生产环境部署](#生产环境部署)
  - [Vercel 部署（推荐）](#vercel-部署推荐)
  - [Docker 部署](#docker-部署)
  - [传统服务器部署](#传统服务器部署)
- [环境配置](#环境配置)
- [常见问题](#常见问题)

---

## 系统要求

### 基础环境
- **Node.js**: 18.17 或更高版本
- **npm**: 9.0 或更高版本（或 pnpm 8.0+）
- **操作系统**: macOS、Linux 或 Windows

### 浏览器支持
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 本地部署

### 1. 克隆或下载项目

```bash
cd /Users/apple/Downloads/b_ROnBMcaSYxH-1773049290823
```

### 2. 安装依赖

```bash
npm install
```

或使用 pnpm（更快）：

```bash
pnpm install
```

### 3. 准备名单文件

将学生名单 Excel 文件放置在 `public/名单.xlsx`，确保格式如下：

| 学号 | 姓名 | 班级 |
|------|------|------|
| 20255102041107 | 刘恩伶 | 2025级数媒11班 |
| 20255102041134 | 王兰香 | 2025级数媒11班 |

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 5. 构建生产版本

```bash
npm run build
npm start
```

生产服务器将在 http://localhost:3000 启动。

---

## 生产环境部署

### Vercel 部署（推荐）

Vercel 是 Next.js 的官方托管平台，部署最简单。

#### 方式一：通过 Vercel CLI

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **部署项目**

```bash
vercel
```

首次部署时会询问项目配置，按提示操作即可。

4. **部署到生产环境**

```bash
vercel --prod
```

#### 方式二：通过 Vercel 网站

1. 访问 https://vercel.com
2. 使用 GitHub/GitLab/Bitbucket 账号登录
3. 点击 "New Project"
4. 导入你的 Git 仓库（或上传项目文件夹）
5. Vercel 会自动检测 Next.js 项目并配置构建设置
6. 点击 "Deploy" 开始部署

#### 配置说明

Vercel 会自动使用以下配置：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

### Docker 部署

适合需要容器化部署的场景。

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. 创建 .dockerignore

```
node_modules
.next
.git
.gitignore
README.md
DEPLOYMENT.md
.env*.local
```

#### 3. 修改 next.config.mjs

添加 standalone 输出配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

#### 4. 构建和运行

```bash
# 构建镜像
docker build -t student-lottery .

# 运行容器
docker run -p 3000:3000 student-lottery
```

#### 5. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

运行：

```bash
docker-compose up -d
```

---

### 传统服务器部署

适合自有服务器或 VPS 部署。

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

#### 3. 上传项目文件

```bash
# 使用 scp 或 rsync 上传
scp -r /Users/apple/Downloads/b_ROnBMcaSYxH-1773049290823 user@server:/var/www/
```

#### 4. 构建和启动

```bash
cd /var/www/b_ROnBMcaSYxH-1773049290823

# 安装依赖
npm install --production

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "student-lottery" -- start

# 设置开机自启
pm2 startup
pm2 save
```

#### 5. 配置 Nginx 反向代理

创建 Nginx 配置文件 `/etc/nginx/sites-available/student-lottery`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/student-lottery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. 配置 SSL（可选但推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 环境配置

### 环境变量

如需配置环境变量，创建 `.env.local` 文件：

```bash
# 应用配置
NEXT_PUBLIC_APP_NAME=学生抽签系统
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 分析工具（可选）
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 性能优化配置

在 `next.config.mjs` 中添加：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 生产环境优化
  swcMinify: true,
  
  // 输出配置（Docker 部署需要）
  output: 'standalone',
};

export default nextConfig;
```

---

## 常见问题

### 1. Excel 文件无法读取

**问题**: 上传的 Excel 文件无法正确解析

**解决方案**:
- 确保 Excel 文件格式正确，第一行为表头（学号、姓名、班级）
- 检查文件编码，建议使用 UTF-8
- 确保文件大小不超过 10MB

### 2. 构建失败

**问题**: `npm run build` 报错

**解决方案**:
```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

### 3. 端口被占用

**问题**: 3000 端口已被使用

**解决方案**:
```bash
# 修改端口
PORT=3001 npm start

# 或在 package.json 中修改
"start": "next start -p 3001"
```

### 4. 内存不足

**问题**: 构建时内存溢出

**解决方案**:
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 5. PM2 进程崩溃

**问题**: PM2 管理的进程频繁重启

**解决方案**:
```bash
# 查看日志
pm2 logs student-lottery

# 重启进程
pm2 restart student-lottery

# 查看进程状态
pm2 status
```

### 6. Nginx 502 错误

**问题**: Nginx 返回 502 Bad Gateway

**解决方案**:
- 检查 Next.js 应用是否正常运行：`pm2 status`
- 检查端口是否正确：`netstat -tlnp | grep 3000`
- 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

---

## 监控和维护

### 日志管理

```bash
# PM2 日志
pm2 logs student-lottery

# 清理日志
pm2 flush

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart student-lottery
```

### 备份

定期备份重要文件：
- `public/名单.xlsx` - 学生名单
- `.env.local` - 环境配置
- 数据库文件（如有）

---

## 技术支持

如遇到其他问题，请检查：
- Next.js 官方文档: https://nextjs.org/docs
- Vercel 部署指南: https://vercel.com/docs
- 项目 README.md 文件

---

**部署完成后，记得测试所有功能是否正常工作！**
