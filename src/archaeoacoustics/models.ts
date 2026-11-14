/** Teaching models for wave scales, ratios and simple architectural geometries. */

/** Approximate speed of sound in air at 20 °C. */
export const AIR_SPEED_M_S = 343;
/** Exact SI speed of light in a vacuum. */
export const LIGHT_SPEED_M_S = 299_792_458;
/** Chosen tropical-year reference for the octave calculation, in SI seconds. */
export const TROPICAL_YEAR_SECONDS = 31_556_925.97;

export const MODEL_SOURCES = {
  wavelength: 'https://openstax.org/books/college-physics-2e/pages/17-2-speed-of-sound-frequency-and-wavelength',
  metre: 'https://www.bipm.org/en/si-base-units/metre',
  tropicalYear: 'https://aa.usno.navy.mil/faq/leap_years',
  pitch: 'https://www.phys.unsw.edu.au/jw/notes.html',
  room: 'https://www.mdpi.com/2624-599x/5/2/22',
  staircase: 'https://doi.org/10.1121/1.1764833',
} as const;

export interface RoomDimensions {
  lengthM: number;
  widthM: number;
  heightM: number;
}

export interface RoomOrders {
  x: number;
  y: number;
  z: number;
}

export interface RoomPosition {
  xM: number;
  yM: number;
  zM: number;
}

export interface StepEchoInput {
  runM: number;
  riseM: number;
  /** Horizontal distance from the source and receiver to the lowest modeled edge. */
  offsetM: number;
  sourceHeightM: number;
  steps: number;
  speedMps?: number;
}

export interface StepEchoArrival {
  /** One-based edge index, numbered from the foot upward. */
  step: number;
  timeSeconds: number;
  /** Time since the prior arrival. The first arrival has no prior interval. */
  spacingSeconds: number | null;
  /** Reciprocal of a nonzero arrival gap, used as a local repetition-rate proxy. */
  spacingHz: number | null;
}

export const MAX_ECHO_STEPS = 120;

function positiveFinite(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be positive and finite.`);
  }
  return value;
}

function nonnegativeFinite(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be nonnegative and finite.`);
  }
  return value;
}

export function wavelengthMeters(frequencyHz: number, speedMps = AIR_SPEED_M_S): number {
  const speed = positiveFinite(speedMps, 'Wave speed');
  const frequency = positiveFinite(frequencyHz, 'Frequency');
  return positiveFinite(speed / frequency, 'Wavelength');
}

export function wavelengthComparison(frequencyHz: number) {
  const frequency = positiveFinite(frequencyHz, 'Frequency');
  return {
    frequencyHz: frequency,
    periodSeconds: positiveFinite(1 / frequency, 'Period'),
    airMeters: wavelengthMeters(frequency),
    vacuumMeters: wavelengthMeters(frequency, LIGHT_SPEED_M_S),
  };
}

export function frequencyRelations(rootHz: number) {
  const fundamental = positiveFinite(rootHz, 'Fundamental');
  return {
    rootHz: fundamental,
    perfectFifthHz: fundamental * 3 / 2,
    fifthHarmonicHz: positiveFinite(fundamental * 5, 'Fifth harmonic'),
    octaveHz: fundamental * 2,
  };
}

/** Map a period to a selected octave using 2^octaves / periodSeconds. */
export function octaveFrequency(periodSeconds: number, octaves: number): number {
  const period = positiveFinite(periodSeconds, 'Period');
  if (!Number.isSafeInteger(octaves)) throw new RangeError('Octaves must be a whole number.');
  return positiveFinite(2 ** octaves / period, 'Mapped frequency');
}

function validateRoom(dimensions: RoomDimensions, orders: RoomOrders): void {
  positiveFinite(dimensions.lengthM, 'Room length');
  positiveFinite(dimensions.widthM, 'Room width');
  positiveFinite(dimensions.heightM, 'Room height');
  if (![orders.x, orders.y, orders.z].every((order) => Number.isSafeInteger(order) && order >= 0)) {
    throw new RangeError('Room mode orders must be nonnegative whole numbers.');
  }
  if (orders.x === 0 && orders.y === 0 && orders.z === 0) {
    throw new RangeError('Select at least one nonzero room mode order.');
  }
}

/** Rigid rectangular walls, uniform wave speed and a single separable pressure mode. */
export function rectangularRoomModeHz(
  dimensions: RoomDimensions,
  orders: RoomOrders,
  speedMps = AIR_SPEED_M_S,
): number {
  validateRoom(dimensions, orders);
  const speed = positiveFinite(speedMps, 'Wave speed');
  const spatialFrequency = Math.hypot(
    orders.x / dimensions.lengthM,
    orders.y / dimensions.widthM,
    orders.z / dimensions.heightM,
  );
  return positiveFinite(speed / 2 * spatialFrequency, 'Mode frequency');
}

/** Sample the signed pressure mode from −1 to 1, up to an arbitrary overall amplitude. */
export function rectangularRoomPressureAt(
  dimensions: RoomDimensions,
  orders: RoomOrders,
  position: RoomPosition,
): number {
  validateRoom(dimensions, orders);
  const axes = [
    [position.xM, dimensions.lengthM, orders.x],
    [position.yM, dimensions.widthM, orders.y],
    [position.zM, dimensions.heightM, orders.z],
  ] as const;
  let pressure = 1;
  for (const [coordinate, length, order] of axes) {
    if (!Number.isFinite(coordinate) || coordinate < 0 || coordinate > length) {
      throw new RangeError('The sample position must be inside the room.');
    }
    pressure *= Math.cos(Math.PI * order * (coordinate / length));
  }
  return pressure;
}

/**
 * One point scatterer per regularly spaced step edge. With source and receiver
 * co-located, the geometric round-trip delay is twice the Euclidean distance
 * divided by sound speed. Sort arrivals chronologically before taking gaps.
 * This omits diffraction strength, ground reflections, absorption and the
 * source spectrum. Reciprocal gaps are spacing rates rather than measured pitch.
 */
export function stepEcho({
  runM, riseM, offsetM, sourceHeightM, steps, speedMps = AIR_SPEED_M_S,
}: StepEchoInput): StepEchoArrival[] {
  positiveFinite(runM, 'Step run');
  nonnegativeFinite(riseM, 'Step rise');
  positiveFinite(offsetM, 'Source offset');
  nonnegativeFinite(sourceHeightM, 'Source height');
  positiveFinite(speedMps, 'Wave speed');
  if (!Number.isSafeInteger(steps) || steps < 2 || steps > MAX_ECHO_STEPS) {
    throw new RangeError(`Select 2–${MAX_ECHO_STEPS} whole steps.`);
  }

  const paths = Array.from({ length: steps }, (_, index) => ({
    step: index + 1,
    timeSeconds: positiveFinite(
      Math.hypot(offsetM + index * runM, index * riseM - sourceHeightM) / speedMps * 2,
      'Echo arrival time',
    ),
  })).sort((a, b) => a.timeSeconds - b.timeSeconds);

  return paths.map((path, index) => {
    const spacingSeconds = index === 0 ? null : path.timeSeconds - paths[index - 1].timeSeconds;
    const spacingHz = spacingSeconds ? 1 / spacingSeconds : null;
    return {
      ...path,
      spacingSeconds,
      spacingHz: spacingHz !== null && Number.isFinite(spacingHz) ? spacingHz : null,
    };
  });
}
