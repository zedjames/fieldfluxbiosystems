#!/usr/bin/env python3
"""Read-only authority audit for all currently indexed public Zenodo records.

Reports the actual published-version DOI, stable concept DOI, creator names,
title, current PDF candidates, and whether the locally registered DOI is
version-specific or a family DOI. Nothing is written.
"""
from __future__ import annotations
import concurrent.futures
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def get(url):
    err=None
    for attempt in range(5):
        try:
            request=urllib.request.Request(url,headers={
                "User-Agent":"ScholarlyZenodoCatalogAudit/1.1",
                "Accept":"application/json"})
            with urllib.request.urlopen(request,timeout=40) as response:
                if response.status!=200: raise RuntimeError("Status "+str(response.status))
                return json.load(response)
        except (OSError,ValueError) as exc:
            err=exc
            if attempt<4: time.sleep([3,7,14,28][attempt])
    raise RuntimeError(str(err))

def main(site):
    data=json.loads((ROOT/"research/catalog.json").read_text())
    if site=="ffb":
        entries=[p for p in data["items"] if p.get("collection")=="publications"]
    else:
        entries=data["publications"]
    def inspect(p):
        doi=p.get("doi","")
        m=re.fullmatch(r"10\.5281/zenodo\.(\d+)",doi)
        if not m: return dict(id=p["id"],error="DOI is not a single Zenodo record: "+doi)
        try:
            r=get("https://zenodo.org/api/records/"+m.group(1))
            meta=r.get("metadata",{})
            f=r.get("files") or []
            if isinstance(f,dict): f=list(f.values())
            pdfs=[f.get("key") or f.get("filename") for f in f
                  if str(f.get("key") or f.get("filename") or "").lower().endswith(".pdf")]
            return dict(id=p["id"],stored_doi=doi,record_doi=r.get("doi"),
                concept_doi=r.get("conceptdoi"),conceptrecid=str(r.get("conceptrecid")),
                title=r.get("metadata",{}).get("title"),
                creators=[x.get("name") for x in meta.get("creators",[])],
                pdfs=pdfs,record_id=r.get("id"),published=meta.get("publication_date"),
                family_is_current=(r.get("doi")==doi),status=r.get("status"))
        except Exception as exc: return dict(id=p["id"],error=str(exc),stored_doi=doi)
    # Parallel at only two workers to avoid triggering Zenodo's public limits.
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        rows=list(pool.map(inspect,entries))
    for row in rows:
        print("ZENODO_AUDIT "+json.dumps(row,ensure_ascii=False),flush=True)
    bad=[x for x in rows if "error" in x or not x.get("concept_doi")
         or not x.get("record_doi") or len(x.get("pdfs") or [])!=1]
    print(f"AUDIT_TOTAL={len(rows)} UNRESOLVED={len(bad)}",flush=True)
    if bad: raise SystemExit(1)
if __name__=="__main__":
    if len(sys.argv)!=2 or sys.argv[1] not in ("ffb","ilc"):
        raise SystemExit("Usage: audit_zenodo_concepts.py ffb|ilc")
    main(sys.argv[1])
