#!/usr/bin/env python3
"""将已经人工核对的痛点、功能与效果填入中文三列看板。仅使用标准库。"""

import argparse
import base64
import hashlib
import html
import json
from pathlib import Path
import re
import struct


ROW_ART = (
    ("rose", "pain-alert", "effect-target"),
    ("orange", "pain-box", "effect-bulb"),
    ("purple", "pain-direction", "effect-people"),
    ("sage", "pain-chat", "effect-flag"),
)


def fill_template(template, values, unique=False):
    for token in values:
        count = template.count(token)
        if count == 0 or (unique and count != 1):
            raise ValueError(f"模板插槽缺失或重复：{token}")
    # 只替换一遍，业务文字中的插槽名称不会继续作为模板执行。
    pattern = "|".join(re.escape(token) for token in values)
    return re.sub(pattern, lambda match: values[match[0]], template)


def illustrations(assets):
    names = ["column-person", "column-gear", "column-chart", "hero-plant"]
    names += [name for _, pain, effect in ROW_ART for name in (pain, effect)]
    definitions, icons = [], {}
    for name in names:
        png = (assets / "illustrations" / f"{name}.png").read_bytes()
        width, height = struct.unpack(">II", png[16:24])
        encoded = base64.b64encode(png).decode("ascii")
        definitions.append(
            f'<image id="art-{name}" width="{width}" height="{height}" '
            f'href="data:image/png;base64,{encoded}"/>'
        )
        icons[name] = (
            f'<svg class="board-icon" viewBox="0 0 {width} {height}" '
            f'aria-hidden="true" focusable="false"><use href="#art-{name}"/></svg>'
        )
    return (
        '<svg width="0" height="0" style="position:absolute;pointer-events:none" '
        'aria-hidden="true"><defs>' + "".join(definitions) + "</defs></svg>",
        icons,
    )


def required_text(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"缺少有效文字：{label}")
    return value


def build(input_path, output_path):
    data = json.loads(input_path.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1:
        raise ValueError("不支持的看板数据格式")
    reading_controls = data.get("reading_controls", True)
    if not isinstance(reading_controls, bool):
        raise ValueError("reading_controls 必须是布尔值")
    project = data["project"]
    for key in ("title", "scope", "boundary", "effect_note"):
        required_text(project.get(key), f"project.{key}")
    badge = required_text(project.get("badge", "范围"), "project.badge")

    if not isinstance(data.get("sources"), list) or not data["sources"]:
        raise ValueError("需要明确列出已读取的来源文档")
    source_ids = set()
    protected_paths = {input_path.resolve()}
    for source in data["sources"]:
        source_id = required_text(source.get("id"), "来源编号")
        if source_id in source_ids:
            raise ValueError(f"来源编号重复：{source_id}")
        source_ids.add(source_id)
        path = (input_path.parent / required_text(source.get("path"), "来源路径")).resolve()
        protected_paths.add(path)
        expected = required_text(source.get("sha256"), "来源 SHA-256")
        if not re.fullmatch(r"[0-9a-fA-F]{64}", expected):
            raise ValueError(f"来源校验值无效：{source_id}")
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected.lower():
            raise ValueError(f"来源已变更，请先复核看板内容与定位，再更新校验值：{path}")
    if output_path.resolve() in protected_paths:
        raise ValueError("输出不能覆盖项目数据或来源文档")

    if not isinstance(data.get("rows"), list) or not data["rows"]:
        raise ValueError("需要至少一组痛点、功能与效果")
    assets = Path(__file__).resolve().parents[1] / "assets"
    row_template = (assets / "board-row.html").read_text(encoding="utf-8")
    illustration_defs, icons = illustrations(assets)
    ids = set()
    rendered = []
    for number, row in enumerate(data["rows"], 1):
        row_id = required_text(row.get("id"), "行编号")
        if not re.fullmatch(r"[A-Za-z0-9_-]+", row_id) or row_id in ids:
            raise ValueError(f"行编号无效或重复：{row_id}")
        ids.add(row_id)
        for group, keys in (("pain", ("title", "description")),
                            ("feature", ("title",)),
                            ("effect", ("title", "description"))):
            for key in keys:
                required_text(row[group].get(key), f"{row_id}.{group}.{key}")
        actions = row["feature"].get("actions")
        if not isinstance(actions, list) or not actions:
            raise ValueError(f"功能需要具体动作：{row_id}")
        for action in actions:
            required_text(action, f"{row_id}.feature.actions")
        refs = row.get("references")
        if not isinstance(refs, list) or not refs:
            raise ValueError(f"关联行缺少来源定位：{row_id}")
        for ref in refs:
            if ref.get("source") not in source_ids:
                raise ValueError(f"关联行引用了未列出的来源：{row_id}")
            required_text(ref.get("location"), f"{row_id}.references.location")

        pain, feature, effect = row["pain"], row["feature"], row["effect"]
        esc = html.escape
        action_html = "".join(
            '<li><span class="check-mark" aria-hidden="true"><svg viewBox="0 0 20 20" '
            'fill="none"><path d="m5.1 10.3 3 3.1 6.6-7" stroke="currentColor" '
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
            f'</svg></span><span>{esc(action)}</span></li>' for action in actions
        )
        tone, pain_art, effect_art = ROW_ART[(number - 1) % len(ROW_ART)]
        rendered.append(fill_template(row_template, {
            "__ROW_ID__": esc(row_id),
            "__POSITION__": str(number),
            "__NUMBER__": f"{number:02d}",
            "__TONE__": tone,
            "__PAIN_ICON__": icons[pain_art],
            "__PAIN_TITLE__": esc(pain["title"]),
            "__PAIN_DESCRIPTION__": esc(pain["description"]),
            "__FEATURE_TITLE__": esc(feature["title"]),
            "__FEATURE_ACTIONS__": action_html,
            "__EFFECT_ICON__": icons[effect_art],
            "__EFFECT_TITLE__": esc(effect["title"]),
            "__EFFECT_DESCRIPTION__": esc(effect["description"]),
        }))

    controls = (
        (assets / "reading-controls.html").read_text(encoding="utf-8")
        if reading_controls else ""
    )
    values = {
        "__PAGE_TITLE__": html.escape(project["title"] + " · 客户痛点与功能梳理"),
        "__PROJECT_TITLE__": html.escape(project["title"]),
        "__PROJECT_BADGE__": html.escape(badge),
        "__PROJECT_SCOPE__": html.escape(project["scope"]),
        "__PROJECT_BOUNDARY__": html.escape(project["boundary"]),
        "__EFFECT_NOTE__": html.escape(project["effect_note"]),
        "__BOARD_ROWS__": "\n".join(rendered),
        "__READING_CONTROLS__": controls,
        "__ILLUSTRATION_DEFS__": illustration_defs,
    }
    template_path = assets / "board.html"
    template = template_path.read_text(encoding="utf-8")
    page = fill_template(template, values, unique=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(page, encoding="utf-8")
    print(f"已生成 {output_path}：{len(data['rows'])} 组痛点、功能与效果")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        build(args.input.resolve(), args.output.resolve())
    except (ValueError, KeyError, TypeError, AttributeError, OSError) as error:
        parser.exit(1, f"无法生成看板：{error}\n")
