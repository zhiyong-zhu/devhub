# DevHub 项目结构和代码规范文档

本文档定义了 DevHub 项目的代码组织结构、编码规范和最佳实践。

---

## 📁 项目目录结构

### 完整目录树

```
DevHub/
├── src/                                    # React 前端源码
│   ├── components/                           # React 组件
│   │   ├── ui/                              # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── card.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   └── index.ts                    # 统一导出
│   │   ├── layout/                          # 布局组件
│   │   │   ├── MainLayout.tsx              # 主布局
│   │   │   ├── Sidebar.tsx                 # 侧边栏
│   │   │   ├── TabBar.tsx                  # 标签页栏
│   │   │   ├── TitleBar.tsx                # 标题栏
│   │   │   └── StatusBar.tsx              # 状态栏
│   │   ├── ssh/                             # SSH 相关组件
│   │   │   ├── SSHTerminal.tsx            # SSH 终端
│   │   │   ├── ConnectionForm.tsx         # 连接表单
│   │   │   ├── SessionManager.tsx          # 会话管理器
│   │   │   └── index.ts
│   │   ├── sftp/                            # SFTP 相关组件
│   │   │   ├── FileExplorer.tsx            # 文件浏览器
│   │   │   ├── FileList.tsx                # 文件列表
│   │   │   ├── TransferQueue.tsx            # 传输队列
│   │   │   ├── FileEditor.tsx              # 文件编辑器
│   │   │   ├── PermissionDialog.tsx        # 权限对话框
│   │   │   └── index.ts
│   │   ├── database/                        # 数据库相关组件
│   │   │   ├── SQLEditor.tsx              # SQL 编辑器
│   │   │   ├── ResultTable.tsx             # 结果表格
│   │   │   ├── DatabaseTree.tsx            # 数据库树
│   │   │   ├── TableViewer.tsx             # 表查看器
│   │   │   ├── DataEditor.tsx              # 数据编辑器
│   │   │   └── index.ts
│   │   ├── connection/                      # 连接管理组件
│   │   │   ├── ConnectionList.tsx           # 连接列表
│   │   │   ├── ConnectionCard.tsx          # 连接卡片
│   │   │   ├── ConnectionDialog.tsx        # 连接对话框
│   │   │   ├── GroupTree.tsx              # 分组树
│   │   │   └── index.ts
│   │   └── common/                          # 通用组件
│   │       ├── SearchBar.tsx               # 搜索栏
│   │       ├── LoadingSpinner.tsx          # 加载动画
│   │       ├── EmptyState.tsx              # 空状态
│   │       ├── ErrorBoundary.tsx           # 错误边界
│   │       ├── ConfirmDialog.tsx           # 确认对话框
│   │       └── index.ts
│   ├── pages/                               # 页面组件
│   │   ├── Home.tsx                        # 首页
│   │   ├── SSHPage.tsx                     # SSH 页面
│   │   ├── SFTPPage.tsx                    # SFTP 页面
│   │   ├── DatabasePage.tsx                 # 数据库页面
│   │   ├── Settings.tsx                    # 设置页面
│   │   └── index.ts
│   ├── stores/                              # Zustand 状态管理
│   │   ├── useConnectionStore.ts           # 连接状态
│   │   ├── useSSHStore.ts                 # SSH 状态
│   │   ├── useSFTPStore.ts                # SFTP 状态
│   │   ├── useDatabaseStore.ts             # 数据库状态
│   │   ├── useThemeStore.ts               # 主题状态
│   │   ├── useTabStore.ts                 # 标签页状态
│   │   └── index.ts
│   ├── hooks/                               # 自定义 Hooks
│   │   ├── useSSH.ts                      # SSH Hook
│   │   ├── useSFTP.ts                     # SFTP Hook
│   │   ├── useDatabase.ts                 # 数据库 Hook
│   │   ├── useConnection.ts               # 连接 Hook
│   │   ├── useTheme.ts                    # 主题 Hook
│   │   ├── useDebounce.ts                 # 防抖 Hook
│   │   ├── useToast.ts                    # Toast Hook
│   │   ├── useKeyboardShortcuts.ts        # 快捷键 Hook
│   │   └── index.ts
│   ├── lib/                                 # 工具函数
│   │   ├── utils.ts                       # 通用工具
│   │   ├── tauri.ts                       # Tauri 封装
│   │   ├── constants.ts                   # 常量定义
│   │   ├── crypto.ts                      # 加密工具
│   │   ├── logger.ts                      # 日志工具
│   │   ├── validation.ts                  # 验证工具
│   │   └── index.ts
│   ├── types/                               # TypeScript 类型定义
│   │   ├── connection.ts                  # 连接类型
│   │   ├── ssh.ts                         # SSH 类型
│   │   ├── sftp.ts                        # SFTP 类型
│   │   ├── database.ts                    # 数据库类型
│   │   ├── common.ts                      # 通用类型
│   │   └── index.ts
│   ├── styles/                              # 样式文件
│   │   ├── global.css                     # 全局样式
│   │   ├── animations.css                 # 动画样式
│   │   └── themes.css                     # 主题样式
│   ├── assets/                              # 静态资源
│   │   ├── icons/                         # 图标
│   │   ├── images/                        # 图片
│   │   └── fonts/                         # 字体
│   ├── App.tsx                              # 根组件
│   ├── main.tsx                             # 入口文件
│   └── index.css                            # 全局样式
├── src-tauri/                              # Rust 后端源码
│   ├── src/
│   │   ├── main.rs                         # Tauri 入口
│   │   ├── commands/                       # Tauri Commands
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs              # 连接命令
│   │   │   ├── ssh.rs                     # SSH 命令
│   │   │   ├── sftp.rs                    # SFTP 命令
│   │   │   ├── mysql.rs                   # MySQL 命令
│   │   │   ├── postgres.rs                # PostgreSQL 命令
│   │   │   ├── sqlite.rs                  # SQLite 命令
│   │   │   ├── redis.rs                   # Redis 命令
│   │   │   └── system.rs                  # 系统命令
│   │   ├── modules/                        # 业务模块
│   │   │   ├── ssh/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── client.rs              # SSH 客户端
│   │   │   │   ├── session.rs             # 会话管理
│   │   │   │   └── auth.rs                # 认证处理
│   │   │   ├── sftp/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── client.rs              # SFTP 客户端
│   │   │   │   ├── transfer.rs            # 文件传输
│   │   │   │   └── file.rs                # 文件操作
│   │   │   └── database/
│   │   │       ├── mod.rs
│   │   │       ├── mysql.rs               # MySQL 模块
│   │   │       ├── postgres.rs            # PostgreSQL 模块
│   │   │       ├── sqlite.rs              # SQLite 模块
│   │   │       └── redis.rs               # Redis 模块
│   │   ├── models/                         # 数据模型
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs             # 连接模型
│   │   │   ├── ssh.rs                    # SSH 模型
│   │   │   ├── sftp.rs                   # SFTP 模型
│   │   │   ├── database.rs               # 数据库模型
│   │   │   └── file.rs                   # 文件模型
│   │   ├── utils/                          # 工具函数
│   │   │   ├── mod.rs
│   │   │   ├── crypto.rs                 # 加密工具
│   │   │   ├── logger.rs                 # 日志工具
│   │   │   ├── error.rs                  # 错误处理
│   │   │   └── config.rs                 # 配置管理
│   │   └── error.rs                        # 错误定义
│   ├── icons/                               # 应用图标
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── icon.icns
│   │   └── icon.ico
│   ├── Cargo.toml                           # Rust 依赖
│   ├── Cargo.lock
│   ├── tauri.conf.json                      # Tauri 配置
│   └── build.rs                            # 构建脚本
├── public/                                 # 静态资源
│   ├── favicon.ico
│   └── logo.png
├── tests/                                  # 测试文件
│   ├── unit/                              # 单元测试
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/                        # 集成测试
│   │   ├── ssh.test.ts
│   │   ├── sftp.test.ts
│   │   └── database.test.ts
│   └── e2e/                               # E2E 测试
│       ├── ssh.spec.ts
│       ├── sftp.spec.ts
│       └── database.spec.ts
├── .github/                                # GitHub 配置
│   └── workflows/
│       ├── ci.yml                          # CI 配置
│       ├── release.yml                      # Release 配置
│       └── security.yml                    # 安全扫描
├── docs/                                   # 文档
│   ├── api.md                             # API 文档
│   ├── architecture.md                     # 架构文档
│   ├── user-guide.md                      # 用户指南
│   └── development.md                     # 开发指南
├── scripts/                                # 脚本
│   ├── build.sh                           # 构建脚本
│   ├── release.sh                         # 发布脚本
│   └── setup-dev.sh                       # 开发环境设置
├── .husky/                                 # Git hooks
│   ├── pre-commit                         # Pre-commit hook
│   ├── commit-msg                         # Commit-msg hook
│   └── pre-push                          # Pre-push hook
├── .vscode/                                # VSCode 配置
│   ├── settings.json                      # 编辑器设置
│   ├── extensions.json                    # 推荐扩展
│   └── launch.json                       # 调试配置
├── .idea/                                  # IDEA 配置
│   └── ...
├── package.json                            # Node.js 配置
├── pnpm-lock.yaml
├── tsconfig.json                           # TypeScript 配置
├── tsconfig.node.json
├── vite.config.ts                          # Vite 配置
├── tailwind.config.ts                      # TailwindCSS 配置
├── postcss.config.js
├── .eslintrc.cjs                          # ESLint 配置
├── .prettierrc                            # Prettier 配置
├── .gitignore
├── .env.example                            # 环境变量示例
├── README.md                               # 项目说明
├── LICENSE                                 # 开源协议
├── CHANGELOG.md                            # 更新日志
└── CONTRIBUTING.md                         # 贡献指南
```

---

## 📝 TypeScript 代码规范

### 命名约定

```typescript
// ✅ 组件命名：PascalCase
export function SSHConnectionForm() {}
export function FileExplorer() {}
export function ResultTable() {}

// ✅ 函数命名：camelCase
function connectSSH() {}
function uploadFile() {}
function handleSave() {}

// ✅ 变量命名：camelCase
const sessionId = '123'
const connectionConfig = {}
const isActive = true

// ✅ 常量命名：UPPER_SNAKE_CASE
const MAX_CONNECTIONS = 10
const DEFAULT_TIMEOUT = 30000
const SSH_PORT = 22

// ✅ 类型/接口命名：PascalCase
interface ConnectionConfig {}
type AuthMethod = 'password' | 'key'
type SSHSession = {}

// ✅ 枚举命名：PascalCase
enum TransferType {
  Upload,
  Download,
}

// ✅ React 组件 Props 接口
interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
}

// ✅ 自定义 Hook 命名：use 前缀 + camelCase
function useSSH(sessionId: string) {}
function useConnection() {}
function useDebounce() {}
```

### 文件组织

```typescript
// ✅ 组件文件结构
// 1. 类型定义
interface Props {
  // ...
}

// 2. Hook 使用
function Component({ prop1, prop2 }: Props) {
  const [state, setState] = useState()
  const { data, loading } = useHook()

  // 3. 事件处理
  const handleClick = () => {}
  const handleChange = (value: string) => {}

  // 4. 副作用
  useEffect(() => {
    // ...
  }, [])

  // 5. 渲染
  return <div>...</div>
}

// ✅ 按职责分组
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { invoke } from '@tauri-apps/api/tauri'
import type { Connection } from '@/types'

// 组件定义
export function ComponentName() {}
```

### 类型定义规范

```typescript
// ✅ 使用 interface 定义对象类型
interface Connection {
  id: string
  name: string
  host: string
  port: number
}

// ✅ 使用 type 定义联合类型、元组等
type AuthMethod = 'password' | 'key'
type ConnectionType = 'ssh' | 'mysql' | 'postgres'
type Point = [number, number]

// ✅ 接口扩展
interface SSHConnection extends Connection {
  username: string
  password?: string
}

// ✅ 泛型约束
function processData<T extends Record<string, any>>(data: T): T {
  return data
}

// ✅ 类型导出
export type { Connection, AuthMethod }
export interface DatabaseConfig {}
```

### 组件规范

```typescript
// ✅ 函数式组件
export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// ✅ 使用 TypeScript 严格模式
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// ✅ Props 解构
function Component({ prop1, prop2 }: Props) {
  // ...
}

// ✅ Props 默认值
function Component({ prop1 = 'default', prop2 = 0 }: Props) {
  // ...
}

// ✅ 条件渲染
{condition && <Component />}
{condition ? <A /> : <B />}

// ✅ 列表渲染
{items.map((item, index) => (
  <Item key={item.id} {...item} />
))}

// ✅ 事件处理
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
}
```

### Hooks 使用规范

```typescript
// ✅ 自定义 Hook 命名
function useSSH(connectionId: string) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    // ...
  }, [connectionId])

  return { connected, error }
}

// ✅ Hook 依赖数组完整
useEffect(() => {
  console.log(effect)
}, [prop1, prop2, prop3]) // ✅ 包含所有依赖

// ❌ 错误：缺少依赖
useEffect(() => {
  console.log(prop1, prop2) // ⚠️ prop2 在依赖数组中缺失
}, [prop1])

// ✅ 自定义 Hook 返回对象
function useConnection() {
  return {
    connect,
    disconnect,
    isConnected,
  }
}
```

### 状态管理规范

```typescript
// ✅ Zustand store 结构
interface ConnectionStore {
  connections: Connection[]
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: [],
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
    })),
  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),
}))

// ✅ 状态不可变性
const newState = { ...oldState, field: newValue } // ✅
newState.field = newValue // ❌ 不要直接修改
```

### 错误处理规范

```typescript
// ✅ 统一错误处理
async function handleConnect() {
  try {
    await invoke('ssh_connect', { config })
    showToast({ message: '连接成功' })
  } catch (error) {
    handleError(error)
  }
}

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : '未知错误'
  showToast({
    message,
    variant: 'destructive',
  })
}

// ✅ Tauri 错误处理
const result = await invoke('ssh_connect', { config }).catch(
  (error) => {
    console.error('连接失败:', error)
    throw new Error('无法连接到服务器')
  }
)
```

### 性能优化规范

```typescript
// ✅ React.memo 避免不必要的重渲染
export const MemoizedComponent = React.memo(Component)

// ✅ useMemo 缓存计算结果
const sortedItems = useMemo(
  () => items.sort((a, b) => a.id - b.id),
  [items]
)

// ✅ useCallback 缓存函数
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

// ✅ 虚拟滚动处理大列表
import { FixedSizeList } from 'react-window'

function LargeList() {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>{items[index].name}</div>
  )

  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={35}>
      {Row}
    </FixedSizeList>
  )
}
```

---

## 🦀 Rust 代码规范

### 命名约定

```rust
// ✅ 模块命名：snake_case
mod ssh_client;
mod database_connection;
mod file_transfer;

// ✅ 函数命名：snake_case
pub fn connect_ssh() {}
pub async fn upload_file() {}
pub fn handle_error() {}

// ✅ 变量命名：snake_case
let session_id = String::new();
let connection_config = Config::default();
let is_active = true;

// ✅ 常量命名：UPPER_SNAKE_CASE
pub const MAX_CONNECTIONS: usize = 10;
pub const DEFAULT_TIMEOUT: u64 = 30000;
pub const SSH_PORT: u16 = 22;

// ✅ 类型命名：PascalCase
pub struct SSHConfig {}
pub struct ConnectionManager {}
pub enum AuthMethod {}

// ✅ Trait 命名：PascalCase
pub trait ConnectionHandler {}
pub trait FileTransfer {}

// ✅ 关联函数：PascalCase
impl Connection {
    pub fn new() -> Self {}
    pub fn from_config(config: Config) -> Self {}
}

// ✅ 方法：snake_case
impl Connection {
    pub fn connect(&mut self) {}
    pub fn disconnect(&mut self) {}
}
```

### 文件组织

```rust
// ✅ 模块文件结构
// mod.rs
pub mod client;
pub mod session;
pub mod auth;

// client.rs
use crate::modules::ssh::auth;
use russh::client;

pub struct SSHClient {
    // ...
}

impl SSHClient {
    // ...
}
```

### 类型定义规范

```rust
// ✅ 使用 struct 定义复杂类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
}

// ✅ 使用 enum 定义联合类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthMethod {
    Password,
    Key,
}

// ✅ 使用 Option 表示可选值
pub struct Connection {
    pub password: Option<String>,  // ✅
    pub private_key: Option<String>, // ✅
}

// ❌ 不要用字符串表示可选
pub struct Connection {
    pub password: String, // ❌ 空字符串表示不存在
}
```

### 错误处理规范

```rust
// ✅ 使用 thiserror 定义自定义错误
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SSHError {
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),

    #[error("Authentication failed: {0}")]
    AuthenticationFailed(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

// ✅ Result 类型
pub async fn connect_ssh(
    config: SSHConfig,
) -> Result<String, SSHError> {
    // ...
}

// ✅ 使用 ? 运算符
pub async fn connect_ssh(
    config: SSHConfig,
) -> Result<String, SSHError> {
    let session = connect_to_server(&config.host, config.port).await?; // ✅
    authenticate(session, &config.username, &config.password).await?; // ✅
    Ok(session.id())
}

// ✅ 使用 anyhow 简化错误处理
use anyhow::Result;

pub async fn connect_ssh(config: SSHConfig) -> Result<String> {
    let session = connect_to_server(&config.host, config.port).await?;
    Ok(session.id())
}
```

### 异步编程规范

```rust
// ✅ 使用 async/await
pub async fn connect_ssh(config: SSHConfig) -> Result<String> {
    let session = client::connect(...).await?;
    Ok(session.id())
}

// ✅ 使用 tokio::spawn 启动任务
tokio::spawn(async move {
    // 后台任务
});

// ✅ 使用 join! 并发执行
use tokio::try_join;

let (result1, result2) = try_join!(
    connect_ssh(config1),
    connect_ssh(config2)
)?;

// ✅ 使用 Mutex/RwLock 保护共享状态
use tokio::sync::{Mutex, RwLock};

static SESSIONS: Lazy<RwLock<HashMap<String, Session>>> = Lazy::new(|| {
    RwLock::new(HashMap::new())
});

// 读取
let sessions = SESSIONS.read().await;
// 写入
let mut sessions = SESSIONS.write().await;
```

### Trait 定义规范

```rust
// ✅ 定义 Trait
pub trait ConnectionHandler {
    fn connect(&mut self) -> Result<(), Error>;
    fn disconnect(&mut self) -> Result<(), Error>;
    fn is_connected(&self) -> bool;
}

// ✅ 实现 Trait
impl ConnectionHandler for SSHClient {
    fn connect(&mut self) -> Result<(), Error> {
        // ...
    }

    fn disconnect(&mut self) -> Result<(), Error> {
        // ...
    }

    fn is_connected(&self) -> bool {
        // ...
    }
}
```

### 常用模式

```rust
// ✅ Builder 模式
pub struct SSHClientBuilder {
    host: Option<String>,
    port: Option<u16>,
    username: Option<String>,
}

impl SSHClientBuilder {
    pub fn new() -> Self {
        Self {
            host: None,
            port: None,
            username: None,
        }
    }

    pub fn host(mut self, host: String) -> Self {
        self.host = Some(host);
        self
    }

    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn build(self) -> Result<SSHClient, Error> {
        Ok(SSHClient {
            host: self.host.ok_or("host is required")?,
            port: self.port.unwrap_or(22),
            username: self.username.ok_or("username is required")?,
        })
    }
}

// ✅ 使用
let client = SSHClientBuilder::new()
    .host("example.com".to_string())
    .port(22)
    .username("user".to_string())
    .build()?;
```

---

## 🔒 安全规范

### TypeScript 安全

```typescript
// ✅ 使用 TypeScript 避免运行时错误
const value: string | undefined = data.value
const result = value ?? 'default' // ✅ 空值合并

// ❌ 避免使用 any
function processData(data: any) {} // ❌

// ✅ 使用 unknown 代替 any
function processData(data: unknown) {
  if (typeof data === 'string') {
    // ...
  }
}

// ✅ 类型断言要谨慎
const value = data as Connection // ⚠️ 需要确保类型正确

// ✅ 使用类型守卫
function isConnection(data: unknown): data is Connection {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

// ✅ 避免双重否定
if (!data.isEmpty()) {} // ✅
if (data.isEmpty() !== false) {} // ❌
```

### Rust 安全

```rust
// ✅ 使用安全的 API
let value = vec.get(index).ok_or("Index out of bounds")?; // ✅
let value = vec[index]; // ❌ 可能 panic

// ✅ 使用 Result 处理错误
let result = std::fs::read_to_string(path)?; // ✅
let result = std::fs::read_to_string(path).unwrap(); // ❌ 可能 panic

// ✅ 使用 Option 处理可选值
let value = map.get(&key).copied().ok_or("Key not found")?; // ✅
let value = map[&key]; // ❌ 可能 panic

// ✅ 使用 Arc/Rc 共享所有权
use std::sync::Arc;
let config = Arc::new(config);
```

---

## 📊 代码审查标准

### TypeScript 审查清单

- [ ] 所有函数都有明确的类型定义
- [ ] 没有 `any` 类型（除非必要）
- [ ] 没有 `@ts-ignore` 或 `@ts-expect-error`
- [ ] 组件有清晰的 Props 接口
- [ ] Hooks 使用正确（依赖数组完整）
- [ ] 错误处理充分
- [ ] 性能优化（大列表虚拟滚动、不必要的重渲染）
- [ ] 代码格式化（Prettier）
- [ ] ESLint 检查通过

### Rust 审查清单

- [ ] 命名符合 Rust 惯例
- [ ] 错误处理充分（Result、Option）
- [ ] 没有 `unwrap()` 或 `expect()`（除非必要）
- [ ] 异步代码正确使用 `await`
- [ ] 共享状态使用合适的同步原语
- [ ] Clippy 检查通过
- [ ] Cargo fmt 格式化
- [ ] 文档注释（pub API）

---

## 🎨 样式规范

### TailwindCSS 使用规范

```tsx
// ✅ 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ 状态样式
<button className="hover:bg-blue-600 active:bg-blue-700">

// ✅ 条件样式
<div className={isActive ? 'bg-blue-500' : 'bg-gray-500'}>

// ✅ 使用 cn 工具合并类名
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class')}>

// ✅ 避免内联样式
<div style={{ color: 'red' }}> // ❌ 避免
<div className="text-red-500"> // ✅ 推荐
```

### 主题样式

```tsx
// ✅ 使用 CSS 变量
<div className="bg-background text-foreground">

// ✅ 适配暗色主题
<div className="dark:bg-gray-900 dark:text-gray-100">

// ✅ 使用工具函数
import { getTerminalTheme } from '@/lib/theme'
<Terminal theme={getTerminalTheme()} />
```

---

## 📚 注释规范

### TypeScript 注释

```typescript
// ✅ JSDoc 注释
/**
 * 连接到 SSH 服务器
 * @param config - SSH 连接配置
 * @returns Promise<string> - 会话 ID
 * @throws Error - 连接失败时抛出错误
 */
export async function connectSSH(
  config: SSHConfig
): Promise<string> {}

// ✅ 单行注释
// 初始化 SSH 连接
const sshClient = new SSHClient()

// ✅ TODO 注释
// TODO: 添加重连逻辑
// FIXME: 处理超时情况
```

### Rust 注释

```rust
// ✅ 文档注释
/// 连接到 SSH 服务器
///
/// # Arguments
///
/// * `config` - SSH 连接配置
///
/// # Returns
///
/// 返回会话 ID
///
/// # Errors
///
/// 如果连接失败，返回错误
pub async fn connect_ssh(config: SSHConfig) -> Result<String, Error> {}

// ✅ 模块文档
//! SSH 客户端模块
//!
//! 提供 SSH 连接和会话管理功能

// ✅ 代码注释
// 初始化 SSH 客户端
let client = SSHClient::new();

// TODO: 添加重连逻辑
// FIXME: 处理超时情况
```

---

## 🧪 测试规范

### TypeScript 测试

```typescript
// ✅ 组件测试
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render button', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Rust 测试

```rust
// ✅ 单元测试
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssh_config() {
        let config = SSHConfig {
            host: "localhost".to_string(),
            port: 22,
            username: "test".to_string(),
            auth_method: AuthMethod::Password,
        };

        assert_eq!(config.port, 22);
    }

    #[tokio::test]
    async fn test_connect_ssh() {
        let result = connect_ssh(config).await;
        assert!(result.is_ok());
    }
}
```

---

## 📝 文档要求

### 代码文档

- [ ] 所有公开 API 都有文档注释
- [ ] 复杂逻辑有解释性注释
- [ ] JSDoc/TSDoc（TypeScript）
- [ ] rustdoc（Rust）

### 项目文档

- [ ] README.md（项目介绍）
- [ ] CONTRIBUTING.md（贡献指南）
- [ ] CHANGELOG.md（更新日志）
- [ ] API 文档

---

## ✅ 总结

本文档定义了 DevHub 项目的完整代码规范：

1. ✅ **项目结构** - 清晰的目录组织
2. ✅ **TypeScript 规范** - 命名、类型、组件、Hooks
3. ✅ **Rust 规范** - 命名、类型、错误处理、异步
4. ✅ **安全规范** - 类型安全、内存安全
5. ✅ **代码审查** - 审查清单
6. ✅ **样式规范** - TailwindCSS 使用
7. ✅ **注释规范** - 文档注释、代码注释
8. ✅ **测试规范** - 单元测试、集成测试

遵循这些规范，可以保证代码质量、可维护性和团队协作效率。

---

**下一步：** 阅读 [构建部署和测试流程文档](./Build_Deploy_and_Testing_Guide.md) 了解项目构建和测试流程。
