# DevHub 构建部署和测试流程文档

本文档详细说明 DevHub 的构建、部署和测试流程。

---

## 📋 目录

1. [开发环境](#开发环境)
2. [构建流程](#构建流程)
3. [测试流程](#测试流程)
4. [部署流程](#部署流程)
5. [CI/CD 配置](#cicd-配置)
6. [发布流程](#发布流程)
7. [故障排查](#故障排查)

---

## 🛠️ 开发环境

### 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Rust**: >= 1.70.0
- **系统**:
  - Windows: 10+
  - macOS: 10.15+
  - Linux: Ubuntu 18.04+

### 快速设置

```bash
# 克隆项目
git clone https://github.com/yourusername/devhub.git
cd devhub

# 安装依赖
pnpm install

# 初始化开发工具
pnpm setup

# 启动开发模式
pnpm dev
```

### 环境变量

创建 `.env` 文件：

```bash
# 应用配置
VITE_APP_NAME=DevHub
VITE_APP_VERSION=0.1.0

# Tauri 配置
TAURI_PRIVATE_KEY=""
TAURI_PUBLIC_KEY=""

# 开发配置
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### 开发工具安装

```bash
# 安装 Tauri CLI
cargo install tauri-cli

# 安装 Rust 工具
rustup component add clippy
rustup component add rustfmt

# 安装前端工具
pnpm add -D @vitest/coverage-v8
pnpm add -D @playwright/test
```

---

## 🏗️ 构建流程

### 开发构建

```bash
# 启动开发服务器（热重载）
pnpm dev

# 启动 Tauri 开发模式
pnpm tauri dev

# 仅构建前端
pnpm build:dev

# 构建 Rust 代码（debug）
cd src-tauri
cargo build
```

### 生产构建

```bash
# 构建所有平台
pnpm build

# 构建前端（生产）
pnpm build

# 构建 Rust 代码（release）
cd src-tauri
cargo build --release

# 构建特定平台
pnpm tauri build --target x86_64-pc-windows-msvc   # Windows
pnpm tauri build --target x86_64-apple-darwin      # macOS Intel
pnpm tauri build --target aarch64-apple-darwin     # macOS Apple Silicon
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

### 构建优化

```bash
# 启用 LTO（Link Time Optimization）
cd src-tauri
cargo build --release --features lto

# 移除调试符号
strip target/release/devhub

# 减小包体积
cargo build --release --features optimize

# 使用 upx 压缩
upx --best --lzma target/release/devhub
```

### 构建输出

```bash
# 构建产物位置
# macOS
src-tauri/target/release/bundle/dmg/DevHub_0.1.0_x64.dmg

# Windows
src-tauri/target/release/bundle/msi/DevHub_0.1.0_x64_en-US.msi

# Linux
src-tauri/target/release/bundle/appimage/DevHub_0.1.0_amd64.AppImage
```

---

## 🧪 测试流程

### 单元测试

#### TypeScript 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test ConnectionForm

# 监视模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# UI 模式
pnpm test:ui
```

#### Rust 单元测试

```bash
# 运行所有测试
cd src-tauri
cargo test

# 运行特定测试
cargo test test_ssh_connect

# 运行文档测试
cargo test --doc

# 运行特定模块
cargo test -p devhub --lib ssh

# 显示输出
cargo test -- --nocapture
```

### 集成测试

```bash
# 运行集成测试
pnpm test:integration

# SSH 集成测试
pnpm test:ssh

# 数据库集成测试
pnpm test:database

# SFTP 集成测试
pnpm test:sftp
```

### E2E 测试

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 运行特定 E2E 测试
pnpm playwright test ssh.spec.ts

# 调试模式
pnpm playwright test --debug

# 生成报告
pnpm playwright show-report

# 录制测试
pnpm playwright codegen
```

### 测试覆盖率

```bash
# 前端覆盖率
pnpm test:coverage

# 查看覆盖率报告
open coverage/index.html

# Rust 覆盖率（使用 tarpaulin）
cd src-tauri
cargo tarpaulin --out Html

# 查看覆盖率报告
open tarpaulin-report.html
```

### 测试配置

#### Vitest 配置 (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'src-tauri/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### Playwright 配置 (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 测试最佳实践

```typescript
// ✅ 好的测试用例
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ❌ 避免的测试
it('should work', () => {
  // 测试不具体，不清楚在测试什么
})

it('should not throw error', () => {
  // 太宽泛，应该具体说明
})
```

---

## 🚀 部署流程

### 本地部署

```bash
# 构建应用
pnpm build

# 安装应用
# macOS: 打开 .dmg 文件
open src-tauri/target/release/bundle/dmg/DevHub_0.1.0_x64.dmg

# Windows: 运行 .msi 安装程序
msiexec /i src-tauri/target/release/bundle/msi/DevHub_0.1.0_x64_en-US.msi

# Linux: 运行 .AppImage
chmod +x src-tauri/target/release/bundle/appimage/DevHub_0.1.0_amd64.AppImage
./DevHub_0.1.0_amd64.AppImage
```

### 服务器部署

```bash
# 1. 构建应用
pnpm tauri build

# 2. 上传到服务器
scp src-tauri/target/release/bundle/appimage/DevHub_0.1.0_amd64.AppImage user@server:/var/www/devhub/

# 3. 设置服务器
ssh user@server
cd /var/www/devhub
chmod +x DevHub_0.1.0_amd64.AppImage

# 4. 创建桌面快捷方式
cat > /usr/share/applications/devhub.desktop <<EOF
[Desktop Entry]
Name=DevHub
Exec=/var/www/devhub/DevHub_0.1.0_amd64.AppImage
Icon=/var/www/devhub/devhub.png
Type=Application
Categories=Development;
EOF
```

### Docker 部署

```dockerfile
# Dockerfile
FROM rust:1.70-buster as builder

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# 安装 Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 安装 pnpm
RUN npm install -g pnpm

# 复制项目文件
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY . .

# 安装依赖并构建
RUN pnpm install
RUN pnpm tauri build

# 最终镜像
FROM debian:buster-slim
COPY --from=builder /app/src-tauri/target/release/bundle/appimage/*.AppImage /app/
WORKDIR /app
RUN chmod +x *.AppImage
ENTRYPOINT ["/app/DevHub_0.1.0_amd64.AppImage"]
```

```bash
# 构建镜像
docker build -t devhub:latest .

# 运行容器
docker run -it \
  --device /dev/dri \
  --env DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  devhub:latest
```

---

## 🔄 CI/CD 配置

### GitHub Actions CI 配置

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  CARGO_TERM_COLOR: always

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test

      - name: Run integration tests
        run: pnpm test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: frontend

  test-rust:
    name: Test Rust
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          components: clippy, rustfmt

      - name: Run cargo fmt
        run: cargo fmt --all -- --check

      - name: Run cargo clippy
        run: cd src-tauri && cargo clippy -- -D warnings

      - name: Run tests
        run: cd src-tauri && cargo test --verbose

      - name: Upload coverage
        uses: actions-rs/tarpaulin@v0.1
        with:
          args: '--out Xml'
          working-directory: src-tauri

      - name: Upload to codecov.io
        uses: codecov/codecov-action@v3
        with:
          files: ./src-tauri/cobertura.xml
          flags: rust

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### GitHub Actions Release 配置

创建 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  CARGO_TERM_COLOR: always

jobs:
  release:
    name: Release
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            args: --target x86_64-unknown-linux-gnu
          - os: macos-latest
            target: x86_64-apple-darwin
            args: --target x86_64-apple-darwin
          - os: macos-latest
            target: aarch64-apple-darwin
            args: --target aarch64-apple-darwin
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            args: --target x86_64-pc-windows-msvc

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          target: ${{ matrix.target }}

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm tauri build ${{ matrix.args }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.target }}
          path: |
            src-tauri/target/${{ matrix.target }}/release/bundle/
            src-tauri/target/release/bundle/

      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            src-tauri/target/${{ matrix.target }}/release/bundle/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Actions Security 配置

创建 `.github/workflows/security.yml`：

```yaml
name: Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  audit:
    name: Audit Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable

      - name: Audit frontend dependencies
        run: |
          pnpm audit --audit-level moderate

      - name: Audit Rust dependencies
        run: |
          cargo install cargo-audit
          cd src-tauri && cargo audit

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [javascript, javascript-typescript, rust]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          category: "/language:${{matrix.language}}"
```

---

## 📦 发布流程

### 版本管理

使用语义化版本（Semantic Versioning）：

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能性新增
- **PATCH**: 向后兼容的问题修正

示例：
```
v1.0.0 - 初始版本
v1.1.0 - 新增功能
v1.1.1 - 修复 bug
v2.0.0 - 重大变更
```

### 发布步骤

#### 1. 更新版本号

```bash
# 更新 package.json
npm version patch  # v0.1.0 -> v0.1.1
npm version minor  # v0.1.0 -> v0.2.0
npm version major  # v0.1.0 -> v1.0.0

# 或手动更新
# package.json: "version": "0.1.1"
# src-tauri/Cargo.toml: version = "0.1.1"
# src-tauri/tauri.conf.json: "version": "0.1.1"
```

#### 2. 更新 CHANGELOG

```markdown
# Changelog

## [0.1.1] - 2024-01-15

### Added
- SSH 连接支持密码认证
- SFTP 文件下载功能

### Changed
- 优化终端渲染性能

### Fixed
- 修复连接超时问题
- 修复文件上传进度显示错误

## [0.1.0] - 2024-01-01

### Added
- 初始版本发布
- SSH 终端功能
- SFTP 文件管理
- 数据库客户端（MySQL、PostgreSQL）
```

#### 3. 创建 Git 标签

```bash
# 创建标签
git tag -a v0.1.1 -m "Release v0.1.1"

# 推送标签
git push origin v0.1.1
```

#### 4. 创建 GitHub Release

```bash
# 使用 GitHub CLI
gh release create v0.1.1 \
  --title "DevHub v0.1.1" \
  --notes "Release notes here..."

# 或手动在 GitHub 上创建
```

#### 5. 构建发布版本

```bash
# 构建所有平台
pnpm tauri build

# 或使用脚本
./scripts/build.sh
```

#### 6. 上传发布文件

```bash
# 上传到 GitHub Release
gh release upload v0.1.1 \
  src-tauri/target/release/bundle/dmg/DevHub_0.1.0_x64.dmg \
  src-tauri/target/release/bundle/msi/DevHub_0.1.0_x64_en-US.msi \
  src-tauri/target/release/bundle/appimage/DevHub_0.1.0_amd64.AppImage
```

### 自动化发布脚本

创建 `scripts/release.sh`：

```bash
#!/bin/bash

set -e

# 检查参数
if [ -z "$1" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    exit 1
fi

VERSION=$1

# 更新版本号
echo "Updating version to $VERSION"
npm version $VERSION --no-git-tag-version

# 构建
echo "Building application..."
pnpm install
pnpm tauri build

# 创建标签
echo "Creating git tag..."
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"
git tag -a v$VERSION -m "Release v$VERSION"

# 推送
echo "Pushing to remote..."
git push origin main
git push origin v$VERSION

# 创建 GitHub Release
echo "Creating GitHub Release..."
gh release create v$VERSION \
  --title "DevHub v$VERSION" \
  --notes-file CHANGELOG.md \
  --draft

echo "Release $VERSION created successfully!"
```

使用：
```bash
chmod +x scripts/release.sh
./scripts/release.sh 0.1.1
```

---

## 🔍 故障排查

### 构建问题

#### 问题：前端构建失败

```bash
# 清理缓存
rm -rf node_modules
rm -rf dist
rm -rf .vite
pnpm install

# 检查依赖
pnpm outdated

# 重新安装
pnpm install --force
```

#### 问题：Rust 编译错误

```bash
# 更新 Rust
rustup update stable

# 清理构建缓存
cd src-tauri
cargo clean

# 重新编译
cargo build --release

# 检查工具链
rustup show
```

#### 问题：Tauri 构建失败

```bash
# 检查系统依赖
# macOS
xcode-select --install

# Windows (Visual Studio Build Tools)
winget install Microsoft.VisualStudio.2022.BuildTools

# Linux
sudo apt-get install \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# 重新构建
pnpm tauri build
```

### 测试问题

#### 问题：测试超时

```bash
# 增加超时时间
vitest --test-timeout=10000

# 或在配置中设置
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000,
  },
})
```

#### 问题：E2E 测试失败

```bash
# 调试模式
pnpm playwright test --debug

# 查看浏览器
pnpm playwright test --headed

# 录制视频
pnpm playwright test --trace on

# 查看跟踪
pnpm playwright show-trace trace.zip
```

### 运行时问题

#### 问题：应用无法启动

```bash
# 检查日志
# macOS
~/Library/Logs/DevHub/

# Windows
%APPDATA%\DevHub\logs\

# Linux
~/.config/DevHub/logs/

# 查看控制台输出
pnpm tauri dev
```

#### 问题：连接失败

```bash
# 检查网络连接
ping target-host

# 检查端口
nc -zv target-host 22

# 查看防火墙规则
# macOS
sudo pfctl -s all

# Windows
netsh advfirewall show allprofiles

# Linux
sudo ufw status
```

### 性能问题

#### 问题：应用启动慢

```bash
# 分析启动时间
# 使用 Chrome DevTools
pnpm tauri dev
# 打开 DevTools -> Performance -> Record

# 检查依赖大小
pnpm why heavy-dependency

# 移除未使用的依赖
npx depcheck
```

#### 问题：内存占用高

```bash
# 分析内存使用
# Chrome DevTools -> Memory -> Heap Snapshot

# 检查内存泄漏
# 在 DevTools 中录制内存使用情况
```

---

## 📊 监控和日志

### 日志配置

#### 前端日志 (`src/lib/logger.ts`)

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO

  setLevel(level: LogLevel) {
    this.level = level
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }
}

export const logger = new Logger()
```

#### 后端日志 (`src-tauri/src/utils/logger.rs`)

```rust
use tracing::{debug, info, warn, error};
use tracing_subscriber;

pub fn init_logger() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();
}

pub fn log_info(message: &str) {
    info!("{}", message);
}

pub fn log_error(message: &str) {
    error!("{}", message);
}
```

### 性能监控

#### 前端性能监控

```typescript
// 测量 API 请求时间
const start = performance.now()
await invoke('ssh_connect', { config })
const end = performance.now()
console.log(`API call took ${end - start}ms`)

// 使用 Performance API
performance.mark('start')
// ... 执行操作
performance.mark('end')
performance.measure('operation', 'start', 'end')
```

#### 后端性能监控

```rust
use std::time::Instant;

let start = Instant::now();
// ... 执行操作
let duration = start.elapsed();
info!("Operation took {:?}", duration);
```

---

## ✅ 总结

本文档详细介绍了 DevHub 的构建、部署和测试流程：

1. ✅ **开发环境** - 环境要求、快速设置、开发工具
2. ✅ **构建流程** - 开发构建、生产构建、构建优化
3. ✅ **测试流程** - 单元测试、集成测试、E2E 测试、覆盖率
4. ✅ **部署流程** - 本地部署、服务器部署、Docker 部署
5. ✅ **CI/CD 配置** - GitHub Actions CI、Release、Security
6. ✅ **发布流程** - 版本管理、发布步骤、自动化脚本
7. ✅ **故障排查** - 构建问题、测试问题、运行时问题

遵循这些流程，可以确保 DevHub 的稳定构建和可靠发布。

---

**下一步：** 阅读 [开发工具和最佳实践指南](./Development_Tools_and_Best_Practices.md) 了解开发工具和最佳实践。
