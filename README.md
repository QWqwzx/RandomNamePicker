# 学生抽签系统

一个基于 Next.js 的学生抽签应用，支持从 Excel 文件读取学生名单。

## 功能特点

- 📊 自动读取 Excel 名单文件
- 🎲 随机抽签动画效果
- 📝 显示学号、姓名、班级信息
- 📤 支持手动上传 Excel 文件
- ✨ 精美的 UI 设计和动画效果

## 安装步骤

### 1. 安装 Node.js

如果还没有安装 Node.js，请先安装：

**macOS (使用 Homebrew):**
```bash
brew install node
```

**或者从官网下载:**
访问 https://nodejs.org/ 下载并安装 LTS 版本

### 2. 安装依赖

```bash
cd /Users/apple/Downloads/b_ROnBMcaSYxH-1773049290823
npm install
```

### 3. 运行开发服务器

```bash
npm run dev
```

然后在浏览器中打开 http://localhost:3000

### 4. 构建生产版本

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## Excel 文件格式

Excel 文件应包含以下列（第一行为表头）：

| 学号 | 姓名 | 班级 |
|------|------|------|
| 20255102041107 | 刘恩伶 | 2025级数媒11班 |
| 20255102041134 | 王兰香 | 2025级数媒11班 |
| 20255102041110 | 张立锴 | 2025级数媒11班 |

## 使用说明

1. **自动加载**: 应用会自动加载 `public/名单.xlsx` 文件
2. **手动上传**: 点击右上角"上传名单"按钮可以上传新的 Excel 文件
3. **开始抽签**: 点击"开始抽签"按钮或按空格键开始抽签
4. **管理签池**: 点击"管理签池"可以查看、添加或删除学生

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion (动画)
- XLSX (Excel 读取)
- Radix UI (UI 组件)

## 快捷键

- `Space` - 快速开始抽签
