#!/usr/bin/env python3
"""Update site-hosted Health paper PDFs from the latest *published* Zenodo versions.

The concept DOI identifies the version family; the version DOI and SHA-256
identify the exact local PDF. No GitHub or Zenodo credentials are required.
This script changes no state outside its working tree, and the workflow commits
the complete verified transaction only after repository validation.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://zenodo.org/api"
DOI = re.compile(r"^10\.5281/zenodo\.(\d+)$")
HFD_IDS = {"hfd1", "hfd2", "hfd3", "hfd4", "hfd5", "hfd6"}
# The all-versions DOIs are stable even when every version DOI changes.
CONCEPTS = {
    "hfd1": "10.5281/zenodo.23131157",
    "hfd2": "10.5281/zenodo.23146280",
    "hfd3": "10.5281/zenodo.23219587",
    "hfd4": "10.5281/zenodo.23268802",
    "hfd5": "10.5281/zenodo.23268986",
    "hfd6": "10.5281/zenodo.23301732",
}

def request(url: str, *, binary=False):
    u = urllib.parse.urlparse(url)
    if u.scheme != "https" or u.hostname not in {"zenodo.org", "www.zenodo.org"}:
        raise ValueError("Unexpected Zenodo host: " + url)
    error = None
    for retry in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ILC-FFB-Scholarly-Version-Mirror/1.0", "Accept": "*/*" if binary else "application/json"})
            with urllib.request.urlopen(req, timeout=50) as response:
                if response.status != 200:
                    raise RuntimeError("Unexpected HTTP response: " + str(response.status))
                data = response.read(45_000_001)
                if len(data) > 45_000_000:
                    raise ValueError("Zenodo response exceeds the maximum size")
            return data if binary else json.loads(data)
        except (OSError, TimeoutError, ValueError) as exc:
            error = exc
            if retry < 3:
                time.sleep(2 ** retry)
    raise RuntimeError(f"Unable to retrieve {url}: {error}")

def record_id(doi):
    match = DOI.fullmatch(doi or "")
    if not match:
        raise ValueError("Expected a Zenodo version/concept DOI: " + str(doi))
    return match.group(1)

def family_id(record):
    parent = record.get("parent") or {}
    return str(record.get("conceptrecid") or parent.get("id") or "")

def family_doi(record):
    parent = record.get("parent") or {}
    return record.get("conceptdoi") or (parent.get("pids") or {}).get("doi", {}).get("identifier")

def authors(record):
    return sorted(re.sub(r"\s+", " ", str(a.get("name", "")).strip()).casefold()
                  for a in (record.get("metadata") or {}).get("creators", []))

def latest_published(current_doi, concept_doi):
    concept_id = record_id(concept_doi)
    current = request(BASE + "/records/" + record_id(current_doi))
    if family_id(current) != concept_id:
        raise ValueError(f"Version DOI {current_doi}: expected family {concept_id}, Zenodo returned family id {family_id(current)!r}, concept DOI {family_doi(current)!r}, raw conceptrecid {current.get('conceptrecid')!r}, record DOI {current.get('doi')!r}, title {(current.get('metadata') or {}).get('title')!r}, parent keys {list((current.get('parent') or {}).keys())}")
    if family_doi(current) and family_doi(current) != concept_doi:
        raise ValueError("Concept DOI metadata mismatch")
    q = urllib.parse.urlencode({"q": "conceptrecid:" + concept_id, "all_versions": "true", "sort": "mostrecent", "size": "25"})
    result = request(BASE + "/records?" + q)
    candidates = (result.get("hits") or {}).get("hits") or []
    candidates = [v for v in candidates if family_id(v) == concept_id and str(v.get("id", "")).isdigit()]
    if not candidates:
        # Do not infer a latest version from a concept-DOI redirect or a search failure.
        raise ValueError(f"Zenodo did not return published versions for {concept_doi}")
    # Zenodo IDs increase when new version records are published. Use created timestamp
    # and numeric record ID, not a guessed semantic version string.
    newest = max(candidates, key=lambda v: (v.get("created") or "", int(v["id"])))
    newest_doi = newest.get("doi")
    if not DOI.fullmatch(newest_doi or ""):
        raise ValueError("Latest published record has no Zenodo version DOI")
    if authors(current) != authors(newest) or not authors(newest):
        raise ValueError("Creator attribution changed; requires scholarly review")
    if int(newest["id"]) < int(current["id"]):
        raise ValueError("Latest search result older than current cited version")
    return newest

def paper_file(record):
    files = record.get("files", [])
    if isinstance(files, dict):
        files = list(files.values())
    pdfs = [f for f in files if str(f.get("key") or f.get("filename") or "").lower().endswith(".pdf")]
    if len(pdfs) != 1:
        raise ValueError(f"Expected exactly one primary PDF for {record.get('doi')}; found {len(pdfs)}. Multiple-PDF records require explicit curation.")
    f = pdfs[0]
    links = f.get("links") or {}
    source = links.get("self") or links.get("content")
    if not source:
        raise ValueError("Zenodo PDF does not have a download URL")
    return f, source

def download_verified(record):
    f, source = paper_file(record)
    payload = request(source, binary=True)
    if not payload.startswith(b"%PDF-") or b"%%EOF" not in payload[-2048:]:
        raise ValueError("Downloaded PDF failed format checks")
    declared = f.get("checksum") or ""
    if declared:
        algo, sep, digest = declared.partition(":")
        if not sep or algo not in ("md5", "sha256"):
            raise ValueError("Unexpected Zenodo file checksum: " + declared)
        if hashlib.new(algo, payload).hexdigest().lower() != digest.lower():
            raise ValueError("Published Zenodo PDF checksum mismatch")
    expected_size = f.get("size")
    if expected_size is not None and int(expected_size) != len(payload):
        raise ValueError("Published Zenodo PDF size mismatch")
    return payload, source

def serialize(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"

def replace_doi_pages(paths, old_doi, new_doi, old_date, new_date, legacy_companion=None, concept=None):
    for path in paths:
        if not path.is_file() or path.suffix.lower() != ".html":
            continue
        original = path.read_text(encoding="utf-8")
        if old_doi not in original:
            continue
        if legacy_companion:
            token = "__ZENODO_VERSION_DOI_TEMP__"
            if token in original:
                raise ValueError("Reserved DOI substitution marker already in page")
            updated = original.replace(old_doi, token).replace(legacy_companion, concept).replace(token, new_doi)
        else:
            updated = original.replace(old_doi, new_doi)
        # Machine-readable citation date identifies the cited published version.
        if old_date and new_date and old_date != new_date:
            updated = updated.replace('name="citation_publication_date" content="' + old_date.replace("-", "/") + '"',
                                      'name="citation_publication_date" content="' + new_date.replace("-", "/") + '"')
            updated = updated.replace('name="citation_online_date" content="' + old_date.replace("-", "/") + '"',
                                      'name="citation_online_date" content="' + new_date.replace("-", "/") + '"')
        if updated != original:
            path.write_text(updated, encoding="utf-8")

def run(site, *, probe=False):
    ffb = site == "ffb"
    catalog_file = ROOT / "research/catalog.json"
    catalog = json.loads(catalog_file.read_text(encoding="utf-8"))
    manifest_file = ROOT / ("research/preprint-pdfs.json" if ffb else "research/site-pdfs.json")
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    if ffb:
        collection = catalog["items"]
        selected = {x["id"]: x for x in collection if x.get("id") in HFD_IDS}
        mirror = {p.get("record_page"): p for p in manifest["papers"]}
    else:
        collection = catalog["publications"]
        selected = {x["id"]: x for x in collection if x.get("id") in HFD_IDS}
        mirror = {p.get("recordPage"): p for p in manifest["papers"]}
    if set(selected) != HFD_IDS:
        raise ValueError("The complete six-paper Health series is missing from catalog")
    changes = []
    # Preflight every paper before mutating any site file.
    pending = []
    for paper_id in sorted(HFD_IDS):
        pub = selected[paper_id]
        concept = CONCEPTS[paper_id]
        old = pub["doi"]
        former_companion = pub.get("concept_doi", pub.get("conceptDoi"))
        # Reconcile historical reversals only when Zenodo confirms the family.
        legacy_swap = old == concept
        if not legacy_swap and former_companion and former_companion != concept:
            raise ValueError(f"{paper_id}: concept DOI conflicts with Zenodo")
        latest = latest_published(old, concept)
        new = latest["doi"]
        if legacy_swap and former_companion and former_companion != new:
            raise ValueError(f"{paper_id}: legacy DOI partner does not match Zenodo's published version")
        if probe:
            primary, _ = paper_file(latest)
            print(f"{paper_id}: stored={old}; published_version={new}; stable_concept={concept}; primary_pdf={primary.get('key')}", flush=True)
            continue
        if new == old and not legacy_swap:
            print(f"{paper_id}: already current ({old})", flush=True)
            continue
        date = (latest.get("metadata") or {}).get("publication_date") or pub.get("date")
        local_pdf = pub.get("pdf")
        if local_pdf and local_pdf.startswith("https://"):
            local_pdf = None
        if not local_pdf and ffb:
            local_pdf = next((p["pdf"] for p in manifest["papers"] if p.get("doi") == old), None)
        if ffb and not local_pdf:
            raise ValueError(f"{paper_id}: missing on-site PDF")
        if local_pdf:
            data, source = download_verified(latest)
        else:
            data, source = None, None
        pending.append((paper_id, pub, old, new, concept, date, local_pdf, data, source, (former_companion or new) if legacy_swap else None))
    if probe:
        print("Zenodo published-record lookup verified", flush=True)
        return False
    for paper_id, pub, old, new, concept, date, local_pdf, payload, source, legacy_companion in pending:
        old_date = pub.get("date", "")
        pub["doi"] = new
        if ffb:
            pub["concept_doi"] = concept
        else:
            pub["conceptDoi"] = concept
        pub["date"] = date
        if local_pdf:
            dest = ROOT / local_pdf
            if not dest.is_file() or hashlib.sha256(dest.read_bytes()).hexdigest() != next(
                p["sha256"] for p in manifest["papers"] if p.get("pdf") == local_pdf
            ):
                raise ValueError(f"{paper_id}: current local PDF fails registered checksum; stopping")
            dest.write_bytes(payload)
            for entry in manifest["papers"]:
                if entry.get("pdf") == local_pdf:
                    entry["sha256"] = hashlib.sha256(payload).hexdigest()
                    entry["doi"] = new
                    entry["concept_doi"] = concept
                    entry["source"] = source
                    entry["publication_date"] = date
                    break
        changes.append((paper_id, old, new, old_date, date, legacy_companion, concept))
        print(f"{paper_id}: published {new} ({date})" + (f"; SHA-256 {hashlib.sha256(payload).hexdigest()}" if payload else "; external PDF resolves through FFB"), flush=True)
    if not changes:
        return False
    catalog_file.write_text(serialize(catalog), encoding="utf-8")
    manifest_file.write_text(serialize(manifest), encoding="utf-8")
    if not ffb:
        datafile = ROOT / "assets/data/research.js"
        raw = datafile.read_text(encoding="utf-8").strip()
        prefix = "window.ILC_DATA="
        if not raw.startswith(prefix):
            raise ValueError("ILC structured data format changed")
        data = json.loads(raw[len(prefix):].rstrip(";"))
        for pub in data["publications"]:
            if pub.get("id") in HFD_IDS:
                current = selected[pub["id"]]
                pub["doi"] = current["doi"]
                pub["conceptDoi"] = current["conceptDoi"]
                pub["date"] = current["date"]
        datafile.write_text(prefix + serialize(data).rstrip() + ";\n", encoding="utf-8")
    if ffb:
        html = [ROOT / "research.html", ROOT / "research-series-health-formally-defined.html"] + list(ROOT.glob("research-*.html"))
    else:
        html = [ROOT / "index.html", ROOT / "publications.html", ROOT / "research-health-formally-defined.html"] + list(ROOT.glob("publication-*.html"))
    for _, old, new, old_date, new_date, legacy_companion, concept in changes:
        replace_doi_pages(html, old, new, old_date, new_date, legacy_companion, concept)
    return True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", required=True, choices=("ffb", "ilc"))
    parser.add_argument("--probe", action="store_true", help="Inspect published version families without updating files")
    args = parser.parse_args()
    changed = run(args.site, probe=args.probe)
    if changed:
        print("UPDATED: verified latest Zenodo versions. Run site validators before committing.")
    elif not args.probe:
        print("No new published versions; site PDFs and citations are already current.")

if __name__ == "__main__":
    main()
