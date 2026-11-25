# 执行与维护衔接

## 校验与执行分开

```sh
python3 <SKILL_DIR>/scripts/validate_evals.py <项目根> --suite evals/F001.json --require-bound
```

输出的 `checks` 包括检查 ID、关联用例和 `effective_inputs`，后者合并套件、来源与显式输入。命令只读文件，不调用模型、不执行 suite 中的命令。`ok: true` 表示定义校验通过；`behavior: not_evaluated` 始终提醒尚未执行验收。

执行前实际审阅命令是否验证了关联断言、会产生什么副作用及其授权。声明的 argv 不构成付费调用、部署或远程写入的额外授权。

## 已有维护变更

当前正由 `$maintain-project` 处理变更时，沿用它的活动记录，将本次检查 ID 列入 `begin` 的 `checks`。建立记录前确定用例、数据、测试文件的预期路径；执行前确保真实存在。每个 command 检查只执行一次，不先裸跑再为记录重复跑：

```sh
python3 <MAINTAIN_SKILL_DIR>/scripts/maintenance.py run-check \
  --project <项目根> --id <本轮变更ID> --name F001-export-behavior \
  --input evals/F001.json \
  --input docs/PRD.md \
  --input docs/specs/product-spec.md \
  --input docs/specs/F001-export/spec.md \
  --input backend/tests/check_export.py \
  --input backend/tests/fixtures/orders.json \
  -- python3 backend/tests/check_export.py
```

示例路径需替换。把校验输出中所有 `effective_inputs` 逐项作为 `--input`；已在维护记录 `sources` 中的实现文件可省略。这样用例、测试、输入和规格变更都会让相关收据失效。最终由维护流程完成 `check`、业务语义审阅和 `finish`；其收尾规则保持不变。

已有活动记录漏列检查时不要绕过白名单或覆盖原基线。现有脚本没有追加检查命令：新发现的检查按下方
“单独验收”方式执行并写入正式记录，同时注明它未纳入该维护记录的自动门槛；原有检查与收尾仍照常
完成。后续变更在 begin 时完整声明。manual 检查的实际操作与结论也记在正式验证记录，不用无意义
成功命令冒充机器检查。

## 新项目或单独验收

按绑定 argv 在项目根直接运行项目原生检查，记录真实退出状态和断言输出。人工或浏览器操作按 manual 定义执行。没有维护变更时，不为验收虚构源码修改，也不创建依赖“源码必须变化”的维护收尾记录。

原生测试报告与必要日志放入已有产物目录；缺少约定时使用 `.codex/project-evals/`，在产生文件前将 `/.codex/project-evals/` 加入项目 `.gitignore`。正式验证记录是验收结论事实源；该运行目录仅保存可重建产物，若记录仍引用唯一证据，先保留到约定的交付存储再清理。只产生需要的日志，不复制工程或依赖树。

正式记录至少包含：

| 项目 | 记录内容 |
|---|---|
| 范围 | suite、eval ID、来源 AC / PSC |
| 条件 | 代码版本；有未提交改动时记录相关 inputs 指纹；样本和评分版本；实际运行环境 |
| 方法 | 实际 argv 或人工操作，运行时间、必要的重复次数 |
| 结果 | 每项预期是否满足；pass / fail / not_run / blocked / error |
| 证据 | 原生报告、日志或必要截图的位置；不能只写“测试通过” |
| 限制 | 未运行项及原因，哪些总体验收仍未覆盖 |

一次真实观察也可作为 manual 证据。它不能被包装成自动化测试，也不能无条件复用于不同实现或环境。

## 不误报结果

- 运行前缺少依赖或授权，记 `blocked`；尚未尝试记 `not_run`；运行命令或基础设施异常记 `error`。
- 断言不符合预期记 `fail`，全部本次必需断言实际执行且满足才记 `pass`。
- 退出 0 只是命令检查的必要证据，仍需核对测试数量和跳过项；它不证明测试覆盖了全部业务语义。
- 维护脚本检测到过期输入时会报告失败及“检查证据已过期”；正式验收记录将对应旧证据标为 `stale`，重新执行受影响项。单独验收时同样对照所记录的版本/指纹。
- 采用模型评分时，分数来自真实评分输出；业务阈值来自合同。未授权运行或只有评分脚本而未执行时，不填写模拟分数。
