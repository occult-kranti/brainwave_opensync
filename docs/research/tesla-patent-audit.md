# Tesla primary-record audit

Checked 2026-10-16. Nine selected records: six U.S. patent grants, one contemporary lecture, one contemporary letter by another author and one retrospective autobiographical article. This is a source audit and a set of proposed digital investigations, not exhaustive reading of Tesla, a count of inventions, or certification of historical performance. The corresponding data is `src/newton-tesla/tesla.ts`.

Patent text and original drawing scans were retrieved from Google Patents, a host of primary patent records. Its automated classifications, legal-status estimates and chemical/biological keyword annotations were not used as evidence. OCR has damaged words and some claim boundaries; the specific passages below identify the checked scope. Original drawing sheets were downloaded from the linked patent PDFs and inspected at readable resolution. The descriptions sometimes incorporate claims in the same extracted text.

Dates marked as grants are not invention dates or demonstrations. National equivalents and related applications must be grouped before anyone counts invention families. This audit neither establishes complete family membership nor treats each national filing as a separate invention. Earlier repository research was a discovery aid; the linked texts were checked again.

## Patent record scope

| U.S. grant | Application date in record | Grant date | Checked passages and drawings |
| --- | --- | --- | --- |
| [381968, Electro-magnetic motor](https://patents.google.com/patent/US381968A/en) | 1887-10-12 | 1888-05-01 | Description of phase sequence and Figs. 1–9; claims 1–3; original drawing sheet 1 |
| [454622, System of electric lighting](https://patents.google.com/patent/US454622A/en) | 1891-04-25 | 1891-06-23 | Supply, condenser, coupled-coil and lamp descriptions; claims 1–6; original drawing sheet |
| [645576, System of transmission of electrical energy](https://patents.google.com/patent/US645576A/en) | 1897-09-02 | 1900-03-20 | Conductive-atmosphere hypothesis, source/receiver and loss discussion; claims 1–4 and 6–9; original drawing |
| [685957, Apparatus for the utilization of radiant energy](https://patents.google.com/patent/US685957A/en) | 1901-03-21 | 1901-11-05 | External radiation, charge collection, slow charging and discharge/load descriptions; claims 2–6; Figs. 1–4 |
| [613809, Control of moving vessels or vehicles](https://patents.google.com/patent/US613809A/en) | 1898-07-01 | 1898-11-08 | Command reception, selectivity, onboard storage batteries and motor passages; claims 2–4 and 12–13; original drawing sheet 1 |
| [514169, Reciprocating engine](https://patents.google.com/patent/US514169A/en) | 1893-08-19 | 1894-02-06 | Restoring-force premise, pressure input, thermal losses, load examples and limits; claims 1–5; original sectional drawing |

The following equations are modern explanatory reconstructions. They are not quotations, patent claims or evidence that Tesla used this notation. Proposed outcomes are predictions of the stated models; no new physical measurement is reported here.

## Phase motor: US381968

The claimed combination links separate generator circuits to corresponding motor circuits to move the resultant magnetic direction. Its energy source is the generator, and useful output is shaft work. The patent discusses lamination and other practical arrangements; the field plot alone omits rotor dynamics, heat, core loss and friction.

For an ideal local two-component field,

\[
B_x=B_0\cos(\omega t),\qquad B_y=B_0\sin(\omega t),\qquad |B|=B_0.
\]

This explains the rotating direction. Equal-frequency components in phase trace a line; reversing one component reverses the rotation. Unequal amplitudes generally produce an ellipse. These are useful digital controls. A complete torque/efficiency prediction needs the rotor and load model; no efficiency number is inferred from the grant. The patent describes multiple arrangements, so this reconstruction is not a replica of every motor in it.

## Lighting converter: US454622

The generator, condenser, coupled coils and luminous load are visible in the drawing and described in the text. The source replenishes stored energy. Inductive and capacitive coupling convey it; the description also discusses dissipation and material deterioration. A brighter light or higher voltage is not itself an input/output energy measurement.

A digital coupled-circuit model can include mutual inductance \(M=k\sqrt{L_1L_2}\), with \(|k|<1\) for a nondegenerate passive inductance matrix. Magnetic storage includes the mutual term \(Mi_1i_2\). Ignoring that term while assessing energy can create a false apparent surplus. The model must also include the load and losses. The control is zero coupling with an initially unenergized receiver. This abstraction excludes discharge physics and physical apparatus instructions.

## Empirical tuning: the 1892 London lecture

[Tesla’s lecture transcription](https://www.gutenberg.org/files/13476/13476-h/13476-h.htm) was checked around the coil description, adjustment of capacitance/self-induction, discussion of conductor length, and gaseous/dielectric losses. Tesla reports empirical adjustment and explicitly says a proposed loss relation needs experimental confirmation. The full lecture and every demonstration were not audited. Historical statements that demonstrations were harmless are not adopted as present-day guidance.

For a linear series RLC teaching model with capacitor charge \(q\),

\[
L\ddot q+R\dot q+q/C=V(t),\qquad
E=\tfrac12 L\dot q^2+q^2/(2C),\qquad
\dot E=V\dot q-R\dot q^2.
\]

The ideal undamped angular frequency is \(1/\sqrt{LC}\); underdamped free oscillation has \(\omega_d^2=1/(LC)-R^2/(4L^2)\). A driven maximum also depends on the observed quantity. Proposed controls compare detuning, added resistance and drive-off decay. None identifies an acoustic treatment frequency or validates a historical nonlinear apparatus.

## Long-distance proposal: US645576

The patent explicitly includes generator G, transmitting and receiving transformers, elevated terminals, earth connections, lamps and motors. Its consequential assumption is a conducting atmospheric route capable of useful distant delivery. The document's broad performance assertions are the inventor’s claims; this audit supplies no independent efficiency measurement.

For any proposed transfer experiment, account for source work, initial/final field storage, ground and atmospheric losses, and receiver load work. Matched frequencies with negligible coupling do not deliver useful power. An unloaded receiving voltage also does not establish load power. A virtual coupled-oscillator example can teach these distinctions but cannot replace an Earth/atmosphere propagation calculation. This patent is not a derivation of modern Earth–ionosphere modes or evidence for a universal beneficial frequency.

## Collection is not source-free: US685957

The external radiation source, exposed conductor, condenser, return connection, controller and receiving circuit are explicit. One variant also uses a local auxiliary supply. Tesla proposes a historical particle explanation and reports slow accumulation; neither a modern microscopic theory nor a measured useful-power specification is supplied by this audit.

An abstract charge budget is

\[
C\dot V=I_{\mathrm{external}}-V/R_{\mathrm{leak}}-I_{\mathrm{load}},\qquad E_C=CV^2/2.
\]

The driving current is an assumed model input, not a value predicted from the patent. Removing input after discharge leaves no sustained passive output. Any auxiliary supply belongs in the complete budget. The educational experiment varies virtual input, leakage and load only; it does not call for radiation sources, exposed conductors or a physical build.

## Command versus propulsion: US613809

The propulsion paragraph explicitly identifies motor D and storage batteries E. The control mechanism uses received disturbances and local circuits. Those separate functions prevent an incorrect inference that the control signal supplies all propulsion energy. Selectivity and interference are discussed, but the patent is not a modern error-rate or range certification.

The proposed digital counterpart is a simple boat state machine with separate communication and battery variables. Missing commands and depleted energy produce different failures. The prediction is checked by independently removing each resource. Only benign navigation/control logic is retained; no military adaptation or physical radio construction is provided.

## Mechanical oscillator: US514169

The source is pressurized fluid, the working element is a piston and the restoring element is elastic. The constant-period argument explicitly assumes restoring force proportional to displacement within limits. The text also recognizes heat from imperfect elasticity and proposes recovering some of it; that is not a measured efficiency figure.

The local linear model \(m\ddot x+b\dot x+kx=F_{\mathrm{drive}}-F_{\mathrm{load}}\) has undamped frequency \(\sqrt{k/m}\). It requires input work to replace dissipation and extracted work. Adding a cubic restoring term provides an amplitude-dependent counterexample to unrestricted constant-period claims. The digital comparison involves no pressurized machinery or structural excitation. The source is not proof of popular destructive-oscillator stories.

## Vedanta correspondence: 13 February 1896

The [complete published letter from Vivekananda to E. T. Sturdy](https://www.ramakrishnavivekananda.info/vivekananda/volume_5/epistles_first_series/057_blessed_and_beloved.htm) was read. The edition labels it LVII; date and recipient are more stable locators than numbering across sites. It reports Tesla’s interest in prana, akasha and kalpas, and an anticipated mathematical demonstration. It does not contain the promised proof. The autograph manuscript was not inspected.

This establishes a contemporary report of philosophical conversation. It does not establish equivalence between Vedantic terms and measured physical variables, a completed mass–energy derivation, paranormal ability, or occult organizational membership. Vedanta retains its own religious/philosophical context. A testable modern translation must define observables, dimensions, dynamics and a result that could contradict it; otherwise it remains historical interpretation.

## Retrospective imagination and 3–6–9 provenance

The public [My Inventions I transcription](https://teslauniverse.com/nikola-tesla/articles/my-inventions-i-my-early-life) identifies the February 1919 *Electrical Experimenter*, pages 696–697 and 743–747. The text, including visualization and repeated acts divisible by three, was read. The original magazine download was member-gated, so this is a transcription-based review rather than manuscript/facsimile authentication. Editorial praise is distinct from Tesla’s first-person account.

His retrospective claims about mentally running machines are not independently measured cognitive performance. They can inspire writing predictions before testing a model, then recording mismatches. The selected account supplies no physical 3–6–9 law. In base \(b\), digit sums preserve value modulo \(b-1\); decimal patterns therefore change with the notation. That arithmetic does not identify a physical resonance. No authenticated primary derivation of the popular cosmological claim was found in this bounded survey; this is not a claim to have searched every surviving document.

## Boundaries and next evidence

These records can motivate mathematical analogies between phase, resonance and energy accounting. They do not establish Newtonian alchemy as a cause of Tesla’s inventions, an equivalence between electric fields and listening audio, or therapeutic effects. Patent claims, observations reported by an inventor, other people’s letters, retrospective memories and new model predictions stay separate in the data.

All recreation ideas are conceptual or digital. There are no mains, high-voltage, radio-transmitter, body-contact, radiation-source, pressure-system or structural-test instructions. No paid text, commercial audio or membership content was copied. A broader investigation would require complete patent-family review, authenticated correspondence, notebook comparisons, measured device data and independent replication; those are recorded as future work rather than implied accomplishments.
