# DevHub - 跨平台开发运维工具需求文档

## 📋 项目概述

### 项目名称
DevHub - 面向开发者和运维人员的一站式工具

### 项目目标
开发一个轻量级、高性能的跨平台桌面应用，集成数据库管理、SSH终端、SFTP文件传输等功能，类似 DBeaver + Tabby 的组合工具。

### 目标用户
- 后端开发者
- 运维工程师
- 数据库管理员
- DevOps 工程师

### 核心价值
- **轻量级**：打包体积 < 30MB（对比 Electron 200MB+）
- **高性能**：启动时间 < 1秒，内存占用 < 100MB
- **跨平台**：支持 Windows、macOS、Linux
- **现代化**：Material Design 风格，暗色/亮色主题

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

## 🎯 功能需求

### Phase 1: MVP (最小可行产品) - 第1-2个月

#### 1.1 基础框架搭建
**优先级：P0（必须）**

**功能描述：**
- 初始化 Tauri + React 项目结构
- 配置 shadcn/ui + TailwindCSS
- 实现主窗口布局（侧边栏 + 内容区 + 标签页）
- 实现暗色/亮色主题切换
- 配置 Rust 后端基础架构

**技术要求：**
```typescript
// 目录结构
src/
  ├── components/       # React 组件
  │   ├── ui/          # shadcn/ui 组件
  │   ├── layout/      # 布局组件
  │   └── common/      # 通用组件
  ├── pages/           # 页面
  ├── stores/          # Zustand 状态管理
  ├── hooks/           # 自定义 Hooks
  ├── lib/             # 工具函数
  └── types/           # TypeScript 类型定义

src-tauri/
  ├── src/
  │   ├── main.rs      # 入口文件
  │   ├── commands/    # Tauri Commands
  │   ├── ssh/         # SSH 模块
  │   ├── database/    # 数据库模块
  │   └── utils/       # 工具函数
  └── Cargo.toml
```

**验收标准：**
- ✅ 应用能够启动并显示主界面
- ✅ 主题切换功能正常
- ✅ 侧边栏和标签页布局完整
- ✅ 打包体积 < 10MB

---

#### 1.2 资产管理
**优先级：P0（必须）**

**功能描述：**
- 支持添加/编辑/删除连接配置
- 支持分组管理（文件夹结构）
- 支持搜索过滤
- 本地存储（SQLite）
- 支持导入/导出配置（JSON 格式）

**数据模型：**
```typescript
interface Connection {
  id: string;
  name: string;
  type: 'ssh' | 'mysql' | 'postgresql' | 'redis' | 'sqlite';
  group_id?: string;
  config: SSHConfig | DatabaseConfig;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  name: string;
  parent_id?: string;
  icon?: string;
}

interface SSHConfig {
  host: string;
  port: number;
  username: string;
  auth_method: 'password' | 'key';
  password?: string;
  private_key_path?: string;
  jump_host?: JumpHostConfig;
}

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  ssl?: boolean;
}
```

**Rust Commands：**
```rust
#[tauri::command]
async fn create_connection(connection: Connection) -> Result<String, String>;

#[tauri::command]
async fn update_connection(id: String, connection: Connection) -> Result<(), String>;

#[tauri::command]
async fn delete_connection(id: String) -> Result<(), String>;

#[tauri::command]
async fn list_connections(group_id: Option<String>) -> Result<Vec<Connection>, String>;

#[tauri::command]
async fn export_connections() -> Result<String, String>;

#[tauri::command]
async fn import_connections(json: String) -> Result<(), String>;
```

**UI 组件：**
- ConnectionList (连接列表)
- ConnectionForm (连接表单)
- GroupTree (分组树)
- SearchBar (搜索栏)

**验收标准：**
- ✅ 能够添加/编辑/删除连接
- ✅ 支持分组和搜索
- ✅ 配置能够持久化存储
- ✅ 导入/导出功能正常

---

#### 1.3 SSH 终端
**优先级：P0（必须）**

**功能描述：**
- SSH 连接（密码认证 + 密钥认证）
- 实时终端交互（基于 xterm.js）
- 支持多标签页
- 支持跳板机（Jump Host）
- 命令历史记录
- 支持复制粘贴
- 支持 ANSI 颜色

**技术实现：**
```rust
// Rust 后端
use russh::*;
use russh_keys::*;
use tokio::sync::mpsc;

pub struct SSHSession {
    session: client::Handle<Client>,
    channel: Option<Channel<Msg>>,
}

#[tauri::command]
async fn ssh_connect(config: SSHConfig) -> Result<String, String> {
    // 创建 SSH 连接
    // 返回 session_id
}

#[tauri::command]
async fn ssh_write(session_id: String, data: String) -> Result<(), String> {
    // 向终端写入数据
}

#[tauri::command]
async fn ssh_disconnect(session_id: String) -> Result<(), String> {
    // 关闭 SSH 连接
}
```

```typescript
// React 前端
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

export function SSHTerminal({ connectionId }: { connectionId: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>();
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current!);
    fitAddon.fit();

    xtermRef.current = term;

    // 连接 SSH
    connectSSH();

    // 监听后端数据
    const unlisten = listen<string>('ssh-data', (event) => {
      term.write(event.payload);
    });

    // 监听用户输入
    term.onData((data) => {
      if (sessionId) {
        invoke('ssh_write', { sessionId, data });
      }
    });

    return () => {
      unlisten.then((fn) => fn());
      term.dispose();
    };
  }, []);

  const connectSSH = async () => {
    const id = await invoke<string>('ssh_connect', { 
      config: getConnectionConfig(connectionId) 
    });
    setSessionId(id);
  };

  return <div ref={terminalRef} className="h-full w-full" />;
}
```

**验收标准：**
- ✅ 能够成功连接 SSH 服务器
- ✅ 终端交互流畅，无明显延迟
- ✅ 支持密码和密钥认证
- ✅ 支持多标签页同时连接
- ✅ 复制粘贴功能正常

---

#### 1.4 SFTP 文件管理
**优先级：P1（重要）**

**功能描述：**
- 双面板文件管理器（本地 + 远程）
- 文件/文件夹上传/下载
- 文件夹递归操作
- 拖拽上传
- 进度条显示
- 文件权限管理（chmod）
- 文件重命名/删除
- 支持文本文件直接编辑（Monaco Editor）

**数据模型：**
```typescript
interface FileItem {
  name: string;
  path: string;
  size: number;
  is_dir: boolean;
  permissions: string;
  modified: string;
  owner: string;
  group: string;
}

interface TransferTask {
  id: string;
  type: 'upload' | 'download';
  source: string;
  destination: string;
  total_size: number;
  transferred: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}
```

**Rust Commands：**
```rust
#[tauri::command]
async fn sftp_list_dir(session_id: String, path: String) -> Result<Vec<FileItem>, String>;

#[tauri::command]
async fn sftp_upload(
    session_id: String,
    local_path: String,
    remote_path: String,
) -> Result<String, String>; // 返回 task_id

#[tauri::command]
async fn sftp_download(
    session_id: String,
    remote_path: String,
    local_path: String,
) -> Result<String, String>;

#[tauri::command]
async fn sftp_delete(session_id: String, path: String) -> Result<(), String>;

#[tauri::command]
async fn sftp_rename(session_id: String, old_path: String, new_path: String) -> Result<(), String>;

#[tauri::command]
async fn sftp_chmod(session_id: String, path: String, mode: String) -> Result<(), String>;

#[tauri::command]
async fn sftp_read_file(session_id: String, path: String) -> Result<String, String>;

#[tauri::command]
async fn sftp_write_file(session_id: String, path: String, content: String) -> Result<(), String>;
```

**UI 组件：**
- FileExplorer (文件浏览器)
- FileList (文件列表)
- TransferQueue (传输队列)
- FileEditor (文件编辑器)
- PermissionDialog (权限编辑对话框)

**验收标准：**
- ✅ 能够浏览远程文件系统
- ✅ 上传/下载功能正常，显示进度
- ✅ 拖拽上传功能正常
- ✅ 文件编辑功能正常
- ✅ 权限管理功能正常

---

### Phase 2: 数据库管理 - 第3-4个月

#### 2.1 MySQL/MariaDB 客户端
**优先级：P0（必须）**

**功能描述：**
- 数据库连接管理
- 数据库列表展示
- 表/视图列表
- SQL 查询编辑器（Monaco Editor + 语法高亮）
- 查询结果表格展示（支持分页）
- 表数据内联编辑
- 数据导出（CSV、JSON、SQL）
- 执行计划分析

**技术实现：**
```rust
use mysql_async::{prelude::*, Pool, Conn, Row};

pub struct MySQLConnection {
    pool: Pool,
}

#[tauri::command]
async fn mysql_connect(config: DatabaseConfig) -> Result<String, String> {
    let url = format!(
        "mysql://{}:{}@{}:{}/{}",
        config.username, config.password, config.host, config.port,
        config.database.unwrap_or_default()
    );
    
    let pool = Pool::new(url.as_str());
    let conn_id = uuid::Uuid::new_v4().to_string();
    
    // 存储连接池到全局状态
    store_connection(conn_id.clone(), pool);
    
    Ok(conn_id)
}

#[tauri::command]
async fn mysql_query(
    conn_id: String,
    sql: String,
) -> Result<QueryResult, String> {
    let pool = get_connection(&conn_id)?;
    let mut conn = pool.get_conn().await.map_err(|e| e.to_string())?;
    
    let rows: Vec<Row> = conn.query(sql).await.map_err(|e| e.to_string())?;
    
    // 转换为 JSON
    let results = rows_to_json(rows);
    
    Ok(QueryResult {
        columns: extract_columns(&rows),
        rows: results,
        affected_rows: rows.len(),
    })
}

#[tauri::command]
async fn mysql_list_databases(conn_id: String) -> Result<Vec<String>, String>;

#[tauri::command]
async fn mysql_list_tables(conn_id: String, database: String) -> Result<Vec<TableInfo>, String>;

#[tauri::command]
async fn mysql_describe_table(conn_id: String, table: String) -> Result<TableSchema, String>;
```

**数据模型：**
```typescript
interface QueryResult {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  affected_rows: number;
  execution_time?: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key?: 'PRI' | 'UNI' | 'MUL';
  default?: string;
}

interface TableInfo {
  name: string;
  type: 'table' | 'view';
  rows?: number;
  engine?: string;
  comment?: string;
}

interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreign_keys: ForeignKeyInfo[];
}
```

**UI 组件：**
```typescript
// SQL 编辑器
import Editor from '@monaco-editor/react';

export function SQLEditor({ onExecute }: { onExecute: (sql: string) => void }) {
  const [sql, setSql] = useState('');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="mysql"
          value={sql}
          onChange={(value) => setSql(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono',
          }}
        />
      </div>
      <div className="p-2 border-t">
        <Button onClick={() => onExecute(sql)}>Execute (Ctrl+Enter)</Button>
      </div>
    </div>
  );
}

// 结果表格
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

export function ResultTable({ result }: { result: QueryResult }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {result.columns.map((col) => (
              <TableCell key={col.name}>{col.name}</TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.rows.map((row, i) => (
            <TableRow key={i}>
              {result.columns.map((col) => (
                <TableCell key={col.name}>
                  {String(row[col.name] ?? 'NULL')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-2 text-sm text-muted-foreground">
        {result.affected_rows} rows
        {result.execution_time && ` (${result.execution_time}ms)`}
      </div>
    </div>
  );
}
```

**验收标准：**
- ✅ 能够连接 MySQL/MariaDB
- ✅ SQL 编辑器语法高亮正常
- ✅ 查询结果正确显示
- ✅ 支持多条 SQL 语句执行
- ✅ 数据导出功能正常

---

#### 2.2 PostgreSQL 客户端
**优先级：P1（重要）**

**功能描述：**
同 MySQL，但使用 `tokio-postgres` 驱动

**Rust Commands：**
```rust
use tokio_postgres::{NoTls, Client};

#[tauri::command]
async fn postgres_connect(config: DatabaseConfig) -> Result<String, String>;

#[tauri::command]
async fn postgres_query(conn_id: String, sql: String) -> Result<QueryResult, String>;

// 其他 commands 类似 MySQL
```

**验收标准：**
- ✅ 能够连接 PostgreSQL
- ✅ 支持 PostgreSQL 特有的数据类型
- ✅ 查询功能正常

---

#### 2.3 SQLite 客户端
**优先级：P2（可选）**

**功能描述：**
- 打开本地 SQLite 文件
- 支持创建新数据库
- 其他功能同 MySQL

**Rust Commands：**
```rust
use sqlx::sqlite::SqlitePool;

#[tauri::command]
async fn sqlite_open(path: String) -> Result<String, String>;

#[tauri::command]
async fn sqlite_create(path: String) -> Result<String, String>;
```

---

#### 2.4 Redis 客户端
**优先级：P2（可选）**

**功能描述：**
- Redis 连接管理
- Key 列表浏览（支持模式匹配）
- 数据类型展示（String、Hash、List、Set、ZSet）
- 支持 TTL 查看和设置
- 支持数据编辑
- CLI 命令执行

**Rust Commands：**
```rust
use redis::{Client, Commands, Connection};

#[tauri::command]
async fn redis_connect(config: DatabaseConfig) -> Result<String, String>;

#[tauri::command]
async fn redis_keys(conn_id: String, pattern: String) -> Result<Vec<String>, String>;

#[tauri::command]
async fn redis_get(conn_id: String, key: String) -> Result<RedisValue, String>;

#[tauri::command]
async fn redis_set(conn_id: String, key: String, value: String) -> Result<(), String>;

#[tauri::command]
async fn redis_del(conn_id: String, key: String) -> Result<(), String>;

#[tauri::command]
async fn redis_ttl(conn_id: String, key: String) -> Result<i64, String>;
```

**数据模型：**
```typescript
interface RedisValue {
  type: 'string' | 'hash' | 'list' | 'set' | 'zset';
  value: any;
  ttl: number;
  size: number;
}
```

**验收标准：**
- ✅ 能够连接 Redis
- ✅ Key 浏览功能正常
- ✅ 支持不同数据类型的查看和编辑
- ✅ TTL 功能正常

---

### Phase 3: 高级功能 - 第5-6个月

#### 3.1 数据导入/导出
**优先级：P1（重要）**

**功能描述：**
- 支持导出格式：CSV、JSON、SQL、Excel
- 支持导入格式：CSV、SQL
- 大文件分块处理
- 进度显示

**Rust Commands：**
```rust
#[tauri::command]
async fn export_data(
    conn_id: String,
    sql: String,
    format: ExportFormat,
    output_path: String,
) -> Result<(), String>;

#[tauri::command]
async fn import_sql(
    conn_id: String,
    file_path: String,
) -> Result<ImportResult, String>;
```

---

#### 3.2 表结构同步
**优先级：P2（可选）**

**功能描述：**
- 对比两个数据库的表结构差异
- 生成 DDL 同步脚本
- 支持表结构版本管理

---

#### 3.3 查询历史
**优先级：P1（重要）**

**功能描述：**
- 记录所有执行的 SQL
- 支持收藏常用 SQL
- 支持搜索过滤
- 本地 SQLite 存储

---

#### 3.4 快捷指令
**优先级：P1（重要）**

**功能描述：**
- 预设常用命令
- 支持变量替换
- 支持批量执行
- 支持导入/导出

---

#### 3.5 多窗口支持
**优先级：P2（可选）**

**功能描述：**
- 支持打开多个独立窗口
- 窗口间数据隔离

**Tauri 配置：**
```rust
use tauri::Manager;

#[tauri::command]
async fn open_new_window(app: tauri::AppHandle) -> Result<(), String> {
    tauri::WindowBuilder::new(
        &app,
        "new_window",
        tauri::WindowUrl::App("index.html".into())
    )
    .title("DevHub - New Window")
    .build()
    .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

---

## 🎨 UI/UX 设计规范

### 布局结构
```
┌─────────────────────────────────────────────────────────┐
│  Title Bar (可拖动区域)                                    │
├──────────┬──────────────────────────────────────────────┤
│          │  Tab Bar                                      │
│          ├──────────────────────────────────────────────┤
│  Sidebar │                                               │
│          │                                               │
│  - 连接  │         Content Area                          │
│  - 历史  │                                               │
│  - 收藏  │                                               │
│  - 设置  │                                               │
│          │                                               │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### 主题配色
```typescript
// 亮色主题
const lightTheme = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
  muted: '#f1f5f9',
  border: '#e2e8f0',
};

// 暗色主题
const darkTheme = {
  background: '#0a0a0a',
  foreground: '#ededed',
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
  muted: '#1e1e1e',
  border: '#27272a',
};
```

### 字体
```css
/* 等宽字体（用于代码/终端） */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* 界面字体 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 响应式设计
- 最小窗口尺寸：1024x768
- 侧边栏可折叠
- 支持全屏模式

---

## 🔧 技术要求

### 代码规范

#### TypeScript
```typescript
// 使用严格模式
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// 命名规范
- 组件: PascalCase (e.g., SSHTerminal)
- 函数/变量: camelCase (e.g., connectSSH)
- 常量: UPPER_SNAKE_CASE (e.g., MAX_CONNECTIONS)
- 类型/接口: PascalCase (e.g., ConnectionConfig)
```

#### Rust
```rust
// 使用 clippy
cargo clippy -- -W clippy::all

// 命名规范
- 模块: snake_case (e.g., ssh_client)
- 函数: snake_case (e.g., connect_ssh)
- 类型: PascalCase (e.g., SshConfig)
- 常量: UPPER_SNAKE_CASE (e.g., MAX_RETRY)
```

### 错误处理

#### 前端
```typescript
// 统一错误处理
import { toast } from '@/components/ui/use-toast';

async function handleError(error: unknown) {
  console.error(error);
  
  const message = error instanceof Error 
    ? error.message 
    : 'Unknown error occurred';
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
}

// 使用示例
try {
  await invoke('ssh_connect', { config });
} catch (error) {
  handleError(error);
}
```

#### 后端
```rust
use anyhow::Result;
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

// 统一错误转换
impl From<DevHubError> for String {
    fn from(err: DevHubError) -> String {
        err.to_string()
    }
}
```

### 日志记录

#### 前端
```typescript
// 使用浏览器 console
const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};
```

#### 后端
```rust
use tracing::{info, error, warn, debug};
use tracing_subscriber;

// 初始化日志
fn init_logger() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();
}

// 使用
info!("SSH connection established: {}", session_id);
error!("Failed to connect: {}", err);
```

### 性能优化

#### 前端
- 使用 React.memo() 避免不必要的重渲染
- 大列表使用虚拟滚动（react-window）
- 图片懒加载
- 代码分割（React.lazy + Suspense）

#### 后端
- 数据库连接池复用
- 异步操作使用 Tokio
- 大文件分块读写
- 缓存常用数据

### 安全要求
- 密码加密存储（使用 AES-256）
- 私钥文件权限检查
- SQL 注入防护
- XSS 防护
- 定期依赖更新

---

## 📦 构建与部署

### 开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm tauri dev

# 运行测试
pnpm test
pnpm test:rust
```

### 生产构建
```bash
# 构建所有平台
pnpm tauri build

# 仅构建特定平台
pnpm tauri build --target x86_64-pc-windows-msvc   # Windows
pnpm tauri build --target x86_64-apple-darwin      # macOS Intel
pnpm tauri build --target aarch64-apple-darwin     # macOS Apple Silicon
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

### 打包配置
```json
// tauri.conf.json
{
  "package": {
    "productName": "DevHub",
    "version": "0.1.0"
  },
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:5173",
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["msi", "dmg", "deb", "appimage"],
      "identifier": "com.devhub.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    },
    "windows": [
      {
        "title": "DevHub",
        "width": 1280,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 768,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

---

## 🧪 测试要求

### 单元测试
```typescript
// React 组件测试（使用 Vitest + Testing Library）
import { render, screen } from '@testing-library/react';
import { SSHTerminal } from './SSHTerminal';

describe('SSHTerminal', () => {
  it('should render terminal', () => {
    render(<SSHTerminal connectionId="test" />);
    expect(screen.getByRole('terminal')).toBeInTheDocument();
  });
});
```

```rust
// Rust 单元测试
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_ssh_connect() {
        let config = SSHConfig {
            host: "localhost".to_string(),
            port: 22,
            username: "test".to_string(),
            auth_method: AuthMethod::Password,
            password: Some("test".to_string()),
        };

        let result = ssh_connect(config).await;
        assert!(result.is_ok());
    }
}
```

### 集成测试
- SSH 连接测试
- 数据库连接测试
- 文件传输测试

### E2E 测试
使用 Playwright 或 Tauri 的测试工具进行端到端测试

---

## 📊 性能指标

### 目标指标
- 应用启动时间：< 1秒
- 内存占用（空载）：< 100MB
- 打包体积：< 30MB
- SSH 终端延迟：< 50ms
- 数据库查询响应：< 500ms
- 文件传输速度：> 10MB/s

### 监控方案
- 使用 Chrome DevTools 监控前端性能
- 使用 Rust 的 tracing 记录后端性能
- 定期进行性能基准测试

---

## 📝 文档要求

### 代码注释
- 所有公共 API 必须有注释
- 复杂逻辑必须有解释性注释
- 使用 JSDoc/TSDoc（TypeScript）和 rustdoc（Rust）

### 用户文档
- README.md（项目介绍、安装、使用）
- CONTRIBUTING.md（贡献指南）
- CHANGELOG.md（版本更新日志）
- 在线帮助文档

---

## 🗓️ 开发计划

### Phase 1 (Month 1-2): MVP
- Week 1-2: 项目搭建 + 基础框架
- Week 3-4: 资产管理 + SSH 终端
- Week 5-6: SFTP 文件管理
- Week 7-8: 测试 + Bug 修复

### Phase 2 (Month 3-4): 数据库管理
- Week 9-10: MySQL 客户端
- Week 11-12: PostgreSQL + SQLite
- Week 13-14: Redis 客户端
- Week 15-16: 测试 + 优化

### Phase 3 (Month 5-6): 高级功能
- Week 17-18: 数据导入/导出
- Week 19-20: 查询历史 + 快捷指令
- Week 21-22: 性能优化 + UI 完善
- Week 23-24: 最终测试 + 发布准备

---

## 🎯 验收标准

### 功能完整性
- ✅ 所有 P0 功能 100% 完成
- ✅ 所有 P1 功能 80% 完成
- ✅ 所有 P2 功能 50% 完成

### 质量标准
- ✅ 单元测试覆盖率 > 70%
- ✅ 无已知严重 Bug
- ✅ 通过所有性能指标
- ✅ 代码审查通过

### 用户体验
- ✅ UI 美观，符合设计规范
- ✅ 操作流畅，无卡顿
- ✅ 错误提示友好
- ✅ 用户文档完整

---

## 🚀 后续规划

### v2.0 功能（6个月后）
- RDP 客户端
- MongoDB 客户端
- SSH 隧道管理
- 数据库备份/恢复
- 团队协作功能
- 插件系统

### v3.0 功能（12个月后）
- Cloud Sync（云同步）
- AI 辅助查询
- 自动化脚本
- 移动端 App
- Web 版本

---

## 📧 联系方式

项目负责人：[您的名字]
邮箱：[您的邮箱]
GitHub：[项目地址]

---

## 附录

### A. 依赖清单

#### 前端依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tauri-apps/api": "^1.5.0",
    "zustand": "^4.4.7",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "@monaco-editor/react": "^4.6.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

#### Rust 依赖
```toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
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
tracing-subscriber = "0.3"
chrono = { version = "0.4", features = ["serde"] }
```

### B. 项目结构示例

```
DevHub/
├── src/                          # React 前端源码
│   ├── components/               # React 组件
│   │   ├── ui/                  # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/              # 布局组件
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── TitleBar.tsx
│   │   ├── ssh/                 # SSH 相关组件
│   │   │   ├── SSHTerminal.tsx
│   │   │   ├── ConnectionForm.tsx
│   │   │   └── SessionManager.tsx
│   │   ├── sftp/                # SFTP 相关组件
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── TransferQueue.tsx
│   │   │   └── FileEditor.tsx
│   │   ├── database/            # 数据库相关组件
│   │   │   ├── SQLEditor.tsx
│   │   │   ├── ResultTable.tsx
│   │   │   ├── DatabaseTree.tsx
│   │   │   └── TableViewer.tsx
│   │   └── common/              # 通用组件
│   │       ├── SearchBar.tsx
│   │       ├── StatusBar.tsx
│   │       └── LoadingSpinner.tsx
│   ├── pages/                   # 页面组件
│   │   ├── Home.tsx
│   │   ├── SSHPage.tsx
│   │   ├── DatabasePage.tsx
│   │   └── Settings.tsx
│   ├── stores/                  # Zustand 状态管理
│   │   ├── useConnectionStore.ts
│   │   ├── useSSHStore.ts
│   │   ├── useDatabaseStore.ts
│   │   └── useThemeStore.ts
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useSSH.ts
│   │   ├── useDatabase.ts
│   │   └── useSFTP.ts
│   ├── lib/                     # 工具函数
│   │   ├── utils.ts
│   │   ├── tauri.ts
│   │   └── constants.ts
│   ├── types/                   # TypeScript 类型定义
│   │   ├── connection.ts
│   │   ├── ssh.ts
│   │   ├── database.ts
│   │   └── index.ts
│   ├── App.tsx                  # 根组件
│   ├── main.tsx                 # 入口文件
│   └── index.css                # 全局样式
├── src-tauri/                   # Rust 后端源码
│   ├── src/
│   │   ├── commands/            # Tauri Commands
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs
│   │   │   ├── ssh.rs
│   │   │   ├── sftp.rs
│   │   │   ├── mysql.rs
│   │   │   ├── postgres.rs
│   │   │   ├── sqlite.rs
│   │   │   └── redis.rs
│   │   ├── modules/             # 业务模块
│   │   │   ├── ssh/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── client.rs
│   │   │   │   └── session.rs
│   │   │   ├── sftp/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── client.rs
│   │   │   │   └── transfer.rs
│   │   │   └── database/
│   │   │       ├── mod.rs
│   │   │       ├── mysql.rs
│   │   │       ├── postgres.rs
│   │   │       ├── sqlite.rs
│   │   │       └── redis.rs
│   │   ├── models/              # 数据模型
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs
│   │   │   ├── query.rs
│   │   │   └── file.rs
│   │   ├── utils/               # 工具函数
│   │   │   ├── mod.rs
│   │   │   ├── crypto.rs
│   │   │   └── logger.rs
│   │   ├── error.rs             # 错误定义
│   │   └── main.rs              # 入口文件
│   ├── icons/                   # 应用图标
│   ├── Cargo.toml               # Rust 依赖配置
│   └── tauri.conf.json          # Tauri 配置
├── public/                      # 静态资源
├── tests/                       # 测试文件
│   ├── unit/
│   └── integration/
├── .github/                     # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── docs/                        # 文档
│   ├── api.md
│   └── user-guide.md
├── package.json                 # Node.js 依赖配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.ts           # TailwindCSS 配置
├── README.md                    # 项目说明
├── CONTRIBUTING.md              # 贡献指南
└── LICENSE                      # 开源协议
```

### C. 快速开始示例

#### 1. 初始化项目
```bash
# 创建项目
npm create tauri-app@latest

# 选择配置
✔ Project name: devhub
✔ Choose which language to use for your frontend: TypeScript / JavaScript
✔ Choose your package manager: pnpm
✔ Choose your UI template: React
✔ Choose your UI flavor: TypeScript

cd devhub
pnpm install
```

#### 2. 安装 shadcn/ui
```bash
# 初始化 shadcn/ui
pnpm dlx shadcn-ui@latest init

# 添加组件
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add select
```

#### 3. 配置 Rust 依赖
编辑 `src-tauri/Cargo.toml`，添加上述依赖。

#### 4. 运行项目
```bash
# 开发模式
pnpm tauri dev

# 生产构建
pnpm tauri build
```

### D. 示例代码片段

#### 创建第一个 SSH 连接
```typescript
// src/hooks/useSSH.ts
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { useState, useEffect } from 'react';

export function useSSH(connectionId: string) {
  const [sessionId, setSessionId] = useState<string>();
  const [connected, setConnected] = useState(false);
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const connect = async () => {
      try {
        const id = await invoke<string>('ssh_connect', {
          config: {
            host: 'localhost',
            port: 22,
            username: 'user',
            auth_method: 'password',
            password: 'password',
          },
        });
        
        setSessionId(id);
        setConnected(true);

        // 监听 SSH 输出
        unlisten = await listen<string>('ssh-output', (event) => {
          setOutput((prev) => prev + event.payload);
        });
      } catch (error) {
        console.error('SSH connection failed:', error);
      }
    };

    connect();

    return () => {
      if (unlisten) unlisten();
      if (sessionId) {
        invoke('ssh_disconnect', { sessionId });
      }
    };
  }, [connectionId]);

  const sendCommand = async (command: string) => {
    if (!sessionId) return;
    await invoke('ssh_write', { sessionId, data: command + '\n' });
  };

  return { connected, output, sendCommand };
}
```

```rust
// src-tauri/src/commands/ssh.rs
use russh::*;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::Manager;

pub struct SSHSession {
    session: client::Handle<Client>,
}

#[tauri::command]
pub async fn ssh_connect(
    app: tauri::AppHandle,
    config: SSHConfig,
) -> Result<String, String> {
    // 创建客户端配置
    let client_config = client::Config::default();
    
    // 连接服务器
    let mut session = client::connect(
        Arc::new(client_config),
        (config.host.as_str(), config.port),
        Client {},
    )
    .await
    .map_err(|e| format!("Connection failed: {}", e))?;

    // 认证
    let auth_result = session
        .authenticate_password(config.username, config.password.unwrap_or_default())
        .await
        .map_err(|e| format!("Authentication failed: {}", e))?;

    if !auth_result {
        return Err("Authentication failed".to_string());
    }

    // 生成 session ID
    let session_id = uuid::Uuid::new_v4().to_string();
    
    // 存储 session
    // (这里需要实现一个全局状态管理器来存储 sessions)
    
    Ok(session_id)
}

#[tauri::command]
pub async fn ssh_write(
    session_id: String,
    data: String,
) -> Result<(), String> {
    // 从全局状态获取 session
    // 写入数据到 SSH channel
    Ok(())
}
```

### E. 常见问题解答

#### Q1: Rust 学习曲线太陡，能否用其他语言？
A: 可以使用 Python Sidecar 模式，但会损失性能优势。建议投入 2-3 周专门学习 Rust 基础。

#### Q2: 如何调试 Rust 代码？
A: 使用 `println!()` 或 `dbg!()` 宏，配合 `tracing` 库进行日志输出。VSCode + rust-analyzer 插件提供良好的调试体验。

#### Q3: shadcn/ui 和 Ant Design/Material-UI 的区别？
A: shadcn/ui 是复制到项目中的组件，完全可控；Ant Design 等是 npm 包，更新需要升级依赖。shadcn/ui 更轻量、更灵活。

#### Q4: 打包后文件太大怎么办？
A: 
- 使用 `cargo build --release` 进行 Release 构建
- 启用 LTO (Link Time Optimization)
- 使用 `strip` 移除调试符号
- 检查是否包含了不必要的依赖

#### Q5: 如何实现热更新？
A: Tauri 支持通过 Updater 功能实现自动更新，详见官方文档。

---

## 📋 开发检查清单

### 项目启动阶段
- [ ] 初始化 Tauri + React 项目
- [ ] 配置 shadcn/ui
- [ ] 配置 ESLint + Prettier
- [ ] 配置 Git hooks (husky)
- [ ] 设置 CI/CD pipeline
- [ ] 创建 GitHub 仓库

### MVP 开发阶段
- [ ] 实现主窗口布局
- [ ] 实现主题切换
- [ ] 实现资产管理（CRUD）
- [ ] 实现 SSH 终端基础功能
- [ ] 实现 SFTP 文件浏览
- [ ] 实现 SFTP 文件传输
- [ ] 编写单元测试
- [ ] 性能优化

### 数据库功能阶段
- [ ] 实现 MySQL 连接
- [ ] 实现 SQL 编辑器
- [ ] 实现查询结果展示
- [ ] 实现 PostgreSQL 支持
- [ ] 实现 SQLite 支持
- [ ] 实现 Redis 支持
- [ ] 数据导入/导出功能

### 测试与发布阶段
- [ ] 完成所有功能测试
- [ ] 性能测试达标
- [ ] 编写用户文档
- [ ] 准备发布说明
- [ ] 打包所有平台
- [ ] 发布第一个版本

---

## 🎓 学习资源推荐

### React + TypeScript
- [React 官方文档](https://react.dev/)
- [TypeScript 官方手册](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Rust
- [Rust 程序设计语言（官方书）](https://doc.rust-lang.org/book/)
- [Rust 语言圣经（中文）](https://course.rs/)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/)
- [Tokio 异步编程](https://tokio.rs/tokio/tutorial)

### Tauri
- [Tauri 官方文档](https://tauri.app/)
- [Tauri 示例项目](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Awesome Tauri](https://github.com/tauri-apps/awesome-tauri)

### UI 设计
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## 📞 支持与反馈

### 问题反馈
- GitHub Issues: [项目地址/issues]
- 邮箱: [your-email@example.com]

### 贡献指南
欢迎提交 Pull Request！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)

### 社区
- Discord: [邀请链接]
- 论坛: [论坛地址]

---

**最后更新时间：** 2025-02-05  
**文档版本：** v1.0  
**作者：** [您的名字]  

---

## 🚀 开始开发

这份文档已经包含了项目开发所需的所有信息。现在可以：

1. **给 Claude Code**：直接将这份文档发送给 Claude Code，让它开始搭建项目
2. **分阶段开发**：从 MVP 开始，逐步实现功能
3. **持续迭代**：根据实际开发情况调整需求

**建议第一步：** 让 Claude Code 先搭建项目框架，包括：
- 初始化 Tauri + React 项目
- 配置 shadcn/ui
- 实现基础布局
- 创建第一个简单的 SSH 连接示例

祝开发顺利！🎉