---
document: architecture
status: confirmed
updated: "2026-11-26"
---

# Project Atlas · 一键项目初始化 技术架构

## 技术选择

| 层级 | 方案与版本 | 用途 | 选择理由 |
|---|---|---|---|
| 前端框架 | React 18 + TypeScript 5 + Vite 5 | 三步可视化配置工作台、实时树形编辑与单文件预览 | 强类型保障 `ProjectInitConfig` 与 `TreeNode` 计算引擎零偏差 |
| 样式与图标 | Tailwind CSS v3 + Lucide React | 实现 Oil UI `#atlas` 画册风（`#FAF9F6` 暖纸色板、衬线×等宽×无衬线排版） | 符合 `unslop` 4px 网格与统一 16px/1.5 线条图标要求 |
| 客户端打包引擎 | JSZip（浏览器端内联打包） | 在浏览器本地瞬间将动态目录树、模板与 Skills 打包为 `.zip` | 零后端依赖，支持空目录 `.gitkeep` 与多层级文件打包 |
| 单文件发布构建 | `vite-plugin-singlefile` | 将所有 JS、CSS、模板与 12 个通用 Skills 资产内联编译为单个 `dist/index.html` | 100% 适配 WorkBuddy「资料库 → 发布为网站」仅接受单个 `.html` 文件的硬性约束 |
| 自动化测试 | Vitest + Node 校验脚本 | 对命名/重排算法、双模式切换、模板渲染、ZIP 解包结构进行确定性回归测试 | 快速、零外部依赖，可直接绑定至 `evals/F001..F004.json` |

## 服务与目录边界

- `frontend/`：全部 Web 配置器源码、内置五阶段模板与 12 技能数据包（`src/data/`）、核心计算与打包引擎（`src/engine/`）、三页 UI 组件（`src/components/`）、单元测试（`src/__tests__/`）及单文件构建配置。
- `backend/`：纯前端单页静态应用，无需后端运行时服务；`backend/` 仅保留空的工程目录契约。
- 根目录跨服务文件：无。

## 请求、数据与运行链

1. **构建期资产内联**：构建前通过 `frontend/scripts/bundle_skills_data.mjs` 将本阶段清洗好的 12 个通用软件工程 Skills（6 个核心技能的双模式版本 + 6 个完整模式前置技能）与 02 设计阶段三大标准模板序列化为静态 TypeScript 数据模块 `frontend/src/data/bundledSkills.ts`，随 `vite-plugin-singlefile` 一并打入单个 `dist/index.html`。
2. **运行期纯本地状态流**：
   `用户选择预设/修改配置 (ProjectInitConfig)` → `目录树与序号重算引擎 (computeResolvedTree)` → `文件模板动态渲染器 (renderFileContent)` → `右侧目录树与文件全文实时预览 / JSZip 生成 ZIP Blob + 沙箱兜底 Shell 脚本生成`。

## 外部服务与安全边界

- **无外部服务**：运行时不发起任何外部 API 或 CDN 请求，不调用任何 LLM，所有数据在本地浏览器内存中处理；`localStorage` 读写统一包裹 `try/catch`，确保在严格 `<iframe sandbox>` 下依然 100% 正常运行。
