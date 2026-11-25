import JSZip from 'jszip';
import { ResolvedArtifactBundle } from '../types/config';

export async function buildZipBlob(bundle: ResolvedArtifactBundle): Promise<Blob> {
  const zip = new JSZip();
  for (const file of bundle.files) {
    zip.file(file.path, file.content);
  }
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export function getZipFileName(bundle: ResolvedArtifactBundle): string {
  return `project-init-${bundle.config.language}.zip`;
}

export function buildAgentOpeningPrompt(bundle: ResolvedArtifactBundle): string {
  const has03 = bundle.stageTrees.some((s) => s.stageId === '03');

  if (has03 && bundle.stageTrees.length === 1) {
    return `请阅读项目目录中的 项目启动.md，按里面的步骤向我确认开发工程名称与产品名称，自动执行 build-fde-project 完成项目初始化；初始化完成后请将 项目启动.md 删除。`;
  }

  return `请阅读项目目录中的 项目启动.md，按里面的步骤先通过提问了解我的项目背景与目标，帮我完成项目初始化；初始化完成后请将 项目启动.md 删除。`;
}

export function buildFallbackShellScript(bundle: ResolvedArtifactBundle): string {
  const lines: string[] = [
    '#!/usr/bin/env bash',
    '# 本地终端初始化脚本（当预览沙箱拦截 ZIP 下载时使用）',
    'set -euo pipefail',
    '',
  ];

  const essentialFiles = bundle.files.filter(
    (f) => f.category !== 'skill' || f.path.endsWith('/SKILL.md') || f.path.endsWith('.py')
  );

  for (const file of essentialFiles) {
    const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : '';
    if (dir) {
      lines.push(`mkdir -p "${dir}"`);
    }
    if (file.category === 'gitkeep') {
      lines.push(`touch "${file.path}"`);
    } else {
      const delimiter = 'EOF_INIT_' + Math.random().toString(36).slice(2, 8).toUpperCase();
      lines.push(`cat << '${delimiter}' > "${file.path}"`);
      lines.push(file.content);
      lines.push(delimiter);
    }
  }

  lines.push('');
  lines.push('echo "初始化完成，请用 Agent 打开对应的阶段目录。"');
  return lines.join('\n');
}
