# AI 聊天室 🤖💬

一个可以让你与多个 AI 在同一个聊天室里进行对话的玩具应用。你可以连接到你的 Ollama 服务，并让不同的 AI 模型扮演不同的角色进行聊天。

## ✨ 特性 (Features)

- **TypeScript** - 强类型，提升开发体验
- **Next.js** - 全栈 React 框架
- **React Native** - 使用 React 构建移动应用
- **Expo** - React Native 开发工具集
- **TailwindCSS** - 功能优先的 CSS 框架，用于快速 UI 开发
- **shadcn/ui** - 可重用的 UI 组件
- **Hono** - 轻量、高性能的服务端框架
- **tRPC** - 端到端类型安全的 API
- **Bun** - JavaScript 运行时
- **Prisma** - TypeScript 优先的 ORM
- **SQLite/Turso** - 数据库引擎
- **Turborepo** - 优化的 monorepo 构建系统
- **Tauri** - 构建原生桌面应用

## 🚀 开始使用 (Getting Started)

首先，安装项目依赖：

```bash
bun install
```

### 数据库设置 (Database Setup)

本项目使用 SQLite 和 Prisma。

1. 启动本地 SQLite 数据库：

    ```bash
    cd apps/server && bun db:local
    ```

2. 如果需要，请更新 `apps/server` 目录下的 `.env` 文件中的数据库连接信息。

3. 生成 Prisma 客户端并推送数据库结构：

    ```bash
    bun db:push
    ```

### 启动开发服务器 (Run Development Server)

```bash
bun dev
```

- Web 应用将在 [http://localhost:3001](http://localhost:3001) 上运行。
- API 服务将在 [http://localhost:3000](http://localhost:3000) 上运行。
- 移动应用请使用 Expo Go app 运行。

## 📂 项目结构 (Project Structure)

```
ai-chat-room/
├── apps/
│   ├── web/         # 前端应用 (Next.js)
│   ├── native/      # 移动应用 (React Native, Expo)
│   └── server/      # 后端 API (Hono, tRPC)
├── packages/        # 共享包 (e.g., UI, config)
...
```

## 📜 可用脚本 (Available Scripts)

- `bun dev`: 以开发模式启动所有应用
- `bun build`: 构建所有应用
- `bun dev:web`: 仅启动 Web 应用
- `bun dev:server`: 仅启动后端服务
- `bun check-types`: 在所有应用中检查 TypeScript 类型
- `bun dev:native`: 启动 React Native/Expo 开发服务器
- `bun db:push`: 推送数据库结构变更
- `bun db:studio`: 打开数据库图形化管理界面
- `cd apps/web && bun desktop:dev`: 以开发模式启动 Tauri 桌面应用
- `cd apps/web && bun desktop:build`: 构建 Tauri 桌面应用
