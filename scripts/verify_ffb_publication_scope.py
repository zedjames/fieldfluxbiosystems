#!/usr/bin/env python3
"""Verify FFB's six-paper active scope and preserve old scholarly URLs.

ILC is the comprehensive scholarly archive and owns ongoing Zenodo version
tracking of every non-Health paper. FFB retains byte-identical historical
publication copies for citation continuity, but does not re-index them.
"""
from __future__ import annotations
import hashlib
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
HEALTH={"hfd1","hfd2","hfd3","hfd4","hfd5","hfd6"}
ILC="https://instituteluxconsilio.org/"
HISTORICAL_THEMES=[
 "health-foundations","invariance-identity","boundary-measurement",
 "formalization-proof","evidence-validation","relational-organization",
 "continuation-stability","representation-reconstruction"
]

def load(relative):
    return json.loads((ROOT/relative).read_text(encoding="utf-8"))

def assert_true(condition,message):
    if not condition:
        raise AssertionError(message)

def check():
    active=load("research/catalog.json")
    historic=load("research/historical-publications.json")
    manifest=load("research/preprint-pdfs.json")["papers"]
    archived_manifest=load("research/historical-preprint-pdfs.json")["papers"]
    concepts=load("research/zenodo-concepts.json")["papers"]
    archived_concepts=load("research/historical-zenodo-concepts.json")["papers"]
    active_pubs=[x for x in active["items"] if x.get("collection")=="publications"]
    old_pubs=historic["publications"]
    assert_true(len(active_pubs)==6 and {x["id"] for x in active_pubs}==HEALTH,
                "Fieldflux must have exactly six active Health papers")
    assert_true({x["series"] for x in active_pubs}=={"health-formally-defined"},
                "Non-Health paper unexpectedly active on Fieldflux")
    assert_true({x["id"] for x in old_pubs}.isdisjoint(HEALTH) and len(old_pubs)==20,
                "Twenty historic non-Health paper records must be preserved")
    assert_true(len({x["id"] for x in old_pubs})==20,
                "Historical IDs must be distinct")
    assert_true(set(concepts)==HEALTH and set(archived_concepts)=={x["id"] for x in old_pubs},
                "Active and historical Zenodo concept registries have wrong ownership")
    assert_true({x["id"] for x in active["series"]}=={"health-formally-defined"},
                "Only the Health publication series may be actively listed on FFB")
    assert_true(all(x.get("collection")=="notebook" for x in active["items"]
                    if x["id"] not in HEALTH),
                "Non-Health paper unexpectedly retained as a current catalog item")

    by_pdf={x["pdf"]:x for x in manifest}
    old_by_pdf={x["pdf"]:x for x in archived_manifest}
    assert_true(len(manifest)==6 and len(archived_manifest)==20,
                "PDF checksum inventories must be separated into six active and twenty archived files")
    assert_true({x["pdf"] for x in active_pubs}==set(by_pdf),
                "Active Health PDF inventory incomplete")
    assert_true({x["pdf"] for x in old_pubs}==set(old_by_pdf),
                "Legacy PDF provenance inventory incomplete")
    for pub in active_pubs+old_pubs:
        historical=pub["id"] not in HEALTH
        mirror=(old_by_pdf if historical else by_pdf)[pub["pdf"]]
        payload=(ROOT/pub["pdf"]).read_bytes()
        assert_true(payload.startswith(b"%PDF-"),"Invalid local PDF for "+pub["id"])
        digest=hashlib.sha256(payload).hexdigest()
        assert_true(digest==mirror["sha256"],"PDF changed without recorded provenance for "+pub["id"])
        assert_true(mirror["doi"]==pub["doi"],
                    "PDF's current or preserved version DOI disagrees for "+pub["id"])

    root=ET.parse(ROOT/"sitemap.xml").getroot()
    ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs={url.findtext("s:loc",namespaces=ns) for url in root.findall("s:url",ns)}
    assert_true(len(locs)>=56,"Current Fieldflux sitemap unexpectedly incomplete")
    assert_true(len(locs)==len(root.findall("s:url",ns)),"Duplicate sitemap URLs")
    origin="https://fieldfluxbiosystems.com/"
    for pub in active_pubs:
        for path in (pub["href"],pub["pdf"]):
            assert_true(origin+path in locs,"Active Health paper absent from sitemap: "+path)
            content=(ROOT/pub["href"]).read_text(encoding="utf-8")
            assert_true('content="noindex' not in content,
                        "Active Health paper unexpectedly deindexed: "+pub["id"])
    archived_pages={x["href"] for x in old_pubs}
    archived_pages|={x["landing_page"] for x in historic["series"]}
    archived_pages|={"research-theme-"+t+".html" for t in HISTORICAL_THEMES}
    archived_assets={x["pdf"] for x in old_pubs}
    for path in archived_pages:
        html=(ROOT/path).read_text(encoding="utf-8")
        assert_true('name="robots" content="noindex, follow"' in html,
                    "Retained historical scholarly page still indexable on FFB: "+path)
        assert_true("instituteluxconsilio.org" in html,
                    "Historical page lacks the canonical scholarly institution: "+path)
        assert_true(origin+path not in locs,
                    "Legacy scholarly page unexpectedly in FFB sitemap: "+path)
    for path in archived_assets:
        assert_true(origin+path not in locs,
                    "Historical PDF unexpectedly in FFB discovery sitemap: "+path)
    assert_true(ILC in active.get("canonical_institute",""),
                "FFB no longer declares ILC as broader research archive")
    print("PASS: six active Health papers, twenty integrity-pinned historic scholarly copies,"
          " thirty-two noindex historical HTML routes and FFB-only publication discovery")

if __name__=="__main__":
    check()
