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
        check("assets/css/understanding-health.css?v=4" in html,page+": updated shared learning stylesheet missing",errors)
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
    # Each published lesson is reachable from the library and neighbors;
    # the first and last link to actual pages, never a future placeholder.
    for index,lesson in enumerate(lessons):
        page=lesson["slug"]
        current=(ROOT/page).read_text(encoding="utf8")
        if index>0:
            previous=lessons[index-1]["slug"]
            check(lesson.get("previous")==previous,page+": manifest previous link incorrect",errors)
            check(previous in current,page+": no previous-lesson navigation",errors)
        if index<len(lessons)-1:
            next_page=lessons[index+1]["slug"]
            check(lesson.get("next")==next_page,page+": manifest next link incorrect",errors)
            check(next_page in current,page+": no next-lesson navigation",errors)
        else:
            check(not lesson.get("next"),page+": should not link to unpublished next chapter",errors)
        check("understanding-health.html" in current,page+": no library return link",errors)
    # The second chapter covers filtering and the downstream capacity collector,
    # with three accessible equations and explicit attribution of Paper IV's
    # candidate-lawfulness encoding.
    second=(ROOT/"understanding-health-02.html").read_text(encoding="utf8")
    check(second.count("<math ")==3,"Lesson 2 should render three MathML equations",errors)
    check("Paper IV" in second and "candidate-lawfulness" in second,"Lesson 2 needs precise forest-model attribution",errors)
    check("only the continuing history is viable" in second,"Lesson 2 must state its no-quiz illustrative answer",errors)
    third=(ROOT/"understanding-health-03.html").read_text(encoding="utf8")
    check(third.count("<math ")==3,"Lesson 3 must contain three accessible MathML formulas",errors)
    check('data-ulh-quotient-view="base"' in third and 'data-ulh-quotient-view="extended"' in third,
          "Lesson 3 needs both original and expanded query groupings",errors)
    check('data-ulh-quotient="extended"' in third and 'data-ulh-quotient="base"' in third,
          "Lesson 3 interactive selectors absent",errors)
    check('data-ulh-quotient-view="extended" class="ulh-quotient-group-grid ulh-quotient-group-grid--four"' in third,
          "Expanded quotient must expose four classes",errors)
    check("present realization" in third.lower() and "not measurements" in third,
          "Lesson 3 must distinguish full Health and illustrative capacity",errors)
    check("research-constitutive-continuation-capacity.pdf" in third,
          "Lesson 3 must link to full source PDF",errors)
    check('rel="next" href="https://fieldfluxbiosystems.com/understanding-health-03.html"' in
          (ROOT/"understanding-health-02.html").read_text(encoding="utf8"),
          "Lesson 2 next metadata not pointing to Lesson 3",errors)
    check('rel="prev" href="https://fieldfluxbiosystems.com/understanding-health-02.html"' in third,
          "Lesson 3 previous metadata not pointing to Lesson 2",errors)
    fourth=(ROOT/"understanding-health-04.html").read_text(encoding="utf8")
    check(fourth.count("<math ")==3,"Lesson 4 must include three accessible formal expressions",errors)
    check("∃" in fourth and "∀" in fourth,"Lesson 4 must unpack existential and universal claims",errors)
    check("positive successful-continuation information" in fourth and
          "present realization alone" in fourth.lower(),
          "Lesson 4 must preserve both distinct negative results",errors)
    check("ulh-robustness-pair" in fourth and "ulh-architecture__steps" in fourth,
          "Lesson 4 visual robustness example or final Paper-I sequence missing",errors)
    check("scientific" in fourth.lower() and "empirical" in fourth.lower(),
          "Lesson 4 must disclose formal and empirical authority",errors)
    check("research-constitutive-continuation-capacity.pdf" in fourth and
          "10.5281/zenodo.23131157" in fourth,
          "Lesson 4 full paper citation missing",errors)
    check('rel="next" href="https://fieldfluxbiosystems.com/understanding-health-04.html"' in
          (ROOT/"understanding-health-03.html").read_text(encoding="utf8"),
          "Lesson 3 does not link to Lesson 4 as next",errors)
    check('rel="prev" href="https://fieldfluxbiosystems.com/understanding-health-03.html"' in fourth,
          "Lesson 4 lacks previous link metadata",errors)
    fifth=(ROOT/"understanding-health-05.html").read_text(encoding="utf8")
    check(fifth.count("<math ")==4, "Lesson 5 needs four accessible MathML expressions",errors)
    check('data-ulh-stage-view="newborn"' in fifth and 'data-ulh-stage-view="adult"' in fifth,
          "Lesson 5 must show both licensed stage comparisons",errors)
    check('data-ulh-stage-choice="newborn"' in fifth and 'data-ulh-stage-choice="adult"' in fifth,
          "Lesson 5 stage-focus controls absent",errors)
    check("ulh-stage-capacities" in fifth and "ulh-stage-horizon" in fifth,
          "Lesson 5 must separate stage-only licensing from horizon-capacity change",errors)
    check("not a prescription" in fifth and "not clinical" in fifth.lower() or
          "clinical" in fifth.lower() and "mathematical" in fifth.lower(),
          "Lesson 5 stage labels must retain mathematical scope",errors)
    check("research-prospective-health-across-contexts.pdf" in fifth and
          "10.5281/zenodo.23146280" in fifth, "Lesson 5 source PDF or DOI missing",errors)
    check('rel="next" href="https://fieldfluxbiosystems.com/understanding-health-05.html"' in
          (ROOT/"understanding-health-04.html").read_text(encoding="utf8"),
          "Lesson 4 does not link forward to Lesson 5",errors)
    check('rel="prev" href="https://fieldfluxbiosystems.com/understanding-health-04.html"' in fifth,
          "Lesson 5 does not reference Lesson 4 as its predecessor",errors)
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
    print("Understanding Health validated: "+str(len(lessons))+" lessons, bidirectional navigation, exact source links, MathML and static reading.")
    return 0

if __name__=="__main__":
    sys.exit(main())
