#!/usr/bin/env python3
"""Validate FFB historical research records and curated ILC/technology pathways."""
from __future__ import annotations
import json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/"research"/"catalog.json"
RESEARCH=ROOT/"research.html"
NOTEBOOK=ROOT/"notebook.html"
ATLAS=ROOT/"research-atlas.html"

def fail(msg:str, errors:list[str])->None:
    errors.append(msg)

def main()->int:
    errors=[]
    c=json.loads(CAT.read_text(encoding="utf-8"))
    items=c.get("items",[])
    relations=c.get("relations",[])
    routes=c.get("routes",[])
    series={s["id"]:s for s in c.get("series",[])}
    themes={t["id"] for t in c.get("themes",[])}
    relation_types={t["id"] for t in c.get("relation_types",[])}

    ids=[i.get("id") for i in items]
    hrefs=[i.get("href") for i in items]
    if len(ids)!=len(set(ids)): fail("duplicate item id",errors)
    if len(hrefs)!=len(set(hrefs)): fail("duplicate item href",errors)
    by_id={i["id"]:i for i in items if i.get("id")}

    for i in items:
        ident=i.get("id","<missing>")
        href=i.get("href")
        if not href: fail(f"{ident}: missing href",errors)
        elif not (ROOT/href).exists(): fail(f"{ident}: missing page {href}",errors)
        if i.get("primary_theme") not in themes: fail(f"{ident}: invalid primary_theme {i.get('primary_theme')}",errors)
        for t in i.get("themes",[]):
            if t not in themes: fail(f"{ident}: invalid theme {t}",errors)

        if i.get("collection")=="publications":
            for key in ("series","order","date","doi"):
                if not i.get(key): fail(f"{ident}: publication missing {key}",errors)
            if i.get("series") not in series: fail(f"{ident}: invalid series {i.get('series')}",errors)
            pdf=i.get("pdf")
            if pdf and not (ROOT/pdf).exists(): fail(f"{ident}: missing PDF {pdf}",errors)
        elif i.get("collection")=="notebook":
            if i.get("series"): fail(f"{ident}: notebook item unexpectedly has series",errors)
        else:
            fail(f"{ident}: invalid collection {i.get('collection')}",errors)

    # New publications must be fully readable on this website. Pre-existing
    # historical works were migrated before this policy and can be backfilled.
    import hashlib
    manifests=json.loads((ROOT/"research"/"preprint-pdfs.json").read_text(encoding="utf-8"))
    pdf_by_path={entry["pdf"]:entry for entry in manifests["papers"]}
    for paper in [i for i in items if i.get("collection")=="publications"]:
        if paper.get("date","") < "2026-10-09":
            continue
        ident=paper["id"]
        pdf=paper.get("pdf")
        if not pdf or not (ROOT/pdf).is_file():
            fail(f"{ident}: every newly published paper needs an actual on-site PDF",errors)
            continue
        payload=(ROOT/pdf).read_bytes()
        if not payload.startswith(b"%PDF-"):
            fail(f"{ident}: the reader asset is not a valid PDF",errors)
        mirror=pdf_by_path.get(pdf)
        if not mirror or mirror["doi"]!=paper.get("doi") or hashlib.sha256(payload).hexdigest()!=mirror.get("sha256"):
            fail(f"{ident}: PDF absent from verified Zenodo mirror manifest or checksum mismatch",errors)
        record_html=(ROOT/paper["href"]).read_text(encoding="utf-8")
        for marker in (f'name="citation_pdf_url"',pdf,'application/pdf'):
            if marker not in record_html:
                fail(f"{ident}: missing Scholar PDF discovery {marker}",errors)
        if paper.get("series")=="health-formally-defined":
            for page in ("research.html","research-series-health-formally-defined.html"):
                if pdf not in (ROOT/page).read_text(encoding="utf-8"):
                    fail(f"{page}: full-text PDF not discoverable for {ident}",errors)

    for r in relations:
        if r.get("from") not in by_id: fail(f"relation missing from item: {r}",errors)
        if r.get("to") not in by_id: fail(f"relation missing to item: {r}",errors)
        if r.get("from")==r.get("to"): fail(f"self relation: {r}",errors)
        if r.get("type") not in relation_types: fail(f"invalid relation type: {r}",errors)

    for route in routes:
        if not route.get("items"): fail(f"route has no items: {route.get('id')}",errors)
        for ident in route.get("items",[]):
            if ident not in by_id: fail(f"route {route.get('id')} references missing {ident}",errors)

    for sid,smeta in series.items():
        landing=smeta.get("landing_page")
        if landing and not (ROOT/landing).exists(): fail(f"series {sid}: missing landing page {landing}",errors)
        orders=sorted(i["order"] for i in items if i.get("series")==sid)
        if orders and orders!=list(range(1,len(orders)+1)):
            fail(f"series {sid} has noncontiguous orders {orders}",errors)

    # The FFB catalog remains a frozen, complete provenance and file-integrity
    # record. The public presentation was reorganized in October 2026:
    # Institute Lux Consilio holds the full scholarly index, while the FFB
    # Research / Atlas / Notebook pages now curate measurement-related paths.
    research=RESEARCH.read_text(encoding="utf-8")
    notebook=NOTEBOOK.read_text(encoding="utf-8")
    atlas=ATLAS.read_text(encoding="utf-8")
    pubs=[i for i in items if i.get("collection")=="publications"]
    notes=[i for i in items if i.get("collection")=="notebook"]

    institute=c.get("canonical_institute","")
    scholarly_catalog=c.get("canonical_scholarly_catalog","")
    if institute != "https://instituteluxconsilio.org/":
        fail("missing or incorrect canonical ILC institute URL",errors)
    if scholarly_catalog!=institute.rstrip("/")+"/research/catalog.json":
        fail("canonical ILC scholarly catalog URL does not match institute base",errors)

    # Full historical coverage stays at original, stable URLs (checked above);
    # theme/series landing pages must continue to resolve their own members.
    for t in c.get("themes",[]):
        landing=t.get("landing_page")
        if not landing:
            fail(f"theme {t['id']}: missing landing_page metadata",errors)
            continue
        page_path=ROOT/landing
        if not page_path.exists():
            fail(f"theme {t['id']}: missing landing page {landing}",errors)
            continue
        page=page_path.read_text(encoding="utf-8")
        for i in items:
            if t["id"] in i.get("themes",[]) and i["href"] not in page:
                fail(f"theme {t['id']} landing missing work {i['href']}",errors)

    for sid,smeta in series.items():
        landing=smeta.get("landing_page")
        if not landing:
            fail(f"series {sid}: missing landing_page metadata",errors)
            continue
        page_path=ROOT/landing
        if not page_path.exists():
            continue  # already reported in the metadata check above
        page=page_path.read_text(encoding="utf-8")
        for i in pubs:
            if i.get("series")==sid and i["href"] not in page:
                fail(f"series {sid} landing missing published paper {i['href']}",errors)

    # The FFB public pages now present focused measurement work; the full
    # scholarly catalog and original publication assets remain intact.
    # Keep the local research-to-technology navigation functional without
    # requiring a cross-site promotional link.
    curated=[
        ("research.html", research, ["research-constitutive-continuation-capacity.html", "platform.html"]),
        ("notebook.html", notebook, ["research.html", "platform.html"]),
        ("research-atlas.html", atlas, ["research-constitutive-continuation-capacity.html", "platform.html", "products.html"]),
    ]
    for name, content, links in curated:
        for link in links:
            if link not in content:
                fail(f"{name}: missing curated research/technology path {link}",errors)
        if 'rel="canonical"' not in content:
            fail(f"{name}: missing canonical page metadata",errors)

    health=[i for i in pubs if i.get("series")=="health-formally-defined"]
    if sorted(i["order"] for i in health)!=[1,2,3,4,5]:
        fail("Health series must include all five published papers",errors)
    for name,version,concept in (("hfd4","23268802","23268803"),("hfd5","23268987","23268986")):
        work=by_id.get(name,{})
        if work.get("doi")!="10.5281/zenodo."+version or work.get("concept_doi")!="10.5281/zenodo."+concept:
            fail(f"{name}: incorrect Zenodo DOI pairing",errors)
        if not work.get("pdf") or not (ROOT/work["pdf"]).is_file():
            fail(f"{name}: required indexed PDF not found",errors)
    for slug in ("research-information-provenance-conservative-enrichment-prospective-health.html",
                 "research-prospective-health-declared-specifications.html"):
        if slug not in research:
            fail(f"research.html: missing newly published health paper {slug}",errors)

    # The two relevant historical health-paper records remain discoverable
    # through FFB while ILC indexes the wider scientific program.
    for slug in ("research-constitutive-continuation-capacity.html",
                 "research-prospective-health-across-contexts.html"):
        if slug not in research:
            fail(f"research.html: missing selected health foundation {slug}",errors)

    if errors:
        print("Research catalog validation FAILED:",file=sys.stderr)
        for e in errors: print(f" - {e}",file=sys.stderr)
        return 1
    print(f"Research provenance and curated paths OK: {len(items)} items, {len(relations)} relations, {len(routes)} routes.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
