#!/usr/bin/env python3
"""
Run `#print axioms` on the designated core theorems and emit their axiom
footprints as JSON. Runs *inside* the built Lean environment (after `lake build`).

Input list: docs/verification/core_theorems.txt — one theorem per line:
    <ModulePath>   <Fully.Qualified.theoremName>
Blank lines and lines starting with '#' are ignored. If no theorems are listed
yet, this writes an empty list and exits 0 (the rest of the attestation stands
on its own; per-theorem footprints are additive detail).

Output: JSON array of {theorem, axioms:[...]} (axioms == [] means it depends on
none beyond the kernel's built-ins; the clean set is propext/Classical.choice/Quot.sound).
"""
import argparse, json, os, re, subprocess, sys, tempfile

DEP_RE = re.compile(r"'([^']+)' depends on axioms: \[([^\]]*)\]")
NONE_RE = re.compile(r"'([^']+)' does not depend on any axioms")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', default='docs/verification/core_theorems.txt')
    ap.add_argument('--out', default='core_axioms.json')
    a = ap.parse_args()

    modules, theorems = [], []
    if os.path.exists(a.list):
        for line in open(a.list, encoding='utf-8'):
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            parts = s.split()
            if len(parts) >= 2:
                modules.append(parts[0]); theorems.append(parts[1])

    if not theorems:
        json.dump([], open(a.out, 'w')); print("no core theorems designated yet — wrote []")
        return 0

    query = ''.join(f"import {m}\n" for m in dict.fromkeys(modules))
    query += ''.join(f"#print axioms {t}\n" for t in theorems)
    with tempfile.NamedTemporaryFile('w', suffix='.lean', dir='.', delete=False) as fh:
        fh.write(query); qpath = fh.name
    try:
        proc = subprocess.run(['lake', 'env', 'lean', qpath],
                              capture_output=True, text=True, timeout=1800)
        out = proc.stdout + '\n' + proc.stderr
    finally:
        os.unlink(qpath)

    found = {}
    for m in DEP_RE.finditer(out):
        found[m.group(1)] = [x.strip() for x in m.group(2).split(',') if x.strip()]
    for m in NONE_RE.finditer(out):
        found[m.group(1)] = []

    results = []
    for t in theorems:
        short = t.split('.')[-1]
        axs = found.get(t, found.get(short))
        if axs is None:
            results.append({"theorem": t, "axioms": None, "error": "not resolved (check module/name)"})
        else:
            results.append({"theorem": t, "axioms": axs})
    json.dump(results, open(a.out, 'w'), indent=2)
    print(f"wrote {a.out} with {len(results)} core-theorem footprints")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
