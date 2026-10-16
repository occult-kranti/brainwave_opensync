/** Evidence records describe inspected sources; status is not a blanket grade. */
export interface LevitationConnection {
  id: string;
  from: string;
  to: string;
  status: 'documented' | 'derived' | 'analogy' | 'unsupported';
  explanation: string;
  missingBridge: string;
  sourceIds: readonly string[];
}

export interface LevitationSource {
  country?: 'USA' | 'China' | 'Russia' | 'International';
  id: string;
  title: string;
  date: string;
  kind: string;
  url: string;
  version: string;
  passageRead: string;
  access: string;
  provenance: string;
  evidence: string;
  limitations: string;
  status: 'measured' | 'derived' | 'proposal' | 'historical' | 'unverified';
  topics: readonly string[];
}

export interface LevitationExperiment {
  id: string;
  title: string;
  mechanism: string;
  status: 'Proposed';
  question: string;
  prediction: string;
  setup: string;
  variables: string;
  control: string;
  measurement: string;
  falsifier: string;
  limits: string;
  sourceIds: readonly string[];
}

export interface LevitationMedia {
  id: string;
  title: string;
  url: string;
  creator: string;
  published: string;
  affiliation: string;
  inspection: string;
  transcriptStatus: string;
  transcriptPath?: string;
  access: string;
  claim: string;
  limits: string;
}
