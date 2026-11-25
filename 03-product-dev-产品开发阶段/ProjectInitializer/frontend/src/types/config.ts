export type LanguageMode = 'zh' | 'en' | 'bilingual';
export type PrimaryAgent = 'antigravity' | 'generic';
export type StageId = '01' | '02' | '03' | '04' | '05';
export type DevMode = 'full' | 'linked';
export type ActiveStep = 'landing' | 'config' | 'workbench' | 'export';

export interface SkillMeta {
  name: string;
  category: 'core' | 'discovery';
  shortDesc: string;
}

export interface TreeNode {
  id: string;
  stageId: StageId;
  kind: 'folder' | 'file';
  level: number; // 1 = stage folder, 2 = workspace folder/file, 3+ = user-added subfolders
  nameZh: string;
  nameEn: string;
  numbered: boolean;
  checked: boolean;
  locked?: boolean;
  isCustom?: boolean;
  description: string;
  templateKey?: string;
  children?: TreeNode[];
}

export interface StageBlueprint {
  stageId: StageId;
  nameZh: string;
  nameEn: string;
  roleLabel: string;
  summary: string;
  nodes: TreeNode[];
}

export interface ProjectInitConfig {
  language: LanguageMode;
  primaryAgent: PrimaryAgent;
  selectedStages: StageId[];
  devMode: DevMode;
  devModeOverride: boolean;
}

export interface ResolvedTreeNode {
  id: string;
  stageId: StageId;
  kind: 'folder' | 'file';
  level: number;
  displayName: string;
  relativePath: string;
  description: string;
  numbered: boolean;
  checked: boolean;
  locked?: boolean;
  isCustom?: boolean;
  templateKey?: string;
  children: ResolvedTreeNode[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  category: 'bootstrap' | 'agent-config' | 'skill' | 'auto-readme' | 'gitkeep' | 'custom';
  stageId?: StageId;
  description: string;
}

export interface ResolvedArtifactBundle {
  config: ProjectInitConfig;
  effectiveDevMode: DevMode;
  activeSkills: SkillMeta[];
  stageTrees: ResolvedTreeNode[];
  files: GeneratedFile[];
  fileMap: Record<string, GeneratedFile>;
}
