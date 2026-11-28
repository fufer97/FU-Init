import { ProjectInitConfig, SkillMeta, StageBlueprint, StageId, TreeNode } from '../types/config';

export const DEFAULT_CONFIG: ProjectInitConfig = {
  language: 'bilingual',
  primaryAgent: 'antigravity',
  selectedStages: ['02', '03'],
  devMode: 'linked',
  devModeOverride: false,
};

/**
 * Plain-Chinese descriptions for non-developer users so every skill's purpose is clear at a glance.
 */
export const DEV_SKILLS_META: SkillMeta[] = [
  // 7 Core skills (always included in Linked & Full modes)
  {
    name: 'build-fde-project',
    category: 'core',
    shortDesc: '初始化核心：由 Agent 自动执行，建好内部前后端与规格目录骨架',
  },
  {
    name: 'classify-project-data',
    category: 'core',
    shortDesc: '把杂乱的项目文件与接口资料按形态盘点、按业务口径分类整理清单',
  },
  {
    name: 'product-spec',
    category: 'core',
    shortDesc: '把上游设计稿整理成全局一致的产品规格约定（跨功能共享规则）',
  },
  {
    name: 'feature-spec-planning',
    category: 'core',
    shortDesc: '把总规格拆成一个个可独立开发的功能模块与任务清单',
  },
  {
    name: 'project-evals',
    category: 'core',
    shortDesc: '为每个功能编写验收用例，代码写完后自动核对是否达标',
  },
  {
    name: 'maintain-project',
    category: 'core',
    shortDesc: '后续提新需求或改 Bug 时，确保代码、文档和验收记录同步更新',
  },
  {
    name: 'deliver-project',
    category: 'core',
    shortDesc: '开发收尾时整理交付清单、运行说明与版本校验',
  },
  // 6 Additional skills (included only in Full mode when skipping 02 stage)
  {
    name: 'prepare-requirement-materials',
    category: 'discovery',
    shortDesc: '在 Raw 目录下准备客户原始需求、沟通记录与约定的收集入口',
  },
  {
    name: 'normalize-project-requirements',
    category: 'discovery',
    shortDesc: '把杂乱的客户原始文档清洗成 AI 方便回查的结构化需求资料',
  },
  {
    name: 'review-project-requirements',
    category: 'discovery',
    shortDesc: '生成「客户痛点 → 对应功能 → 预期效果」三列需求看板供核对',
  },
  {
    name: 'build-frontend-prototype',
    category: 'discovery',
    shortDesc: '先做出可点击的前端演示原型，用来和需求方确认界面方向',
  },
  {
    name: 'product-prd',
    category: 'discovery',
    shortDesc: '把确认后的想法整理成工程级需求文档（docs/PRD.md）',
  },
  {
    name: 'playground',
    category: 'discovery',
    shortDesc: '快速生成单页交互式演示器，辅助讨论与验证局部方案',
  },
];

export function getActiveSkillsForMode(devMode: 'full' | 'linked'): SkillMeta[] {
  if (devMode === 'linked') {
    return DEV_SKILLS_META.filter((s) => s.category === 'core');
  }
  return DEV_SKILLS_META;
}

/**
 * Pure skeleton blueprints with ZERO pre-baked business content.
 * All business docs, context files, templates, prompts, and PRDs are created interactively with the local Agent.
 */
const CONTEXT_TEMPLATE_NODES_META: Array<{
  id: string;
  filename: string;
  description: string;
}> = [
  {
    id: '02-ctx-00',
    filename: '00-背景信息索引.md',
    description: '总索引、状态表、按任务按需读取路由与权威层级',
  },
  {
    id: '02-ctx-01',
    filename: '01-领域知识与产品形态.md',
    description: '产品定位、核心特征、页面骨架模式与交互/控件规范',
  },
  {
    id: '02-ctx-02',
    filename: '02-组织与业务背景.md',
    description: '团队概况、角色分工、核心痛点、场景频次与一期判断',
  },
  {
    id: '02-ctx-03',
    filename: '03-上下游与系统边界.md',
    description: '关联方/外部系统、数据输入输出关系与系统能力边界',
  },
  {
    id: '02-ctx-04',
    filename: '04-功能模块与数据依赖.md',
    description: '分期模块清单（一期/轻/二期）与模块间数据依赖图',
  },
  {
    id: '02-ctx-05',
    filename: '05-核心对象与编码操作规范.md',
    description: '对象分层、编号前缀规则、通用操作动词与主数据通则',
  },
  {
    id: '02-ctx-06',
    filename: '06-核心业务场景与流程.md',
    description: '场景拆解框架、Mermaid 主流程/异常分支与业务规则表',
  },
  {
    id: '02-ctx-07',
    filename: '07-项目边界与业务约束.md',
    description: 'In/Out Scope、轻支持清单、硬性约束汇总与跨模块通则',
  },
  {
    id: '02-ctx-08',
    filename: '08-术语与口径字典.md',
    description: '核心对象、业务动作、指标口径与操作动词统一字典',
  },
];

const OUTPUT_TEMPLATE_NODES_META: Array<{
  id: string;
  filename: string;
  description: string;
}> = [
  {
    id: '02-tpl-01',
    filename: '业务单据PRD模板.md',
    description: '业务单据类主 PRD 标准结构（定位、场景、状态机、规则、权限与验收）',
  },
  {
    id: '02-tpl-02',
    filename: 'PRD模板-主数据.md',
    description: '含审批流、多组织与外部同步的主数据管理类功能 PRD 模板',
  },
  {
    id: '02-tpl-03',
    filename: 'Demo PRD模板.md',
    description: '列表页、新增/编辑页、详情页的前端原型页面级规格模板',
  },
  {
    id: '02-tpl-04',
    filename: '字段清单模板.md',
    description: '11 列标准字段唯一权威源模板（头部、明细、汇总与系统字段）',
  },
  {
    id: '02-tpl-05',
    filename: '单据状态与流转设计规范.md',
    description: '状态机全局设计原则、动作按钮触发约束与主数据启停用标准',
  },
  {
    id: '02-tpl-06',
    filename: '状态机设计模板.md',
    description: '状态定义、Mermaid 状态图、状态流转表与动作能力矩阵模板',
  },
  {
    id: '02-tpl-07',
    filename: '业务流程推演模板.md',
    description: '跨单据与跨系统动态流程演练、数据快照与回写规则模板',
  },
  {
    id: '02-tpl-08',
    filename: '用例数据推演模板.md',
    description: '代入真实数值验证数据闭环、异常分支与并发边界的推演模板',
  },
];

export function createInitialStageBlueprints(): Record<StageId, StageBlueprint> {
  const makeGitignoreNode = (stageId: StageId): TreeNode => ({
    id: `${stageId}-gitignore`,
    stageId,
    kind: 'file',
    level: 2,
    nameZh: '.gitignore',
    nameEn: '.gitignore',
    numbered: false,
    checked: true,
    locked: false,
    description: 'Git 通用忽略规则（排除系统垃圾、密钥与依赖缓存）',
    templateKey: 'stage-gitignore',
  });

  const s01Nodes: TreeNode[] = [
    {
      id: '01-agents-md',
      stageId: '01',
      kind: 'file',
      level: 2,
      nameZh: 'AGENTS.md',
      nameEn: 'AGENTS.md',
      numbered: false,
      checked: true,
      locked: true,
      description: '阶段规则与目录入口',
      templateKey: 'stage-agents-01',
    },
    makeGitignoreNode('01'),
    {
      id: '01-interviews',
      stageId: '01',
      kind: 'folder',
      level: 2,
      nameZh: '需求调研与访谈',
      nameEn: 'interviews',
      numbered: true,
      checked: true,
      description: '存放售前沟通记录与用户访谈资料',
      children: [],
    },
    {
      id: '01-market',
      stageId: '01',
      kind: 'folder',
      level: 2,
      nameZh: '竞品与市场分析',
      nameEn: 'market-research',
      numbered: true,
      checked: true,
      description: '存放竞品拆解与市场调研分析',
      children: [],
    },
    {
      id: '01-brief',
      stageId: '01',
      kind: 'folder',
      level: 2,
      nameZh: '立项范围初稿',
      nameEn: 'project-brief',
      numbered: true,
      checked: true,
      description: '存放初步目标与待移交给设计的范围建议',
      children: [],
    },
  ];

  const s02Nodes: TreeNode[] = [
    {
      id: '02-agents-md',
      stageId: '02',
      kind: 'file',
      level: 2,
      nameZh: 'AGENTS.md',
      nameEn: 'AGENTS.md',
      numbered: false,
      checked: true,
      locked: true,
      description: '设计工作区入口与防跑偏约束',
      templateKey: 'stage-agents-02',
    },
    makeGitignoreNode('02'),
    {
      id: '02-context',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '业务上下文',
      nameEn: 'context',
      numbered: true,
      checked: true,
      description: '存放项目背景、业务规则与跨模块约定',
      children: CONTEXT_TEMPLATE_NODES_META.map((item) => ({
        id: item.id,
        stageId: '02',
        kind: 'file',
        level: 3,
        nameZh: item.filename,
        nameEn: item.filename,
        numbered: false,
        checked: true,
        locked: false,
        description: item.description,
        templateKey: `context-template:${item.filename}`,
      })),
    },
    {
      id: '02-template',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '输出模板',
      nameEn: 'template',
      numbered: true,
      checked: true,
      description: '存放固定格式的 PRD、字段清单、状态机与推演模板',
      children: OUTPUT_TEMPLATE_NODES_META.map((item) => ({
        id: item.id,
        stageId: '02',
        kind: 'file',
        level: 3,
        nameZh: item.filename,
        nameEn: item.filename,
        numbered: false,
        checked: true,
        locked: false,
        description: item.description,
        templateKey: `output-template:${item.filename}`,
      })),
    },
    {
      id: '02-prompt',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '常用提示词',
      nameEn: 'prompt',
      numbered: true,
      checked: true,
      description: '存放按场景沉淀的提示词',
      children: [],
    },
    {
      id: '02-prd',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '需求文档',
      nameEn: 'prd',
      numbered: true,
      checked: true,
      description: '按业务模块拆分存放 PRD 与字段清单',
      children: [],
    },
    {
      id: '02-prototypes',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '前端原型',
      nameEn: 'prototypes',
      numbered: true,
      checked: true,
      description: '按功能存放可交互前端演示页面',
      children: [],
    },
    {
      id: '02-drafts',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '过程草稿',
      nameEn: 'drafts',
      numbered: true,
      checked: true,
      description: '暂存过程草稿与对话导出',
      children: [],
    },
    {
      id: '02-reference',
      stageId: '02',
      kind: 'folder',
      level: 2,
      nameZh: '参考资料',
      nameEn: 'reference',
      numbered: true,
      checked: true,
      description: '存放老文档、截图与原始参考材料',
      children: [],
    },
  ];

  // Stage 03 has a fixed, clean engineering skeleton; Skills are read-only and bound by devMode.
  const s03Nodes: TreeNode[] = [
    {
      id: '03-agents-md',
      stageId: '03',
      kind: 'file',
      level: 2,
      nameZh: 'AGENTS.md',
      nameEn: 'AGENTS.md',
      numbered: false,
      checked: true,
      locked: true,
      description: '开发工作区入口，打开后自动执行 build-fde-project 初始化内部开发工程',
      templateKey: 'stage-agents-03',
    },
    makeGitignoreNode('03'),
    {
      id: '03-raw',
      stageId: '03',
      kind: 'folder',
      level: 2,
      nameZh: 'Raw',
      nameEn: 'Raw',
      numbered: false,
      checked: true,
      locked: true,
      description: '放置 02 设计阶段交付物（PRD / 原型）或客户原始资料',
      children: [],
    },
    {
      id: '03-dot-agents',
      stageId: '03',
      kind: 'folder',
      level: 2,
      nameZh: '.agents',
      nameEn: '.agents',
      numbered: false,
      checked: true,
      locked: true,
      description: '存放开发规则与内置自动化 Skills',
      children: [],
    },
  ];

  const s04Nodes: TreeNode[] = [
    {
      id: '04-agents-md',
      stageId: '04',
      kind: 'file',
      level: 2,
      nameZh: 'AGENTS.md',
      nameEn: 'AGENTS.md',
      numbered: false,
      checked: true,
      locked: true,
      description: '测试阶段规则与目录入口',
      templateKey: 'stage-agents-04',
    },
    makeGitignoreNode('04'),
    {
      id: '04-plans',
      stageId: '04',
      kind: 'folder',
      level: 2,
      nameZh: '测试计划',
      nameEn: 'test-plans',
      numbered: true,
      checked: true,
      description: '存放集成测试策略与环境范围',
      children: [],
    },
    {
      id: '04-cases',
      stageId: '04',
      kind: 'folder',
      level: 2,
      nameZh: '测试用例',
      nameEn: 'test-cases',
      numbered: true,
      checked: true,
      description: '存放功能、边界与回归测试用例',
      children: [],
    },
    {
      id: '04-reports',
      stageId: '04',
      kind: 'folder',
      level: 2,
      nameZh: '测试报告',
      nameEn: 'test-reports',
      numbered: true,
      checked: true,
      description: '存放缺陷记录与验收结论',
      children: [],
    },
  ];

  const s05Nodes: TreeNode[] = [
    {
      id: '05-agents-md',
      stageId: '05',
      kind: 'file',
      level: 2,
      nameZh: 'AGENTS.md',
      nameEn: 'AGENTS.md',
      numbered: false,
      checked: true,
      locked: true,
      description: '运维阶段规则与目录入口',
      templateKey: 'stage-agents-05',
    },
    makeGitignoreNode('05'),
    {
      id: '05-deploy',
      stageId: '05',
      kind: 'folder',
      level: 2,
      nameZh: '部署手册',
      nameEn: 'deployment',
      numbered: true,
      checked: true,
      description: '存放发布步骤、环境说明与回滚方法',
      children: [],
    },
    {
      id: '05-monitoring',
      stageId: '05',
      kind: 'folder',
      level: 2,
      nameZh: '监控告警',
      nameEn: 'monitoring',
      numbered: true,
      checked: true,
      description: '存放指标监控与日志检查规则',
      children: [],
    },
    {
      id: '05-incidents',
      stageId: '05',
      kind: 'folder',
      level: 2,
      nameZh: '应急与复盘',
      nameEn: 'incidents',
      numbered: true,
      checked: true,
      description: '存放故障预案与线上复盘记录',
      children: [],
    },
  ];

  return {
    '01': {
      stageId: '01',
      nameZh: '需求收集阶段',
      nameEn: 'requirement-collection',
      roleLabel: '售前 / 调研',
      summary: '售前访谈、竞品拆解与市场分析',
      nodes: s01Nodes,
    },
    '02': {
      stageId: '02',
      nameZh: '产品设计阶段',
      nameEn: 'product-design',
      roleLabel: '产品经理',
      summary: '业务上下文、需求文档与前端原型工作区',
      nodes: s02Nodes,
    },
    '03': {
      stageId: '03',
      nameZh: '产品开发阶段',
      nameEn: 'product-dev',
      roleLabel: '开发',
      summary: '放置上游资料并由 Agent 自动执行技能包构建工程',
      nodes: s03Nodes,
    },
    '04': {
      stageId: '04',
      nameZh: '产品测试阶段',
      nameEn: 'product-testing',
      roleLabel: '测试',
      summary: '独立测试计划、回归用例与验收报告',
      nodes: s04Nodes,
    },
    '05': {
      stageId: '05',
      nameZh: '产品运维阶段',
      nameEn: 'product-ops',
      roleLabel: '运维',
      summary: '线上部署手册、监控告警与应急预案',
      nodes: s05Nodes,
    },
  };
}
