import { useEffect, useRef } from 'react';
import { useSession } from '@/ui/session/useSession';

/** Own only this exhibit's previews; preserve an unrelated session. */
export function useResearchAudio(ids: ReadonlySet<string>) {
  const session = useSession();
  const { previewId, stopPreview, running, muted, panicked, advisoryAcknowledged, governor } = session;
  const current = useRef<string | null>(null);
  useEffect(() => { current.current = previewId; }, [previewId]);
  useEffect(() => () => { if (current.current && ids.has(current.current)) stopPreview(); }, [ids, stopPreview]);
  useEffect(() => { if (current.current && ids.has(current.current)) stopPreview(); }, [ids, stopPreview, running, muted, panicked, advisoryAcknowledged, governor.infantMode, governor.maxGainDbFs]);
  return { infantMode: governor.infantMode, stopOwnPreview: () => { if (current.current && ids.has(current.current)) stopPreview(); } };
}
