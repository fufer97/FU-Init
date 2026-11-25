---
document: feature-tasks
feature: F001
status: completed
updated: "2026-11-26"
---

# F001 · 五阶段目录计算与双模式技能资产引擎任务清单

## 任务规则

按依赖顺序执行，真实检查通过后勾选。

## 任务清单

- [x] T001 定义 ProjectInitConfig、TreeNode 与三种预设方案（W01/W02/W03）类型及默认 Schema
  - 来源：PSC-001, AC-F001-001
  - 依赖：无
  - 修改：frontend/src/types/config.ts, frontend/src/data/stageBlueprints.ts
  - 完成证据：类型检查与预设数据断言通过
  - 验证：EV-F001-001 (npm test)

- [x] T002 编写构建期脚本提取清洗后的 12 个通用软件工程 Skills（含 6 个精简版差量）为前端内联数据模块
  - 来源：PSC-002, PSC-008, AC-F001-001
  - 依赖：T001
  - 修改：frontend/scripts/bundle_skills_data.mjs, frontend/src/data/bundledSkills.ts
  - 完成证据：bundledSkills.ts 包含 12 个完整技能与 6 个精简技能且无 FF/@FUF/skyforge 字符串
  - 验证：EV-F001-001, EV-F001-003 (npm test)

- [x] T003 实现开发阶段双模式状态机（自动判定 full/linked 与 devModeOverride 手动覆写）
  - 来源：PSC-002, AC-F001-001
  - 依赖：T001
  - 修改：frontend/src/engine/treeEngine.ts
  - 完成证据：双模式切换单元测试通过
  - 验证：EV-F001-001 (npm test)

- [x] T004 实现三语言目录命名格式与同级从 1 连续重排及免序号白名单计算函数
  - 来源：PSC-003, AC-F001-002
  - 依赖：T003
  - 修改：frontend/src/engine/treeEngine.ts
  - 完成证据：zh/en/bilingual 及调序重排单元测试通过
  - 验证：EV-F001-002 (npm test)

- [x] T005 实现 3 级及以下自动生成 README.md、2 级空目录自动生成 .gitkeep 及 1 级 AGENTS.md 动态索引渲染器
  - 来源：PSC-004, AC-F001-003
  - 依赖：T004
  - 修改：frontend/src/engine/templateRenderer.ts
  - 完成证据：3 级 README 与 2 级 .gitkeep 注入断言通过
  - 验证：EV-F001-003 (npm test)

- [x] T006 编写 F001 引擎完整 Vitest 单元测试套件并验证通过
  - 来源：PSC-001, PSC-002, PSC-003, PSC-004, PSC-008, AC-F001-001, AC-F001-002, AC-F001-003
  - 依赖：T002, T005
  - 修改：frontend/src/__tests__/engine.test.ts
  - 完成证据：Vitest 引擎测试全部绿灯通过
  - 验证：EV-F001-001, EV-F001-002, EV-F001-003 (npm test)

## Task 数量复核

- 任务总数：6
- 原因：不适用（在 6～18 标准区间内）

## 执行记录

2026-11-26：全部 Task 已完成，Vitest 自动化测试（5 套件）与单文件 HTML 构建校验（verify_singlefile.mjs）全部通过。
