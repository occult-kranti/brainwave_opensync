# Newton primary-text audit: inference, analogy and hidden causes

Checked live on 16 October 2026. This report supports the six records in `src/newton-tesla/newton.ts`. It covers selected passages, with two companion readings, rather than Newton’s complete corpus. The earlier `research-atlas/archive/newton-tesla-alchemy` dossier served as a discovery lead; its claims were not inherited as verified facts.

The Newton analysis-and-synthesis skill and its research and hidden-causes references guided the method: identify the observation; reconstruct a candidate explanation; derive a consequence; expose information lost in the reverse inference; and seek a counterexample. The mathematical reconstructions below are ours. Historical authority supplies neither a modern physical proof nor evidence that a preset improves health.

## Edition and access register

| Reading | Original date or edition | Locator inspected | Access and limits |
| --- | --- | --- | --- |
| [De motu corporum in gyrum](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089) | Late 1684, according to the [catalogue](https://www.newtonproject.ox.ac.uk/catalogue/record/NATP00089) | Add. 3965.7, ff. 55r–57r; Theorem 2 with corollaries, Theorem 3, Problems 2–3 | Normalized Latin transcription; selected propositions, not a fresh verification of every geometric proof |
| [Opticks, Book I, Part II](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034) | London, 1704, first edition | Proposition III, Experiment VII, pp. 91–93; Proposition VI, pp. 114–117 | Continuous transcription and edition metadata; modern display color was not calibrated against the historical construction |
| [October 1666 Tract on Fluxions](https://www.newtonproject.ox.ac.uk/view/texts/diplomatic/NATP00100) | October 1666 | Add. 3958.3, f. 48v, opening notes/examples | Diplomatic transcription shows revisions; every symbol was not checked against a manuscript image |
| [Experiments](https://newton.dlib.indiana.edu/text/ALCH00109/normalized) | Selected entries dated 10–17 December 1678 | Add. MS. 3973, ff. 1r–1v | Indiana normalized transcription; selected entries in a much larger notebook |
| [Hermes / Tabula Smaragdina](https://newton.dlib.indiana.edu/text/ALCH00017/normalized) | Composition date not assigned in the inspected record | Keynes MS. 28, ff. 2r–2v; English text and metadata | Normalized and diplomatic views; Latin commentary not fully translated; 2010 is the digital edition date |
| [Of the Prophetic Language](https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00196) | London, 1733, posthumous edition | Part I, Chapter II, pp. 16–23 | Complete short chapter and edition metadata |
| [General Scholium](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00056), companion | London, 1729 English edition, volume 2 | pp. 392–393, with surrounding theological discussion | The edition actually consulted is the English translation, not an original Latin manuscript |
| [Opticks, Book III](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051), companion | London, 1718 second edition | Query 31, closing analysis/synthesis discussion, pp. 380–382 | Selected closing paragraphs; no claim to have audited every Query |

Normalized transcriptions apply editorial treatment and can conceal revisions. Diplomatic transcriptions retain more of the working document but can still contain unclear symbols. The source locator, edition and access claim are therefore part of the evidence, not decorative bibliographic details. Digital publication dates are kept separate from composition dates.

## 1. Orbital inference: the center and the clock matter

In *De motu*, Theorem 2 links circular motion to centripetal force; its fifth corollary links a period–radius relation to inverse-square dependence. Theorem 3 turns local geometry into an inverse problem. Problems 2 and 3 then distinguish the ellipse’s center from a focus as the force center. The manuscript supplies a particularly useful warning against identifying a law from shape alone.

Our restricted modern reconstruction is

\[
a=\frac{v^2}{r}=\frac{4\pi^2r}{T^2}.
\]

For uniform circular motion and a shared constant `k`, assuming `T²=kr³` gives `a=(4π²/k)r⁻²`. The units are acceleration; mass has not been inferred. The calculation does not establish a universal interaction law from one orbit. The assumptions include circularity, an identified center, time measurement and comparability between observations.

A stronger counterexample is available without collecting new data. Let

\[
x(t)=A\cos(\omega t),\qquad y(t)=B\sin(\omega t).
\]

Then `r̈=−ω²r` points toward the geometric center while the path is an ellipse. A Kepler ellipse instead has a focus-directed inverse-square acceleration and a different timing law. Thus the bare ellipse cannot identify the mechanism. A visual loop with no scale, timestamps or force center is even less informative.

**Proposed lab exercise:** compare exact synthetic trajectories and show the center, time parametrization, acceleration and conserved quantity. Fit only a subset of observations, then evaluate withheld positions or times. The result tests the stated mathematical models. It does not discover a new force or connect orbital geometry to human physiology.

## 2. Optical and musical proportions: preserve the analogy’s status

In *Opticks* I.II, Proposition III, Newton describes an assistant marking color boundaries and compares the divisions with monochord lengths. Proposition VI uses musical proportions in a color circle and predicts mixtures by a weighted center. He then records a two-color mixture that fails to match the center’s whiteness prediction. These are observations and a historical construction with stated limitations, not a universal conversion between light and sound.

A modern schematic version can use

\[
Z=\frac{\sum_i w_i p_i}{\sum_i w_i},\qquad w_i\ge0,\quad \sum_iw_i>0,
\]

with explicitly chosen planar points `pᵢ`. This is a geometric weighted mean. It is not automatically a calibrated model of color perception. Newton’s own failed mixture should not be restated as the modern claim that no pair of lights can match white.

For a separate ideal-string model,

\[
f=\frac{1}{2L}\sqrt{\frac{\mathcal{T}}{\mu}},
\]

where `L` is length, `𝒯` tension and `μ` linear mass density. Inverting length ratios gives frequency ratios only when the other quantities stay fixed. Newton’s optical comparison does not select an absolute reference pitch. Multiplying every audible frequency by the same positive factor preserves the interval ratios, so the historical analogy cannot uniquely determine a modern sound preset.

**Proposed lab exercise:** compare multiple declared mappings and reference pitches while holding ratios fixed. Display which choices are historical and which are the designer’s. A changing output under equally admissible mappings rejects uniqueness. A coherent audiovisual illustration can still be an artistic or educational choice; that coherence does not demonstrate a cross-modal treatment mechanism.

## 3. Fluxions: a reversible-looking calculation can lose information

The opening fluxions notes introduce a quantity and its rate, substitute auxiliary symbols, perform the rate calculation and restore the original values. The diplomatic page also exposes working revisions. The relevant practice is decomposition and reconstruction, not an anachronistic claim that Newton wrote the notation used below.

For a continuously differentiable relation `F(x,y)=0`, our modern local calculation is

\[
F_x+F_y\frac{dy}{dx}=0,
\qquad \frac{dy}{dx}=-\frac{F_x}{F_y},\quad F_y\ne0.
\]

The condition on the denominator is essential. At a point where it fails, another parametrization may work even though this formula does not. For the unit circle the formula is `−x/y`; at `y=0` the curve has not disappeared, but this local representation has failed.

Reverse inference has another ambiguity: `d(x²+C)/dx=2x` for every constant `C`. An initial value removes that freedom. In general, an inverse calculation must say which information has been discarded and which additional observation restores it.

Numerical differentiation also separates mathematical identity from measured estimation. For independent additive errors of variance `σ²` in two samples, the forward difference has noise variance `2σ²/h²`. Smaller `h` can reduce smooth-function truncation error while amplifying sample noise. No historical manuscript claim is needed for this algebraic consequence.

**Proposed lab exercise:** use a known synthetic function, preserve its exact derivative, and vary step size and controlled synthetic noise. Report both approximation error and noise. Reconstruct several integration constants to show nonuniqueness directly. This is a numerical lesson, not a claim about neural measurements or healing rates.

## 4. Experimental notebooks: failure is evidence to retain

The selected December 1678 entries in *Experiments* record weights, residues and appearances, including outcomes that did not combine as intended. A working notebook contains a different kind of claim from a published theorem or a copied authority. Its failed operations must remain in view when interpreting the apparent successes.

Our modern analogy is an error-aware balance, written abstractly as

\[
r=I_{measured}-O_{accounted}.
\]

The residual does not identify its cause. Measurement uncertainty, unrecorded transfers and incomplete collection can contribute. An unexplained remainder is therefore a reason to expand the accounting, not permission to label a hidden agent. This is a bookkeeping example; no material identities, quantities, temperatures or recreatable operations are supplied.

A useful textual audit would distinguish four layers: what was observed, what was measured, what was inferred and what remained uncertain. Historical vocabulary also needs contextual interpretation. A term translated as a spirit or a process described as vegetation cannot simply be replaced by electromagnetic energy, a cell process or a modern substance name.

**Proposed lab exercise:** annotate the inspected entries without deleting negative outcomes, then use an entirely synthetic balance sheet to show how an omitted channel changes the inferred residual. A second reader can disagree with the annotation and point to the text. Neither a color change nor a numerical remainder establishes elemental transformation, a therapeutic effect or a new field.

## 5. Hermetic correspondence and the problem of hidden causes

Keynes MS. 28 preserves an English *Tabula Smaragdina* alongside bibliographic references, a Latin version and commentary. The inspected English passage invokes correspondence between above and below. It is a transmitted Hermetic text in Newton’s papers, not a theorem authored by Newton. The catalogue inspected here does not justify assigning a precise composition date.

One productive modern question is whether two defined systems share an observable under a specified map. It requires domains, units and a relation between their dynamics. For linear models `u̇=Au` and `v̇=Bv`, a candidate mapping `v=Tu` has defect

\[
D=TA-BT.
\]

If `D=0`, the mapped trajectory obeys the second equation for states in the declared domain. If the map is non-invertible, even zero defect does not establish equivalence of the whole systems. A nonzero defect requires a bound before an approximate correspondence can be used. The historical metaphor supplies none of these premises.

Identifiability is a separate requirement. In an ideal oscillator, `ω₀=√(k/m)`. Parameter pairs `(k,m)` and `(αk,αm)` share that frequency for any positive `α`, while static compliance `1/k` changes. Matching one frequency therefore cannot identify all underlying properties. An independent calibrated observable can distinguish the candidates within this model.

The [1729 *General Scholium*, pp. 392–393](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00056), supplies an instructive companion. Newton distinguishes a law of gravity from an unassigned cause, then discusses a subtle spirit while acknowledging insufficient experiments to determine its laws. The coexistence of speculation and an evidential boundary should be preserved. Its vocabulary does not establish modern electromagnetism, a biological energy field or a healing mechanism.

**Proposed lab exercise:** display synthetic systems with a shared frequency and different compliance, or show a mapping’s computed defect. Label these modern examples. The inspected Newton passages provide no evidence of historical transmission to Tesla; that would require a separate dated source showing contact, citation or another specific route.

## 6. Theological interpretation has its own object and standards

The 1733 chapter *Of the Prophetic Language* maps natural imagery to political and ecclesiastical meanings and allows contextual variations. It is an explicit interpretive vocabulary. It should be read as theological interpretation rather than silently converted into mechanics, medicine or evidence of ceremonial practice.

Our transferable method is to expose an interpretive dictionary. Write `g(symbol, context)=interpretation`, record exceptions and distinguish a fixed rule from a rule revised after reading the desired outcome. A codebook can be evaluated for consistency without claiming that its vocabulary is a physical law. A comparison that redefines every symbol after seeing the result has no discriminating power between competing interpretations.

**Proposed textual exercise:** establish a small codebook on one passage and examine a separate passage with it, preserving disagreements. This tests the stated interpretive procedure. It does not establish the truth or falsity of religious belief, predict an event, derive a physical constant or measure a physiological effect. Theology, chymistry and Hermetic copying remain distinct documentary categories even when a historical author engaged with all of them.

## What the concept network may connect

| Connection | Warranted relation | Missing premise for a stronger claim |
| --- | --- | --- |
| Newton’s geometry → inverse-model lab | Modern methodological adaptation | Measurement model, assumptions, identifiability and error bounds |
| Optical divisions ↔ musical proportions | Explicit historical analogy | A unique physical cross-modal conversion or outcome mechanism |
| Notebook failure → uncertainty log | Modern adaptation of a documented practice | Complete measurements and a discriminating causal test |
| Hermetic correspondence → model mapping | A modern question inspired by a historical text | Defined map, domain, dynamics and controlled defect |
| Newton → Tesla | Comparative subject grouping in this lab | A specific historical transmission source, not similarity alone |
| Shared oscillation equation → shared biological effect | No such implication follows | Actual coupling, exposure, biological measurements and outcome evidence |

The closing [analysis/synthesis discussion in *Opticks* III, Query 31, pp. 380–382](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051), itself treats induction as revisable and leaves hints for further examination. That is compatible with keeping a hypothesis notebook open. It does not authorize promoting a hypothesis whenever a simulation produces an attractive pattern.

## Review boundaries and next useful evidence

This pass did not audit the entire *Principia*, all optical correspondence, the complete chymical notebooks, Latin Hermetic commentary or Newton’s full theology. It did not reproduce a historical experiment, translate every uncertain mathematical glyph, prove a Newton–Tesla lineage or validate an occult mechanism. Those are separate tasks with their own source requirements.

The six `experimentIdea` entries are proposed bounded software or textual exercises. They are not records of completed experiments. Their useful outputs would be a counterexample, a measured numerical error, an explicitly missing parameter or a documented interpretive disagreement. None supplies a medical preset, hazardous laboratory recipe or electromagnetic treatment instruction.

Further work should resolve a concrete missing bridge: compare a manuscript image where a formula is ambiguous; test a stated model on observations not used to choose it; locate a dated transmission source; or obtain an independent observable that distinguishes parameter sets. More analogy alone cannot remove the ambiguity.
