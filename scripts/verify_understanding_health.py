#!/usr/bin/env python3
"""Validate the published Understanding Health reading room and its static lessons."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"learning"/"lessons.json"
SITE="https://fieldfluxbiosystems.com/"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set()
        self.urls=[]
        self.tags=set()
        self.meta={}
        self.title_count=0
        self.canonical=[]
    def handle_starttag(self,tag,attrs):
        self.tags.add(tag)
        a=dict(attrs)
        if a.get("id"): self.ids.add(a["id"])
        for attr in ("href","src"):
            if a.get(attr):self.urls.append((attr,a[attr]))
        if tag=="title":self.title_count+=1
        if tag=="meta" and a.get("name"):
            self.meta[a["name"]]=a.get("content","")
        if tag=="link" and a.get("rel")=="canonical":
            self.canonical.append(a.get("href",""))

def check(cond,msg,errors):
    if not cond:errors.append(msg)

def main():
    errors=[]
    manifest=json.loads(MANIFEST.read_text(encoding="utf8"))
    lessons=manifest["lessons"]
    check(manifest["publishedCount"]==len(lessons),"manifest count mismatch",errors)
    check([x["number"] for x in lessons]==list(range(1,len(lessons)+1)),"lesson numbers must be consecutive",errors)
    check(len({x["slug"] for x in lessons})==len(lessons),"duplicate lesson slugs",errors)
    pages=["understanding-health.html"]+[x["slug"] for x in lessons]
    parser_by_page={}
    for page in pages:
        target=ROOT/page
        check(target.exists(),page+": missing HTML",errors)
        if not target.exists():continue
        html=target.read_text(encoding="utf8")
        p=PageParser();p.feed(html)
        parser_by_page[page]=p
        check(html.lstrip().lower().startswith("<!doctype html>"),page+": missing doctype",errors)
        check(p.title_count==1,page+": exactly one HTML title required",errors)
        check("main" in p.tags and "main" in p.ids,page+": identifiable main region required",errors)
        check(p.canonical==[SITE+page],page+": canonical URL mismatch",errors)
        check(bool(p.meta.get("description")),page+": search description absent",errors)
        check(bool(p.meta.get("robots")),page+": explicit indexing policy absent",errors)
        check("assets/css/understanding-health.css?v=1" in html,page+": shared learning stylesheet missing",errors)
        for attr,url in p.urls:
            parsed=urlsplit(url)
            if parsed.scheme or url.startswith(("//","mailto:","tel:","data:")):continue
            if parsed.path and not (ROOT/parsed.path.lstrip("/")).is_file():
                errors.append(page+": broken local "+attr+"="+url)
            if parsed.fragment and not parsed.path and parsed.fragment not in p.ids:
                errors.append(page+": nonexistent anchor #"+parsed.fragment)
        check("research-series-health-formally-defined.html" in html or "research-constitutive-continuation-capacity.html" in html or "research-constitutive-continuation-capacity.pdf" in html,
              page+": absent route to original scholarship",errors)
    hub=(ROOT/"understanding-health.html").read_text(encoding="utf8")
    for lesson in lessons:
        page=lesson["slug"]
        html=(ROOT/page).read_text(encoding="utf8")
        check(page in hub,"hub omits published "+page,errors)
        check(lesson["sourcePdf"] in html,page+": no on-site full paper PDF",errors)
        check(lesson["sourceDoi"] in html,page+": no archival source DOI",errors)
        check("by Zed James" in html.lower() or "By Zed James" in html or "Zed James" in html,page+": first-person attribution absent",errors)
        check("the author begins" not in html.lower(),page+": external narrator voice slipped in",errors)
    first=(ROOT/"understanding-health-01.html").read_text(encoding="utf8")
    check("<math " in first and "<msub>" in first,"Lesson 1 requires accessible native equation",errors)
    check('data-ulh-outcome="short"' in first and 'data-ulh-outcome="long"' in first,"Horizon comparison missing",errors)
    check('data-ulh-requirement="stable"' in first and 'data-ulh-requirement="any"' in first,"Requirement selector missing",errors)
    check("The symbol" in first and "if and only if" in first,"Mathematical symbols lack interpretation",errors)
    check("not measured probabilities" in first,"Finite model scope qualification missing",errors)
    for route in ("index.html","research.html","research-series-health-formally-defined.html"):
        html=(ROOT/route).read_text(encoding="utf8")
        check("understanding-health.html" in html,route+": learning room link missing",errors)
    sitemap=(ROOT/"sitemap.xml").read_text(encoding="utf8")
    for page in pages:
        check(SITE+page in sitemap,"sitemap omits "+page,errors)
    if errors:
        print("Understanding Health validation FAILED",file=sys.stderr)
        for x in errors:print(" - "+x,file=sys.stderr)
        return 1
    print("Understanding Health validated: "+str(len(lessons))+" lesson(s), indexed static pages, full-source links and interactive example.")
    return 0

if __name__=="__main__":
    sys.exit(main())
