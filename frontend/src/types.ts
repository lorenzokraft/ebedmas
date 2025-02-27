export interface Subscription {
  plan: string;
  type: string;
  maxLearners: number;
  subjects: string[];
  nextBillingDate: string;
  cardLastFour?: string;
  cardHolderName?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  role: string;
  isSubscribed: boolean;
  createdAt: string;
  lastLogin: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  subscription?: Subscription;
}

export interface Learner {
  id: number;
  name: string;
  age: number;
  grade: string;
  subjects: string[];
  created_at: string;
}

export interface Grade {
  id: number;
  name: string;
  description?: string;
}
