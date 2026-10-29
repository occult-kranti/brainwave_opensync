"""Summarize retained provider snapshots without conflating their indices."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
import collections
import hashlib
import json

ROOT = Path(__file__).resolve().parent
CUTOFF = datetime.fromisoformat("2026-10-29T04:57:39+00:00")
noaa = json.loads((ROOT / "noaa-kp.json").read_text())
gfz_raw = json.loads((ROOT / "gfz-kp.json").read_text())
gfz = [{"time_tag": t, "Kp": v, "status": s} for t, v, s in
       zip(gfz_raw["datetime"], gfz_raw["Kp"], gfz_raw["status"], strict=True)]

def instant(row):
    return datetime.fromisoformat(row["time_tag"].replace("Z", "+00:00")).replace(tzinfo=timezone.utc)

def summarize(rows, start):
    rows = [r for r in rows if start <= instant(r) <= CUTOFF]
    complete = [r for r in rows if instant(r) + timedelta(hours=3) <= CUTOFF]
    daily = collections.defaultdict(list)
    for r in complete:
        daily[instant(r).date().isoformat()].append(r["Kp"])
    return {
        "available_points": len(rows), "complete_interval_points": len(complete),
        "first_interval_start_utc": instant(rows[0]).isoformat(),
        "last_complete_interval_end_utc": (instant(complete[-1]) + timedelta(hours=3)).isoformat(),
        "maximum_complete_interval_kp": max(r["Kp"] for r in complete),
        "complete_intervals_kp_ge_5": sum(r["Kp"] >= 5 for r in complete),
        "ongoing_interval_starts_utc": [instant(r).isoformat() for r in rows if r not in complete],
        "days": [{"date": d, "complete_bins": len(v), "full_day": len(v) == 8,
                  "maximum": max(v)} for d, v in sorted(daily.items())],
    }

out = {
    "cutoff_utc": CUTOFF.isoformat(),
    "observable": "Geomagnetic Kp context, not a Schumann resonance measurement",
    "sources": {},
    "source_hashes": {f: hashlib.sha256((ROOT / f).read_bytes()).hexdigest()
                      for f in ("noaa-kp.json", "gfz-kp.json")},
}
for name, rows, status in [("NOAA", noaa, "estimated"), ("GFZ", gfz, "preliminary")]:
    out["sources"][name] = {
        "status": status,
        "seven_day_window": summarize(rows, datetime(2026, 10, 23, tzinfo=timezone.utc)),
        "three_day_window": summarize(rows, datetime(2026, 10, 27, tzinfo=timezone.utc)),
    }
nm = {instant(r): r["Kp"] for r in noaa}
pairs = [(instant(r), nm[instant(r)], r["Kp"]) for r in gfz if instant(r) in nm]
out["cross_source"] = {
    "matched_interval_starts": len(pairs),
    "largest_absolute_difference": max(abs(a-b) for _, a, b in pairs),
    "different_beyond_0_01": sum(abs(a-b) > .01 for _, a, b in pairs),
    "interpretation": "Different provider estimates remain separate; no averaging or silent substitution.",
}
(ROOT / "observation-summary.json").write_text(json.dumps(out, indent=2) + "\n")
print(json.dumps(out, indent=2))
