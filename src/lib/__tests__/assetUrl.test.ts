import { describe, expect, it } from 'vitest';
import { assetUrl } from '../assetUrl';

describe('assetUrl', () => {
  it('joins a public path onto any base', () => {
    expect(assetUrl('/previews/x.wav', '/')).toBe('/previews/x.wav');
    expect(assetUrl('previews/x.wav', '/brainwave_opensync/')).toBe('/brainwave_opensync/previews/x.wav');
    expect(assetUrl('/stimulus_pack/a.wav', '/brainwave_opensync')).toBe('/brainwave_opensync/stimulus_pack/a.wav');
    expect(assetUrl('icons/icon-192.png', './')).toBe('./icons/icon-192.png');
  });
});
