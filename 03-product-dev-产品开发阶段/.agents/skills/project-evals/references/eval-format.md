# 用例格式与示例

这是本项目 Skills 的轻量约定，不是 OpenAI 的强制格式。所有业务叙述使用简体中文；既有编号不重排。

## 套件

`evals/FNNN.json` 表示一个 Feature；`evals/product.json` 表示选定的跨 Feature 门槛。

| 字段 | 含义 |
|---|---|
| `schema_version` | 固定为整数 `1` |
| `scope` | `F001` 等 Feature ID 或 `product` |
| `sources` | 项目相对文档路径数组，包含 PRD、总 Spec 与相关 Feature Spec；必要时加入 Map / shared Spec |
| `product_contracts` | 仅 product 使用，声明本次必须组合验证的 PSC；由总 Spec 的产品级门槛确定 |
| `cases` | 非空用例数组 |
| `checks` | 检查定义数组；纯设计阶段可为空 |

校验器按 frontmatter 确定定义归属：PRD 定义 `AC-NNN`，Feature Spec 定义与自身 `feature` 一致的
`AC-FNNN-NNN`，Product Spec 在索引表第一列定义 `PSC-NNN`。AC 必须是标题，正文提及和代码块示例
不算定义。Map、shared Spec 等辅助来源仅补充上下文与输入追踪，不重复定义或扩充验收编号。
绑定时正式来源须 confirmed / ready；辅助资料若声明状态也须 confirmed，没有状态的辅助资料不因
被引用就成为已确认合同。它覆盖本 Feature 来源文档中的所有 AC；product 覆盖声明的
`product_contracts`，PSC 选择是否充分仍需对照总 Spec 做语义审阅。

## 用例与检查

用例必填 `id`、`title`、`source_ac`、`given`、`when`、非空字符串数组 `expected` 和 `check_ref`。`source_ac` 至少关联一项已定义 AC。product 用例还需 `source_psc`，引用本套件选定的 PSC。

- Feature 用例 ID 为 `EV-F001-001`；product 为 `EV-PRODUCT-001`。
- `check_ref` 是本套件 `checks` 内的 ID；未绑定为 JSON `null`。
- 检查 ID 在同批套件中唯一，例如 `F001-export-behavior`，可直接用于 maintenance 的检查名。
- 每个检查有 `id`、`method` 和 `inputs`。`method` 为 `command` 时需非空 `argv` 数组；为 `manual` 时需 `procedure` 与 `evidence` 两个非空字符串。
- `inputs` 列实现、测试、数据和配置，可包含目录（其内容均纳入）。绑定校验时这些路径必须存在且在项目内；声明完整性仍需 Agent 审阅。suite 和 sources 由校验器自动加入输出的 `effective_inputs`。
- 检查定义不得放密码或 Token；需要凭证时遵循当前项目授权与注入方式。

以下仅为假设的订单导出示例，不能直接当作客户批准的业务规则。示例路径需对应真实项目后才能通过校验：

```json
{
  "schema_version": 1,
  "scope": "F001",
  "sources": [
    "docs/PRD.md",
    "docs/specs/product-spec.md",
    "docs/specs/F001-export/spec.md"
  ],
  "cases": [
    {
      "id": "EV-F001-001",
      "title": "导出当前筛选结果",
      "source_ac": ["AC-F001-001"],
      "given": "O-001、O-003 为待交付，O-002 已完成；用户拥有导出权限",
      "when": "按待交付状态筛选后执行导出",
      "expected": ["导出订单集合恰为 O-001、O-003", "每笔订单只出现一次"],
      "check_ref": null
    }
  ],
  "checks": []
}
```

工程与测试存在后，可将 `check_ref` 改为 `F001-export-behavior`，并加入：

```json
{
  "id": "F001-export-behavior",
  "method": "command",
  "argv": ["python3", "backend/tests/check_export.py"],
  "inputs": ["backend/export.py", "backend/tests/check_export.py", "backend/tests/fixtures/orders.json"]
}
```

该测试必须实际触发导出并核对结果；写下 argv 本身不提供行为证据。一个命令关联多条用例时，它的输出或报告须逐条可追踪，任何必要用例未运行都不能把整组记为通过。

## 变更与范围

用例预期与来源冲突时先解决合同差异，不以当前代码输出作为标准答案。只有实现方式变更时，只更新检查绑定与相关 inputs；业务行为变更时先更新上游合同，再调整用例。保留旧验证记录的适用版本。

CLI 的 `--suite` 明确限定本次范围，可重复；不会自动递归执行或检查其他 Feature。全量验收需要显式选择所有相关套件并核对总体验收范围。
