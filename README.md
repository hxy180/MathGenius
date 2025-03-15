# MathGenius | 数学问题解答系统

<div align="center">
  
[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md#mathgenius) | [![中文](https://img.shields.io/badge/语言-中文-red.svg)](README.md#mathgenius-数学问题解答系统)

</div>

---

# MathGenius

<!--
 * @author xyhou
 * @date 2025.2
-->

## Project Overview

MathGenius is an intelligent mathematical problem-solving system designed to help users solve various mathematical problems. The system features a modern web interface design, providing an intuitive interactive experience, capable of handling various types of problems from basic mathematics to advanced mathematics, and provides detailed solution steps.

## Features

- 🧮 **Intelligent Math Problem Solving**: Supports various types of mathematical problems, from basic operations to complex mathematical derivations
- 📝 **Detailed Solution Steps**: Provides clear problem-solving approaches and calculation processes
- 🎯 **Real-time Formula Rendering**: Uses MathJax for elegant mathematical formula display
- 💾 **History Function**: Automatically saves conversation history for easy access and continuation of previous questions
- 🌓 **Dark Theme**: Features an eye-friendly dark theme design for comfortable usage
- 📱 **Responsive Design**: Perfect adaptation to various device screens
- 🌊 **Streaming Output**: Real-time streaming display of model responses for better user experience

## Directory Structure

```
Mathgenius2/
├── client/                 # Frontend project directory
│   ├── src/               # Source code directory
│   │   ├── assets/       # Static resources
│   │   ├── components/   # Vue components
│   │   ├── App.vue       # Main application component
│   │   ├── main.ts       # Entry file
│   │   └── style.css     # Global styles
│   ├── index.html        # HTML template
│   ├── package.json      # Project configuration and dependencies
│   ├── tsconfig.json     # TypeScript configuration
│   └── vite.config.ts    # Vite configuration
├── server/                # Backend project directory
│   ├── src/              # Source code directory
│   │   └── index.ts      # Server entry file
│   ├── .env              # Environment variables configuration
│   ├── package.json      # Project configuration and dependencies
│   └── tsconfig.json     # TypeScript configuration
└── README.md             # Project documentation
```

## Technology Stack

### Frontend
- Vue 3 (^3.3.0) - Progressive JavaScript Framework
- TypeScript (^5.0.0) - Type-safe JavaScript superset
- Vite (^4.0.0) - Next generation frontend build tool
- MathJax (^3.2.0) - Professional mathematical formula rendering engine
- Marked (^5.0.0) - Efficient Markdown parser
- Font Awesome (^6.0.0) - Rich icon library
- EventSource API - For implementing server-sent events (SSE) streaming output

### Backend
- Node.js (>=16.0.0) - JavaScript runtime environment
- TypeScript (^5.0.0) - Type-safe development experience
- Express.js (^4.18.0) - Fast, flexible web framework
- OpenAI API - For interacting with DeepSeek model, supporting streaming output

## Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0
- Modern browsers (supporting ES6+ and EventSource API)

## Installation Steps

1. Clone the project
```bash
git clone [project URL]
cd Mathgenius2
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

4. Configure environment variables
- Create .env file in the server directory
- Add the following necessary environment variables:
  ```
  PORT=3001              # Backend server port
  NODE_ENV=development   # Running environment
  API_KEY=your_api_key   # API key (if needed)
  ```

5. Start the project

Frontend development server:
```bash
cd client
npm run dev
```

Backend server:
```bash
cd server
npm run dev
```

## Usage Instructions

1. Access the System
   - After starting the project, open your browser and visit `http://localhost:3000`
   - The system will display a welcome interface introducing the main features

2. Asking Questions
   - Enter your mathematical question in the input box
   - Supports mathematical formulas using `$` for inline formulas and `$$` for block formulas
   - Press Enter or click the send button to submit the question
   - Model responses will be displayed in real-time streaming, no need to wait for complete answers

3. View History
   - Historical conversations are displayed in the left sidebar
   - Click any historical record to view the complete conversation
   - Use the clear button at the top to clear history

4. Continue Conversation
   - Continue asking related questions in the current conversation
   - The system maintains context understanding, providing coherent answers

## Development Guidelines

- Frontend development follows Vue 3 Composition API best practices
- Uses TypeScript to ensure code type safety
- Adopts modular design for easy extension and maintenance
- Follows ESLint specifications for consistent code style
- Uses EventSource API to implement server-sent events (SSE) streaming output
- Backend uses OpenAI API's streaming output feature for real-time answer display

## Streaming Output Implementation

The system uses Server-Sent Events (SSE) technology to implement streaming output of model responses:

1. Backend Implementation:
   - Uses OpenAI API's streaming output feature
   - Sets appropriate response headers to support SSE
   - Sends model-generated content chunks to the frontend in real-time

2. Frontend Implementation:
   - Uses EventSource API to establish connection with the server
   - Receives and processes server-sent events in real-time
   - Dynamically updates interface to display model responses
   - Supports real-time rendering of mathematical formulas

3. Advantages:
   - Provides better user experience, no need to wait for complete answers
   - Reduces user waiting time, improves interaction efficiency
   - Supports smooth display of long answers

## Contributing Guidelines

Contributions, issues, and feature requests are welcome. Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

# MathGenius 数学问题解答系统

## 项目简介

MathGenius 是一个智能数学问题解答系统，旨在帮助用户解决各类数学问题。系统采用现代化的 Web 界面设计，提供直观的交互体验，能够处理从基础数学到高等数学的各类问题，并提供详细的解答步骤。

## 功能特点

- 🧮 **智能数学问题解答**：支持多种类型的数学问题，从基础运算到复杂的数学推导
- 📝 **详细解答步骤**：提供清晰的解题思路和计算过程
- 🎯 **实时渲染公式**：使用 MathJax 实现数学公式的优雅展示
- 💾 **历史记录功能**：自动保存对话历史，方便随时查看和继续之前的问题
- 🌓 **深色主题**：采用护眼的深色主题设计，提供舒适的使用体验
- 📱 **响应式设计**：完美适配各种设备屏幕
- 🌊 **流式输出**：模型回答实时流式显示，提供更好的用户体验

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
- EventSource API - 用于实现服务器发送事件(SSE)的流式输出

### 后端
- Node.js (>=16.0.0) - JavaScript 运行时环境
- TypeScript (^5.0.0) - 类型安全的开发体验
- Express.js (^4.18.0) - 快速、灵活的 Web 框架
- OpenAI API - 用于与DeepSeek模型交互，支持流式输出

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（支持ES6+和EventSource API）

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
   - 启动项目后，打开浏览器访问 `http://localhost:3000`
   - 系统会显示欢迎界面，介绍主要功能

2. 提问方式
   - 在输入框中输入您的数学问题
   - 支持输入数学公式，使用 `$` 符号包裹行内公式，`$$` 包裹独立公式
   - 按回车键或点击发送按钮提交问题
   - 模型回答会实时流式显示，无需等待完整回答生成

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
- 使用 EventSource API 实现服务器发送事件(SSE)的流式输出
- 后端使用 OpenAI API 的流式输出功能，实现实时回答显示

## 流式输出实现说明

系统使用服务器发送事件(Server-Sent Events, SSE)技术实现模型回答的流式输出：

1. 后端实现：
   - 使用 OpenAI API 的流式输出功能
   - 设置适当的响应头支持 SSE
   - 将模型生成的内容块实时发送给前端

2. 前端实现：
   - 使用 EventSource API 建立与服务器的连接
   - 实时接收和处理服务器发送的事件
   - 动态更新界面显示模型回答
   - 支持数学公式的实时渲染

3. 优势：
   - 提供更好的用户体验，无需等待完整回答
   - 减少用户等待时间，提高交互效率
   - 支持长回答的平滑显示

## 贡献指南

欢迎贡献代码，提出问题或建议。请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情