---
document: feature-tasks
feature: F004
status: completed
updated: "2026-11-26"
---

# F004 · 本地 ZIP 打包导出、Agent 启动口令与沙箱逃生舱任务清单

## 任务规则

按依赖顺序执行，真实检查通过后勾选。

## 任务清单

- [x] T001 实现顶层一次性 项目启动.md 与本地 Agent 开场白口令生成器（含阶段打开指引、待补充追问清单与用后自清理指令）
  - 来源：PSC-007, AC-F004-002
  - 依赖：无
  - 修改：frontend/src/engine/templateRenderer.ts
  - 完成证据：项目启动.md 包含自清理指令与双模式流程指引
  - 验证：EV-F004-002 (npm test)

- [x] T002 实现内联 JSZip 内存打包器（buildZipBlob）：顶层平铺 1 级阶段目录 + 项目启动.md，完整写入全部文本文件、Python 脚本与 .gitkeep
  - 来源：PSC-004, PSC-007, AC-F004-001
  - 依赖：T001
  - 修改：frontend/src/engine/zipExporter.ts
  - 完成证据：JSZip 生成并解包后的文件路径与内容 100% 匹配
  - 验证：EV-F004-001 (npm test)

- [x] T003 实现 WorkBuddy 沙箱逃生舱生成器：一键生成可在本地终端直接执行的自包含初始化 Shell 脚本（buildFallbackShellScript）
  - 来源：PSC-007, PSC-008, AC-F004-003
  - 依赖：T001
  - 修改：frontend/src/engine/zipExporter.ts
  - 完成证据：生成的 Shell 脚本包含完整 mkdir 与文件写入指令
  - 验证：EV-F004-003 (npm test)

- [x] T004 实现交付与接管指引弹窗组件（ExportModal）：整合 ZIP 重新下载、Agent 开场白一键复制、项目启动.md 复制与沙箱 Shell 脚本复制
  - 来源：PSC-007, PSC-008, AC-F004-002, AC-F004-003
  - 依赖：T002, T003
  - 修改：frontend/src/components/ExportModal.tsx
  - 完成证据：弹窗交互与复制反馈正常
  - 验证：EV-F004-002, EV-F004-003 (npm test)

- [x] T005 配置 vite-plugin-singlefile 构建管线并编写单文件 HTML 自包含校验测试（确保 dist/index.html 无外部 JS/CSS 引用）
  - 来源：PSC-008, AC-F004-003
  - 依赖：T004
  - 修改：frontend/vite.config.ts, frontend/scripts/verify_singlefile.mjs
  - 完成证据：npm run build 产出单文件 HTML 且零外链校验通过
  - 验证：EV-F004-003 (npm test & build)

- [x] T006 编写 F004 ZIP 打包解包完整性、项目启动.md 自清理指令与沙箱逃生舱自动化测试
  - 来源：PSC-004, PSC-007, PSC-008, AC-F004-001, AC-F004-002, AC-F004-003
  - 依赖：T005
  - 修改：frontend/src/__tests__/zip.test.ts
  - 完成证据：JSZip 解包断言测试全部通过
  - 验证：EV-F004-001, EV-F004-002, EV-F004-003 (npm test)

## Task 数量复核

- 任务总数：6
- 原因：不适用（在 6～18 标准区间内）

## 执行记录

2026-11-26：全部 Task 已完成，Vitest 自动化测试（5 套件）与单文件 HTML 构建校验（verify_singlefile.mjs）全部通过。
