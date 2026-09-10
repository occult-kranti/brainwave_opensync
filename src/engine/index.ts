/**
 * Open Sync engine — public API barrel.
 *
 * - types:     pure session-description data types
 * - synth:     pure DSP renderers (tones, noise, bowl, nature)
 * - bowls:     bowl material / strike profiles, pitch helpers, bowl sets
 * - sequencer: multi-phase session renderer + reproducibility manifest
 * - wav:       pure WAV encoder (PCM16/24, float32)
 * - player:    Web Audio playback state machine
 */

export * from './types';
export * from './synth';
export * from './bowls';
export * from './sequencer';
export * from './wav';
export * from './player';
