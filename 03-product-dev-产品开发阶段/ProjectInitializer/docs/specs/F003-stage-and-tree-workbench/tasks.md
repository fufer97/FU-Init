---
document: feature-tasks
feature: F003
status: completed
updated: "2026-11-26"
---

# F003 · 全局配置与树形轻编辑实时预览工作台任务清单

## 任务规则

按依赖顺序执行，真实检查通过后勾选。

## 任务清单

- [x] T001 实现第 2 页语言三选一控制器、主力 Agent 单选卡与五阶段（01..05）多选卡片（含最少 1 个阶段防呆拦截 EX-01）
  - 来源：PSC-001, PSC-003, AC-F003-001
  - 依赖：无
  - 修改：frontend/src/components/GlobalConfigStep.tsx
  - 完成证据：阶段防空拦截与语言/Agent 切换正常
  - 验证：EV-F003-001 (npm test)

- [x] T002 实现第 2 页开发阶段双模式智能状态横幅与单选 03 时的「切换为精简开发模式」手动覆写开关
  - 来源：PSC-002, AC-F003-001
  - 依赖：T001
  - 修改：frontend/src/components/GlobalConfigStep.tsx
  - 完成证据：双模式横幅与手动开关状态同步准确
  - 验证：EV-F003-001 (npm test)

- [x] T003 实现第 2 页可选项目元信息表单（项目名、英文工程名、一句话简介、技术栈）与 JSON 配置导入/导出（含 EX-03 错误拦截）
  - 来源：PSC-001, PSC-006, PSC-008, AC-F003-001, AC-F003-003
  - 依赖：T002
  - 修改：frontend/src/components/GlobalConfigStep.tsx
  - 完成证据：元信息注入与 JSON 导入导出校验通过
  - 验证：EV-F003-003 (npm test)

- [x] T004 实现第 3 页左栏阶段树形轻编辑器（勾选/锁定保护 EX-02、同级上移/下移调序、行内新增自定义文件夹/文件、重命名与删除）
  - 来源：PSC-003, PSC-004, PSC-006, AC-F003-002
  - 依赖：T001
  - 修改：frontend/src/components/TreeWorkbenchStep.tsx
  - 完成证据：节点调序后序号重排与自定义节点新增正常
  - 验证：EV-F003-002 (npm test)

- [x] T005 实现第 3 页右栏双页签实时预览器（页签 A：含自动 3 级 README 与 .gitkeep 标记的完整产出目录树；页签 B：任意文件真实渲染正文预览与复制）
  - 来源：PSC-004, PSC-006, AC-F003-002, AC-F003-003
  - 依赖：T004
  - 修改：frontend/src/components/TreeWorkbenchStep.tsx
  - 完成证据：点击任意文件实时显示真实渲染正文
  - 验证：EV-F003-002, EV-F003-003 (npm test)

- [x] T006 编写 F003 树形调序、自定义节点、JSON 导入校验与实时预览一致性测试
  - 来源：PSC-001, PSC-002, PSC-003, PSC-004, PSC-006, PSC-008, AC-F003-001, AC-F003-002, AC-F003-003
  - 依赖：T003, T005
  - 修改：frontend/src/__tests__/workflow.test.ts
  - 完成证据：Vitest 工作台测试全部通过
  - 验证：EV-F003-001, EV-F003-002, EV-F003-003 (npm test)

## Task 数量复核

- 任务总数：6
- 原因：不适用（在 6～18 标准区间内）

## 执行记录

2026-11-26：全部 Task 已完成，Vitest 自动化测试（5 套件）与单文件 HTML 构建校验（verify_singlefile.mjs）全部通过。
