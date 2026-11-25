#!/usr/bin/env python3
"""Create the non-destructive standard skeleton for a new engineering project (supports linked and full modes)."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path


DIRECTORIES = (
    "frontend",
    "backend",
    "docs/specs",
    "docs/architecture",
    "docs/verification",
)

PROJECT_DIR_PATTERN = re.compile(r"^[A-Z][A-Za-z0-9]*$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Initialize a standard frontend/backend/docs project skeleton without overwriting files."
    )
    parser.add_argument("project", type=Path, help="Target project root (PascalCase)")
    parser.add_argument("--public-name", required=True, help="User-visible product name")
    parser.add_argument("--summary", required=True, help="One-sentence product positioning")
    parser.add_argument(
        "--mode",
        choices=("linked", "full"),
        default="linked",
        help="linked (default, skips docs/PRD.md and links to ../Raw/) or full (creates docs/PRD.md)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing")
    return parser.parse_args()


def render(template: str, project_dir_name: str, public_name: str, summary: str) -> str:
    return (
        template.replace("{{PROJECT_DIR_NAME}}", project_dir_name)
        .replace("{{PUBLIC_NAME}}", public_name)
        .replace("{{SUMMARY}}", summary)
        .replace("{{DATE}}", date.today().isoformat())
    )


def adapt_template_for_mode(relative: str, content: str, mode: str) -> str:
    if mode != "linked":
        return content
    if relative == "docs/specs/product-spec.md":
        content = content.replace("prd: docs/PRD.md", "mode: linked\nupstream: ../Raw/HANDOFF.md")
        content = content.replace("产品需求事实源：`docs/PRD.md`", "产品需求事实源：`../Raw/HANDOFF.md`（02-产品设计阶段移交材料）")
    elif relative == "docs/specs/feature-map.md":
        content = content.replace("prd: docs/PRD.md", "mode: linked\nupstream: ../Raw/HANDOFF.md")
        content = content.replace("REQ-001, NFR-001, PSC-001", "PSC-001")
    return content


def main() -> int:
    args = parse_args()
    public_name = args.public_name.strip()
    summary = args.summary.strip()
    if not public_name:
        raise SystemExit("--public-name must not be empty")
    if not summary:
        raise SystemExit("--summary must not be empty")

    project = args.project.expanduser().resolve()
    if not PROJECT_DIR_PATTERN.fullmatch(project.name):
        raise SystemExit(
            "project folder name must use PascalCase with ASCII letters and digits, "
            "starting with an uppercase letter; examples: ProjectInitializer, OrderFulfillment"
        )
    if project.exists() and not project.is_dir():
        raise SystemExit(f"target project root is not a directory: {project}")

    skill_root = Path(__file__).resolve().parents[1]
    assets = skill_root / "assets"
    skills_root = skill_root.parent
    templates: dict[str, Path] = {
        "README.md": assets / "README.template.md",
        "AGENTS.md": assets / "AGENTS.template.md",
        "docs/specs/product-spec.md": (
            skills_root / "product-spec/assets/product-spec.template.md"
        ),
        "docs/specs/feature-map.md": (
            skills_root / "feature-spec-planning/assets/feature-map.template.md"
        ),
        "docs/architecture/architecture.md": assets / "architecture.template.md",
    }
    if args.mode == "full":
        templates["docs/PRD.md"] = skills_root / "product-prd/assets/PRD.template.md"

    missing_templates = [str(path) for path in templates.values() if not path.is_file()]
    if missing_templates:
        raise SystemExit(
            "required project-level workflow templates are missing: "
            + ", ".join(missing_templates)
        )

    file_targets = [project / relative for relative in templates]
    directory_targets = {project / relative for relative in DIRECTORIES}
    for target in file_targets + list(directory_targets):
        directory_targets.update(
            parent for parent in target.parents if parent != project and project in parent.parents
        )
    for target in sorted(directory_targets, key=lambda path: (len(path.parts), str(path))):
        if not target.resolve().is_relative_to(project):
            raise SystemExit(f"required directory resolves outside project: {target}")
        if (target.exists() or target.is_symlink()) and not target.is_dir():
            raise SystemExit(f"required directory path is occupied by a file: {target}")
    for target in file_targets:
        if not target.resolve().is_relative_to(project):
            raise SystemExit(f"required file resolves outside project: {target}")
        if (target.exists() or target.is_symlink()) and not target.is_file():
            raise SystemExit(f"required file path is occupied by a non-file: {target}")

    rendered = {
        relative: adapt_template_for_mode(
            relative,
            render(path.read_text(encoding="utf-8"), project.name, public_name, summary),
            args.mode,
        )
        for relative, path in templates.items()
    }

    created_dirs: list[str] = []
    created_files: list[str] = []
    kept_files: list[str] = []

    for relative in DIRECTORIES:
        target = project / relative
        if target.exists() and not target.is_dir():
            raise SystemExit(f"required directory path is occupied by a file: {target}")
        if not target.exists():
            created_dirs.append(relative)
            if not args.dry_run:
                target.mkdir(parents=True, exist_ok=True)

    for relative, content in rendered.items():
        target = project / relative
        if target.exists():
            kept_files.append(relative)
            continue
        created_files.append(relative)
        if not args.dry_run:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")

    print(
        json.dumps(
            {
                "project": str(project),
                "project_directory_name": project.name,
                "mode": args.mode,
                "dry_run": args.dry_run,
                "created_directories": created_dirs,
                "created_files": created_files,
                "kept_files": kept_files,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
