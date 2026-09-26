/** Resolve public files under the separately deployed suite's Vite base. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\/+/, '')}`;
}
