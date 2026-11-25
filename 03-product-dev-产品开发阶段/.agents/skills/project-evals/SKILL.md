---
name: project-evals
description: 根据项目 Product Spec（及完整模式下的 PRD）和 Feature AC 设计验收用例，绑定已有测试或补齐检查，在授权范围内执行并记录结果。
---

# 项目验收与 Evals（支持精简联动模式与完整模式）

把已有验收合同（`PSC-NNN` 与 `AC-FNNN-NNN`）转为具体输入、操作、判定和证据。

## 1. 从合同设计用例

在实际项目创建 `evals/FNNN.json`（跨 Feature 总体验收创建 `evals/product.json`）：

- **精简联动模式（`mode: linked`）**：`sources` 包含 `"docs/specs/product-spec.md"` 与对应的 `"docs/specs/FNNN-<slug>/spec.md"`（无需 `docs/PRD.md`）。
- **完整模式（`mode: full`）**：`sources` 额外包含 `"docs/PRD.md"`。
- 每个 Feature AC（`AC-FNNN-NNN`）至少由一个 `EV-FNNN-NNN` 用例承接。

运行结构校验：

```sh
python3 <SKILL_DIR>/scripts/validate_evals.py <项目根> --suite evals/F001.json
```

## 2. 绑定实际检查与执行

- **command**：绑定项目原生自动化测试、构建或校验脚本；
- **manual**：记录可重复的浏览器或人工操作步骤、预期和证据位置。
- 绑定完成后运行 `--require-bound` 校验，并将真实执行结果写入 `docs/verification/`。
