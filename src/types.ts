export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'student';
  bio?: string;
  phone?: string;
  instrument?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  content: string; // Format: [C]Lyrics [G]more lyrics
  originalKey: string;
  authorId: string;
  authorEmail: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface TheoryModule {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  topic: 'Harmony' | 'Intervals' | 'Scales' | 'Harmonic Circles';
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface AssessmentResult {
  userId: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  topic: string;
  completedAt: string;
  timeSpent: number;
  answers: UserAnswer[];
}
