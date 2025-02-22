# MathGenius 数学问题解答系统

<!--
 * @author xyhou
 * @date 2025.2
-->

## 项目简介

MathGenius 是一个智能数学问题解答系统，旨在帮助用户解决各类数学问题。系统采用现代化的 Web 界面设计，提供直观的交互体验，能够处理从基础数学到高等数学的各类问题，并提供详细的解答步骤。

## 功能特点

- 🧮 **智能数学问题解答**：支持多种类型的数学问题，从基础运算到复杂的数学推导
- 📝 **详细解答步骤**：提供清晰的解题思路和计算过程
- 🎯 **实时渲染公式**：使用 MathJax 实现数学公式的优雅展示
- 💾 **历史记录功能**：自动保存对话历史，方便随时查看和继续之前的问题
- 🌓 **深色主题**：采用护眼的深色主题设计，提供舒适的使用体验
- 📱 **响应式设计**：完美适配各种设备屏幕

## 目录结构

```
Mathgenius2/
├── client/                 # 前端项目目录
│   ├── src/               # 源代码目录
│   │   ├── assets/       # 静态资源
│   │   ├── components/   # Vue组件
│   │   ├── App.vue       # 主应用组件
│   │   ├── main.ts       # 入口文件
│   │   └── style.css     # 全局样式
│   ├── index.html        # HTML模板
│   ├── package.json      # 项目配置和依赖
│   ├── tsconfig.json     # TypeScript配置
│   └── vite.config.ts    # Vite配置
├── server/                # 后端项目目录
│   ├── src/              # 源代码目录
│   │   └── index.ts      # 服务器入口文件
│   ├── .env              # 环境变量配置
│   ├── package.json      # 项目配置和依赖
│   └── tsconfig.json     # TypeScript配置
└── README.md             # 项目说明文档
```

## 技术栈

### 前端
- Vue 3 (^3.3.0) - 渐进式 JavaScript 框架
- TypeScript (^5.0.0) - 类型安全的 JavaScript 超集
- Vite (^4.0.0) - 下一代前端构建工具
- MathJax (^3.2.0) - 专业的数学公式渲染引擎
- Marked (^5.0.0) - 高效的 Markdown 解析器
- Font Awesome (^6.0.0) - 丰富的图标库

### 后端
- Node.js (>=16.0.0) - JavaScript 运行时环境
- TypeScript (^5.0.0) - 类型安全的开发体验
- Express.js (^4.18.0) - 快速、灵活的 Web 框架

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（支持ES6+）

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd Mathgenius2
```

2. 安装前端依赖
```bash
cd client
npm install
```

3. 安装后端依赖
```bash
cd ../server
npm install
```

4. 配置环境变量
- 在 server 目录下创建 .env 文件
- 添加以下必要的环境变量：
  ```
  PORT=3001              # 后端服务器端口
  NODE_ENV=development   # 运行环境
  API_KEY=your_api_key   # API密钥（如需要）
  ```

5. 启动项目

前端开发服务器：
```bash
cd client
npm run dev
```

后端服务器：
```bash
cd server
npm run dev
```

## 使用说明

1. 访问系统
   - 启动项目后，打开浏览器访问 `http://localhost:5173`
   - 系统会显示欢迎界面，介绍主要功能

2. 提问方式
   - 在输入框中输入您的数学问题
   - 支持输入数学公式，使用 `$` 符号包裹行内公式，`$$` 包裹独立公式
   - 按回车键或点击发送按钮提交问题

3. 查看历史记录
   - 左侧边栏显示历史对话记录
   - 点击任意历史记录可以查看完整对话内容
   - 使用顶部的清空按钮可以清除历史记录

4. 继续对话
   - 在当前对话中继续提问相关问题
   - 系统会保持上下文理解，提供连贯的回答

## 开发说明

- 前端开发遵循 Vue 3 组合式 API 的最佳实践
- 使用 TypeScript 确保代码类型安全
- 采用模块化设计，便于扩展和维护
- 遵循 ESLint 规范，保持代码风格统一

## 贡献指南

欢迎贡献代码，提出问题或建议。请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情