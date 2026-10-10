# Understanding Health — publishing guide

The public learning library is at `understanding-health.html`. Each lesson is a separate, accessible, indexable HTML page, with a permalink `understanding-health-NN.html`. The canonical published papers remain unchanged and available through the Health, Formally Defined series.

## Voice and educational identity

- Write directly in Zed James's first-person voice as a patient scientific guide. Write the conversation *to* the reader; do not refer to "the author" or to an external explainer narrating the paper.
- Prefer warm, continuous paragraphs to canned questions, questionnaires, staged back-and-forth, or calls for readers to reply. Natural rhetorical questions may guide a section, but a lesson never waits for a response.
- Begin from something a reader can imagine, then introduce the exact source statement and unpack each symbol before drawing out its implications.
- Preserve theorem statements, domain, hypotheses, and scope faithfully. A mathematically declared toy/finite case is a formal example, not a validated finding about a living forest or patient.
- Distinguish the full viable family from its downstream observed/collected capacity. The collector and adequacy language are specification-dependent; a set of attained response atoms is not a probability distribution.
- When evidence is discussed, distinguish validated observation from model assumptions, generated predictions, numerical verification, and biological/clinical application.
- No borrowed text blocks or uncited figures; paraphrase with source awareness and link to the full corresponding PDF and DOI.
- Every new lesson should offer accessible semantic HTML, its own title/description/canonical URL, self-contained story and conclusion, responsive styling, any equation in accessible MathML, a paper citation with a local PDF link, and real navigation only to published destinations.
- Keep the five-link corporate top navigation unchanged. The reading room is linked from home, Publications, and the scientific series. Future chapters are added to the reading room without crowding the global menu.
- Preserve reduced-motion and no-JavaScript access. Interactions should teach a declared change of conditions, not simulate unsupported empirical inferences.

## Adding a lesson

1. Rewrite supplied lesson copy for continuous first-person explanation; audit mathematical terms against its specified paper and note any unsupported claim.
2. Make `understanding-health-NN.html` using the established reading layout and `assets/css/understanding-health.css`. Keep its prose and critical conclusions visible without scripts.
3. Add an entry to `learning/lessons.json` and update its published count.
4. Add a working card to `understanding-health.html`. Add previous/next navigation *only after* the linked chapter exists.
5. Link any new visual exploration to exact formal cases and disclose its scope.
6. Add the permalink to `sitemap.xml` and run `python3 scripts/verify_understanding_health.py` and the existing research-catalog check.
7. Inspect on mobile and desktop and verify HTTP 200 on the canonical URL after deployment.

The scholarly source for Lesson 01 is `research-constitutive-continuation-capacity.pdf`, DOI `10.5281/zenodo.23131157`. The full PDF remains available for download from the lesson.

The source for Lesson 02 is the same Paper I: Sections 2–4 and the viable-history/capacity construction. Its discussion of the permissive candidate-lawfulness filter explicitly attributes that later encoding to Paper IV. The lesson includes direct links back to Lesson 01 and the library; Lesson 01 now has a real forward link. For subsequent lessons, keep `previous` and `next` in the registry synchronized with the navigation; never link to unpublished chapters.

Lesson 03: `understanding-health-03.html` explains the Paper-I requirement-visible quotient for Q = {any-response, stable-response}, including all four subsets of {E,S} and their three adequacy-equivalence classes. Its optional client-side demonstration adds an exposed-response requirement and separates the earlier combined class into two. Always retain the contrast between adequacy equivalence and full Health (which also requires Realizes). Newly introduced questions are mathematically expressible but require scientific licensing to count as health requirements. All lessons should link bidirectionally to actual immediate neighbors and to the library.

Lesson 04 closes the conceptual Paper I arc. It documents two negative results (positive persistence versus robustness and present-only observation versus prospective Health), the general sufficiency criterion, appropriately compatible changes of presentation, and the formal/empirical boundary. Keep the distinction between illustrated two-path forests and the paper's exact counterexample explicit. No future link to Lesson 05 until that chapter is published.
