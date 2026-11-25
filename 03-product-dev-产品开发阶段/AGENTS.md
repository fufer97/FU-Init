# AGENTS.md — 03-product-dev-产品开发阶段

> **项目名称**：一键项目初始化（Project Initializer）
> **当前阶段**：`03-product-dev-产品开发阶段`（研发 / FDE 工程工作区）
> **当前激活模式**：**【特殊】精简开发模式（Linked Design-to-Dev Mode，6 核心技能，跳过 `docs/PRD.md`，直读 `Raw/`）**

## 1. 工作区二级目录导航

| 目录 / 文件 | 职责说明 |
|---|---|
| `Raw/` | 上游 `02-product-design-产品设计阶段` 交接过来的权威材料（业务 PRD、页面 Demo 版 PRD、字段清单、上下文规范与 `HANDOFF.md` 交接清单），只读保留原件 |
| `.agents/rules/engineering-principles.md` | 开发阶段通用工程行为规范（8 类协作约束，Antigravity 2.0 打开本工作区时自动生效） |
| `.agents/skills/` | 精简开发模式 6 个核心工程技能（`build-fde-project`、`product-spec`、`feature-spec-planning`、`project-evals`、`maintain-project`、`deliver-project`） |
| `ProjectInitializer/` | 独立开发子工程（由 `build-fde-project/scripts/init_project.py --mode linked` 初始化生成，包含 `frontend/`、`backend/`、`docs/`、`evals/` 及项目级 `AGENTS.md`） |

## 2. 精简开发模式推进主线（02 → 03 无缝衔接）

由于 `02-product-design-产品设计阶段` 已完成需求调研、业务上下文、字段清单、业务 PRD 与页面 Demo 版 PRD，本阶段**不再重复执行需求清洗、需求看板、体验原型与 `docs/PRD.md` 编写**，直接沿以下五步推进：

1. **初始化工程骨架（`$build-fde-project`）**：
   运行 `init_project.py --mode linked`，在 `Raw/` 同级创建大驼峰开发工程 `ProjectInitializer/`（不生成冗余的 `docs/PRD.md`）。
2. **冻结跨功能产品总规格（`$product-spec`）**：
   直接读取 `../Raw/HANDOFF.md` 及 `../Raw/` 下的 02 阶段 PRD 与字段清单，在 `ProjectInitializer/docs/specs/product-spec.md` 中定义全局对象、状态机、不变量与 `PSC-001..NNN` 行为合同，并运行 `validate_product_spec.py --require-confirmed`。
3. **收敛技术架构与拆分 Feature（`$feature-spec-planning`）**：
   填写 `docs/architecture/architecture.md`，将 `PSC-NNN` 拆解为 `docs/specs/feature-map.md` 及各 Feature 目录下的 `spec.md`、`plan.md`、`tasks.md`，运行 `validate_feature_specs.py --require-ready`。
4. **设计验收套件并编码实现（`$project-evals`）**：
   生成 `evals/FNNN.json`，按 `tasks.md` 依赖顺序实现功能，绑定并运行自动化测试与真实浏览器检查，把结果记录到 `docs/verification/`，通过 `validate_feature_specs.py --require-complete` 与 `validate_evals.py --require-bound`。
5. **整理交付物与持续维护（`$deliver-project` / `$maintain-project`）**：
   构建可直接发布至 WorkBuddy「资料库」的单个自包含 `.html` 文件，并在 `docs/delivery/` 生成交付清单与字节指纹。
