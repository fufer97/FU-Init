# Project Atlas · 一键项目初始化

面向 AI 时代软件工程五阶段生命周期的可视化目录骨架、上下文模板与双模式开发技能包一键配置与 ZIP 导出工具（支持单文件 HTML 直发 WorkBuddy 资料库）。

## 当前范围

- 目标用户：独立操盘手 / 一人全栈、AI 时代产品经理（PM）、前线交付工程师（FDE）。
- P0 核心旅程：`01 方案图册选预设` → `02 全局配置语言/主力 Agent/五阶段与双模式` → `03 树形轻编辑调序与文件全文实时预览` → `一键下载顶层平铺 ZIP 包 + 复制本地 Agent 开场白口令（含沙箱脚本逃生舱）`。
- 本次实现：`F001`～`F004` 全量功能及单文件 `dist/index.html` 构建产物。
- 明确不做：不调用任何在线 LLM API，不建立后端数据库，不收录本体/OCR 等领域专项技能。

## 项目结构

- `frontend/`：前端源码、内置五阶段模板与 12/6 双模式 Skills 数据包、Vitest 测试套件与 `vite-plugin-singlefile` 单文件构建配置。
- `backend/`：纯前端应用保留目录。
- `docs/`：产品总规格（`docs/specs/product-spec.md`）、功能地图（`docs/specs/feature-map.md`）、`F001`～`F004` 规格三件套、技术架构（`docs/architecture/architecture.md`）与验证交付记录。
- `evals/`：`F001.json`～`F004.json` 验收用例定义与自动化测试绑定。

## 快速开始

```bash
cd frontend
npm install
npm test
npm run build
```

构建完成后，`frontend/dist/index.html` 即为可直接在浏览器双击打开或上传至 WorkBuddy「资料库 → 发布为网站」的单个自包含 HTML 文件。
