# DevHub 开发任务计划

> 生成时间：2026-02-09
> 基于 DevHub_Requirements.md 需求文档与项目当前代码状态分析

---

## 📊 当前完成度总览

| 需求模块 | 完成度 | 状态 |
|----------|--------|------|
| 1.1 基础框架搭建 | 90% | ⚠️ 主题切换未集成，shadcn/ui 组件不全 |
| 1.2 资产管理 | 75% | ⚠️ 分组后端 API 缺失，密码未加密 |
| 1.3 SSH 终端 | 85% | ⚠️ 跳板机未实现 |
| 1.4 SFTP 文件管理 | 0% | ❌ 前后端均为空 |
| 2.1 MySQL 客户端 | 70% | ⚠️ 缺少 DatabaseTree、数据导出、内联编辑 |
| 2.2 PostgreSQL 客户端 | 70% | ⚠️ 同 MySQL |
| 2.3 SQLite 客户端 | 0% | ❌ 未实现 |
| 2.4 Redis 客户端 | 0% | ❌ 未实现 |
| 3.1 数据导入/导出 | 0% | ❌ 未实现 |
| 3.3 SQL 查询历史 | 0% | ❌ 未实现 |
| 3.4 快捷指令 | 0% | ❌ 未实现 |
| 3.5 多窗口支持 | 0% | ❌ 未实现 |

---

## 🔴 高优先级任务

### Task 1: Phase 1 补全 - 基础框架完善

#### Task 1.1: 主题切换集成
- **状态**: ❌ 待完成
- **描述**: 将 `ThemeToggle` 组件集成到 `Sidebar` 底部，实现暗色/亮色主题切换
- **涉及文件**:
  - `src/components/layout/Sidebar.tsx` — 集成 ThemeToggle
  - `src/components/common/ThemeToggle.tsx` — 已实现，需确认功能正常

#### Task 1.2: 补全 shadcn/ui 组件库
- **状态**: ❌ 待完成
- **描述**: 当前仅有 `button.tsx`，需补全 table, tabs, dialog, input, select, toast, dropdown-menu 等组件
- **涉及文件**:
  - `src/components/ui/` — 添加缺失组件

#### Task 1.3: Settings 页面实现
- **状态**: ❌ 待完成
- **描述**: Sidebar 有设置入口但无对应页面，需实现基础设置页面（主题、字体、快捷键等）
- **涉及文件**:
  - `src/pages/SettingsPage.tsx` — 新建
  - `src/components/layout/MainLayout.tsx` — 添加 settings 路由

---

### Task 2: Phase 1 补全 - 资产管理完善

#### Task 2.1: 分组 CRUD 后端实现
- **状态**: ❌ 待完成
- **描述**: 数据库 `groups` 表已创建，但缺少 Tauri commands
- **需实现的 commands**:
  - `create_group(name, parent_id, icon)` → `Result<String, String>`
  - `update_group(id, name, icon)` → `Result<(), String>`
  - `delete_group(id)` → `Result<(), String>`
  - `list_groups(parent_id?)` → `Result<Vec<Group>, String>`
- **涉及文件**:
  - `src-tauri/src/commands/group.rs` — 新建
  - `src-tauri/src/commands/mod.rs` — 注册模块
  - `src-tauri/src/main.rs` — 注册 commands

#### Task 2.2: 分组前端对接
- **状态**: ❌ 待完成
- **描述**: `GroupTree.tsx` 和 `GroupDialog.tsx` 已存在，需与后端 API 对接
- **涉及文件**:
  - `src/components/connection/GroupTree.tsx` — 对接后端
  - `src/components/connection/GroupDialog.tsx` — 对接后端
  - `src/stores/useConnectionStore.ts` — 添加分组相关 actions

#### Task 2.3: 密码加密存储
- **状态**: ❌ 待完成
- **描述**: `connection.rs` 中有 TODO 标记，`aes-gcm` 依赖已添加到 `Cargo.toml`
- **涉及文件**:
  - `src-tauri/src/utils/` — 实现加密/解密工具函数
  - `src-tauri/src/commands/connection.rs` — 集成加密逻辑

---

### Task 3: Phase 1 - SFTP 文件管理（全新实现）

#### Task 3.1: SFTP 后端模块
- **状态**: ❌ 待完成
- **描述**: 添加 `russh-sftp` 依赖，实现完整 SFTP 功能
- **需实现的 commands**:
  - `sftp_list_dir(session_id, path)` → `Result<Vec<FileItem>, String>`
  - `sftp_upload(session_id, local_path, remote_path)` → `Result<String, String>`
  - `sftp_download(session_id, remote_path, local_path)` → `Result<String, String>`
  - `sftp_delete(session_id, path)` → `Result<(), String>`
  - `sftp_rename(session_id, old_path, new_path)` → `Result<(), String>`
  - `sftp_chmod(session_id, path, mode)` → `Result<(), String>`
  - `sftp_read_file(session_id, path)` → `Result<String, String>`
  - `sftp_write_file(session_id, path, content)` → `Result<(), String>`
- **涉及文件**:
  - `src-tauri/Cargo.toml` — 添加 russh-sftp 依赖
  - `src-tauri/src/modules/sftp/mod.rs` — 新建
  - `src-tauri/src/modules/sftp/client.rs` — 新建
  - `src-tauri/src/modules/sftp/transfer.rs` — 新建
  - `src-tauri/src/commands/sftp.rs` — 新建

#### Task 3.2: SFTP 前端 - FileExplorer 双面板
- **状态**: ❌ 待完成
- **描述**: 实现双面板文件管理器（本地 + 远程）
- **涉及文件**:
  - `src/components/sftp/FileExplorer.tsx` — 新建
  - `src/components/sftp/FileList.tsx` — 新建
  - `src/components/sftp/index.ts` — 新建
  - `src/pages/SFTPPage.tsx` — 新建
  - `src/types/file.ts` — 新建（FileItem, TransferTask 类型）

#### Task 3.3: SFTP 前端 - TransferQueue 传输队列
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/sftp/TransferQueue.tsx` — 新建
  - `src/stores/useTransferStore.ts` — 新建

#### Task 3.4: SFTP 前端 - 文件编辑器
- **状态**: ❌ 待完成
- **描述**: 使用 Monaco Editor 编辑远程文本文件
- **涉及文件**:
  - `src/components/sftp/FileEditor.tsx` — 新建

#### Task 3.5: SFTP 前端 - 拖拽上传
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/sftp/FileExplorer.tsx` — 添加拖拽支持

---

### Task 4: Phase 2 补全 - MySQL/PostgreSQL 客户端完善

#### Task 4.1: DatabaseTree 组件
- **状态**: ❌ 待完成
- **描述**: 实现数据库/表/视图树形浏览组件
- **涉及文件**:
  - `src/components/database/DatabaseTree.tsx` — 新建
  - `src/pages/DatabasePage.tsx` — 集成 DatabaseTree

#### Task 4.2: 数据导出功能
- **状态**: ❌ 待完成
- **描述**: 支持 CSV、JSON、SQL 格式导出
- **涉及文件**:
  - `src-tauri/src/commands/database.rs` — 添加导出 commands
  - `src/components/database/ExportDialog.tsx` — 新建

---

## 🟡 中优先级任务

### Task 5: Phase 1 补全 - SSH 终端完善

#### Task 5.1: 跳板机（Jump Host）连接
- **状态**: ❌ 待完成
- **描述**: 类型定义 `JumpHostConfig` 已存在，需在后端 russh 中实现多跳连接
- **涉及文件**:
  - `src-tauri/src/modules/ssh/client.rs` — 添加跳板机逻辑

#### Task 5.2: SSH 断开重连机制
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/ssh/SSHTerminal.tsx` — 添加重连 UI
  - `src-tauri/src/modules/ssh/client.rs` — 添加重连逻辑

---

### Task 6: Phase 2 - SQLite 客户端（全新实现）

#### Task 6.1: SQLite 后端
- **状态**: ❌ 待完成
- **需实现的 commands**:
  - `sqlite_open(path)` → `Result<String, String>`
  - `sqlite_create(path)` → `Result<String, String>`
  - `sqlite_query(session_id, sql)` → `Result<QueryResult, String>`
  - `sqlite_list_tables(session_id)` → `Result<Vec<String>, String>`
  - `sqlite_describe_table(session_id, table)` → `Result<Vec<HashMap>, String>`
- **涉及文件**:
  - `src-tauri/src/commands/sqlite.rs` — 新建
  - `src-tauri/src/commands/mod.rs` — 注册
  - `src-tauri/src/main.rs` — 注册 commands

#### Task 6.2: SQLite 前端
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/pages/DatabasePage.tsx` — 支持 SQLite 连接类型
  - `src/components/connection/ConnectionDialog.tsx` — 支持 SQLite 文件选择

---

### Task 7: Phase 2 - Redis 客户端（全新实现）

#### Task 7.1: Redis 后端
- **状态**: ❌ 待完成
- **需实现的 commands**:
  - `redis_connect(host, port, password?, database?)` → `Result<String, String>`
  - `redis_keys(session_id, pattern)` → `Result<Vec<String>, String>`
  - `redis_get(session_id, key)` → `Result<RedisValue, String>`
  - `redis_set(session_id, key, value)` → `Result<(), String>`
  - `redis_del(session_id, key)` → `Result<(), String>`
  - `redis_ttl(session_id, key)` → `Result<i64, String>`
  - `redis_type(session_id, key)` → `Result<String, String>`
- **涉及文件**:
  - `src-tauri/Cargo.toml` — 添加 redis-rs 依赖
  - `src-tauri/src/commands/redis.rs` — 新建
  - `src-tauri/src/modules/database/redis.rs` — 新建

#### Task 7.2: Redis 前端
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/pages/RedisPage.tsx` — 新建
  - `src/components/redis/KeyBrowser.tsx` — 新建
  - `src/components/redis/ValueViewer.tsx` — 新建

---

### Task 8: Phase 3 - SQL 查询历史

#### Task 8.1: 查询历史后端
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src-tauri/src/modules/database/mod.rs` — 添加 query_history 表
  - `src-tauri/src/commands/history.rs` — 新建

#### Task 8.2: 查询历史前端
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/database/QueryHistory.tsx` — 新建
  - `src/stores/useQueryHistoryStore.ts` — 新建

---

### Task 9: Phase 3 - 数据导入/导出

#### Task 9.1: 导入/导出后端
- **状态**: ❌ 待完成
- **需实现的 commands**:
  - `export_data(conn_id, sql, format, output_path)` → `Result<(), String>`
  - `import_sql(conn_id, file_path)` → `Result<ImportResult, String>`
- **涉及文件**:
  - `src-tauri/src/commands/export.rs` — 新建

#### Task 9.2: 导入/导出前端
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/database/ImportExportDialog.tsx` — 新建

---

## 🟢 低优先级任务

### Task 10: Phase 3 - 快捷指令
- **状态**: ❌ 待完成
- **描述**: 预设命令管理、变量替换、批量执行、导入/导出
- **涉及文件**: 待定

### Task 11: Phase 3 - 多窗口支持
- **状态**: ❌ 待完成
- **描述**: Tauri 多窗口 API 实现
- **涉及文件**:
  - `src-tauri/src/commands/window.rs` — 新建

### Task 12: 表数据内联编辑
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/database/ResultTable.tsx` — 添加编辑功能

### Task 13: 执行计划分析（EXPLAIN）
- **状态**: ❌ 待完成
- **涉及文件**:
  - `src/components/database/ExplainView.tsx` — 新建

---

## 🔧 质量与优化任务

### Task 14: 代码清理
- **状态**: ❌ 待完成
- **描述**: 清理大量 `console.log` 调试语句（MainLayout, ConnectionsPage, SSHPage, SSHTerminal 等文件中）

### Task 15: 统一错误处理
- **状态**: ❌ 待完成
- **描述**: 前端实现 toast 通知系统，后端实现 `DevHubError` 统一错误类型
- **涉及文件**:
  - `src-tauri/src/error.rs` — 新建
  - `src/hooks/useToast.ts` — 新建

### Task 16: 单元测试
- **状态**: ❌ 待完成
- **描述**: 前端 Vitest + 后端 Rust tests
- **涉及文件**:
  - `tests/` — 添加测试文件
  - `src-tauri/src/` — 各模块添加 `#[cfg(test)]` 测试

### Task 17: 性能优化
- **状态**: ❌ 待完成
- **描述**: 虚拟滚动（react-window）、代码分割（React.lazy）、连接池复用

---

## 📋 推荐实施顺序

1. **Task 1** (基础框架完善) — 主题集成 + shadcn/ui 补全
2. **Task 2** (资产管理完善) — 分组 CRUD + 密码加密
3. **Task 4** (MySQL/PG 完善) — DatabaseTree 组件
4. **Task 3** (SFTP 文件管理) — 全新实现，工作量最大
5. **Task 6** (SQLite 客户端)
6. **Task 7** (Redis 客户端)
7. **Task 8** (SQL 查询历史)
8. **Task 9** (数据导入/导出)
9. **Task 5** (SSH 完善) — 跳板机 + 重连
10. **Task 14-17** (质量优化)
11. **Task 10-13** (低优先级功能)
