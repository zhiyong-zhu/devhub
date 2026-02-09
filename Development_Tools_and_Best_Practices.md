# DevHub 开发工具和最佳实践指南

本文档介绍 DevHub 开发过程中推荐使用的工具、开发技巧和最佳实践。

---

## 📋 目录

1. [开发环境配置](#开发环境配置)
2. [代码编辑器配置](#代码编辑器配置)
3. [调试技巧](#调试技巧)
4. [性能优化](#性能优化)
5. [Git 工作流](#git-工作流)
6. [最佳实践](#最佳实践)
7. [常见陷阱](#常见陷阱)
8. [学习资源](#学习资源)

---

## 💻 开发环境配置

### VSCode 配置

#### 推荐扩展

```json
{
  "recommendations": [
    // TypeScript/React
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",

    // Rust
    "rust-lang.rust-analyzer",
    "tamasfe.even-better-toml",
    "serayuzguncrust.even-better-toml",

    // Tauri
    "tauri-apps.tauri-vscode",

    // 通用
    "eamodio.gitlens",
    "pkief.material-icon-theme",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",

    // 测试
    "vitest.explorer",
    "playwright.playwright"
  ]
}
```

#### VSCode 设置 (`.vscode/settings.json`)

```json
{
  // 编辑器配置
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.rulers": [80, 100],

  // TypeScript 配置
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "relative",

  // Rust 配置
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": "all",
  "rust-analyzer.inlayHints.enable": true,

  // TailwindCSS 配置
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],

  // 文件配置
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/target": true,
    "**/.git": true
  },

  // 搜索配置
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/target": true,
    "**/coverage": true
  },

  // Git 配置
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.postCommitCommand": "none",

  // 终端配置
  "terminal.integrated.fontFamily": "JetBrains Mono",
  "terminal.integrated.fontSize": 14
}
```

#### 调试配置 (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Frontend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug Rust",
      "cargo": {
        "args": ["build", "--message-format=json"]
      },
      "cwd": "${workspaceFolder}/src-tauri",
      "preLaunchTask": "cargo build"
    }
  ]
}
```

### JetBrains IDEA 配置

#### 推荐插件

- **Rust Plugin** - Rust 支持
- **Vue.js** / **React** - 前端框架支持
- **Tailwind CSS** - TailwindCSS 支持
- **GitToolBox** - Git 增强
- **Rainbow Brackets** - 彩虹括号
- **Key Promoter X** - 快捷键提示

### 其他工具

#### Git GUI 客户端

- **GitKraken** - 跨平台 Git 客户端
- **SourceTree** - 免费且强大
- **Fork** - 快速且直观
- **GitHub Desktop** - GitHub 官方客户端

#### API 测试工具

- **Postman** - API 测试
- **Insomnia** - 轻量级 API 客户端
- **Bruno** - 开源 API 客户端

---

## 🔧 代码编辑器配置

### Prettier 配置 (`.prettierrc`)

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### ESLint 配置 (`.eslintrc.cjs`)

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'node_modules',
    'build',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    'react-hooks',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
```

### EditorConfig (`.editorconfig`)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[*.{rs,toml}]
indent_size = 4
```

---

## 🐛 调试技巧

### 前端调试

#### Chrome DevTools

```typescript
// 1. Console 日志
console.log('Debug info', data)
console.warn('Warning message')
console.error('Error message')
console.table(arrayData)
console.group('Group name')
console.groupEnd()

// 2. 断点调试
debugger // 代码中设置断点

// 3. 性能测量
console.time('operation')
// ... 执行操作
console.timeEnd('operation')

// 4. 堆栈跟踪
console.trace('Function call trace')

// 5. 条件日志
console.assert(condition, 'Assertion failed')

// 6. 格式化输出
console.log('%c Highlighted', 'color: red; font-size: 20px')
```

#### React DevTools

```typescript
// 使用 React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(
  id, phase, actualDuration, baseDuration,
  startTime, commitTime, interactions
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`)
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

#### Tauri DevTools

```typescript
// 启用 Tauri DevTools
// tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "devtools": true
    }
  }
}

// 使用
await invoke('devtools_open')
```

### 后端调试

#### println! 调试

```rust
// 简单的日志输出
println!("Variable: {:?}", variable);
println!("Line reached: {}", line!());

// 条件编译
#[cfg(debug_assertions)]
println!("Debug info: {:?}", data);
```

#### eprintln! 调试

```rust
// 输出到 stderr
eprintln!("Error: {}", error);
```

#### dbg! 宏

```rust
// 自动打印表达式和值
let result = dbg!(calculate_value());
// 等价于：
// let result = calculate_value();
// [src/main.rs:10] calculate_value() = 42

// 链式调试
let value = dbg!(1 + 2) * dbg!(3 + 4);
```

#### 环境变量

```bash
# 启用 Rust 详细日志
RUST_LOG=debug pnpm tauri dev

# 特定模块日志
RUST_LOG=devhub::ssh=debug pnpm tauri dev

# 禁用日志
RUST_LOG=off pnpm tauri dev
```

### 单元测试调试

#### Vitest 调试

```bash
# UI 模式
pnpm test:ui

# 只运行特定测试
pnpm test ConnectionForm

# 监视模式
pnpm test:watch

# 覆盖率
pnpm test:coverage
```

#### Rust 测试调试

```bash
# 显示输出
cargo test -- --nocapture

# 运行特定测试
cargo test test_ssh_connect

# 忽略慢测试
cargo test -- --ignore slow

# 并行运行
cargo test -- --test-threads=4
```

---

## ⚡ 性能优化

### 前端性能优化

#### 1. 代码分割

```typescript
// 路由级别代码分割
import { lazy, Suspense } from 'react'

const SSHPage = lazy(() => import('@/pages/SSHPage'))
const DatabasePage = lazy(() => import('@/pages/DatabasePage'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/ssh" element={<SSHPage />} />
        <Route path="/database" element={<DatabasePage />} />
      </Routes>
    </Suspense>
  )
}
```

#### 2. 虚拟滚动

```typescript
import { FixedSizeList } from 'react-window'

function LargeList() {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>{items[index].name}</div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

#### 3. 防抖和节流

```typescript
// 防抖
import { useDebounce } from '@/hooks/useDebounce'

function SearchComponent() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input onChange={(e) => setQuery(e.target.value)} />
}

// 节流
import { useThrottle } from '@/hooks/useThrottle'

function ResizeComponent() {
  const handleResize = useThrottle(() => {
    // 处理 resize
  }, 200)

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
}
```

#### 4. React.memo 和 useMemo

```typescript
// React.memo 避免不必要的重渲染
export const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.id === next.id
})

// useMemo 缓存计算结果
const sortedItems = useMemo(
  () => items.sort((a, b) => a.id - b.id),
  [items]
)

// useCallback 缓存函数
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

#### 5. 图片优化

```typescript
// 懒加载
import { lazyLoadImage } from '@/utils/image'

function ImageComponent({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current) {
      lazyLoadImage(imgRef.current, src, () => {
        setLoaded(true)
      })
    }
  }, [src])

  return <img ref={imgRef} className={loaded ? '' : 'blur'} />
}
```

### 后端性能优化

#### 1. 连接池

```rust
use mysql_async::Pool;

// 创建连接池
let pool = Pool::new(url.as_str());

// 复用连接
async fn execute_query(pool: &Pool, sql: &str) -> Result<Vec<Row>> {
    let mut conn = pool.get_conn().await?;
    conn.query(sql).await.map_err(Into::into)
}
```

#### 2. 异步处理

```rust
use tokio::task::spawn_blocking;

// CPU 密集型任务
let result = spawn_blocking(move || {
    heavy_computation(data)
}).await?;

// 并发执行
use tokio::try_join;

let (result1, result2) = try_join!(
    async_task1(),
    async_task2()
)?;
```

#### 3. 缓存

```rust
use lru::LruCache;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static CACHE: Lazy<Mutex<LruCache<String, String>>> = Lazy::new(|| {
    Mutex::new(LruCache::new(100))
});

async fn get_cached_data(key: &str) -> Option<String> {
    let mut cache = CACHE.lock().unwrap();
    cache.get(key).cloned()
}
```

#### 4. 批量处理

```rust
// 批量插入
async fn batch_insert(items: Vec<Item>) -> Result<()> {
    let mut conn = get_connection().await?;
    let mut tx = conn.begin_transaction().await?;

    for item in items {
        tx.insert(&item).await?;
    }

    tx.commit().await?;
    Ok(())
}
```

---

## 🔄 Git 工作流

### 分支策略

```
main          # 生产分支
  ├── develop # 开发分支
        ├── feature/ssh-terminal
        ├── feature/sftp-client
        ├── feature/mysql-client
        └── bugfix/connection-error
```

### 提交规范

使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或工具变更

#### 示例

```bash
# 新功能
git commit -m "feat(ssh): add password authentication support"

# Bug 修复
git commit -m "fix(sftp): resolve file upload progress issue"

# 文档
git commit -m "docs: update installation guide"

# 重构
git commit -m "refactor(database): simplify connection pooling"
```

### 工作流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: add new feature"

# 3. 推送到远程
git push origin feature/new-feature

# 4. 创建 Pull Request
# 在 GitHub 上创建 PR 到 develop

# 5. 代码审查和合并

# 6. 删除分支
git checkout develop
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Git Hooks

#### Pre-commit Hook

创建 `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 运行 linter
pnpm lint

# 运行格式检查
pnpm format:check

# 运行单元测试
pnpm test
```

#### Commit-msg Hook

创建 `.husky/commit-msg`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 验证提交信息格式
pnpm commitlint --edit $1
```

---

## 🎯 最佳实践

### TypeScript 最佳实践

#### 1. 类型优先

```typescript
// ✅ 定义接口
interface User {
  id: string
  name: string
  email: string
}

// ❌ 避免使用 any
function processUser(user: any) {}

// ✅ 使用泛型
function processUser<T extends Record<string, any>>(user: T): T {
  return user
}
```

#### 2. 空值检查

```typescript
// ✅ 可选链和空值合并
const email = user?.email ?? 'unknown@example.com'

// ✅ 类型守卫
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isUser(data)) {
  // data 是 User 类型
}
```

#### 3. 错误处理

```typescript
// ✅ 使用 Result 类型
async function connect(): Promise<Result<string, Error>> {
  try {
    return Ok(await invoke('ssh_connect'))
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)))
  }
}

// ✅ 处理错误
const result = await connect()
if (result.isErr()) {
  console.error(result.error)
  return
}
```

### Rust 最佳实践

#### 1. 错误处理

```rust
// ✅ 使用 Result
async fn connect_ssh(config: SSHConfig) -> Result<String, SSHError> {
    let session = connect(config).await?;
    Ok(session.id())
}

// ✅ 使用 Option
pub fn get_connection(id: &str) -> Option<&Connection> {
    CONNECTIONS.get(id)
}

// ❌ 避免 unwrap
let result = operation().unwrap(); // ❌
let result = operation().expect("must succeed"); // ⚠️
```

#### 2. 借用检查器

```rust
// ✅ 正确的借用
fn process_data(data: &mut Data) {
    data.modify();
    data.save();
}

// ❌ 多重可变借用
fn process_data(data: &mut Data) {
    let ref1 = data;
    let ref2 = data; // ❌ 编译错误
}
```

#### 3. 生命周期

```rust
// ✅ 显式生命周期
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

// ✅ 省略生命周期
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

### 测试最佳实践

#### 1. 测试组织

```typescript
// ✅ 按功能分组测试
describe('SSHConnectionForm', () => {
  describe('validation', () => {
    it('should require host', () => {})
    it('should validate port range', () => {})
  })

  describe('submission', () => {
    it('should call onSubmit with correct data', () => {})
  })
})
```

#### 2. 测试隔离

```typescript
// ✅ 每个测试独立
beforeEach(() => {
  // 重置状态
  clearAllMocks()
})

afterEach(() => {
  // 清理
  cleanup()
})
```

#### 3. 测试覆盖率

```bash
# 设置覆盖率目标
pnpm test:coverage

# 查看未覆盖的代码
open coverage/index.html

# 设置最低覆盖率阈值
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
```

### 性能最佳实践

#### 1. 前端性能

```typescript
// ✅ 使用 useMemo 避免重复计算
const sortedData = useMemo(
  () => data.sort((a, b) => a.id - b.id),
  [data]
)

// ✅ 使用 useCallback 避免函数重建
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

// ✅ 使用虚拟滚动处理大列表
<FixedSizeList height={600} itemCount={10000} itemSize={35}>
  {Row}
</FixedSizeList>
```

#### 2. 后端性能

```rust
// ✅ 使用异步 I/O
async fn read_file(path: &Path) -> Result<String> {
    tokio::fs::read_to_string(path).await.map_err(Into::into)
}

// ✅ 使用连接池
let pool = mysql_async::Pool::new(url);
let conn = pool.get_conn().await?;

// ✅ 批量操作
async fn batch_insert(items: Vec<Item>) -> Result<()> {
    let mut tx = conn.begin_transaction().await?;
    for item in items {
        tx.insert(&item).await?;
    }
    tx.commit().await?;
    Ok(())
}
```

---

## ⚠️ 常见陷阱

### TypeScript 陷阱

#### 1. 类型断言滥用

```typescript
// ❌ 不安全的类型断言
const user = data as User

// ✅ 使用类型守卫
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data
}

if (isUser(data)) {
  // data 确实是 User
}
```

#### 2. 依赖数组遗漏

```typescript
// ❌ 依赖数组不完整
useEffect(() => {
  console.log(prop1, prop2)
}, [prop1]) // ⚠️ 缺少 prop2

// ✅ 包含所有依赖
useEffect(() => {
  console.log(prop1, prop2)
}, [prop1, prop2])
```

#### 3. 闭包陷阱

```typescript
// ❌ 闭包捕获旧值
useEffect(() => {
  const id = setInterval(() => {
    console.log(count) // ⚠️ 总是 0
  }, 1000)
  return () => clearInterval(id)
}, [])

// ✅ 使用函数更新
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1) // ✅ 使用函数更新
  }, 1000)
  return () => clearInterval(id)
}, [])
```

### Rust 陷阱

#### 1. 悬垂引用

```rust
// ❌ 悬垂引用
let s = String::from("hello");
let slice = &s[0..2];
drop(s);
println!("{}", slice); // ❌ 使用了已释放的内存

// ✅ 正确的生命周期
let s = String::from("hello");
{
  let slice = &s[0..2];
  println!("{}", slice);
}
```

#### 2. 克隆过多

```rust
// ❌ 不必要的克隆
fn process(data: String) {
    println!("{}", data);
}

let data = String::from("hello");
process(data.clone()); // ❌
process(data.clone()); // ❌

// ✅ 使用借用
fn process(data: &str) {
    println!("{}", data);
}

let data = String::from("hello");
process(&data); // ✅
process(&data); // ✅
```

#### 3. 死锁

```rust
// ❌ 可能死锁
use std::sync::Mutex;

let mutex1 = Mutex::new(1);
let mutex2 = Mutex::new(2);

let lock1 = mutex1.lock().unwrap();
let lock2 = mutex2.lock().unwrap();

// ✅ 使用 try_lock 或有序获取
```

---

## 📚 学习资源

### 官方文档

#### TypeScript

- [TypeScript 官方手册](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React 官方文档](https://react.dev/)

#### Rust

- [Rust 程序设计语言](https://doc.rust-lang.org/book/)
- [Rust 语言圣经（中文）](https://course.rs/)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/)
- [Tokio 异步编程](https://tokio.rs/tokio/tutorial)

#### Tauri

- [Tauri 官方文档](https://tauri.app/)
- [Tauri 示例项目](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Awesome Tauri](https://github.com/tauri-apps/awesome-tauri)

#### UI 框架

- [shadcn/ui 文档](https://ui.shadcn.com/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

### 在线课程

#### Rust

- [Rustlings](https://rustlings.cool/) - 交互式 Rust 学习
- [Exercism Rust Track](https://exercism.org/tracks/rust) - 练习题

#### TypeScript/React

- [Epic React](https://epicreact.dev/) - 高级 React 模式
- [Frontend Masters](https://frontendmasters.com/) - 专业前端课程

### 社区资源

#### 论坛和问答

- [Rust Users Forum](https://users.rust-lang.org/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/rust)
- [GitHub Discussions](https://github.com/tauri-apps/tauri/discussions)

#### 视频教程

- [Rust YouTube](https://www.youtube.com/results?search_query=rust+programming)
- [Tauri YouTube](https://www.youtube.com/results?search_query=tauri+app)

### 工具推荐

#### Rust 工具

- `cargo-audit` - 安全审计
- `cargo-outdated` - 依赖更新检查
- `cargo-edit` - 依赖管理
- `cargo-tarpaulin` - 测试覆盖率

#### TypeScript 工具

- `depcheck` - 未使用的依赖检查
- `npm-check-updates` - 依赖更新
- `bundlephobia` - 包大小检查

---

## ✅ 总结

本文档全面介绍了 DevHub 开发的工具和最佳实践：

1. ✅ **开发环境配置** - VSCode、IDEA、工具推荐
2. ✅ **代码编辑器配置** - Prettier、ESLint、EditorConfig
3. ✅ **调试技巧** - 前端调试、后端调试、测试调试
4. ✅ **性能优化** - 前端优化、后端优化
5. ✅ **Git 工作流** - 分支策略、提交规范、Hooks
6. ✅ **最佳实践** - TypeScript、Rust、测试、性能
7. ✅ **常见陷阱** - TypeScript 陷阱、Rust 陷阱
8. ✅ **学习资源** - 官方文档、课程、社区

遵循这些最佳实践，可以高效、高质量地开发 DevHub。

---

## 🎉 完整文档套件

恭喜！您现在拥有完整的 DevHub 开发文档套件：

1. ✅ [项目初始化和基础配置](./DevHub_Implementation_Guide.md)
2. ✅ [核心功能模块开发指南](./Core_Features_Development_Guide.md)
3. ✅ [项目结构和代码规范](./Project_Structure_and_Code_Standards.md)
4. ✅ [构建部署和测试流程](./Build_Deploy_and_Testing_Guide.md)
5. ✅ [开发工具和最佳实践](./Development_Tools_and_Best_Practices.md)

这套文档涵盖了从项目初始化到发布的完整开发流程，包括：
- 环境搭建和配置
- 核心功能实现
- 代码规范和结构
- 测试和部署流程
- 开发工具和最佳实践

现在您可以开始 DevHub 的开发之旅了！🚀
