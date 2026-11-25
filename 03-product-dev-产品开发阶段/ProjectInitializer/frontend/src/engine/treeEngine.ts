import {
  DevMode,
  LanguageMode,
  ProjectInitConfig,
  ResolvedTreeNode,
  StageBlueprint,
  StageId,
  TreeNode,
} from '../types/config';

/**
 * Determine effective DevMode:
 * - Both '02' and '03' selected (and not manually overridden) -> 'linked' (6 core skills, skips PRD/prototype)
 * - Only '03' selected (without '02') -> 'full' (12 skills) unless manually overridden to 'linked'
 */
export function resolveDevMode(
  selectedStages: StageId[],
  devModeOverride: boolean,
  currentDevMode: DevMode
): DevMode {
  const has02 = selectedStages.includes('02');
  const has03 = selectedStages.includes('03');
  if (!has03) return currentDevMode;
  if (devModeOverride) return currentDevMode;
  return has02 ? 'linked' : 'full';
}

export function formatStageDirName(stage: StageBlueprint, language: LanguageMode): string {
  const prefix = stage.stageId;
  if (language === 'zh') return `${prefix}-${stage.nameZh}`;
  if (language === 'en') return `${prefix}-${stage.nameEn}`;
  return `${prefix}-${stage.nameEn}-${stage.nameZh}`;
}

export function formatNodeDisplayName(
  node: TreeNode,
  language: LanguageMode,
  indexInLevel?: number
): string {
  if (!node.numbered) {
    if (node.kind === 'file') {
      if (
        node.nameEn === 'AGENTS.md' ||
        node.nameEn === 'README.md' ||
        node.nameEn === '.gitignore'
      ) {
        return node.nameEn;
      }
      return language === 'en' ? node.nameEn : node.nameZh;
    }
    return node.nameEn;
  }

  const num = indexInLevel ?? 1;
  if (language === 'zh') return `${num}-${node.nameZh}`;
  if (language === 'en') return `${num}-${node.nameEn}`;
  return `${num}-${node.nameEn}-${node.nameZh}`;
}

export function computeResolvedStageTrees(
  config: ProjectInitConfig,
  blueprints: Record<StageId, StageBlueprint>
): ResolvedTreeNode[] {
  const orderedStages: StageId[] = ['01', '02', '03', '04', '05'];
  const activeStageIds = orderedStages.filter((id) => config.selectedStages.includes(id));

  function resolveChildren(
    nodes: TreeNode[],
    parentPath: string,
    language: LanguageMode
  ): ResolvedTreeNode[] {
    let numberedCounter = 0;
    return nodes.map((node) => {
      let assignedIndex: number | undefined;
      if (node.checked && node.kind === 'folder' && node.numbered) {
        numberedCounter += 1;
        assignedIndex = numberedCounter;
      }
      const displayName = formatNodeDisplayName(node, language, assignedIndex);
      const relativePath = `${parentPath}/${displayName}`;
      const children = node.children
        ? resolveChildren(node.children, relativePath, language)
        : [];
      return {
        id: node.id,
        stageId: node.stageId,
        kind: node.kind,
        level: node.level,
        displayName,
        relativePath,
        description: node.description,
        numbered: node.numbered,
        checked: node.checked,
        locked: node.locked,
        isCustom: node.isCustom,
        templateKey: node.templateKey,
        children,
      };
    });
  }

  return activeStageIds.map((stageId) => {
    const bp = blueprints[stageId];
    const stageDirName = formatStageDirName(bp, config.language);
    return {
      id: `stage-root-${stageId}`,
      stageId,
      kind: 'folder',
      level: 1,
      displayName: stageDirName,
      relativePath: stageDirName,
      description: bp.summary,
      numbered: true,
      checked: true,
      locked: true,
      children: resolveChildren(bp.nodes, stageDirName, config.language),
    };
  });
}

export function toggleTreeNodeChecked(nodes: TreeNode[], targetId: string): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      if (node.locked) return node;
      return { ...node, checked: !node.checked };
    }
    if (node.children) {
      return { ...node, children: toggleTreeNodeChecked(node.children, targetId) };
    }
    return node;
  });
}

export function moveTreeNodeInLevel(
  nodes: TreeNode[],
  targetId: string,
  direction: 'up' | 'down'
): TreeNode[] {
  const index = nodes.findIndex((n) => n.id === targetId);
  if (index !== -1) {
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= nodes.length) return nodes;
    // Prevent moving numbered folders above locked or non-numbered config files
    if (nodes[swapWith].locked || !nodes[swapWith].numbered) return nodes;
    const copy = [...nodes];
    const temp = copy[index];
    copy[index] = copy[swapWith];
    copy[swapWith] = temp;
    return copy;
  }
  return nodes.map((node) =>
    node.children
      ? { ...node, children: moveTreeNodeInLevel(node.children, targetId, direction) }
      : node
  );
}

/**
 * Add a new Level 2 folder directly at the bottom of a stage (e.g. inside 02-product-design).
 */
export function addRootFolderToStage(
  nodes: TreeNode[],
  stageId: StageId,
  spec: { nameZh: string; nameEn: string; description: string }
): TreeNode[] {
  const cleanZh = spec.nameZh.trim() || '自定义目录';
  const cleanEn =
    spec.nameEn.trim().replace(/\s+/g, '-').toLowerCase() || 'custom-folder';
  const newNode: TreeNode = {
    id: `custom-l2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stageId,
    kind: 'folder',
    level: 2,
    nameZh: cleanZh,
    nameEn: cleanEn,
    numbered: true,
    checked: true,
    isCustom: true,
    description: spec.description.trim() || '自定义工作目录',
    children: [],
  };
  return [...nodes, newNode];
}

/**
 * Add a new Level 3+ subfolder inside an existing folder node.
 */
export function addCustomSubfolder(
  nodes: TreeNode[],
  parentId: string,
  spec: { nameZh: string; nameEn: string; description: string }
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === parentId && node.kind === 'folder') {
      const cleanZh = spec.nameZh.trim() || '子模块';
      const cleanEn =
        spec.nameEn.trim().replace(/\s+/g, '-').toLowerCase() || 'submodule';
      const newNode: TreeNode = {
        id: `custom-sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stageId: node.stageId,
        kind: 'folder',
        level: node.level + 1,
        nameZh: cleanZh,
        nameEn: cleanEn,
        numbered: true,
        checked: true,
        isCustom: true,
        description: spec.description.trim() || '业务子目录（打包时自动生成 README.md）',
        children: [],
      };
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return { ...node, children: addCustomSubfolder(node.children, parentId, spec) };
    }
    return node;
  });
}

export function renameTreeNode(
  nodes: TreeNode[],
  targetId: string,
  newNames: { nameZh: string; nameEn: string }
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return {
        ...node,
        nameZh: newNames.nameZh.trim() || node.nameZh,
        nameEn: newNames.nameEn.trim() || node.nameEn,
      };
    }
    if (node.children) {
      return { ...node, children: renameTreeNode(node.children, targetId, newNames) };
    }
    return node;
  });
}

export function deleteCustomTreeNode(nodes: TreeNode[], targetId: string): TreeNode[] {
  return nodes
    .filter((node) => !(node.id === targetId && node.isCustom))
    .map((node) =>
      node.children
        ? { ...node, children: deleteCustomTreeNode(node.children, targetId) }
        : node
    );
}
