---
document: feature-spec
feature: F004
status: ready
updated: "2026-11-26"
---

# F004 · 本地 ZIP 打包导出、Agent 启动口令与沙箱逃生舱规格

## 目标与可观察结果

使用浏览器内联 JSZip 生成顶层不含 0 级项目目录的标准 ZIP 初始化包（含一次性 项目启动.md），并提供本地 Agent 开场白一键复制与 WorkBuddy 沙箱下载兜底逃生舱。

## 来源与范围

- 来源总规格：PSC-004, PSC-007, PSC-008
- 上游设计交接：`../Raw/HANDOFF.md`
- 本 Feature 包含：使用浏览器内联 JSZip 生成顶层不含 0 级项目目录的标准 ZIP 初始化包（含一次性 项目启动.md），并提供本地 Agent 开场白一键复制与 WorkBuddy 沙箱下载兜底逃生舱。
- 本 Feature 不包含：不属于本模块的跨层职责或任何在线 LLM 调用。

## 用户旅程与状态

| 入口/前置 | 用户动作或调用触发 | 过程与反馈 | 对象状态变化 | 可观察结果 | 下一步/消费方 |
|---|---|---|---|---|---|
| 应用已加载 | 触发 F004 核心操作 | 纯函数计算并更新响应式状态 | `ProjectInitConfig` / `ResolvedArtifactBundle` 同步 | 界面预览或导出产物即时呈现 | 下游模块或本地 Agent |

## 功能行为

严格按照 `../Raw/业务PRD.md` 与对应页面 Demo 版 PRD 实现确定性状态流转与视图渲染。

## 异常与恢复

| 情况 | 使用者/消费方可观察状态 | 系统行为 | 恢复/重试 |
|---|---|---|---|
| 非法输入或受限沙箱环境 | 显示明确中文提示或启用沙箱逃生舱 | 拦截非法变更，保留已有配置状态 | 重新选择有效项或复制沙箱脚本 |

## 验收标准

### AC-F004-001 · 调用 buildZipBlob 生成 ZIP 压缩包并解包检查

- 来源：PSC-004, PSC-007
- Given 用户点击「打包下载初始化 ZIP」
- When 调用 buildZipBlob 生成 ZIP 压缩包并解包检查
- Then ZIP 顶层不含 0 级项目文件夹，直接平铺所选 1 级阶段目录与 项目启动.md；内部完整包含 3 级 README.md、2 级空目录 .gitkeep 与对应模式的 .agents/skills/ 全套脚本模板

### AC-F004-002 · 核对引导文本内容

- 来源：PSC-007
- Given 生成 ZIP 后打开交付接管指引弹窗，读取顶层 项目启动.md 与开场白口令
- When 核对引导文本内容
- Then 明确指导用户用 Antigravity 打开 1 级阶段目录作为工作区、引导补全【待补充】项，并包含初始化完成后将 项目启动.md 归档至 drafts/ 或删除的自清理指令

### AC-F004-003 · 检查单文件 dist/index.html 与沙箱逃生舱

- 来源：PSC-007, PSC-008
- Given 在 WorkBuddy 资料库沙箱或外部浏览器中发布与运行构建产物
- When 检查单文件 dist/index.html 与沙箱逃生舱
- Then 构建产物为单个零外部 script/link 引用的 HTML 文件；交付弹窗提供一键复制本地自动初始化 Shell 脚本与复制 项目启动.md 逃生舱（EX-04）

## 开放问题

无
