#!/usr/bin/env python3
"""Move transcripts into transcripts/{subject}/{chapterId}/[{sectionId}/]{videoId}.txt."""
from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

SUBJECTS = ("computer", "chemistry", "biology", "physics")
DATA_DIR = Path("src/data")
TRANSCRIPTS_DIR = Path("transcripts")


def build_mapping() -> dict[tuple[str, str], dict[str, str]]:
    mapping: dict[tuple[str, str], dict[str, str]] = {}
    for subject in SUBJECTS:
        path = DATA_DIR / f"{subject}.json"
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        for chapter in data.get("chapters", []) or []:
            chapter_id = chapter.get("id", "")
            for video in chapter.get("videos", []) or []:
                video_id = video.get("videoId")
                if video_id:
                    mapping[(subject, video_id)] = {"chapterId": chapter_id, "sectionId": ""}

            for section in chapter.get("sections", []) or []:
                section_id = section.get("id", "")
                for video in section.get("videos", []) or []:
                    video_id = video.get("videoId")
                    if video_id:
                        mapping[(subject, video_id)] = {"chapterId": chapter_id, "sectionId": section_id}
    return mapping


def target_path(subject: str, video_id: str, item: dict[str, str]) -> Path:
    chapter_id = item["chapterId"]
    section_id = item.get("sectionId") or ""
    if section_id:
        return TRANSCRIPTS_DIR / subject / chapter_id / section_id / f"{video_id}.txt"
    return TRANSCRIPTS_DIR / subject / chapter_id / f"{video_id}.txt"


def remove_empty_dirs(root: Path) -> int:
    removed = 0
    if not root.exists():
        return removed
    dirs = sorted([p for p in root.rglob("*") if p.is_dir()], key=lambda p: len(p.parts), reverse=True)
    for directory in dirs:
        try:
            directory.rmdir()
            removed += 1
        except OSError:
            pass
    return removed


def main() -> int:
    mapping = build_mapping()
    moved = 0
    skipped = 0
    errors_found = 0
    missing_mapping = 0

    for subject in SUBJECTS:
        subject_dir = TRANSCRIPTS_DIR / subject
        if not subject_dir.exists():
            continue
        # Only move root-level transcript files. Already-organized files are left alone.
        for src in sorted(subject_dir.glob("*.txt")):
            video_id = src.stem
            content = src.read_text(encoding="utf-8", errors="replace")
            if "ERROR:" in content:
                errors_found += 1
                skipped += 1
                continue

            item = mapping.get((subject, video_id))
            if not item:
                missing_mapping += 1
                skipped += 1
                print(f"No mapping for {subject}/{video_id}; left at {src}")
                continue

            dst = target_path(subject, video_id, item)
            dst.parent.mkdir(parents=True, exist_ok=True)
            if dst.exists():
                skipped += 1
                print(f"Target exists, skipping: {dst}")
                continue
            shutil.move(str(src), str(dst))
            moved += 1

    empty_dirs_deleted = remove_empty_dirs(TRANSCRIPTS_DIR)
    print(f"Files moved: {moved}")
    print(f"Files skipped: {skipped}")
    print(f"Errors found: {errors_found}")
    print(f"Missing mappings: {missing_mapping}")
    print(f"Empty directories deleted: {empty_dirs_deleted}")
    return 0 if missing_mapping == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
