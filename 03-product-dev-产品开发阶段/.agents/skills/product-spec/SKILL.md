---
name: product-spec
description: 把上游需求材料（精简联动模式下为 ../Raw/ 中由 02-产品设计阶段移交的业务 PRD/页面 PRD/字段清单；完整模式下为已确认的 docs/PRD.md）转成唯一的 docs/specs/product-spec.md，定义跨 Feature 的产品对象、全局状态机、不变量、共享交互与事件、安全恢复、兼容能力和总体验收（PSC-NNN）。
---

# 产品总规格（支持设计→开发精简联动模式与完整模式）

把已确认的上游产品设计材料（`../Raw/` 或 `docs/PRD.md`）转成所有 Feature 必须共同遵守的产品行为合同（`PSC-001..NNN`）。只依赖 Markdown 模板和 Python 标准库校验器。

## 输入与职责边界

1. **精简联动模式（`mode: linked`，默认与 `02-产品设计阶段` 衔接）**：
   - 读取项目 `AGENTS.md` 及外层 `../Raw/HANDOFF.md` 与 `../Raw/` 下由 `02` 阶段移交的业务 PRD、页面 Demo 版 PRD、字段清单；
   - **不要求存在 `docs/PRD.md`**；`product-spec.md` frontmatter 声明 `mode: linked` 与 `upstream: ../Raw/HANDOFF.md`。
2. **完整开发模式（`mode: full`）**：
   - 读取 `docs/PRD.md`，运行 `$product-prd` 校验器确认 `status: confirmed`。
3. 一个项目只维护一份 `docs/specs/product-spec.md`。已有文件时保留稳定 PSC ID、有效合同和确认历史，增量合并。

| 文档 | 唯一职责 |
|---|---|
| `../Raw/`（精简模式）或 `docs/PRD.md`（完整模式） | 为什么做、给谁、业务规则、字段字典与页面交互需求 |
| `docs/specs/product-spec.md` | 跨 Feature 的统一产品对象、状态机、行为合同与不变量（`PSC-NNN`） |
| `docs/specs/feature-map.md` | Feature 边界、PSC 归属、依赖和状态 |
| `docs/specs/FNNN-*/spec.md` | 单个 Feature 的流程、状态、边界和局部验收（`AC-FNNN-NNN`） |
| `docs/architecture/` | 框架、依赖、数据、服务与构建选择 |

## 落盘总 Spec 与稳定 PSC 追踪

- 全局合同使用 `PSC-001` 起的三位稳定编号。
- 每条 PSC 在“全局合同索引”表格中占一行（7 列）：
  - 精简联动模式：`来源需求` 列填写 `../Raw/` 中对应的设计文档与章节（如 `业务PRD.md §3.1`），`对应上游验收` 列填写关键业务验收口径；
  - 完整模式：`来源需求` 列引用 `REQ-NNN / NFR-NNN`，`对应 PRD 验收` 列引用 `AC-NNN`。
- 在对象、状态、不变量、安全等详细章节再次引用对应 `PSC-NNN` ID，不能只有索引没有合同正文。
- 合同获确认、无阻塞开放问题且无模板槽位后，将 frontmatter 改为 `status: confirmed`。

## 校验

从实际加载的 `SKILL.md` 定位 `<SKILL_DIR>`，运行：

```bash
python3 "<SKILL_DIR>/scripts/validate_product_spec.py" \
  "<项目根>" --require-confirmed
```
