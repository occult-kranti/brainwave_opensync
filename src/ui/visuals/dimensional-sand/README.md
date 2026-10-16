# Dimensional sand

Original parametric particle artwork for the archive Cymatics route. It uses the existing MIT-licensed Three.js dependency and OrbitControls; no shader or artwork was copied from another project.

The default Clifford bloom samples `(cos u, sin u, cos v, sin v) / sqrt(2)` on a unit sphere in four coordinates. XW and YW plane rotations preserve the four-dimensional norm. Projection from `w = 2.6` keeps the denominator at least 1.6 over that sphere; the separate 1.75 display scale is artistic. The other forms are toroidal ribbons, spiral columns, interference dunes, and sampled virtual-plate nodes. GPU weights interpolate between forms. Grain lift, turbulence, pointer swirl and optional spectrum-energy scaling are visual effects rather than solved physical grain dynamics.

`DimensionalSand.tsx` owns and disposes its renderer, geometry, material, controls, observer and event listeners. It pauses time while hidden. Reduced motion starts frozen via the page state. Requested density is 20k/40k/80k, capped at 24k for narrow screens or low core count, and reduced to 20k after sustained slow frames. DPR is at most 1.5, with a 2 million pixel drawing-buffer ceiling; mobile DPR is at most 1.25. The Canvas fallback renders 2.4k grains at at most 24 fps and 1.2 million pixels. It retains morphology, mathematical 4D rotation, camera orbit/zoom, pointer swirl, fullscreen and PNG export. WebGL motion renders at at most 30 fps. No sound starts on mount or morphology selection.

Primary sources consulted:

- Three.js repository and MIT license: https://github.com/mrdoob/three.js
- ShaderMaterial: https://threejs.org/docs/#api/en/materials/ShaderMaterial
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- Thomas Banchoff, *Beyond the Third Dimension*, chapter 6, projection from four-space: https://www.math.brown.edu/tbanchof/Beyond3d.new/chapter6/s6_8.html
- Existing analytic-plate background: Thomas Müller, *Numerical Chladni figures*: https://arxiv.org/abs/1308.5523

Verification: geometry tests check sphere norm preservation, projection finiteness across two full rotation sweeps, visible coordinate changes, distinct form bounds, morph endpoints and deterministic/adaptive budgets. Chromium with software WebGL rendered both desktop and mobile without shader or page errors. A separate WebGL-disabled Chromium run verified changed pixel output for Canvas zoom and 4D rotation, fullscreen Escape, PNG download and no horizontal mobile overflow. These checks do not establish hardware-device performance or physical simulation accuracy.
