import { WeeklyDispatchItem, ExamScheduleCalculation } from '../types';

export interface SupportedExam {
  id: string;
  name: string;
  code: 'NEET' | 'IIT_JEE' | 'KEAM' | 'AISSEE' | 'AISSEE-6' | 'AISSEE-9' | 'NAVODAYA' | 'OTHER' | string;
  tagline: string;
  defaultExamDate: string; // YYYY-MM-DD
  conductingBody: string;
  targetClasses: string;
  subjects: string[];
  weeklyDeliveryPackageDescription: string;
  mockTestPattern: string;
}

export const SUPPORTED_EXAMS: SupportedExam[] = [
  {
    id: 'exam-neet-ug',
    name: 'NEET (UG) Medical Entrance',
    code: 'NEET',
    tagline: 'All India Pre-Medical Entrance for MBBS, BDS & AYUSH admissions',
    defaultExamDate: '2027-05-02',
    conductingBody: 'National Testing Agency (NTA)',
    targetClasses: 'Class 11, Class 12 & Repeaters',
    subjects: ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
    weeklyDeliveryPackageDescription: 'NCERT Line-by-Line AI Master Notes, 250+ High-Yield MCQs, Weekly 720-Mark OMR Simulator, and Video Explanations.',
    mockTestPattern: '720 Marks OMR Pattern (200 Questions / 180 to attempt)',
  },
  {
    id: 'exam-iit-jee',
    name: 'IIT JEE (Main & Advanced)',
    code: 'IIT_JEE',
    tagline: 'Premier Engineering Entrance for IITs, NITs, IIITs & Top CFTIs',
    defaultExamDate: '2027-04-05',
    conductingBody: 'NTA & Joint Admission Board (JAB)',
    targetClasses: 'Class 11, Class 12 & Droppers',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    weeklyDeliveryPackageDescription: 'Advanced Problem Sets, Numerical Value Type Question Banks, Speed-Drill Modules, and CBT Computer-Based Mock Tests.',
    mockTestPattern: '300 Marks CBT Computer Based Test Pattern with Negative Marking',
  },
  {
    id: 'exam-keam',
    name: 'KEAM (Kerala Engineering & Medical)',
    code: 'KEAM',
    tagline: 'Kerala State Entrance for Engineering, Architecture & Allied Courses',
    defaultExamDate: '2027-04-24',
    conductingBody: 'Commissioner for Entrance Examinations (CEE Kerala)',
    targetClasses: 'Class 12 Kerala HSE & CBSE / Repeaters',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    weeklyDeliveryPackageDescription: 'Kerala State Syllabus + CBSE High-Yield Cross-Reference Guides, Previous 15 Years Solved Papers, and Speed Hack Formula Vault.',
    mockTestPattern: 'CEE Computer-Based Test (CBT) with Kerala State Exam Weightage',
  },
  {
    id: 'exam-aissee-6',
    name: 'AISSEE Sainik School: Class 6 (300 Marks Track)',
    code: 'AISSEE-6',
    tagline: 'Official NTA AISSEE Class 6 pattern (125 Questions / 300 Marks)',
    defaultExamDate: '2027-01-10',
    conductingBody: 'National Testing Agency (NTA)',
    targetClasses: 'Class 5 to 6 Admission (Age 10-12)',
    subjects: ['Mathematics (150 Marks)', 'Intelligence (50 Marks)', 'General Knowledge (50 Marks)', 'English/Language (50 Marks)'],
    weeklyDeliveryPackageDescription: 'Class 6 Vedic Arithmetic Trick Sheets, Visual Non-Verbal Puzzles, Armed Forces GK Flashcards, and 300-Mark OMR Model Papers.',
    mockTestPattern: 'Class 6: 125 Questions / 300 Marks OMR Test with Zero Negative Marking',
  },
  {
    id: 'exam-aissee-9',
    name: 'AISSEE Sainik School: Class 9 (400 Marks Track)',
    code: 'AISSEE-9',
    tagline: 'Official NTA AISSEE Class 9 pattern (150 Questions / 400 Marks)',
    defaultExamDate: '2027-01-10',
    conductingBody: 'National Testing Agency (NTA)',
    targetClasses: 'Class 8 to 9 Admission (Age 13-15)',
    subjects: ['Mathematics (200 Marks)', 'General Science (50 Marks)', 'Social Studies (50 Marks)', 'Intelligence (50 Marks)', 'English (50 Marks)'],
    weeklyDeliveryPackageDescription: 'Class 9 Advanced Algebra & Mensuration Vault, NCERT Science Master Notes, 1857 Revolt & Civics Flashcards, and 400-Mark CBT/OMR Simulators.',
    mockTestPattern: 'Class 9: 150 Questions / 400 Marks OMR/CBT Test with Sectional Cutoffs',
  },
  {
    id: 'exam-aissee',
    name: 'AISSEE Sainik School (Class 6 & 9 Dual Track)',
    code: 'AISSEE',
    tagline: 'National Admission Test for Class 6 & Class 9 Sainik Schools',
    defaultExamDate: '2027-01-10',
    conductingBody: 'National Testing Agency (NTA)',
    targetClasses: 'Class 5 to 6 & Class 8 to 9 Admissions',
    subjects: ['Mathematics & Arithmetic', 'Intelligence & Reasoning', 'Language (English/Malayalam)', 'General Knowledge & Science'],
    weeklyDeliveryPackageDescription: 'Visual Reasoning Flashcards, Fast Mental Math Trick Sheets, Bilingual Vocabulary Drill, and Sainik School OMR Practice Sets.',
    mockTestPattern: 'Class 6: 300 Marks / Class 9: 400 Marks OMR Test with Sectional Cutoffs',
  },
  {
    id: 'exam-navodaya',
    name: 'Navodaya Vidyalaya JNVST (Class 6 & 9)',
    code: 'NAVODAYA',
    tagline: 'Jawahar Navodaya Vidyalaya Selection Test for 100% Free Residential Education',
    defaultExamDate: '2027-01-18',
    conductingBody: 'Navodaya Vidyalaya Samiti (NVS)',
    targetClasses: 'Class 5 students for Class 6, and Class 8 for Class 9',
    subjects: ['Mental Ability Test (MAT)', 'Arithmetic Test', 'Language Reading Comprehension'],
    weeklyDeliveryPackageDescription: '80 Non-Verbal Pattern Puzzle Packs, Fast Calculation Shortcuts, Reading Passage Analysis, and Exact JNVST Exam Replica Papers.',
    mockTestPattern: '100 Marks / 80 Questions in 2 Hours (OMR Sheet with Zero Negative Marking)',
  },
];

export function calculateDaysToExam(targetDateStr?: string, fromDate: Date = new Date()): number {
  if (!targetDateStr) return 180;
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) return 180;
  const diffTime = target.getTime() - fromDate.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(days) ? 180 : days);
}

export function calculateWeeksToExam(daysOrDate: number | string): number {
  if (typeof daysOrDate === 'string') {
    if (daysOrDate.includes('-') || daysOrDate.includes('/')) {
      const days = calculateDaysToExam(daysOrDate);
      return Math.max(1, Math.ceil(days / 7));
    }
    const parsed = Number(daysOrDate);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.max(1, Math.ceil(parsed / 7));
    }
    return 1;
  }
  if (typeof daysOrDate === 'number' && !isNaN(daysOrDate) && daysOrDate > 0) {
    return Math.max(1, Math.ceil(daysOrDate / 7));
  }
  return 1;
}

export function formatFriendlyDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Generate the personalized week-by-week study material dispatch timetable
export function generateWeeklyDispatchRoadmap(
  examCode: string,
  examName: string,
  targetDateStr: string,
  startDate: Date = new Date()
): ExamScheduleCalculation {
  const target = new Date(targetDateStr);
  const daysRemaining = calculateDaysToExam(targetDateStr, startDate);
  const totalWeeks = calculateWeeksToExam(daysRemaining);

  // Subject syllabus maps per exam
  const examSubjectsMap: Record<string, string[]> = {
    NEET: ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
    IIT_JEE: ['Mathematics', 'Physics', 'Chemistry'],
    KEAM: ['Mathematics', 'Physics', 'Chemistry'],
    AISSEE: ['Mathematics', 'Intelligence Test', 'Language Proficiency', 'General Knowledge'],
    NAVODAYA: ['Mental Ability (MAT)', 'Arithmetic Speed Test', 'Language Comprehension'],
  };

  const subjects = examSubjectsMap[examCode] || ['Core Subject 1', 'Core Subject 2', 'General Aptitude'];

  // Topic templates per exam code
  const syllabusTopics: Record<string, string[]> = {
    NEET: [
      'Cell Biology, Structural Organization & Basic Math in Physics',
      'Kinematics, Vector Calculus & Atomic Structure',
      'Chemical Bonding, Periodicity & Plant Physiology',
      'Laws of Motion, Work Energy Power & Organic Chemistry Fundamentals',
      'Thermodynamics, States of Matter & Human Physiology (Digestion & Breathing)',
      'Gravitation, Rotational Mechanics & Hydrocarbons',
      'Human Circulation, Excretion & Coordination Compounds',
      'Optics (Ray & Wave) & Biomolecules / Polymers',
      'Genetics & Molecular Basis of Inheritance',
      'Electrodynamics, Current Electricity & Aldehydes/Ketones',
      'Evolution, Human Health & Magnetism',
      'Modern Physics, Semiconductors & Electrochemistry',
      'Biotechnology Principles & Chemical Kinetics',
      'Ecology, Environment & Solutions / Surface Chemistry',
      'Full Syllabus NCERT Line-by-Line Revision & Assertion-Reasoning Drill',
      'High-Yield Error Recovery & Rapid 720-Mark Full Mock Simulation',
    ],
    IIT_JEE: [
      'Functions, Trigonometry & Units/Dimensions in Physics',
      'Kinematics 1D/2D, Newton Laws & Periodic Table',
      'Quadratic Equations, Complex Numbers & Atomic Structure',
      'Work Energy Power, System of Particles & Chemical Bonding',
      'Permutations & Combinations, Binomial Theorem & Thermodynamics',
      'Rotational Dynamics & Gaseous State',
      'Sequences & Series, Straight Lines & General Organic Chemistry',
      'Circles, Conic Sections & Chemical Equilibrium',
      'Fluid Mechanics, SHM & Waves & Ionic Equilibrium',
      'Differential Calculus (Limits, Continuity, Derivatives) & Coordination Compounds',
      'Integral Calculus & s/p/d/f Block Chemistry',
      'Electrostatics, Capacitors & Current Electricity',
      'Magnetic Effects, Electromagnetic Induction & Aldehydes/Ketones',
      'Vectors, 3D Geometry, Probability & Amines/Polymers',
      'Modern Physics, Wave Optics & Physical Chemistry Mastery',
      'Advanced 300-Mark Computer-Based Test (CBT) Speed & Accuracy Drills',
    ],
    KEAM: [
      'Calculus Fundamentals & Physical World / Motion',
      'Matrices, Determinants & Basic Concepts of Chemistry',
      'Laws of Motion, Work Power & Chemical Thermodynamics',
      'Coordinate Geometry & States of Matter / Solutions',
      'Vectors & 3D Geometry + Electrostatics Drills',
      'Current Electricity, Magnetism & Organic Chemistry Basics',
      'Differential Equations & Chemical Kinetics',
      'Optics & Modern Physics + Hydrocarbons',
      'Previous 10 Years KEAM Kerala HSE Weightage Problem Sets',
      'Full Length KEAM Engineering CBT Speed & Shortcut Strategy',
    ],
    AISSEE: [
      'Number System, Fractions & Decimals with Speed Vedic Tricks',
      'Intelligence: Analogy, Classification & Pattern Series',
      'Language: Reading Comprehension, Synonyms & Grammar Essentials',
      'General Knowledge: History, Geography, Indian Defence Forces',
      'Measurement, Area, Perimeter, Volume & Non-Verbal Reasoning',
      'Science: Living Organisms, Food, Health, Natural Resources',
      'Ratio, Percentage, Simple Interest & Coding-Decoding Puzzles',
      'Sainik School Complete OMR Sheet Exam Simulations',
    ],
    NAVODAYA: [
      'Mental Ability: Odd Man Out, Figure Matching & Pattern Completion',
      'Arithmetic: LCM, HCF, Factors & Basic Fractional Calculations',
      'Language: Malayalam/English Contextual Story Passages',
      'Figure Series, Analogy & Geometric Figure Completion (Square/Triangle)',
      'Arithmetic: Percentage, Profit & Loss, Speed-Distance-Time',
      'Mirror Images, Punched Hole Patterns & Embedded Figures',
      'Space Visualization & 80-Question Real JNVST Simulation Sheets',
    ],
  };

  const topicsList = syllabusTopics[examCode] || [
    'Foundations & Core Principles',
    'Applied Problem Solving',
    'Advanced High-Yield Topics',
    'Comprehensive Mock Drills',
  ];

  const dispatches: WeeklyDispatchItem[] = [];

  // Determine how many weeks to map (cap at totalWeeks or at least 1)
  const displayWeeks = Math.min(totalWeeks, 52);

  for (let i = 1; i <= displayWeeks; i++) {
    // calculate release date: Week 1 is now, Week 2 is +7 days, etc.
    const dispatchDate = new Date(startDate.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
    
    // Determine phase based on percentage of completion towards exam
    const progressRatio = i / displayWeeks;
    let phase: WeeklyDispatchItem['phase'] = 'Foundation';
    if (progressRatio > 0.85) {
      phase = 'Final Grand Revision';
    } else if (progressRatio > 0.65) {
      phase = 'Intensive Mocks';
    } else if (progressRatio > 0.35) {
      phase = 'Advanced Drills';
    } else if (progressRatio > 0.15) {
      phase = 'Core Syllabus';
    }

    const topicIndex = (i - 1) % topicsList.length;
    const topicTitle = topicsList[topicIndex];

    const questionCount = 100 + ((i * 15) % 150);

    dispatches.push({
      weekNumber: i,
      releaseDate: formatFriendlyDate(dispatchDate),
      phase,
      title: `Week ${i}: ${topicTitle}`,
      subjectsCovered: subjects,
      materials: {
        theoryNotes: `Comprehensive NCERT-aligned concise study notes with memory maps & formula charts`,
        questionBankCount: questionCount,
        mockTestType: phase === 'Final Grand Revision' 
          ? `Full Length All-India Ranked Mock Test (Exact Exam Pattern)` 
          : `Weekly Subject Unit Assessment (${questionCount} Questions)`,
        specialFeature: i === 1 
          ? `Instant Welcome Diagnostic Test & Customized Study Calendar` 
          : `AI Performance Breakdown, Negative Marking Analysis & Mentor WhatsApp Doubt Session`,
      },
      status: i === 1 ? 'unlocked' : 'scheduled',
    });
  }

  return {
    examName,
    examDate: formatFriendlyDate(target),
    daysRemaining,
    weeksRemaining: totalWeeks,
    dispatches,
  };
}
