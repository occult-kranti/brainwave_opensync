# Bashar media and claim audit

Audit date: 2026-10-16. This is a bounded source audit, not a claim to have watched or read the complete Bashar corpus.

## Repository provenance

The read-only clone of `occult-kranti/bashar-index` was checked at commit `457dc2f2da10399bda2786573b7a77ec3fe34f62`. README, data README, LICENSE, official-channel notes and the digest-generation specification were read. There are 75 digest JSON files. README advertises a catalogue of 684 sessions/events spanning 1984–2027, 56 redrawn diagrams and other derived analysis. Catalogue entries with future dates are not proof of completed recordings. The data README gives 2026-09-11 as its generation date.

The digests are AI summaries produced through a third-party automatic-transcript workflow; they are not source transcripts. The specification requests paraphrased Q&A, approximate word counts, topic percentages and limited quotations from another model processing a transcript-service page. These are multiple derivation layers. Quotes in those files were not copied into this audit. Repository MIT licensing covers code and derived data; the repository explicitly excludes rights to Bashar/Darryl Anka recordings, transcripts and handouts. No substantial repository data or commercial transcript is redistributed here.

The 75 raw digest JSON texts were searched case-insensitively for `levitat`, `anti[ -]?gravit`, `nanopart` and `nanotech`, with zero matches. This is a scoped string-search result, not evidence about everything Bashar has said. A raw `frequency` search matches all files partly because the fixed schema contains a frequency-topic key; that count cannot measure substantive coverage.

## Access and attribution notes

The completed source and claim inventory is recorded in `src/frontier/basharSources.ts`. Only material actually inspected is attributed at that depth. No purchase or account access is implied by a public catalogue listing.

The inventory contains **9 source records, 9 claim cards and 6 connection records**. Source records are retrieval/provenance objects, not nine independent corroborations: the two BatGap pages concern one interview, and the compilation captions and digest concern one upload.

| Source | Material actually inspected | Scope |
|---|---|---|
| [Pinned index](https://github.com/occult-kranti/bashar-index/tree/457dc2f2da10399bda2786573b7a77ec3fe34f62) | Provenance files and selected digest passages | Independent derived index; commit dated 2026-09-23 |
| [Sound digest](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/Rcjd1TkZUMY.json) | Researcher note and Q&A entries 5–6 | Unofficial Divine Insights upload; date and session identity unresolved |
| [Frequency digest](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/ygzBrMyMAQA.json) | Researcher note and Q&A entry 6 | Unofficial my daily life upload; repository flags a duplicate with conflicting dates |
| [Host transcript](https://batgap.com/darryl-anka-bashar-transcript/) | EEG discussion and location-variable passage | Anka's account of his experience and of Bashar's purported explanation, not experimental validation |
| [Compilation captions](https://www.youtube.com/watch?v=Rcjd1TkZUMY) | Selected public automatic-caption windows below | Partial textual concordance with digest; original session still unresolved |
| [Host interview](https://batgap.com/darryl-anka-bashar/) | Date, original-video link and chapter index | Recording date is **2014-06-14**, not the later publication date seen in some external catalogues |
| [Official Refresher highlights](https://vimeo.com/441207831) | Publisher identity, description, ordering link and Q&A list | Similar title alone does not identify the compilation; no full-session access |
| [Official Continuing Education highlights](https://vimeo.com/204088259) | Publisher description and Q&A list | Publisher gives session date 2015-06-19; antigravity appears as a question, not an inspected answer |
| [The Artifacts listing](https://tv.bashar.org/checkout/new?o=p3073483) | Search-indexed official catalogue description | Direct purchase route redirected; program page supplied navigation only; answers inaccessible |

### Original transcript and video identity

The interview host's transcript is the strongest accessible attribution source. Its chapter index marks the EEG section at **00:14:33**, and the location discussion at **01:29:10**. These are host-provided chapter starts, not exact quote boundaries. The host links video `0zMDMtv5XwY`; selected automatic captions from that same video were also read.

Anka reports an EEG comparison and describes relocation through a location-dependent frequency. These are statements, not independent measurements. The relevant pages supply no raw EEG, operative equation, apparatus or controlled transport result. Ordinary interference motion or acoustic particle trapping would not, by itself, test the relocation account.

### Caption retrieval and inspected windows

Public English original automatic captions were retrieved using `yt-dlp --skip-download --write-auto-subs --sub-langs en-orig --sub-format vtt`. Audio and video were not downloaded or played. Temporary captions were used for inspection only and are excluded from repository/public artifacts. No full third-party transcript is redistributed, and this audit uses paraphrase rather than quoted passages.

| Video | Actual caption text inspected | Result |
|---|---|---|
| `0zMDMtv5XwY` | 00:14:30–00:15:30; 01:30:10–01:31:40 | Agrees with the selected host-transcript passages |
| `Rcjd1TkZUMY` | 01:13:03–01:15:44; 01:17:04–01:18:58; 01:19:15–01:20:04 | Q&A discusses sound layers, instrument combinations and a 1:1.618 ratio; this does not authenticate the session or establish its claims |

The compilation has rolling captions with turn markers but no reliable speaker identification. Some premises are introduced by the questioner and accepted as analogies in the reply; assigning every sentence to Bashar would be misleading. Automatic text renders phi inconsistently. Caption concordance therefore remains a provenance qualification on the two digest-level cards, not an upgrade to authenticated official speech or a physical result. The digest's healing gloss is broader than the narrow ratio passage checked.

Temporary caption file SHA-256 values, for retrieval reproducibility only:

- `0zMDMtv5XwY.en-orig.vtt`: `d54f6a47713705ee76b0b12f8a3cd9b8c973301042123f81cd24ceaceed9e474`
- `Rcjd1TkZUMY.en-orig.vtt`: `f9cb1d0817d2fd75fe77044b1387349b7021195176a1d6f2e0f57f73d130f494`

### Access limits and unverified leads

- Vimeo `204088259` provided its public description, but `yt-dlp` requested login for media extraction. No account, cookie, paywall bypass or purchase was used.
- BasharTV's Refresher and Artifacts program routes returned a navigation shell. The Artifacts search record exposes questions about antigravity/free energy and sound-dependent location. Those questions do not establish the answer or a working device. Its chapter markers were not treated as topic-specific quote timestamps.
- The official Refresher description includes a Planck-time question. It does not corroborate the numerical reality-frame answer in the unrelated, unverified frequency digest.
- The frequency digest's alternative upload IDs are copies, not independent witnesses. Its consciousness-frequency figures lack a defined measured observable in the inspected material.
- No attributable nanoparticle statement was located. The claim card records that research gap; it does not assign the user's proposed connection to Bashar. Keyword absence in these 75 JSON files is not evidence of absence from the entire corpus.

### Boundaries for implementation

Original sound recipes may compare chosen pitches, intervals, levels and listening preferences. They are app designs, not Bashar prescriptions, recreated commercial recordings or verified consciousness effects. A ratio can be translated into an ordinary acoustic comparison without accepting a metaphysical interpretation. Any connection to particle trapping or levitation must name the force, source, coupling and observable separately. Missing attribution cannot be repaired by similarity of vocabulary.

The physical-question and missing-evidence fields are this audit's analysis, not quotations from the sources. No secret access, comprehensive corpus coverage, clinical validation or measured anomalous force is claimed.
