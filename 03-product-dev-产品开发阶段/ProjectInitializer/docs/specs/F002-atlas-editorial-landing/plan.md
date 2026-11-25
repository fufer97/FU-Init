---
document: feature-plan
feature: F002
status: ready
updated: "2026-11-26"
---

# F002 · Atlas 画册风图录首页与快捷预设实施计划

## 现有上下文与复用

复用 `../Raw/` 中已确认的字段清单、模板与 `.agents/skills/` 中已清洗的通用技能资产。

## 影响范围

集中在 `frontend/src/` 下的类型、数据、引擎、组件与 `frontend/src/__tests__/` 测试目录。

## 实现方案

采用 TypeScript 纯函数引擎驱动 React 单页视图，所有资产在构建期静态内联。

## 实施顺序

按 `tasks.md` 中 `T001`～`T006` 依赖顺序依次推进并逐项验证。

## 依赖与风险

- 依赖：Node.js / Vite / JSZip / `vite-plugin-singlefile`。
- 风险与应对：沙箱环境可能限制 Blob 下载或 localStorage，通过 `try/catch` 存储降级与 Shell 脚本逃生舱兜底。

## 回退策略

每个模块均为纯前端无副作用代码，出现问题可按模块回退重构建。

## 验收映射

| AC | Eval | 实现结果 | 最窄验证方法 | 预期证据 |
|---|---|---|---|---|
| AC-F002-001 | EV-F002-001 | 页面采用暖纸白 #FAF9F6 画布、深墨绿黑 #17201B 主文字、修长衬线标题 × 等宽编号 W01..W03 × 无衬线说明，无渐变发光与装饰 Emoji | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F002-002 | EV-F002-002 | 激活胶囊切换为深墨实心底配浅纸字，下方 16:10 画册卡片列表即时过滤显示对应方案 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F002-003 | EV-F002-003 | 原子更新 presetId、selectedStages 与 devMode 并平滑进入第 2 页全局配置（或直达第 3 页目录工作台） | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
