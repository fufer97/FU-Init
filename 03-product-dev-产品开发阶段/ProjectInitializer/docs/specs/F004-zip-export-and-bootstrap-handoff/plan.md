---
document: feature-plan
feature: F004
status: ready
updated: "2026-11-26"
---

# F004 · 本地 ZIP 打包导出、Agent 启动口令与沙箱逃生舱实施计划

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
| AC-F004-001 | EV-F004-001 | ZIP 顶层不含 0 级项目文件夹，直接平铺所选 1 级阶段目录与 项目启动.md；内部完整包含 3 级 README.md、2 级空目录 .gitkeep 与对应模式的 .agents/skills/ 全套脚本模板 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F004-002 | EV-F004-002 | 明确指导用户用 Antigravity 打开 1 级阶段目录作为工作区、引导补全【待补充】项，并包含初始化完成后将 项目启动.md 归档至 drafts/ 或删除的自清理指令 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F004-003 | EV-F004-003 | 构建产物为单个零外部 script/link 引用的 HTML 文件；交付弹窗提供一键复制本地自动初始化 Shell 脚本与复制 项目启动.md 逃生舱（EX-04） | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
