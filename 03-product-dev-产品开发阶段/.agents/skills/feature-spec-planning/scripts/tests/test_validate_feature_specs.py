from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "validate_feature_specs.py"
SPEC = importlib.util.spec_from_file_location("validate_feature_specs", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def prd() -> str:
    return (
        "---\ndocument: product-prd\nstatus: confirmed\n---\n"
        "| REQ-001 | P0 | 需求 |\n"
        "| NFR-001 | 性能 | 要求 |\n"
        "### AC-001 · 产品验收\n"
    )


def product_spec(status: str = "confirmed") -> str:
    return (
        "---\ndocument: product-spec\n"
        f"status: {status}\n"
        "prd: docs/PRD.md\n---\n"
        "| PSC-001 | 不变量 | REQ-001, NFR-001 | AC-001 | 合同 | 第 5 节 | 全产品 |\n"
        "- [PSC-001] 全局合同。\n"
    )


def feature_map(status: str = "confirmed", row_status: str = "planned") -> str:
    return (
        f"---\ndocument: feature-map\nstatus: {status}\n"
        "prd: docs/PRD.md\n"
        "product_spec: docs/specs/product-spec.md\n---\n"
        "## Feature Map\n"
        "| Feature ID | 目录 | Feature | 用户可观察结果 | 来源合同 | 依赖 | 优先级 | 状态 |\n"
        "|---|---|---|---|---|---|---|---|\n"
        f"| F001 | F001-example | 示例 | 用户看到结果 | REQ-001, NFR-001, PSC-001 | 无 | P0 | {row_status} |\n"
    )


def feature_doc(name: str, status: str, headings: tuple[str, ...], body: str = "") -> str:
    document = {"spec.md": "feature-spec", "plan.md": "feature-plan", "tasks.md": "feature-tasks"}[name]
    rendered = "\n".join(f"## {heading}\n\n内容。" for heading in headings)
    return (
        "---\n"
        f"document: {document}\n"
        "feature: F001\n"
        f"status: {status}\n"
        "---\n\n"
        "# F001 · 示例 Feature\n\n"
        f"{rendered}\n{body}"
    )


def spec_body() -> str:
    return (
        "\n来源需求：REQ-001, NFR-001\n"
        "来源总规格：PSC-001\n"
        "### AC-F001-001 · 可观察结果\n"
        "- 来源：REQ-001, NFR-001, PSC-001\n"
        "- 对应 PRD 验收：AC-001\n"
        "- Given 用户已进入入口\n"
        "- When 用户执行动作\n"
        "- Then 用户看到结果\n"
    )


def tasks_body(count: int = 6, checked: bool = False, forbidden: bool = False) -> str:
    rows: list[str] = []
    for number in range(1, count + 1):
        mark = "x" if checked else " "
        label = " [FE]" if forbidden and number == 1 else ""
        dependency = "无" if number == 1 else f"T{number - 1:03d}"
        rows.append(
            f"- [{mark}] T{number:03d} 独立结果 {number}{label}\n"
            "  - 来源：REQ-001, NFR-001, AC-F001-001\n"
            f"  - 依赖：{dependency}\n"
            f"  - 修改：module/{number}\n"
            f"  - 完成证据：evidence/{number}\n"
            f"  - 验证：test-{number}\n"
        )
    return "\n" + "\n".join(rows) + "\n- 原因：不适用\n"


class ValidateFeatureSpecsTests(unittest.TestCase):
    def make_project(
        self,
        *,
        task_count: int = 6,
        checked: bool = False,
        task_status: str = "planned",
        row_status: str = "planned",
        forbidden: bool = False,
    ) -> tuple[tempfile.TemporaryDirectory[str], Path]:
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        feature_root = root / "docs/specs/F001-example"
        feature_root.mkdir(parents=True)
        (root / "docs/PRD.md").write_text(prd(), encoding="utf-8")
        (root / "docs/specs/product-spec.md").write_text(
            product_spec(), encoding="utf-8"
        )
        (root / "docs/specs/feature-map.md").write_text(
            feature_map(row_status=row_status), encoding="utf-8"
        )
        (feature_root / "spec.md").write_text(
            feature_doc("spec.md", "ready", MODULE.REQUIRED_HEADINGS["spec.md"], spec_body()),
            encoding="utf-8",
        )
        (feature_root / "plan.md").write_text(
            feature_doc(
                "plan.md",
                "ready",
                MODULE.REQUIRED_HEADINGS["plan.md"],
                "\n| AC | 实现结果 | 最窄验证方法 | 预期证据 |\n"
                "|---|---|---|---|\n"
                "| AC-F001-001 | 用户得到结果 | 操作入口并核对结果 | 操作记录 |\n",
            ),
            encoding="utf-8",
        )
        (feature_root / "tasks.md").write_text(
            feature_doc(
                "tasks.md",
                task_status,
                MODULE.REQUIRED_HEADINGS["tasks.md"],
                tasks_body(task_count, checked=checked, forbidden=forbidden),
            ),
            encoding="utf-8",
        )
        return temp, root

    def test_ready_feature_passes_without_technical_labels(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_project(root, require_ready=True)
        self.assertTrue(result["ok"], result["errors"])

    def test_fe_label_is_rejected(self) -> None:
        temp, root = self.make_project(forbidden=True)
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("forbidden FE/BE/INT" in item for item in result["errors"]))

        tasks = root / "docs/specs/F001-example/tasks.md"
        tasks.write_text(
            tasks.read_text(encoding="utf-8").replace("独立结果 1 [FE]", "FE 前端结果 1"),
            encoding="utf-8",
        )
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("forbidden FE/BE/INT" in item for item in result["errors"]))

    def test_dependency_cycle_is_rejected(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        tasks = root / "docs/specs/F001-example/tasks.md"
        text = tasks.read_text(encoding="utf-8").replace("- 依赖：无", "- 依赖：T006", 1)
        tasks.write_text(text, encoding="utf-8")
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("dependency cycle" in item for item in result["errors"]))

    def test_prd_acceptance_must_be_carried_into_feature_spec(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        spec = root / "docs/specs/F001-example/spec.md"
        spec.write_text(
            spec.read_text(encoding="utf-8").replace("- 对应 PRD 验收：AC-001\n", ""),
            encoding="utf-8",
        )
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("对应 PRD 验收" in item for item in result["errors"]))

    def test_product_spec_contract_must_be_mapped_and_carried(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        feature_map_path = root / "docs/specs/feature-map.md"
        feature_map_path.write_text(
            feature_map_path.read_text(encoding="utf-8").replace(", PSC-001", ""),
            encoding="utf-8",
        )
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("must map at least one PSC" in item for item in result["errors"]))

    def test_more_than_eighteen_tasks_requires_reason(self) -> None:
        temp, root = self.make_project(task_count=19)
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("more than 18" in item for item in result["errors"]))

        tasks = root / "docs/specs/F001-example/tasks.md"
        tasks.write_text(
            tasks.read_text(encoding="utf-8").replace(
                "## Task 数量复核\n\n内容。",
                "## Task 数量复核\n\n- 任务总数：19\n- 原因：这些任务共同交付一个不可分割的事务结果，并分别验证独立失败边界。",
            ),
            encoding="utf-8",
        )
        result = MODULE.validate_project(root, require_ready=True)
        self.assertTrue(result["ok"], result["errors"])

    def test_map_and_tasks_status_must_match(self) -> None:
        temp, root = self.make_project(task_status="in-progress", row_status="planned")
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_project(root, require_ready=True)
        self.assertFalse(result["ok"])
        self.assertTrue(any("does not match" in item for item in result["errors"]))

    def test_complete_feature_requires_all_tasks_checked(self) -> None:
        temp, root = self.make_project(task_status="completed", row_status="completed")
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_project(root, require_complete=True, selected_features={"F001"})
        self.assertFalse(result["ok"])
        self.assertTrue(any("incomplete tasks" in item for item in result["errors"]))

        tasks = root / "docs/specs/F001-example/tasks.md"
        tasks.write_text(tasks.read_text(encoding="utf-8").replace("- [ ]", "- [x]"), encoding="utf-8")
        result = MODULE.validate_project(root, require_complete=True, selected_features={"F001"})
        self.assertTrue(result["ok"], result["errors"])

    def test_blank_given_when_then_are_rejected(self) -> None:
        for keyword, value in (("Given", "用户已进入入口"), ("When", "用户执行动作"), ("Then", "用户看到结果")):
            with self.subTest(keyword=keyword):
                temp, root = self.make_project()
                self.addCleanup(temp.cleanup)
                path = root / "docs/specs/F001-example/spec.md"
                path.write_text(path.read_text().replace(f"- {keyword} {value}", f"- {keyword}   "))
                result = MODULE.validate_project(root, require_ready=True)
                self.assertFalse(result["ok"])
                self.assertTrue(any(f"missing non-empty {keyword}" in error for error in result["errors"]))

    def test_empty_task_fields_do_not_consume_the_next_line(self) -> None:
        for label, value in (("修改", "module/1"), ("完成证据", "evidence/1"), ("依赖", "无")):
            with self.subTest(label=label):
                temp, root = self.make_project()
                self.addCleanup(temp.cleanup)
                path = root / "docs/specs/F001-example/tasks.md"
                path.write_text(path.read_text().replace(f"  - {label}：{value}", f"  - {label}：", 1))
                result = MODULE.validate_project(root, require_ready=True)
                self.assertFalse(result["ok"])
                self.assertTrue(any(f"missing fields: {label}" in error for error in result["errors"]))

    def test_plan_requires_actual_acceptance_mapping(self) -> None:
        original = "| AC-F001-001 | 用户得到结果 | 操作入口并核对结果 | 操作记录 |"
        for replacement in ("正文提及 AC-F001-001", "| AC-F001-001 | 用户得到结果 |   | 操作记录 |"):
            with self.subTest(replacement=replacement):
                temp, root = self.make_project()
                self.addCleanup(temp.cleanup)
                path = root / "docs/specs/F001-example/plan.md"
                path.write_text(path.read_text().replace(original, replacement))
                result = MODULE.validate_project(root, require_ready=True)
                self.assertFalse(result["ok"])
                self.assertTrue(any("plan.md" in error for error in result["errors"]))

    def test_eval_column_and_escaped_pipe_keep_mapping_valid(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        path = root / "docs/specs/F001-example/plan.md"
        path.write_text(path.read_text().replace(
            "| AC-F001-001 | 用户得到结果 | 操作入口并核对结果 | 操作记录 |",
            r"| AC-F001-001 | EV-F001-001 | 显示 A \| B | 操作入口并核对结果 | 操作记录 |",
        ))
        result = MODULE.validate_project(root, require_ready=True)
        self.assertTrue(result["ok"], result["errors"])

    def test_blocking_questions_prevent_ready_in_map_spec_and_plan(self) -> None:
        for relative in ("feature-map.md", "F001-example/spec.md", "F001-example/plan.md"):
            with self.subTest(relative=relative):
                temp, root = self.make_project()
                self.addCleanup(temp.cleanup)
                path = root / "docs/specs" / relative
                path.write_text(path.read_text() + "\n| OQ-001 | 核心规则未确认 | 是 | 开发前确认 | 待确认 | |\n")
                result = MODULE.validate_project(root, require_ready=True)
                self.assertFalse(result["ok"])
                self.assertTrue(any("blocking open question" in error for error in result["errors"]))

    def test_nonblocking_and_resolved_questions_can_proceed(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        path = root / "docs/specs/F001-example/spec.md"
        path.write_text(path.read_text() + "\n| OQ-001 | 试用假设 | 否 | 试用后统计 | 待确认 | |\n"
                        "| OQ-002 | 范围确认 | 是 | 开发前确认 | 已解决 | 见已确认 DEC-001 |\n")
        result = MODULE.validate_project(root, require_ready=True)
        self.assertTrue(result["ok"], result["errors"])

    def test_map_empty_outcome_or_invalid_dependency_is_rejected(self) -> None:
        for old, new in (("用户看到结果", "   "), ("| 无 |", "| 稍后再看 |")):
            with self.subTest(field=old):
                temp, root = self.make_project()
                self.addCleanup(temp.cleanup)
                path = root / "docs/specs/feature-map.md"
                path.write_text(path.read_text().replace(old, new))
                result = MODULE.validate_project(root, require_ready=True)
                self.assertFalse(result["ok"])

    def test_selected_feature_does_not_require_other_drafts_ready(self) -> None:
        temp, root = self.make_project()
        self.addCleanup(temp.cleanup)
        path = root / "docs/specs/feature-map.md"
        path.write_text(path.read_text() + "\n| F002 | F002-later | 后续结果 | 后续可观察结果 | REQ-001, PSC-001 | F001 | P1 | deferred |\n")
        result = MODULE.validate_project(root, require_ready=True, selected_features={"F001"})
        self.assertTrue(result["ok"], result["errors"])

    def test_linked_mode_without_prd_passes_and_checks_psc_coverage(self) -> None:
        temp, root = self.make_project(checked=True, task_status="completed", row_status="completed")
        self.addCleanup(temp.cleanup)
        (root / "docs/PRD.md").unlink()
        (root / "docs/specs/product-spec.md").write_text(
            "---\ndocument: product-spec\nstatus: confirmed\nmode: linked\nupstream: ../Raw/HANDOFF.md\n---\n"
            "| PSC-001 | 不变量 | ../Raw/业务PRD.md | 验收口径 | 合同 | 第 5 节 | 全产品 |\n"
            "- [PSC-001] 全局合同。\n",
            encoding="utf-8",
        )
        (root / "docs/specs/feature-map.md").write_text(
            "---\ndocument: feature-map\nstatus: confirmed\nmode: linked\nupstream: ../Raw/HANDOFF.md\n"
            "product_spec: docs/specs/product-spec.md\n---\n"
            "## Feature Map\n"
            "| Feature ID | 目录 | Feature | 用户可观察结果 | 来源合同 | 依赖 | 优先级 | 状态 |\n"
            "|---|---|---|---|---|---|---|---|\n"
            "| F001 | F001-example | 示例 | 用户看到结果 | PSC-001 | 无 | P0 | completed |\n",
            encoding="utf-8",
        )
        spec_path = root / "docs/specs/F001-example/spec.md"
        spec_path.write_text(
            spec_path.read_text(encoding="utf-8")
            .replace("来源需求：REQ-001, NFR-001\n", "")
            .replace("- 来源：REQ-001, NFR-001, PSC-001\n- 对应 PRD 验收：AC-001\n", "- 来源：PSC-001\n"),
            encoding="utf-8",
        )
        tasks_path = root / "docs/specs/F001-example/tasks.md"
        tasks_path.write_text(
            tasks_path.read_text(encoding="utf-8").replace(
                "来源：REQ-001, NFR-001, AC-F001-001",
                "来源：PSC-001, AC-F001-001",
            ),
            encoding="utf-8",
        )
        result = MODULE.validate_project(root, require_complete=True)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["mode"], "linked")



if __name__ == "__main__":
    unittest.main()
