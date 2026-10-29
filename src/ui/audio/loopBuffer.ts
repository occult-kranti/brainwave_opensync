/**
 * Make an engine-rendered texture periodic for live AudioBuffer looping.
 *
 * Render one overlap beyond the wanted loop duration. The last overlap is
 * blended into the discarded head, so the end joins the next sample of the
 * head naturally. Equal-power weights avoid a periodic fade to silence.
 * This changes only the live texture buffer, not deterministic WAV renders.
 */
export function seamlessTextureLoop(data: Float32Array, overlapFrames: number): Float32Array {
  if (!Number.isInteger(overlapFrames) || overlapFrames < 2 || data.length <= overlapFrames * 2) {
    throw new RangeError('A texture loop needs an overlap of at least two frames and a longer source.');
  }
  const length = data.length - overlapFrames;
  const output = data.slice(overlapFrames);
  for (let i = 0; i < overlapFrames; i++) {
    const angle = (i / (overlapFrames - 1)) * Math.PI / 2;
    output[length - overlapFrames + i] = data[length + i] * Math.cos(angle) + data[i] * Math.sin(angle);
  }
  // The finite crossfade region may have correlated energy (especially
  // brown noise). Restore the renderer's overall RMS, without clipping or
  // changing the section gain, to avoid a quiet/loud change in the mix.
  let sourceEnergy = 0;
  let outputEnergy = 0;
  for (const sample of data) sourceEnergy += sample * sample;
  for (const sample of output) outputEnergy += sample * sample;
  if (outputEnergy > 0) {
    const scale = Math.sqrt((sourceEnergy / data.length) / (outputEnergy / length));
    for (let i = 0; i < output.length; i++) output[i] *= scale;
  }
  return output;
}
