/**
 * Deploy-base-aware URL for files under public/ (previews, stimulus pack,
 * icons). v1 used root-absolute paths, which 404 on a project-path deploy
 * such as GitHub Pages (`/brainwave_opensync/`). Vite exposes the configured
 * base as import.meta.env.BASE_URL ('/' in dev, '/brainwave_opensync/' in
 * the Pages build).
 */
export function assetUrl(path: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  return b + path.replace(/^\/+/, '');
}
