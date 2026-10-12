#!/usr/bin/env python3
"""Guard the public prospective-Health definition gateway and SEO discovery."""
from __future__ import annotations
import json
import re
import xml.etree.ElementTree as ET
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://fieldfluxbiosystems.com"
GATEWAY = "definition-of-health.html"
UPDATED = {
    "/", "/definition-of-health.html", "/index.html",
    "/understanding-health.html", "/understanding-health-01.html",
    "/research.html", "/research-series-health-formally-defined.html",
    "/research-constitutive-continuation-capacity.html",
}
LINK_FROM = [
    "index.html", "understanding-health.html", "understanding-health-01.html",
    "research.html", "research-series-health-formally-defined.html",
    "research-constitutive-continuation-capacity.html",
]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.anchors, self.hrefs, self.scripts = [], [], [], []
        self.h1 = 0
    def handle_starttag(self, name, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        if name == "a":
            if a.get("href"): self.hrefs.append(a["href"])
        if name == "h1": self.h1 += 1
        if name == "link" and a.get("rel") == "canonical": self.anchors.append(a.get("href"))
        if name == "script" and a.get("type") == "application/ld+json": self.scripts.append(True)

def must(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)

def main() -> None:
    text = (ROOT / GATEWAY).read_text(encoding="utf-8")
    page = Page()
    page.feed(text)
    must(page.h1 == 1, "Gateway must have exactly one H1")
    must(len(page.ids) == len(set(page.ids)), "Duplicate gateway ID")
    must(page.anchors == [ORIGIN + "/definition-of-health.html"], "Gateway canonical invalid")
    must('name="robots" content="index, follow"' in text, "Gateway must be indexable")
    must('assets/css/definition-of-health.css?v=1' in text, "Gateway stylesheet absent")
    must((ROOT / "assets/css/definition-of-health.css").is_file(), "Gateway stylesheet not found")
    must('<math ' in text and text.count('<math ') == text.count("</math>"), "Gateway native MathML absent")
    must(all(x in text for x in (
        "definition of health", "prospective", "Constitutive Continuation Capacity",
        "zenodo.23131157", "www.who.int/about/governance/constitution/",
        "understanding-health-01.html", "research-series-health-formally-defined.html",
        "measuring", "validation",
    )), "Required explanation, sources or links missing")
    must(all(h[1:] in page.ids for h in page.hrefs if h.startswith("#")), "Broken gateway anchor")
    internal = [h.split("#",1)[0].split("?",1)[0] for h in page.hrefs
                if h and not h.startswith(("https://","http://","mailto:","#"))]
    must(all((ROOT / h).exists() for h in internal), "Gateway contains nonexistent internal link")

    match = re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', text)
    must(match is not None, "Gateway Article structured data absent")
    article = json.loads(match.group(1))
    must(article.get("@type") == "Article", "Incorrect gateway schema")
    must(article.get("mainEntityOfPage",{}).get("@id") == page.anchors[0], "Schema canonical differs")
    must("2026-10-11" <= article.get("dateModified",""), "Schema modification date stale")
    must(article.get("author",{}).get("name") == "Zed James", "Authorship missing")
    must(article.get("image",{}).get("url") == ORIGIN + "/assets/img/og-card.png", "Article illustration metadata missing")

    for path in LINK_FROM:
        src = (ROOT / path).read_text(encoding="utf-8")
        must('href="definition-of-health.html"' in src, f"{path} must link to definition")

    home = (ROOT / "index.html").read_text(encoding="utf-8")
    home_schema = re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', home)
    must(home_schema is not None, "Homepage Organization schema absent")
    graph = json.loads(home_schema.group(1)).get("@graph",[])
    must({"Organization","WebSite"} <= {x.get("@type") for x in graph},
         "Homepage must identify organization and website")

    root = ET.parse(ROOT / "sitemap.xml").getroot()
    ns = {"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = {}
    for item in root.findall("s:url",ns):
        loc = item.findtext("s:loc",namespaces=ns)
        must(loc and loc.startswith(ORIGIN+"/"), "Noncanonical sitemap URL")
        must(loc not in urls, f"Duplicate sitemap URL: {loc}")
        parsed = urlsplit(loc)
        if parsed.path and parsed.path != "/":
            must((ROOT / parsed.path.lstrip("/")).exists(), f"Sitemap file missing: {loc}")
        lm = item.findtext("s:lastmod",namespaces=ns)
        if lm: date.fromisoformat(lm)
        urls[loc] = lm
    must(len(urls) >= 56, "Sitemap unexpectedly dropped active Fieldflux pages")
    for path in UPDATED - {"/index.html"}:
        url = ORIGIN + path
        must(url in urls, f"Key URL missing from sitemap: {url}")
        must(urls[url] is not None and urls[url] >= "2026-10-11",
             f"Modified page should have a factual lastmod date: {url}")
    must(not re.search(r"<(?:priority|changefreq)>", (ROOT / "sitemap.xml").read_text()),
         "Google ignores sitemap priority and changefreq; avoid these stale hints")
    print(f"PASS: formal definition gateway, scholarly sources, 6 inbound links, "
          f"Organization schema and {len(urls)} unique canonical sitemap URLs")

if __name__ == "__main__":
    main()
