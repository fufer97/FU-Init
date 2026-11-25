from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "validate_product_spec.py"
SPEC = importlib.util.spec_from_file_location("validate_product_spec", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def prd() -> str:
    return (
        "---\ndocument: product-prd\nstatus: confirmed\n---\n"
        "| REQ-001 | P0 | 需求 |\n"
        "| NFR-001 | 安全 | 要求 |\n"
        "### AC-001 · 产品验收\n"
    )


def product_spec(status: str = "confirmed") -> str:
    headings = "\n".join(f"## {heading}\n\n内容。" for heading in MODULE.REQUIRED_HEADINGS)
    headings = headings.replace(
        "## 跨 Feature 不变量与共享行为\n\n内容。",
        "## 跨 Feature 不变量与共享行为\n\n- [PSC-001] 所有功能遵守统一状态与安全合同。",
    )
    return (
        "---\n"
        "document: product-spec\n"
        f"status: {status}\n"
        "prd: docs/PRD.md\n"
        "---\n\n"
        "# 产品总规格\n\n"
        f"{headings}\n\n"
        "| PSC-001 | 不变量 | REQ-001, NFR-001 | AC-001 | 统一合同 | 第 5 节 | 全产品 |\n"
    )


def linked_product_spec(status: str = "confirmed") -> str:
    headings = "\n".join(f"## {heading}\n\n内容。" for heading in MODULE.REQUIRED_HEADINGS)
    headings = headings.replace(
        "## 跨 Feature 不变量与共享行为\n\n内容。",
        "## 跨 Feature 不变量与共享行为\n\n- [PSC-001] 02 设计阶段交接的字段与双模式状态一致。",
    )
    return (
        "---\n"
        "document: product-spec\n"
        f"status: {status}\n"
        "mode: linked\n"
        "upstream: ../Raw/HANDOFF.md\n"
        "---\n\n"
        "# 产品总规格（精简联动模式）\n\n"
        f"{headings}\n\n"
        "| PSC-001 | 不变量 | ../Raw/业务PRD.md §3.1 | 双模式状态切换无冲突 | 统一双模式合同 | 第 5 节 | 全产品 |\n"
    )


class ValidateProductSpecTests(unittest.TestCase):
    def make_project(self, spec_text: str, with_prd: bool = True) -> tuple[tempfile.TemporaryDirectory[str], Path]:
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        (root / "docs/specs").mkdir(parents=True)
        if with_prd:
            (root / "docs/PRD.md").write_text(prd(), encoding="utf-8")
        (root / "docs/specs/product-spec.md").write_text(spec_text, encoding="utf-8")
        return temp, root

    def test_confirmed_product_spec_passes(self) -> None:
        temp, root = self.make_project(product_spec())
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_product_spec(root, require_confirmed=True)
        self.assertTrue(result["ok"], result["errors"])

    def test_linked_mode_without_prd_passes(self) -> None:
        temp, root = self.make_project(linked_product_spec(), with_prd=False)
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_product_spec(root, require_confirmed=True)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["mode"], "linked")

    def test_draft_is_valid_but_not_confirmed(self) -> None:
        temp, root = self.make_project(product_spec("draft"))
        self.addCleanup(temp.cleanup)
        self.assertTrue(MODULE.validate_product_spec(root)["ok"])
        result = MODULE.validate_product_spec(root, require_confirmed=True)
        self.assertFalse(result["ok"])
        self.assertIn("product-spec.md must have status: confirmed", result["errors"])

    def test_missing_prd_coverage_fails(self) -> None:
        text = product_spec().replace("REQ-001, NFR-001", "REQ-001")
        temp, root = self.make_project(text)
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_product_spec(root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("NFR-001" in item for item in result["errors"]))

    def test_duplicate_contract_id_fails(self) -> None:
        text = product_spec() + "\n| PSC-001 | 安全 | REQ-001 | AC-001 | 重复 | 第 7 节 | 全产品 |\n"
        temp, root = self.make_project(text)
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_product_spec(root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("duplicate PSC" in item for item in result["errors"]))

    def test_confirmed_placeholder_fails(self) -> None:
        temp, root = self.make_project(product_spec() + "\n【待填写】\n")
        self.addCleanup(temp.cleanup)
        result = MODULE.validate_product_spec(root)
        self.assertFalse(result["ok"])
        self.assertIn(
            "confirmed product-spec.md still contains template placeholders",
            result["errors"],
        )


if __name__ == "__main__":
    unittest.main()
