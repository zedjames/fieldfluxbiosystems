#!/usr/bin/env python3
"""Download the exact public Zenodo PDFs declared by research/preprint-pdfs.json.

The manifest is keyed by the DOI printed in each author-supplied PDF and includes
that local source file's SHA-256. Downloads are accepted only when the public
Zenodo bytes match the author's supplied file exactly.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "research" / "preprint-pdfs.json"
UA = "FieldfluxPreprintMirror/1.0 (+https://fieldfluxbiosystems.com/research.html)"


def fetch(url: str, *, tries: int = 4, timeout: int = 90) -> bytes:
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as exc:
            last = exc
            if attempt + 1 < tries:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"failed to fetch {url}: {last}")


def record_id(doi: str) -> str:
    m = re.fullmatch(r"10\.5281/zenodo\.(\d+)", doi.strip(), re.I)
    if not m:
        raise ValueError(f"unsupported DOI: {doi}")
    return m.group(1)


def collect_candidates(meta: dict) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    files = meta.get("files")
    if isinstance(files, list):  # legacy Zenodo API
        for item in files:
            if not isinstance(item, dict):
                continue
            key = str(item.get("key") or item.get("filename") or "")
            links = item.get("links") or {}
            url = links.get("download") or links.get("content") or links.get("self")
            if url:
                out.append((key, str(url)))
    elif isinstance(files, dict):  # InvenioRDM API
        entries = files.get("entries")
        if isinstance(entries, dict):
            for key, item in entries.items():
                if not isinstance(item, dict):
                    continue
                links = item.get("links") or {}
                url = links.get("content") or links.get("download") or links.get("self")
                if url:
                    out.append((str(key), str(url)))
    return out


def html_fallback(record: str) -> list[tuple[str, str]]:
    page_url = f"https://zenodo.org/records/{record}"
    body = fetch(page_url).decode("utf-8", "replace")
    candidates: list[tuple[str, str]] = []
    # Current and legacy Zenodo file links.
    for raw in re.findall(r'href=["\']([^"\']+\.pdf(?:\?[^"\']*)?)["\']', body, flags=re.I):
        url = urllib.parse.urljoin(page_url, html.unescape(raw))
        name = urllib.parse.unquote(urllib.parse.urlparse(url).path.rsplit("/", 1)[-1])
        candidates.append((name, url))
    return candidates


def choose_pdf(candidates: list[tuple[str, str]], record: str) -> tuple[str, str]:
    pdfs = [(name, url) for name, url in candidates if ".pdf" in name.lower() or ".pdf" in url.lower()]
    if not pdfs:
        raise RuntimeError(f"record {record} exposes no PDF")
    # Prefer a literal PDF filename over an API metadata endpoint.
    pdfs.sort(key=lambda x: (not x[0].lower().endswith(".pdf"), len(x[0])))
    return pdfs[0]


def download_record_pdf(doi: str) -> bytes:
    rid = record_id(doi)
    api = f"https://zenodo.org/api/records/{rid}"
    candidates: list[tuple[str, str]] = []
    try:
        meta = json.loads(fetch(api).decode("utf-8"))
        candidates = collect_candidates(meta)
    except Exception as exc:
        print(f"warning: API lookup failed for {doi}: {exc}", file=sys.stderr)
    if not candidates:
        candidates = html_fallback(rid)

    name, url = choose_pdf(candidates, rid)
    print(f"{doi}: downloading {name}")
    data = fetch(url)
    if not data.startswith(b"%PDF-"):
        # Some API links may return JSON metadata. Try /content when appropriate.
        if "/api/records/" in url and not url.rstrip("/").endswith("/content"):
            data = fetch(url.rstrip("/") + "/content")
    if not data.startswith(b"%PDF-"):
        raise RuntimeError(f"{doi}: selected file is not a PDF")
    return data


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    changed = 0
    for paper in manifest["papers"]:
        doi = paper["doi"]
        target = ROOT / paper["pdf"]
        expected = paper["sha256"].lower()
        if target.exists():
            current = hashlib.sha256(target.read_bytes()).hexdigest()
            if current == expected:
                print(f"{target.name}: already exact")
                continue
        data = download_record_pdf(doi)
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected:
            raise RuntimeError(
                f"{doi}: SHA-256 mismatch\n"
                f"  expected author-supplied: {expected}\n"
                f"  downloaded Zenodo:      {actual}\n"
                "Refusing to publish a different file."
            )
        target.write_bytes(data)
        changed += 1
        print(f"{target.name}: wrote {len(data)} bytes; sha256={actual}")
    print(f"complete: {changed} file(s) changed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
