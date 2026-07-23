#!/usr/bin/env python3
"""Transcribe downloaded audio files with Groq Whisper into transcripts/{subject}/{videoId}.txt."""
from __future__ import annotations

import json
import os
import queue
import threading
import time
from pathlib import Path
from typing import Any

from groq import Groq

SUBJECTS = ("computer", "chemistry", "biology", "physics")
DATA_DIR = Path("src/data")
AUDIO_DIR = Path("/tmp/audio_cache")
TRANSCRIPTS_DIR = Path("transcripts")
MODELS = ("whisper-large-v3-turbo", "whisper-large-v3")
REQUEST_DELAY_SECONDS = 3


def iter_video_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for subject in SUBJECTS:
        path = DATA_DIR / f"{subject}.json"
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        for chapter in data.get("chapters", []) or []:
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


def unique_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str]] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        key = (record["subject"], record["videoId"])
        if key not in seen:
            unique.append(record)
            seen.add(key)
    return unique


def transcript_path(record: dict[str, Any]) -> Path:
    return TRANSCRIPTS_DIR / record["subject"] / f"{record['videoId']}.txt"


def audio_path(record: dict[str, Any]) -> Path:
    return AUDIO_DIR / f"{record['videoId']}.mp3"


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


def write_transcript(record: dict[str, Any], text: str) -> None:
    path = transcript_path(record)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(metadata_header(record) + "\n" + text.strip() + "\n", encoding="utf-8")


def worker(model: str, jobs: "queue.Queue[dict[str, Any]]", stats: dict[str, int], lock: threading.Lock, started_at: float, api_key: str) -> None:
    client = Groq(api_key=api_key)
    while True:
        try:
            record = jobs.get_nowait()
        except queue.Empty:
            return

        video_id = record["videoId"]
        audio = audio_path(record)
        t0 = time.time()
        status = "ok"
        char_count = 0
        try:
            with audio.open("rb") as f:
                transcript = client.audio.transcriptions.create(
                    file=f,
                    model=model,
                    language="hi",
                    response_format="text",
                )
            text = str(transcript).strip()
            char_count = len(text)
            write_transcript(record, text)
        except Exception as exc:  # Keep an ERROR file so organize/report can count it.
            status = "error"
            message = f"ERROR: {type(exc).__name__}: {exc}"
            char_count = len(message)
            write_transcript(record, message)

        with lock:
            stats[status] = stats.get(status, 0) + 1
            done = stats.get("ok", 0) + stats.get("error", 0)
            total = stats["total"]
            elapsed_total = time.time() - started_at
            elapsed_one = time.time() - t0
            print(
                f"[{done}/{total}] {video_id} | chars={char_count} | "
                f"model={model} | status={status} | request={elapsed_one:.1f}s | elapsed={elapsed_total:.1f}s",
                flush=True,
            )

        jobs.task_done()
        time.sleep(REQUEST_DELAY_SECONDS)


def main() -> int:
    api_key = os.environ.get("GROQ_API_KEY")

    all_records = unique_records(iter_video_records())
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)

    skipped_existing = 0
    missing_audio = 0
    to_transcribe: list[dict[str, Any]] = []
    for record in all_records:
        out = transcript_path(record)
        audio = audio_path(record)
        if out.exists() and out.stat().st_size > 0:
            skipped_existing += 1
            continue
        if not (audio.exists() and audio.stat().st_size > 0):
            missing_audio += 1
            continue
        to_transcribe.append(record)

    print(f"Total video records: {len(all_records)}")
    print(f"Already transcribed: {skipped_existing}")
    print(f"Missing audio: {missing_audio}")
    print(f"Queued for transcription: {len(to_transcribe)}")
    print(f"Models: {', '.join(MODELS)}")

    if to_transcribe and not api_key:
        raise SystemExit("GROQ_API_KEY is required in the environment when audio files are queued. The key is intentionally not stored in this script.")

    stats = {"total": len(to_transcribe), "ok": 0, "error": 0}
    started_at = time.time()

    if to_transcribe:
        jobs: "queue.Queue[dict[str, Any]]" = queue.Queue()
        for record in to_transcribe:
            jobs.put(record)

        lock = threading.Lock()
        threads = [
            threading.Thread(target=worker, args=(model, jobs, stats, lock, started_at, api_key), name=model)
            for model in MODELS
        ]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

    elapsed = time.time() - started_at
    report = {
        "total_records": len(all_records),
        "already_transcribed": skipped_existing,
        "missing_audio": missing_audio,
        "queued": len(to_transcribe),
        "ok": stats.get("ok", 0),
        "error": stats.get("error", 0),
        "elapsed_seconds": elapsed,
    }
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)
    (TRANSCRIPTS_DIR / "transcribe_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Transcription report written to", TRANSCRIPTS_DIR / "transcribe_report.json")
    return 0 if stats.get("error", 0) == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
