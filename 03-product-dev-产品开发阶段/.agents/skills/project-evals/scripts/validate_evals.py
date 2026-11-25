#!/usr/bin/env python3
"""只读校验项目 eval 定义、来源、覆盖与检查绑定（兼容完整 PRD 模式与精简联动 linked 模式）；不执行测试。"""

import argparse
import json
import re
import sys
from pathlib import Path


FEATURE = re.compile(r"F\d{3}")
AC = re.compile(r"(?m)^#{2,6}\s+(AC-(?:F\d{3}-)?\d{3})\b")
PSC = re.compile(r"(?m)^\|\s*(PSC-\d{3})\s*\|")
CHECK_ID = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}")


def relative_path(root, value):
    if not isinstance(value, str) or not value or Path(value).is_absolute():
        raise ValueError("路径必须为项目内非空相对路径")
    path = root / value
    if not path.resolve().is_relative_to(root) or path.resolve() == root:
        raise ValueError(f"路径越出项目或指向项目根: {value}")
    return path


def strings(value, label, allow_empty=False):
    if not isinstance(value, list) or (not value and not allow_empty):
        raise ValueError(f"{label} 必须为{'可空' if allow_empty else '非空'}字符串数组")
    if any(not isinstance(item, str) or not item.strip() for item in value):
        raise ValueError(f"{label} 含空值或非字符串")
    return value


def unique_strings(value, label, allow_empty=False):
    values = strings(value, label, allow_empty)
    if len(values) != len(set(values)):
        raise ValueError(f"{label} 含重复值")
    return values


def required_text(obj, key, label):
    if not isinstance(obj.get(key), str) or not obj[key].strip():
        raise ValueError(f"{label} 缺少非空 {key}")


def frontmatter(text):
    lines = text.splitlines()
    result = {}
    if lines and lines[0].strip() == "---":
        for line in lines[1:]:
            if line.strip() == "---":
                break
            if ":" in line:
                key, value = line.split(":", 1)
                result[key.strip()] = value.strip().strip('\"\'')
    return result


def without_fences(text):
    lines, fence = [], None
    for line in text.splitlines():
        mark = re.match(r"^\s*(`{3,}|~{3,})", line)
        if mark:
            token = mark.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
        elif fence is None:
            lines.append(line)
    return "\n".join(lines)


def validate_suite(root, name, require_bound):
    suite_path = relative_path(root, name)
    data = json.loads(suite_path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or type(data.get("schema_version")) is not int or data["schema_version"] != 1:
        raise ValueError("suite 必须为 schema_version: 1 的对象")
    scope = data.get("scope")
    if not isinstance(scope, str) or not (FEATURE.fullmatch(scope) or scope == "product"):
        raise ValueError("scope 必须为 FNNN 或 product")
    sources = unique_strings(data.get("sources"), "sources")
    known_ac, known_psc, target_ac = set(), set(), set()
    kinds = set()
    linked_spec = False
    for source in sources:
        text = relative_path(root, source).read_text(encoding="utf-8")
        meta = frontmatter(text)
        kind = meta.get("document")
        kinds.add(kind)
        if kind == "product-spec" and (meta.get("mode") == "linked" or bool(meta.get("upstream"))):
            linked_spec = True
        authoritative = kind in {"product-prd", "product-spec", "feature-spec", "feature-map"}
        if require_bound and (authoritative or "status" in meta):
            allowed = {"ready"} if kind == "feature-spec" else {"confirmed"}
            if meta.get("status") not in allowed:
                raise ValueError(f"来源尚未确认或 ready: {source}")
        body = without_fences(text)
        ac_ids, psc_ids = [], []
        if kind in {"product-prd", "feature-spec"}:
            ac_ids = AC.findall(body)
            if kind == "feature-spec":
                feature = meta.get("feature", "")
                if not FEATURE.fullmatch(feature):
                    raise ValueError(f"Feature Spec 缺少有效 feature: {source}")
                pattern = rf"AC-{feature}-\d{{3}}"
            else:
                pattern = r"AC-\d{3}"
            if any(not re.fullmatch(pattern, identity) for identity in ac_ids):
                raise ValueError(f"AC 编号与来源文档类型或 Feature 不符: {source}")
        elif kind == "product-spec":
            psc_ids = PSC.findall(body)
        if len(ac_ids) != len(set(ac_ids)) or len(psc_ids) != len(set(psc_ids)):
            raise ValueError(f"来源重复定义 AC / PSC: {source}")
        if known_ac.intersection(ac_ids) or known_psc.intersection(psc_ids):
            raise ValueError(f"多个来源重复定义 AC / PSC: {source}")
        known_ac.update(ac_ids)
        known_psc.update(psc_ids)
        if kind == "feature-spec" and meta.get("feature") == scope:
            target_ac.update(item for item in ac_ids if item.startswith(f"AC-{scope}-"))
    if linked_spec:
        if "product-spec" not in kinds:
            raise ValueError("精简模式 sources 必须包含 Product Spec")
    else:
        if not {"product-prd", "product-spec"}.issubset(kinds):
            raise ValueError("sources 必须包含 PRD 和 Product Spec")
    if scope != "product" and not target_ac:
        raise ValueError(f"未找到 {scope} Feature Spec 中定义的 AC")
    contracts = unique_strings(data.get("product_contracts", []), "product_contracts", scope != "product")
    if set(contracts) - known_psc:
        raise ValueError(f"未定义的 product_contracts: {sorted(set(contracts) - known_psc)}")
    if scope != "product" and contracts:
        raise ValueError("product_contracts 仅用于 product 套件")

    cases = data.get("cases")
    checks = data.get("checks")
    if not isinstance(cases, list) or not cases or not isinstance(checks, list):
        raise ValueError("cases 必须非空，checks 必须为数组")
    case_ids, covered_ac, covered_psc = set(), set(), set()
    references, unbound = {}, []
    prefix = scope if scope != "product" else "PRODUCT"
    for case in cases:
        if not isinstance(case, dict):
            raise ValueError("case 必须为对象")
        identity = case.get("id")
        if not isinstance(identity, str) or not re.fullmatch(rf"EV-{prefix}-\d{{3}}", identity):
            raise ValueError(f"用例 ID 必须为 EV-{prefix}-NNN")
        if identity in case_ids:
            raise ValueError(f"重复用例 ID: {identity}")
        case_ids.add(identity)
        for key in ("title", "given", "when"):
            required_text(case, key, identity)
        strings(case.get("expected"), f"{identity}.expected")
        ac_ids = unique_strings(case.get("source_ac"), f"{identity}.source_ac")
        if set(ac_ids) - known_ac:
            raise ValueError(f"{identity} 引用了未定义的 AC: {sorted(set(ac_ids) - known_ac)}")
        if scope != "product" and not set(ac_ids).intersection(target_ac):
            raise ValueError(f"{identity} 必须关联本 Feature AC")
        if scope != "product" and any(re.fullmatch(r"AC-F\d{3}-\d{3}", item) and item not in target_ac for item in ac_ids):
            raise ValueError(f"{identity} 跨 Feature AC 应由 product 套件承接")
        covered_ac.update(ac_ids)
        psc_ids = unique_strings(case.get("source_psc", []), f"{identity}.source_psc", scope != "product")
        if set(psc_ids) - known_psc:
            raise ValueError(f"{identity} 引用了未定义的 PSC")
        if scope == "product" and set(psc_ids) - set(contracts):
            raise ValueError(f"{identity} PSC 超出本套件 product_contracts")
        covered_psc.update(psc_ids)
        if "check_ref" not in case:
            raise ValueError(f"{identity} 缺少 check_ref；未绑定应为 null")
        ref = case["check_ref"]
        if ref is None:
            unbound.append(identity)
        elif not isinstance(ref, str) or not CHECK_ID.fullmatch(ref):
            raise ValueError(f"{identity} check_ref 无效")
        else:
            references.setdefault(ref, []).append(identity)
    missing = (target_ac - covered_ac) if scope != "product" else (set(contracts) - covered_psc)
    if missing:
        raise ValueError(f"验收用例覆盖缺失: {sorted(missing)}")
    if require_bound and unbound:
        raise ValueError(f"用例尚未绑定检查: {unbound}")

    output_checks = []
    check_ids = set()
    for check in checks:
        if not isinstance(check, dict):
            raise ValueError("check 必须为对象")
        identity = check.get("id")
        if not isinstance(identity, str) or not CHECK_ID.fullmatch(identity):
            raise ValueError("检查 ID 无效")
        if identity in check_ids:
            raise ValueError(f"重复检查 ID: {identity}")
        check_ids.add(identity)
        if identity not in references:
            raise ValueError(f"检查未关联用例: {identity}")
        method = check.get("method")
        if method == "command":
            strings(check.get("argv"), f"{identity}.argv")
        elif method == "manual":
            for key in ("procedure", "evidence"):
                required_text(check, key, identity)
            if "argv" in check:
                raise ValueError(f"{identity} manual 检查不能声明 argv")
        else:
            raise ValueError(f"{identity} method 必须为 command 或 manual")
        inputs = unique_strings(check.get("inputs"), f"{identity}.inputs")
        effective = list(dict.fromkeys([suite_path.relative_to(root).as_posix()] + sources + inputs))
        for value in effective:
            path = relative_path(root, value)
            if require_bound and not path.exists():
                raise ValueError(f"{identity} 检查输入不存在: {value}")
            if path.is_dir():
                for child in path.rglob("*"):
                    relative_path(root, child.relative_to(root).as_posix())
        output_checks.append({**check, "case_ids": references[identity], "effective_inputs": effective})
    dangling = set(references) - check_ids
    if dangling:
        raise ValueError(f"check_ref 指向未定义检查: {sorted(dangling)}")
    return {"suite": name, "scope": scope, "case_ids": sorted(case_ids), "unbound": unbound,
            "checks": output_checks, "covered": sorted(target_ac if scope != "product" else contracts)}


def validate_project(root, suites, require_bound=False):
    root = Path(root).resolve()
    errors, reports = [], []
    scopes, identities, check_ids = set(), set(), set()
    for name in suites:
        try:
            report = validate_suite(root, name, require_bound)
            if report["scope"] in scopes:
                raise ValueError(f"同批重复 scope: {report['scope']}")
            scopes.add(report["scope"])
            ids = set(report["case_ids"])
            checks = {item["id"] for item in report["checks"]}
            if identities.intersection(ids) or check_ids.intersection(checks):
                raise ValueError("同批套件的用例或检查 ID 重复")
            identities.update(ids)
            check_ids.update(checks)
            reports.append(report)
        except (ValueError, OSError, TypeError) as exc:
            errors.append(f"{name}: {exc}")
    if not suites:
        errors.append("至少选择一个 suite")
    return {"ok": not errors, "behavior": "not_evaluated", "errors": errors, "suites": reports}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path)
    parser.add_argument("--suite", action="append", required=True)
    parser.add_argument("--require-bound", action="store_true")
    args = parser.parse_args()
    result = validate_project(args.project, args.suite, args.require_bound)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
