---
document: feature-plan
feature: F001
status: ready
updated: "2026-11-26"
---

# F001 · 五阶段目录计算与双模式技能资产引擎实施计划

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
| AC-F001-001 | EV-F001-001 | 同时选 02+03 时自动设为 linked 模式并挂载 6 个精简核心技能；单选 03 时默认 full 模式挂载 12 个通用技能且支持手动切为 linked | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F001-002 | EV-F001-002 | 1 级阶段保持 01..05 固定前缀；2 级及以下 numbered:true 的已勾选目录按当前顺序严格从 1- 连续重排（双语为 1-context-业务上下文）；Raw/.agents/AGENTS.md 等免序号节点保持原名 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F001-003 | EV-F001-003 | 所有 3 级及以下已勾选文件夹自动生成导航 README.md；所有 2 级空文件夹自动生成 .gitkeep；2 级文件夹不生成 README.md；项目元信息单点注入所有 AGENTS.md 与模板且无任何赋范品牌或个人硬编码残留 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
