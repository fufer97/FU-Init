---
document: feature-plan
feature: F003
status: ready
updated: "2026-11-26"
---

# F003 · 全局配置与树形轻编辑实时预览工作台实施计划

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
| AC-F003-001 | EV-F003-001 | 至少保留 1 个阶段（防空保护 EX-01）；双模式状态横幅准确反映 6 技能精简模式或 12 技能完整模式；主力 Agent 切换准确决定 .agents/rules/ 与 .antigravityignore 生成 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F003-002 | EV-F003-002 | UI 勾选树隐藏 3 级 README.md 与 .gitkeep；锁定节点不可取消（EX-02）；同级 numbered:true 目录序号实时从 1- 重排；右栏完整目录树与 AGENTS.md 索引表同步刷新 | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
| AC-F003-003 | EV-F003-003 | 右栏实时展示注入项目名/技术栈/当前语言路径后的完整文件正文并支持一键复制；非法 JSON 导入被安全拦截并提示中文错误（EX-03） | 运行 Vitest 自动化断言与构建核验 | 测试通过记录与构建产物 |
