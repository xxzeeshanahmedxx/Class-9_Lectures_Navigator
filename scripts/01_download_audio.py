#!/usr/bin/env python3
"""Download YouTube audio for class9hub videos into /tmp/audio_cache."""
from __future__ import annotations

import concurrent.futures as futures
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

SUBJECTS = ("computer", "chemistry", "biology", "physics")
DATA_DIR = Path("src/data")
CACHE_DIR = Path("/tmp/audio_cache")
WORKERS = 8
PROGRESS_EVERY = 20
FFMPEG_DIR = Path("/home/user/bin")


def iter_video_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for subject in SUBJECTS:
        path = DATA_DIR / f"{subject}.json"
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        for chapter in data.get("chapters", []):
            chapter_id = chapter.get("id", "")
            chapter_title = chapter.get("title", "")

            for video in chapter.get("videos", []) or []:
                if video.get("videoId"):
                    records.append(
                        {
                            "subject": subject,
                            "videoId": video["videoId"],
                            "title": video.get("title", ""),
                            "subtitle": video.get("subtitle", ""),
                            "duration": video.get("duration", ""),
                            "chapterId": chapter_id,
                            "chapterTitle": chapter_title,
                            "sectionId": "",
                            "sectionTitle": "",
                        }
                    )

            for section in chapter.get("sections", []) or []:
                section_id = section.get("id", "")
                section_title = section.get("title", "")
                for video in section.get("videos", []) or []:
                    if video.get("videoId"):
                        records.append(
                            {
                                "subject": subject,
                                "videoId": video["videoId"],
                                "title": video.get("title", ""),
                                "subtitle": video.get("subtitle", ""),
                                "duration": video.get("duration", ""),
                                "chapterId": chapter_id,
                                "chapterTitle": chapter_title,
                                "sectionId": section_id,
                                "sectionTitle": section_title,
                            }
                        )
    return records


def unique_by_video_id(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        video_id = record["videoId"]
        if video_id not in seen:
            unique.append(record)
            seen.add(video_id)
    return unique


def audio_path(video_id: str) -> Path:
    return CACHE_DIR / f"{video_id}.mp3"


def download_audio(record: dict[str, Any]) -> dict[str, Any]:
    video_id = record["videoId"]
    target = audio_path(video_id)
    if target.exists() and target.stat().st_size > 0:
        return {"videoId": video_id, "status": "skipped", "path": str(target), "size": target.stat().st_size}

    outtmpl = str(CACHE_DIR / f"{video_id}.%(ext)s")
    url = f"https://www.youtube.com/watch?v={video_id}"
    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "5",
        "--no-playlist",
        "--ffmpeg-location",
        str(FFMPEG_DIR),
        "-o",
        outtmpl,
        url,
    ]
    started = time.time()
    proc = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    elapsed = time.time() - started
    if target.exists() and target.stat().st_size > 0:
        return {
            "videoId": video_id,
            "status": "downloaded",
            "path": str(target),
            "size": target.stat().st_size,
            "elapsed": elapsed,
        }
    return {
        "videoId": video_id,
        "status": "failed",
        "elapsed": elapsed,
        "returncode": proc.returncode,
        "error": (proc.stderr or proc.stdout)[-2000:],
    }


def main() -> int:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    records = iter_video_records()
    unique_records = unique_by_video_id(records)
    print(f"Total video entries in JSON: {len(records)}")
    print(f"Unique video IDs to download: {len(unique_records)}")
    print(f"Audio cache: {CACHE_DIR}")
    print(f"Workers: {WORKERS}")

    counts = {"downloaded": 0, "skipped": 0, "failed": 0}
    failures: list[dict[str, Any]] = []
    started = time.time()

    with futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        future_to_record = {executor.submit(download_audio, record): record for record in unique_records}
        for done, fut in enumerate(futures.as_completed(future_to_record), start=1):
            result = fut.result()
            status = result["status"]
            counts[status] = counts.get(status, 0) + 1
            if status == "failed":
                failures.append(result)
                print(f"FAILED {result['videoId']}: {result.get('error', '').splitlines()[-1:]}")
            if done % PROGRESS_EVERY == 0 or done == len(unique_records):
                elapsed = time.time() - started
                print(
                    f"Progress {done}/{len(unique_records)} | "
                    f"downloaded={counts.get('downloaded', 0)} skipped={counts.get('skipped', 0)} "
                    f"failed={counts.get('failed', 0)} | elapsed={elapsed:.1f}s",
                    flush=True,
                )

    report = {
        "total_json_entries": len(records),
        "unique_video_ids": len(unique_records),
        "counts": counts,
        "failures": failures,
    }
    (CACHE_DIR / "download_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Download report written to", CACHE_DIR / "download_report.json")
    return 0 if counts.get("downloaded", 0) + counts.get("skipped", 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())
