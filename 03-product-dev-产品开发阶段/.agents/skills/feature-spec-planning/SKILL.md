---
name: feature-spec-planning
description: 根据已确认的 Product Spec（及完整模式下的 PRD）与架构，讨论可独立验证和迭代的 Feature 拆分，确认后落盘 Feature Map，并按授权范围展开 spec.md、plan.md 和 tasks.md，建立 PSC → Feature → AC-FNNN → Task → 证据追踪。
---

# Feature 规格与任务规划（支持精简联动模式与完整模式）

把已确认的产品总规格（`docs/specs/product-spec.md`）转成职责清楚、可独立验证和迭代的 Feature 文档。

## 前置条件

1. 锁定目标项目根并读取 `AGENTS.md`、`docs/specs/product-spec.md`（精简模式下结合 `../Raw/` 交接材料；完整模式下结合 `docs/PRD.md`）及架构文档。
2. 运行 `$product-spec` 的校验器，确认 `docs/specs/product-spec.md` 为 `status: confirmed`。
3. 已有 Feature Map 或 Feature 目录时保留稳定 ID、历史状态和用户内容，做增量合并。

## 标准落盘结构

```text
docs/
└── specs/
    ├── product-spec.md
    ├── feature-map.md
    ├── F001-<kebab-slug>/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    └── F002-<kebab-slug>/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## 1. 拆 Feature Map

从 `assets/feature-map.template.md` 创建或更新 `docs/specs/feature-map.md`（精简模式下 frontmatter 声明 `mode: linked` 与 `upstream: ../Raw/HANDOFF.md`），使用 `F001` 起的三位稳定编号和 `F001-kebab-slug` 目录。确保 `product-spec.md` 中的全部 `PSC-NNN` 均被 Feature Map 覆盖且依赖无环，确认后标为 `status: confirmed`。

## 2. 为每个 Feature 落三件套

- **`spec.md`**：写清来源 `PSC-NNN`（完整模式同时写 `REQ/NFR`）、使用者或消费方、交付结果、输入输出语义、主流程、对象状态、异常恢复和 `AC-F001-001` 格式的 Given/When/Then（每条 AC 声明 `- 来源：PSC-NNN`）。
- **`plan.md`**：写明上下文复用、影响范围、实现方案、实施顺序、依赖风险、回退策略及每条 `AC-FNNN-NNN` 的验收映射表。
- **`tasks.md`**：每个 Task 使用 `T001` 起三位编号，对应一个独立可验证结果，包含 `来源`（引用 `PSC-NNN` 与 `AC-FNNN-NNN`）、`依赖`、`修改`、`完成证据`、`验证` 五项字段；严禁使用 `[FE]`、`[BE]`、`[INT]` 标签。

## 3. 校验

```bash
python3 "<SKILL_DIR>/scripts/validate_feature_specs.py" \
  "<项目根>" --feature F001 --require-ready
```

Feature 全部 Task 完成后将 `tasks.md` 与 Map 行改为 `completed`，运行：

```bash
python3 "<SKILL_DIR>/scripts/validate_feature_specs.py" \
  "<项目根>" --feature F001 --require-complete
```
