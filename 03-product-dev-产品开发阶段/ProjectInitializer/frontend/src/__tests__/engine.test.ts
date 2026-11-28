import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  createInitialStageBlueprints,
  DEFAULT_CONFIG,
  DEV_SKILLS_META,
} from '../data/stageBlueprints';
import {
  addCustomSubfolder,
  addRootFolderToStage,
  moveTreeNodeInLevel,
  resolveDevMode,
  toggleTreeNodeChecked,
} from '../engine/treeEngine';
import { buildArtifactBundle } from '../engine/templateRenderer';
import {
  buildAgentOpeningPrompt,
  buildFallbackShellScript,
  buildZipBlob,
} from '../engine/zipExporter';

describe('V2 Pure Skeleton Engine, Dual-Mode Skills & Flat-Root ZIP', () => {
  it('auto-selects linked mode (7 skills) for 02+03 and full mode (13 skills) for standalone 03 with manual override', () => {
    expect(resolveDevMode(['02', '03'], false, 'full')).toBe('linked');
    expect(resolveDevMode(['03'], false, 'linked')).toBe('full');
    expect(resolveDevMode(['03'], true, 'linked')).toBe('linked');

    const bp = createInitialStageBlueprints();
    const linkedBundle = buildArtifactBundle(
      { ...DEFAULT_CONFIG, selectedStages: ['02', '03'], devMode: 'linked' },
      bp
    );
    expect(linkedBundle.effectiveDevMode).toBe('linked');
    expect(linkedBundle.activeSkills).toHaveLength(7);
    expect(linkedBundle.activeSkills.some((s) => s.name === 'classify-project-data')).toBe(true);

    const fullBundle = buildArtifactBundle(
      { ...DEFAULT_CONFIG, selectedStages: ['03'], devMode: 'full', devModeOverride: false },
      bp
    );
    expect(fullBundle.effectiveDevMode).toBe('full');
    expect(fullBundle.activeSkills).toHaveLength(13);
    expect(fullBundle.activeSkills.some((s) => s.name === 'classify-project-data')).toBe(true);
    expect(DEV_SKILLS_META.every((s) => s.shortDesc.length > 0)).toBe(true);
  });

  it('contains ZERO pre-baked business documents in 02 or 03 Raw, while preserving empty Level 2 folders via .gitkeep and auto-generating README.md for Level 3+ folders', () => {
    const bp = createInitialStageBlueprints();
    const withSubfolder = addCustomSubfolder(bp['02'].nodes, '02-prd', {
      nameZh: '采购模块',
      nameEn: 'purchase',
      description: '采购相关需求',
    });
    const withNewRoot = addRootFolderToStage(withSubfolder, '02', {
      nameZh: '评审纪要',
      nameEn: 'reviews',
      description: '方案评审记录',
    });

    const bundle = buildArtifactBundle(DEFAULT_CONFIG, {
      ...bp,
      '02': { ...bp['02'], nodes: withNewRoot },
    });

    // Universal 00-08 context templates exist in 02/1-context with zero case-specific leakage
    const contextIndex =
      bundle.fileMap['02-product-design-产品设计阶段/1-context-业务上下文/00-背景信息索引.md'];
    expect(contextIndex).toBeDefined();
    expect(
      bundle.fileMap['02-product-design-产品设计阶段/1-context-业务上下文/08-术语与口径字典.md']
    ).toBeDefined();
    for (const file of bundle.files.filter((f) => f.path.includes('1-context-业务上下文/'))) {
      expect(file.content).not.toContain('强盛科技');
      expect(file.content).not.toContain('华强北');
      expect(file.content).not.toContain('林强');
      expect(file.content).not.toContain('进销存');
    }

    // No pre-baked business PRDs/handoffs in other folders
    expect(
      bundle.files.some((f) => f.path.includes('PRD模板.md') || f.path.includes('HANDOFF.md'))
    ).toBe(false);

    // Other empty Level 2 folders have .gitkeep, NOT README.md
    expect(
      bundle.fileMap['02-product-design-产品设计阶段/2-template-输出模板/.gitkeep']
    ).toBeDefined();
    expect(
      bundle.fileMap['02-product-design-产品设计阶段/2-template-输出模板/README.md']
    ).toBeUndefined();
    expect(
      bundle.fileMap['03-product-dev-产品开发阶段/Raw/.gitkeep']
    ).toBeDefined();

    // User-added Level 3 folder gets automatic README.md
    expect(
      bundle.fileMap['02-product-design-产品设计阶段/4-prd-需求文档/1-purchase-采购模块/README.md']
    ).toBeDefined();

    // User-added Level 2 folder gets next sequential number 8-
    expect(
      bundle.fileMap['02-product-design-产品设计阶段/8-reviews-评审纪要/.gitkeep']
    ).toBeDefined();
  });

  it('formats zh/en/bilingual names and renumbers siblings dynamically from 1- on toggle or reorder', () => {
    const bp = createInitialStageBlueprints();
    const toggled = toggleTreeNodeChecked(bp['02'].nodes, '02-template');
    const moved = moveTreeNodeInLevel(toggled, '02-prompt', 'up');

    const bundle = buildArtifactBundle(DEFAULT_CONFIG, {
      ...bp,
      '02': { ...bp['02'], nodes: moved },
    });
    const s02 = bundle.stageTrees.find((s) => s.stageId === '02')!;
    const activeFolders = s02.children
      .filter((c) => c.kind === 'folder' && c.checked)
      .map((c) => c.displayName);
    expect(activeFolders[0]).toBe('1-context-业务上下文');
    expect(activeFolders[1]).toBe('2-prompt-常用提示词');
    expect(activeFolders[2]).toBe('3-prd-需求文档');

    // Stage 03 engineering folders stay unnumbered in Chinese mode
    const zhBundle = buildArtifactBundle({ ...DEFAULT_CONFIG, language: 'zh' }, bp);
    const s03 = zhBundle.stageTrees.find((s) => s.stageId === '03')!;
    expect(s03.displayName).toBe('03-产品开发阶段');
    expect(s03.children.map((c) => c.displayName)).toContain('Raw');
    expect(s03.children.map((c) => c.displayName)).toContain('.agents');
  });

  it('builds flat-root ZIP with build-fde-project automation guidance and zero legacy brand strings or 三层六步 jargon', async () => {
    const bp = createInitialStageBlueprints();
    const bundle = buildArtifactBundle(DEFAULT_CONFIG, bp);

    for (const file of bundle.files) {
      expect(file.content).not.toContain('@FUF 独家研发');
      expect(file.content).not.toContain('skyforge/credentials.yaml');
      expect(file.content).not.toContain('/Users/muyu/MuYuKnowledge');
      if (file.category === 'bootstrap' || file.category === 'agent-config') {
        expect(file.content).not.toContain('三层六步');
      }
    }

    const zipBlob = await buildZipBlob(bundle);
    const loadedZip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const paths = Object.keys(loadedZip.files);
    expect(paths).toContain('项目启动.md');
    expect(paths).not.toContain('.gitignore');
    expect(paths).toContain('02-product-design-产品设计阶段/AGENTS.md');
    expect(paths).toContain('02-product-design-产品设计阶段/.gitignore');
    expect(paths).toContain('02-product-design-产品设计阶段/.agents/rules/coding-discipline.md');
    expect(paths).toContain(
      '02-product-design-产品设计阶段/1-context-业务上下文/00-背景信息索引.md'
    );
    expect(paths).toContain('03-product-dev-产品开发阶段/AGENTS.md');
    expect(paths).toContain('03-product-dev-产品开发阶段/.gitignore');
    expect(paths).toContain('03-product-dev-产品开发阶段/.agents/rules/coding-discipline.md');
    expect(paths).toContain(
      '03-product-dev-产品开发阶段/.agents/skills/build-fde-project/scripts/init_project.py'
    );
    expect(paths).toContain(
      '03-product-dev-产品开发阶段/.agents/skills/classify-project-data/SKILL.md'
    );

    const codingRule = await loadedZip
      .file('03-product-dev-产品开发阶段/.agents/rules/coding-discipline.md')!
      .async('string');
    expect(codingRule).toContain('# Coding Discipline（编码纪律）');
    expect(codingRule).toContain('trigger: model_decision');

    const gitignore02 = await loadedZip
      .file('02-product-design-产品设计阶段/.gitignore')!
      .async('string');
    expect(gitignore02).toContain('.DS_Store');
    expect(gitignore02).toContain('.env');
    expect(gitignore02).toContain('node_modules/');
    expect(gitignore02).toContain('__pycache__/');

    const bootstrap = await loadedZip.file('项目启动.md')!.async('string');
    expect(bootstrap).toContain('build-fde-project');
    expect(bootstrap).toContain('删除本文件');

    const agents02 = await loadedZip
      .file('02-product-design-产品设计阶段/AGENTS.md')!
      .async('string');
    expect(agents02).toContain('按需生成子目录索引');
    expect(agents02).toContain('.gitkeep');

    const prompt = buildAgentOpeningPrompt(bundle);
    expect(prompt).toContain('项目启动.md');
    expect(prompt).toContain('删除');
    expect(prompt).not.toContain('外层的');
    expect(buildFallbackShellScript(bundle)).toContain('#!/usr/bin/env bash');
  });
});
