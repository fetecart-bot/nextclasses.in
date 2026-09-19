export type CourseCategory = 'all' | 'ai_platforms' | 'competitive_exams' | 'languages' | 'educators' | 'students' | 'beginners' | 'creators' | 'automation';

export type ProductCategory = 'all' | 'prompts' | 'toolkits' | 'ebooks' | 'templates';

export interface CurriculumModule {
  moduleNumber: number;
  title: string;
  duration: string;
  lessons: string[];
}

export interface Instructor {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  credentials: string;
}

export interface WeeklyDispatchItem {
  weekNumber: number;
  releaseDate: string;
  phase: 'Foundation' | 'Core Syllabus' | 'Advanced Drills' | 'Intensive Mocks' | 'Final Grand Revision';
  title: string;
  subjectsCovered: string[];
  materials: {
    theoryNotes: string;
    questionBankCount: number;
    mockTestType: string;
    specialFeature: string;
  };
  status: 'unlocked' | 'scheduled';
}

export interface ExamScheduleCalculation {
  examName: string;
  examDate: string;
  targetExamDate?: string;
  examCode?: string;
  daysRemaining: number;
  weeksRemaining: number;
  dispatches: WeeklyDispatchItem[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: CourseCategory;
  level: 'Beginner' | 'Intermediate' | 'All Levels' | string;
  language: 'All Indian Languages & English' | 'Malayalam & English' | 'English' | 'Malayalam' | 'French & English' | 'German & English' | string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  badge?: string;
  thumbnail: string;
  duration: string;
  format: '100% Self-Paced • Instant Access' | 'Self-Paced Recorded' | 'Live Cohort + Recorded' | 'Live Masterclass' | 'Weekly Adaptive Prep' | string;
  nextCohortDate: string;
  highlights: string[];
  toolsCovered: string[];
  curriculum: CurriculumModule[];
  targetAudience: string[];
  instructor: Instructor;
  isCompetitiveExam?: boolean;
  targetExamCode?: 'NEET' | 'IIT_JEE' | 'KEAM' | 'AISSEE' | 'AISSEE-6' | 'AISSEE-9' | 'NAVODAYA' | 'OTHER' | string;
  examName?: string;
  defaultExamDate?: string;
  subjects?: string[];
  weeklyDeliveryPlanSummary?: string;
  previewVideoUrl?: string;
  videoEmbedUrl?: string;
  demoVideoTitle?: string;
}

export interface AIProduct {
  id: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  rating: number;
  downloadsCount: number;
  badge?: string;
  thumbnail: string;
  format: string;
  fileType: string;
  features: string[];
  previewSnippet?: string;
}

export interface CartItem {
  id: string;
  itemType: 'course' | 'product';
  title: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  format: string;
  category: string;
  isCompetitiveExam?: boolean;
  targetExamCode?: string;
  examName?: string;
  targetExamDate?: string;
  calculatedDaysToExam?: number;
  calculatedWeeksCount?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  institution: string;
  avatar: string;
  courseTaken: string;
  rating: number;
  text: string;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PortalVideoLesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  company: string;
  youtubeId: string;
  youtubeUrl: string;
  description: string;
  badge?: string;
  language?: string;
  languageName?: string;
  languageNativeName?: string;
  languageFlag?: string;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  standard?: 'class-6' | 'class-9' | string;
  enrolledCourseIds: string[];
  targetExamCode?: string;
  targetExamDate?: string;
  learningGoal?: string;
  registeredAt: string;
  credentialsDeliveredViaEmail?: boolean;
  credentialsEmailSentAt?: string;
  paymentReference?: string;
  completedLessons?: number[];
  mockTestScores?: {
    testId: string;
    testTitle: string;
    score: number;
    totalMarks: number;
    accuracy: number;
    date: string;
  }[];
}

export interface MockQuestion {
  id: number;
  subject: string;
  topic: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
}

export interface MockTest {
  id: string;
  title: string;
  description?: string;
  examCode: string;
  category: 'competitive' | 'ai_platform';
  durationMinutes: number;
  totalMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  instructions: string[];
  questions: MockQuestion[];
}

export interface MockTestResult {
  testId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  accuracyPercentage: number;
  percentileEstimate: number;
  timeTakenSeconds: number;
  submittedAt: string;
}

export interface WhatsAppDispatchLog {
  id: string;
  dispatchWeek: number;
  examName: string;
  recipientPhone: string;
  status: 'Delivered' | 'Scheduled' | 'Pending';
  timestamp: string;
  packTitle: string;
  pdfDownloadUrl: string;
  mockTestLink: string;
}

