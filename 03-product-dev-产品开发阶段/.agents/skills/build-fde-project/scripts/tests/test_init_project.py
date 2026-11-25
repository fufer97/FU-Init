from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "init_project.py"


class InitProjectTest(unittest.TestCase):
    def run_script(self, project: Path, *extra: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                str(project),
                "--public-name",
                "一键项目初始化",
                "--summary",
                "帮助用户一键生成标准化多阶段 AI 工作区与技能包。",
                *extra,
            ],
            text=True,
            capture_output=True,
            check=False,
        )

    def test_creates_linked_mode_skeleton_without_prd_or_brand_lockin(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp) / "ProjectInitializer"
            result = self.run_script(project)
            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["project_directory_name"], "ProjectInitializer")
            self.assertEqual(report["mode"], "linked")
            self.assertIn("frontend", report["created_directories"])
            self.assertIn("backend", report["created_directories"])
            self.assertTrue((project / "docs/verification").is_dir())
            self.assertTrue((project / "docs/specs/feature-map.md").is_file())
            self.assertTrue((project / "docs/specs/product-spec.md").is_file())
            self.assertFalse((project / "docs/PRD.md").exists())
            self.assertFalse((project / "frontend/public/brand/ff-logo.png").exists())
            self.assertFalse((project / "CLAUDE.md").exists())
            agents = (project / "AGENTS.md").read_text(encoding="utf-8")
            self.assertIn("一键项目初始化", agents)
            self.assertIn("ProjectInitializer", agents)
            self.assertNotIn("@FUF", agents)
            spec_text = (project / "docs/specs/product-spec.md").read_text(encoding="utf-8")
            self.assertIn("mode: linked", spec_text)
            self.assertIn("upstream: ../Raw/HANDOFF.md", spec_text)

    def test_keeps_existing_files_on_repeat_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp) / "OcrPlatform"
            first = self.run_script(project)
            self.assertEqual(first.returncode, 0, first.stderr)
            readme = project / "README.md"
            readme.write_text("user-owned\n", encoding="utf-8")

            second = self.run_script(project)
            self.assertEqual(second.returncode, 0, second.stderr)
            report = json.loads(second.stdout)
            self.assertIn("README.md", report["kept_files"])
            self.assertEqual(readme.read_text(encoding="utf-8"), "user-owned\n")

    def test_dry_run_does_not_write(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp) / "AgenticRAG"
            result = self.run_script(project, "--dry-run")
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(project.exists())

    def test_occupied_paths_fail_before_any_generated_files(self) -> None:
        for relative, directory in (("backend", False), ("docs", False), ("README.md", True)):
            for dry_run in (False, True):
                with self.subTest(relative=relative, dry_run=dry_run), tempfile.TemporaryDirectory() as temp:
                    project = Path(temp) / "Project"
                    occupied = project / relative
                    occupied.parent.mkdir(parents=True, exist_ok=True)
                    if directory:
                        occupied.mkdir()
                    else:
                        occupied.write_text("user-owned", encoding="utf-8")
                    before = sorted(str(path.relative_to(project)) for path in project.rglob("*"))
                    result = self.run_script(project, *(("--dry-run",) if dry_run else ()))
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("occupied", result.stderr)
                    self.assertEqual(before, sorted(str(path.relative_to(project)) for path in project.rglob("*")))

    def test_linked_directory_outside_project_is_rejected_before_writing(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp) / "Project"
            outside = Path(temp) / "Outside"
            project.mkdir()
            outside.mkdir()
            (project / "docs").symlink_to(outside, target_is_directory=True)
            result = self.run_script(project)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside project", result.stderr)
            self.assertFalse((project / "frontend").exists())

    def test_rejects_non_pascal_case_project_folder_without_writing(self) -> None:
        invalid_names = ("agentic-rag", "agentic_rag", "ocrPlatform", "中文项目")
        with tempfile.TemporaryDirectory() as temp:
            for invalid_name in invalid_names:
                with self.subTest(invalid_name=invalid_name):
                    project = Path(temp) / invalid_name
                    result = self.run_script(project)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("PascalCase", result.stderr)
                    self.assertFalse(project.exists())


if __name__ == "__main__":
    unittest.main()
