#!/usr/bin/env python3
"""Follow Zenodo's latest published version for every pinned public scholarly paper.

A stable, audited Zenodo concept DOI owns a publication's version history.
The latest published record owns its exact version DOI, PDF and file checksum.
An unexpected creator/title, duplicate primary PDF or malformed download
fails the whole transaction before any changes are committed.
"""
from __future__ import annotations
import argparse
from difflib import SequenceMatcher
import hashlib
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
API="https://zenodo.org/api/records/"
DOI=re.compile(r"^10\.5281/zenodo\.(\d+)$")

def identifier(doi):
    m=DOI.fullmatch(doi or "")
    if not m:
        raise ValueError("Expected Zenodo version/concept DOI, got "+str(doi))
    return m.group(1)

def get(url, binary=False):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname not in ("zenodo.org","www.zenodo.org"):
        raise ValueError("Untrusted file source: "+url)
    last=None
    for n in range(5):
        try:
            req=urllib.request.Request(url,headers={
                "User-Agent":"Fieldflux-ILC-PublishedZenodoMirrors/1.2",
                "Accept":"*/*" if binary else "application/json"})
            with urllib.request.urlopen(req,timeout=60) as resp:
                if resp.status!=200:
                    raise OSError("HTTP "+str(resp.status))
                data=resp.read(60_000_001)
            if len(data)>60_000_000:
                raise ValueError("Zenodo payload exceeds 60 MB")
            return data if binary else json.loads(data)
        except (OSError,TimeoutError,ValueError) as exc:
            last=exc
            if n<4:
                status=getattr(exc,"code",None)
                wait=min(10*2**n,70) if status in (403,429,500,502,503,504) else 2**n
                print(f"Retrying Zenodo request after {type(exc).__name__} ({status}): waiting {wait}s",flush=True)
                time.sleep(wait)
    raise RuntimeError(f"Zenodo retrieval failed for {url}: {last}")

def normalize(s):
    s=unicodedata.normalize("NFKD",str(s or "")).casefold()
    return " ".join(re.findall(r"[a-z0-9]+",s))

def family(record):
    return str(record.get("conceptrecid") or (record.get("parent") or {}).get("id") or "")

def authors(record):
    return {normalize(a.get("name")) for a in (record.get("metadata") or {}).get("creators",[])}

def published_record(entry,pin):
    concept=pin["concept_doi"]
    doc=get(API+identifier(concept))
    if family(doc)!=identifier(concept):
        raise ValueError(f"{entry['id']}: Zenodo family does not match pinned concept DOI")
    if doc.get("conceptdoi") and doc["conceptdoi"]!=concept:
        raise ValueError(f"{entry['id']}: Zenodo concept DOI conflicts with audited pin")
    version=doc.get("doi")
    if not DOI.fullmatch(version or "") or str(doc.get("id"))!=identifier(version):
        raise ValueError(f"{entry['id']}: malformed published version DOI")
    if doc.get("status") not in ("published",None):
        raise ValueError(f"{entry['id']}: Zenodo record is not published")
    if normalize(pin["author"]) not in authors(doc):
        raise ValueError(f"{entry['id']}: creator does not match verified author")
    if SequenceMatcher(None,normalize(pin["record_title"]),normalize((doc.get("metadata") or {}).get("title"))).ratio()<0.78:
        raise ValueError(f"{entry['id']}: changed manuscript identity/title requires review")
    if int(identifier(entry["doi"]))>int(identifier(version)) and entry["doi"]!=concept:
        raise ValueError(f"{entry['id']}: Zenodo seems older than stored version")
    return doc

def pdf_file(doc):
    files=doc.get("files") or []
    if isinstance(files,dict):
        files=list(files.values())
    pdfs=[f for f in files if str(f.get("key") or f.get("filename") or "").lower().endswith(".pdf")]
    if len(pdfs)!=1:
        raise ValueError(f"{doc.get('doi')}: expected one PDF, found {len(pdfs)}")
    f=pdfs[0]
    links=f.get("links") or {}
    url=links.get("content") or links.get("self")
    if not url:
        raise ValueError("Published PDF has no content URL")
    return f,url

def verified_pdf(doc):
    entry,link=pdf_file(doc)
    last=None
    for n in range(3):
        payload=get(link,binary=True)
        try:
            if not payload.startswith(b"%PDF-") or b"%%EOF" not in payload[-2048:]:
                raise ValueError("PDF appears incomplete")
            if entry.get("size") is not None and int(entry["size"])!=len(payload):
                raise ValueError("Zenodo PDF length mismatch")
            checksum=entry.get("checksum") or ""
            if checksum:
                alg,sep,expected=checksum.partition(":")
                if not sep or alg not in ("sha256","md5"):
                    raise ValueError("Unrecognized Zenodo checksum")
                if hashlib.new(alg,payload).hexdigest().lower()!=expected.lower():
                    raise ValueError("Zenodo PDF checksum mismatch")
            return payload,link
        except ValueError as exc:
            last=exc
            if n<2:
                time.sleep(6*(n+1))
    raise ValueError(f"Could not verify published PDF: {last}")

def jsonwrite(file,data):
    file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def update_pages(files,old,new,concept,legacy_partner,old_date,new_date):
    for path in files:
        if not path.is_file(): continue
        original=path.read_text(encoding="utf-8")
        if old not in original:
            continue
        if legacy_partner:
            marker="__VERIFIED_ZENODO_DOI_REORDER__"
            if marker in original: raise ValueError("Reserved DOI substitution token in HTML")
            updated=original.replace(old,marker).replace(legacy_partner,concept).replace(marker,new)
        else:
            updated=original.replace(old,new)
        if old_date and new_date and old_date!=new_date:
            for key in ("citation_publication_date","citation_online_date"):
                updated=updated.replace(
                    f'name="{key}" content="{old_date.replace("-", "/")}"',
                    f'name="{key}" content="{new_date.replace("-", "/")}"')
        if updated!=original:
            path.write_text(updated,encoding="utf-8")

def sync(site,probe=False):
    ffb=site=="ffb"
    catalogfile=ROOT/"research/catalog.json"
    catalog=json.loads(catalogfile.read_text(encoding="utf-8"))
    pins=json.loads((ROOT/"research/zenodo-concepts.json").read_text(encoding="utf-8"))["papers"]
    manifestfile=ROOT/("research/preprint-pdfs.json" if ffb else "research/site-pdfs.json")
    manifest=json.loads(manifestfile.read_text(encoding="utf-8"))
    records=catalog["items"] if ffb else catalog["publications"]
    pubs={x["id"]:x for x in records if (x.get("collection")=="publications" if ffb else True)}
    if set(pubs)!=set(pins):
        raise ValueError("Publication registry and audited Zenodo families differ; reconcile before syncing")
    mirrors={e["pdf"]:e for e in manifest["papers"]}
    changes=[]
    # Preflight the whole catalog and all pending new PDFs before mutating files.
    for ident in sorted(pins):
        p=pubs[ident]
        pin=pins[ident]
        concept=pin["concept_doi"]
        doc=published_record(p,pin)
        new=doc["doi"]
        old=p["doi"]
        prior=p.get("concept_doi") if ffb else p.get("conceptDoi")
        legacy=old==concept and new!=old
        if prior and prior!=concept and (not legacy or prior!=new):
            raise ValueError(f"{ident}: mismatched historical DOI partner")
        local=p.get("pdf") or (next((x["pdf"] for x in manifest["papers"] if x.get("doi")==old),None) if ffb else None)
        is_local=bool(local and not local.startswith(("https://","http://")))
        lacks_pdf=not bool(local)
        needs_change=(new!=old or prior!=concept or (not ffb and lacks_pdf))
        if probe:
            print(f"{ident}: stored={old}, latest={new}, family={concept}, local={bool(is_local)}, needs_update={needs_change}",flush=True)
            # The actual PR preview tests the full transaction, not this shortcut.
        if not needs_change: continue
        raw=None
        source=None
        if is_local or lacks_pdf:
            raw,source=verified_pdf(doc)
        if is_local:
            if local not in mirrors:
                raise ValueError(f"{ident}: hosted PDF has no registered checksum")
            file=ROOT/local
            if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=mirrors[local]["sha256"]:
                raise ValueError(f"{ident}: old local PDF fails registered checksum")
        changes.append(dict(id=ident,old=old,new=new,concept=concept,old_date=p.get("date",""),
            date=(doc.get("metadata") or {}).get("publication_date") or p.get("date"),
            local=local,is_local=is_local,needs_new_link=lacks_pdf,content=raw,
            source=source,legacy_partner=(prior or new) if legacy else None))
    if probe:
        print(f"Published-version inspection completed for {len(pubs)} pinned paper families",flush=True)
        return bool(changes)
    if not changes:
        print("All indexed publications already cite Zenodo's latest published versions",flush=True)
        return False
    for item in changes:
        p=pubs[item["id"]]
        p["doi"]=item["new"]
        p["date"]=item["date"]
        p["concept_doi" if ffb else "conceptDoi"]=item["concept"]
        if item["is_local"]:
            file=ROOT/item["local"]
            file.write_bytes(item["content"])
            m=mirrors[item["local"]]
            m["doi"]=item["new"]
            m["concept_doi"]=item["concept"]
            m["sha256"]=hashlib.sha256(item["content"]).hexdigest()
            m["publication_date"]=item["date"]
            m["source"]=item["source"]
        elif item["needs_new_link"] and not ffb:
            # ILC-only research records not yet hosted by FFB receive a live
            # published-version PDF link, with verified bytes and provenance.
            p["pdf"]=item["source"]
            p["pdfSha256"]=hashlib.sha256(item["content"]).hexdigest()
        print(f"UPDATED {item['id']} {item['old']} -> {item['new']}",flush=True)
    jsonwrite(catalogfile,catalog)
    jsonwrite(manifestfile,manifest)
    if not ffb:
        assetfile=ROOT/"assets/data/research.js"
        raw=assetfile.read_text(encoding="utf-8").strip()
        pre="window.ILC_DATA="
        if not raw.startswith(pre): raise ValueError("ILC browser catalog format changed")
        browser=json.loads(raw[len(pre):].rstrip(";"))
        for pub in browser["publications"]:
            if pub["id"] in pubs:
                authoritative=pubs[pub["id"]]
                for key in ("doi","conceptDoi","date","pdf","pdfSha256"):
                    if key in authoritative: pub[key]=authoritative[key]
        assetfile.write_text(pre+json.dumps(browser,ensure_ascii=False,indent=2)+";\n",encoding="utf-8")
    pages=([ROOT/"research.html",ROOT/"research-series-health-formally-defined.html"]
            +list(ROOT.glob("research-*.html"))) if ffb else (
            [ROOT/"index.html",ROOT/"publications.html",ROOT/"research-health-formally-defined.html"]
            +list(ROOT.glob("publication-*.html")))
    for item in changes:
        update_pages(pages,item["old"],item["new"],item["concept"],
            item["legacy_partner"],item["old_date"],item["date"])
    print(f"UPDATED_TOTAL={len(changes)} with verified published Zenodo metadata/PDFs",flush=True)
    return True

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--site",choices=("ffb","ilc"),required=True)
    ap.add_argument("--probe",action="store_true")
    args=ap.parse_args()
    sync(args.site,probe=args.probe)
