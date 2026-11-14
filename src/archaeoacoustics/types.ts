export type TopicId = 'celestial' | 'architecture' | 'india' | 'geometry' | 'ritual' | 'brainwaves';

export interface Topic {
  id: TopicId;
  title: string;
  kicker: string;
  dek: string;
  sections: {
    title: string;
    body: string;
    evidence: 'Measured' | 'Model' | 'Tradition' | 'Unverified' | 'Limited';
    refs: { title: string; url: string }[];
  }[];
}
