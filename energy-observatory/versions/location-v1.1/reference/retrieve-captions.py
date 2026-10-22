"""Reproduce the two bounded caption-retrieval attempts.

Requires youtube-transcript-api. Raw caption output is audit material, not a
publication artifact. No paid-media access, cookie extraction or authentication
bypass is performed. Caption availability may change after the research date.
"""
import json
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi


def main():
    out = Path(__file__).resolve().parent / "caption-reproduction"
    out.mkdir(exist_ok=True)
    statuses = []
    for video_id in ("98KsASkO8Cs", "771EL_Aikio"):
        try:
            transcript = YouTubeTranscriptApi().fetch(video_id, languages=["en"])
            segments = transcript.to_raw_data()
            (out / f"{video_id}.json").write_text(json.dumps(segments, indent=2))
            statuses.append({
                "videoId": video_id,
                "status": "retrieved",
                "segments": len(segments),
                "language": transcript.language,
                "isGenerated": transcript.is_generated,
            })
        except Exception as error:
            statuses.append({
                "videoId": video_id,
                "status": "unavailable",
                "exception": type(error).__name__,
                "message": str(error),
            })
    (out / "status.json").write_text(json.dumps(statuses, indent=2))
    print(json.dumps(statuses, indent=2))


if __name__ == "__main__":
    main()
