#!/usr/bin/env python3
"""根据明确列出的规范化文档与项目审阅数据生成独立 HTML。仅使用标准库。"""

import argparse
import hashlib
import html
import json
from pathlib import Path
import re


CATEGORIES = {"requirements", "agreements", "communications", "materials", "questions"}
ORIGINS = {"原文明确", "依据记录归纳", "整理建议，待确认"}


def read_document(path, source):
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != source["sha256"]:
        raise ValueError(f"来源已变更，请核对审阅内容并更新校验值：{path}")
    text = raw.decode("utf-8")
    match = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", text, re.S)
    if not match:
        raise ValueError(f"来源缺少规范化元数据：{path}")
    metadata, body = match.groups()
    meta = {}
    for key in ("id", "type", "source_date"):
        entry = re.search(rf"^{key}:\s*(.*?)\s*$", metadata, re.M)
        if not entry:
            raise ValueError(f"来源缺少 {key}：{path}")
        value = entry[1]
        try:
            meta[key] = json.loads(value)
        except json.JSONDecodeError:
            meta[key] = value.strip("\"'")
    if meta["id"] != source["id"]:
        raise ValueError(f"来源编号不匹配：{path}")
    title = re.search(r"^# (.+)$", body, re.M)
    headings = list(re.finditer(r"^## ([A-Za-z0-9][A-Za-z0-9_-]*) (.+)$", body, re.M))
    if not title or not headings:
        raise ValueError(f"来源缺少标题或稳定条目编号：{path}")
    sections = []
    for i, heading in enumerate(headings):
        end = headings[i + 1].start() if i + 1 < len(headings) else len(body)
        section_text = re.sub(r'<a id="[^"]+"></a>\s*', "", body[heading.end():end]).strip()
        sections.append({"id": heading[1], "title": heading[2], "text": section_text})
    return {"id": meta["id"], "type": meta["type"], "date": meta["source_date"],
            "title": title[1], "sections": sections, "sha256": source["sha256"]}


def build(input_path, output_path):
    data = json.loads(input_path.read_text())
    if data.get("schema_version") != 1:
        raise ValueError("不支持的审阅数据格式")
    for field in ("id", "title", "subtitle", "summary", "scope", "as_of", "review_note"):
        if not isinstance(data["project"].get(field), str) or not data["project"][field].strip():
            raise ValueError(f"项目缺少有效字段：{field}")
    documents = []
    for source in data["sources"]:
        path = (input_path.parent / source["path"]).resolve()
        if path.suffix.lower() != ".md":
            raise ValueError(f"仅接受显式列出的规范化 Markdown：{path}")
        documents.append(read_document(path, source))
    if len({d["id"] for d in documents}) != len(documents):
        raise ValueError("来源文档编号重复")
    refs = [s["id"] for d in documents for s in d["sections"]]
    if len(set(refs)) != len(refs):
        raise ValueError("来源条目编号重复")
    ids = set()
    for item in data["items"]:
        if not re.fullmatch(r"[A-Za-z0-9_-]+", item["id"]) or item["id"] in ids:
            raise ValueError("审阅事项编号无效或重复")
        ids.add(item["id"])
        if item["category"] not in CATEGORIES or item["origin"] not in ORIGINS:
            raise ValueError(f"事项分类或来源性质无效：{item['id']}")
        if not item["references"] or not set(item["references"]) <= set(refs):
            raise ValueError(f"事项引用了不存在的来源：{item['id']}")
        for field in ("title", "summary"):
            if not isinstance(item.get(field), str) or not item[field].strip():
                raise ValueError(f"事项缺少 {field}：{item['id']}")
        if not item.get("fields") or any(not isinstance(f.get(k), str) for f in item["fields"] for k in ("label", "value")):
            raise ValueError(f"事项说明无效：{item['id']}")
        if item.get("date") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", item["date"]):
            raise ValueError(f"事项日期无效：{item['id']}")
    relationships = data.get("relationships", [])
    by_id = {item["id"]: item for item in data["items"]}
    pairs = set()
    for edge in relationships:
        requirement = by_id.get(edge.get("requirement"))
        target = by_id.get(edge.get("target"))
        if not requirement or requirement["category"] != "requirements" or not target or target["category"] == "requirements":
            raise ValueError("关联必须从需求指向实际存在的约定、沟通、资料或待确认事项")
        pair = (requirement["id"], target["id"])
        if pair in pairs or not isinstance(edge.get("reason"), str) or not edge["reason"].strip():
            raise ValueError(f"关联重复或缺少说明：{pair}")
        pairs.add(pair)
        evidence = set(edge.get("references", []))
        if not evidence or not evidence <= set(refs) or not evidence.intersection(requirement["references"]) or not evidence.intersection(target["references"]):
            raise ValueError(f"关联需有双方实际来源中的证据：{pair}")
    payload = {"schema_version": 1, "project": data["project"], "documents": documents, "items": data["items"]}
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    payload["revision"] = hashlib.sha256(canonical.encode()).hexdigest()[:16]
    # 关联是单独的整理层。来源与事项未变时，保留原有逐项审阅意见。
    payload["relationships"] = relationships
    payload["relationship_revision"] = hashlib.sha256(json.dumps(relationships, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    for document, source in zip(documents, data["sources"]):
        document["filename"] = Path(source["path"]).name
    embedded = json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    template = Path(__file__).resolve().parents[1] / "assets/panel.html"
    page = template.read_text().replace("__PROJECT_TITLE__", html.escape(data["project"]["title"])).replace("__REVIEW_DATA__", embedded)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(page)
    print(f"已生成 {output_path}：{len(documents)} 份文档，{len(refs)} 个来源条目，{len(ids)} 个审阅事项，版本 {payload['revision']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        build(args.input.resolve(), args.output.resolve())
    except (ValueError, KeyError, OSError) as error:
        parser.exit(1, f"无法生成面板：{error}\n")
