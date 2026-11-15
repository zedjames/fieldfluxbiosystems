#!/usr/bin/env python3
"""Validate bilingual Health-series edition identity, discoverability, and DOI links."""
from __future__ import annotations
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
SITE="ilc" if (ROOT/"assets/data/research.js").exists() else "ffb"
SOURCE=json.loads((ROOT/"research/health-zh-editions.json").read_text(encoding="utf-8"))
PAPERS=SOURCE["records"]
assert len(PAPERS)==7
assert [p["order"] for p in PAPERS]==list(range(1,8))
assert [p["id"] for p in PAPERS]==[f"hfd{i}" for i in range(1,8)]
assert len({p["chineseDoi"] for p in PAPERS})==7
assert SOURCE["language"]=="zh-Hans"
for p in PAPERS:
    assert re.fullmatch(r"10[.]5281/zenodo[.][0-9]+",p["chineseDoi"])
    assert re.fullmatch(r"10[.]5281/zenodo[.][0-9]+",p["englishDoi"])
    assert p["chineseDoi"]!=p["englishDoi"]
    assert p["chinesePage"]==f"publication-{p['id']}-zh.html"
    assert p["englishPage"]==f"publication-{p['id']}.html"
    assert p["language"]=="zh-Hans"
    assert p["editionDate"] in ("2026-11-13","2026-11-14")
    assert p["editionStatus"]==("publication-candidate" if p["id"]=="hfd1" else "published-edition")

catalog=json.loads((ROOT/"research/catalog.json").read_text(encoding="utf-8"))
current=catalog["publications"] if SITE=="ilc" else [x for x in catalog["items"] if x.get("collection")=="publications"]
health=sorted((x for x in current if (x.get("seriesId") or x.get("series"))=="health-formally-defined"),key=lambda p:p["order"])
assert len(health)==7 and [p["id"] for p in health]==[p["id"] for p in PAPERS], "Chinese editions must not add numbered papers"
assert all(next(x for x in health if x["id"]==p["id"])["doi"]==p["englishDoi"] for p in PAPERS)
site_origin="https://instituteluxconsilio.org/" if SITE=="ilc" else "https://fieldfluxbiosystems.com/"
index="research-health-formally-defined-zh.html"
html=(ROOT/index).read_text(encoding="utf-8")
assert '<html lang="zh-Hans">' in html
assert 'hreflang="en"' in html and 'hreflang="zh-Hans"' in html
assert "application/ld+json" in html
assert 'rel="canonical"' in html and site_origin+index in html

sitemap=ET.parse(ROOT/"sitemap.xml").getroot()
ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
locs=[e.findtext("s:loc",namespaces=ns) for e in sitemap.findall("s:url",ns)]
assert len(locs)==len(set(locs)), "Duplicate sitemap paths"
assert site_origin+index in locs
for p in PAPERS:
    assert p["titleZh"] in html and p["chineseDoi"] in html, "Index entry incomplete: "+p["id"]
    if SITE=="ilc":
        ch=(ROOT/p["chinesePage"]).read_text(encoding="utf-8")
        en=(ROOT/p["englishPage"]).read_text(encoding="utf-8")
        assert '<html lang="zh-Hans">' in ch
        assert p["titleZh"] in ch and p["summaryZh"] in ch
        assert 'name="citation_doi" content="'+p["chineseDoi"]+'"' in ch
        assert 'name="citation_language" content="zh-Hans"' in ch
        assert 'translationOfWork' in ch
        assert 'hreflang="en"' in ch and 'hreflang="zh-Hans"' in ch
        assert p["englishDoi"] in ch and p["chineseDoi"] in en
        assert 'href="'+p["chinesePage"]+'"' in en
        assert 'hreflang="zh-Hans"' in en and 'hreflang="en"' in en
        assert site_origin+p["chinesePage"] in locs
    else:
        en=(ROOT/p["fieldfluxEnglishPage"]).read_text(encoding="utf-8")
        assert p["chineseDoi"] in en and p["titleZh"] in en
        assert "https://instituteluxconsilio.org/"+p["chinesePage"] in en

if SITE=="ilc":
    data=(ROOT/"assets/data/research.js").read_text(encoding="utf-8").strip()
    assert data.startswith("window.ILC_DATA=")
    js=json.loads(data.removeprefix("window.ILC_DATA=").removesuffix(";"))
    assert catalog["healthTranslations"]==js["healthTranslations"]
    assert [p["chineseDoi"] for p in PAPERS]==[x["chineseDoi"] for x in catalog["healthTranslations"]]
    eng=(ROOT/"research-health-formally-defined.html").read_text(encoding="utf-8")
else:
    assert [x["doi"] for x in catalog["health_translations"]]==[p["chineseDoi"] for p in PAPERS]
    eng=(ROOT/"research-series-health-formally-defined.html").read_text(encoding="utf-8")
assert site_origin+index in eng and 'hreflang="zh-Hans"' in eng
print(f"PASS: {SITE} seven paired Health papers, Chinese scholarly URLs, distinct edition DOIs, bilingual links and sitemap")
