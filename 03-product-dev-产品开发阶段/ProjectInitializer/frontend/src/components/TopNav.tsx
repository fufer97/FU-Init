import React from 'react';
import { ActiveStep } from '../types/config';

interface TopNavProps {
  activeStep: ActiveStep;
  onSelectStep: (step: ActiveStep) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeStep, onSelectStep }) => {
  if (activeStep === 'landing') {
    return (
      <header className="fixed top-0 inset-x-0 z-30 h-14 bg-canvas/85 backdrop-blur-sm border-b border-line">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <span className="text-sm font-medium tracking-tight text-ink">
            一键项目初始化
          </span>
          <span className="text-xs text-ink-muted">
            作者：fufu
          </span>
        </div>
      </header>
    );
  }

  const stepItems: Array<{ id: ActiveStep; label: string; shortLabel: string }> = [
    { id: 'config', label: '1. 基础配置', shortLabel: '1. 基础配置' },
    { id: 'workbench', label: '2. 目录确认', shortLabel: '2. 目录确认' },
    { id: 'export', label: '3. 下载初始化 ZIP', shortLabel: '3. 下载 ZIP' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-line">
      {/* Desktop: single 56px row; Mobile: top brand bar + full-width 3-step bar below */}
      <div className="max-w-5xl mx-auto h-12 sm:h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onSelectStep('landing')}
          className="text-sm font-medium tracking-tight text-ink hover:text-ink-secondary transition-colors cursor-pointer shrink-0"
        >
          一键项目初始化
        </button>

        <nav aria-label="配置步骤" className="hidden sm:flex items-center gap-6 text-sm">
          {stepItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStep(item.id)}
              className={`py-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeStep === item.id
                  ? 'border-ink text-ink font-medium'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => onSelectStep('landing')}
          className="text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer shrink-0"
        >
          返回首页
        </button>
      </div>

      {/* Mobile 3-step bar: zero horizontal clipping, full-width equal tap targets */}
      <nav
        aria-label="移动端配置步骤"
        className="sm:hidden border-t border-line/70 grid grid-cols-3 px-2"
      >
        {stepItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectStep(item.id)}
            className={`h-10 text-xs text-center border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeStep === item.id
                ? 'border-ink text-ink font-medium'
                : 'border-transparent text-ink-muted'
            }`}
          >
            {item.shortLabel}
          </button>
        ))}
      </nav>
    </header>
  );
};
