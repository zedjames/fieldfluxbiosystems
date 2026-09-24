#!/usr/bin/env python3
"""
Fieldflux / Concordia Lean source attestation.

This attestation deliberately records two different scopes:

1. SOURCE INVENTORY — every physical *.lean file recursively under --root.
   Counts, source-scan diagnostics, and the manifest digest apply to that source
   population only.
2. BUILD TARGET — the named Lean target supplied by CI (currently QpciLean).
   A green build establishes kernel acceptance for that target's import/library
   closure only. It does not imply that every file in the recursive source
   inventory was compiled.

Per-theorem #print axioms receipts are supplied separately by the CI workflow.
Those theorem-level dependency receipts must not be conflated with a lexical
count of source-level axiom declarations.

Usage:
  compute_attestation.py --root lean --out attestation.json \
      [--commit SHA] [--timestamp ISO8601] [--toolchain STR] \
      [--build-status passed|failed] [--core-axioms core_axioms.json] [--enforce]
"""
import argparse
import hashlib
import json
import os
import re
import sys

DECL_RE = re.compile(
    r'^[ \t]*(?:@\[[^\]]*\][ \t]*)*'
    r'(?:(?:private|protected|public|noncomputable|nonrec|nonrecursive|scoped|local|partial|unsafe|meta)[ \t]+)*'
    r'(theorem|lemma|def)\b',
    re.M,
)
AXIOM_RE = re.compile(
    r'^[ \t]*(?:@\[[^\]]*\][ \t]*)*'
    r'(?:(?:private|protected|public|noncomputable|nonrec|nonrecursive|scoped|local|unsafe|meta)[ \t]+)*'
    r'axiom\s+[A-Za-z_]',
    re.M,
)


def mask_comments_and_strings(t: str) -> str:
    """Replace Lean comments and strings with spaces while preserving newlines."""
    out = list(t)
    i, n, st, depth = 0, len(t), "code", 0
    while i < n:
        c = t[i]
        nx = t[i + 1] if i + 1 < n else ""
        if st == "code":
            if c == "-" and nx == "-":
                out[i] = out[i + 1] = " "
                i += 2
                st = "line"
                continue
            if c == "/" and nx == "-":
                out[i] = out[i + 1] = " "
                i += 2
                st = "block"
                depth = 1
                continue
            if c == '"':
                out[i] = " "
                i += 1
                st = "string"
                continue
            i += 1
        elif st == "line":
            if c == "\n":
                st = "code"
            else:
                out[i] = " "
            i += 1
        elif st == "block":
            if c == "/" and nx == "-":
                out[i] = out[i + 1] = " "
                depth += 1
                i += 2
                continue
            if c == "-" and nx == "/":
                out[i] = out[i + 1] = " "
                depth -= 1
                i += 2
                if depth == 0:
                    st = "code"
                continue
            if c != "\n":
                out[i] = " "
            i += 1
        else:  # string
            if c == "\\":
                out[i] = " "
                if i + 1 < n:
                    if out[i + 1] != "\n":
                        out[i + 1] = " "
                    i += 2
                else:
                    i += 1
                continue
            if c == '"':
                out[i] = " "
                st = "code"
            elif c != "\n":
                out[i] = " "
            i += 1
    return "".join(out)


def real_sorries(t: str) -> int:
    """Count code-level 'sorry' tokens after comments and strings are masked."""
    code = mask_comments_and_strings(t)
    return len(re.findall(r"(?<![A-Za-z0-9_])sorry(?![A-Za-z0-9_])", code))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="lean")
    ap.add_argument("--out", default="attestation.json")
    ap.add_argument("--commit", default="")
    ap.add_argument("--timestamp", default="")
    ap.add_argument("--toolchain", default="")
    ap.add_argument("--build-status", default="unknown")
    ap.add_argument("--core-axioms", default="")
    ap.add_argument(
        "--enforce",
        action="store_true",
        help=(
            "legacy optional gate: exit non-zero if the recursive source scan "
            "contains literal project axiom declarations or real sorry tokens; "
            "this is not a theorem-dependency axiom audit"
        ),
    )
    a = ap.parse_args()

    paths = []
    for dp, _, fn in os.walk(a.root):
        for f in fn:
            if f.endswith(".lean"):
                paths.append(os.path.join(dp, f).replace(os.sep, "/"))
    paths.sort()

    lines = thms = lems = defs = source_axioms = sorries = 0
    by_tier = {}
    manifest = []

    for p in paths:
        with open(p, "rb") as fh:
            raw = fh.read()
        t = raw.decode("utf-8", errors="ignore")
        code = mask_comments_and_strings(t)

        lines += t.count("\n") + (1 if t and not t.endswith("\n") else 0)
        decls = DECL_RE.findall(code)
        for kw in decls:
            if kw == "theorem":
                thms += 1
            elif kw == "lemma":
                lems += 1
            else:
                defs += 1

        source_axioms += len(AXIOM_RE.findall(code))
        sorries += real_sorries(t)

        rel = p[len(a.root) + 1 :]
        m = re.match(r"(Tier\d+)", rel)
        bucket = m.group(1) if m else "other"
        by_tier[bucket] = by_tier.get(bucket, 0) + sum(
            1 for k in decls if k in ("theorem", "lemma")
        )
        manifest.append(f"{hashlib.sha256(raw).hexdigest()}  {p}\n")

    def tier_key(k: str):
        mm = re.match(r"Tier(\d+)", k)
        return (0, int(mm.group(1))) if mm else (1, 0)

    by_tier = {k: by_tier[k] for k in sorted(by_tier, key=tier_key)}

    manifest_text = "".join(manifest)
    root_digest = hashlib.sha256(manifest_text.encode("utf-8")).hexdigest()

    core = []
    if a.core_axioms and os.path.exists(a.core_axioms):
        with open(a.core_axioms, encoding="utf-8") as fh:
            core = json.load(fh)

    inventory = {
        "files": len(paths),
        "lines": lines,
        "theorems": thms,
        "lemmas": lems,
        "definitions": defs,
        "theorems_plus_lemmas": thms + lems,
    }

    source_scan = {
        "axiom_declarations": source_axioms,
        "sorries": sorries,
        "axiom_declaration_free": source_axioms == 0,
        "sorry_free": sorries == 0,
    }

    att = {
        "schema": "fieldflux-corpus-attestation/v2",
        "commit": a.commit,
        "timestamp": a.timestamp,
        "toolchain": a.toolchain,
        "scopes": {
            "source_inventory": f"recursive physical *.lean files under {a.root}/",
            "build": "named Lean build target and its dependency closure only",
            "theorem_axioms": "designated theorem #print axioms receipts only",
        },
        "build": {
            "target": "QpciLean",
            "status": a.build_status,
            "scope_note": (
                "A passed build applies to QpciLean and its imported dependency "
                "closure; it is not a repository-wide compile claim."
            ),
        },
        "source_inventory": inventory,
        "corpus": inventory,  # legacy site-consumer alias
        "source_scan": source_scan,
        "invariants": {
            "source_axiom_declarations": source_axioms,
            "source_sorries": sorries,
            "source_axiom_declaration_free": source_axioms == 0,
            "source_sorry_free": sorries == 0,
            # Legacy keys retained for existing site renderers. Their scope is
            # the recursive lexical source scan, not theorem dependency axioms.
            "project_axioms": source_axioms,
            "sorries": sorries,
            "axiom_free": source_axioms == 0,
            "sorry_free": sorries == 0,
            "scope_note": (
                "Lexical scan of the recursive source inventory. Use "
                "core_theorem_axioms for theorem dependency footprints."
            ),
        },
        "digest": {
            "scope": "source_inventory",
            "method": (
                "sha256 of the sorted per-file raw-byte sha256 manifest "
                "('<sha256>  <path>' lines, paths byte-sorted, root = sha256 "
                "of the manifest)"
            ),
            "root": root_digest,
        },
        "core_theorem_axioms": core,
        "by_tier_theorems_lemmas": by_tier,
        "notes": (
            "Source inventory, named build status, theorem dependency receipts, "
            "scientific interpretation, and empirical validity are distinct "
            "scopes. This attestation does not establish physiological or "
            "clinical validity."
        ),
    }

    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(att, fh, indent=2)
        fh.write("\n")

    print(
        f"files={len(paths)} lines={lines} theorems={thms} lemmas={lems} "
        f"defs={defs} source_axiom_declarations={source_axioms} sorries={sorries}"
    )
    print(f"root_digest={root_digest}")
    print(f"wrote {a.out}")

    if a.enforce and (source_axioms > 0 or sorries > 0):
        print(
            "ENFORCE FAIL: recursive source scan contains "
            f"axiom_declarations={source_axioms} sorries={sorries}",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
