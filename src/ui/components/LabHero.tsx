/**
 * LabHero — wide art banner for the research lab pages. Lazy-loaded,
 * rounded, with a small caption chip; purely presentational (no claims).
 */

import { assetUrl } from '@/lib/assetUrl';

export function LabHero({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure style={{ margin: '14px 0 0', position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
      <img
        src={assetUrl(src)}
        alt={alt}
        loading="lazy"
        style={{ width: '100%', aspectRatio: '21 / 9', objectFit: 'cover', display: 'block', opacity: 0.92 }}
      />
      <figcaption
        className="t-caption font-mono2"
        style={{
          position: 'absolute', left: 12, bottom: 10, padding: '3px 10px', borderRadius: 6,
          background: 'rgba(10, 8, 6, 0.66)', color: 'var(--text-2)', backdropFilter: 'blur(4px)',
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
