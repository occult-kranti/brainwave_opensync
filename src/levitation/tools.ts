import type { LevitationSource } from './types';

export const TOOL_SOURCES: readonly LevitationSource[] = [
  {
    id: 'tool-levitate', title: 'Levitate — open acoustic field and force software', date: 'Repository snapshot inspected 2026-10-16', kind: 'Open-source implementation', country: 'International',
    url: 'https://github.com/AppliedAcousticsChalmers/levitate/tree/d71ae895f3f02b649781ddd047cff7dc7d4d5988',
    version: 'Pinned commit d71ae895f3f02b649781ddd047cff7dc7d4d5988; MIT license',
    passageRead: 'README, license, dependency declarations and fields/_implementations.py: Gor’kov potential, gradient and curvature implementations.',
    access: 'Public repository cloned for read-only inspection; no code copied into this app.', provenance: 'Chalmers acoustic-array modeling project.',
    evidence: 'Complex pressure and its spatial derivatives determine a small-sphere potential; force is minus its gradient. Peak-amplitude conventions and material contrasts are explicit in code.',
    limitations: 'Selected code inspection is not validation of every solver or hardware driver. Traveling-wave and finite-size cases require more complete force models.',
    status: 'derived', topics: ['software', 'acoustics', 'Gor’kov', 'simulation'],
  },
  {
    id: 'tool-acoustools', title: 'AcousTools — differentiable acoustic optimization toolkit', date: '2026 paper; repository inspected 2026-10-16', kind: 'Open-source implementation and paper', country: 'International',
    url: 'https://github.com/JoshuaMukherjee/AcousTools/tree/bb1c522952c516aa734ba0e1cca6c2adab0e87cc',
    version: 'Pinned commit bb1c522952c516aa734ba0e1cca6c2adab0e87cc; MIT license; author manuscript arXiv:2511.07336v7',
    passageRead: 'README, license, Gorkov.py active constants, Stiffness.py functions; manuscript field propagation and optimization sections.',
    access: 'Selected source files and author manuscript inspected; final IEEE typeset article not read.', provenance: 'Author-maintained PyTorch toolkit; README links published DOI 10.1109/TUSON.2026.3659798.',
    evidence: 'Array phases, propagated complex fields and force-related objectives can be optimized; boundary-aware propagation needs geometry and calibrated assumptions.',
    limitations: 'The v7 manuscript equation 10 reverses the density numerator relative to the inspected active code; the code matches our convention. Selected numerical agreement does not validate the complete solver. A positive Hessian trace alone cannot certify 3D stability.',
    status: 'derived', topics: ['software', 'acoustics', 'optimization', 'simulation'],
  },
];
