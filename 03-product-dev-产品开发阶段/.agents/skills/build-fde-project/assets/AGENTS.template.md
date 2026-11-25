# AGENTS.md

> `{{PUBLIC_NAME}}`：{{SUMMARY}}

## 项目定位

- 项目根目录名：`{{PROJECT_DIR_NAME}}`
- 对外产品名：`{{PUBLIC_NAME}}`
- 目标用户与场景：【待填写】
- P0 核心旅程：【待填写：入口 → 输入/触发 → 处理/等待 → 可见结果】
- 当前范围：【待填写】
- 明确不做：【待填写】

## 产品语言与界面约束

- 用户可见名称使用 `{{PUBLIC_NAME}}`；内部工程名、缩写和临时代号不直接暴露给最终用户。
- 不默认在产品界面展示“演示模式”“Mock”“测试版”等内部研发阶段标签；确有告知必要时由产品规格明确规定。
- 使用用户任务、业务对象、动作和可观察状态命名，避免空泛包装词。

## 目录与架构边界

- 项目根目录名使用大驼峰（PascalCase），只包含英文字母和数字并以大写字母开头；例如 `ProjectInitializer`、`OrderFulfillment`。
- 上游设计交接材料或客户原始资料位于外层工作目录的 `../Raw/`，按需读取并保留原件；派生工程规格写入本项目的 `docs/`。

```text
{{PROJECT_DIR_NAME}}/
├── frontend/  # 前端源码、测试、静态资源和专属配置
├── backend/   # 后端服务、脚本、数据、测试和专属配置（纯前端项目可保持为空或放构建辅助脚本）
├── docs/      # Product Spec、Feature 规格、架构和验证证据（完整模式含 PRD.md）
├── evals/     # 保存项目级验收用例与检查关联
├── README.md
└── AGENTS.md
```

- 根目录只保留项目级文档、验收定义和真实跨服务编排文件。
- 前端专属内容放入 `frontend/`；后端或构建脚本放入 `backend/`。

## 文档职责

- `../Raw/`（精简联动模式）或 `docs/PRD.md`（完整模式）：上游产品需求与页面规格事实源。
- `docs/specs/product-spec.md`：唯一项目级总行为合同（`PSC-NNN`），记录跨 Feature 对象、状态、不变量、共享交互、安全恢复和兼容规则。
- `docs/specs/feature-map.md`：已确认 Feature 边界、PSC 归属、优先级和依赖的唯一事实源。
- `docs/specs/FNNN-<slug>/spec.md`：单个 Feature 的行为、状态、边界和 `AC-FNNN-NNN` 验收。
- `docs/specs/FNNN-<slug>/plan.md`：该 Feature 的实现方案、影响范围、顺序、风险和回退。
- `docs/specs/FNNN-<slug>/tasks.md`：可独立验证的任务、依赖、完成证据和验证方法。
- `docs/architecture/architecture.md`：框架、依赖、数据、服务边界和技术决策。
- `docs/verification/`：记录真实命令、退出状态、可观察结果和未验证项。
- `evals/FNNN.json`：引用已有 `AC-FNNN-NNN` / `PSC-NNN` 的验收用例与检查绑定。

## 技术基线与真实命令

- 前端：【待填写：框架、版本、包管理器和入口】
- 后端：【待填写：框架、版本或写“纯前端静态单页应用，无后端服务”】
- 安装：【待填写：真实命令】
- 启动：【待填写：真实命令】
- 测试与构建：【待填写：真实命令】

## 开发规则

- 只实现 Feature Map 中已确认且由当前请求授权的 Feature；保持 Product Spec、Feature Map、三件套、架构和实现一致。
- 跨 Feature 合同变化时使用 `$product-spec`；Feature 边界或任务变化时使用 `$feature-spec-planning`。
- 使用 `$project-evals` 将本次 AC 具体化为用例，在实际工程中绑定并运行检查。
- Task 按可独立验证的结果拆分，不得使用 FE、BE、INT 或 Pack 技术车道标签。
- 只有完成证据和最窄验证真实通过后才勾选 Task。

## Definition of Done

- 行为可追踪到已确认的 `PSC-NNN` 与 `AC-FNNN-NNN` 验收标准；
- 最窄相关检查与真实界面核查通过；
- 本轮受影响的 README、AGENTS、Product Spec、Feature Map、三件套、架构和验证证据已同步。
