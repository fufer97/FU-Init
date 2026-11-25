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
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
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

  return (
    <header className="sticky top-0 z-30 h-14 bg-canvas/95 backdrop-blur-sm border-b border-line">
      <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onSelectStep('landing')}
          className="text-sm font-medium tracking-tight text-ink hover:text-ink-secondary transition-colors cursor-pointer"
        >
          一键项目初始化
        </button>

        <nav aria-label="配置步骤" className="flex items-center gap-5 sm:gap-6 text-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectStep('config')}
            className={`py-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeStep === 'config'
                ? 'border-ink text-ink font-medium'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            1. 基础配置
          </button>
          <button
            type="button"
            onClick={() => onSelectStep('workbench')}
            className={`py-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeStep === 'workbench'
                ? 'border-ink text-ink font-medium'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            2. 目录确认
          </button>
          <button
            type="button"
            onClick={() => onSelectStep('export')}
            className={`py-1 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeStep === 'export'
                ? 'border-ink text-ink font-medium'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            3. 下载初始化 ZIP
          </button>
        </nav>

        <button
          type="button"
          onClick={() => onSelectStep('landing')}
          className="text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          返回首页
        </button>
      </div>
    </header>
  );
};
