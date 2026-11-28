import {
  BUNDLED_CONTEXT_TEMPLATES,
  BUNDLED_SKILLS,
  BUNDLED_TEMPLATES,
} from '../data/bundledAssets';
import { getActiveSkillsForMode } from '../data/stageBlueprints';
import {
  DevMode,
  GeneratedFile,
  ProjectInitConfig,
  ResolvedArtifactBundle,
  ResolvedTreeNode,
  SkillMeta,
  StageBlueprint,
  StageId,
} from '../types/config';
import { computeResolvedStageTrees, resolveDevMode } from './treeEngine';

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();
}

function renderContextTemplateContent(
  filename: string,
  checkedContextFilenames: Set<string>
): string {
  const entry = BUNDLED_CONTEXT_TEMPLATES.find((t) => t.filename === filename);
  if (!entry) return `# ${filename}\n`;
  if (filename !== '00-背景信息索引.md') {
    return entry.content;
  }
  // Keep 00-背景信息索引.md table rows in sync with the user's checked context templates
  return entry.content
    .split('\n')
    .filter((line) => {
      const match = line.match(/^\|\s*0[0-8]\s*\|\s*`([^`]+)`\s*\|/);
      if (!match) return true;
      return checkedContextFilenames.has(match[1]);
    })
    .join('\n');
}

function renderStageAgentsMd(
  stageRoot: ResolvedTreeNode,
  config: ProjectInitConfig,
  effectiveDevMode: DevMode,
  activeSkills: SkillMeta[]
): string {
  const checkedL2Folders = stageRoot.children.filter((c) => c.checked && c.kind === 'folder');
  const dirRows =
    checkedL2Folders.length > 0
      ? checkedL2Folders
          .map((folder) => `| \`${folder.displayName}/\` | ${folder.description} |`)
          .join('\n')
      : '| （待补充） | 按需创建子目录 |';

  const genericRulesAppendix =
    config.primaryAgent === 'generic'
      ? `\n---\n\n## 通用协作规范\n\n${
          stageRoot.stageId === '03'
            ? BUNDLED_TEMPLATES.engineeringPrinciples
            : BUNDLED_TEMPLATES.designPrinciples
        }\n\n---\n\n${stripFrontmatter(BUNDLED_TEMPLATES.codingDiscipline)}\n`
      : '';

  if (stageRoot.stageId === '02') {
    const contextFolder = checkedL2Folders.find((f) => f.id === '02-context');
    const checkedContextTemplates =
      contextFolder?.children.filter(
        (c) => c.checked && c.templateKey?.startsWith('context-template:')
      ) || [];
    const hasIndexFile = checkedContextTemplates.some(
      (c) => c.displayName === '00-背景信息索引.md'
    );
    const contextHint =
      contextFolder && checkedContextTemplates.length > 0
        ? hasIndexFile
          ? `- **先读背景总索引**：进入本工作区后先阅读 \`${contextFolder.displayName}/00-背景信息索引.md\`，通过提问逐步协助用户将已选的 ${checkedContextTemplates.length} 份背景模板中的 \`【待确认】\` 内容补全，并遵循权威层级 \`context/ > template/ > prd/\`。`
          : `- **补全背景模板**：\`${contextFolder.displayName}/\` 已预置 ${checkedContextTemplates.length} 份通用背景模板，请通过提问逐步协助用户补全其中的 \`【待确认】\` 内容，并遵循权威层级 \`context/ > template/ > prd/\`。`
        : '';

    return `# AGENTS.md — ${stageRoot.displayName}

> **项目名称**：【首次对话向用户确认后填写】
> **项目简介**：【首次对话向用户确认后填写】

## 1. 目录导航

| 目录 | 用途 |
|---|---|
${dirRows}

*(注：阶段内大类目录通过上表索引，空目录默认以隐藏的 \`.gitkeep\` 占位。)*

## 2. 协作约束

${contextHint ? `${contextHint}\n` : ''}- 所有文档统一使用简体中文 Markdown，单文件尽量保持在 2000 字以内，过长按模块拆分。
- **按需生成子目录索引**：当某个目录内文件数 ≥ 5 或拆分出具体业务模块子目录时，由 Agent 自动生成并维护该目录的 \`README.md\` 索引，不提前创建空壳说明文件。
- **改源头，不改对话**：确认后的业务规则或纠偏直接写回对应文件，不留在临时对话里。
- 遇到不确定的业务规则先标 \`【待确认】\`，不擅自编造不存在的字段或功能。
- 开始设计前先与用户对齐本期不做范围（Not In Scope），防止范围蔓延。${genericRulesAppendix}`;
  }

  if (stageRoot.stageId === '03') {
    const modeTitle =
      effectiveDevMode === 'linked'
        ? '精简开发模式（承接 02 设计稿，跳过重复需求与 docs/PRD.md）'
        : '完整开发模式（从 Raw 原始资料起步，覆盖需求整理到开发交付）';

    const skillTable = activeSkills
      .map((s) => `| \`$${s.name}\` | ${s.shortDesc} |`)
      .join('\n');

    const initStep =
      effectiveDevMode === 'linked'
        ? `1. 确认 \`02-产品设计阶段\` 的产出物（PRD、原型等）已放入 \`Raw/\`；
2. **自动执行 \`$build-fde-project\`**：向用户确认大驼峰工程目录名与产品名称后，运行 \`init_project.py --mode linked\` 生成内部开发子工程（不生成重复的 \`docs/PRD.md\`）；
3. 依次调用 \`$product-spec\`（直读 \`Raw/\`）→ \`$feature-spec-planning\` → 编码实现与 \`$project-evals\` 验收 → \`$deliver-project\` 交付。`
        : `1. 将客户原始需求资料放入 \`Raw/\`，按需调用需求清洗、看板与原型技能；
2. **自动执行 \`$build-fde-project\`**：向用户确认大驼峰工程目录名与产品名称后，运行 \`init_project.py --mode full\` 生成内部开发子工程；
3. 依次调用 \`$product-prd\` → \`$product-spec\` → \`$feature-spec-planning\` → 编码实现与 \`$project-evals\` 验收 → \`$deliver-project\` 交付。`;

    return `# AGENTS.md — ${stageRoot.displayName}

> **当前开发模式**：${modeTitle}

## 1. 工作区目录

| 目录 | 用途 |
|---|---|
${dirRows}

## 2. 启动与开发步骤

${initStep}

## 3. 已内置的开发技能（${activeSkills.length} 项）

| 技能名 | 作用说明 |
|---|---|
${skillTable}
${genericRulesAppendix}`;
  }

  return `# AGENTS.md — ${stageRoot.displayName}

> **项目名称**：【首次对话向用户确认后填写】

## 1. 目录导航

| 目录 | 用途 |
|---|---|
${dirRows}

## 2. 协作约定

- 产出文档统一使用简体中文 Markdown。
- 空目录默认以 \`.gitkeep\` 占位；当子目录内文件数 ≥ 5 或拆出独立模块子目录时，由 Agent 自动生成并维护局部 \`README.md\`。
- 未明确事项标 \`【待确认】\`，不自行假设。${genericRulesAppendix}`;
}

function renderAutoReadmeForL3Folder(folder: ResolvedTreeNode): string {
  const checkedChildren = folder.children.filter((c) => c.checked);
  const childRows =
    checkedChildren.length > 0
      ? checkedChildren
          .map(
            (child) =>
              `| \`${child.displayName}${child.kind === 'folder' ? '/' : ''}\` | ${child.description} |`
          )
          .join('\n')
      : '| （待添加） | 随对话按需补充文档 |';

  return `# ${folder.displayName}

> **路径**：\`${folder.relativePath}/\`
> **职责**：${folder.description}

## 目录内容

| 名称 | 说明 |
|---|---|
${childRows}
`;
}

function renderBootstrapMd(
  config: ProjectInitConfig,
  effectiveDevMode: DevMode,
  stageTrees: ResolvedTreeNode[],
  activeSkills: SkillMeta[]
): string {
  const agentName = config.primaryAgent === 'antigravity' ? 'Antigravity 2.0' : '本地 Agent';
  const stage02 = stageTrees.find((s) => s.stageId === '02');
  const stage03 = stageTrees.find((s) => s.stageId === '03');

  const stageLines = stageTrees
    .map((s) => `- \`${s.displayName}/\`：${s.description}`)
    .join('\n');

  const steps: string[] = [];

  if (stage02) {
    const contextNode = stage02.children.find((c) => c.id === '02-context' && c.checked);
    const checkedContextCount =
      contextNode?.children.filter(
        (c) => c.checked && c.templateKey?.startsWith('context-template:')
      ).length || 0;
    const contextStep =
      contextNode && checkedContextCount > 0
        ? `2. \`${stage02.displayName}/${contextNode.displayName}/\` 已预置 ${checkedContextCount} 份通用业务背景模板（均为 \`⚪ 待填充\`），请通过提问了解用户项目背景与目标，逐步补全模板内容。`
        : `2. 通过对话向用户了解项目背景与目标，再按需在业务上下文与需求文档目录下生成文档。`;
    steps.push(
      `### ${stage02.displayName}\n1. 用 ${agentName} 直接打开 \`${stage02.displayName}/\` 作为工作区，先读 \`AGENTS.md\`。\n${contextStep}${
        stage03
          ? `\n3. 设计定稿后，将产出物复制到 \`../${stage03.displayName}/Raw/\` 完成交接。`
          : ''
      }`
    );
  }

  if (stage03) {
    steps.push(
      `### ${stage03.displayName}（${
        effectiveDevMode === 'linked'
          ? `精简开发模式 · ${activeSkills.length} 技能`
          : `完整开发模式 · ${activeSkills.length} 技能`
      }）\n1. 用 ${agentName} 直接打开 \`${stage03.displayName}/\` 作为工作区，先读 \`AGENTS.md\`。\n2. **自动执行 \`build-fde-project\` 技能**：向用户确认开发子工程的英文大驼峰目录名与产品名后，运行 \`.agents/skills/build-fde-project/scripts/init_project.py --mode ${effectiveDevMode}\` 完成内部工程目录初始化。\n3. ${
        effectiveDevMode === 'linked'
          ? '初始化后跳过需求整理与 docs/PRD.md，直接运行 `$product-spec` 读取 `Raw/` 中的 02 设计稿，继续后续拆分、开发与验收。'
          : '初始化后按内置技能依次推进需求整理、PRD、总规格、功能拆分、开发与验收。'
      }`
    );
  }

  const otherStages = stageTrees.filter((s) => s.stageId !== '02' && s.stageId !== '03');
  if (otherStages.length > 0) {
    steps.push(
      `### 其他已选阶段\n直接用 ${agentName} 打开对应阶段文件夹（${otherStages
        .map((s) => `\`${s.displayName}/\``)
        .join('、')}），先读该目录下的 \`AGENTS.md\` 并与用户确认本阶段任务。`
    );
  }

  return `# 项目启动（一次性初始化指令）

> **致本地 Agent**：当你收到用户发来的这份 \`项目启动.md\` 时，请直接按下方步骤完成本项目的首次初始化；**全部初始化完成后，请删除本文件 \`项目启动.md\`**，避免后续会话重复触发。

## 1. 本次生成的阶段目录

${stageLines}
${
  stage03
    ? `\n已内置开发技能（${activeSkills.length} 项）：${activeSkills
        .map((s) => `\`${s.name}\``)
        .join('、')}`
    : ''
}

## 2. 初始化执行步骤

${steps.join('\n\n')}

## 3. 收尾动作

- 确认上述初始化步骤与用户对齐无误后，删除项目根目录的 \`项目启动.md\`。
- 后续进入日常工作时，提醒用户直接用 ${agentName} 打开对应的阶段文件夹（如 \`${stageTrees[0]?.displayName || '阶段目录'}/\`）作为独立工作区即可。
`;
}

const UNIVERSAL_GITIGNORE = `# 操作系统生成文件
.DS_Store
Thumbs.db
desktop.ini

# 环境变量与本地密钥（切勿提交）
.env
.env.*
!.env.example
*.pem
*.key

# 前端依赖与构建产物
node_modules/
dist/
build/
.next/
.vite/
.cache/

# Python 虚拟环境与缓存
__pycache__/
*.py[cod]
.venv/
venv/
.pytest_cache/

# 日志与临时文件
*.log
npm-debug.log*
.tmp/
*.swp
*.swo

# 编辑器本地配置
.vscode/*
!.vscode/extensions.json
.idea/
`;

export function buildArtifactBundle(
  config: ProjectInitConfig,
  blueprints: Record<StageId, StageBlueprint>
): ResolvedArtifactBundle {
  const effectiveDevMode = resolveDevMode(
    config.selectedStages,
    config.devModeOverride,
    config.devMode
  );
  const activeSkills = config.selectedStages.includes('03')
    ? getActiveSkillsForMode(effectiveDevMode)
    : [];
  const stageTrees = computeResolvedStageTrees(config, blueprints);
  const files: GeneratedFile[] = [];

  // 1. Top-level one-time bootstrap file (no 0-level wrapper folder)
  files.push({
    path: '项目启动.md',
    content: renderBootstrapMd(config, effectiveDevMode, stageTrees, activeSkills),
    category: 'bootstrap',
    description: '一次性初始化引导，用后可删除',
  });

  // 2. Stage files
  for (const stageRoot of stageTrees) {
    const stageId = stageRoot.stageId;

    if (config.primaryAgent === 'antigravity') {
      files.push({
        path: `${stageRoot.relativePath}/.antigravityignore`,
        content: `# 初始化后按需自主维护忽略路径\n`,
        category: 'agent-config',
        stageId,
        description: 'Antigravity 忽略文件（空基础模板）',
      });

      const ruleName =
        stageId === '03' ? 'engineering-principles.md' : 'workspace-rules.md';
      const ruleBody =
        stageId === '03'
          ? BUNDLED_TEMPLATES.engineeringPrinciples
          : BUNDLED_TEMPLATES.designPrinciples;
      files.push({
        path: `${stageRoot.relativePath}/.agents/rules/${ruleName}`,
        content: ruleBody,
        category: 'agent-config',
        stageId,
        description: 'Antigravity 工作区规则',
      });

      files.push({
        path: `${stageRoot.relativePath}/.agents/rules/coding-discipline.md`,
        content: BUNDLED_TEMPLATES.codingDiscipline,
        category: 'agent-config',
        stageId,
        description: '编码纪律规则（涉及写代码/改代码时自动触发）',
      });
    }

    // For stage 03, inject all active skills into .agents/skills/<skillName>/
    if (stageId === '03') {
      for (const skill of activeSkills) {
        const bundled = BUNDLED_SKILLS[skill.name];
        if (!bundled) continue;
        for (const [relFile, fileContent] of Object.entries(bundled.files)) {
          files.push({
            path: `${stageRoot.relativePath}/.agents/skills/${skill.name}/${relFile}`,
            content: fileContent,
            category: 'skill',
            stageId,
            description: `${skill.name} · ${skill.shortDesc}`,
          });
        }
      }
    }

    const contextFolderNode = stageRoot.children.find((c) => c.id === '02-context');
    const checkedContextFilenames = new Set(
      (contextFolderNode?.children || [])
        .filter((c) => c.checked && c.templateKey?.startsWith('context-template:'))
        .map((c) => c.displayName)
    );

    function walkNodes(nodes: ResolvedTreeNode[]) {
      for (const node of nodes) {
        if (!node.checked) continue;

        if (node.kind === 'file') {
          if (node.templateKey?.startsWith('stage-agents-')) {
            files.push({
              path: node.relativePath,
              content: renderStageAgentsMd(stageRoot, config, effectiveDevMode, activeSkills),
              category: 'agent-config',
              stageId,
              description: '阶段工作区入口与规则',
            });
          } else if (node.templateKey === 'stage-gitignore') {
            files.push({
              path: node.relativePath,
              content: UNIVERSAL_GITIGNORE,
              category: 'agent-config',
              stageId,
              description: 'Git 通用忽略规则',
            });
          } else if (node.templateKey?.startsWith('context-template:')) {
            const filename = node.templateKey.slice('context-template:'.length);
            files.push({
              path: node.relativePath,
              content: renderContextTemplateContent(filename, checkedContextFilenames),
              category: 'custom',
              stageId,
              description: node.description,
            });
          } else {
            files.push({
              path: node.relativePath,
              content: `# ${node.displayName}\n\n${node.description}\n`,
              category: 'custom',
              stageId,
              description: node.description,
            });
          }
        } else if (node.kind === 'folder') {
          if (node.displayName === '.agents') continue;

          walkNodes(node.children);

          // Level 3 and below: automatically generate navigation README.md
          if (node.level >= 3) {
            const readmePath = `${node.relativePath}/README.md`;
            if (!files.some((f) => f.path === readmePath)) {
              files.push({
                path: readmePath,
                content: renderAutoReadmeForL3Folder(node),
                category: 'auto-readme',
                stageId,
                description: '3 级及以下文件夹自动生成的导航说明',
              });
            }
          }

          // Level 2 empty folder: silent .gitkeep so ZIP and Git never drop empty directories
          if (node.level === 2) {
            const prefix = `${node.relativePath}/`;
            const hasAnyChild = files.some((f) => f.path.startsWith(prefix));
            if (!hasAnyChild) {
              files.push({
                path: `${node.relativePath}/.gitkeep`,
                content: '',
                category: 'gitkeep',
                stageId,
                description: '空目录占位文件',
              });
            }
          }
        }
      }
    }

    walkNodes(stageRoot.children);
  }

  const fileMap: Record<string, GeneratedFile> = {};
  for (const file of files) {
    fileMap[file.path] = file;
  }

  return {
    config,
    effectiveDevMode,
    activeSkills,
    stageTrees,
    files,
    fileMap,
  };
}
