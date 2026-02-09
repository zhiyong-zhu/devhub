# DevHub MVP 开发计划

> **项目名称**: DevHub - 跨平台开发运维工具
> **开发周期**: 6周（Phase 1: MVP）
> **创建时间**: 2025-02-05
> **状态**: 📝 规划中

---

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [开发阶段](#开发阶段)
  - [Phase 1: Week 1-2 - 基础框架搭建](#phase-1-week-1-2---基础框架搭建)
  - [Phase 2: Week 3-4 - 资产管理 + SSH 终端](#phase-2-week-3-4---资产管理--ssh-终端)
  - [Phase 3: Week 5-6 - SFTP 文件管理](#phase-3-week-5-6---sftp-文件管理)
- [验收标准](#验收标准)
- [风险与缓解](#风险与缓解)
- [里程碑](#里程碑)

---

## 📊 项目概述

### 目标

开发一个轻量级、高性能的跨平台桌面应用，集成数据库管理、SSH 终端、SFTP 文件传输等功能。

### 核心价值

- **轻量级**: 打包体积 < 30MB（对比 Electron 200MB+）
- **高性能**: 启动时间 < 1秒，内存占用 < 100MB
- **跨平台**: 支持 Windows、macOS、Linux
- **现代化**: Material Design 风格，暗色/亮色主题

### 目标用户

- 后端开发者
- 运维工程师
- 数据库管理员
- DevOps 工程师

---

## 🛠️ 技术栈

### 前端技术栈

```yaml
框架: React 18 + TypeScript
构建工具: Vite 5.x
UI 库: shadcn/ui (基于 Radix UI)
样式: TailwindCSS 3.x
状态管理: Zustand
路由: React Router v6
图标: Lucide React
代码编辑器: Monaco Editor (用于 SQL 编辑器)
终端组件: xterm.js (用于 SSH 终端)
```

### 后端技术栈 (Rust)

```yaml
框架: Tauri 1.5+
异步运行时: Tokio 1.x
SSH/SFTP: russh + russh-sftp
数据库驱动:
  - MySQL/MariaDB: mysql_async
  - PostgreSQL: tokio-postgres
  - SQLite: sqlx
  - Redis: redis-rs
错误处理: anyhow + thiserror
序列化: serde + serde_json
日志: tracing + tracing-subscriber
```

### 开发工具

```yaml
包管理: pnpm
代码规范: ESLint + Prettier + Biome
类型检查: TypeScript strict mode
Rust 工具: clippy + rustfmt
版本控制: Git
CI/CD: GitHub Actions
```

---

## 🗓️ 开发阶段

## Phase 1: Week 1-2 - 基础框架搭建

**优先级**: P0（必须）
**预计时间**: 10 个工作日
**目标**: 建立完整的项目框架，实现主窗口布局和主题切换

### 任务清单

#### Task 1.1: 项目初始化和环境配置

**描述**: 安装必要的开发工具和初始化 Tauri + React 项目

**预计时间**: 1 天

**具体步骤**:
1. 检查并安装 Node.js (>= 18.0.0)
2. 检查并安装 pnpm (>= 8.0.0)
3. 检查并安装 Rust (>= 1.70.0)
4. 安装 Tauri CLI: `cargo install tauri-cli`
5. 创建 Tauri + React 项目:
   ```bash
   npm create tauri-app@latest devhub
   ```
6. 选择配置:
   - Project name: devhub
   - Language: TypeScript
   - Package manager: pnpm
   - UI template: React
7. 进入项目目录: `cd devhub`
8. 安装依赖: `pnpm install`

**验收标准**:
- ✅ 所有开发工具已安装并可运行
- ✅ Tauri 项目创建成功
- ✅ `pnpm tauri dev` 可正常启动应用
- ✅ 应用窗口正常显示

**涉及文件**:
- `package.json`
- `pnpm-lock.yaml`
- `src-tauri/`
- `src/`

---

#### Task 1.2: 安装核心依赖和配置 shadcn/ui

**描述**: 安装前端核心依赖并初始化 shadcn/ui

**预计时间**: 0.5 天

**具体步骤**:
1. 安装 UI 组件库依赖:
   ```bash
   pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
            @radix-ui/react-select @radix-ui/react-tabs \
            @radix-ui/react-toast
   pnpm add class-variance-authority clsx tailwind-merge
   ```
2. 安装状态管理和路由:
   ```bash
   pnpm add zustand react-router-dom lucide-react
   ```
3. 安装终端和编辑器依赖:
   ```bash
   pnpm add xterm xterm-addon-fit xterm-addon-web-links
   pnpm add @monaco-editor/react
   ```
4. 初始化 shadcn/ui:
   ```bash
   pnpm dlx shadcn-ui@latest init
   ```
5. 添加基础 UI 组件:
   ```bash
   pnpm dlx shadcn-ui@latest add button
   pnpm dlx shadcn-ui@latest add input
   pnpm dlx shadcn-ui@latest add table
   pnpm dlx shadcn-ui@latest add tabs
   pnpm dlx shadcn-ui@latest add dialog
   pnpm dlx shadcn-ui@latest add select
   pnpm dlx shadcn-ui@latest add toast
   pnpm dlx shadcn-ui@latest add card
   pnpm dlx shadcn-ui@latest add scroll-area
   pnpm dlx shadcn-ui@latest add separator
   ```

**验收标准**:
- ✅ 所有依赖安装成功
- ✅ shadcn/ui 初始化完成
- ✅ 基础 UI 组件添加成功
- ✅ `pnpm build` 无错误

**涉及文件**:
- `package.json`
- `src/components/ui/`
- `tailwind.config.ts`
- `src/index.css`

---

#### Task 1.3: 创建项目目录结构

**描述**: 按照项目规范创建完整的目录结构

**预计时间**: 0.5 天

**具体步骤**:
1. 创建前端目录:
   ```bash
   mkdir -p src/components/{ui,layout,ssh,sftp,database,connection,common}
   mkdir -p src/{pages,stores,hooks,lib,types,styles,assets}
   ```

2. 创建后端目录:
   ```bash
   mkdir -p src-tauri/src/{commands,modules/{ssh,sftp,database},models,utils}
   mkdir -p src-tauri/{icons,}
   ```

3. 创建其他目录:
   ```bash
   mkdir -p {public,tests/{unit,integration,e2e},.github/workflows,docs,scripts}
   ```

**验收标准**:
- ✅ 所有目录创建完成
- ✅ 目录结构符合 `Project_Structure_and_Code_Standards.md` 规范
- ✅ 每个目录下都有 `index.ts` 或 `mod.rs`

**涉及文件**:
- 完整的目录结构
- 各模块的 `index.ts` 文件

---

#### Task 1.4: 配置开发工具和代码规范

**描述**: 配置 ESLint、Prettier、VSCode 等开发工具

**预计时间**: 1 天

**具体步骤**:
1. 创建 ESLint 配置 (`.eslintrc.cjs`):
   ```javascript
   module.exports = {
     root: true,
     env: { browser: true, es2020: true },
     extends: [
       'eslint:recommended',
       '@typescript-eslint/recommended',
       'prettier',
     ],
     parser: '@typescript-eslint/parser',
     plugins: ['react-refresh'],
     rules: {
       'react-refresh/only-export-components': [
         'warn',
         { allowConstantExport: true },
       ],
     },
   }
   ```

2. 创建 Prettier 配置 (`.prettierrc`):
   ```json
   {
     "semi": false,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false,
     "endOfLine": "lf"
   }
   ```

3. 创建 TypeScript 配置 (`tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

4. 创建 Vite 配置 (`vite.config.ts`):
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

5. 配置 TailwindCSS (`tailwind.config.ts`):
   参考开发文档中的完整配置

6. 创建 VSCode 配置 (`.vscode/settings.json`, `.vscode/extensions.json`)

7. 安装开发依赖:
   ```bash
   pnpm add -D @types/react @types/react-dom
   pnpm add -D @vitejs/plugin-react typescript
   pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   pnpm add -D prettier eslint-plugin-react-refresh
   pnpm add -D vitest @testing-library/react @vitest/coverage-v8
   ```

**验收标准**:
- ✅ 所有配置文件创建完成
- ✅ ESLint 检查无错误
- ✅ Prettier 格式化正常
- ✅ TypeScript 编译无错误
- ✅ 代码格式化功能正常

**涉及文件**:
- `.eslintrc.cjs`
- `.prettierrc`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `.vscode/`

---

#### Task 1.5: 实现主题切换功能

**描述**: 实现暗色/亮色主题切换和持久化

**预计时间**: 1 天

**具体步骤**:
1. 创建主题配置 (`src/lib/theme.ts`):
   ```typescript
   import { create } from 'zustand'
   import { persist } from 'zustand/middleware'

   type Theme = 'dark' | 'light' | 'system'

   interface ThemeStore {
     theme: Theme
     setTheme: (theme: Theme) => void
   }

   export const useThemeStore = create<ThemeStore>()(
     persist(
       (set) => ({
         theme: 'system',
         setTheme: (theme) => {
           set({ theme })
           applyTheme(theme)
         },
       }),
       { name: 'devhub-theme' }
     )
   )

   export function applyTheme(theme: Theme) {
     const root = window.document.documentElement
     root.classList.remove('light', 'dark')

     if (theme === 'system') {
       const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
         ? 'dark'
         : 'light'
       root.classList.add(systemTheme)
     } else {
       root.classList.add(theme)
     }
   }
   ```

2. 创建全局样式 (`src/index.css`):
   - 添加 CSS 变量（亮色和暗色主题）
   - 定义 Tailwind 主题映射
   - 添加自定义滚动条样式

3. 在 `main.tsx` 中初始化主题

4. 创建主题切换组件 (`src/components/common/ThemeToggle.tsx`)

**验收标准**:
- ✅ 主题切换功能正常
- ✅ 主题持久化到 localStorage
- ✅ 跟随系统主题功能正常
- ✅ 所有组件支持暗色/亮色模式

**涉及文件**:
- `src/lib/theme.ts`
- `src/index.css`
- `src/main.tsx`
- `src/components/common/ThemeToggle.tsx`

---

#### Task 1.6: 实现主窗口布局

**描述**: 实现侧边栏、内容区、标签页、状态栏等主布局

**预计时间**: 2 天

**具体步骤**:
1. 创建 Sidebar 组件 (`src/components/layout/Sidebar.tsx`):
   - 连接列表
   - 分组树
   - 搜索栏
   - 设置入口

2. 创建 TabBar 组件 (`src/components/layout/TabBar.tsx`):
   - 多标签页显示
   - 标签页切换
   - 标签页关闭
   - 标签页拖拽（可选）

3. 创建 StatusBar 组件 (`src/components/layout/StatusBar.tsx`):
   - 显示连接状态
   - 显示版本信息
   - 主题切换按钮

4. 创建 MainLayout 组件 (`src/components/layout/MainLayout.tsx`):
   - 组合 Sidebar、TabBar、StatusBar
   - 实现响应式布局
   - 处理窗口大小变化

5. 创建 TitleBar 组件 (`src/components/layout/TitleBar.tsx`):
   - 自定义标题栏（可选）

6. 在 `App.tsx` 中集成主布局

**验收标准**:
- ✅ 侧边栏正常显示和折叠
- ✅ 标签页功能完整（添加、切换、关闭）
- ✅ 状态栏信息正确显示
- ✅ 布局响应式适配正常
- ✅ 窗口大小变化时布局正常调整

**涉及文件**:
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TabBar.tsx`
- `src/components/layout/StatusBar.tsx`
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/TitleBar.tsx`
- `src/App.tsx`

---

#### Task 1.7: 配置 Rust 后端基础架构

**描述**: 配置 Tauri Rust 后端的基础架构和依赖

**预计时间**: 1.5 天

**具体步骤**:
1. 配置 Cargo.toml:
   ```toml
   [dependencies]
   tauri = { version = "1.5", features = ["shell-open", "dialog-all", "fs-all", "path-all"] }
   serde = { version = "1.0", features = ["derive"] }
   serde_json = "1.0"
   tokio = { version = "1", features = ["full"] }
   russh = "0.40"
   russh-keys = "0.40"
   russh-sftp = "2.0"
   mysql_async = "0.32"
   tokio-postgres = "0.7"
   sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio-native-tls"] }
   redis = { version = "0.24", features = ["tokio-comp", "connection-manager"] }
   anyhow = "1.0"
   thiserror = "1.0"
   uuid = { version = "1.6", features = ["v4", "serde"] }
   tracing = "0.1"
   tracing-subscriber = { version = "0.3", features = ["env-filter"] }
   chrono = { version = "0.4", features = ["serde"] }
   once_cell = "1.18"
   ```

2. 创建模块结构:
   - `src-tauri/src/commands/mod.rs` - Tauri Commands
   - `src-tauri/src/modules/ssh/mod.rs` - SSH 模块
   - `src-tauri/src/modules/sftp/mod.rs` - SFTP 模块
   - `src-tauri/src/modules/database/mod.rs` - 数据库模块
   - `src-tauri/src/models/mod.rs` - 数据模型
   - `src-tauri/src/utils/mod.rs` - 工具函数
   - `src-tauri/src/error.rs` - 错误定义

3. 配置 Tauri (`src-tauri/tauri.conf.json`):
   - 设置窗口属性（title, width, height, minWidth, minHeight）
   - 配置 allowlist
   - 配置 bundle 信息

4. 创建基础错误类型 (`src-tauri/src/error.rs`):
   ```rust
   use thiserror::Error;

   #[derive(Error, Debug)]
   pub enum DevHubError {
       #[error("SSH connection failed: {0}")]
       SshConnectionFailed(String),

       #[error("Database query failed: {0}")]
       DatabaseQueryFailed(String),

       #[error("File operation failed: {0}")]
       FileOperationFailed(String),
   }

   impl From<DevHubError> for String {
       fn from(err: DevHubError) -> String {
           err.to_string()
       }
   }
   ```

5. 创建基础命令示例 (`src-tauri/src/commands/mod.rs`):
   ```rust
   #[tauri::command]
   pub async fn greet(name: &str) -> String {
       format!("Hello, {}! You've been greeted from Rust!", name)
   }
   ```

**验收标准**:
- ✅ Cargo.toml 配置正确，依赖可正常下载
- ✅ 模块结构创建完整
- ✅ Tauri 配置正确
- ✅ 基础命令可调用
- ✅ `pnpm tauri dev` 正常运行

**涉及文件**:
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/modules/`
- `src-tauri/src/error.rs`
- `src-tauri/tauri.conf.json`

---

### Phase 1 总结

**预计总时间**: 7.5 天
**关键交付物**:
- ✅ 完整的项目结构和配置
- ✅ 可运行的开发环境
- ✅ 主窗口布局完整
- ✅ 主题切换功能正常
- ✅ Rust 后端基础架构就绪

---

## Phase 2: Week 3-4 - 资产管理 + SSH 终端

**优先级**: P0（必须）
**预计时间**: 10 个工作日
**目标**: 实现连接配置管理和 SSH 终端功能

### Task 2.1: 资产管理数据模型设计

**描述**: 设计和实现连接配置的数据模型

**预计时间**: 1 天

**具体步骤**:
1. 创建 TypeScript 类型定义 (`src/types/connection.ts`):
   ```typescript
   export interface Connection {
     id: string
     name: string
     type: ConnectionType
     group_id?: string
     config: SSHConfig | DatabaseConfig
     created_at: string
     updated_at: string
   }

   export type ConnectionType = 'ssh' | 'mysql' | 'postgresql' | 'redis' | 'sqlite'

   export interface Group {
     id: string
     name: string
     parent_id?: string
     icon?: string
   }

   export interface SSHConfig {
     host: string
     port: number
     username: string
     auth_method: 'password' | 'key'
     password?: string
     private_key_path?: string
     passphrase?: string
     jump_host?: JumpHostConfig
   }

   export interface DatabaseConfig {
     host: string
     port: number
     username: string
     password: string
     database?: string
     ssl?: boolean
   }

   export interface JumpHostConfig {
     host: string
     port: number
     username: string
     auth_method: 'password' | 'key'
     password?: string
     private_key_path?: string
   }
   ```

2. 创建 Rust 结构体 (`src-tauri/src/models/connection.rs`):
   ```rust
   use serde::{Deserialize, Serialize};

   #[derive(Debug, Clone, Serialize, Deserialize)]
   pub struct Connection {
       pub id: String,
       pub name: String,
       pub r#type: ConnectionType,
       pub group_id: Option<String>,
       pub config: Config,
       pub created_at: String,
       pub updated_at: String,
   }

   #[derive(Debug, Clone, Serialize, Deserialize)]
   #[serde(rename_all = "lowercase")]
   pub enum ConnectionType {
       Ssh,
       Mysql,
       Postgresql,
       Redis,
       Sqlite,
   }

   #[derive(Debug, Clone, Serialize, Deserialize)]
   #[serde(untagged)]
   pub enum Config {
       Ssh(SSHConfig),
       Database(DatabaseConfig),
   }
   ```

**验收标准**:
- ✅ 所有类型定义完整
- ✅ TypeScript 和 Rust 类型一致
- ✅ 支持所有连接类型

**涉及文件**:
- `src/types/connection.ts`
- `src-tauri/src/models/connection.rs`

---

#### Task 2.2: 资产管理后端实现

**描述**: 实现连接配置的 CRUD 操作和持久化存储

**预计时间**: 2 天

**具体步骤**:
1. 创建 SQLite 数据库模块 (`src-tauri/src/modules/database/mod.rs`):
   - 初始化数据库
   - 创建连接表
   - 创建分组表

2. 实现连接管理命令 (`src-tauri/src/commands/connection.rs`):
   ```rust
   use tauri::command;

   #[tauri::command]
   pub async fn create_connection(connection: Connection) -> Result<String, String>;

   #[tauri::command]
   pub async fn update_connection(id: String, connection: Connection) -> Result<(), String>;

   #[tauri::command]
   pub async fn delete_connection(id: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn list_connections(group_id: Option<String>) -> Result<Vec<Connection>, String>;

   #[tauri::command]
   pub async fn export_connections() -> Result<String, String>;

   #[tauri::command]
   pub async fn import_connections(json: String) -> Result<(), String>;
   ```

3. 实现加密工具 (`src-tauri/src/utils/crypto.rs`):
   - 密码加密（AES-256）
   - 密码解密

**验收标准**:
- ✅ 数据库初始化成功
- ✅ 所有 CRUD 操作正常
- ✅ 数据持久化正常
- ✅ 密码加密安全
- ✅ 导入/导出功能正常

**涉及文件**:
- `src-tauri/src/modules/database/mod.rs`
- `src-tauri/src/commands/connection.rs`
- `src-tauri/src/utils/crypto.rs`

---

#### Task 2.3: 资产管理 UI 组件

**描述**: 实现连接管理的 UI 界面

**预计时间**: 2 天

**具体步骤**:
1. 创建 Zustand store (`src/stores/useConnectionStore.ts`):
   ```typescript
   import { create } from 'zustand'

   interface ConnectionStore {
     connections: Connection[]
     selectedConnection: Connection | null
     addConnection: (connection: Connection) => void
     updateConnection: (id: string, connection: Connection) => void
     deleteConnection: (id: string) => void
     setSelectedConnection: (connection: Connection | null) => void
   }

   export const useConnectionStore = create<ConnectionStore>((set) => ({
     connections: [],
     selectedConnection: null,
     addConnection: (connection) =>
       set((state) => ({
         connections: [...state.connections, connection],
       })),
     updateConnection: (id, connection) =>
       set((state) => ({
         connections: state.connections.map((c) =>
           c.id === id ? connection : c
         ),
       })),
     deleteConnection: (id) =>
       set((state) => ({
         connections: state.connections.filter((c) => c.id !== id),
       })),
     setSelectedConnection: (connection) =>
       set({ selectedConnection: connection }),
   }))
   ```

2. 创建 ConnectionList 组件 (`src/components/connection/ConnectionList.tsx`)

3. 创建 ConnectionCard 组件 (`src/components/connection/ConnectionCard.tsx`)

4. 创建 ConnectionDialog 组件 (`src/components/connection/ConnectionDialog.tsx`):
   - 连接表单
   - 连接类型选择
   - 配置表单（动态）

5. 创建 GroupTree 组件 (`src/components/connection/GroupTree.tsx`)

**验收标准**:
- ✅ 连接列表正常显示
- ✅ 可以添加新连接
- ✅ 可以编辑和删除连接
- ✅ 分组功能正常
- ✅ 搜索过滤正常
- ✅ 表单验证正常

**涉及文件**:
- `src/stores/useConnectionStore.ts`
- `src/components/connection/ConnectionList.tsx`
- `src/components/connection/ConnectionCard.tsx`
- `src/components/connection/ConnectionDialog.tsx`
- `src/components/connection/GroupTree.tsx`

---

#### Task 2.4: SSH 后端模块实现

**描述**: 实现 SSH 连接和会话管理

**预计时间**: 3 天

**具体步骤**:
1. 创建 SSH 客户端模块 (`src-tauri/src/modules/ssh/client.rs`):
   - SSH 连接
   - 密码认证
   - 密钥认证
   - Session 管理

2. 实现 SSH 命令 (`src-tauri/src/commands/ssh.rs`):
   ```rust
   use tauri::command;

   #[tauri::command]
   pub async fn ssh_connect(config: SSHConfig) -> Result<String, String>;

   #[tauri::command]
   pub async fn ssh_write(session_id: String, data: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn ssh_disconnect(session_id: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn ssh_resize(session_id: String, cols: u16, rows: u16) -> Result<(), String>;
   ```

3. 实现全局 session 管理:
   - 使用 Arc<Mutex<HashMap>> 存储活跃 session
   - Session ID 使用 UUID

4. 配置 Tauri Events:
   - `ssh-data` - 从后端向前端发送终端数据
   - `ssh-disconnect` - 连接断开通知

**验收标准**:
- ✅ 可以成功建立 SSH 连接
- ✅ 密码认证正常
- ✅ 密钥认证正常
- ✅ Session 管理正常
- ✅ 数据传输正常
- ✅ 断开连接正常

**涉及文件**:
- `src-tauri/src/modules/ssh/client.rs`
- `src-tauri/src/modules/ssh/session.rs`
- `src-tauri/src/commands/ssh.rs`

---

#### Task 2.5: SSH 终端前端组件

**描述**: 集成 xterm.js 实现 SSH 终端交互

**预计时间**: 3 天

**具体步骤**:
1. 创建 Zustand store (`src/stores/useSSHStore.ts`):
   ```typescript
   interface SSHStore {
     sessions: Map<string, SSHSession>
     activeSessionId: string | null
     addSession: (id: string, session: SSHSession) => void
     removeSession: (id: string) => void
     setActiveSession: (id: string | null) => void
   }
   ```

2. 创建 SSHTerminal 组件 (`src/components/ssh/SSHTerminal.tsx`):
   - 集成 xterm.js
   - 集成 xterm-addon-fit
   - 监听后端数据
   - 发送用户输入
   - 处理窗口大小变化

3. 创建 ConnectionForm 组件 (`src/components/ssh/ConnectionForm.tsx`):
   - SSH 连接表单
   - 认证方式选择
   - 密钥文件选择

4. 创建 SessionManager 组件 (`src/components/ssh/SessionManager.tsx`):
   - 管理多个 SSH session
   - 标签页管理

5. 集成到主布局

**验收标准**:
- ✅ xterm.js 终端正常显示
- ✅ 可以输入命令并查看输出
- ✅ ANSI 颜色正常显示
- ✅ 支持多标签页
- ✅ 终端大小自适应
- ✅ 复制粘贴功能正常
- ✅ 命令历史记录（可选）

**涉及文件**:
- `src/stores/useSSHStore.ts`
- `src/components/ssh/SSHTerminal.tsx`
- `src/components/ssh/ConnectionForm.tsx`
- `src/components/ssh/SessionManager.tsx`

---

### Phase 2 总结

**预计总时间**: 11 天
**关键交付物**:
- ✅ 连接配置管理功能完整
- ✅ SSH 连接功能正常
- ✅ SSH 终端交互流畅
- ✅ 支持多标签页
- ✅ 数据持久化正常

---

## Phase 3: Week 5-6 - SFTP 文件管理

**优先级**: P1（重要）
**预计时间**: 10 个工作日
**目标**: 实现远程文件管理功能

### Task 3.1: SFTP 后端模块实现

**描述**: 实现 SFTP 文件操作功能

**预计时间**: 4 天

**具体步骤**:
1. 创建 SFTP 客户端模块 (`src-tauri/src/modules/sftp/client.rs`):
   - 基于 SSH session 创建 SFTP session
   - 文件列表
   - 文件上传
   - 文件下载
   - 文件删除
   - 文件重命名
   - 文件权限管理

2. 实现传输队列管理:
   - 使用 Arc<Mutex<HashMap>> 存储传输任务
   - 支持并发传输
   - 进度跟踪

3. 实现 SFTP 命令 (`src-tauri/src/commands/sftp.rs`):
   ```rust
   use tauri::command;

   #[tauri::command]
   pub async fn sftp_list_dir(ssh_session_id: String, path: String) -> Result<Vec<FileItem>, String>;

   #[tauri::command]
   pub async fn sftp_upload(ssh_session_id: String, local_path: String, remote_path: String) -> Result<String, String>;

   #[tauri::command]
   pub async fn sftp_download(ssh_session_id: String, remote_path: String, local_path: String) -> Result<String, String>;

   #[tauri::command]
   pub async fn sftp_delete(ssh_session_id: String, path: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn sftp_rename(ssh_session_id: String, old_path: String, new_path: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn sftp_chmod(ssh_session_id: String, path: String, mode: String) -> Result<(), String>;

   #[tauri::command]
   pub async fn sftp_read_file(ssh_session_id: String, path: String) -> Result<String, String>;

   #[tauri::command]
   pub async fn sftp_write_file(ssh_session_id: String, path: String, content: String) -> Result<(), String>;
   ```

4. 配置 Tauri Events:
   - `sftp-progress` - 传输进度更新
   - `sftp-complete` - 传输完成
   - `sftp-error` - 传输错误

**验收标准**:
- ✅ 可以浏览远程文件系统
- ✅ 文件上传功能正常
- ✅ 文件下载功能正常
- ✅ 文件删除功能正常
- ✅ 文件重命名功能正常
- ✅ 文件权限管理正常
- ✅ 传输进度显示正常

**涉及文件**:
- `src-tauri/src/modules/sftp/client.rs`
- `src-tauri/src/modules/sftp/transfer.rs`
- `src-tauri/src/commands/sftp.rs`

---

#### Task 3.2: SFTP 文件管理器 UI

**描述**: 实现双面板文件管理器界面

**预计时间**: 4 天

**具体步骤**:
1. 创建 Zustand store (`src/stores/useSFTPStore.ts`):
   ```typescript
   interface SFTPStore {
     transfers: TransferTask[]
     addTransfer: (transfer: TransferTask) => void
     updateTransfer: (id: string, progress: number) => void
     removeTransfer: (id: string) => void
   }
   ```

2. 创建 FileExplorer 组件 (`src/components/sftp/FileExplorer.tsx`):
   - 文件列表
   - 路径导航
   - 文件操作（右键菜单）

3. 创建 FileList 组件 (`src/components/sftp/FileList.tsx`):
   - 文件项显示
   - 图标显示
   - 文件信息

4. 创建 TransferQueue 组件 (`src/components/sftp/TransferQueue.tsx`):
   - 传输列表
   - 进度条
   - 传输控制（暂停/取消）

5. 创建 FileEditor 组件 (`src/components/sftp/FileEditor.tsx`):
   - Monaco Editor 集成
   - 文件保存
   - 语法高亮

6. 创建 PermissionDialog 组件 (`src/components/sftp/PermissionDialog.tsx`):
   - 权限编辑
   - chmod 计算

7. 实现拖拽上传

**验收标准**:
- ✅ 文件列表正常显示
- ✅ 文件图标正确显示
- ✅ 路径导航正常
- ✅ 可以上传文件（拖拽）
- ✅ 可以下载文件
- ✅ 传输进度正常显示
- ✅ 文件编辑功能正常
- ✅ 权限管理功能正常

**涉及文件**:
- `src/stores/useSFTPStore.ts`
- `src/components/sftp/FileExplorer.tsx`
- `src/components/sftp/FileList.tsx`
- `src/components/sftp/TransferQueue.tsx`
- `src/components/sftp/FileEditor.tsx`
- `src/components/sftp/PermissionDialog.tsx`

---

### Phase 3 总结

**预计总时间**: 8 天
**关键交付物**:
- ✅ SFTP 文件管理功能完整
- ✅ 文件上传下载正常
- ✅ 拖拽上传功能正常
- ✅ 文件编辑功能正常
- ✅ 权限管理功能正常

---

## ✅ 验收标准

### 功能完整性

| 类别 | 标准 | 验证方式 |
|------|------|----------|
| **P0 功能** | 100% 完成 | 功能测试通过 |
| **P1 功能** | 80% 完成 | 功能测试通过 |
| 基础框架 | 应用启动、主题切换、布局正常 | 手动测试 |
| 资产管理 | 连接 CRUD、分组、搜索、导入导出 | 手动测试 + 单元测试 |
| SSH 终端 | 连接、终端交互、多标签页 | 手动测试 + 集成测试 |
| SFTP 文件管理 | 文件浏览、上传下载、编辑、权限 | 手动测试 + 集成测试 |

### 质量标准

| 指标 | 目标 | 验证方式 |
|------|------|----------|
| 单元测试覆盖率 | > 70% | 覆盖率报告 |
| 严重 Bug | 0 | Bug 追踪系统 |
| 代码规范 | 100% 通过 | ESLint + clippy |
| TypeScript 编译 | 无错误 | tsc 检查 |
| Rust 编译 | 无警告 | cargo clippy |

### 性能指标

| 指标 | 目标 | 验证方式 |
|------|------|----------|
| 应用启动时间 | < 1秒 | 性能测试 |
| 内存占用（空载） | < 100MB | 性能监控 |
| 打包体积 | < 30MB | 构建产物检查 |
| SSH 终端延迟 | < 50ms | 网络测试 |
| 文件传输速度 | > 10MB/s | 传输测试 |

### 兼容性

| 平台 | 要求 | 验证方式 |
|------|------|----------|
| Windows 10+ | 正常运行 | 平台测试 |
| macOS 10.15+ | 正常运行 | 平台测试 |
| Ubuntu 18.04+ | 正常运行 | 平台测试 |

---

## ⚠️ 风险与缓解

### 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Rust 学习曲线陡 | 开发效率降低 | 预留学习时间、参考文档、咨询专家 |
| SSH 连接稳定性 | 用户体验差 | 重连机制、错误处理、连接超时 |
| xterm.js 集成复杂度 | 开发延期 | 参考 Tabby 项目、使用官方示例 |
| Tauri 权限配置 | 功能受限 | 仔细阅读文档、测试验证 |

### 时间风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 功能范围过大 | 无法按时交付 | 优先级管理、分阶段交付 |
| 未知技术问题 | 开发延期 | 预留缓冲时间、备用方案 |
| 测试不充分 | Bug 较多 | 持续测试、自动化测试 |

### 缓解策略

1. **每日站会**: 同步进度、识别风险
2. **技术预研**: 关键技术提前验证
3. **MVP 优先**: 先完成核心功能
4. **增量交付**: 每周交付可演示的版本
5. **代码审查**: 定期代码审查保证质量

---

## 🎯 里程碑

### Week 1-2 里程碑

**目标**: 基础框架搭建完成

**交付物**:
- ✅ 可运行的开发环境
- ✅ 主窗口布局完整
- ✅ 主题切换功能
- ✅ Rust 后端基础架构

**演示**:
1. 启动应用，展示主窗口布局
2. 演示主题切换功能
3. 展示侧边栏折叠/展开
4. 展示标签页功能

---

### Week 3-4 里程碑

**目标**: 资产管理 + SSH 终端完成

**交付物**:
- ✅ 连接配置管理功能
- ✅ SSH 连接功能
- ✅ SSH 终端交互

**演示**:
1. 添加 SSH 连接配置
2. 连接到 SSH 服务器
3. 在终端中执行命令
4. 演示多标签页
5. 导出连接配置

---

### Week 5-6 里程碑

**目标**: SFTP 文件管理完成

**交付物**:
- ✅ SFTP 文件管理功能
- ✅ 文件上传下载
- ✅ 文件编辑

**演示**:
1. 连接到 SFTP
2. 浏览远程文件
3. 上传文件（拖拽）
4. 下载文件
5. 编辑远程文件
6. 修改文件权限

---

### MVP 发布里程碑

**目标**: MVP 版本可发布

**交付物**:
- ✅ 所有 P0 功能完成
- ✅ 通过所有测试
- ✅ 性能指标达标
- ✅ 跨平台打包成功

**发布**:
1. 打包 Windows、macOS、Linux 版本
2. 创建 GitHub Release
3. 发布安装包
4. 更新文档

---

## 📅 每周计划

### Week 1: 项目初始化

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1 | Task 1.1: 项目初始化和环境配置 | - | ⏳ |
| Day 2 | Task 1.2: 安装依赖和配置 shadcn/ui | - | ⏳ |
| Day 3 | Task 1.3: 创建项目目录结构 | - | ⏳ |
| Day 4 | Task 1.4: 配置开发工具和代码规范 | - | ⏳ |
| Day 5 | Task 1.5: 实现主题切换功能 | - | ⏳ |

### Week 2: 主窗口布局

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1-2 | Task 1.6: 实现主窗口布局 | - | ⏳ |
| Day 3 | Task 1.7: 配置 Rust 后端基础架构 | - | ⏳ |
| Day 4-5 | 集成测试和 Bug 修复 | - | ⏳ |

### Week 3: 资产管理

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1 | Task 2.1: 资产管理数据模型设计 | - | ⏳ |
| Day 2-3 | Task 2.2: 资产管理后端实现 | - | ⏳ |
| Day 4-5 | Task 2.3: 资产管理 UI 组件 | - | ⏳ |

### Week 4: SSH 终端

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1-3 | Task 2.4: SSH 后端模块实现 | - | ⏳ |
| Day 3-5 | Task 2.5: SSH 终端前端组件 | - | ⏳ |

### Week 5: SFTP 后端

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1-4 | Task 3.1: SFTP 后端模块实现 | - | ⏳ |
| Day 5 | 集成测试 | - | ⏳ |

### Week 6: SFTP 前端

| 天 | 任务 | 负责人 | 状态 |
|---|------|--------|------|
| Day 1-4 | Task 3.2: SFTP 文件管理器 UI | - | ⏳ |
| Day 5 | 集成测试和 Bug 修复 | - | ⏳ |

---

## 📝 备注

### 技术要点

1. **Rust 异步编程**: 使用 Tokio 运行时，注意 async/await 的正确使用
2. **错误处理**: 统一使用 Result 类型，避免 panic
3. **类型安全**: TypeScript 严格模式，Rust 类型推导
4. **性能优化**: 前端虚拟滚动，后端连接池
5. **安全性**: 密码加密存储，私钥文件权限检查

### 开发规范

1. **Git 提交**: 遵循 Conventional Commits 规范
2. **代码审查**: 所有 PR 需要审查
3. **测试覆盖**: 单元测试覆盖率 > 70%
4. **文档更新**: 代码变更同步更新文档

### 参考资源

- [DevHub_Requirements.md](./DevHub_Requirements.md) - 完整需求文档
- [DevHub_Implementation_Guide.md](./DevHub_Implementation_Guide.md) - 项目初始化指南
- [Core_Features_Development_Guide.md](./Core_Features_Development_Guide.md) - 核心功能开发
- [Project_Structure_and_Code_Standards.md](./Project_Structure_and_Code_Standards.md) - 项目结构规范
- [Build_Deploy_and_Testing_Guide.md](./Build_Deploy_and_Testing_Guide.md) - 构建测试流程
- [Development_Tools_and_Best_Practices.md](./Development_Tools_and_Best_Practices.md) - 开发工具指南

---

## 📞 联系方式

如有问题或需要调整计划，请联系：

- **项目负责人**: [待定]
- **邮箱**: [待定]
- **GitHub**: [待定]

---

**文档版本**: v1.0
**最后更新**: 2025-02-05
