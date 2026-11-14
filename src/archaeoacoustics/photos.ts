import type { TopicId } from './types';

interface ExhibitPhoto {
  file: string;
  alt: string;
  credit: string;
  url: string;
  license: string;
  licenseUrl: string;
}

const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
const PUBLIC_DOMAIN_MARK = 'https://creativecommons.org/publicdomain/mark/1.0/';

export const CHICHEN_PHOTO: ExhibitPhoto = {
  file: 'chichen.webp',
  alt: 'El Castillo at Chichén Itzá, with its central stair rising up the stepped pyramid.',
  credit: 'Daniel Schwen',
  url: 'https://commons.wikimedia.org/wiki/File:Chichen_Itza_Pyramid.jpg',
  license: 'CC BY-SA 4.0',
  licenseUrl: CC_BY_SA_4,
};

export const photos: Partial<Record<TopicId, ExhibitPhoto>> = {
  celestial: {
    file: 'giza.webp',
    alt: 'Khufu’s Great Pyramid at Giza, with people near its base.',
    credit: 'Douwe C. van der Zee',
    url: 'https://commons.wikimedia.org/wiki/File:Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: CC_BY_SA_4,
  },
  architecture: {
    file: 'hypogeum.webp',
    alt: 'An early photograph of rock-cut openings and carved stone at the Ħal Saflieni Hypogeum.',
    credit: 'Richard Ellis, before 1910',
    url: 'https://commons.wikimedia.org/wiki/File:Photo_Ellis_Hal_Salflieni.jpg',
    license: 'Public domain',
    licenseUrl: PUBLIC_DOMAIN_MARK,
  },
  india: {
    file: 'hampi.webp',
    alt: 'Stone columns and narrow carved shafts in the Mahamandapa of Vittala Temple at Hampi.',
    credit: 'VasuVR',
    url: 'https://commons.wikimedia.org/wiki/File:HBPA_N_155_MusicalPillars_Vittala_Temple_Hampi.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: CC_BY_SA_4,
  },
  geometry: {
    file: 'troia.webp',
    alt: 'The stone rose window of Troia Cathedral, with spokes radiating around a central opening.',
    credit: 'Pioggia sole',
    url: 'https://commons.wikimedia.org/wiki/File:Rosone_della_Cattedrale_di_Troia.jpg',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  ritual: {
    file: 'conch.webp',
    alt: 'A performer blows a conch shell during a Hindu ritual.',
    credit: 'Bolisetty Siva Prasad',
    url: 'https://commons.wikimedia.org/wiki/File:Playing_of_Conch_Shell.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: CC_BY_SA_4,
  },
  brainwaves: {
    file: 'eeg.webp',
    alt: 'Diagram of scalp electrode positions for EEG, labeled with the modified 10–20 system nomenclature.',
    credit: 'Brylie Christopher Oxley',
    url: 'https://commons.wikimedia.org/wiki/File:International_10-20_system_for_EEG-MCN.png',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
};
