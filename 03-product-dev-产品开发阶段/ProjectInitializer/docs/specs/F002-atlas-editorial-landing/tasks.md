---
document: feature-tasks
feature: F002
status: completed
updated: "2026-11-26"
---

# F002 · Atlas 画册风图录首页与快捷预设任务清单

## 任务规则

按依赖顺序执行，真实检查通过后勾选。

## 任务清单

- [x] T001 配置 Tailwind 暖纸色阶（#FAF9F6/#17201B/#5B615C/#E6EBE4/#E2E1DC）与衬线/等宽/无衬线字体排版规则
  - 来源：PSC-005, PSC-008, AC-F002-001
  - 依赖：无
  - 修改：frontend/index.html, frontend/tailwind.config.js, frontend/src/index.css
  - 完成证据：样式 Token 与 unslop 规范核对通过
  - 验证：EV-F002-001 (npm test)

- [x] T002 实现顶部 56px Sticky 极简 1px 细黑线导航栏与三步切换器（01 方案图册 / 02 全局配置 / 03 目录工作台与导出）
  - 来源：PSC-005, AC-F002-001
  - 依赖：T001
  - 修改：frontend/src/components/TopNav.tsx
  - 完成证据：导航栏步骤指示与切换正常
  - 验证：EV-F002-001 (npm test)

- [x] T003 实现药丸形分类筛选胶囊条与计数徽章交互
  - 来源：PSC-005, AC-F002-002
  - 依赖：T001
  - 修改：frontend/src/components/AtlasLanding.tsx
  - 完成证据：胶囊筛选过滤断言通过
  - 验证：EV-F002-002 (npm test)

- [x] T004 绘制 W01（设计+开发联动）、W02（产品设计专精）、W03（完整 FDE 工程交付）三张 16:10 精致内联架构画板与三点色板圆点卡片
  - 来源：PSC-005, PSC-008, AC-F002-001
  - 依赖：T003
  - 修改：frontend/src/components/AtlasLanding.tsx
  - 完成证据：三张 16:10 卡片与三点色板渲染完整
  - 验证：EV-F002-001 (npm test)

- [x] T005 绑定卡片点击应用预设（applyPreset）并跳转至第 2 页或直达第 3 页的联动逻辑
  - 来源：PSC-001, PSC-002, PSC-005, AC-F002-003
  - 依赖：T004
  - 修改：frontend/src/components/AtlasLanding.tsx, frontend/src/App.tsx
  - 完成证据：点击卡片后全局状态与步骤切换正确
  - 验证：EV-F002-003 (npm test)

- [x] T006 编写 F002 图册页预设筛选与带入逻辑自动化测试
  - 来源：PSC-001, PSC-002, PSC-005, PSC-008, AC-F002-001, AC-F002-002, AC-F002-003
  - 依赖：T005
  - 修改：frontend/src/__tests__/workflow.test.ts
  - 完成证据：Vitest 测试通过
  - 验证：EV-F002-001, EV-F002-002, EV-F002-003 (npm test)

## Task 数量复核

- 任务总数：6
- 原因：不适用（在 6～18 标准区间内）

## 执行记录

2026-11-26：全部 Task 已完成，Vitest 自动化测试（5 套件）与单文件 HTML 构建校验（verify_singlefile.mjs）全部通过。
