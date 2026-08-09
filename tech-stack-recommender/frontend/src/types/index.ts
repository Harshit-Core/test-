export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  knownSkills?: string[];
}

export interface Stack {
  id: string;
  name: string;
  description: string;
  components: string[];
  tags: string[];
  useCase: string;
  teamSize: string;
  budget: string;
  learningCurve: string;
}

export interface StackRecommendation {
  stack: Stack;
  score: number;
  matchedKeywords: string[];
  reasoning: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  duration?: string;
  isPaid: boolean;
  isRemote: boolean;
  tags: string[];
  source: 'ADZUNA' | 'REMOTEOK' | 'MANUAL';
  externalUrl: string;
  postedDate: string;
  expiryDate?: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  status: 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'REJECTED' | 'OFFER';
  notes?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedStack {
  id: string;
  userId: string;
  stackId: string;
  stack: Stack;
  notes?: string;
  createdAt: string;
}

export interface ApplicationStats {
  SAVED?: number;
  APPLIED?: number;
  INTERVIEWING?: number;
  REJECTED?: number;
  OFFER?: number;
}
