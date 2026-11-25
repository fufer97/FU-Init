# 04-多Agent专属配置映射规范

## 1. MVP 主力 Agent 适配策略

Web 配置器第一页采用 **单选「主力 Agent」**，MVP 版本优先支持 **Antigravity 2.0** 与 **通用标准 Agent（非特殊性、可读 `AGENTS.md` / `.agents/` 的智能体）**，架构上通过统一的 `AgentAdapter` 配置表预留扩展位（后续可零成本扩展 Claude Code、Cursor、Codex 等）。

| 配置维度 | Antigravity 2.0（默认推荐） | 通用标准 Agent（Generic Agent） |
|---|---|---|
| **阶段工作区主入口** | `<1级阶段目录>/AGENTS.md` | `<1级阶段目录>/AGENTS.md` |
| **细粒度工程/设计规则落位** | 独立拆分至 `<1级阶段目录>/.agents/rules/*.md`<br>*(设计阶段：`design-principles.md`；开发阶段：`engineering-principles.md`)* | 自动内联并入 `<1级阶段目录>/AGENTS.md` 的「通用工程/设计原则」章节，不单拆 `.agents/rules/` |
| **项目级 Skills 目录** | `<03开发阶段>/.agents/skills/<skill-name>/SKILL.md` | `<03开发阶段>/.agents/skills/<skill-name>/SKILL.md` |
| **专属忽略文件** | 生成空基础文件 `<1级阶段目录>/.antigravityignore`（不预写 `reference/`，由用户初始化后自主维护） | 不生成 `.antigravityignore` |
| **`CLAUDE.md` 生成策略** | **不生成**（保持目录纯净，避免无关工具文件干扰） | **不生成** |

## 2. 顶层一次性引导文档（`项目启动.md`）

导出的 ZIP 顶层固定包含一份 `项目启动.md`，承担**解压后第一公里的本地 Agent 接管指令**：
1. **工作区打开指引**：明确提示用户使用 Antigravity 2.0 直接打开对应的 1 级阶段文件夹（如 `02-product-design-产品设计阶段/` 或 `03-product-dev-产品开发阶段/`）作为 Workspace。
2. **可选项目元信息补全指令**：
   - 若用户在 Web 端已填写「项目名称 / 一句话简介 / 技术栈」，这些信息已自动注入各阶段 `AGENTS.md` 与 `01-项目背景.md`；
   - 若用户在 Web 端未填写（保留了 `【待补充】` 占位符），`项目启动.md` 会指示本地 Agent 主动向用户发起简短追问并一次性回填所有 `【待补充】` 槽位。
3. **用后自清理指令**：明确规定全部初始化步骤完成后，本地 Agent 提示或协助用户将顶层 `项目启动.md` 删除（或归档至 `drafts/`），避免后续会话重复误触发初始化。
