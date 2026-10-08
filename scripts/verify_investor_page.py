#!/usr/bin/env python3
"""Regression checks for the stable investor page and shared site navigation."""
from html.parser import HTMLParser
import re
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "investors.html"
CSS = ROOT / "assets/css/investor-stable.css"
HOME = ROOT / "index.html"


class Scan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.links = []
        self.ids = set()
        self.headings = []
        self.styles = []
        self.scripts = []
        self.current_heading = False
        self.heading_text = ""
    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        self.elements.append((tag, attr))
        if "id" in attr:
            self.ids.add(attr["id"])
        if tag == "a":
            self.links.append(attr.get("href", ""))
        if tag == "link" and attr.get("rel") == "stylesheet":
            self.styles.append(attr.get("href", ""))
        if tag == "script":
            self.scripts.append(attr.get("src", "<inline>"))
        if tag == "h1":
            self.current_heading = True
            self.heading_text = ""
    def handle_data(self, data):
        if self.current_heading:
            self.heading_text += data
    def handle_endtag(self, tag):
        if tag == "h1" and self.current_heading:
            self.headings.append(self.heading_text.strip())
            self.current_heading = False


def main():
    source = PAGE.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    scan = Scan()
    scan.feed(source)

    assert source.lstrip().lower().startswith("<!doctype html>")
    assert len(scan.headings) == 1, "One clear investor-page heading is required"
    assert "investor-stable.css?v=2" in source
    assert "main" in scan.ids and "development" in scan.ids and "capital" in scan.ids
    assert scan.scripts == [], "Investor page must remain independent of the old field-map renderer"
    assert "fieldflux-nav-world-fixes.css" not in source
    assert "fieldflux-nav-world.js" not in source
    expected_navigation = ["platform.html", "products.html", "research.html", "about.html", "investors.html"]
    primary = re.search(r'<nav class="nav__links"[^>]*>(.*?)</nav>', source, re.DOTALL)
    assert primary, "Investor header is missing the canonical navigation"
    primary_links = re.findall(r'<a[^>]*href="([^"]+)"', primary.group(1))
    assert primary_links == expected_navigation, f"Investor navigation diverged: {primary_links}"
    home_nav = re.search(r'<nav class="nav__links"[^>]*>(.*?)</nav>', home, re.DOTALL)
    assert home_nav, "Homepage is missing its canonical navigation"
    assert re.findall(r'<a[^>]*href="([^"]+)"', home_nav.group(1)) == primary_links
    assert re.findall(r'<a[^>]*>([^<]+)</a>', home_nav.group(1)) == re.findall(r'<a[^>]*>([^<]+)</a>', primary.group(1))
    assert 'class="is-active" aria-current="page"' in primary.group(1)
    assert "ffx-fieldmap-ready" not in css and "ffx-nav-primary" not in css
    assert "ffx-risktrack" not in source and "ffx-page" not in source
    assert len([1 for t, a in scan.elements if t == "article" and "inv-stage" in a.get("class", "").split()]) == 5
    assert len([1 for t, _ in scan.elements if t == "details"]) >= 1
    assert 'class="inv-mobile-nav__links"' in source
    assert "Membrane Health" in source and "DRTT 2.0" in source and "Rev B" in source and "Bedside QPCI" in source
    assert "Q2 2027" in source and "36-month" in source
    for href in scan.links + scan.styles:
        if not href or href.startswith(("mailto:", "tel:", "https://", "http://")):
            continue
        parsed = urlparse(href)
        if not parsed.path:
            assert parsed.fragment in scan.ids, f"Unresolvable page anchor: {href}"
            continue
        target = (ROOT / unquote(parsed.path)).resolve()
        assert target.is_relative_to(ROOT.resolve()) and target.is_file(), f"Broken local link: {href}"
    for marker in (".inv-mobile-nav__links", "@media(max-width:640px)", ".inv-skip:focus", ".inv-page .nav__links a.is-active::after"):
        assert marker in css, f"Missing responsive/accessibility rule: {marker}"
    assert css.count("{") == css.count("}"), "Investor CSS braces unbalanced"
    print("Investor page checks passed: canonical five-link header, no legacy field-map, standalone content, mobile fallback, five status cards, and all local links.")


if __name__ == "__main__":
    main()
