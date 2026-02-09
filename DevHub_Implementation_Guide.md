# DevHub 开发实施指南

## 🚀 快速开始

### 环境准备

确保您的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐)
- **Rust**: >= 1.70.0
- **系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### 安装开发工具

```bash
# 安装 Node.js (使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 安装 pnpm
npm install -g pnpm

# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 安装 Tauri CLI
cargo install tauri-cli
```

---

## 📦 项目初始化

### 1. 创建 Tauri + React 项目

```bash
# 创建新项目
npm create tauri-app@latest devhub

# 选择配置项
✔ Project name: devhub
✔ Choose which language to use for your frontend: TypeScript / JavaScript
✔ Choose your package manager: pnpm
✔ Choose your UI template: React
✔ Choose your UI flavor: TypeScript

# 进入项目目录
cd devhub

# 安装依赖
pnpm install
```

### 2. 安装核心依赖

```bash
# UI 组件库
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast
pnpm add class-variance-authority clsx tailwind-merge

# 状态管理
pnpm add zustand

# 路由
pnpm add react-router-dom

# 图标
pnpm add lucide-react

# 代码编辑器
pnpm add @monaco-editor/react

# 终端
pnpm add xterm xterm-addon-fit xterm-addon-web-links

# Tauri API
pnpm add @tauri-apps/api @tauri-apps/plugin-shell

# 开发依赖
pnpm add -D @types/node eslint eslint-config-prettier prettier tailwindcss postcss autoprefixer
```

### 3. 初始化 shadcn/ui

```bash
# 初始化 shadcn/ui
pnpm dlx shadcn-ui@latest init

# 添加基础组件
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add scroll-area
pnpm dlx shadcn-ui@latest add separator
pnpm dlx shadcn-ui@latest add tree-view
```

### 4. 配置 Rust 依赖

编辑 `src-tauri/Cargo.toml`：

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
base64 = "0.21"
aes = "0.8"
cbc = "0.1"
rand = "0.8"
```

---

## 🏗️ 项目结构配置

### 1. 创建目录结构

```bash
# 创建前端目录结构
mkdir -p src/{components/{ui,layout,ssh,sftp,database,common},pages,stores,hooks,lib,types,assets}

# 创建后端目录结构
mkdir -p src-tauri/src/{commands,modules/{ssh,sftp,database},models,utils,errors}

# 创建其他目录
mkdir -p {public,docs,tests/{unit,integration},.github/workflows}
```

### 2. 配置文件设置

#### TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### Vite 配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

#### Tailwind CSS 配置 (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

#### ESLint 配置 (`.eslintrc.cjs`)

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

#### Prettier 配置 (`.prettierrc`)

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

---

## 🔧 Tauri 配置

### 应用配置 (`src-tauri/tauri.conf.json`)

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "DevHub",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "copyFile": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true,
        "renameFile": true,
        "exists": true
      },
      "path": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.devhub.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "DevHub",
        "width": 1280,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 768
      }
    ]
  }
}
```

---

## 🎨 样式和主题配置

### 1. 全局样式 (`src/index.css`)

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/30 rounded-md;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/50;
}

/* 终端字体 */
.terminal {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

/* 禁用文本选择区域 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 拖拽区域 */
.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
```

### 2. 主题配置 (`src/lib/theme.ts`)

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
    {
      name: 'devhub-theme',
    }
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

// 初始化主题
export function initTheme() {
  const { theme } = useThemeStore.getState()
  applyTheme(theme)
}
```

---

## 🚀 启动和构建

### 开发模式

```bash
# 启动前端开发服务器
pnpm dev

# 启动 Tauri 开发模式
pnpm tauri dev
```

### 生产构建

```bash
# 构建前端
pnpm build

# 构建 Tauri 应用
pnpm tauri build

# 构建特定平台
pnpm tauri build --target x86_64-pc-windows-msvc   # Windows
pnpm tauri build --target x86_64-apple-darwin      # macOS Intel
pnpm tauri build --target aarch64-apple-darwin     # macOS Apple Silicon
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

---

## 📝 下一步

项目初始化完成后，接下来可以：

1. **阅读核心功能开发指南** - 了解 SSH、SFTP、数据库等模块的开发
2. **配置开发工具** - 设置 Git hooks、代码格式化等
3. **开始 MVP 开发** - 从基础布局和资产管理开始

现在您可以运行 `pnpm tauri dev` 来启动开发环境！