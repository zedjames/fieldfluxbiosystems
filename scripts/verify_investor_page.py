#!/usr/bin/env python3
"""Regression checks for the standalone, script-independent investor page."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "investors.html"
CSS = ROOT / "assets/css/investor-stable.css"


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
    scan = Scan()
    scan.feed(source)

    assert source.lstrip().lower().startswith("<!doctype html>")
    assert len(scan.headings) == 1, "One clear investor-page heading is required"
    assert "investor-stable.css?v=1" in source
    assert "main" in scan.ids and "development" in scan.ids and "capital" in scan.ids
    assert not scan.scripts, "Investor page must remain usable without cascading script layers"
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
    for marker in (".inv-mobile-nav__links", "@media(max-width:640px)", ".inv-skip:focus"):
        assert marker in css, f"Missing responsive/accessibility rule: {marker}"
    assert css.count("{") == css.count("}"), "Investor CSS braces unbalanced"
    print("Investor page checks passed: static rendering, mobile navigation, five status cards, all local links.")


if __name__ == "__main__":
    main()
