# 检查与 Hooks 协议

## Skill、检查脚本与 Hook 的分工

- **Skill**：指导 Agent 理解本轮需求、确定影响范围、修改实现与相关文档，并判断内容是否符合需求。
- **检查脚本**：读取 Agent 事先声明的文件范围和实际检查结果，核对有无漏改、误改、漏验或过期证据；它不会自行理解业务或生成修改方案。
- **Hook**：把调用脚本的动作接到宿主的指定时点。本适配在 Codex 准备结束一轮回复时接收 `Stop` 事件；只有接入配置、加载并信任之后才会自动调用，不是复制 Skill 后就自动生效。

同一个 `scripts/maintenance.py` 提供手动检查命令和 `hook` 事件入口。业务文件及检查命令由项目传入；当前事件适配面向 Codex，其他宿主需按其协议另行接入。

## 运行记录

以下路径由脚本相对于 `--project` 解析；该参数指工作区根，不一定是某个应用的源码目录。先读实际文件并确定范围，再把本轮 JSON 通过标准输入交给 `begin`。以下仅演示字段结构：

```sh
python3 <SKILL_DIR>/scripts/maintenance.py begin --project <工作区根> <<'JSON'
{
  "id": "change-existing-behavior",
  "request": "按本轮已确认要求调整现有功能",
  "sources": ["src/feature.py"],
  "documents": [
    {"path": "docs/behavior.md", "action": "update", "reason": "当前行为约定随本轮变更调整"},
    {"path": "README.md", "action": "keep", "reason": "启动与使用方式不受本轮影响"},
    {"path": "docs/verification.md", "action": "update", "reason": "记录本轮真实验证"}
  ],
  "protected": ["inputs/original"],
  "checks": ["behavior-check"]
}
JSON
```

示例中的文件、目录、语言和检查名都必须替换为当前项目的实际范围；不为套用示例创建这些文件。`documents.action` 为 `update` 或 `keep`，两种决定都要写理由。`protected` 只列本轮明确不应改变的已有路径。源文件可预声明尚未存在的新增文件。

脚本创建 `.codex/maintenance/runs/<id>.json` 和相应检查输出，并确保 `/.codex/maintenance/` 被项目 `.gitignore` 忽略。它们是本轮执行状态，源码与正式验证记录才是持久交付；无活动变更且正式记录不再依赖其中的唯一证据时才能清理，仍需交付的证据先转存到项目约定位置。相同 ID 不覆盖已有记录。

会话绑定优先显式 `--session-id`，否则使用执行环境提供的 `CODEX_THREAD_ID`。后者必须在目标宿主确认与 Hook 事件的 `session_id` 相同后，才算原生接入通过；缺少绑定时仍可手动执行检查，Hook 不猜测当前任务。

## 执行与收尾

```sh
python3 <SKILL_DIR>/scripts/maintenance.py run-check --project <根> --id <变更ID> --name <检查名> -- <实际命令及参数>
python3 <SKILL_DIR>/scripts/maintenance.py check --project <根> --id <变更ID>
python3 <SKILL_DIR>/scripts/maintenance.py finish --project <根> --id <变更ID> --review '对照需求与当前设计核对了哪些行为'
```

命令以参数数组执行，不经 shell。检查在项目根运行，保存退出状态、输出、声明源文件和额外 `--input <相对路径>` 的指纹。测试脚本、相关配置或数据不在 `sources` 中时，用 `--input` 显式纳入；只更新验证记录不会让已完成的代码检查无故失效。

目录输入内指向项目内的目录链接会追踪目标内容；越出项目或形成循环的链接会报错，不能形成有效收据。

`check` 读取当前文件和已保存的结果，不重复运行测试。它核对：需要更新的文件确有变化、保留和保护的文件未改变、检查实际执行且成功、检查输入仍有效。内容哈希差异只证明有改动，不证明文档语义正确；`finish --review` 的内容由执行 Agent 在实际审阅后记录。

接入项目 evals 时，`checks` 使用套件中的检查 ID，`--input` 纳入套件、来源规格、测试、数据和配置
（`project-evals` 校验输出的 `effective_inputs`）。多个用例可共用一次有充分断言的检查；在正式验证
记录中建立 eval ID → 检查 ID → 证据的关联。这里仍只记录进程结果与指纹，不解析业务断言，也不把
没有执行的 manual 检查算作通过。纯验收且没有源码变更时使用项目原生检查与验证记录，不虚构维护变更。

等待用户决定时用 `pause --reason <原因>` 标记该变更；继续时用 `resume`。它们只改变运行状态，不改产品规格或验收状态。已完成记录不自动接管下一轮请求；每轮使用新的 ID。

## Hooks

`hook --project <根>` 接收宿主标准输入 JSON，目前只处理 `Stop`：

- 只查当前 `session_id` 绑定的未暂停、未完成变更；无匹配时静默退出，纯讨论不会被拉入维护任务。
- 多个活动变更无法唯一定位、输入损坏或检查异常时报告 `error`，不猜测归属，不当作通过。
- 已知 `fail` 可返回具体文件与原因，请求 Codex 继续处理一次；它延续当前工作，不替 Agent 修改文件。同一问题指纹或 `stop_hook_active` 已设置时只报告，避免反复续跑。
- `not_run` 明确指出未完成的检查，不把它伪装成 `pass`。等待补充信息时应先暂停本轮变更。
- `pass` 只表示确定性条件满足；业务语义与页面验看仍属于 Skill 的工作。

Hook 只读业务文件，可写本轮检查缓存。它不执行测试命令、不改写业务文档、不注入通用提示词、不强制规划，也不从聊天全文猜测需求。工作流可先由 Skill 调用检查命令跑通，再连接 Hook。

当前协议以 [Codex Hooks 官方文档](https://learn.chatgpt.com/docs/hooks) 为依据。stdin 协议测试通过不等于目标客户端已经加载、信任并触发 Hooks；原生事件、会话绑定、信任状态必须单独核验并报告。
