# 快速修复：安装 Node.js

你的服务器还没有安装 Node.js。以下是安装步骤：

## 方法一：通过宝塔面板安装（最简单）

1. 登录宝塔面板
2. 点击「软件商店」
3. 搜索「Node 版本管理器」或「Node.js」
4. 点击「安装」
5. 安装完成后，点击「设置」
6. 选择安装 Node.js 18.x 版本
7. 等待安装完成

安装后，重新连接 SSH 或执行：
```bash
source ~/.bashrc
node --version
npm --version
```

---

## 方法二：通过 SSH 命令安装（推荐）

### CentOS/RHEL 系统

```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node --version
npm --version
```

### Ubuntu/Debian 系统

```bash
# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

---

## 方法三：使用 NVM 安装（灵活管理多版本）

```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 加载 NVM
source ~/.bashrc
# 或
source ~/.bash_profile

# 安装 Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# 验证安装
node --version
npm --version
```

---

## 安装完成后继续部署

```bash
# 进入项目目录
cd /www/wwwroot/185.239.86.54_3000

# 安装依赖
npm install --production

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "student-lottery" -- start

# 查看状态
pm2 status
pm2 logs student-lottery
```

---

## 如果 PM2 也没安装

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

---

## 常见问题

### 1. 安装后仍然提示 command not found

重新加载环境变量：
```bash
source ~/.bashrc
# 或
source ~/.bash_profile
# 或重新登录 SSH
```

### 2. 权限问题

如果遇到权限错误，使用 sudo：
```bash
sudo npm install -g pm2
```

### 3. 网络问题

如果下载慢，可以使用国内镜像：
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install --production
```

---

## 推荐安装顺序

1. ✅ 安装 Node.js 18.x
2. ✅ 验证 `node --version` 和 `npm --version`
3. ✅ 安装 PM2：`npm install -g pm2`
4. ✅ 进入项目目录
5. ✅ 安装依赖：`npm install --production`
6. ✅ 构建项目：`npm run build`
7. ✅ 启动应用：`pm2 start npm --name "student-lottery" -- start`

选择最适合你的安装方法，推荐使用方法一（宝塔面板）或方法二（命令行）。
