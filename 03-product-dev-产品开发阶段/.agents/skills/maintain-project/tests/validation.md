# maintain-project 实测记录

2026-09-28。结论：在用户提供的订单履约原型上，调用独立 `maintain-project` Skill 后，Agent 完成了新增需求的实现，并主动同步现有设计、使用说明和验看记录。本次场景通过；不能据此承诺所有未来变更均不遗漏文档。

## 测试来源和输入

用户授权：基于 `/path/to/example-workspace/docs/04_frontend-prototype` 测试“一旦有新的需求更改，对应的文档也会进行更改”。具体筛选需求由 Agent 构造，不是客户批准，也没有应用到原项目。

独立测试执行者没有继承开发会话，只读取隔离项目的 AGENTS、Skill 和按需定位的现有文件。产品需求输入如下，没有额外提醒要修改哪份文档：

> 在现有订单列表增加“跟进岗位”筛选，以列表当前显示的跟进岗位为准。它要能与已有搜索、关注分类、履约口径和排序组合使用；从订单详情返回后保留筛选。保留协同跟进页已有的岗位筛选及原来的重置行为。按本轮需求完成实现和必要验证。

隔离副本仅复制 AGENTS、01/02 业务资料、03 设计、04 原型和新 Skill。没有复制 Raw、TeachingWorkbench、依赖树或整个产品工程；这些未复制目录未纳入副本内容校验。浏览器自动化按本轮测试授权执行，原交付“不运行浏览器自动化”的约定保留为历史条件。

## 实现与文档同步

| 文件 | 实际变化 |
| --- | --- |
| `docs/04_frontend-prototype/assets/app.js` | 新增独立 `orderOwner`，按订单当前派生岗位完整匹配；组合原有条件，保留返回状态，纳入清除和重置 |
| `docs/04_frontend-prototype/assets/styles.css` | 订单工具栏允许换行，承接新增筛选控件 |
| `docs/03_prototype-design/design.md` | 更新页面职责表和当前交互规则，解释动态岗位、独立状态、返回、空结果与重置 |
| `docs/04_frontend-prototype/README.md` | 更新实际操作、组合筛选、恢复方式和检查范围 |
| `docs/03_prototype-design/verification.md` | 保留原交付状态，加入本轮变更来源、真实命令、观察结果及未验证项 |
| `.gitignore` | 忽略 `/.codex/maintenance/` 临时运行记录 |

AGENTS、HTML 入口、模拟数据和已复制的 01/02 资料无需变化，并验证未变。没有新建 PRD/Spec，也没有修改已有原型生成 Skills。

审阅发现测试文档把模拟需求写成“本轮用户明确的测试需求”，已收窄为“Agent 根据用户授权构造的测试场景”；实现、测试脚本和业务规则未变。当前正文与实现一致，旧的未验证记录按历史条件保留，没有仅追加完成标记而保留冲突规则。

## 真实浏览器结果

运行时间：2026-09-28 19:25:20–19:25:23（Asia/Shanghai）。复用项目局部 Playwright，独立 Chromium `151.0.7922.34`，本地随机端口 `49354`。只访问本地原型，未安装依赖，未使用系统 Chrome 用户配置。

执行命令（在隔离项目根目录）：

```sh
python3 .agents/skills/maintain-project/scripts/maintenance.py run-check --project . --id order-owner-filter-forward-test --name prototype-browser --input .codex/maintenance/prototype-browser.cjs --input docs/04_frontend-prototype/assets/mock-data.js --input docs/04_frontend-prototype/index.html --input docs/04_frontend-prototype/order.html --input docs/04_frontend-prototype/followups.html -- node .codex/maintenance/prototype-browser.cjs
```

实际输出末尾：

```text
PASS 47 assertions; browser 151.0.7922.34
Browser and local server stopped.
```

| 验证路径 | 结果 |
| --- | --- |
| 默认与组合条件 | 初始18条、每页8行；交付岗位10条；搜索“模块”+跟进中+到货+交付可按客户或交期排序 |
| 详情返回与刷新 | 保留搜索、分类、口径、岗位、排序、页码和滚动位置；刷新仍保留岗位 |
| 分页与清除 | 第2页结果正确；变更岗位返回第1页、滚动清零；空结果清除条件并保留原排序 |
| 直接受影响的旧路径 | 协同页采购岗位和北辰搜索仍有效，返回保留队列；两页岗位条件互不覆盖 |
| 动态岗位 | 通过真实办理按钮使北辰计划→仓储→生产→生产 / 质量；筛选始终按当前展示岗位匹配 |
| 全局重置 | 从订单和协同两页发起，均恢复业务数据与两页浏览默认值 |
| 桌面呈现 | 1280×800、1440×900的控件边界检查通过；实际查看1280初始列表及组合岗位截图 |

47项断言全部通过，浏览器无脚本异常。业务变化由页面操作触发，没有向 sessionStorage 注入结果。`finish --review` 返回 `pass`；审阅后使用最终版检查脚本重新读取同一证据，`check` 返回 `pass`，未重复运行浏览器测试。

可追溯指纹：

| 对象 | SHA-256 |
| --- | --- |
| 输入原型 `app.js` | `e15b4c6f2ffdc850d7c4dd4cd013cb2562f7baff196094f4aae484e33cb38534` |
| 已验证的变更后 `app.js` | `0f10bfbf49bdb90f0e68a89183ff7d242c6fdb31ba4431b03a6806cf5405af00` |
| 实际浏览器脚本 | `b354f945c30081782617766f29f5189e210b62b969aa2de261d8d8a048c426fd` |
| 原始检查输出 | `a3745008aa8719557debe4791228123ebd8d1dd950956f3a437acf98af451e99` |

## 确定性检查与能力边界

最终检查脚本的9项单元测试全部通过，涵盖：非课程目录适配、漏改应更新文档、源码变化使证据过期、授权删除源码、保护路径和应保留文档、未运行与执行错误、真实退出状态、Hook 会话与目录范围及防循环、重复记录与越界路径。

其中“代码检查成功但应更新文档未变”的用例返回 `fail`。这是防遗漏检查；文件变化不等于语义正确，当前 Agent 仍须对照需求审阅内容。

```sh
python3 -B -m unittest discover -s .agents/skills/maintain-project/tests -p 'test_*.py' -v
```

Skill 的格式检查已通过。前向测试使用创建时的脚本副本；最终版随后调整了授权源码删除、项目外 Hook 事件忽略及未绑定会话恢复的边界处理，其中前两项有对应单元断言，未绑定会话恢复没有单独实测。这些变动未改变本次新增筛选流程；最终版已读取并通过同一原型证据。

本次没有配置宿主原生 Hooks，也没有观察到真实 Stop 事件触发；已验证的是脚本协议、隔离前向流程与手动收尾检查。没有验证移动端、其他浏览器、完整键盘无障碍或所有历史业务路径。不把本次测试写成客户业务验收。

## 交付与清理

保留可审阅的文本产物：本记录、[实际改动补丁](order-prototype-change.patch)、[实际浏览器测试脚本](order-prototype.browser.cjs)及[检查脚本单元测试](test_maintenance.py)。补丁包含测试来源与临时证据说明，是审阅材料，不作为向原项目自动应用新功能的指令。学员分发副本已将个人路径匿名化，浏览器脚本通过 `require('playwright')` 加载本机安装；复现前需自行准备兼容的 Playwright 环境。上表指纹属于原始历史测试证据，不代表本次匿名化后的文件，也不表示重新执行过浏览器测试。

重现浏览器路径时，在原型隔离副本应用补丁，并将 `order-prototype.browser.cjs` 复制为 `.codex/maintenance/prototype-browser.cjs`，创建 `.codex/maintenance/tmp` 后执行 `node .codex/maintenance/prototype-browser.cjs`。脚本自行启动和停止随机端口服务及浏览器；不需要保留本次临时副本。

测试结束后核对原项目22个输入文件的 SHA-256 与测试前一致。临时副本、截图和运行输出在整理上述文本证据后清理；没有遗留测试服务器、浏览器或依赖安装。原项目与已有服务未改动。
