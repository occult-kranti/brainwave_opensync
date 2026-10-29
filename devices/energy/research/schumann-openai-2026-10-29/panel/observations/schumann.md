# Schumann panel — recent observations and metrology

Date: 2026-10-29. Independent first handoff by `oct_observations`. Requested windows: October 23–29 and October 27–29. Latest numerical snapshot retrieval here: 2026-10-29T04:57:39Z. October 29 is incomplete. Source claims, retained data, quick-look observations and our deductions are separated below.

## Admissible conclusion

**This review does not establish a recent global Schumann-frequency anomaly.** Two primary station quick-looks were inspected, but a calibrated, quality-controlled seven-day Schumann series and an appropriate comparison baseline were not obtained. Geomagnetic data do provide a dated contextual record. An unresolved anomaly question is not evidence that no event occurred.

## Numerical geomagnetic context

Actual downloaded bytes, retrieval times and SHA-256 hashes are retained in `download-manifest.json` and `gfz-download.json`. `summarize-observations.py` derives `observation-summary.json` from those snapshots. These are provider-specific Kp products, not Schumann measurements.

| UTC date | NOAA estimated Kp maximum | GFZ preliminary Kp maximum | Complete 3-hour bins per provider |
| --- | ---: | ---: | --- |
| Oct 23 | 4.33 | 4.333 | 8 / 8 |
| Oct 24 | 2.00 | 2.000 | 8 / 8 |
| Oct 25 | 2.00 | 1.000 | 8 / 8 |
| Oct 26 | 2.00 | 1.667 | 8 / 8 |
| Oct 27 | 2.67 | 2.333 | 8 / 8 |
| Oct 28 | 2.33 | 2.667 | 8 / 8 |
| Oct 29, through 03:00 UTC only | 1.67 | 1.333 | 1 / 1 |

For October 23 through 29 03:00 UTC, each source supplies 49 complete intervals; no retained complete interval reaches Kp=5. The October 27–29 subset contains 17 complete intervals. GFZ also returned the ongoing 03:00–06:00 UTC interval; it is excluded from complete-interval summaries. All GFZ values have `pre` status. Provider estimates differ in 28 of the 49 matched interval starts by more than 0.01, with maximum absolute difference 1.667. They must not be averaged or treated as interchangeable definitive measurements.

The retained NOAA weekly bulletin, issued October 26, reports active geomagnetic conditions on October 23 and quiet conditions October 24–25, plus elevated >2 MeV electron flux October 23–25. Its October 21 G1 event falls outside the requested seven-day window. The October 29 forecast's observed section reports no preceding-24-hour radio blackouts and solar radiation below its storm thresholds. None establishes a Schumann event.

The same forecast contains a conflicting October 31 G1 table versus a no-G1 rationale. October 31 is outside our observation window; neither forecast is treated as an observed storm. Root reported another review's stale retrieval from a mutable NOAA URL. Our snapshot dates are verified inside the saved bodies; future reads must be checked independently rather than inheriting these dates.

## Primary Schumann station availability

**Tomsk / Space Observing System 70.** Read [station interpretation](https://sos70.ru/), [measurement methods](https://sos70.ru/?page_id=43) and the current source image. The displayed image is labeled October 27–29, has persistent mode bands, broadband vertical features and a narrow dark gap. This is qualitative inspection only: no numeric anomaly or frequency change was extracted. The chart's hour labels are not promoted to UTC without an explicit station time-zone record. The station explains missing-data bands and local lightning/interference. Its weekly numerical/archive access is subscription-based. No subscription was purchased or access restriction bypassed.

The methods page describes 80 Hz sampling, 50-second Fourier windows, 5-second hops, nominal 0.02 Hz bin spacing and three-minute summaries. Its mode frequency is a local spectral-density maximum. Bin spacing is not a confidence interval; overlapped windows are not independent replicates. The displayed amplitude is not automatically calibrated magnetic flux density.

**Nagycenk / NCK.** The [primary display](https://nckobs.hu/data/sr/) source image was inspected at its actual pixels. It is dated October 29 with an explicit UTC axis and a partial-day trace through roughly 04:45 UTC. The first-mode trace lies visually near 7.8 Hz; no precise frequency estimate, anomaly statistic or inference about all seven days is admitted from that picture. The displayed electric-channel amplitudes use arbitrary units.

The [observatory's technical account](https://epss.hu/~bozokit/documents/szab%C3%B3n%C3%A92021_GOR.pdf), pp. 1–4, documents public current-day quick-looks, internal archives, different magnetic-channel transfer functions and local disturbances that can bias or suppress automatic estimates. It expressly requires quality checks before interpretation. Raw CSVs may exist in its processing system; their existence does not establish public access or our possession of them.

**Hylaty.** Institutional search results identify scientific data available by request and an older quick-look archive. No current-window numerical series was obtained. No request was sent. An old archive is not proof of current observation coverage.

Station image hashes and URLs are recorded in `sources.json`; images are not redistributed in this dossier. Current images are mutable and these hashes bind only the locally inspected snapshots.

## Allegations and rejected inferences

Third-party current pages use incompatible proprietary activity scores, relative amplitudes and sometimes pixel/AI-image analysis. These are discovery leads, not independent station measurements or a common calibrated scale. This review does not publish their scores as facts about global resonance or human health.

Reject: brightness becoming a frequency; black gaps becoming absent terrestrial resonance; Kp becoming an ELF magnetic amplitude; a forecast becoming an observed event; several websites reproducing Tomsk becoming independent stations; or equal EEG and ELF numerical frequencies becoming a biological coupling mechanism.

## Measurement contract for the next research rounds

Required record: station and channel, calibrated units and transfer function, UTC interval, sampling and filters, raw or reproducible PSD, missingness and saturation flags, frequency-estimator method, uncertainty, season/local-time matched baseline and independent station comparison. Keep the lightning source, ionospheric response and receiver separate.

A practical bounded simulation can test whether source coloration, damping or gain changes move an observed spectral maximum while the intrinsic model frequency is unchanged. A second round should test inverse degeneracy and what additional calibrated observable breaks it. A final round can turn the resulting checks into an intake gate that returns insufficient evidence for our current incomplete station data. These are proposals for advisor selection, not executed research rounds in this report.
