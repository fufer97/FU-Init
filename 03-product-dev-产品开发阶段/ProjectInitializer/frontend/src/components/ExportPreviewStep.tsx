import React, { useState } from 'react';
import { ResolvedArtifactBundle } from '../types/config';
import {
  buildAgentOpeningPrompt,
  buildFallbackShellScript,
  getZipFileName,
} from '../engine/zipExporter';
import {
  ArrowLeft,
  Blocks,
  Check,
  Copy,
  Download,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Shield,
} from 'lucide-react';

interface ExportPreviewStepProps {
  bundle: ResolvedArtifactBundle;
  onBackToWorkbench: () => void;
  onTriggerZipDownload: () => Promise<void>;
}

export const ExportPreviewStep: React.FC<ExportPreviewStepProps> = ({
  bundle,
  onBackToWorkbench,
  onTriggerZipDownload,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedShell, setCopiedShell] = useState(false);
  const [copiedBootstrap, setCopiedBootstrap] = useState(false);

  const zipName = getZipFileName(bundle);
  const openingPrompt = buildAgentOpeningPrompt(bundle);
  const bootstrapContent = bundle.fileMap['项目启动.md']?.content || '';

  const handleDownload = async () => {
    await onTriggerZipDownload();
    setDownloaded(true);
  };

  const copyText = async (
    text: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    let copied = false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // Fallback below for Chrome file:// or iframe sandboxes without clipboard-write
      }
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setter(true);
      setTimeout(() => setter(false), 1800);
    }
  };

  return (
    <section className="animate-fade-rise max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
          下载初始化 ZIP
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          确认最终目录结构，打包下载并解压到你的项目文件夹即可开工
        </p>
      </div>

      {/* Full-width Clean Visual Directory Preview (Zero Nested Scrollbar) */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink">目录预览</span>
          <span className="font-mono text-xs text-ink-muted truncate">{zipName}</span>
        </div>

        <div className="p-4 sm:p-6 space-y-3 text-xs">
          {/* Root One-time Bootstrap File */}
          <div className="flex items-center justify-between gap-2 h-8 px-2.5 rounded-md bg-subtle/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-ink shrink-0" strokeWidth={1.5} />
              <span className="font-mono font-medium text-ink truncate">项目启动.md</span>
            </div>
            <span className="text-[11px] text-ink-muted shrink-0">初始化引导</span>
          </div>

          {/* Stage Folders */}
          {bundle.stageTrees.map((stage) => {
            const checkedNodes = stage.children.filter((c) => c.checked);
            const agentsFile = checkedNodes.find((c) => c.displayName === 'AGENTS.md');
            const gitignoreFile = checkedNodes.find((c) => c.displayName === '.gitignore');
            const remainingNodes = checkedNodes.filter(
              (c) => c.displayName !== 'AGENTS.md' && c.displayName !== '.gitignore'
            );

            return (
              <div key={stage.stageId} className="space-y-0.5">
                {/* Level 1 Stage Folder Row */}
                <div className="flex items-center justify-between gap-2 min-h-8 py-1.5 px-2.5 rounded-md bg-canvas border border-line/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderOpen
                      className="w-4 h-4 text-accent shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="font-mono font-medium text-ink truncate">
                      {stage.displayName}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted shrink-0">工作区</span>
                </div>

                {/* Level 2 Children (exact same order as Step 2) */}
                <div className="ml-2.5 sm:ml-4 pl-2.5 sm:pl-3 border-l border-line space-y-0.5 pt-0.5">
                  {agentsFile && (
                    <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText
                          className="w-4 h-4 text-ink-secondary shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="font-mono text-ink truncate">AGENTS.md</span>
                      </div>
                      <span className="hidden sm:inline text-[11px] text-ink-muted shrink-0">
                        入口说明
                      </span>
                    </div>
                  )}

                  {gitignoreFile && (
                    <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md text-ink-secondary">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Shield
                          className="w-4 h-4 text-ink-muted shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="font-mono text-ink truncate">.gitignore</span>
                      </div>
                      <span className="hidden sm:inline text-[11px] text-ink-muted shrink-0">
                        Git 忽略规则
                      </span>
                    </div>
                  )}

                  {bundle.config.primaryAgent === 'antigravity' && (
                    <>
                      <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md text-ink-secondary">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Shield
                            className="w-4 h-4 text-ink-muted shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="font-mono truncate">.antigravityignore</span>
                        </div>
                        <span className="hidden sm:inline text-[11px] text-ink-muted shrink-0">
                          忽略配置
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md text-ink-secondary">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileCode2
                            className="w-4 h-4 text-ink-muted shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="font-mono truncate">
                            .agents/rules/
                            {stage.stageId === '03'
                              ? 'engineering-principles.md'
                              : 'workspace-rules.md'}
                          </span>
                        </div>
                        <span className="hidden sm:inline text-[11px] text-ink-muted shrink-0">
                          工作区规则
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md text-ink-secondary">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileCode2
                            className="w-4 h-4 text-ink-muted shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="font-mono truncate">
                            .agents/rules/coding-discipline.md
                          </span>
                        </div>
                        <span className="hidden sm:inline text-[11px] text-ink-muted shrink-0">
                          编码纪律
                        </span>
                      </div>
                    </>
                  )}

                  {remainingNodes.map((node) => {
                    if (node.displayName === '.agents' && stage.stageId === '03') {
                      return (
                        <div key={node.id} className="space-y-0.5 pt-0.5">
                          <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FolderOpen
                                className="w-4 h-4 text-ink-secondary shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="font-mono text-ink truncate">
                                .agents/skills
                              </span>
                            </div>
                            <span className="text-[11px] text-accent shrink-0">
                              {bundle.activeSkills.length} 项技能
                            </span>
                          </div>

                          <div className="ml-4 pl-3 border-l border-line space-y-0.5">
                            {bundle.activeSkills.map((sk) => (
                              <div
                                key={sk.name}
                                className="flex items-center justify-between gap-2 h-7 px-2 rounded-md text-ink-secondary"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Blocks
                                    className="w-3.5 h-3.5 text-ink-muted shrink-0"
                                    strokeWidth={1.5}
                                  />
                                  <span className="font-mono text-ink truncate">
                                    {sk.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (node.kind === 'file') {
                      return (
                        <div
                          key={node.id}
                          className="flex items-center justify-between gap-2 h-8 px-2 rounded-md"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText
                              className="w-4 h-4 text-ink-secondary shrink-0"
                              strokeWidth={1.5}
                            />
                            <span className="font-mono text-ink truncate">
                              {node.displayName}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-muted shrink-0">
                            入口说明
                          </span>
                        </div>
                      );
                    }

                    const activeSubfolders = node.children.filter(
                      (ch) => ch.checked && ch.kind === 'folder'
                    );
                    const checkedContextTemplates = node.children.filter(
                      (ch) =>
                        ch.checked &&
                        ch.kind === 'file' &&
                        ch.templateKey?.startsWith('context-template:')
                    );
                    const showOpenFolder =
                      activeSubfolders.length > 0 || checkedContextTemplates.length > 0;
                    return (
                      <div key={node.id} className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {showOpenFolder ? (
                              <FolderOpen
                                className="w-4 h-4 text-accent/85 shrink-0"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <Folder
                                className="w-4 h-4 text-accent/85 shrink-0"
                                strokeWidth={1.5}
                              />
                            )}
                            <span className="font-mono text-ink truncate">
                              {node.displayName}
                            </span>
                          </div>
                          {checkedContextTemplates.length > 0 && (
                            <span className="text-[11px] text-accent shrink-0">
                              {checkedContextTemplates.length} 份模板
                            </span>
                          )}
                        </div>

                        {checkedContextTemplates.length > 0 && (
                          <div className="ml-2.5 sm:ml-4 pl-2.5 sm:pl-3 border-l border-line space-y-0.5">
                            {checkedContextTemplates.map((tpl) => (
                              <div
                                key={tpl.id}
                                className="flex items-center justify-between gap-2 h-7 px-2 rounded-md text-ink-secondary"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText
                                    className="w-3.5 h-3.5 text-ink-muted shrink-0"
                                    strokeWidth={1.5}
                                  />
                                  <span className="font-mono text-ink truncate">
                                    {tpl.displayName}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeSubfolders.length > 0 && (
                          <div className="ml-4 pl-3 border-l border-line space-y-0.5">
                            {activeSubfolders.map((sub) => (
                              <div key={sub.id} className="space-y-0.5">
                                <div className="flex items-center justify-between gap-2 h-8 px-2 rounded-md">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <FolderOpen
                                      className="w-4 h-4 text-accent/75 shrink-0"
                                      strokeWidth={1.5}
                                    />
                                    <span className="font-mono text-ink truncate">
                                      {sub.displayName}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 pl-3 border-l border-line">
                                  <div className="flex items-center justify-between gap-2 h-7 px-2 rounded-md text-ink-muted">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText
                                        className="w-3.5 h-3.5 text-ink-muted shrink-0"
                                        strokeWidth={1.5}
                                      />
                                      <span className="font-mono truncate">README.md</span>
                                    </div>
                                    <span className="text-[11px] text-accent shrink-0">
                                      自动生成
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Download Action Row */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToWorkbench}
          className="h-11 px-4 sm:px-5 rounded-lg border border-line bg-surface text-sm text-ink-secondary hover:text-ink flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>上一步</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 sm:px-6 rounded-lg bg-ink text-white text-sm font-medium whitespace-nowrap hover:bg-ink/90 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          <span>{downloaded ? '重新下载初始化 ZIP' : '下载初始化 ZIP'}</span>
        </button>
      </div>

      {downloaded && (
        <div className="animate-fade-rise px-4 py-3 rounded-lg bg-accent-soft border border-accent/20 flex items-center gap-2.5 text-xs text-ink">
          <Check className="w-4 h-4 text-accent shrink-0 animate-check-pop" strokeWidth={2} />
          <span className="leading-relaxed">
            已开始下载 <code className="font-mono font-medium">{zipName}</code>
            ，解压后复制下方对话发给 Agent 即可完成初始化
          </span>
        </div>
      )}

      {/* Post-Download Agent Opening Prompt + WorkBuddy Fallback */}
      <div className="bg-surface border border-line rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink leading-snug">
            解压后发送对话给 Agent 完成初始化
          </span>
          <button
            type="button"
            onClick={() => copyText(openingPrompt, setCopiedPrompt)}
            className="h-8 px-3 rounded-md border border-line bg-canvas hover:border-ink/40 text-xs text-ink flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors cursor-pointer"
          >
            {copiedPrompt ? (
              <>
                <Check
                  className="w-3.5 h-3.5 text-accent animate-check-pop"
                  strokeWidth={2}
                />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>复制</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3.5 sm:p-4 rounded-lg bg-subtle border border-line font-mono text-xs text-ink whitespace-pre-wrap break-words leading-relaxed select-all">
          {openingPrompt}
        </pre>

        <details className="pt-2 border-t border-line text-xs text-ink-secondary">
          <summary className="cursor-pointer hover:text-ink select-none">
            如果在内置预览窗口无法弹出下载，点此使用备选方案
          </summary>
          <div className="mt-3 space-y-3">
            <p className="leading-relaxed">
              建议点击预览窗口右上角在系统浏览器中打开，或复制下方脚本在本地项目目录终端运行：
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  copyText(buildFallbackShellScript(bundle), setCopiedShell)
                }
                className="h-8 px-3 rounded-md border border-line bg-canvas hover:border-ink/40 text-xs text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedShell ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                    <span>已复制终端脚本</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>复制本地初始化脚本 (.sh)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyText(bootstrapContent, setCopiedBootstrap)}
                className="h-8 px-3 rounded-md border border-line bg-canvas hover:border-ink/40 text-xs text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedBootstrap ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                    <span>已复制启动指南</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>复制 项目启动.md</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
};
