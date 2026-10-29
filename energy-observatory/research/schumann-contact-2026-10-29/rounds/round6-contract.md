# Round 6 contract — prospective evidence intake

Final authorized research round. Selected from R5 actual review, no new physical or human data. Engineering validation of declared metadata, not authentication. Producer owns analysis/round6; independent worker owns verification/round6; four reviewers challenge the integrated protocol/claim boundaries.

## API/schema

Export assessPacket(packet). Freeze a schema/example before running outcomes. Return independent stage flags: documentaryMetadataReady,environmentMetadataReady,informationMetadataReady,pairedMetadataReady; reasons perlane. Always return evidenceAuthenticated:false,empiricalResult:null,couplingEstablished:false,etContactEstablished:false. Even a completely plausible fabricated packet with every self-attestation true remains unauthenticated. Synthetic origin must remain explicit, never actualphysicaldata.

Minimum common fields: schemaVersion1, origin synthetic|observational,asOfUtc. Time format canonical UTC ISO with milliseconds `YYYY-MM-DDTHH:mm:ss.sssZ`, valid calendar dates, no future complete-record timestamps. References are inert{uri,sha256}: nonemptyHTTPS URI and64hex digest. These check reference syntax, not retrieval, hash matching, truthful contents or custody.

Documentarylane: source reference,readDepth,assertionStatus=attributed. No documentary-only packet can pass other lanes.

Environmentlane: kind=calibrated-numeric; componentBx|BywithunitsT orEzwithunitsV/m; positivefinite sampleRateHz; bandHz twofiniteascendingnonnegativebounds with upper<Nyquist; startUtc<endUtc<=asOf; nonnegativefiniteclockUncertaintyMs; references for numericrecords,calibration,response/noise,QC,baseline; fixedestimator andmissingnessrule. Kp-only,images,constant7.83lookup andunknownunits must fail thislane. Metadata cannot certify a real calibration/noise response.

Informationlane: integerK>=2,N>=1; exactlyNtrials with uniqueIDs and explicit hit|miss|abstain status (abstentions retained as nonhits); eventUtc<=responseLockedUtc<revealUtc<=asOf. References for targetcustody,responsearchive,scoringplan andgenerationaudit; generationAssumption=independent-uniform-conditional;stoppingRule=fixed-N. Require a declared commitment scheme with per-trial64hex digest, committedUtc<responseLockedUtc, nonceBits>=128, nonceRevealUtc>=revealUtc and<=asOf. Scheme must be salted-domain-separated-sha256; no unsalted small-target commitment qualifies. Strings/booleans are declarations, not verification of independence,secrecy or unbiasedscoring.

Pairedlane: both environment/information lanesready, observationalorigin (synthetic cases may have complete componentmetadata but pairedMetadataReady=false); reference for trial/environmentcrosswalk; protocolLockedUtc strictlybefore earliestevent and environmentalstart; fixedlagRule,nullAssumption,calendarControls andnonnegativefinite maxClockUncertaintyMs; environmentclockerror<=that tolerance; all eventtimeswithin environmentalwindow. A successful metadatajoin cannot prove causal direction or sender.

## Adversarial coverage and concrete disclosure test

Atleast onecomplete observational metadatafixture, onecomplete syntheticfixture, documentaryonly,andmissingdata descriptors for actualquicklook/Kp/corpustext availability (no fabricatednumericmeasurements). Independently test wrongunits,Nyquist,invalid/futuredates,negative/nonfiniteuncertainty,missingrefs,duplicateIDs,Nmismatch,uploadtimeasoriginalevent,earlytargetreveal,unsaltedcommitment,earlynoncereveal,nonfixedstopping,wrongtargetassumption andunpairedtimes. Explicitoriginaleventtimebasis required; upload/repostdates fail. Preserve fabricated self-attestation counterexample as unauthenticated even if metadataready.

Demonstrate SHA256 of literal fourtargetstrings can be inverted by enumerating those fourstrings; execute using Nodecrypto and independently Pythonhashlib. Do NOT claim that a salted toy proves cryptographicsecurity. Record why an unpredictable secret nonce and authentic chronology require independent auditing; do not publish live target secrets or generate humanexperiment records.

No physics,contactoragency acceptance from schema alone. No automated acquisition or externalcontact. Root freezes integrated claimmap,report,roadmap and finalreceipt after actual reviews. Website/publication tests follow as delivery verification, not a seventh researchround.

## Review clarification: abstentions

The skeptic noted that abstentions retained as nonhits have zero conditional success probability. The R5 exact Binomial(N,1/K) law assumes an actual K-way guess on each trial. With pre-reveal abstentions and otherwise unpredictable uniform targets, that binomial upper tail is a conservative reference, not generally the exact count law. The metadata gate does not calculate or certify either null. Preserve this distinction in the final protocol; do not drop abstentions to recover a preferred p-value.
