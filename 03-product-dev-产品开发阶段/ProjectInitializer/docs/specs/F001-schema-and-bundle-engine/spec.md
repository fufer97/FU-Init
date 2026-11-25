---
document: feature-spec
feature: F001
status: ready
updated: "2026-11-26"
---

# F001 · 五阶段目录计算与双模式技能资产引擎规格

## 目标与可观察结果

提供纯确定性的五阶段默认目录树、三语言命名与同级从 1 重排算法、完整(12技能)/精简(6技能)双模式判定与去品牌化 Skills 模板注入引擎。

## 来源与范围

- 来源总规格：PSC-001, PSC-002, PSC-003, PSC-004, PSC-008
- 上游设计交接：`../Raw/HANDOFF.md`
- 本 Feature 包含：提供纯确定性的五阶段默认目录树、三语言命名与同级从 1 重排算法、完整(12技能)/精简(6技能)双模式判定与去品牌化 Skills 模板注入引擎。
- 本 Feature 不包含：不属于本模块的跨层职责或任何在线 LLM 调用。

## 用户旅程与状态

| 入口/前置 | 用户动作或调用触发 | 过程与反馈 | 对象状态变化 | 可观察结果 | 下一步/消费方 |
|---|---|---|---|---|---|
| 应用已加载 | 触发 F001 核心操作 | 纯函数计算并更新响应式状态 | `ProjectInitConfig` / `ResolvedArtifactBundle` 同步 | 界面预览或导出产物即时呈现 | 下游模块或本地 Agent |

## 功能行为

严格按照 `../Raw/业务PRD.md` 与对应页面 Demo 版 PRD 实现确定性状态流转与视图渲染。

## 异常与恢复

| 情况 | 使用者/消费方可观察状态 | 系统行为 | 恢复/重试 |
|---|---|---|---|
| 非法输入或受限沙箱环境 | 显示明确中文提示或启用沙箱逃生舱 | 拦截非法变更，保留已有配置状态 | 重新选择有效项或复制沙箱脚本 |

## 验收标准

### AC-F001-001 · 调用 resolveDevMode 与 buildInitialTree

- 来源：PSC-001, PSC-002
- Given 用户在配置中选择不同阶段组合或手动覆写开关
- When 调用 resolveDevMode 与 buildInitialTree
- Then 同时选 02+03 时自动设为 linked 模式并挂载 6 个精简核心技能；单选 03 时默认 full 模式挂载 12 个通用技能且支持手动切为 linked

### AC-F001-002 · 调用 computeResolvedTree 计算目录树

- 来源：PSC-003
- Given 用户切换语言模式（zh/en/bilingual）或对同级目录进行勾选、取消、上下调序
- When 调用 computeResolvedTree 计算目录树
- Then 1 级阶段保持 01..05 固定前缀；2 级及以下 numbered:true 的已勾选目录按当前顺序严格从 1- 连续重排（双语为 1-context-业务上下文）；Raw/.agents/AGENTS.md 等免序号节点保持原名

### AC-F001-003 · 调用 buildArtifactBundle

- 来源：PSC-001, PSC-004, PSC-008
- Given 用户填写或留空项目名/简介/技术栈并生成最终虚拟文件包
- When 调用 buildArtifactBundle
- Then 所有 3 级及以下已勾选文件夹自动生成导航 README.md；所有 2 级空文件夹自动生成 .gitkeep；2 级文件夹不生成 README.md；项目元信息单点注入所有 AGENTS.md 与模板且无任何赋范品牌或个人硬编码残留

## 开放问题

无
