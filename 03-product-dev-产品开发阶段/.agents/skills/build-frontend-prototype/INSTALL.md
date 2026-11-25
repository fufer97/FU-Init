# 安装与使用说明

这套工作流借助 AI，把客户需求、沟通记录和我们希望呈现的方式转成可点击的体验原型，让双方直观讨论未来如何使用系统。先明确沟通目标，把需求、业务对象与功能组织成整体设计，再明确页面空间、列表浏览、滚动和工作承接，以代表性场景与模拟反馈验看；不把各条链路分别做成孤立的小应用，也不以完整系统为交付目标。需求文件即可作为输入，不要求提前提供 PRD、UI 稿或后端架构。

**新建默认使用多页面 HTML、共享 CSS 和必要的原生 JavaScript。** 无需先创建 React 工程、安装组件库或执行 npm 构建。实现方式服务于本轮体验，不代表正式产品的技术选型；已有原型沿用其技术栈。

## 1. 准备环境

| 项目 | 要求 | 用途 |
| --- | --- | --- |
| Codex | 可正常使用并能打开本地项目 | 读取 Skill、设计、生成代码和执行检查 |
| 浏览器 | Codex 内置 Browser；或已有的项目浏览器测试环境 | 按选定场景查看页面、体验流程 |
| 本地静态预览工具 | 优先复用已有工具；例如已安装 Python 3 的 `http.server` | 提供 HTML、CSS、JavaScript 的本地访问地址 |

不把 Python、Node.js 或某个服务器作为统一安装前提，先检查现有可用的预览方式。只有选择 Vite、React 等需要 npm 的可选路线时，才准备 Node.js、包管理器和下载依赖所需的网络；不需要数据库、后端或设计工具账号。

## 2. 把 Skill 放进自己的项目

安装或分享时使用完整的 `build-frontend-prototype` 文件夹，保留内部目录和许可证。复制到容纳需求资料的工作区根目录。该目录与后续前端工程根目录不同：

```text
工作区根目录/
├── .agents/
│   └── skills/
│       └── build-frontend-prototype/
│           ├── SKILL.md
│           ├── INSTALL.md
│           ├── agents/openai.yaml
│           └── references/
├── 需求资料/                            # 沿用已有来源位置
└── docs/
    ├── 01_normalize-project-requirements/ # 已有需求资料
    ├── 02_requirement-playground/         # 已有需求看板
    ├── 03_prototype-design/               # 沟通目标、体验设计与验看记录
    └── 04_frontend-prototype/             # 可点击的演示载体，直接放源码
```

使用文件管理器复制即可；`.agents` 是隐藏目录。macOS 可用 `Command + Shift + .` 显示隐藏文件。技能包仅包含文本规则与说明，不包含依赖或运行时。

在 Codex 中打开这个工作区根目录，使用 `$build-frontend-prototype` 调用。若安装后没有出现在技能选择中，重新打开项目或重启 Codex。必要时明确让 Codex 读取 `.agents/skills/build-frontend-prototype/SKILL.md`。

四个编号表示阶段职责；只有直接提供的三份需求文件时，也可以开始原型设计，不必先生成 01/02。只执行有实际任务的阶段，不预建空目录。详细文件清单、已有项目处理和阶段衔接见[目录与产物约定](references/output-contract.md)。

应用产品设计方法与 Emil 设计心法已经随包附带：前者指导信息架构、空间和操作，后者打磨适用的组件细节。无需另装全局设计 Skill、修改个人全局配置或安装 UI/UX Pro Max。以后升级本技能时替换这一份目录，避免项目级和全局级出现多个同名副本。

若只在前端子目录单独打开 Codex，应把这份技能安装在该项目能发现的 `.agents/skills/` 下；不要假定任意外部父目录都能被发现。

## 3. 用沟通目标与呈现意图启动原型

准备需求资料后，在工作区根目录发出：

```text
使用 $build-frontend-prototype。
目的是让甲方直观体验未来怎么使用系统，讨论流程和呈现是否符合预期。
请结合需求、沟通记录及我的呈现想法，先确定本轮要讨论的问题，
组织需求归属、业务对象、功能配合、页面职责及共享状态，形成原型的整体设计。
按包内产品设计方法明确关键页面的空间、列表规模与浏览方式、滚动和返回上下文，
让用户能定位记录、比较信息并接续处理，再用 Emil 心法打磨适用细节。
在同一系统中细化代表性使用场景，
让本轮核心需求都有具体体现，相关功能与页面的信息和结果保持一致。
用模拟内容和必要交互完成可点击展示，不开发完整系统。
让客户从业务场景、信息主次和结果呈现中看懂解决什么问题、对应什么需求；
避免黑话和空泛口号，不把这一设计要求机械地做成页面说明、按钮或对话。
新建默认采用 HTML、共享 CSS 和必要 JavaScript；具体交互确实需要框架时再说明理由。
按约定把设计与验看记录放在 docs/03_prototype-design/，
把演示源码放在 docs/04_frontend-prototype/，并完成必要的运行和场景验看。
需求资料位置：填写自己的相对路径。
希望呈现的方式或演示重点：填写已有想法或参考；尚无明确想法时请结合需求提出具体方向。
```

只想先看设计时，明确补充“本轮只做整体设计，只生成设计记录，不创建工程、不写实现代码”。已有项目直接指出代码目录，工作流会先检查并沿用其技术栈。

## 4. 默认生成与预览

让 Codex 按整体设计在 `docs/04_frontend-prototype/` 直接生成 `index.html`、按职责组织的业务页面、共享样式和脚本。内部示例见[目录与产物约定](references/output-contract.md)。默认无需脚手架初始化，不预建 `src/`、`package.json` 或构建配置。

页面生成后，从**工作区根目录**启动已有的静态服务器。例如，本机已有 Python 3 时：

```sh
python3 -m http.server 5198 --bind 127.0.0.1 --directory docs/04_frontend-prototype
```

打开 `http://127.0.0.1:5198/`，按 `Ctrl+C` 停止。端口占用时更换端口并同步访问地址，不停止其他项目服务。Windows 若使用 Python Launcher，可将 `python3` 换为 `py -3`；该 Windows 分支尚未实跑。缺少 Python 时使用已有等价静态服务器，不为遵循这条示例强制安装它。

该命令只提供本地静态预览。使用 JavaScript 模块或读取外部 JSON 时，通过 HTTP 打开；不要把双击 HTML 文件当成必然可用的运行方式。页面跳转、资源路径和必要的跨页状态按实际体验验看；纯 HTML 路线没有必须执行的构建命令。

## 5. 分享与再次运行

一起提供 03 设计记录和 04 原型目录。默认保留 HTML、共享 CSS/JavaScript、实际用到的资源和 `README.md`；README 写明运行目录、已验证的启动方式、体验顺序、模拟内容与重置方式。接收方按同一说明启动静态预览即可，无需 `npm ci`。

只在实际引入依赖时，才同时提供 `package.json`、相应锁文件和运行配置。产生依赖、构建输出或测试文件前配置忽略规则；`node_modules/`、`dist/`、缓存、录屏和浏览器 profile 不作为原型源码交付。

## 6. 可选：需要工具或框架时

按[实现方式选择](references/stack-selection.md)判断具体需要。Vite 可以单独用于原生 HTML/JavaScript 的开发预览和资源构建，不要求加入 React。使用 npm 工具时先检查本机 Node.js 与包管理器是否满足对应版本要求，再按官方说明安装所需部分。

以下保留已验证过的 React/shadcn 路线供确有需要时使用，**不是默认初始化步骤**。它基于 2026-09-28 的 macOS 验证，Node.js 24.16.0 / npm 11.13.0；当前具体版本要求以官方说明为准。未在 Windows 上实跑。

### React 与 shadcn/ui

仅用于还没有原型源码、且已经选定此路线的新项目。在工作区根目录执行；`04_frontend-prototype` 直接作为工程根目录，不再改为业务名称或嵌套一层应用：

```sh
node -e "require('node:fs').mkdirSync('docs', { recursive: true })"
cd docs
npx --yes shadcn@4.21.0 init --template vite --base radix --preset nova --no-monorepo --name 04_frontend-prototype --yes
```

此命令已实跑，会创建 React/TypeScript/Vite 工程，配置 Tailwind CSS、路径别名和 shadcn/ui，并安装依赖和 `button` 组件。它选择 Radix 底层实现及 nova 预设；生成的 `components.json` 中 `style` 为 `radix-nova`。CLI 参数要写 `--preset nova`，不要写 `--preset radix-nova`。

进入新工程，按实际页面需要添加组件。以本次验证用到的弹窗为例：

```sh
cd 04_frontend-prototype
npx --yes shadcn@4.21.0 add dialog --yes
npm run dev -- --host 127.0.0.1
```

打开终端给出的本地地址，通常为 `http://127.0.0.1:5173`；端口占用时以实际输出为准。按 `Ctrl+C` 停止服务。刚初始化的工程只是脚手架，具体业务页面仍由工作流设计与实现。

以后从工作区根目录启动时，先执行 `cd docs/04_frontend-prototype`，再运行 npm 命令；从该工程目录返回工作区根目录使用 `cd ../..`。03 设计记录始终位于外层 `docs/03_prototype-design/`，不在前端工程里再建一套 `docs/prototype/`。

不要在已有工程上重复创建同名目录或使用 `--force` 覆盖配置。已有 React/Vite 工程如需加入 shadcn/ui，让 Codex 按[官方现有工程安装说明](https://ui.shadcn.com/docs/installation/vite)检查其 Tailwind、别名和组件配置后增量接入。

### 此框架路线的构建与再次运行

在 `docs/04_frontend-prototype/` 前端工程目录执行：

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

`build` 包含 TypeScript 构建检查；`preview` 用于本地检查构建产物，以终端输出地址为准。这不是公网发布。

分享原型时同时提供 03 设计记录与 04 工程；工程保留 `README.md`、`package.json`、`package-lock.json` 和源码。接收方在 `docs/04_frontend-prototype/` 目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

不要分享或提交 `node_modules/`、`dist/`、缓存、录屏、浏览器 profile；创建工程后检查 `.gitignore` 包含这些实际生成目录。删除 `node_modules/` 和 `dist/` 后可分别用 `npm ci`、`npm run build` 重建。

本次固定了 CLI 版本，但新建脚手架与 registry 仍可能随上游变化。每个原型用自己的锁文件固定解析结果；不要把 `@latest` 替换进安装说明后直接声称已经验证。

### Ant Design 分支

已有 Ant Design 工程直接沿用。新建原型只有在选定体验确实需要复杂表格、表单等现成能力，或用户明确指定时，才选择该路线；不能仅因企业系统里有表格就默认引入。此时不需要执行上面的 shadcn 初始化。

官方 Vite 路线的基本命令如下，从工作区根目录执行，同样遵守 04 工程目录约定。此分支仅依据官方说明提供，本次未对其做完整安装与 UI 验收：

```sh
node -e "require('node:fs').mkdirSync('docs', { recursive: true })"
cd docs
npm create vite@9.2.1 04_frontend-prototype -- --template react-ts --no-interactive
cd 04_frontend-prototype
npm install
npm install antd@6.6.5
npm run dev -- --host 127.0.0.1
```

具体组件方案由 Codex 根据设计记录编写。不要为了“全都支持”同时安装两套主要 UI 组件库。

## 7. 可选工具

- **shadcn 官方 Skill / MCP**：可协助检索和添加组件，但不是本工作流的安装前提。本轮未将它们写入用户配置。需要时再按[官方 Skill 文档](https://ui.shadcn.com/docs/skills)或 [MCP 文档](https://ui.shadcn.com/docs/mcp)安装，并确认配置作用域。
- **其他 UI/UX 工具**：已有且适合时，可补充风格探索和设计审查。它们不替代场景编排、关键页面设计和实际体验验看。

## 8. 验证范围与来源

历史 React 路线在 macOS 上完成了环境安装、组件添加、构建和基础浏览器交互检查；本轮 HTML 默认路线的检查范围单独记录，详情见[验证记录](references/validation.md)。技术检查不证明客户原型已表达清楚或已获得认可；本轮没有重新生成客户原型，Windows 环境及未注明实测的可选工具仍待验证。

- [Codex 项目技能与发现规则](https://developers.openai.com/codex/skills/)
- [shadcn/ui 的 Vite 安装](https://ui.shadcn.com/docs/installation/vite)
- [Vite 环境要求](https://vite.dev/guide/)
- [Python 本地静态服务器](https://docs.python.org/3/library/http.server.html)
- [MDN JavaScript 模块与本地预览](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Ant Design 与 Vite](https://ant.design/docs/react/use-with-vite/)
- [Emil 原始项目与本地副本说明](references/provenance.md)
- [应用产品设计方法](references/product-design.md)
