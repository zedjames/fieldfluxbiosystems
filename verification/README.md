# Fieldflux — continuous corpus verification (open harness)

This folder is the **open-source verification harness** for the Fieldflux formal
corpus. The Lean source stays private; *how we measure and attest it* is public, so
the numbers we publish can be independently understood and reproduced.

## What gets attested

On every commit, our build re-runs the **Lean 4 kernel** over the shipping library
(`lake build QpciLean`). A green build *is* the proof that every derivation
type-checks — not a claim, a re-execution. The harness then records the resulting
facts to [`/attestation.json`](../attestation.json):

- file / line / theorem / lemma / definition counts,
- the two invariants — **`project_axioms = 0`** and **`sorries = 0`** (the build
  fails if either is violated),
- the corpus **root digest** (SHA-256), recomputed by the method in
  [`/verification.txt`](../verification.txt),
- and, per designated core theorem, its `#print axioms` footprint.

It attests the **formal artifact only** — build, counts, invariants, digest. It says
nothing about physiological or clinical validity; that is a separate, empirical
question.

## The files

| file | role |
|---|---|
| `compute_attestation.py` | counts + digest + invariant enforcement → `attestation.json` |
| `print_core_axioms.py` | runs `#print axioms` on the designated core theorems |
| `verify-attest.yml` | the GitHub Actions workflow (reference copy; it runs in our private build repo) |
| `core_theorems.txt` | the claim → theorem map fed to `#print axioms` |
| `publish_attestation.sh` | publishes `attestation.json` to the public sites |

## Trust model

Because the corpus is private, an outside party sees the *published* attestation,
not the raw build. Two things make that trustworthy without exposing source:

1. **Build provenance.** The workflow signs the attestation with GitHub's
   `attest-build-provenance`, proving it was produced by *this* workflow at *this*
   commit on GitHub's runners — not hand-authored.
2. **This open harness.** The scripts above are exactly what compute the numbers, so
   anyone can read them and confirm nothing is fudged. The one human step that
   remains is a one-time read of this harness; after that, provenance carries every
   future commit automatically.

A qualified reviewer under NDA can go further and reproduce the digest and build
against the source directly.
