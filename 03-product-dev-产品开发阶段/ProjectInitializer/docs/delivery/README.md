# Project Atlas · 一键项目初始化 交付总览与运行手册

## 1. 交付物清单
- **可直接发布至 WorkBuddy 资料库的单文件 HTML**：`frontend/dist/index.html`（以及复制到阶段外层便捷入口的 `../ProjectAtlas-一键项目初始化.html`）
- **完整前端工程源码**：`frontend/`（React 18 + TypeScript + Tailwind CSS + JSZip + `vite-plugin-singlefile`）
- **工程规格与验证证据**：`docs/specs/product-spec.md`、`docs/specs/feature-map.md`、`docs/specs/F001..F004/`、`evals/F001..F004.json`、`docs/verification/verification-report.md`

## 2. 本地维护与重构建命令
```bash
cd frontend
npm install
npm test
npm run build
```
