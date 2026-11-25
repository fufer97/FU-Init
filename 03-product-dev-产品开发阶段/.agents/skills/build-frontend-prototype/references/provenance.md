# 第三方来源与维护说明

## Emil 设计心法

- 作者：Emil Kowalski。
- 上游：[emilkowalski/skills](https://github.com/emilkowalski/skills)。
- 原文件：上游项目的 `skills/emil-design-eng/SKILL.md`。
- 本包位置：[emil-design-eng.md](emil-design-eng.md)。
- 取材版本：2026-09-28 从本机 MuYuProjectBuild 项目中正在使用的 `.agents/skills/emil-design-eng/SKILL.md` 原样复制。只改变承载文件名，没有重写原文；未将其替换为上游最新版本。
- 原始文件 SHA-256：`e71de849347050c2c573c1cf24d742d5a13459557ecffa6e562f08006f46b5b7`。
- 此本地副本对应的上游提交未确认，不将查询时的最新提交冒认为它的来源提交。
- 许可证：MIT；[许可证全文](LICENSE.emil-design-eng.txt)于 2026-09-28 从[上游 LICENSE](https://github.com/emilkowalski/skills/blob/main/LICENSE)获取，保留作者版权声明。此第三方声明适用于附带的 Emil 原文。

Emil 原文保留其原始语言、示例和表达。工作流新写的设计记录、安装说明与验证说明均使用简体中文。

## 如何使用这份心法

主 Skill 先明确沟通目标，按应用产品设计方法决定页面空间与交互，再读取 Emil，将适用原则落实为组件反馈、动效和细节。产品流程与呈现意图来自需求和本轮沟通，不由通用视觉心法代替。任务已明确时直接应用相关章节，不必执行原文中面向无具体请求场景的初始问候。

原文中的代码示例不是已经验证过的当前组件库 API。实现时以当前工程的依赖版本、官方文档与组件源码为准；业务事实和用户约束优先于通用设计建议。

## 应用产品设计方法的整合来源

2026-09-28，依据用户对原型页面的反馈，审阅本机全局 `~/.claude/skills/` 中以下材料，将适合当前体验原型的思想重新组织为 [product-design.md](product-design.md)。这是本工作流的适配指引，不是这些 Skill 的原文副本或完整执行流程；下列路径仅用于来源定位，分发后无需访问它们。

| 全局材料 | 本轮采用的设计依据 |
| --- | --- |
| `product-form-from-backend/SKILL.md` 的信息架构与用户路径部分 | 从使用者、工作对象和实际任务组织入口，明确开始、处理和业务结果 |
| `frontend-design-layer/SKILL.md`、`templates/design-brief.md`、`templates/craft-checklist.md` | 将布局作为独立设计决定，说明空间主次、常驻内容与交互模型，按任务确定信息密度 |
| `gstack/plan-design-review/sections/review-sections.md` 的信息架构与 App UI 部分 | 区分应用与营销页面，围绕主工作区、导航和辅助上下文组织页面，检查卡片堆叠是否取代了实际布局 |
| `gstack/design-review/SKILL.md` 的页面定位与设计检查部分 | 检查所在位置、搜索与操作入口，以及筛选、页签、分页等工作状态 |

列表规模与分页选择、滚动分工、返回位置和下一步承接的要求，结合当前实际反馈补充为可执行的原型设计与验看方法，不冒称均为上述来源的原文规则。

整合保留当前整体原型范围、HTML 默认路线和用户指定的验看方式。没有引入来源流程中的完整后端契约、真实网络模拟、全量管理后台、固定数量的竞品研究、强制双主题、逐项审批或特定动效依赖；也不要求安装或运行这些全局 Skill。Emil 原文及其许可证保持不变。

## 更新与分发

分享时复制完整的 `build-frontend-prototype/` 目录，并保留此说明和许可证，不依赖任何本机绝对路径或外部符号链接。

需要更新 Emil 内容时，先比较上游变化与本包版本，明确采用版本后替换引用文件并更新校验值和来源。不要在安装时自动追踪上游主分支。工作流本身与第三方心法分开维护，避免把客户需求写入通用心法。
