#!/usr/bin/env python3
"""Fallback transcript fetcher: downloads Hindi YouTube captions when audio downloads are blocked.

This is not a Groq/Whisper transcriber. It is a practical fallback for environments
where YouTube media downloads return 403/429 but subtitle/caption downloads still work.
It writes the same transcript header/format used by scripts/02_transcribe_groq.py.
"""
from __future__ import annotations

import concurrent.futures as futures
import html
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

SUBJECTS = ("computer", "chemistry", "biology", "physics")
DATA_DIR = Path("src/data")
TRANSCRIPTS_DIR = Path("transcripts")
CAPTION_CACHE = Path("/tmp/caption_cache")
WORKERS = 4
PROGRESS_EVERY = 20
FFMPEG_DIR = Path("/home/user/bin")

TAG_RE = re.compile(r"<[^>]+>")
TIMESTAMP_TAG_RE = re.compile(r"<\d{2}:\d{2}:\d{2}\.\d{3}>")


def iter_video_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for subject in SUBJECTS:
        with (DATA_DIR / f"{subject}.json").open("r", encoding="utf-8") as f:
            data = json.load(f)
        for chapter in data.get("chapters", []) or []:
            chapter_id = chapter.get("id", "")
            chapter_title = chapter.get("title", "")

            def add(video: dict[str, Any], section_id: str = "", section_title: str = "") -> None:
                video_id = video.get("videoId")
                if video_id:
                    records.append(
                        {
                            "subject": subject,
                            "videoId": video_id,
                            "title": video.get("title", ""),
                            "subtitle": video.get("subtitle", ""),
                            "duration": video.get("duration", ""),
                            "chapterId": chapter_id,
                            "chapterTitle": chapter_title,
                            "sectionId": section_id,
                            "sectionTitle": section_title,
                        }
                    )

            for video in chapter.get("videos", []) or []:
                add(video)
            for section in chapter.get("sections", []) or []:
                for video in section.get("videos", []) or []:
                    add(video, section.get("id", ""), section.get("title", ""))
    return records


def unique_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str]] = set()
    out: list[dict[str, Any]] = []
    for record in records:
        key = (record["subject"], record["videoId"])
        if key not in seen:
            out.append(record)
            seen.add(key)
    return out


def transcript_path(record: dict[str, Any]) -> Path:
    return TRANSCRIPTS_DIR / record["subject"] / f"{record['videoId']}.txt"


def caption_path(video_id: str) -> Path:
    return CAPTION_CACHE / f"{video_id}.hi.vtt"


def metadata_header(record: dict[str, Any]) -> str:
    return "\n".join(
        [
            f"Video ID: {record.get('videoId', '')}",
            f"Title: {record.get('title', '')}",
            f"Subtitle: {record.get('subtitle', '')}",
            f"Chapter: {record.get('chapterTitle', '')}",
            f"Section: {record.get('sectionTitle', '')}",
            f"Duration: {record.get('duration', '')}",
            f"Subject: {record.get('subject', '')}",
            "---",
        ]
    )


def clean_caption_text(text: str) -> str:
    text = TIMESTAMP_TAG_RE.sub("", text)
    text = TAG_RE.sub("", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def vtt_to_plain_text(path: Path) -> str:
    cues: list[str] = []
    current: list[str] = []
    in_cue = False

    def flush() -> None:
        nonlocal current
        lines = [clean_caption_text(line) for line in current]
        lines = [line for line in lines if line]
        if lines:
            # YouTube auto captions are rolling captions. The last non-empty line is
            # usually the newly-added caption text; using it avoids heavy duplication.
            cue = lines[-1]
            if cue and (not cues or cue != cues[-1]):
                cues.append(cue)
        current = []

    for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip("\ufeff").strip()
        if not line or line == "WEBVTT" or line.startswith(("Kind:", "Language:", "NOTE", "STYLE", "REGION", "X-TIMESTAMP-MAP")):
            if in_cue and not line:
                flush()
                in_cue = False
            continue
        if "-->" in line:
            if in_cue:
                flush()
            in_cue = True
            continue
        if line.isdigit():
            continue
        if in_cue:
            current.append(line)
    if in_cue:
        flush()

    # Remove common music/noise-only markers but keep the spoken transcript intact.
    cues = [cue for cue in cues if cue not in {"[संगीत]", "[Music]", "[music]"}]
    return "\n".join(cues).strip()


def fetch_caption(record: dict[str, Any]) -> dict[str, Any]:
    video_id = record["videoId"]
    out = transcript_path(record)
    if out.exists() and out.stat().st_size > 0:
        return {"videoId": video_id, "status": "skipped_existing"}

    CAPTION_CACHE.mkdir(parents=True, exist_ok=True)
    vtt = caption_path(video_id)
    if not (vtt.exists() and vtt.stat().st_size > 0):
        cmd = [
            sys.executable,
            "-m",
            "yt_dlp",
            "--skip-download",
            "--write-auto-subs",
            "--write-subs",
            "--sub-langs",
            "hi",
            "--sub-format",
            "vtt",
            "--extractor-args",
            "youtube:player_client=mweb",
            "--ffmpeg-location",
            str(FFMPEG_DIR),
            "-o",
            str(CAPTION_CACHE / f"{video_id}.%(ext)s"),
            f"https://www.youtube.com/watch?v={video_id}",
        ]
        env = os.environ.copy()
        env["PATH"] = f"/home/user/bin:{env.get('PATH', '')}"
        proc = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
        if proc.returncode != 0 and not (vtt.exists() and vtt.stat().st_size > 0):
            return {"videoId": video_id, "status": "failed", "error": (proc.stderr or proc.stdout)[-2000:]}

    if not (vtt.exists() and vtt.stat().st_size > 0):
        return {"videoId": video_id, "status": "no_hi_caption"}

    text = vtt_to_plain_text(vtt)
    if not text:
        return {"videoId": video_id, "status": "empty_caption"}

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(metadata_header(record) + "\n" + text + "\n", encoding="utf-8")
    return {"videoId": video_id, "status": "created", "chars": len(text), "path": str(out)}


def main() -> int:
    records = unique_records(iter_video_records())
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)
    print(f"Total video records: {len(records)}")
    print(f"Caption cache: {CAPTION_CACHE}")
    print(f"Workers: {WORKERS}")

    counts: dict[str, int] = {}
    failures: list[dict[str, Any]] = []
    started = time.time()
    with futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        future_map = {executor.submit(fetch_caption, record): record for record in records}
        for done, fut in enumerate(futures.as_completed(future_map), start=1):
            result = fut.result()
            status = result["status"]
            counts[status] = counts.get(status, 0) + 1
            if status not in {"created", "skipped_existing"}:
                failures.append(result)
            if done % PROGRESS_EVERY == 0 or done == len(records):
                elapsed = time.time() - started
                print(f"Progress {done}/{len(records)} | {counts} | elapsed={elapsed:.1f}s", flush=True)

    report = {"total_records": len(records), "counts": counts, "failures": failures}
    (TRANSCRIPTS_DIR / "caption_fetch_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Caption fetch report written to", TRANSCRIPTS_DIR / "caption_fetch_report.json")
    return 0 if counts.get("created", 0) or counts.get("skipped_existing", 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())
