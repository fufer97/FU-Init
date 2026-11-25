---
name: build-fde-project
description: 面向工程项目交付，从零创建标准前后端与规格目录骨架：先准备外层工作目录的 Raw 原始资料区，再创建同级的大驼峰开发项目并初始化标准目录，支持精简联动模式（--mode linked，跳过 docs/PRD.md，直读 Raw/ 的 02 设计阶段产出生成 Product Spec、Feature Map 和逐 Feature spec/plan/tasks）与完整模式（--mode full，含 docs/PRD.md），最后实现并验证用户授权的 Feature。
---

# 项目工程构建与交付（支持设计→开发精简联动模式与完整模式）

把标准骨架、产品总规格（Product Spec）和 Feature 规格作为首次产品代码之前的必要准备，然后继续实现用户已经授权的 Feature。文档初始化不是完成信号。

## 路由边界

以下“目标”指实际开发的项目目录。外层工作目录已有上游设计交接资料、客户原件或 Skills，不影响在其中新建独立开发项目。

- 目标没有实质产品源码，用户准备从零落盘或开发：使用本 Skill。
- 目标已有可运行源码、manifest、页面、API 或历史数据：在同一项目按 `$maintain-project` 处理本次迭代；不重新初始化。
- 用户已有 `02-产品设计阶段` 交接进 `Raw/` 的业务 PRD/页面 PRD/字段清单，或已有 confirmed PRD，只要求冻结项目总行为合同：使用 `$product-spec`。
- 用户已有 confirmed Product Spec，只要求拆 Feature 文档：使用 `$feature-spec-planning`。

## 先准备外层原始/交接资料区

外层工作目录中，`Raw/` 与大驼峰开发项目同级：

```text
<开发阶段工作目录>/
├── Raw/              # 上游 02-产品设计阶段交接资料（含 HANDOFF.md）或客户原始资料
├── .agents/skills/   # 项目级工程 Skills
└── ProjectName/      # 大驼峰命名的开发子工程
```

确保外层 `Raw/` 存在，已有内容保持原样：

```bash
mkdir -p "<开发阶段工作目录>/Raw"
```

## 开发项目的最小输入

初始化开发项目之前至少确认：

- 符合 PascalCase 的项目根目录名（如 `ProjectInitializer`、`OrderFulfillment`）；
- 对外产品名称（任意非空正式名称，无强制前缀要求）；
- 一句话产品定位；
- 开发模式：`linked`（精简开发模式：承接 `Raw/` 中的 02 产品设计产出，不生成 `docs/PRD.md`）或 `full`（完整开发模式：从零生成 `docs/PRD.md`）。

## 在开发项目内初始化标准骨架

从实际加载的 `SKILL.md` 定位本 Skill 目录，记为 `<SKILL_DIR>`，运行：

```bash
python3 "<SKILL_DIR>/scripts/init_project.py" \
  "<工作目录>/ProjectName" \
  --public-name "<正式产品名>" \
  --summary "<一句话产品定位>" \
  --mode linked
```

*(若为完整开发模式且同级存在 `$product-prd`，可传 `--mode full`。)*

脚本的目标是 `Raw/` 同级的大驼峰开发项目，不是外层工作目录或 `Raw/`。路径冲突先报错，只创建缺失内容，不覆盖已有文件。在 `--mode linked`（默认）下，它创建：

```text
<project>/
├── frontend/
├── backend/
├── docs/
│   ├── specs/product-spec.md
│   ├── specs/feature-map.md
│   ├── architecture/architecture.md
│   └── verification/
├── README.md
└── AGENTS.md
```

*(在 `--mode full` 下额外创建 `docs/PRD.md`。)*

## 初始化后的产品合同与实现流程

### 1. Product Spec（产品总规格）

- **精简联动模式（`--mode linked`）**：直接进入同级 `$product-spec`，读取 `../Raw/` 下由 `02-产品设计阶段` 移交的业务 PRD、页面 Demo 版 PRD、字段清单与 `HANDOFF.md`，生成并确认 `docs/specs/product-spec.md`（定义 `PSC-001..NNN`），运行 `validate_product_spec.py --require-confirmed`。
- **完整模式（`--mode full`）**：先用 `$product-prd` 确认 `docs/PRD.md`（通过 `validate_prd.py --require-confirmed`），再用 `$product-spec` 转成 `docs/specs/product-spec.md`。

### 2. Feature Map 与 Feature Spec

使用同级 `$feature-spec-planning`：

1. 基于 confirmed Product Spec 生成并确认 `docs/specs/feature-map.md`；
2. 为每个 Feature 创建目录并写清 `spec.md` 的行为、边界、状态和 `AC-FNNN-NNN`；
3. Feature AC 明确后使用 `$project-evals` 设计 `evals/FNNN.json`。

### 3. Architecture、Plan、Tasks 与实现验证

1. 填写 `docs/architecture/architecture.md` 与 `AGENTS.md`，将 Architecture 标为 `status: confirmed`。
2. 回到 `$feature-spec-planning`，完成授权 Feature 的 `plan.md` 与 `tasks.md`，运行 `validate_feature_specs.py --feature FNNN --require-ready`。
3. 在 `frontend/`、`backend/` 中实现授权 Feature，通过 `$project-evals` 绑定并执行自动化测试与真实界面检查，将结果写入 `docs/verification/`。
4. Feature 完成后将 Map 行与 tasks 状态改为 `completed`，运行 `validate_feature_specs.py --feature FNNN --require-complete` 与 `validate_evals.py --require-bound`。
5. 从真实 manifest 和脚本回填 `README.md` 与 `AGENTS.md` 中的命令。

## 完成标准

- 外层 `Raw/` 与大驼峰开发项目同级，上游交接原件与开发产物分开存放；
- 标准骨架在首次产品代码之前建立；
- `product-spec.md` 与 `feature-map.md` confirmed（完整模式含 `docs/PRD.md`），授权 Feature 三件套通过 ready 与 complete 校验；
- 授权 Feature 的 Task 与 Eval 用例有真实完成证据；
- `README.md` 与 `AGENTS.md` 命令对应真实脚本。
