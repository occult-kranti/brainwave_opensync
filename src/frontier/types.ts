export interface ResearchSource {
  id: string; title: string; url: string; kind: 'repository' | 'video' | 'transcript' | 'paper' | 'patent' | 'government' | 'book' | 'official';
  date: string; locator: string; access: string; summary: string; limitation: string;
}
export interface ClaimAudit {
  id: string; title: string; attribution: string; status: 'documented statement' | 'digest only' | 'unverified lead';
  physicalQuestion: string; ordinaryExplanation: string; missingEvidence: string; sourceIds: string[];
}
export interface ResearchConnection {
  id: string; from: string; to: string; relation: 'documents' | 'analogy' | 'tests' | 'unsupported'; explanation: string; sourceIds: string[];
}
export interface FrequencyHypothesis {
  id: string; title: string; useCase: string; channel: string; variables: string; model: string; prediction: string;
  setup: string; control: string; observable: string; falsifier: string; limitation: string; sourceIds: string[]; presetIds: string[];
}
