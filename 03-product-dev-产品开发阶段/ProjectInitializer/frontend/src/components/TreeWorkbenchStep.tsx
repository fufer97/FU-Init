import React, { useState } from 'react';
import {
  DevMode,
  ResolvedArtifactBundle,
  ResolvedTreeNode,
  StageId,
} from '../types/config';
import { DEV_SKILLS_META } from '../data/stageBlueprints';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Blocks,
  Check,
  FileCode2,
  FileText,
  Folder,
  FolderMinus,
  FolderOpen,
  FolderPlus,
  Lock,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react';

interface TreeWorkbenchStepProps {
  bundle: ResolvedArtifactBundle;
  onToggleNode: (stageId: StageId, nodeId: string) => void;
  onMoveNode: (stageId: StageId, nodeId: string, direction: 'up' | 'down') => void;
  onAddRootFolder: (
    stageId: StageId,
    spec: { nameZh: string; nameEn: string; description: string }
  ) => void;
  onAddSubfolder: (
    stageId: StageId,
    parentId: string,
    spec: { nameZh: string; nameEn: string; description: string }
  ) => void;
  onRenameNode: (
    stageId: StageId,
    nodeId: string,
    names: { nameZh: string; nameEn: string }
  ) => void;
  onDeleteCustomNode: (stageId: StageId, nodeId: string) => void;
  onToggleDevModeManual: (targetMode: DevMode) => void;
  onBackToConfig: () => void;
  onNextToExport: () => void;
}

export const TreeWorkbenchStep: React.FC<TreeWorkbenchStepProps> = ({
  bundle,
  onToggleNode,
  onMoveNode,
  onAddRootFolder,
  onAddSubfolder,
  onRenameNode,
  onDeleteCustomNode,
  onToggleDevModeManual,
  onBackToConfig,
  onNextToExport,
}) => {
  const [recentMovedId, setRecentMovedId] = useState<string | null>(null);
  const [contextExpanded, setContextExpanded] = useState(false);

  const [addForm, setAddForm] = useState<{
    stageId: StageId;
    parentId: string | null;
    targetLabel: string;
  } | null>(null);
  const [newZh, setNewZh] = useState('');
  const [newEn, setNewEn] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [renaming, setRenaming] = useState<{
    stageId: StageId;
    nodeId: string;
    nameZh: string;
    nameEn: string;
  } | null>(null);

  const activeSkillNames = new Set(bundle.activeSkills.map((s) => s.name));

  const handleMoveWithFeedback = (
    stageId: StageId,
    nodeId: string,
    direction: 'up' | 'down'
  ) => {
    onMoveNode(stageId, nodeId, direction);
    setRecentMovedId(nodeId);
    setTimeout(() => {
      setRecentMovedId((curr) => (curr === nodeId ? null : curr));
    }, 680);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm) return;
    if (addForm.parentId === null) {
      onAddRootFolder(addForm.stageId, {
        nameZh: newZh,
        nameEn: newEn,
        description: newDesc,
      });
    } else {
      onAddSubfolder(addForm.stageId, addForm.parentId, {
        nameZh: newZh,
        nameEn: newEn,
        description: newDesc,
      });
    }
    setAddForm(null);
    setNewZh('');
    setNewEn('');
    setNewDesc('');
  };

  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming) return;
    onRenameNode(renaming.stageId, renaming.nodeId, {
      nameZh: renaming.nameZh,
      nameEn: renaming.nameEn,
    });
    setRenaming(null);
  };

  const renderAddFolderInlineForm = () => {
    if (!addForm) return null;
    return (
      <form
        onSubmit={handleSubmitAdd}
        className="animate-fade-rise mt-2 p-3.5 rounded-lg border border-ink bg-canvas space-y-2.5 text-sm"
      >
        <div className="text-xs font-medium text-ink">
          在 {addForm.targetLabel} 下新增文件夹
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            value={newZh}
            onChange={(e) => setNewZh(e.target.value)}
            placeholder="中文名称"
            className="h-9 px-3 rounded-md border border-line bg-surface text-xs text-ink focus:outline-none focus:border-ink"
          />
          <input
            type="text"
            required
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            placeholder="英文名称（如 docs）"
            className="h-9 px-3 rounded-md border border-line bg-surface font-mono text-xs text-ink focus:outline-none focus:border-ink"
          />
        </div>
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="用途说明（选填）"
          className="w-full h-9 px-3 rounded-md border border-line bg-surface text-xs text-ink focus:outline-none focus:border-ink"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setAddForm(null)}
            className="h-8 px-3 rounded-md border border-line bg-surface text-xs text-ink-secondary hover:text-ink cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            className="h-8 px-3 rounded-md bg-ink text-white text-xs font-medium cursor-pointer"
          >
            添加
          </button>
        </div>
      </form>
    );
  };

  // Unified Antigravity config rows rendered inside every stage card (matches Step 3 preview 1:1)
  const renderAntigravityConfigRows = (stageId: StageId) => {
    if (bundle.config.primaryAgent !== 'antigravity') return null;
    const rulePath =
      stageId === '03'
        ? '.agents/rules/engineering-principles.md'
        : '.agents/rules/workspace-rules.md';
    const ruleDesc =
      stageId === '03' ? 'Antigravity 工程规范规则' : 'Antigravity 工作区规则';

    return (
      <>
        <div className="flex items-center justify-between gap-2 py-2.5 px-2.5 sm:px-3 rounded-lg hover:bg-subtle/60 transition-colors duration-150">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span
              aria-label="必需配置"
              className="mt-0.5 sm:mt-0 w-4 h-4 rounded flex items-center justify-center border shrink-0 bg-subtle border-line text-ink-muted"
            >
              <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
            </span>
            <Shield className="mt-0.5 sm:mt-0 w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs text-ink break-words sm:truncate">
                .antigravityignore
              </div>
              <p className="text-xs text-ink-muted leading-snug sm:truncate">
                Antigravity 忽略配置（空基础模板）
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 py-2.5 px-2.5 sm:px-3 rounded-lg hover:bg-subtle/60 transition-colors duration-150">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span
              aria-label="必需配置"
              className="mt-0.5 sm:mt-0 w-4 h-4 rounded flex items-center justify-center border shrink-0 bg-subtle border-line text-ink-muted"
            >
              <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
            </span>
            <FileCode2 className="mt-0.5 sm:mt-0 w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs text-ink break-words sm:truncate">{rulePath}</div>
              <p className="text-xs text-ink-muted leading-snug sm:truncate">{ruleDesc}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 py-2.5 px-2.5 sm:px-3 rounded-lg hover:bg-subtle/60 transition-colors duration-150">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span
              aria-label="必需配置"
              className="mt-0.5 sm:mt-0 w-4 h-4 rounded flex items-center justify-center border shrink-0 bg-subtle border-line text-ink-muted"
            >
              <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
            </span>
            <FileCode2 className="mt-0.5 sm:mt-0 w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs text-ink break-words sm:truncate">
                .agents/rules/coding-discipline.md
              </div>
              <p className="text-xs text-ink-muted leading-snug sm:truncate">
                编码纪律规则（涉及编码、调试与代码评审时自动触发）
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Unified row renderer shared identically by Stage 02 and Stage 03
  const renderTreeNodes = (
    nodes: ResolvedTreeNode[],
    stageId: StageId,
    depth: number = 0
  ) => {
    return nodes.map((node, idx) => {
      const prevNode = idx > 0 ? nodes[idx - 1] : null;
      const canMoveUp =
        node.numbered && prevNode !== null && !prevNode.locked && prevNode.numbered;
      const canMoveDown = node.numbered && idx < nodes.length - 1;
      const isFlashing = recentMovedId === node.id;
      const isGitignore = node.templateKey === 'stage-gitignore';
      const isContextTemplateFile = Boolean(node.templateKey?.startsWith('context-template:'));
      const isContextFolder = node.id === '02-context';
      const contextTemplateChildren = isContextFolder
        ? node.children.filter((c) => c.templateKey?.startsWith('context-template:'))
        : [];
      const customFolderChildren = isContextFolder
        ? node.children.filter((c) => !c.templateKey?.startsWith('context-template:'))
        : node.children;
      const checkedContextCount = contextTemplateChildren.filter((c) => c.checked).length;
      const isStage03SkillsFolder =
        stageId === '03' && node.displayName === '.agents' && node.kind === 'folder';

      return (
        <div key={node.id}>
          <div
            className={`group flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 py-2.5 px-2.5 sm:px-3 rounded-lg transition-colors duration-150 ${
              isFlashing
                ? 'animate-row-highlight'
                : node.checked
                ? 'hover:bg-subtle/80'
                : 'opacity-45 hover:opacity-75'
            }`}
            style={{ paddingLeft: `${depth * 16 + 10}px` }}
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                disabled={node.locked}
                onClick={() => onToggleNode(stageId, node.id)}
                aria-label={node.locked ? '必需文件' : `切换 ${node.displayName}`}
                className={`mt-0.5 sm:mt-0 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors duration-150 ${
                  node.locked
                    ? 'bg-subtle border-line text-ink-muted cursor-not-allowed'
                    : node.checked
                    ? 'bg-accent border-accent text-white animate-check-pop cursor-pointer'
                    : 'border-ink-muted/50 bg-surface cursor-pointer'
                }`}
              >
                {node.locked ? (
                  <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                ) : (
                  node.checked && <Check className="w-3 h-3" strokeWidth={2.5} />
                )}
              </button>

              {isContextFolder ? (
                <button
                  type="button"
                  onClick={() => setContextExpanded((v) => !v)}
                  aria-expanded={contextExpanded}
                  aria-label={
                    contextExpanded ? '收起 00–08 背景模板' : '展开查看并勾选 00–08 背景模板'
                  }
                  title={contextExpanded ? '收起 00–08 背景模板' : '展开查看 00–08 背景模板'}
                  className="mt-0.5 sm:mt-0 -m-1 p-1 rounded-md text-accent hover:bg-accent-soft transition-colors cursor-pointer shrink-0"
                >
                  {contextExpanded ? (
                    <FolderMinus className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <FolderPlus className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              ) : isStage03SkillsFolder ? (
                <FolderOpen className="mt-0.5 sm:mt-0 w-4 h-4 text-accent/80 shrink-0" strokeWidth={1.5} />
              ) : node.kind === 'folder' ? (
                <Folder className="mt-0.5 sm:mt-0 w-4 h-4 text-accent/80 shrink-0" strokeWidth={1.5} />
              ) : isGitignore ? (
                <Shield className="mt-0.5 sm:mt-0 w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
              ) : (
                <FileText className="mt-0.5 sm:mt-0 w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-mono text-xs text-ink break-words sm:truncate">
                    {isStage03SkillsFolder
                      ? '.agents/skills/'
                      : `${node.displayName}${node.kind === 'folder' ? '/' : ''}`}
                  </span>
                  {isContextFolder && node.checked && contextTemplateChildren.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setContextExpanded((v) => !v)}
                      className="text-[11px] text-accent hover:underline shrink-0 cursor-pointer"
                    >
                      已选 {checkedContextCount} / {contextTemplateChildren.length} 份背景模板
                    </button>
                  )}
                  {node.level >= 3 && node.kind === 'folder' && node.checked && (
                    <span className="text-[11px] text-accent font-mono shrink-0">
                      +README
                    </span>
                  )}
                  {isStage03SkillsFolder && (
                    <span className="text-[11px] text-accent shrink-0">
                      已选 {bundle.activeSkills.length} / {DEV_SKILLS_META.length} 项
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted leading-snug sm:truncate">
                  {node.description}
                </p>
              </div>
            </div>

            {!node.locked && !isGitignore && !isContextTemplateFile && (
              <div className="flex items-center gap-1 ml-auto opacity-85 sm:opacity-70 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                {node.numbered && (
                  <>
                    <button
                      type="button"
                      disabled={!canMoveUp}
                      onClick={() => handleMoveWithFeedback(stageId, node.id, 'up')}
                      title="上移"
                      className="p-1.5 rounded-md hover:bg-surface text-ink-secondary hover:text-ink disabled:opacity-25 transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      disabled={!canMoveDown}
                      onClick={() => handleMoveWithFeedback(stageId, node.id, 'down')}
                      title="下移"
                      className="p-1.5 rounded-md hover:bg-surface text-ink-secondary hover:text-ink disabled:opacity-25 transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </>
                )}

                {node.kind === 'folder' && (
                  <button
                    type="button"
                    onClick={() =>
                      setAddForm({
                        stageId,
                        parentId: node.id,
                        targetLabel: `${node.displayName}/`,
                      })
                    }
                    title="添加子文件夹"
                    className="p-1.5 rounded-md hover:bg-surface text-ink-secondary hover:text-ink transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setRenaming({
                      stageId,
                      nodeId: node.id,
                      nameZh: node.displayName.replace(/^\d+-([a-z0-9-]+-)?/i, ''),
                      nameEn: node.displayName.split('-')[1] || 'folder',
                    })
                  }
                  title="重命名"
                  className="p-1.5 rounded-md hover:bg-surface text-ink-secondary hover:text-ink transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {node.isCustom && (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomNode(stageId, node.id)}
                    title="删除"
                    className="p-1.5 rounded-md hover:bg-surface text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Insert Antigravity config files right after .gitignore so order matches Step 3 preview */}
          {depth === 0 && isGitignore && renderAntigravityConfigRows(stageId)}

          {/* For Stage 03 .agents/skills/, render all 13 skills with live mode-driven checkboxes */}
          {isStage03SkillsFolder && (
            <div className="ml-2.5 sm:ml-5 pl-2.5 sm:pl-3 border-l border-line space-y-0.5 py-1">
              {DEV_SKILLS_META.map((sk) => {
                const isSelected = activeSkillNames.has(sk.name);
                return (
                  <div
                    key={sk.name}
                    className={`flex items-start justify-between gap-2 py-2 px-2 sm:px-3 rounded-lg transition-opacity duration-200 ${
                      isSelected ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        key={`${sk.name}-${isSelected}`}
                        aria-hidden="true"
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors duration-150 ${
                          isSelected
                            ? 'bg-accent border-accent text-white animate-check-pop'
                            : 'border-ink-muted/40 bg-surface'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </span>

                      <Blocks
                        className="mt-0.5 w-4 h-4 text-ink-muted shrink-0"
                        strokeWidth={1.5}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs text-ink break-words sm:truncate">
                            {sk.name}
                          </span>
                          {sk.category === 'discovery' && !isSelected && (
                            <span className="text-[11px] text-ink-muted shrink-0">
                              完整模式启用
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          {sk.shortDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {addForm?.parentId === node.id && (
            <div style={{ paddingLeft: `${(depth + 1) * 20 + 12}px` }} className="pr-3">
              {renderAddFolderInlineForm()}
            </div>
          )}

          {renaming?.nodeId === node.id && (
            <form
              onSubmit={handleSubmitRename}
              className="animate-fade-rise my-2 mx-3 p-3 rounded-lg border border-ink bg-canvas space-y-2 text-xs"
            >
              <div className="font-medium text-ink">重命名 {node.displayName}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={renaming.nameZh}
                  onChange={(e) => setRenaming({ ...renaming, nameZh: e.target.value })}
                  placeholder="中文名"
                  className="h-8 px-2.5 rounded-md border border-line bg-surface"
                />
                <input
                  type="text"
                  required
                  value={renaming.nameEn}
                  onChange={(e) => setRenaming({ ...renaming, nameEn: e.target.value })}
                  placeholder="英文名"
                  className="h-8 px-2.5 rounded-md border border-line bg-surface font-mono"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenaming(null)}
                  className="h-7 px-3 rounded border border-line bg-surface text-ink-secondary cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="h-7 px-3 rounded bg-ink text-white font-medium cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          )}

          {/* Expandable 00-08 universal context templates under 1-context */}
          {isContextFolder && node.checked && contextExpanded && contextTemplateChildren.length > 0 && (
            <div className="animate-fade-rise ml-2.5 sm:ml-5 pl-2.5 sm:pl-3 border-l border-line space-y-0.5 py-1">
              {contextTemplateChildren.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`flex items-start justify-between gap-2 py-2 px-2 sm:px-3 rounded-lg transition-opacity duration-150 ${
                    tpl.checked ? 'hover:bg-subtle/70 opacity-100' : 'opacity-45 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleNode(stageId, tpl.id)}
                      aria-label={`切换 ${tpl.displayName}`}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors duration-150 cursor-pointer ${
                        tpl.checked
                          ? 'bg-accent border-accent text-white animate-check-pop'
                          : 'border-ink-muted/50 bg-surface'
                      }`}
                    >
                      {tpl.checked && <Check className="w-3 h-3" strokeWidth={2.5} />}
                    </button>

                    <FileText
                      className="mt-0.5 w-4 h-4 text-ink-muted shrink-0"
                      strokeWidth={1.5}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs text-ink break-words sm:truncate">
                        {tpl.displayName}
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {node.kind === 'folder' &&
            node.checked &&
            customFolderChildren.length > 0 &&
            renderTreeNodes(customFolderChildren, stageId, depth + 1)}
        </div>
      );
    });
  };

  return (
    <section className="animate-fade-rise max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">目录确认</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          确认各阶段内的文件、目录与技能包配置
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {bundle.stageTrees.map((stage) => {
          const isDevStage = stage.stageId === '03';

          return (
            <div
              key={stage.stageId}
              className="bg-surface border border-line rounded-xl overflow-hidden"
            >
              {/* Unified Stage Card Header */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-ink-muted shrink-0">
                    {stage.stageId}
                  </span>
                  <span className="font-mono text-sm font-medium text-ink break-words sm:truncate">
                    {stage.displayName}/
                  </span>
                </div>
                <span className="text-xs text-ink-muted sm:shrink-0">
                  {isDevStage
                    ? '由 Agent 自动执行 build-fde-project 初始化工程'
                    : '3 级目录自动附带 README'}
                </span>
              </div>

              {/* Stage 03 Dev Mode Selector (only rendered when Stage 03 is selected) */}
              {isDevStage && (
                <div className="px-4 sm:px-6 py-3.5 bg-canvas/80 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm">
                    <span className="font-medium text-ink">产品开发阶段</span>
                    <span className="text-xs text-ink-muted">
                      {bundle.effectiveDevMode === 'linked'
                        ? `精简模式 · 自动勾选 ${bundle.activeSkills.length} 项核心技能`
                        : `完整模式 · 自动勾选全部 ${bundle.activeSkills.length} 项技能`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-surface p-1 rounded-lg border border-line w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleDevModeManual('linked')}
                      className={`px-3 py-1.5 rounded-md text-xs text-center transition-colors duration-150 cursor-pointer ${
                        bundle.effectiveDevMode === 'linked'
                          ? 'bg-ink text-white font-medium'
                          : 'text-ink-secondary hover:text-ink'
                      }`}
                    >
                      精简模式
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleDevModeManual('full')}
                      className={`px-3 py-1.5 rounded-md text-xs text-center transition-colors duration-150 cursor-pointer ${
                        bundle.effectiveDevMode === 'full'
                          ? 'bg-ink text-white font-medium'
                          : 'text-ink-secondary hover:text-ink'
                      }`}
                    >
                      完整模式
                    </button>
                  </div>
                </div>
              )}

              {/* Unified Tree Body for both 02 & 03 */}
              <div className="p-2.5 sm:p-3.5 space-y-0.5">
                {renderTreeNodes(stage.children, stage.stageId, 0)}

                {!isDevStage && (
                  <div className="pt-2 px-2.5 sm:px-3 pb-1">
                    {addForm?.stageId === stage.stageId && addForm.parentId === null ? (
                      renderAddFolderInlineForm()
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setAddForm({
                            stageId: stage.stageId,
                            parentId: null,
                            targetLabel: `${stage.displayName}/`,
                          })
                        }
                        className="w-full h-9 rounded-lg border border-dashed border-line hover:border-ink/40 text-xs text-ink-secondary hover:text-ink flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>新增文件夹</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToConfig}
          className="h-11 px-4 sm:px-5 rounded-lg border border-line bg-surface text-sm text-ink-secondary hover:text-ink flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>上一步</span>
        </button>

        <button
          type="button"
          onClick={onNextToExport}
          className="group inline-flex items-center justify-center gap-2 h-11 px-5 sm:px-6 rounded-lg bg-ink text-white text-sm font-medium whitespace-nowrap hover:bg-ink/90 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
        >
          <span>下一步：预览并下载</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </section>
  );
};
