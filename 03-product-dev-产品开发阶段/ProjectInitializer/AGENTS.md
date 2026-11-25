# AGENTS.md — ProjectInitializer

> `Project Atlas · 一键项目初始化`：面向 AI 时代软件工程五阶段生命周期的可视化目录骨架、上下文模板与双模式开发技能包一键配置与 ZIP 导出工具。

## 项目定位

- 项目根目录名：`ProjectInitializer`
- 对外产品名：`Project Atlas · 一键项目初始化`
- 目标用户与场景：独立操盘手/一人全栈、AI 时代产品经理（PM）、前线交付工程师（FDE），在新项目启动时一键可视化生成多语言五阶段目录、防跑偏上下文模板与双模式开发 Skills 包。
- P0 核心旅程：`01 方案图册页点选预设卡片（W01/W02/W03）` → `02 全局配置页选择语言、主力 Agent、阶段与双模式及可选元信息` → `03 树形工作台勾选/调序/预览文件全文` → `一键下载顶层平铺 ZIP 包并复制本地 Agent 启动口令（含 WorkBuddy 沙箱脚本兜底）`。
- 当前范围：`F001`（五阶段目录计算与双模式技能资产引擎）、`F002`（Atlas 画册风图录首页）、`F003`（全局配置与树形轻编辑实时预览工作台）、`F004`（本地 ZIP 打包导出、Agent 启动口令与沙箱逃生舱）。
- 明确不做：不调用任何在线 LLM API、不建后端数据库、不在 `.antigravityignore` 预写 `reference/`、不收录 9 个领域专项（本体/OCR）技能与 Codex 专属技能。

## 产品语言与界面约束

- 用户可见名称使用 `Project Atlas · 一键项目初始化`。
- 严格遵循 Oil UI `#atlas` 画册编辑美学与 `unslop` 规范：暖纸白底色 `#FAF9F6`、深墨绿黑主字 `#17201B`、橄榄灰次级字 `#5B615C`、鼠尾草绿胶囊 `#E6EBE4`、1px 细线 `#E2E1DC`；修长衬线标题 × 等宽编号 × 无衬线正文；严禁霓虹渐变、发光阴影与装饰 Emoji。

## 目录与架构边界

- 上游 `02-产品设计阶段` 交接资料位于 `../Raw/`（以 `../Raw/HANDOFF.md` 为索引入口）。
- 本项目采用精简联动模式（`mode: linked`），由 `docs/specs/product-spec.md` 直接承接 `../Raw/`，不维护冗余的 `docs/PRD.md`。

```text
ProjectInitializer/
├── frontend/  # React 18 + TypeScript + Tailwind CSS + JSZip + vite-plugin-singlefile 单文件应用
├── backend/   # 纯前端单页静态应用，无需后端服务
├── docs/      # Product Spec、Feature 规格三件套、架构和验证证据
├── evals/     # F001..F004 与 product 验收套件
├── README.md
└── AGENTS.md
```

## 技术基线与真实命令

- 前端：React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + Lucide React + JSZip + `vite-plugin-singlefile`（入口：`frontend/index.html` 与 `frontend/src/main.tsx`）
- 后端：纯前端静态单页应用，无后端服务
- 安装：`cd frontend && npm install`
- 启动：`cd frontend && npm run dev`
- 测试与构建：`cd frontend && npm test && npm run build`（产出单个自包含文件 `frontend/dist/index.html`）
