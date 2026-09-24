# Fieldflux — continuous formal verification harness

This folder is the **open verification harness** used to publish IP-safe facts
about the private Fieldflux / Concordia Lean corpus. The source remains private;
the measurement and attestation method is public.

## Scope model

The current repository keeps four things separate:

1. **Source inventory.** Every tracked `*.lean` file present under the measured
   `lean/` tree.
2. **Build scope.** A named Lean target such as `QpciLean` and the dependency
   closure actually reached by that build.
3. **Theorem authority.** Named theorem statements and their actual
   `#print axioms` footprints.
4. **Scientific / empirical authority.** Interpretation and observed validity,
   which are not created by a Lean build.

A green `lake build QpciLean` establishes that the addressed build target and
its imported dependency closure type-check. It is **not** a claim that every file
in the recursive source inventory was compiled.

The current measured full-source inventory and its date/commit are published in
[`/verification.txt`](../verification.txt).

## What the attestation records

The harness emits `attestation.json` with:

- a recursive source inventory (files, lines, theorem/lemma/definition counts);
- a source-inventory manifest digest;
- the status and identity of the named build target;
- lexical source-scan counts for literal project `axiom` declarations and real
  `sorry` tokens, explicitly labeled as source-scan facts;
- per-designated-theorem `#print axioms` receipts.

The source scan and theorem dependency audit are different measurements. A
source file can mention or declare an axiom without that declaration being a
dependency of a particular theorem; conversely ordinary logical axioms reported
by `#print axioms` are not project source declarations.

## The files

| file | role |
|---|---|
| `compute_attestation.py` | source inventory + digest + scoped source diagnostics → `attestation.json` |
| `print_core_axioms.py` | runs `#print axioms` on designated theorem surfaces |
| `verify-attest.yml` | reference CI workflow for the named build target and attestation |
| `core_theorems.txt` | claim → theorem map fed to `#print axioms` |
| `publish_attestation.sh` | publishes the resulting attestation to the public sites |

## Trust model

Because the corpus is private, an outside reader sees the published attestation,
not the raw source. Provenance and reproducibility come from:

1. **Frozen identity.** The attestation records the Git commit and timestamp.
2. **Public measurement code.** This harness states exactly how source counts,
   source digest, and source-scan diagnostics are computed.
3. **Named build scope.** CI records which Lean target was actually built.
4. **Theorem-level receipts.** Designated publication/product claims can be tied
   to their theorem statements and `#print axioms` footprints.
5. **Independent review.** A qualified reviewer under NDA can reproduce the
   inventory, digest, named builds, and theorem audits directly from source.

Nothing in this harness, by itself, establishes physiological, biological,
physical, diagnostic, or clinical validity.
