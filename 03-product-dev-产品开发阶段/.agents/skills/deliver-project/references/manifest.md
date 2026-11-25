# 交付清单与检查

`scripts/delivery_manifest.py` 仅用 Python 3 标准库，读取明确列出的项目文件并保存/核对 SHA-256。它不扫描工程、不读取环境变量、不调用外部服务、不运行项目测试、不压缩或发布文件。

## 一份可维护清单

默认路径为 `docs/delivery/delivery-manifest.json`。先由 Agent 根据实际交付范围填写下面的结构；示例名称和路径需要改为当前项目。`inputs` 是本次版本核对的依据，`artifacts` 是实际交付文件，`omissions` 是已识别的缺项。

```json
{
  "schema_version": 1,
  "project": "订单协同",
  "release": "v1.0-review",
  "scope": "本地订单查询功能及接手材料",
  "inputs": [
    {"path": "docs/specs/F001-query/spec.md", "role": "范围依据"},
    {"path": "backend/query.py", "role": "当前实现"},
    {"path": "docs/verification/F001.md", "role": "正式验收记录"}
  ],
  "artifacts": [
    {"id": "D-001", "title": "交付总览", "path": "docs/delivery/README.md", "audience": "recipient"},
    {"id": "D-002", "title": "运行手册", "path": "docs/operations.md", "audience": "recipient"}
  ],
  "omissions": [
    {"id": "D-003", "title": "目标环境接手记录", "reason": "尚未提供目标环境", "next_step": "由运维岗位提供环境后执行手册中的接手检查"}
  ]
}
```

字段约定：

- `schema_version` 为 `1`；`project`、`release`、`scope` 是非空文字，按实际范围写明版本。
- `inputs` 至少一项，每项有 `path` 和说明其用途的 `role`。选择与交付结论相关的现行规格、实现、配置和证据；复用测试结果时，核对其涉及的输入，不只列报告文件。它不声称记录了整棵工程。
- `artifacts` 至少一项，每项有唯一 `id`、`title`、`path` 和 `audience`。`recipient` 表示供本轮接收者使用，`internal` 表示内部材料；这只是分发标记，不是访问控制或自动授权。
- `omissions` 为数组，无缺项填 `[]`。每项有唯一 `id`、`title`、`reason`、`next_step`；责任和时间可在交接记录中补充，不能编造。缺项与已交付文件不能使用相同 ID。
- 路径相对应用根，使用 `/`，不能是目录、绝对路径、`..` 或指向根外的符号链接。清单不能把自身作为输入或产物。目录型源码交付通过交付总览指向工程或确切源码包，不把一个 README 的哈希冒充源码完整性证明。
- `snapshot` 为每个文件增加 `sha256`、`bytes`，并更新 `prepared_at`。`check` 只读比较；修改产物或输入后会报告不一致。

源数据、内部成本、原始日志和认证文件不自动成为交付文件。填写清单前检查所列文件是否适合对应接收范围；脚本不识别正文中的秘密，也不证明权限和许可正确。

## 命令

在交付文档和证据适用性已核对后建立快照，`<SKILL_DIR>` 指本 Skill 实际安装目录：

```sh
python3 <SKILL_DIR>/scripts/delivery_manifest.py snapshot \
  --project <应用根> --manifest docs/delivery/delivery-manifest.json

python3 <SKILL_DIR>/scripts/delivery_manifest.py check \
  --project <应用根> --manifest docs/delivery/delivery-manifest.json
```

`snapshot` 会更新指定清单中的文件指纹，除此之外不改工程文件；失败时保留原清单。`check` 成功退出 0，文件缺失、版本变化或结构错误退出 1，并输出具体问题；命令参数错误退出 2。

更改文件后先处理真实影响：实现/规格变化可能使旧验收证据失效，应补验或保留 `stale`；交付文字变化则核对对应说明。然后更新交付版本和清单。不能仅重新 `snapshot` 就宣称旧测试适用于新实现。

脚本输出始终注明 `behavior: not_evaluated` 和 `recipient_signoff: not_evaluated`。有缺项时文件检查仍可能通过，输出会保留缺项数量；这表示现有文件可核对，不表示交付范围完整。文档语义、链接目标是否适合接收者、验收覆盖及真实接手由 Agent 对照现有证据核查。

默认不创建副本、ZIP 或运行目录。用户要求分发包时先确定来源、范围和保存位置，交付中的相对路径以实际分发根为准；在目标包上使用同一检查并检查接手入口。只交付所需资产，依赖树、缓存、认证状态、内部材料和无关原件不能通过全目录复制混入。
