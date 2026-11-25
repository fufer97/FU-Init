import React, { useState } from 'react';
import {
  LanguageMode,
  PrimaryAgent,
  ProjectInitConfig,
  StageBlueprint,
  StageId,
} from '../types/config';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';

interface GlobalConfigStepProps {
  config: ProjectInitConfig;
  blueprints: Record<StageId, StageBlueprint>;
  onChangeLanguage: (lang: LanguageMode) => void;
  onChangeAgent: (agent: PrimaryAgent) => void;
  onToggleStage: (stageId: StageId) => string | null;
  onNextToWorkbench: () => void;
}

const LANGUAGE_OPTIONS: Array<{
  id: LanguageMode;
  label: string;
  preview: string;
}> = [
  {
    id: 'zh',
    label: '中文',
    preview: '02-产品设计阶段 / 1-业务上下文/',
  },
  {
    id: 'en',
    label: '英文',
    preview: '02-product-design / 1-context/',
  },
  {
    id: 'bilingual',
    label: '中文+英文',
    preview: '02-product-design-产品设计阶段 / 1-context-业务上下文/',
  },
];

const STAGE_ORDER: StageId[] = ['01', '02', '03', '04', '05'];
const ENABLED_STAGES = new Set<StageId>(['02', '03']);

export const GlobalConfigStep: React.FC<GlobalConfigStepProps> = ({
  config,
  blueprints,
  onChangeLanguage,
  onChangeAgent,
  onToggleStage,
  onNextToWorkbench,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  const currentLang =
    LANGUAGE_OPTIONS.find((item) => item.id === config.language) || LANGUAGE_OPTIONS[2];

  const handleStageToggle = (stageId: StageId) => {
    if (!ENABLED_STAGES.has(stageId)) return;
    const err = onToggleStage(stageId);
    setNotice(err);
  };

  return (
    <section className="animate-fade-rise max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">基础配置</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          选择目录语言、主力 Agent 与本项目涉及的阶段
        </p>
      </div>

      {notice && (
        <div
          role="alert"
          className="animate-fade-rise px-4 py-3 rounded-lg border border-line bg-surface flex items-center justify-between text-sm text-ink"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs text-ink-muted hover:text-ink cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {/* 1. Directory Language: 中文 / 英文 / 中文+英文 */}
      <div className="bg-surface border border-line rounded-xl p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="text-sm font-medium text-ink">目录语言</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = config.language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeLanguage(opt.id)}
                className={`h-11 px-2.5 sm:px-4 rounded-lg border text-xs sm:text-sm flex items-center justify-center sm:justify-between gap-1.5 whitespace-nowrap active:scale-[0.99] transition-[background-color,border-color,color,transform] duration-150 cursor-pointer ${
                  active
                    ? 'border-ink bg-ink text-white font-medium'
                    : 'border-line bg-canvas text-ink hover:border-ink/40'
                }`}
              >
                <span>{opt.label}</span>
                {active && (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 animate-check-pop" strokeWidth={1.5} />
                )}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-xs text-ink-muted break-words transition-opacity duration-200">
          示例：{currentLang.preview}
        </p>
      </div>

      {/* 2. Primary Agent (clean title-only cards, no subtitle text) */}
      <div className="bg-surface border border-line rounded-xl p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="text-sm font-medium text-ink">主力 Agent</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => onChangeAgent('antigravity')}
            className={`h-12 px-4 rounded-lg border text-left flex items-center justify-between text-sm active:scale-[0.99] transition-[background-color,border-color,color,transform] duration-150 cursor-pointer ${
              config.primaryAgent === 'antigravity'
                ? 'border-ink bg-ink text-white font-medium'
                : 'border-line bg-canvas text-ink hover:border-ink/40'
            }`}
          >
            <span>Antigravity 2.0</span>
            {config.primaryAgent === 'antigravity' && (
              <Check className="w-4 h-4 animate-check-pop" strokeWidth={1.5} />
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeAgent('generic')}
            className={`h-12 px-4 rounded-lg border text-left flex items-center justify-between text-sm active:scale-[0.99] transition-[background-color,border-color,color,transform] duration-150 cursor-pointer ${
              config.primaryAgent === 'generic'
                ? 'border-ink bg-ink text-white font-medium'
                : 'border-line bg-canvas text-ink hover:border-ink/40'
            }`}
          >
            <span>通用 Agent</span>
            {config.primaryAgent === 'generic' && (
              <Check className="w-4 h-4 animate-check-pop" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* 3. Stages (01, 04, 05 disabled & marked 暂未开放) */}
      <div className="bg-surface border border-line rounded-xl p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-ink">包含的阶段</span>
          <span className="text-xs text-ink-muted">每个阶段独立成一个文件夹</span>
        </div>

        <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
          {STAGE_ORDER.map((stageId) => {
            const bp = blueprints[stageId];
            const isEnabled = ENABLED_STAGES.has(stageId);
            const checked = isEnabled && config.selectedStages.includes(stageId);

            return (
              <button
                key={stageId}
                type="button"
                disabled={!isEnabled}
                onClick={() => handleStageToggle(stageId)}
                className={`w-full px-3.5 sm:px-4 py-3.5 text-left flex items-center justify-between gap-3 sm:gap-4 transition-colors duration-150 ${
                  !isEnabled
                    ? 'bg-canvas/70 opacity-55 cursor-not-allowed'
                    : checked
                    ? 'bg-surface cursor-pointer'
                    : 'bg-canvas/40 hover:bg-canvas cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors duration-150 ${
                      !isEnabled
                        ? 'border-line bg-subtle'
                        : checked
                        ? 'bg-accent border-accent text-white animate-check-pop'
                        : 'border-ink-muted/50 bg-surface'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" strokeWidth={2.5} />}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-ink-muted">{stageId}</span>
                      <span
                        className={
                          !isEnabled
                            ? 'text-ink-muted'
                            : checked
                            ? 'font-medium text-ink'
                            : 'text-ink-secondary'
                        }
                      >
                        {bp.nameZh}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 leading-snug sm:truncate">
                      {bp.summary}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs shrink-0 ${
                    !isEnabled
                      ? 'px-2 py-0.5 rounded bg-subtle text-ink-muted'
                      : 'text-ink-muted'
                  }`}
                >
                  {isEnabled ? bp.roleLabel : '暂未开放'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Step */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNextToWorkbench}
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
        >
          <span>下一步：目录确认</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </section>
  );
};
