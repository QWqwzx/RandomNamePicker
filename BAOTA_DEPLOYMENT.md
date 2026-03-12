# 宝塔面板部署指南 - 学生抽签系统

本文档详细介绍如何在安装了宝塔面板的服务器上部署 Next.js 学生抽签系统。

---

## 目录
- [前置准备](#前置准备)
- [方式一：使用 PM2 部署（推荐）](#方式一使用-pm2-部署推荐)
- [方式二：使用 Docker 部署](#方式二使用-docker-部署)
- [方式三：使用宝塔 Node 项目管理](#方式三使用宝塔-node-项目管理)
- [配置域名和 SSL](#配置域名和-ssl)
- [常见问题](#常见问题)

---

## 前置准备

### 1. 服务器要求
- 操作系统：CentOS 7+、Ubuntu 18.04+ 或 Debian 9+
- 内存：至少 1GB（推荐 2GB+）
- 宝塔面板：7.x 或更高版本

### 2. 安装必要软件

登录宝塔面板，进入「软件商店」，安装以下软件：

#### 必装软件
- **Nginx** 1.20+ （用于反向代理）
- **PM2 管理器** 4.x+（用于进程管理）

#### 可选软件
- **Docker 管理器**（如果使用 Docker 部署）

### 3. 安装 Node.js

在宝塔面板中：

1. 进入「软件商店」→ 搜索「Node 版本管理器」
2. 安装「Node 版本管理器」
3. 安装后，点击「设置」→ 安装 Node.js 18.x 或更高版本

或者通过 SSH 手动安装：

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version
```

---

## 方式一：使用 PM2 部署（推荐）

这是最简单且稳定的部署方式。

### 步骤 1：创建网站目录

1. 登录宝塔面板
2. 点击「网站」→「添加站点」
3. 填写信息：
   - **域名**：你的域名（如 `lottery.example.com`）
   - **根目录**：`/www/wwwroot/student-lottery`
   - **PHP 版本**：纯静态（不需要 PHP）
4. 点击「提交」

### 步骤 2：上传项目文件

#### 方法 A：使用 Git（推荐）

通过 SSH 连接服务器：

```bash
# 进入网站目录
cd /www/wwwroot/student-lottery

# 克隆项目
git clone https://gitee.com/knjkk/random-name-picker.git .

# 或者如果已经推送到 Gitee
git clone git@gitee.com:knjkk/random-name-picker.git .
```

#### 方法 B：使用宝塔文件管理器

1. 在宝塔面板点击「文件」
2. 进入 `/www/wwwroot/student-lottery` 目录
3. 点击「上传」，上传项目压缩包
4. 解压文件

### 步骤 3：安装依赖和构建

通过 SSH 执行：

```bash
cd /www/wwwroot/student-lottery

# 安装依赖
npm install --production

# 构建项目
npm run build
```

**注意**：构建过程可能需要 3-5 分钟，请耐心等待。

### 步骤 4：使用 PM2 启动应用

#### 方法 A：通过宝塔 PM2 管理器（推荐）

1. 在宝塔面板点击「软件商店」→「PM2 管理器」→「设置」
2. 点击「添加项目」
3. 填写信息：
   - **项目名称**：student-lottery
   - **启动文件**：选择 `node_modules/next/dist/bin/next`
   - **项目路径**：`/www/wwwroot/student-lottery`
   - **运行目录**：`/www/wwwroot/student-lottery`
   - **启动参数**：`start`
   - **端口**：3000
4. 点击「提交」

#### 方法 B：通过 SSH 命令

```bash
cd /www/wwwroot/student-lottery

# 使用 PM2 启动
pm2 start npm --name "student-lottery" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status
pm2 logs student-lottery
```

### 步骤 5：配置 Nginx 反向代理

1. 在宝塔面板点击「网站」
2. 找到刚创建的站点，点击「设置」
3. 点击「反向代理」→「添加反向代理」
4. 填写配置：
   - **代理名称**：student-lottery
   - **目标 URL**：`http://127.0.0.1:3000`
   - **发送域名**：`$host`
5. 点击「提交」

或者手动编辑配置文件：

点击「配置文件」，在 `server` 块中添加：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

保存后重载 Nginx。

### 步骤 6：测试访问

访问你的域名（如 `http://lottery.example.com`），应该能看到抽签系统界面。

---

## 方式二：使用 Docker 部署

适合熟悉 Docker 的用户。

### 步骤 1：安装 Docker

在宝塔面板「软件商店」中安装「Docker 管理器」。

或通过 SSH：

```bash
curl -fsSL https://get.docker.com | bash -s docker
systemctl start docker
systemctl enable docker
```

### 步骤 2：创建 Dockerfile

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

### 步骤 3：修改 next.config.mjs

添加 standalone 输出：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### 步骤 4：构建和运行

```bash
cd /www/wwwroot/student-lottery

# 构建镜像
docker build -t student-lottery .

# 运行容器
docker run -d \
  --name student-lottery \
  --restart unless-stopped \
  -p 3000:3000 \
  student-lottery

# 查看运行状态
docker ps
docker logs student-lottery
```

### 步骤 5：配置 Nginx

同方式一的步骤 5。

---

## 方式三：使用宝塔 Node 项目管理

宝塔面板内置了 Node 项目管理功能。

### 步骤 1：创建 Node 项目

1. 在宝塔面板点击「网站」→「Node 项目」
2. 点击「添加 Node 项目」
3. 填写信息：
   - **项目名称**：student-lottery
   - **项目路径**：`/www/wwwroot/student-lottery`
   - **启动文件**：`node_modules/next/dist/bin/next`
   - **启动参数**：`start`
   - **端口**：3000
   - **Node 版本**：18.x
4. 点击「提交」

### 步骤 2：上传和构建

同方式一的步骤 2 和 3。

### 步骤 3：启动项目

在「Node 项目」列表中，点击「启动」按钮。

### 步骤 4：配置域名

1. 点击项目的「映射」按钮
2. 选择或创建域名
3. 系统会自动配置 Nginx 反向代理

---

## 配置域名和 SSL

### 1. 绑定域名

1. 在宝塔面板点击「网站」
2. 找到站点，点击「设置」
3. 点击「域名管理」
4. 添加你的域名

### 2. 配置 SSL 证书（推荐）

#### 方法 A：使用 Let's Encrypt 免费证书

1. 在站点设置中点击「SSL」
2. 选择「Let's Encrypt」
3. 勾选你的域名
4. 点击「申请」
5. 申请成功后，开启「强制 HTTPS」

#### 方法 B：上传自己的证书

1. 在站点设置中点击「SSL」
2. 选择「其他证书」
3. 粘贴证书内容（.crt 和 .key）
4. 点击「保存」
5. 开启「强制 HTTPS」

---

## 性能优化

### 1. 开启 Gzip 压缩

在站点设置 → 配置文件中，确保有以下配置：

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 2. 配置缓存

在 Nginx 配置中添加静态资源缓存：

```nginx
location /_next/static {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, immutable";
}

location /public {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache_valid 200 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

### 3. 增加 Node.js 内存限制

如果服务器内存充足，可以增加 Node.js 内存：

在 PM2 启动命令中添加：

```bash
pm2 start npm --name "student-lottery" --node-args="--max-old-space-size=2048" -- start
```

---

## 日常维护

### 查看日志

#### PM2 日志
```bash
pm2 logs student-lottery
pm2 logs student-lottery --lines 100
```

#### 或在宝塔面板
1. 点击「软件商店」→「PM2 管理器」→「设置」
2. 找到项目，点击「日志」

### 重启应用

```bash
pm2 restart student-lottery
```

或在宝塔 PM2 管理器中点击「重启」按钮。

### 更新代码

```bash
cd /www/wwwroot/student-lottery

# 拉取最新代码
git pull

# 安装新依赖
npm install --production

# 重新构建
npm run build

# 重启应用
pm2 restart student-lottery
```

### 备份

在宝塔面板中：
1. 点击「计划任务」
2. 添加「备份网站」任务
3. 选择站点和备份周期

---

## 常见问题

### 1. 端口被占用

**问题**：3000 端口已被使用

**解决方案**：
```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 修改端口
PORT=3001 pm2 start npm --name "student-lottery" -- start
```

然后修改 Nginx 反向代理配置中的端口。

### 2. 构建失败：内存不足

**问题**：`npm run build` 时内存溢出

**解决方案**：
```bash
# 临时增加交换空间
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 或增加 Node.js 内存
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 3. PM2 进程频繁重启

**问题**：应用不断崩溃重启

**解决方案**：
```bash
# 查看详细日志
pm2 logs student-lottery --lines 200

# 检查是否是端口冲突
pm2 delete student-lottery
pm2 start npm --name "student-lottery" -- start
```

### 4. 502 Bad Gateway

**问题**：Nginx 返回 502 错误

**解决方案**：
1. 检查 Node.js 应用是否运行：`pm2 status`
2. 检查端口是否正确：`netstat -tlnp | grep 3000`
3. 查看 Nginx 错误日志：在宝塔面板「网站」→「日志」
4. 重启应用：`pm2 restart student-lottery`

### 5. 文件上传失败

**问题**：Excel 文件无法上传

**解决方案**：

修改 Nginx 配置，增加上传大小限制：

```nginx
client_max_body_size 20M;
```

### 6. 权限问题

**问题**：无法写入文件或创建目录

**解决方案**：
```bash
# 修改项目目录权限
chown -R www:www /www/wwwroot/student-lottery
chmod -R 755 /www/wwwroot/student-lottery
```

### 7. 防火墙问题

**问题**：外网无法访问

**解决方案**：

在宝塔面板「安全」中：
1. 放行 80 端口（HTTP）
2. 放行 443 端口（HTTPS）
3. 如果直接访问 Node.js，放行 3000 端口

---

## 安全建议

### 1. 定期更新

```bash
# 更新系统
yum update -y  # CentOS
apt update && apt upgrade -y  # Ubuntu/Debian

# 更新 Node.js 依赖
npm update
```

### 2. 配置防火墙

只开放必要的端口（80、443），不要直接暴露 3000 端口。

### 3. 使用 HTTPS

强烈建议配置 SSL 证书，保护数据传输安全。

### 4. 定期备份

- 每天备份数据库（如有）
- 每周备份网站文件
- 备份到异地存储

---

## 监控和告警

### 使用宝塔监控

1. 在宝塔面板点击「监控」
2. 查看 CPU、内存、磁盘使用情况
3. 设置告警阈值

### PM2 监控

```bash
# 查看资源使用
pm2 monit

# 查看详细信息
pm2 show student-lottery
```

---

## 完整部署检查清单

- [ ] 安装 Node.js 18+
- [ ] 安装 PM2 管理器
- [ ] 安装 Nginx
- [ ] 创建网站目录
- [ ] 上传项目文件
- [ ] 安装依赖 `npm install`
- [ ] 构建项目 `npm run build`
- [ ] 使用 PM2 启动应用
- [ ] 配置 Nginx 反向代理
- [ ] 绑定域名
- [ ] 配置 SSL 证书
- [ ] 测试访问
- [ ] 配置自动备份
- [ ] 设置监控告警

---

## 技术支持

如遇到问题：
1. 查看本文档的「常见问题」部分
2. 查看 PM2 日志：`pm2 logs student-lottery`
3. 查看 Nginx 错误日志
4. 参考 Next.js 官方文档：https://nextjs.org/docs

---

**部署完成后，记得测试所有功能！**

访问你的域名，检查：
- ✅ 页面能否正常加载
- ✅ Excel 文件能否上传
- ✅ 抽签功能是否正常
- ✅ 签池管理是否可用
- ✅ HTTPS 是否生效
