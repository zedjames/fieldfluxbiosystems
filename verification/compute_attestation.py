#!/usr/bin/env python3
"""
Fieldflux corpus attestation — compute the IP-safe verification facts.

Emits a JSON attestation of the Lean 4 corpus: file/line/theorem/def counts,
the project-axiom and real-`sorry` invariants (both must be 0), and the corpus
root digest (recomputed by the same method as verification.txt). Runtime fields
(commit, timestamp, toolchain, build status, per-theorem `#print axioms`) are
passed in by the CI workflow, which runs *after* a green `lake build` — the build
itself is the kernel-level proof that every derivation checks.

This discloses only numbers, standard-axiom names, and a hash — never source,
definitions, or mechanism.

Usage:
  compute_attestation.py --root lean --out attestation.json \
      [--commit SHA] [--timestamp ISO8601] [--toolchain STR] \
      [--build-status passed|failed] [--core-axioms core_axioms.json] [--enforce]
"""
import argparse, hashlib, json, os, re, sys

THM_RE = re.compile(
    r'^[ \t]*(?:@\[[^\]]*\][ \t]*)*'
    r'(?:(?:private|protected|noncomputable|nonrec|scoped|local|partial|unsafe|meta)[ \t]+)*'
    r'(theorem|lemma|def)\b', re.M)
AXIOM_RE = re.compile(r'^\s*axiom\s+[A-Za-z_]', re.M)


def real_sorries(t: str) -> int:
    """Count `sorry` tokens that are actual code, not inside comments/strings.
    Lean block comments /- -/ nest; line comments are --; strings are "..."."""
    i, n, st, depth, count = 0, len(t), 'n', 0, 0
    while i < n:
        c = t[i]; nx = t[i + 1] if i + 1 < n else ''
        if st == 'n':
            if c == '-' and nx == '-': st = 'l'; i += 2; continue
            if c == '/' and nx == '-': st = 'b'; depth = 1; i += 2; continue
            if c == '"': st = 's'; i += 1; continue
            if t.startswith('sorry', i):
                p = t[i - 1] if i > 0 else ''; a = t[i + 5] if i + 5 < n else ''
                if not (p.isalnum() or p == '_') and not (a.isalnum() or a == '_'):
                    count += 1; i += 5; continue
            i += 1
        elif st == 'l':
            if c == '\n': st = 'n'
            i += 1
        elif st == 'b':
            if c == '/' and nx == '-': depth += 1; i += 2; continue
            if c == '-' and nx == '/':
                depth -= 1
                if depth == 0: st = 'n'
                i += 2; continue
            i += 1
        else:  # string
            if c == '\\': i += 2; continue
            if c == '"': st = 'n'
            i += 1
    return count


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='lean')
    ap.add_argument('--out', default='attestation.json')
    ap.add_argument('--commit', default='')
    ap.add_argument('--timestamp', default='')
    ap.add_argument('--toolchain', default='')
    ap.add_argument('--build-status', default='unknown')
    ap.add_argument('--core-axioms', default='')
    ap.add_argument('--enforce', action='store_true',
                    help='exit non-zero if project axioms or real sorries are found')
    a = ap.parse_args()

    paths = []
    for dp, _, fn in os.walk(a.root):
        for f in fn:
            if f.endswith('.lean'):
                paths.append(os.path.join(dp, f).replace(os.sep, '/'))
    paths.sort()  # ASCII paths → byte order == LC_ALL=C

    lines = thms = lems = defs = axioms = sorries = 0
    by_tier = {}
    manifest = []
    for p in paths:
        with open(p, encoding='utf-8', errors='ignore') as fh:
            t = fh.read()
        lines += t.count('\n') + (1 if t and not t.endswith('\n') else 0)
        kws = THM_RE.findall(t)
        for kw in kws:
            if kw == 'theorem': thms += 1
            elif kw == 'lemma': lems += 1
            else: defs += 1
        axioms += len(AXIOM_RE.findall(t))
        sorries += real_sorries(t)
        # roll theorems+lemmas up by tier number (TierN.lean, TierN/…, TierN_Foo → TierN)
        rel = p[len(a.root) + 1:]
        m = re.match(r'(Tier\d+)', rel)
        bucket = m.group(1) if m else 'other'
        by_tier[bucket] = by_tier.get(bucket, 0) + sum(1 for k in kws if k in ('theorem', 'lemma'))
        manifest.append(f"{hashlib.sha256(t.encode('utf-8')).hexdigest()}  {p}\n")

    def _tierkey(k):
        mm = re.match(r'Tier(\d+)', k)
        return (0, int(mm.group(1))) if mm else (1, 0)
    by_tier = {k: by_tier[k] for k in sorted(by_tier, key=_tierkey)}

    manifest_text = ''.join(manifest)
    root_digest = hashlib.sha256(manifest_text.encode('utf-8')).hexdigest()

    core = []
    if a.core_axioms and os.path.exists(a.core_axioms):
        with open(a.core_axioms, encoding='utf-8') as fh:
            core = json.load(fh)

    att = {
        "schema": "fieldflux-corpus-attestation/v1",
        "commit": a.commit,
        "timestamp": a.timestamp,
        "toolchain": a.toolchain,
        "build": {"target": "QpciLean", "status": a.build_status},
        "corpus": {
            "files": len(paths),
            "lines": lines,
            "theorems": thms,
            "lemmas": lems,
            "definitions": defs,
            "theorems_plus_lemmas": thms + lems,
        },
        "invariants": {
            "project_axioms": axioms,
            "sorries": sorries,
            "axiom_free": axioms == 0,
            "sorry_free": sorries == 0,
        },
        "digest": {
            "method": "sha256 of the sorted per-file sha256 manifest "
                      "('<sha256>  <path>' lines, paths byte-sorted, root = sha256 of the manifest)",
            "root": root_digest,
        },
        "core_theorem_axioms": core,
        "by_tier_theorems_lemmas": by_tier,
        "notes": "Attests the formal artifact only (build, counts, invariants, digest); "
                 "not physiological or clinical validity. Counts use a line-anchored "
                 "declaration match; invariants use a comment-aware scan.",
    }

    with open(a.out, 'w', encoding='utf-8') as fh:
        json.dump(att, fh, indent=2)
        fh.write('\n')

    print(f"files={len(paths)} lines={lines} theorems={thms} lemmas={lems} "
          f"defs={defs} axioms={axioms} sorries={sorries}")
    print(f"root_digest={root_digest}")
    print(f"wrote {a.out}")

    if a.enforce and (axioms > 0 or sorries > 0):
        print(f"ENFORCE FAIL: project_axioms={axioms} sorries={sorries} (both must be 0)",
              file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
