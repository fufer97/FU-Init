---
document: feature-map
status: confirmed
mode: linked
upstream: ../Raw/HANDOFF.md
product_spec: docs/specs/product-spec.md
updated: "2026-11-26"
---

# Project Atlas · 一键项目初始化 Feature Map

## 拆分原则

- 按用户可感知的核心功能闭环与底层确定性引擎拆分为 4 个可独立验证的 Feature（`F001`～`F004`）。
- 本表确认后是 Feature 边界、`PSC-001`～`PSC-008` 归属和依赖的唯一事实源。

## Feature Map

| Feature ID | 目录 | Feature | 可验证结果与产物 | 来源合同 | 依赖 | 优先级 | 状态 |
|---|---|---|---|---|---|:---:|---|
| F001 | F001-schema-and-bundle-engine | 五阶段目录计算与双模式技能资产引擎 | 输入任意 `ProjectInitConfig` 与节点调序操作，确定性输出多语言重排目录树、动态 `AGENTS.md`/`README.md`/`.gitkeep` 与 12/6 双模式去品牌化 Skills 资产包 | PSC-001, PSC-002, PSC-003, PSC-004, PSC-008 | 无 | P0 | completed |
| F002 | F002-atlas-editorial-landing | Atlas 画册风图录首页与快捷预设 | 呈现暖纸画册风首屏、场景胶囊筛选器及 `W01..W03` 三张 `16:10` 架构画板卡片，点击一键带入对应预设方案 | PSC-001, PSC-002, PSC-005, PSC-008 | F001 | P0 | completed |
| F003 | F003-stage-and-tree-workbench | 全局配置与树形轻编辑实时预览工作台 | 完成语言、主力 Agent、五阶段、双模式手动覆写、可选元信息及 JSON 导入导出；支持左树勾选/上下调序/自定义节点与右侧完整目录树及文件全文实时预览 | PSC-001, PSC-002, PSC-003, PSC-004, PSC-006, PSC-008 | F001, F002 | P0 | completed |
| F004 | F004-zip-export-and-bootstrap-handoff | 本地 ZIP 打包导出、Agent 启动口令与沙箱逃生舱 | 浏览器端内联 JSZip 一键导出顶层平铺 ZIP 包（含一次性 `项目启动.md`），并在交付弹窗提供 Agent 开场白一键复制与 WorkBuddy 沙箱 Shell 脚本兜底 | PSC-004, PSC-007, PSC-008 | F001, F003 | P0 | completed |

## 拆分依据与交付顺序

- 拆分主线与理由：按「底层确定性数据与计算引擎（F001）→ 第 1 页画册图录入口（F002）→ 第 2/3 页配置与树形预览工作台（F003）→ ZIP 打包与沙箱逃生舱交付闭环（F004）」推进，每一层均可独立单测与界面验收。
- F001：纳入五阶段默认树 Schema、三语言与每级从 1 重排算法、双模式（12 技能 / 6 技能）资产序列化与模板变量渲染器；明确不含 DOM 界面渲染；边界依据 `PSC-001`～`PSC-004`、`PSC-008`。
- F002：纳入顶栏三步导航、`#atlas` 画册序言、胶囊筛选与 `W01..W03` 卡片组件；明确不含树节点编辑；边界依据 `PSC-005`。
- F003：纳入第 2 页全局配置表单、双模式联动横幅与手动开关、JSON 配置导入导出，以及第 3 页左树轻编辑器与右栏双模实时预览器；边界依据 `PSC-002`、`PSC-003`、`PSC-006`。
- F004：纳入 JSZip 内存打包器、交付指引弹窗、Agent 启动口令生成器与沙箱 Shell 脚本生成器；边界依据 `PSC-007`、`PSC-008`。
- 交付顺序与依赖依据：`F001 → F002 → F003 → F004`，最终通过 `vite-plugin-singlefile` 统一编译为单个 `dist/index.html`。
- 首批可验证结果与后续组合验收：`F001` 通过 Vitest 引擎单测；`F002`～`F004` 通过组件测试、单文件 HTML 构建检查与真实浏览器交互验收。
- 影响边界或顺序的关键取舍：将 12 个清洗后的通用 Skills 在构建前通过脚本生成强类型内联数据模块，使前端运行时零网络请求即可秒级预览与打包。

## 范围外与延期项

- 已确认范围外：不调用在线 LLM API、不建后端服务、不收录 9 个领域专项（本体/OCR）技能与 Codex 专属技能。
- 已批准延期：`01-需求收集`、`04-产品测试`、`05-产品运维` 阶段的高级专项 Skills 待后续专题扩充（本期内置可扩展标准目录骨架）。

## 变更记录

| 日期 | 变化 | 影响 | 确认依据 |
|---|---|---|---|
| 2026-11-26 | 初稿建立并确认 | F001 ~ F004 | 已批准的 `implementation_plan.md` 与 `product-spec.md` |
