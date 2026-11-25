# Design System Master File — 一键项目初始化 (Scheme A: Minimalism & Swiss Light)

> Derived via `/ui-ux-pro-max` (`Portfolio/Personal` + `Minimal Swiss`) and verified against `/unslop` 9-pass checklist.

## Palette Tokens
- `--color-canvas`: `#FAFAFA` (page background)
- `--color-surface`: `#FFFFFF` (elevated cards & panels)
- `--color-subtle`: `#F4F4F5` (secondary surface & code blocks)
- `--color-ink`: `#09090B` (primary text)
- `--color-ink-secondary`: `#52525B` (body & descriptions)
- `--color-ink-muted`: `#71717A` (tertiary meta & numbers)
- `--color-line`: `#E4E4E7` (hairline borders)
- `--color-primary`: `#18181B` / On Primary `#FFFFFF` (primary CTA)
- `--color-accent`: `#2563EB` / Soft `#EFF6FF` (single restrained cobalt accent)

## Typography & Spacing
- Font family: Clean modern Chinese/Latin sans-serif (`PingFang SC / -apple-system / Helvetica Neue`) + tabular monospace for paths only.
- Weights: `400` and `500` (no 700–900 headings, no uppercase tracked labels, no italics).
- Grid: Strict 4px spacing scale (`4, 8, 12, 16, 20, 24, 32, 48, 64`).
- Motion: `transition-colors` / `transition-opacity` only (150–200ms); no `transition-all`, no `hover:scale`, no loops.
