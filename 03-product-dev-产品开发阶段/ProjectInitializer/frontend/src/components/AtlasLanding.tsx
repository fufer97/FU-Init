import React from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroBlueprint } from './HeroBlueprint';

interface AtlasLandingProps {
  onStartBuild: () => void;
}

export const AtlasLanding: React.FC<AtlasLandingProps> = ({ onStartBuild }) => {
  return (
    <div className="bg-canvas text-ink">
      {/* Launch Hero: Clean architectural visual + crisp product title + single primary CTA */}
      <section className="relative min-h-[100svh] flex flex-col pt-14 overflow-hidden">
        {/* Dot-grid canvas, faded at top and bottom */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(9,9,11,0.07) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)',
          }}
        />
        {/* Soft cobalt light pooled under the structure */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -bottom-[18%] -translate-x-1/2 w-[160%] sm:w-[85%] aspect-[2/1] pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.10), transparent)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-20 sm:pt-20 text-center">
          <h1 className="animate-fade-rise text-3xl sm:text-6xl font-medium tracking-tight text-ink leading-[1.18] sm:leading-[1.15]">
            快速构建 AI 工作区
          </h1>
          <p className="animate-fade-rise-delay-1 mt-5 sm:mt-6 text-sm sm:text-lg text-ink-secondary max-w-lg mx-auto leading-relaxed [text-wrap:balance]">
            按工程阶段生成规范目录、规则入口与开发技能包，导出即可交由本地 Agent 启动项目
          </p>

          <div className="animate-fade-rise-delay-2 mt-8 sm:mt-10">
            <button
              type="button"
              onClick={onStartBuild}
              className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-canvas"
            >
              <span>开始构建</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* Conceptual isometric workspace skeleton (vector, mobile-scaled) */}
        <div className="relative flex-1 min-h-[42svh] sm:min-h-[54vh] mt-4 sm:mt-0">
          <HeroBlueprint className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[42svh] sm:h-[54vh] max-h-[600px] aspect-[1000/560] max-w-none" />
        </div>
      </section>

      {/* Three concise value pillars */}
      <section className="border-t border-line bg-surface">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <div className="font-mono text-xs text-ink-muted mb-3">01</div>
            <h2 className="text-base font-medium text-ink">按岗位拆分阶段</h2>
            <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
              设计与开发各自独立成工作区，用 Agent 打开对应阶段文件夹即可直接开工
            </p>
          </div>

          <div>
            <div className="font-mono text-xs text-ink-muted mb-3">02</div>
            <h2 className="text-base font-medium text-ink">自动衔接设计与开发</h2>
            <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
              同时勾选产品设计与开发时，开发阶段自动切换为精简模式，衔接更顺畅
            </p>
          </div>

          <div>
            <div className="font-mono text-xs text-ink-muted mb-3">03</div>
            <h2 className="text-base font-medium text-ink">零业务预设，即下即用</h2>
            <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
              只生成干净目录、规则入口与技能包，具体业务文档留给本地 Agent 对话生成
            </p>
          </div>
        </div>

        <footer className="border-t border-line">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 sm:py-6 flex items-center justify-between text-xs text-ink-muted">
            <span>一键项目初始化</span>
            <span>作者：fufu</span>
          </div>
        </footer>
      </section>
    </div>
  );
};
