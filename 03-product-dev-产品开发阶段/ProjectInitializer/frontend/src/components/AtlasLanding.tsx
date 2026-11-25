import React from 'react';
import { ArrowRight } from 'lucide-react';
import heroArchImg from '../assets/hero-swiss-arch.jpg';

interface AtlasLandingProps {
  onStartBuild: () => void;
}

export const AtlasLanding: React.FC<AtlasLandingProps> = ({ onStartBuild }) => {
  return (
    <div className="bg-canvas text-ink">
      {/* Launch Hero: Clean architectural visual + crisp product title + single primary CTA */}
      <section className="relative min-h-screen flex flex-col justify-between pt-14 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-bottom pointer-events-none animate-hero-settle"
          style={{ backgroundImage: `url(${heroArchImg})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #FAFAFA 0%, rgba(250,250,250,0.92) 38%, rgba(250,250,250,0.12) 72%, rgba(250,250,250,0.88) 100%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16 text-center">
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

        <div className="relative z-10 h-36 sm:h-60" />
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
