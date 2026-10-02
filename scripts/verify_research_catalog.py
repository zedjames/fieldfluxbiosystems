#!/usr/bin/env python3
"""Validate the public Fieldflux research catalog and its static projections."""
from __future__ import annotations
import html, json, re, sys
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
            for key in ("series","order","date","doi","pdf"):
                if not i.get(key): fail(f"{ident}: publication missing {key}",errors)
            if i.get("series") not in series: fail(f"{ident}: invalid series {i.get('series')}",errors)
            pdf=i.get("pdf")
            if pdf and not (ROOT/pdf).exists(): fail(f"{ident}: missing PDF {pdf}",errors)
        elif i.get("collection")=="notebook":
            if i.get("series"): fail(f"{ident}: notebook item unexpectedly has series",errors)
        else:
            fail(f"{ident}: invalid collection {i.get('collection')}",errors)

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

    research=RESEARCH.read_text(encoding="utf-8")
    notebook=NOTEBOOK.read_text(encoding="utf-8")
    atlas=ATLAS.read_text(encoding="utf-8")
    pubs=[i for i in items if i.get("collection")=="publications"]
    notes=[i for i in items if i.get("collection")=="notebook"]

    # Complete archives own the individual works.
    for i in pubs:
        if i["href"] not in research:
            fail(f"publication absent from research.html: {i['href']}",errors)
    for i in notes:
        if i["href"] not in notebook:
            fail(f"notebook item absent from notebook.html: {i['href']}",errors)

    if research.count("data-archive-card") != len(pubs):
        fail(f"publication archive card count mismatch: expected {len(pubs)}",errors)
    if notebook.count("data-archive-card") != len(notes):
        fail(f"notebook archive card count mismatch: expected {len(notes)}",errors)

    # The Atlas owns durable concepts, series, and curated routes rather than
    # enumerating every research object.
    for t in c.get("themes",[]):
        if html.escape(t["label"]) not in atlas and t["label"] not in atlas:
            fail(f"theme absent from research-atlas.html: {t['label']}",errors)
    for sid,smeta in series.items():
        landing=smeta.get("landing_page")
        if not landing:
            fail(f"series {sid}: missing landing_page metadata",errors)
            continue
        if landing not in atlas:
            fail(f"series landing absent from research-atlas.html: {landing}",errors)
        page=(ROOT/landing).read_text(encoding="utf-8") if (ROOT/landing).exists() else ""
        for i in pubs:
            if i.get("series")==sid and i["href"] not in page:
                fail(f"series {sid} landing missing published paper {i['href']}",errors)
    for route in routes:
        if route.get("title") and route["title"] not in atlas:
            fail(f"route absent from research-atlas.html: {route['title']}",errors)

    # Stable top-level counts.
    expected_pairs=[
        (len(c.get("themes",[])),"durable themes"),
        (len(c.get("series",[])),"active series"),
        (len(items),"public research objects"),
        (len(relations),"cataloged relations"),
    ]
    for expected,label in expected_pairs:
        if not re.search(rf">\s*{expected}\s*<.*?>{re.escape(label)}",atlas,re.S|re.I):
            fail(f"atlas summary count mismatch for {label}: expected {expected}",errors)

    if errors:
        print("Research catalog validation FAILED:",file=sys.stderr)
        for e in errors: print(f" - {e}",file=sys.stderr)
        return 1
    print(f"Research catalog OK: {len(items)} items, {len(relations)} relations, {len(routes)} routes.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
