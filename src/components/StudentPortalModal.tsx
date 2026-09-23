import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  X, Play, CheckCircle2, Clock, Calendar, Download, Send, 
  Copy, Check, Award, Tv, ExternalLink, Target, 
  BarChart3, ArrowRight, Loader2, MessageCircle, Settings, BookOpen, Sparkles,
  Lock, KeyRound, LogOut, Mail, Eye, EyeOff, UserCheck, ShieldCheck, Medal, Mic, Radio
} from 'lucide-react';
import StudentBadges from './StudentBadges';
import { useAuth } from '../context/AuthContext';
import { MOCK_TESTS_DATA } from '../data/mockTestsData';
import { downloadStudyMaterialFile, generateWhatsAppDispatchMessage, STUDY_MATERIALS_DATABASE } from '../utils/studyMaterialGenerator';
import { COURSES_DATA } from '../data';
import { PortalVideoLesson } from '../types';
import { generateMailtoUrl } from '../utils/studentRegistry';
import { COURSE_VIDEO_PLAYLISTS } from '../utils/courseVideos';
import { CourseVoiceDoubtBot } from './CourseVoiceDoubtBot';
import { StudentFriendWelcomeBot } from './StudentFriendWelcomeBot';

function calculateDaysToExam(targetDateStr: string): number {
  try {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 295;
  } catch {
    return 295;
  }
}

function calculateWeeksToExam(days: number): number {
  return Math.max(1, Math.ceil(days / 7));
}

interface StudentPortalModalProps {
  onClose: () => void;
  onLaunchMockTest?: (testId: string) => void;
  portalVideos?: PortalVideoLesson[];
  initialCourseId?: string;
}

// Course-specific Curriculums
const COURSE_CURRICULUMS: Record<string, {
  courseTitle: string;
  examCode: string;
  videos: PortalVideoLesson[];
  weeklyPackages: {
    week: number;
    title: string;
    releaseDate: string;
    status: string;
    modules: string[];
  }[];
  prompts: { title: string; text: string }[];
  certificateTitle: string;
}> = {
  'course-aissee-sainik-6': {
    courseTitle: 'AISSEE 2027: Class 6 Entrance Success Kit (Sainik School 300 Marks)',
    examCode: 'AISSEE-6',
    certificateTitle: 'AISSEE Class 6 Sainik School Entrance Foundation & Aptitude Mastery',
    videos: [
      {
        id: 'sainik6-vid-1',
        title: '01. Class 6 Mathematics: Fast Mental Arithmetic, LCM/HCF & Fractions',
        duration: '38:40',
        company: 'Numberphile (Official)',
        youtubeId: 'd8TRcZklX_Q',
        youtubeUrl: 'https://www.youtube.com/watch?v=d8TRcZklX_Q',
        description: 'Complete breakdown of the 50-question (150 marks) Class 6 Mathematics section: Vedic shortcuts, LCM & HCF fundamental theorem, unitary method, and speed calculations.',
        completed: false,
        badge: 'Class 6 Math (150 Marks)',
      },
      {
        id: 'sainik6-vid-2',
        title: '02. Class 6 Intelligence & Non-Verbal Reasoning: Analogies & Pattern Series',
        duration: '32:15',
        company: 'NextClass Reasoning Lab',
        youtubeId: '7yDmGnA8Hw0',
        youtubeUrl: 'https://www.youtube.com/watch?v=7yDmGnA8Hw0',
        description: 'Step-by-step visual puzzle solving, mirror images, pattern series completion, embedded figures, and direction sense tests for Class 6.',
        completed: false,
        badge: 'Class 6 Reasoning (50 Marks)',
      },
      {
        id: 'sainik6-vid-3',
        title: '03. Class 6 General Knowledge & Defence Forces: Param Vir Chakra & Commands',
        duration: '28:10',
        company: 'NextClass GK Council',
        youtubeId: 'Yocja_N5s1I',
        youtubeUrl: 'https://www.youtube.com/watch?v=Yocja_N5s1I',
        description: 'Param Vir Chakra recipients, Indian Army/Navy/Air Force commands, national parks, capitals, monuments, and Class 6 general science trivia.',
        completed: false,
        badge: 'Class 6 GK (50 Marks)',
      },
      {
        id: 'sainik6-vid-4',
        title: '04. Class 6 English Grammar & Unseen Comprehension Mastery',
        duration: '25:30',
        company: 'NextClass Language Hub',
        youtubeId: 'KaA_mxga3PQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=KaA_mxga3PQ',
        description: 'Grammar fundamentals: Parts of speech, synonyms, antonyms, spelling correction, sentence re-ordering, and unseen passage strategies.',
        completed: false,
        badge: 'Class 6 Language (50 Marks)',
      },
      {
        id: 'sainik6-vid-5',
        title: '05. Class 6 OMR Sheet Bubbling Strategy & 300-Mark Speed Allocation',
        duration: '18:45',
        company: 'NextClass Exam Wing',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Official NTA AISSEE Class 6 OMR sheet protocol: Zero negative marking strategy, pen selection, 150-minute time budgeting, and last-minute score maximizers.',
        completed: false,
        badge: 'Class 6 300M Strategy',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Class 6 Mathematics & Speed Arithmetic Master Pack (150 Marks)',
        releaseDate: 'Active (Available Now)',
        status: 'Available',
        modules: [
          'High-Yield Class 6 Mathematics Formula Mind Map (PDF)',
          '100+ Model Arithmetic Questions with Step-by-Step Solutions',
          'Unitary Method & Profit/Loss Shortcut Tables',
          'Printable 50-Question Daily Diagnostic Worksheet',
        ],
      },
      {
        week: 2,
        title: 'Class 6 Intelligence & Visual Non-Verbal Reasoning Puzzle Bank',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          '150+ Illustrated Pattern & Figure Series Puzzles',
          'Analogy, Odd-One-Out & Code Decoding Rules',
          'Mirror Images & Embedded Figure Drills',
          '20-Minute Timed Reasoning Speed Test',
        ],
      },
      {
        week: 3,
        title: 'Class 6 Indian Armed Forces & General Knowledge 200-Question Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Gallantry Awards & Armed Forces Ranks Hierarchy Chart',
          'Indian Rivers, Capitals, National Parks & Solar System Flashcards',
          'Basic Everyday Science & Human Body Quick Reference',
          '100 High-Probability GK Multiple Choice Questions',
        ],
      },
      {
        week: 4,
        title: 'Class 6 AISSEE Full-Length Model OMR Mock Exam Kit (300 Marks)',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Full-Length 125-Question (300 Marks) Class 6 Official Blueprint Paper',
          'High-Resolution Printable OMR Sheet for Real Pen-and-Paper Practice',
          'Complete Answer Key with Step-by-Step Mathematical Solutions',
          'All-India Cutoff Analysis & Safe Score Targets for Class 6 Sainik Schools',
        ],
      },
    ],
    prompts: [
      {
        title: 'Class 6 AISSEE Mathematics Vedic Arithmetic Problem Generator',
        text: 'Act as an expert Sainik School Entrance (AISSEE) Class 6 Mathematics educator. Generate 5 high-yield Class 6 arithmetic word problems covering LCM/HCF, Unitary Method, Speed/Distance, and Fractions. For each question, provide 4 options (A, B, C, D) followed by a 1-sentence Vedic shortcut solution.',
      },
      {
        title: 'Class 6 Non-Verbal Reasoning Pattern Explanation Assistant',
        text: 'Explain the 5 most common pattern traps in Class 6 AISSEE Intelligence non-verbal series questions: 1) 45-degree rotational steps, 2) Shading alternation, 3) Line addition/subtraction, 4) Mirror inversion, and 5) Size scaling. Include a memory rule for 10-year-old aspirants.',
      },
      {
        title: 'Class 6 Indian Armed Forces & Defence GK Rapid-Fire Quiz Drill',
        text: 'Generate a 10-question rapid-fire revision drill on Indian Defence Forces: Army commands, Air Force fighter aircraft names, Navy aircraft carriers, Param Vir Chakra recipients, and National War Memorial facts. Provide instant answer checks.',
      },
    ],
  },

  'course-aissee-sainik-9': {
    courseTitle: 'AISSEE 2027: Class 9 Entrance Advanced Sprint (Sainik School 400 Marks)',
    examCode: 'AISSEE-9',
    certificateTitle: 'AISSEE Class 9 Sainik School Entrance Advanced Academic Excellence',
    videos: [
      {
        id: 'sainik9-vid-1',
        title: '01. Class 9 Advanced Mathematics: Linear Equations, Mensuration & Exponents (200 Marks)',
        duration: '45:30',
        company: '3Blue1Brown (Math Foundations)',
        youtubeId: 'fNk_zzaMoSs',
        youtubeUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
        description: 'Class 9 heavyweight Mathematics: 50 Questions carrying 4 Marks each (200 Marks total). NCERT Class 8 advanced algebraic identities, cylinders/cuboids mensuration, compound interest, and powers/exponents.',
        completed: false,
        badge: 'Class 9 Math (200 Marks / 50%)',
      },
      {
        id: 'sainik9-vid-2',
        title: '02. Class 9 General Science: Motion in a Straight Line & Physics Laws',
        duration: '36:10',
        company: 'Crash Course Physics',
        youtubeId: 'ZM8ECpBuQYE',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE',
        description: '25 Questions (50 Marks): Force and pressure, friction, sound, metals and non-metals, cell structure and reproduction in animals with NCERT highlights.',
        completed: false,
        badge: 'Class 9 Science (50 Marks)',
      },
      {
        id: 'sainik9-vid-3',
        title: '03. Class 9 Social Studies: Agricultural Revolution & History',
        duration: '30:45',
        company: 'Crash Course World History',
        youtubeId: 'Yocja_N5s1I',
        youtubeUrl: 'https://www.youtube.com/watch?v=Yocja_N5s1I',
        description: '25 Questions (50 Marks): Indian National Movement, leaders of 1857, Fundamental Rights, Judiciary, resources, and geography of India.',
        completed: false,
        badge: 'Class 9 Social Studies (50 Marks)',
      },
      {
        id: 'sainik9-vid-4',
        title: '04. Class 9 Intelligence & Logical Reasoning: Syllogisms & Logic Riddles',
        duration: '28:50',
        company: 'TED-Ed Riddles (Official)',
        youtubeId: '7yDmGnA8Hw0',
        youtubeUrl: 'https://www.youtube.com/watch?v=7yDmGnA8Hw0',
        description: '25 Questions (50 Marks): Advanced coding-decoding, blood relations, syllogistic reasoning, mathematical operations, and matrix grids.',
        completed: false,
        badge: 'Class 9 Reasoning (50 Marks)',
      },
      {
        id: 'sainik9-vid-5',
        title: '05. Class 9 English Grammar: Active/Passive Voice & Direct/Indirect Speech',
        duration: '22:15',
        company: 'NextClass Language Wing',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: '25 Questions (50 Marks): Voice conversions, reported speech rules, modal auxiliaries, clauses, idioms, and reading comprehension.',
        completed: false,
        badge: 'Class 9 English (50 Marks)',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Class 9 Advanced Mathematics (200 Marks) Algebra & Mensuration Vault',
        releaseDate: 'Active (Available Now)',
        status: 'Available',
        modules: [
          'NCERT Class 8 Algebraic Identities & Factorisation Formulas (PDF)',
          '50 High-Yield 4-Mark Mathematics Questions with Detailed Proofs',
          'Mensuration Formula Sheet (Cylinder, Cone, Cuboid Surface Area & Volume)',
          'Linear Equations Word Problem Speed Checklist',
        ],
      },
      {
        week: 2,
        title: 'Class 9 General Science (Physics, Chemistry, Biology) NCERT Master Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Physics Formula Sheet: Pressure = F/A, Speed of Sound, Laws of Reflection',
          'Metals vs Non-Metals Reactivity Series Quick-Memoriser',
          'Biology Diagrams & Organelle Functions Summary',
          '100 NCERT Exemplar MCQ Practice Bank with Explanations',
        ],
      },
      {
        week: 3,
        title: 'Class 9 Social Studies & Advanced Reasoning Diagnostic Puzzles',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Revolt of 1857 Timeline & Major Centers Flashcards',
          'The Constitution of India: Preamble, Articles & Key Amendments',
          '50 Advanced Venn Diagrams & Syllogism Puzzles',
          'Blood Relations Family Tree Decoder Guide',
        ],
      },
      {
        week: 4,
        title: 'Class 9 Full-Length 150-Question (400 Marks) CBT Mock Test & OMR Simulator',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Full-Length 150-Question (400 Marks) Official NTA Class 9 Blueprint Mock',
          'Printable 400-Mark 5-Section Official OMR Sheet',
          'Step-by-Step Mathematical Solutions for all 50 Math Questions',
          'All-India Class 9 Sainik School Cutoff Predictor & Merit Targets',
        ],
      },
    ],
    prompts: [
      {
        title: 'Class 9 Advanced Algebra & Mensuration Formula Synthesizer',
        text: 'Act as an expert Sainik School Entrance (AISSEE) Class 9 Mathematics educator. Explain the quickest methods to solve cylinder surface area problems and algebraic factorization questions. Provide 3 challenging 4-mark model questions with step-by-step solutions.',
      },
      {
        title: 'Class 9 NCERT Science Rapid Revision & Exception Drills',
        text: 'Generate a 10-question high-yield drill for Class 9 AISSEE General Science focusing on exceptions in chemistry (e.g. mercury as liquid metal, graphite as conductor) and physics optics laws. Include concise explanations.',
      },
      {
        title: 'Class 9 1857 Revolt & Indian Constitution Mock Question Generator',
        text: 'Create 8 challenging Social Studies MCQs for AISSEE Class 9 covering the 1857 revolt leaders, Indian parliamentary democracy, and fundamental rights. Provide detailed historical context for each answer.',
      },
    ],
  },

  'course-aissee-sainik': {
    courseTitle: 'AISSEE 2027: All India Sainik School Entrance (Class 6 & 9)',
    examCode: 'AISSEE',
    certificateTitle: 'AISSEE Sainik School Entrance Foundation & Aptitude Mastery',
    videos: [
      {
        id: 'sainik-vid-1',
        title: '01. Sainik School Mathematics: Fast Mental Arithmetic, LCM/HCF & Fractions',
        duration: '38:40',
        company: 'Numberphile (Official)',
        youtubeId: 'd8TRcZklX_Q',
        youtubeUrl: 'https://www.youtube.com/watch?v=d8TRcZklX_Q',
        description: 'Complete breakdown of the 50-question (150 marks) Class 6 & 9 Mathematics section: Vedic shortcuts, LCM & HCF fundamental theorem, unitary method, and speed calculations.',
        completed: false,
        badge: 'High-Yield Math (150 Marks)',
      },
      {
        id: 'sainik-vid-2',
        title: '02. AISSEE Intelligence & Non-Verbal Reasoning: Logic & Riddles',
        duration: '32:15',
        company: 'TED-Ed Riddles (Official)',
        youtubeId: '7yDmGnA8Hw0',
        youtubeUrl: 'https://www.youtube.com/watch?v=7yDmGnA8Hw0',
        description: 'Step-by-step visual puzzle solving, mirror images, pattern series completion, embedded figures, and direction sense tests.',
        completed: false,
        badge: 'Reasoning (50 Marks)',
      },
      {
        id: 'sainik-vid-3',
        title: '03. AISSEE General Knowledge: World History & Human Civilization',
        duration: '28:10',
        company: 'Crash Course World History',
        youtubeId: 'Yocja_N5s1I',
        youtubeUrl: 'https://www.youtube.com/watch?v=Yocja_N5s1I',
        description: 'Param Vir Chakra recipients, Indian Army/Navy/Air Force commands, national parks, capitals, monuments, and general science trivia.',
        completed: false,
        badge: 'General Knowledge (50 Marks)',
      },
      {
        id: 'sainik-vid-4',
        title: '04. AISSEE English: 5 Steps to Spoken & Written Fluency',
        duration: '25:30',
        company: 'Oxford Online English (Official)',
        youtubeId: 'KaA_mxga3PQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=KaA_mxga3PQ',
        description: 'Grammar fundamentals: Parts of speech, synonyms, antonyms, spelling correction, sentence re-ordering, and unseen passage strategies.',
        completed: false,
        badge: 'Language (50 Marks)',
      },
      {
        id: 'sainik-vid-5',
        title: '05. Sainik School OMR Sheet Bubbling Strategy & 300-Mark Speed Allocation',
        duration: '18:45',
        company: 'NextClass Exam Wing',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Official NTA AISSEE OMR sheet protocol: Zero negative marking strategy, pen selection, 150-minute time budgeting, and last-minute score maximizers.',
        completed: false,
        badge: 'OMR Exam Strategy',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Sainik School Mathematics & Speed Arithmetic Master Pack',
        releaseDate: 'Active (Available Now)',
        status: 'Available',
        modules: [
          'High-Yield Mathematics Formula Mind Map (PDF)',
          '100+ Model Arithmetic Questions with Step-by-Step Solutions',
          'Unitary Method & Profit/Loss Shortcut Tables',
          'Printable 50-Question Daily Diagnostic Worksheet',
        ],
      },
      {
        week: 2,
        title: 'Intelligence & Visual Non-Verbal Reasoning Puzzle Bank',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          '150+ Illustrated Pattern & Figure Series Puzzles',
          'Analogy, Odd-One-Out & Code Decoding Rules',
          'Mirror Images & Embedded Figure Drills',
          '20-Minute Timed Reasoning Speed Test',
        ],
      },
      {
        week: 3,
        title: 'Indian Armed Forces & General Knowledge 200-Question Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Gallantry Awards & Armed Forces Ranks Hierarchy Chart',
          'Indian Rivers, Capitals, National Parks & Solar System Flashcards',
          'Basic Everyday Science & Human Body Quick Reference',
          '100 High-Probability GK Multiple Choice Questions',
        ],
      },
      {
        week: 4,
        title: 'AISSEE Full-Length Model OMR Mock Exam Kit',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: [
          'Full-Length 125-Question (300 Marks) Class 6 Official Blueprint Paper',
          'High-Resolution Printable OMR Sheet for Real Pen-and-Paper Practice',
          'Complete Answer Key with Step-by-Step Mathematical Solutions',
          'All-India Cutoff Analysis & Safe Score Targets for Sainik Schools',
        ],
      },
    ],
    prompts: [
      {
        title: 'AISSEE Mathematics Vedic Arithmetic Problem Generator',
        text: 'Act as an expert Sainik School Entrance (AISSEE) Mathematics educator. Generate 5 high-yield Class 6 arithmetic word problems covering LCM/HCF, Unitary Method, Speed/Distance, and Fractions. For each question, provide 4 options (A, B, C, D) followed by a 1-sentence Vedic shortcut solution.',
      },
      {
        title: 'Non-Verbal Reasoning Pattern Explanation Assistant',
        text: 'Explain the 5 most common pattern traps in AISSEE Intelligence non-verbal series questions: 1) 45-degree rotational steps, 2) Shading alternation, 3) Line addition/subtraction, 4) Mirror inversion, and 5) Size scaling. Include a memory rule for 10-year-old aspirants.',
      },
      {
        title: 'Indian Armed Forces & Defence GK Rapid-Fire Quiz Drill',
        text: 'Generate a 10-question rapid-fire revision drill on Indian Defence Forces: Army commands, Air Force fighter aircraft names, Navy aircraft carriers, Param Vir Chakra recipients, and National War Memorial facts. Provide instant answer checks.',
      },
    ],
  },

  'course-navodaya-jnvst': {
    courseTitle: 'Navodaya Vidyalaya (JNVST Class 6 & 9) 2027 Rapid Kit',
    examCode: 'NAVODAYA',
    certificateTitle: 'JNVST Navodaya Vidyalaya Entrance Aptitude Diploma',
    videos: [
      {
        id: 'navodaya-vid-1',
        title: '01. JNVST Mental Ability Test (MAT): Figure Matching & Series Completion',
        duration: '35:20',
        company: 'TED-Ed Riddles (Official)',
        youtubeId: '7yDmGnA8Hw0',
        youtubeUrl: 'https://www.youtube.com/watch?v=7yDmGnA8Hw0',
        description: 'Complete breakdown of the 40-question (50 marks) Mental Ability Test in JNVST: Odd-man-out, pattern completion, and paper folding.',
        completed: false,
        badge: 'Mental Ability (50 Marks)',
      },
      {
        id: 'navodaya-vid-2',
        title: '02. JNVST Arithmetic Section: Decimal Numbers & 5-Digit Operations',
        duration: '30:10',
        company: 'Numberphile (Official)',
        youtubeId: 'd8TRcZklX_Q',
        youtubeUrl: 'https://www.youtube.com/watch?v=d8TRcZklX_Q',
        description: 'The 20-question (25 marks) arithmetic section: Number systems, simplification, approximations, and perimeter/area.',
        completed: false,
        badge: 'Arithmetic (25 Marks)',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'JNVST Mental Ability (MAT) Figure Series Kit',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Figure Matching Worksheet', 'Pattern Series Mind Map', '200 Practice Questions'],
      },
      {
        week: 2,
        title: 'JNVST Arithmetic & Language Passages Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Arithmetic Shortcuts Sheet', '4 Unseen Hindi/English Passages', 'Full OMR Paper'],
      },
    ],
    prompts: [
      {
        title: 'JNVST Mental Ability Odd-Man-Out Drill',
        text: 'Generate 5 geometric figure reasoning questions where 3 figures share a symmetry or rotational property and 1 is different. Explain the rule clearly.',
      },
    ],
  },

  'course-claude-ai': {
    courseTitle: 'Master Claude AI & Advanced Prompt Engineering 2026',
    examCode: 'CLAUDE-AI',
    certificateTitle: 'Anthropic Claude AI Prompt & Artifacts Architecture Certification',
    videos: [
      {
        id: 'claude-vid-1',
        title: '01. Claude 3.7 Sonnet Architecture & Extended Thinking Models',
        duration: '16:40',
        company: 'Anthropic AI Engineering',
        youtubeId: 'kBp-PxsotMo',
        youtubeUrl: 'https://www.youtube.com/watch?v=kBp-PxsotMo',
        description: 'Master Claude 3.7 hybrid reasoning: Toggle between near-instant responses and deep step-by-step thinking mode with configurable token budgets.',
        completed: false,
        badge: 'Claude 3.7 Mastery',
      },
      {
        id: 'claude-vid-2',
        title: '02. Interactive Artifacts & Single-File Application Development',
        duration: '18:15',
        company: 'Kevin Stratvert',
        youtubeId: '1PRcdCu8n6M',
        youtubeUrl: 'https://www.youtube.com/watch?v=1PRcdCu8n6M',
        description: 'Building live React components, SVG diagrams, and financial calculators directly inside Claude Artifacts.',
        completed: false,
        badge: 'Artifacts Architecture • HD',
      },
      {
        id: 'claude-vid-3',
        title: '03. Prompting 101: Context Optimization & Frontier Engineering',
        duration: '14:50',
        company: 'Anthropic (Official)',
        youtubeId: 'ysPbXH0LpIE',
        youtubeUrl: 'https://www.youtube.com/watch?v=ysPbXH0LpIE',
        description: 'Official Anthropic developer masterclass: Best practices for system prompts, XML tags, structured outputs, and 200k context prompt caching.',
        completed: false,
        badge: 'Official Anthropic • 1080p',
      },
      {
        id: 'claude-vid-4',
        title: '04. Claude Projects: Knowledge Bases, Style Guides & Team Workflows',
        duration: '12:35',
        company: 'Anthropic (Official)',
        youtubeId: 'GJ5jTgcbRHA',
        youtubeUrl: 'https://www.youtube.com/watch?v=GJ5jTgcbRHA',
        description: 'Official Anthropic guide on organizing team project spaces, uploading custom docs, setting project instructions, and maintaining persistent context.',
        completed: false,
        badge: 'Claude Projects • Official',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Claude 3.7 System Prompt & Artifact Blueprints',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Artifact System Prompts (PDF)', 'Hybrid Thinking Budget Guide', '50 Production Templates'],
      },
    ],
    prompts: [
      {
        title: 'Claude 3.7 Extended Thinking Code Generator',
        text: 'Act as a Principal Software Engineer. Provide a system prompt for Claude 3.7 to design clean, production-ready TypeScript modules with 0% hallucinations.',
      },
    ],
  },

  'course-claude-mastery': {
    courseTitle: 'Claude AI Masterclass: Claude 3.7 Sonnet, Artifacts & Extended Context',
    examCode: 'CLAUDE-MASTER',
    certificateTitle: 'Professional Claude AI Specialist Certification',
    videos: [
      {
        id: 'claude-m-1',
        title: '01. Claude 3.7 Sonnet Architecture & Extended Thinking Models',
        duration: '16:40',
        company: 'Anthropic AI Engineering',
        youtubeId: 'kBp-PxsotMo',
        youtubeUrl: 'https://www.youtube.com/watch?v=kBp-PxsotMo',
        description: 'Toggle between standard generation and extended thinking modes with precision token allocation.',
        completed: false,
        badge: 'Sonnet 3.7 Core',
      },
      {
        id: 'claude-m-2',
        title: '02. Interactive Artifacts & Single-File Application Development',
        duration: '18:15',
        company: 'Kevin Stratvert',
        youtubeId: '1PRcdCu8n6M',
        youtubeUrl: 'https://www.youtube.com/watch?v=1PRcdCu8n6M',
        description: 'Designing interactive calculators, stateful charts, and single-page apps entirely inside Claude Artifacts.',
        completed: false,
        badge: 'Interactive Artifacts • HD',
      },
      {
        id: 'claude-m-3',
        title: '03. Prompting 101: Context Optimization & Frontier Engineering',
        duration: '14:50',
        company: 'Anthropic (Official)',
        youtubeId: 'ysPbXH0LpIE',
        youtubeUrl: 'https://www.youtube.com/watch?v=ysPbXH0LpIE',
        description: 'Official Anthropic developer masterclass: Best practices for system prompts, XML tags, structured outputs, and 200k context prompt caching.',
        completed: false,
        badge: 'Official Anthropic • 1080p',
      },
      {
        id: 'claude-m-4',
        title: '04. Claude Projects: Knowledge Bases, Style Guides & Team Workflows',
        duration: '12:35',
        company: 'Anthropic (Official)',
        youtubeId: 'GJ5jTgcbRHA',
        youtubeUrl: 'https://www.youtube.com/watch?v=GJ5jTgcbRHA',
        description: 'Official Anthropic guide on organizing team project spaces, uploading custom docs, setting project instructions, and maintaining persistent context.',
        completed: false,
        badge: 'Claude Projects • Official',
      },
      {
        id: 'claude-m-5',
        title: '05. Claude Computer Use API: Autonomous Desktop & Browser Control',
        duration: '25:20',
        company: 'Anthropic (Official)',
        youtubeId: 'vH2f7cjXjKI',
        youtubeUrl: 'https://www.youtube.com/watch?v=vH2f7cjXjKI',
        description: 'Configure the Anthropic Computer Use API to navigate browser tabs, click UI buttons, extract spreadsheet data, and automate repetitive tasks.',
        completed: false,
        badge: 'Computer Use Automation',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Claude 3.7 Master Prompt Playbook & Artifact Kits',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Extended Thinking Protocols', 'Artifact State Management', 'System Prompt Templates'],
      },
    ],
    prompts: [
      {
        title: 'Claude Artifact Architecture Prompt',
        text: 'Act as an Expert Full-Stack Engineer. Generate an interactive React application with zero external bundle requirements, beautiful Tailwind styling, and comprehensive state handling.',
      },
    ],
  },

  'course-google-ai-studio': {
    courseTitle: 'Google AI Studio & Gemini 2.0 Flash: Multimodal Web Apps & Function Calling',
    examCode: 'GEMINI-2.0',
    certificateTitle: 'Google AI Studio & Gemini Pro Developer Certification',
    videos: [
      {
        id: 'gemini-vid-1',
        title: '01. Google AI Studio (2026) Complete Interface & API Keys Masterclass',
        duration: '14:35',
        company: 'Tech Express',
        youtubeId: '5E3cVP7UYG8',
        youtubeUrl: 'https://www.youtube.com/watch?v=5E3cVP7UYG8',
        description: 'Master Google AI Studio from scratch: API key management, workspace configuration, system instructions, temperature settings, and model selection.',
        completed: false,
        badge: 'AI Studio Official • 1080p',
      },
      {
        id: 'gemini-vid-2',
        title: '02. Gemini 2.0 Flash: Practical Guide to Multimodal & Real-Time Features',
        duration: '16:50',
        company: 'AI and Tech for Education',
        youtubeId: 'c-RrIs2taMA',
        youtubeUrl: 'https://www.youtube.com/watch?v=c-RrIs2taMA',
        description: 'Explore Gemini 2.0 Flash breakthrough capabilities: real-time streaming, multimodal audio/vision understanding, document parsing, and ultra-fast inference.',
        completed: false,
        badge: 'Gemini 2.0 Flash • Hands-On',
      },
      {
        id: 'gemini-vid-3',
        title: '03. Google AI Studio & Gemini 2.0 Flash: Webcams, Screenshare & Live Audio',
        duration: '13:20',
        company: 'AI For Success',
        youtubeId: '3kYVjGZd8Fw',
        youtubeUrl: 'https://www.youtube.com/watch?v=3kYVjGZd8Fw',
        description: 'Deep dive into live multimodal testing inside Google AI Studio with webcam video analysis, live screen sharing, audio synthesis, and latency benchmarks.',
        completed: false,
        badge: 'Multimodal Live Lab',
      },
      {
        id: 'gemini-vid-4',
        title: '04. Building Apps in Google AI Studio: Prompts to Full Working Projects',
        duration: '15:40',
        company: 'Checkmark Academy',
        youtubeId: 'eidxEiJdUbU',
        youtubeUrl: 'https://www.youtube.com/watch?v=eidxEiJdUbU',
        description: 'Step-by-step tutorial on using the Build tab in Google AI Studio to turn natural language prompts into complete, downloadable full-stack applications.',
        completed: false,
        badge: 'Vibe Coding & App Build',
      },
      {
        id: 'gemini-vid-5',
        title: '05. Building Full-Stack AI Applications with Andrew Ng & Google GenAI',
        duration: '28:15',
        company: 'DeepLearning.AI',
        youtubeId: 'ff3j4olCUig',
        youtubeUrl: 'https://www.youtube.com/watch?v=ff3j4olCUig',
        description: 'Learn the end-to-end framework for architecting, prototyping, and deploying real production web applications powered by Gemini models and APIs.',
        completed: false,
        badge: 'Full-Stack Architecture',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Google AI Studio API & JSON Schemas Blueprint',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Gemini 2.5 Flash SDK Cheatsheet', 'Structured Output Schemas', 'Grounding with Google Search Guide'],
      },
    ],
    prompts: [
      {
        title: 'Google AI Studio Structured Output Schema Generator',
        text: 'Act as a Senior AI Architect using Google AI Studio. Design a strict responseSchema for parsing classroom notes into JSON with studentName, score, and errorTaxonomy.',
      },
    ],
  },

  'course-chatgpt-6-openai': {
    courseTitle: 'ChatGPT & OpenAI Masterclass: GPT-4o, o1, o3-mini & Custom GPTs',
    examCode: 'OPENAI-6',
    certificateTitle: 'Certified OpenAI & Frontier Reasoning Developer',
    videos: [
      {
        id: 'openai-vid-1',
        title: '01. The Ultimate ChatGPT Tutorial: Complete Crash Course from Zero to Pro',
        duration: '38:15',
        company: 'Skillademia',
        youtubeId: 'g5oEAoKdrdw',
        youtubeUrl: 'https://www.youtube.com/watch?v=g5oEAoKdrdw',
        description: 'Master ChatGPT interface, settings, customization, prompting frameworks, vision analysis, and real-world workflows in an in-depth practical guide.',
        completed: false,
        badge: 'OpenAI Masterclass • Verified',
      },
      {
        id: 'openai-vid-2',
        title: '02. Mastering OpenAI o1 & o1-Mini Reasoning Models: Complete Guide',
        duration: '18:40',
        company: 'Atef Ataya AI',
        youtubeId: 'wRes6bT58h8',
        youtubeUrl: 'https://www.youtube.com/watch?v=wRes6bT58h8',
        description: 'Deep dive into OpenAI frontier reasoning models (o1, o1-mini, o3-mini): test-time compute, deliberate thought chains, math/logic solving, and API usage.',
        completed: false,
        badge: 'Frontier Reasoning',
      },
      {
        id: 'openai-vid-3',
        title: '03. How to Create Custom GPTs: Step-by-Step OpenAI Tutorial',
        duration: '17:50',
        company: 'Kevin Stratvert',
        youtubeId: '0Q1AQAxpdGg',
        youtubeUrl: 'https://www.youtube.com/watch?v=0Q1AQAxpdGg',
        description: 'Complete hands-on guide by Kevin Stratvert: Configure custom instructions, upload private knowledge files, add conversation starters, and publish GPTs.',
        completed: false,
        badge: 'Custom GPTs',
      },
      {
        id: 'openai-vid-4',
        title: '04. ChatGPT Canvas Mode Explained: Interactive Writing & Coding Workspace',
        duration: '14:25',
        company: 'techspeeder',
        youtubeId: '3wYT4k46RD0',
        youtubeUrl: 'https://www.youtube.com/watch?v=3wYT4k46RD0',
        description: 'Master ChatGPT Canvas: Real-time side-by-side editing, targeted code debugging, inline writing feedback, length adjustments, and version management.',
        completed: false,
        badge: 'Canvas Workspace',
      },
      {
        id: 'openai-vid-5',
        title: '05. Build AI Apps with OpenAI o3-mini & GPT-4o: API, RAG & Tool Calling',
        duration: '42:30',
        company: 'Analytics Vidhya',
        youtubeId: 'WXqTJVN139o',
        youtubeUrl: 'https://www.youtube.com/watch?v=WXqTJVN139o',
        description: 'End-to-end full developer masterclass: OpenAI API keys, function calling, Retrieval-Augmented Generation (RAG), and deploying full-stack AI web apps.',
        completed: false,
        badge: 'Developer Full Course',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'OpenAI Enterprise Workflows & Prompt Engineering Bible',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Custom GPT Schema Generator', 'o1/o3-mini Thinking Protocols', '100 Business Prompts'],
      },
    ],
    prompts: [
      {
        title: 'OpenAI Custom GPT System Blueprint',
        text: 'Act as an OpenAI Solutions Architect. Define the instruction prompt and OpenAPI specification for a student doubt-clearing assistant with instant vector search.',
      },
    ],
  },

  'course-deepseek-finance-excel': {
    courseTitle: 'DeepSeek R1, Local AI & Advanced Excel Financial Modeling',
    examCode: 'DEEPSEEK-R1',
    certificateTitle: 'DeepSeek Financial Modeling & Business Intelligence Certification',
    videos: [
      {
        id: 'deepseek-vid-1',
        title: '01. DeepSeek R1 Architecture: Chain-of-Thought Reasoning & Open Weights',
        duration: '45:00',
        company: 'freeCodeCamp.org',
        youtubeId: '_CXwZ5xyFno',
        youtubeUrl: 'https://www.youtube.com/watch?v=_CXwZ5xyFno',
        description: 'Comprehensive DeepSeek-R1 deep dive: reinforcement learning without supervised fine-tuning, reasoning tokens, benchmark comparisons, and practical applications.',
        completed: false,
        badge: 'freeCodeCamp • DeepSeek Core',
      },
      {
        id: 'deepseek-vid-2',
        title: '02. Integrating DeepSeek into Microsoft Excel: Automated Formulas & Analysis',
        duration: '18:20',
        company: 'Sven Bosau',
        youtubeId: 'ln8oxm9Gvjs',
        youtubeUrl: 'https://www.youtube.com/watch?v=ln8oxm9Gvjs',
        description: 'Step-by-step guide to connect DeepSeek with Microsoft Excel: automated formula generation, table parsing, custom VBA functions, and live spreadsheet prompt execution.',
        completed: false,
        badge: 'DeepSeek in Excel',
      },
      {
        id: 'deepseek-vid-3',
        title: '03. Three-Statement Financial Modeling in Excel: Income, Balance & Cash Flow',
        duration: '32:45',
        company: 'Corporate Finance Institute',
        youtubeId: 'UMYDxmiVin4',
        youtubeUrl: 'https://www.youtube.com/watch?v=UMYDxmiVin4',
        description: 'Institutional 3-statement financial modeling tutorial with CFI CEO Tim Vipond: linking income statement, balance sheet, and cash flow with dynamic error-checking.',
        completed: false,
        badge: 'CFI Financial Modeling',
      },
      {
        id: 'deepseek-vid-4',
        title: '04. Run DeepSeek-R1 Locally with Ollama: 100% Private Offline Financial Data',
        duration: '15:30',
        company: 'ZazenCodes',
        youtubeId: 'dS9Vbye-xSY',
        youtubeUrl: 'https://www.youtube.com/watch?v=dS9Vbye-xSY',
        description: 'Setup and run DeepSeek-R1 locally using Ollama: pull quantized models, interact via CLI and API, and process confidential financial data without internet exposure.',
        completed: false,
        badge: 'Local Ollama & Privacy',
      },
      {
        id: 'deepseek-vid-5',
        title: '05. Financial Modeling Essentials & Valuation: Scenario Tables & Forecasting',
        duration: '28:15',
        company: 'Kenji Explains',
        youtubeId: '64A6HJDEbKA',
        youtubeUrl: 'https://www.youtube.com/watch?v=64A6HJDEbKA',
        description: 'Master financial modeling essentials in Excel: dynamic revenue drivers, scenario managers, DCF valuation assumptions, and executive dashboard design.',
        completed: false,
        badge: 'Financial Valuation & DCF',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'DeepSeek Financial Prompt Kit & Model Templates',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Three-Statement Model Guide', 'Discounted Cash Flow Sheets', 'Local Ollama Setup Script'],
      },
    ],
    prompts: [
      {
        title: 'DeepSeek Financial Ratio Breakdown',
        text: 'Act as a Chartered Financial Analyst. Use step-by-step reasoning tokens to calculate liquidity, solvency, and DuPont ROE breakdown for the uploaded quarterly earnings report.',
      },
    ],
  },

  'course-cursor-copilot-coding': {
    courseTitle: 'Cursor AI & GitHub Copilot: Build Real Web Apps Without a CS Degree',
    examCode: 'CURSOR-AI',
    certificateTitle: 'Certified AI Full-Stack Developer & Cursor Specialist',
    videos: [
      {
        id: 'cursor-vid-1',
        title: '01. Cursor AI Tutorial for Beginners: Getting Started & Faster Coding',
        duration: '18:45',
        company: 'Volo Builds',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Comprehensive walkthrough of Cursor AI: installation, setting up AI models, Composer (Cmd+I), inline code editing (Cmd+K), and prompt engineering for clean code.',
        completed: false,
        badge: 'Cursor Essentials • Verified',
      },
      {
        id: 'cursor-vid-2',
        title: '02. How to Use GitHub Copilot: The Complete Beginner\'s Guide',
        duration: '15:30',
        company: 'GitHub (Official)',
        youtubeId: 'SJqGYwRq0uc',
        youtubeUrl: 'https://www.youtube.com/watch?v=SJqGYwRq0uc',
        description: 'Official GitHub guide: setting up GitHub Copilot in VS Code, inline completions, Copilot Chat, generating unit tests, writing documentation, and terminal commands.',
        completed: false,
        badge: 'GitHub Official • Beginner\'s Guide',
      },
      {
        id: 'cursor-vid-3',
        title: '03. Build a Full-Stack Web App from Scratch with Cursor AI & Composer',
        duration: '42:15',
        company: 'RoadsideCoder',
        youtubeId: 'k5x3pasUJPs',
        youtubeUrl: 'https://www.youtube.com/watch?v=k5x3pasUJPs',
        description: 'Hands-on project building: Create a full-stack web application using Cursor Composer, Agent mode, project rules, skills, bug fixing with Bugbot, and Git integration.',
        completed: false,
        badge: 'Full-Stack Project Build',
      },
      {
        id: 'cursor-vid-4',
        title: '04. Cursor vs. GitHub Copilot: Real-World Workflow & Tool Comparison',
        duration: '14:20',
        company: 'Bryan Software',
        youtubeId: 'IgcNX3fUoMQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=IgcNX3fUoMQ',
        description: 'In-depth comparative analysis testing both Cursor and GitHub Copilot: multi-file context retention, speed, code quality, pricing, and when to use each in production.',
        completed: false,
        badge: 'Cursor vs Copilot Benchmark',
      },
      {
        id: 'cursor-vid-5',
        title: '05. Cursor Crash Course & AI Coding for Modern Web Developers',
        duration: '31:40',
        company: 'Traversy Media',
        youtubeId: '5zR1ZE5aqho',
        youtubeUrl: 'https://www.youtube.com/watch?v=5zR1ZE5aqho',
        description: 'Master professional AI-assisted workflows: refactoring legacy code, building full frontend interfaces, handling API integrations, and deploying production apps.',
        completed: false,
        badge: 'Traversy Media • Crash Course',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Cursor Rules (.cursorrules) & Boilerplate Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['.cursorrules Enterprise Config', 'TypeScript Best Practices', 'One-Click Deploy Scripts'],
      },
    ],
    prompts: [
      {
        title: 'Cursor Composer System Rule',
        text: 'You are an expert Principal TypeScript engineer. When generating React components, always use modern functional hooks, Tailwind CSS utility classes, Lucide icons, and strictly avoid mock stubs.',
      },
    ],
  },

  'course-autonomous-ai-agents': {
    courseTitle: 'Autonomous AI Agents & Multi-Agent Swarms: LangGraph, CrewAI & AutoGen',
    examCode: 'AGENTS-AI',
    certificateTitle: 'Autonomous Multi-Agent Systems Architect Certification',
    videos: [
      {
        id: 'agents-vid-1',
        title: '01. What are AI Agents? Autonomous Agency, ReAct & Reasoning Loops',
        duration: '11:45',
        company: 'IBM Technology',
        youtubeId: 'F8NKVhkZZWI',
        youtubeUrl: 'https://www.youtube.com/watch?v=F8NKVhkZZWI',
        description: 'Foundational masterclass on autonomous AI agents: agency, perception-reasoning-action loops, tool use, goal decomposition, and multi-agent coordination.',
        completed: false,
        badge: 'IBM Technology • Verified',
      },
      {
        id: 'agents-vid-2',
        title: '02. LangGraph Explained for Beginners: Cyclical Graphs & State Management',
        duration: '14:20',
        company: 'KodeKloud',
        youtubeId: 'cUfLrn3TM3M',
        youtubeUrl: 'https://www.youtube.com/watch?v=cUfLrn3TM3M',
        description: 'Master LangGraph core architecture: converting simple LLM chains into robust cyclical state graphs, conditional routing, nodes, edges, and human-in-the-loop validation.',
        completed: false,
        badge: 'LangGraph Production',
      },
      {
        id: 'agents-vid-3',
        title: '03. CrewAI Step-by-Step Complete Course: Building Multi-Agent Teams',
        duration: '45:30',
        company: 'Alejandro AO',
        youtubeId: 'kBXYFaZ0EN0',
        youtubeUrl: 'https://www.youtube.com/watch?v=kBXYFaZ0EN0',
        description: 'Build production multi-agent crews with CrewAI: role assignment, toolkits, hierarchical processes, task delegation, shared memory, and automated workflows.',
        completed: false,
        badge: 'CrewAI Multi-Agent Swarms',
      },
      {
        id: 'agents-vid-4',
        title: '04. AutoGen Tutorial for Beginners: Build Your First Multi-Agent App',
        duration: '28:15',
        company: 'Leon van Zyl',
        youtubeId: 'KCoBVe-3Rp8',
        youtubeUrl: 'https://www.youtube.com/watch?v=KCoBVe-3Rp8',
        description: 'Microsoft AutoGen framework guide: create conversational agent teams, UserProxyAgent orchestration, tool calling, code execution, and autonomous collaborative problem-solving.',
        completed: false,
        badge: 'Microsoft AutoGen Lab',
      },
      {
        id: 'agents-vid-5',
        title: '05. OpenAI Swarm: Multi-Agent Orchestration & Swarm Workflows',
        duration: '24:10',
        company: 'Cole Medin',
        youtubeId: 'q7_5eCmu0MY',
        youtubeUrl: 'https://www.youtube.com/watch?v=q7_5eCmu0MY',
        description: 'Deep dive into lightweight agent orchestration with OpenAI Swarm: agent handoffs, context variable passing, routines, database tools, and production swarm patterns.',
        completed: false,
        badge: 'OpenAI Swarm Architecture',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'LangGraph & CrewAI Production Agent Blueprints',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['StateGraph Architecture Guide', 'CrewAI Agent Role Templates', 'Error Recovery & Human-in-the-Loop'],
      },
    ],
    prompts: [
      {
        title: 'CrewAI Multi-Agent Task Orchestrator',
        text: 'Act as an Autonomous Systems Lead. Define 3 specialized agent personas (Market Researcher, Quantitative Analyst, Executive Summarizer) and their sequential task dependency graph.',
      },
    ],
  },

  'course-voice-ai-telephony': {
    courseTitle: 'Voice AI & Realtime Telephony Agents: Build 24/7 AI Receptionists',
    examCode: 'VOICE-AI',
    certificateTitle: 'Voice AI & Conversational Telephony Developer Certification',
    videos: [
      {
        id: 'voice-vid-1',
        title: '01. Building Realtime Voice AI Agents: Architecture, LiveKit & Python Pipeline',
        duration: '18:15',
        company: 'AgenticXLab',
        youtubeId: '3SA6J8xIoYk',
        youtubeUrl: 'https://www.youtube.com/watch?v=3SA6J8xIoYk',
        description: 'Architecture of sub-500ms conversational voice agents: Speech-to-Text (Deepgram), LLM orchestration, and Text-to-Speech (ElevenLabs) with LiveKit WebRTC transport.',
        completed: false,
        badge: 'AgenticXLab • Architecture',
      },
      {
        id: 'voice-vid-2',
        title: '02. Vapi AI Voice Agent Masterclass: System Prompts, Latency Tuning & Voices',
        duration: '17:40',
        company: 'Kingy AI',
        youtubeId: 'ZmebRZOXV28',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZmebRZOXV28',
        description: 'Complete guide to building conversational voice bots in Vapi: prompt engineering for natural flow, background ambiance, filler words, and low-latency voice models.',
        completed: false,
        badge: 'Vapi AI Masterclass',
      },
      {
        id: 'voice-vid-3',
        title: '03. Connecting Twilio Phone Numbers to Voice AI: Inbound & Outbound Telephony',
        duration: '16:20',
        company: 'Toshiki Kodaira',
        youtubeId: 'q0OTlaDy0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=q0OTlaDy0oQ',
        description: 'Step-by-step setup connecting Twilio telephone numbers to Vapi voice agents: SIP trunk routing, inbound call handling, and outbound phone campaign configurations.',
        completed: false,
        badge: 'Twilio Telephony & SIP',
      },
      {
        id: 'voice-vid-4',
        title: '04. Real-Time Voice Function Calling: Live Google Calendar Appointment Booking',
        duration: '21:10',
        company: 'Austin Peechatt',
        youtubeId: '8fl9XJ7RWbU',
        youtubeUrl: 'https://www.youtube.com/watch?v=8fl9XJ7RWbU',
        description: 'Enable your voice agent to execute live tools: checking availability, booking appointments directly on Google Calendar, and sending instant confirmation SMS/emails.',
        completed: false,
        badge: 'Calendar Booking & Tools',
      },
      {
        id: 'voice-vid-5',
        title: '05. Building Full-Stack AI Voice Agents with LiveKit: WebRTC & Voice Pipelines',
        duration: '24:50',
        company: 'Ashton Voss',
        youtubeId: 'EHphVIGiWKU',
        youtubeUrl: 'https://www.youtube.com/watch?v=EHphVIGiWKU',
        description: 'Full beginner-to-pro guide to building conversational voice AI using LiveKit: Deepgram STT, real-time LLM inference, ElevenLabs voice synthesis, and turn detection.',
        completed: false,
        badge: 'LiveKit & WebRTC Voice',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Voice AI System Prompts & Webhook Blueprints',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Receptionist Prompt Architecture', 'Twilio Webhook Node.js Server', 'Call Recording & Transcription Kit'],
      },
    ],
    prompts: [
      {
        title: 'Voice Receptionist Conversational Persona',
        text: 'You are Sarah, a warm, professional front-desk coordinator. Speak in concise 1-2 sentence replies, handle caller interruptions politely, and ask for name and phone number.',
      },
    ],
  },

  'course-zapier-ai-automation': {
    courseTitle: 'Zapier & AI Business Automations: Zero-Code Workflows & CRM Masterclass',
    examCode: 'ZAPIER-AI-AUTO',
    certificateTitle: 'Certified AI Business Automation Specialist',
    videos: [
      {
        id: 'zapier-vid-1',
        title: '01. Zapier AI Tutorial for Beginners: Automation Made Simple',
        duration: '16:15',
        company: 'Kevin Stratvert',
        youtubeId: 'JtdUgJGI_Oo',
        youtubeUrl: 'https://www.youtube.com/watch?v=JtdUgJGI_Oo',
        description: 'Master Zapier fundamentals from zero: connect apps, configure triggers and actions, build your first automated Zap, and leverage AI workflow generation.',
        completed: false,
        badge: 'Automation Engineering • Verified',
      },
      {
        id: 'zapier-vid-2',
        title: '02. Multi-Step Zaps & Paths: Conditional Branching & Logic in Zapier',
        duration: '18:20',
        company: 'Tom Nassr • XRAY Automation',
        youtubeId: '7PIUFcQikhI',
        youtubeUrl: 'https://www.youtube.com/watch?v=7PIUFcQikhI',
        description: 'Build advanced multi-step Zaps with Paths and conditional logic: filter criteria, branch execution trails, and route data dynamically.',
        completed: false,
        badge: 'Conditional Branching',
      },
      {
        id: 'zapier-vid-3',
        title: '03. Zapier AI Beginners Guide: AI Agents & Automated Workflows',
        duration: '15:40',
        company: 'AI Master',
        youtubeId: 'm-kWrOvA49U',
        youtubeUrl: 'https://www.youtube.com/watch?v=m-kWrOvA49U',
        description: 'Integrate AI natively into Zapier: Deploy Zapier Agents, connect LLMs to your data stack, and automate content summarization and customer response pipelines.',
        completed: false,
        badge: 'AI-Powered Zaps',
      },
      {
        id: 'zapier-vid-4',
        title: '04. Webhooks by Zapier: Catch Hooks, REST APIs & Live Triggers',
        duration: '17:10',
        company: 'Jeet Sangamnerkar • Operations Automation',
        youtubeId: '85JFT58gDoE',
        youtubeUrl: 'https://www.youtube.com/watch?v=85JFT58gDoE',
        description: 'Master Catch Webhooks and Custom Requests in Zapier: Connect payment gateways (Stripe, Razorpay), custom frontend forms, and parse nested JSON payloads.',
        completed: false,
        badge: 'Webhooks & REST APIs',
      },
      {
        id: 'zapier-vid-5',
        title: '05. Master Automation with Zapier & AI Agents: Complete 4-Hour Course',
        duration: '4:12:00',
        company: 'freeCodeCamp.org',
        youtubeId: '-leIp449qXA',
        youtubeUrl: 'https://www.youtube.com/watch?v=-leIp449qXA',
        description: 'Comprehensive full-length masterclass from freeCodeCamp: End-to-end automation architecture, AI agents, MCP protocol, error handling, and business workflows.',
        completed: false,
        badge: 'Full Masterclass • 4-Hour',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Zapier Blueprints & Webhook Architectures',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Multi-Step Zaps Cheatsheet', 'Webhook Payload Parsing Kit', 'WhatsApp & CRM Integration Guide'],
      },
    ],
    prompts: [
      {
        title: 'Zapier Formatter & Path Decision Generator',
        text: 'Act as an Enterprise Automation Engineer. Design a Zapier Multi-Step Path that intercepts incoming lead payloads, formats phone numbers to international standard with Formatter by Zapier, routes high-value leads to WhatsApp notifications, and logs unverified leads to a fallback Google Sheet.',
      },
    ],
  },

  'course-ai-automation': {
    courseTitle: 'AI Automation & Agents: n8n, Make & Autonomous Workflows',
    examCode: 'N8N-AUTOMATION',
    certificateTitle: 'Certified Enterprise AI Automation Engineer',
    videos: [
      {
        id: 'auto-vid-1',
        title: '01. Complete n8n Automation & Autonomous AI Agents Masterclass',
        duration: '38:15',
        company: 'Pratik Joshi • n8n Academy',
        youtubeId: 'OKPOblQ9nfw',
        youtubeUrl: 'https://www.youtube.com/watch?v=OKPOblQ9nfw',
        description: 'Zero-to-hero n8n automation and agent architecture: Core nodes, webhook triggers, Docker self-hosting, and connecting LLM providers.',
        completed: false,
        badge: 'Zero to Hero • 4K',
      },
      {
        id: 'auto-vid-2',
        title: '02. Build Your First Autonomous AI Agent with n8n & Tools',
        duration: '22:45',
        company: 'Kevin Stratvert',
        youtubeId: 'dpoMEcXjVH8',
        youtubeUrl: 'https://www.youtube.com/watch?v=dpoMEcXjVH8',
        description: 'Master the n8n AI Agent node: Integrate OpenAI/Gemini, configure dynamic tools, add conversational memory, and trigger automated tasks.',
        completed: false,
        badge: 'AI Agent Node',
      },
      {
        id: 'auto-vid-3',
        title: '03. Automated Invoice Processing & Document Pipeline with n8n',
        duration: '18:30',
        company: 'Sajeeb The Analyst',
        youtubeId: '8nCTdoLu_so',
        youtubeUrl: 'https://www.youtube.com/watch?v=8nCTdoLu_so',
        description: 'Automate end-to-end accounting: Extract line items and tax data from PDF invoices, validate totals, and auto-sync records to Google Sheets.',
        completed: false,
        badge: 'Invoice & OCR Pipeline',
      },
      {
        id: 'auto-vid-4',
        title: '04. Build a Complete WhatsApp AI Agent with Memory & CRM Sync',
        duration: '24:10',
        company: 'Viren Baid',
        youtubeId: 'CPzqy3M6LbQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=CPzqy3M6LbQ',
        description: 'Connect WhatsApp Cloud API to n8n, handle real-time customer conversations with AI memory, and log qualifying leads directly into CRM databases.',
        completed: false,
        badge: 'WhatsApp AI Agent',
      },
      {
        id: 'auto-vid-5',
        title: '05. Advanced AI Agent Architectures, Structured Output & Production Workflows',
        duration: '26:40',
        company: 'Yashica Jain',
        youtubeId: 'w6ZJzP0RBxY',
        youtubeUrl: 'https://www.youtube.com/watch?v=w6ZJzP0RBxY',
        description: 'Enterprise automation blueprints: JSON schema enforcement, multi-agent orchestration, sub-workflow delegation, error handling, and production guardrails.',
        completed: false,
        badge: 'Enterprise Guardrails',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: '25 Ready-to-Import n8n & Make JSON Workflow Templates',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['WhatsApp CRM Auto-Responder JSON', 'Gmail Invoice Parser Workflow', 'Social Media Auto-Publisher'],
      },
    ],
    prompts: [
      {
        title: 'n8n Code Node JSON Schema Transformer',
        text: 'Write a clean JavaScript function for an n8n Code Node to parse unstructured email bodies into a standardized JSON payload with customerName, invoiceAmount, and dueDate.',
      },
    ],
  },

  'course-ai-video-filmmaking': {
    courseTitle: 'AI Video Filmmaking & Viral Content Studio: Sora, Runway Gen-3, Kling & HeyGen',
    examCode: 'AI-VIDEO',
    certificateTitle: 'Certified AI Filmmaker & Commercial Media Producer',
    videos: [
      {
        id: 'video-vid-1',
        title: '01. Professional AI Filmmaking: Step-by-Step AI Film Production Pipeline',
        duration: '22:15',
        company: 'Curious Refuge',
        youtubeId: 'wHIdCNIQHpo',
        youtubeUrl: 'https://www.youtube.com/watch?v=wHIdCNIQHpo',
        description: 'Master the end-to-end AI film production workflow: ideation, storyboarding, character design, cinematic shot generation, and post-production assembly.',
        completed: false,
        badge: 'Curious Refuge • AI Cinema',
      },
      {
        id: 'video-vid-2',
        title: '02. Cinematic AI Videos with Runway Gen-3: Camera Controls & Motion Prompts',
        duration: '18:40',
        company: 'Curious Refuge',
        youtubeId: 'gyCg0yv3Njw',
        youtubeUrl: 'https://www.youtube.com/watch?v=gyCg0yv3Njw',
        description: 'Direct AI cameras with exact precision in Runway Gen-3: Motion Brush, camera speed curves, panning, Dutch angles, rack focus, and cinematic prompt structure.',
        completed: false,
        badge: 'Runway Gen-3 Cinematics',
      },
      {
        id: 'video-vid-3',
        title: '03. Photorealistic AI Avatars & Lip-Sync: Complete HeyGen Studio Tutorial',
        duration: '19:30',
        company: 'Simon Crowe',
        youtubeId: 'RTmlxuroR50',
        youtubeUrl: 'https://www.youtube.com/watch?v=RTmlxuroR50',
        description: 'Create your digital twin avatar, generate expressive speaking head videos, customize backgrounds, and translate content across 40+ languages with seamless lip-sync.',
        completed: false,
        badge: 'HeyGen Avatars & Lip-Sync',
      },
      {
        id: 'video-vid-4',
        title: '04. AI Voice Cloning & Audio Design: ElevenLabs Voice Studio Masterclass',
        duration: '16:45',
        company: 'Kevin Stratvert',
        youtubeId: 'yDTbAxJ3sKI',
        youtubeUrl: 'https://www.youtube.com/watch?v=yDTbAxJ3sKI',
        description: 'Professional voice cloning and audio generation with ElevenLabs: instant vs professional voice clones, emotion modulation, stability sliders, and AI sound effects.',
        completed: false,
        badge: 'ElevenLabs Voice AI',
      },
      {
        id: 'video-vid-5',
        title: '05. AI Video Assembly in CapCut: Auto-Captions, Sound Effects & Viral Reels',
        duration: '25:10',
        company: 'Ben Kimball AI',
        youtubeId: 'w6C8uvusMDg',
        youtubeUrl: 'https://www.youtube.com/watch?v=w6C8uvusMDg',
        description: 'Combine AI footage into viral social media reels and commercial ads: AI auto-captions, background removal, beat-matched transitions, and 4K export settings.',
        completed: false,
        badge: 'CapCut AI & Viral Reels',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'AI Film Director Prompt Bible & Shotlist Templates',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['100 Cinematic Camera Prompts', 'Voice Dubbing Audio Settings', 'Royalty-Free Audio Masterlist'],
      },
    ],
    prompts: [
      {
        title: 'Cinematic Video Shot Prompt',
        text: 'Generate a detailed video generation prompt: 35mm anamorphic lens, warm golden hour backlighting, subtle rain reflections on asphalt, slow forward tracking camera motion, photorealistic 8k.',
      },
    ],
  },

  'course-midjourney-visuals': {
    courseTitle: 'Midjourney v6, Ideogram 2.0 & AI Creative Studio: Commercial Branding & Ads',
    examCode: 'AI-DESIGN',
    certificateTitle: 'Certified Commercial AI Visual Designer',
    videos: [
      {
        id: 'mid-vid-1',
        title: '01. Complete Beginners Guide to Midjourney v6: Prompting & Parameters',
        duration: '22:15',
        company: 'Tao Prompts',
        youtubeId: '9F-hgjb6PCE',
        youtubeUrl: 'https://www.youtube.com/watch?v=9F-hgjb6PCE',
        description: 'Master Midjourney v6 fundamentals from scratch: camera focal lengths, lighting prompts, aspect ratios (--ar), stylize, chaos, and photorealistic rendering formulas.',
        completed: false,
        badge: 'Midjourney v6 • Verified',
      },
      {
        id: 'mid-vid-2',
        title: '02. Character Consistency in Midjourney: Character Reference (--cref & --cw)',
        duration: '14:40',
        company: 'Curious Refuge',
        youtubeId: '7BO_TocisAc',
        youtubeUrl: 'https://www.youtube.com/watch?v=7BO_TocisAc',
        description: 'Lock facial features, clothing, and hairstyles across dozens of scenes using --cref and --cw parameters to illustrate books, advertisements, and social content.',
        completed: false,
        badge: 'Character Consistency',
      },
      {
        id: 'mid-vid-3',
        title: '03. Ideogram 2.0 Typography & Graphic Design: Flawless Text & Logos',
        duration: '16:20',
        company: 'Qudata Creative',
        youtubeId: '3Zi-yfxZac4',
        youtubeUrl: 'https://www.youtube.com/watch?v=3Zi-yfxZac4',
        description: 'Generate advertising posters, merchandise logos, and graphic layouts with zero misspelled text, using Ideogram 2.0 styles, color palettes, and Magic Prompt.',
        completed: false,
        badge: 'Ideogram Typography',
      },
      {
        id: 'mid-vid-4',
        title: '04. Photoshop Generative Fill & Firefly: The Ultimate Guide to AI Editing',
        duration: '18:35',
        company: 'Brendan Williams',
        youtubeId: 'SB60EQG2HyE',
        youtubeUrl: 'https://www.youtube.com/watch?v=SB60EQG2HyE',
        description: 'Seamlessly expand image borders with Generative Expand, remove unwanted objects, inpaint textures, and blend multi-layer AI graphics in Adobe Photoshop.',
        completed: false,
        badge: 'Photoshop Generative Fill',
      },
      {
        id: 'mid-vid-5',
        title: '05. Midjourney Vector Art & SVG Conversion: Print-Ready 300 DPI Exports',
        duration: '12:50',
        company: 'Wade McMaster • Creator Impact',
        youtubeId: 'OBqMU-fp8O0',
        youtubeUrl: 'https://www.youtube.com/watch?v=OBqMU-fp8O0',
        description: 'Convert Midjourney raster artwork into infinite-resolution SVG vectors with Vectorizer.AI, preparing commercial graphics for merchandise, print, and logos.',
        completed: false,
        badge: 'Vector & Print Workflows',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Commercial Design Prompt Library & Style Code Pack',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['50 Curated --sref Codes', 'Typography Poster Layouts', 'Commercial Licensing Cheatsheet'],
      },
    ],
    prompts: [
      {
        title: 'Commercial Product Ad Prompt',
        text: 'Studio product photography of luxury organic skincare bottle resting on wet basalt stone, soft natural morning window light, high-end commercial advertising aesthetic, 8k resolution --ar 16:9 --v 6.0',
      },
    ],
  },

  'course-genai-beginners': {
    courseTitle: 'The Complete Generative AI Guide for Beginners: Zero to Hero',
    examCode: 'GENAI-HERO',
    certificateTitle: 'Generative AI Foundation & Practical Literacy Certification',
    videos: [
      {
        id: 'genai-b-1',
        title: '01. What Are Generative AI Models? Complete Foundation Masterclass',
        duration: '08:45',
        company: 'IBM Technology',
        youtubeId: 'hfIUstzHs9A',
        youtubeUrl: 'https://www.youtube.com/watch?v=hfIUstzHs9A',
        description: 'Foundational plain-English guide to Generative AI, Large Language Models, foundation architectures, and how AI generates original text, images, and solutions.',
        completed: false,
        badge: 'Foundation • IBM Verified',
      },
      {
        id: 'genai-b-2',
        title: '02. Master the Perfect Prompt Formula: Role, Task, Context, Steps & Format',
        duration: '08:20',
        company: 'Jeff Su Productivity',
        youtubeId: 'jC4v5AS4RIM',
        youtubeUrl: 'https://www.youtube.com/watch?v=jC4v5AS4RIM',
        description: 'Learn the exact 5-part prompt blueprint used to get accurate, high-quality, hallucination-free outputs from ChatGPT, Gemini, and Claude on your first try.',
        completed: false,
        badge: 'Prompt Blueprint',
      },
      {
        id: 'genai-b-3',
        title: '03. Generative AI for Beginners: Everyday AI Tools & Workflow Automation',
        duration: '14:15',
        company: 'MaxonShire AI',
        youtubeId: 'ahoH1s13LZE',
        youtubeUrl: 'https://www.youtube.com/watch?v=ahoH1s13LZE',
        description: 'Hands-on beginner tour of the leading Generative AI tools for daily productivity: email drafting, document summarization, idea generation, and daily organization.',
        completed: false,
        badge: 'Everyday Tools',
      },
      {
        id: 'genai-b-4',
        title: '04. AI Hallucinations Simply Explained: How LLMs Think, Tokens & Fact-Checking',
        duration: '07:50',
        company: 'codebasics',
        youtubeId: 'xaEgbDa1KSI',
        youtubeUrl: 'https://www.youtube.com/watch?v=xaEgbDa1KSI',
        description: 'Understand why AI models hallucinate or make things up, how token prediction works under the hood, and practical strategies to fact-check generated answers.',
        completed: false,
        badge: 'LLM Mechanics',
      },
      {
        id: 'genai-b-5',
        title: '05. AI Ethics, Digital Privacy & Responsible Generative AI 101',
        duration: '12:15',
        company: 'John Moore Tech',
        youtubeId: '6fwhbzcUM38',
        youtubeUrl: 'https://www.youtube.com/watch?v=6fwhbzcUM38',
        description: 'Critical safety principles for the generative AI era: protecting sensitive personal information, recognizing copyright issues, and deploying AI responsibly.',
        completed: false,
        badge: 'AI Safety & Ethics',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Beginner Generative AI Starter Toolkit & Cheatsheet',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Top 20 AI Tools Guide', '5-Minute Everyday Prompts', 'Privacy Protection Checklist'],
      },
    ],
    prompts: [
      {
        title: 'Feynman Technique Simplifier Prompt',
        text: 'Explain quantum computing to a 10-year-old child using a relatable cooking analogy. Keep sentences short and engaging.',
      },
    ],
  },

  'course-ai-designer': {
    courseTitle: 'Next-Gen AI Designer: Master AI Posters, Branding & Creative Media',
    examCode: 'AI-DESIGNER',
    certificateTitle: 'Certified AI Graphic Designer & Commercial Art Director',
    videos: [
      {
        id: 'design-portal-1',
        title: '01. Master AI Graphic Design & Midjourney Prompt Crafting',
        duration: '24:18',
        company: 'The AI Advantage',
        youtubeId: 'xoZG5WQbgMw',
        youtubeUrl: 'https://www.youtube.com/watch?v=xoZG5WQbgMw',
        description: 'Complete hands-on masterclass for beginners and designers: Prompt engineering, aspect ratios, style references, negative weights, and commercial compositions.',
        completed: false,
        badge: 'Design Foundations • 4K',
      },
      {
        id: 'design-portal-2',
        title: '02. FLUX.1 Commercial Image Generation Masterclass',
        duration: '17:45',
        company: 'Kevin Stratvert',
        youtubeId: 'xOoAlRjTKTw',
        youtubeUrl: 'https://www.youtube.com/watch?v=xOoAlRjTKTw',
        description: 'Master FLUX.1 for photorealistic commercial graphics, anatomy accuracy, and state-of-the-art visual generation.',
        completed: false,
        badge: 'FLUX.1 Photorealism',
      },
      {
        id: 'design-portal-3',
        title: '03. AI Poster Design & Perfect Typography with Ideogram AI',
        duration: '14:30',
        company: 'Nexus Alex',
        youtubeId: 'Euc-Hjchpes',
        youtubeUrl: 'https://www.youtube.com/watch?v=Euc-Hjchpes',
        description: 'Crisp text rendering in posters, typography styling, festival banners, menus, and typography-rich commercial assets without garbled letters.',
        completed: false,
        badge: 'Ideogram & Typography',
      },
      {
        id: 'design-portal-4',
        title: '04. Studio Quality AI Product Photography & Commercial Staging',
        duration: '15:20',
        company: 'Trouvaille Digital',
        youtubeId: 'OL2dQilSrdE',
        youtubeUrl: 'https://www.youtube.com/watch?v=OL2dQilSrdE',
        description: 'Commercial 3D product staging, ambient lighting, packaging mockups, realistic bounce shadows, and clean e-commerce compositions.',
        completed: false,
        badge: 'Product Photography',
      },
      {
        id: 'design-portal-5',
        title: '05. Upscaling AI Images to 20,000px & Commercial Print Standards',
        duration: '18:50',
        company: 'Wade McMaster',
        youtubeId: '6zmksJ6XRWE',
        youtubeUrl: 'https://www.youtube.com/watch?v=6zmksJ6XRWE',
        description: 'Ultra high-res upscaling to 20,000x20,000px, DPI optimization, CMYK offset printing considerations, and prepress export for billboards and packaging.',
        completed: false,
        badge: '8K Print & Upscaling',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Midjourney & FLUX.1 Commercial Prompt Formula Cheatsheet',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Lens & Lighting Parameters Guide', 'Commercial Poster Typography Rules', 'High-Res Upscaling & CMYK Export Workflow'],
      },
    ],
    prompts: [
      {
        title: 'Commercial Film Poster Prompt Formula',
        text: 'A cinematic movie poster for an adventure film set in ancient India, dramatic volumetric lighting, ultra-detailed textures, bold serif typography headline at the bottom reading "THE ODYSSEY", high contrast, 8k resolution, shot on 35mm anamorphic lens --ar 2:3 --v 6.1',
      },
      {
        title: 'Studio Product Photography Mockup',
        text: 'Luxury matte black perfume bottle with gold embossed typography, positioned on a wet dark slate stone slab, soft water splash droplets, cinematic side rim lighting, shallow depth of field, commercial cosmetic advertisement --ar 1:1 --stylize 250',
      },
    ],
  },

  'course-ai-teachers': {
    courseTitle: 'AI for Teachers & Educators: Lesson Plans, Question Papers & Class Magic',
    examCode: 'AI-TEACHER',
    certificateTitle: 'Certified Modern AI Educator & Curriculum Designer',
    videos: [
      {
        id: 'teach-vid-1',
        title: '01. AI for Teachers: Complete Lesson Planning from Scratch in Minutes',
        duration: '18:40',
        company: 'Designed for Learning',
        youtubeId: 'akykzhYEBWU',
        youtubeUrl: 'https://www.youtube.com/watch?v=akykzhYEBWU',
        description: 'Masterclass on generating standards-aligned lesson plans, pedagogical hooks, board activities, and step-by-step teaching guides with AI.',
        completed: false,
        badge: 'Lesson Planning • HD',
      },
      {
        id: 'teach-vid-2',
        title: '02. Differentiated Learning: Customizing Class Materials with AI (Diffit)',
        duration: '14:25',
        company: 'Edutopia',
        youtubeId: 'k3bBAIyy-7E',
        youtubeUrl: 'https://www.youtube.com/watch?v=k3bBAIyy-7E',
        description: 'Official Edutopia walkthrough: Automatically adapt reading levels, vocabulary tiers, and challenge questions so both fast and slow learners thrive.',
        completed: false,
        badge: 'Edutopia Verified • HD',
      },
      {
        id: 'teach-vid-3',
        title: '03. Automated Rubric Generator & Objective Grading Assistance',
        duration: '12:50',
        company: 'EzLessonHub',
        youtubeId: 'o48T9FK9VwI',
        youtubeUrl: 'https://www.youtube.com/watch?v=o48T9FK9VwI',
        description: 'Create multi-criteria evaluation rubrics, Bloom\'s Taxonomy test questions, and personalized report card remarks in seconds.',
        completed: false,
        badge: 'Automated Rubrics',
      },
      {
        id: 'teach-vid-4',
        title: '04. Interactive Classroom Activities & Slides with Instant Feedback (Curipod)',
        duration: '16:35',
        company: 'TechUp Teachers Network',
        youtubeId: 'G_4lqg9P-L4',
        youtubeUrl: 'https://www.youtube.com/watch?v=G_4lqg9P-L4',
        description: 'Transform static lessons into interactive classroom presentations with live student polls, gamified review quizzes, and collaborative activities.',
        completed: false,
        badge: 'Gamified Classroom',
      },
      {
        id: 'teach-vid-5',
        title: '05. Automated Parent Communication & Professional Emails with AI',
        duration: '15:10',
        company: 'AI For Teachers',
        youtubeId: 'UwSXNiBROgQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=UwSXNiBROgQ',
        description: 'Save 10+ hours weekly: Automate empathetic parent emails, field trip notices, meeting summaries, and report card narratives.',
        completed: false,
        badge: 'Admin & Parent Comms',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Educator AI Toolkit: Lesson Prompts & Rubric Generators',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['CBSE/ICSE Lesson Plan Template', 'Bloom\'s Taxonomy Question Generator', 'Report Card Comment Writer'],
      },
    ],
    prompts: [
      {
        title: 'Differentiated Question Paper Prompt',
        text: 'Act as a Senior CBSE Examiner. Generate a 25-mark test for Grade 8 Science on "Photosynthesis" with 5 MCQs (Recall), 3 Short Answers (Understanding), and 2 High-Order Thinking Skills (HOTS) questions with marking rubrics.',
      },
    ],
  },

  'course-ai-students': {
    courseTitle: 'AI for Students: The Simplified Guide to Academic Superpowers',
    examCode: 'AI-STUDENT',
    certificateTitle: 'Academic Excellence & AI Learning Accelerator Certification',
    videos: [
      {
        id: 'stud-vid-1',
        title: '01. Active Recall, Cornell Notes & Spaced Repetition Flashcards with AI',
        duration: '14:35',
        company: 'Dr. Justin Sung',
        youtubeId: 'oI1pLvAx8CE',
        youtubeUrl: 'https://www.youtube.com/watch?v=oI1pLvAx8CE',
        description: 'Master higher-order active recall and deep cognitive encoding: How to prompt AI to test your retrieval without passive review.',
        completed: false,
        badge: 'Active Recall • HD',
      },
      {
        id: 'stud-vid-2',
        title: '02. The Feynman Technique AI Study Partner: Mastering Hard Concepts',
        duration: '11:50',
        company: 'Scott Luu',
        youtubeId: 'jeXQDbuUFuM',
        youtubeUrl: 'https://www.youtube.com/watch?v=jeXQDbuUFuM',
        description: 'Use AI to practice the Feynman Technique: Spot knowledge blindspots, break down complex concepts, and explain topics in simple language.',
        completed: false,
        badge: 'Feynman Technique',
      },
      {
        id: 'stud-vid-3',
        title: '03. Step-by-Step Math & Physics Problem Solving with AI Private Tutor',
        duration: '16:20',
        company: 'Radford Mathematics',
        youtubeId: '3V_aa8Fiv0M',
        youtubeUrl: 'https://www.youtube.com/watch?v=3V_aa8Fiv0M',
        description: 'The ultimate student guide to using AI as a private math coach: Socratic hints, verifying steps, formula derivation, and mistake diagnosis without cheating.',
        completed: false,
        badge: 'Math Problem Solving',
      },
      {
        id: 'stud-vid-4',
        title: '04. Research Paper Summarization, Literature Reviews & Academic Citations',
        duration: '15:45',
        company: 'Dr. Andy Stapleton',
        youtubeId: 'blBJbhZT8gQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=blBJbhZT8gQ',
        description: 'Find academic papers 100x faster, extract core methodologies and findings, conduct literature reviews, and format clean references.',
        completed: false,
        badge: 'Academic Research',
      },
      {
        id: 'stud-vid-5',
        title: '05. High-Yield Exam Revision Drills, Practice Tests & Mock Questions',
        duration: '17:10',
        company: 'Tom Watchman',
        youtubeId: 'wGmsVH-vyyM',
        youtubeUrl: 'https://www.youtube.com/watch?v=wGmsVH-vyyM',
        description: 'Complete hands-on demo: Generate high-yield practice exam questions, simulate realistic timed mock tests, and pinpoint weak topics before test day.',
        completed: false,
        badge: 'High-Yield Mock Drills',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Student Superpower Pack: Flashcards, Planners & Revision Maps',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Spaced Repetition Scheduler', 'Cornell Note Taking System', 'Exam Anxiety Breathing Guide'],
      },
    ],
    prompts: [
      {
        title: 'Socratic Tutor Prompt',
        text: 'Act as a warm Socratic tutor. Do not give me the answer immediately. Instead, ask me guided questions one at a time to help me derive the formula for kinetic energy myself.',
      },
    ],
  },

  'course-english-speaking': {
    courseTitle: 'Fluent English Speaking & Practical Communication: Zero to Confident Speaker',
    examCode: 'ENGLISH-FLUENT',
    certificateTitle: 'Certified Confident English Speaker & Business Communicator',
    videos: [
      {
        id: 'eng-vid-1',
        title: '01. Speak English Fluently: 5 Steps to Natural Fluency & Overcoming Hesitation',
        duration: '14:35',
        company: 'Oxford Online English (Official)',
        youtubeId: 'KaA_mxga3PQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=KaA_mxga3PQ',
        description: 'Step-by-step masterclass by Oxford Online English on breaking mental translation loops, speed reading aloud, chunking vocabulary, and speaking naturally without hesitation.',
        completed: false,
        badge: 'Oxford English • Verified',
      },
      {
        id: 'eng-vid-2',
        title: '02. Think Fast, Talk Smart: Communication Techniques & Confident Speaking',
        duration: '32:40',
        company: 'Stanford Graduate School of Business',
        youtubeId: 'HAnw168huqA',
        youtubeUrl: 'https://www.youtube.com/watch?v=HAnw168huqA',
        description: 'World-famous Stanford GSB masterclass by Matt Abrahams on spontaneous speaking, managing anxiety, conversational structure (What? So What? Now What?), and practical communication.',
        completed: false,
        badge: 'Stanford GSB • Masterclass',
      },
      {
        id: 'eng-vid-3',
        title: '03. English Pronunciation Training: Improve Your Accent & Speak Clearly',
        duration: '14:20',
        company: 'mmmEnglish (Official)',
        youtubeId: 'n4NVPg2kHv4',
        youtubeUrl: 'https://www.youtube.com/watch?v=n4NVPg2kHv4',
        description: 'Targeted pronunciation training with Emma from mmmEnglish: mouth and tongue positioning, syllable stress, vowel sounds, and speaking with clarity.',
        completed: false,
        badge: 'mmmEnglish • Pronunciation',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Spoken English Daily Drills & Vocabulary Mind Maps',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['500 High-Frequency Idioms & Phrasal Verbs', 'Daily 15-Minute Shadowing Audio Drills', 'Interview Question Scripts'],
      },
    ],
    prompts: [
      {
        title: 'English Conversational Partner Prompt',
        text: 'Act as a friendly conversational English partner. Let us have an informal chat about weekend plans. After each reply, gently highlight any grammatical errors and suggest a more natural conversational phrase.',
      },
    ],
  },

  'course-french-speaking': {
    courseTitle: 'French Speaking & Complete Language Accelerator (CEFR A1–B2)',
    examCode: 'FRENCH-CEFR',
    certificateTitle: 'Diplôme de Français Pratique & Spoken Mastery',
    videos: [
      {
        id: 'french-vid-1',
        title: '01. Learn French in 30 Minutes: ALL Basics Every Beginner Needs',
        duration: '31:25',
        company: 'FrenchPod101 (Official)',
        youtubeId: '3iezch5YQYo',
        youtubeUrl: 'https://www.youtube.com/watch?v=3iezch5YQYo',
        description: 'High-frequency French conversational foundation: Greetings, essential sentence formulas, numbers, question words, and pronunciation basics without translating in your head.',
        completed: false,
        badge: 'FrenchPod101 • CEFR A1',
      },
      {
        id: 'french-vid-2',
        title: '02. Daily Life French: 100 Words, Expressions & Slow French Conversations',
        duration: '20:45',
        company: 'Easy French (Official)',
        youtubeId: '__Cu2nwgAjA',
        youtubeUrl: 'https://www.youtube.com/watch?v=__Cu2nwgAjA',
        description: 'Real-life conversational practice with native Parisians: Ordering at a boulangerie, asking directions, shopping, and everyday colloquial idioms in natural spoken speed.',
        completed: false,
        badge: 'Conversational Fluency',
      },
      {
        id: 'french-vid-3',
        title: '03. French Pronunciation & Accent Training: Silent Letters, Liaisons & Nasal Vowels',
        duration: '12:30',
        company: 'FrenchPod101 Language Hub',
        youtubeId: '4PvBkp-4bmc',
        youtubeUrl: 'https://www.youtube.com/watch?v=4PvBkp-4bmc',
        description: 'Targeted French phonetics masterclass: Mouth positioning drills, liaisons, silent letters, nasal vowels, and speaking with a clear authentic accent.',
        completed: false,
        badge: 'Prononciation & Accent',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'CEFR French Survival Guide & Verb Conjugation Wheel',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Top 100 Irregular Verbs Cheat Sheet', 'Audio Shadowing Dialogues (MP3/PDF)', 'DELF A1/A2 Practice Exams'],
      },
    ],
    prompts: [
      {
        title: 'French Immersion Roleplay Prompt',
        text: 'Tu es un serveur dans un bistrot parisien typique. Parlons en français de base. Demande-moi ce que je veux commander pour le déjeuner et aide-moi avec des options délicieuses.',
      },
    ],
  },

  'course-german-speaking': {
    courseTitle: 'German Speaking & Complete Language Masterclass (Goethe-Zertifikat A1–B2)',
    examCode: 'GERMAN-GOETHE',
    certificateTitle: 'Zertifikat Deutsch: Spoken Fluency & Grammar Mastery',
    videos: [
      {
        id: 'ger-vid-1',
        title: '01. Complete Conversational German: All the Basics You Need (A1–B2)',
        duration: '25:30',
        company: 'GermanPod101 (Official)',
        youtubeId: 'xg60VxyK-9I',
        youtubeUrl: 'https://www.youtube.com/watch?v=xg60VxyK-9I',
        description: 'Understand der, die, das and master Nominativ, Akkusativ, and Dativ cases through visual color coding.',
        completed: false,
        badge: 'GermanPod101 • Official',
      },
      {
        id: 'ger-vid-2',
        title: '02. Everyday Conversation in Slow German: Natural Dialogues & Listening',
        duration: '10:45',
        company: 'Easy German (Official)',
        youtubeId: 'LwJfk1NUeg4',
        youtubeUrl: 'https://www.youtube.com/watch?v=LwJfk1NUeg4',
        description: 'Real-world dialogues in clear, slow German: Street interviews, everyday conversation etiquette, and training natural auditory comprehension.',
        completed: false,
        badge: 'Conversational Fluency',
      },
      {
        id: 'ger-vid-3',
        title: '03. German Sentence Structure (Satzbau): Word Order & Verb Positions (Hauptsatz)',
        duration: '14:20',
        company: 'YourGermanTeacher (Official)',
        youtubeId: 'O-_cxHx5FD4',
        youtubeUrl: 'https://www.youtube.com/watch?v=O-_cxHx5FD4',
        description: 'Master German sentence construction: Subject-verb-object rules, the V2 verb position, Akkusativ/Dativ placement, and TeKaMoLo principles.',
        completed: false,
        badge: 'Satzbau & Grammar',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Goethe Exam Vocabulary & Case Declension Tables',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Der/Die/Das Color-Coded Flashcards', 'Goethe A1/A2 Wordlist (PDF)', 'Daily German Shadowing Audios'],
      },
    ],
    prompts: [
      {
        title: 'German Practice Partner Prompt',
        text: 'Sei mein Deutsch-Sprachpartner auf Niveau A2/B1. Lass uns über das Thema "Reisen und Urlaub" sprechen. Korrigiere freundlich meine Fälle (Dativ/Akkusativ) nach jedem Satz.',
      },
    ],
  },

  'course-public-speaking-articulation': {
    courseTitle: 'Public Speaking, Articulation & Stage Mastery: Speak with Impact & Charisma',
    examCode: 'PUBLIC-SPEAK',
    certificateTitle: 'Executive Public Speaking & Charismatic Articulation Certification',
    videos: [
      {
        id: 'speak-vid-1',
        title: '01. How to Speak So People Want to Listen: Eliminating Vocal Traps',
        duration: '31:40',
        company: 'TED Talks & Toastmasters',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: 'World-renowned framework on avoiding gossip, dogmatism, monotony, and mastering breath projection from the diaphragm.',
        completed: false,
        badge: 'TED Keynote • Verified',
      },
      {
        id: 'speak-vid-2',
        title: '02. The Art of the Narrative Hook: Storytelling Structures for Presentations',
        duration: '33:15',
        company: 'Keynote Mastery Lab',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Structure 5-minute pitches and 45-minute keynote presentations using the hero\'s journey, stakes, and resolution arc.',
        completed: false,
        badge: 'Storytelling & Pitching',
      },
      {
        id: 'speak-vid-3',
        title: '03. Body Language, Stage Movement, Eye Contact & Eliminating Filler Words',
        duration: '32:40',
        company: 'Stanford Graduate School of Business',
        youtubeId: 'HAnw168huqA',
        youtubeUrl: 'https://www.youtube.com/watch?v=HAnw168huqA',
        description: 'Overcome stage fright with physiological sighs; convert "um", "uh", and "like" into powerful silent pauses.',
        completed: false,
        badge: 'Stanford GSB • Stage Presence',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'Executive Speech Architect: Outline Templates & Articulation Drills',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['TED-Style Keynote Outline Template', 'Daily Vocal Warm-Up Guide', 'Stage Fright Emergency Routine'],
      },
    ],
    prompts: [
      {
        title: 'Keynote Speech Speechwriter Prompt',
        text: 'Act as a World-Class Speechwriter. Write an inspirational 3-minute opening monologue for a tech founder addressing young students about resilience and ethical leadership.',
      },
    ],
  },

  'course-neet-ug': {
    courseTitle: 'NEET (UG) 2027 Medical Entrance: AI Adaptive Prep & Weekly Material Delivery',
    examCode: 'NEET-UG',
    certificateTitle: 'NEET UG 2027 Medical Aspirant Foundation & Speed Solving Certification',
    videos: [
      {
        id: 'neet-vid-1',
        title: '01. NEET Biology (Botany): Introduction to Cells & NCERT Organelle Breakdown',
        duration: '15:30',
        company: 'Amoeba Sisters (Official)',
        youtubeId: '8IlzKri08kk',
        youtubeUrl: 'https://www.youtube.com/watch?v=8IlzKri08kk',
        description: 'Target 360/360 in Biology: Master cell structures, eukaryotic vs prokaryotic distinctions, and high-yield NCERT diagram points.',
        completed: false,
        badge: 'NEET Biology (Botany)',
      },
      {
        id: 'neet-vid-2',
        title: '02. NEET Biology (Zoology): Animal Cells & Human Physiology Foundation',
        duration: '11:40',
        company: 'Crash Course Biology (Official)',
        youtubeId: 'cj8dDTHGJBY',
        youtubeUrl: 'https://www.youtube.com/watch?v=cj8dDTHGJBY',
        description: 'Comprehensive tour of animal cell physiology, organelle specialization, cellular respiration, and high-yield NCERT Zoology questions.',
        completed: false,
        badge: 'NEET Biology (Zoology)',
      },
      {
        id: 'neet-vid-3',
        title: '03. NEET Physics Checklist: Motion in One Dimension & Kinematics Shortcuts',
        duration: '35:20',
        company: 'Physics Galaxy (Ashish Arora)',
        youtubeId: 'nbdkURzO13U',
        youtubeUrl: 'https://www.youtube.com/watch?v=nbdkURzO13U',
        description: 'Ashish Arora\'s NEET Physics revision checklist: Graphical velocity-time analysis, deceleration tricks, and 45-second numerical shortcuts.',
        completed: false,
        badge: 'NEET Physics (180M)',
      },
      {
        id: 'neet-vid-4',
        title: '04. NEET Chemistry: The Periodic Table & Chemical Periodicity Trends',
        duration: '11:25',
        company: 'Crash Course Chemistry (Official)',
        youtubeId: '0RRVV4Diomg',
        youtubeUrl: 'https://www.youtube.com/watch?v=0RRVV4Diomg',
        description: 'Periodic trends, electronegativity, ionization enthalpy, electron gain enthalpy, and transition metal behaviors for NEET.',
        completed: false,
        badge: 'NEET Chemistry (180M)',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'NEET 2027 High-Yield Biology & Organic Reaction Mind Maps',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['NCERT 100 Most Expected Diagrams', 'Organic Reaction Roadmaps (PDF)', '200-Question OMR Diagnostic Test'],
      },
    ],
    prompts: [
      {
        title: 'NEET Biology Conceptual Breakdown',
        text: 'Act as a Senior NEET Biology Professor. Explain the exact mechanism of the light-dependent reactions of photosynthesis, distinguishing cyclic vs non-cyclic photophosphorylation with common NTA trap options.',
      },
    ],
  },

  'course-iit-jee': {
    courseTitle: 'IIT JEE (Main & Advanced) 2027: AI Problem Solving & Weekly Delivery Track',
    examCode: 'IIT-JEE',
    certificateTitle: 'IIT JEE Advanced Problem Solving & Analytical Rigor Certification',
    videos: [
      {
        id: 'jee-vid-1',
        title: '01. IIT JEE Mathematics: Linear Algebra, Coordinate Geometry & Vectors',
        duration: '25:30',
        company: '3Blue1Brown (Essence of Math)',
        youtubeId: 'fNk_zzaMoSs',
        youtubeUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
        description: 'Tackle JEE Advanced multi-concept questions: Vector spaces, linear transformations, dot and cross products, and 3D geometric problem solving.',
        completed: false,
        badge: 'JEE Math (100M)',
      },
      {
        id: 'jee-vid-2',
        title: '02. IIT JEE Mathematics: Calculus, Number Theory & Integration Hacks',
        duration: '23:45',
        company: 'Numberphile (Official)',
        youtubeId: 'd8TRcZklX_Q',
        youtubeUrl: 'https://www.youtube.com/watch?v=d8TRcZklX_Q',
        description: 'Definite integrals using King\'s Property, tangents to parabolas and ellipses, modular arithmetic, and parametric coordinates shortcuts.',
        completed: false,
        badge: 'JEE Advanced Math',
      },
      {
        id: 'jee-vid-3',
        title: '03. IIT JEE Physics: Motion in One Dimension & Kinematics Masterclass',
        duration: '35:20',
        company: 'Physics Galaxy (Ashish Arora)',
        youtubeId: 'nbdkURzO13U',
        youtubeUrl: 'https://www.youtube.com/watch?v=nbdkURzO13U',
        description: 'Ashish Arora\'s JEE Physics checklist: Calculus-based kinematics, projectile motion, relative velocity, and constraint motion.',
        completed: false,
        badge: 'JEE Physics (100M)',
      },
      {
        id: 'jee-vid-4',
        title: '04. IIT JEE Chemistry: Periodic Table Trends & Chemical Bonding',
        duration: '11:25',
        company: 'Crash Course Chemistry (Official)',
        youtubeId: '0RRVV4Diomg',
        youtubeUrl: 'https://www.youtube.com/watch?v=0RRVV4Diomg',
        description: 'Complete mastery of periodic properties, hybridization, molecular orbital theory, and inorganic reaction trends for JEE Main and Advanced.',
        completed: false,
        badge: 'JEE Chemistry (100M)',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'IIT JEE Advanced Formula & High-Difficulty Problem Bank',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['Rotational Dynamics Problem Bank (PDF)', 'Calculus Integration Tricks Table', 'JEE Main 2024-2026 PYQ Solutions'],
      },
    ],
    prompts: [
      {
        title: 'JEE Advanced Multi-Concept Problem Generator',
        text: 'Act as a top IIT JEE Advanced test maker. Generate a challenging multi-concept problem combining simple harmonic motion with magnetic Lorentz force, followed by step-by-step analytical solution and common calculation traps.',
      },
    ],
  },

  'course-keam-prep': {
    courseTitle: 'KEAM 2027 (Kerala Engineering): Speed Master & Weekly Material Delivery',
    examCode: 'KEAM-2027',
    certificateTitle: 'KEAM Kerala Engineering Speed & Rank Booster Certification',
    videos: [
      {
        id: 'keam-vid-1',
        title: '01. KEAM 2027: 120 Questions Speed Solving & Arithmetic Protocol',
        duration: '22:15',
        company: 'Numberphile (Official)',
        youtubeId: 'd8TRcZklX_Q',
        youtubeUrl: 'https://www.youtube.com/watch?v=d8TRcZklX_Q',
        description: 'Master fast option elimination, mental arithmetic, and time-budgeting for Kerala Engineering Architecture Medical (KEAM) CBT exams.',
        completed: false,
        badge: 'KEAM Speed Tactics',
      },
      {
        id: 'keam-vid-2',
        title: '02. KEAM Mathematics: Vectors & 3D Coordinate Geometry',
        duration: '25:30',
        company: '3Blue1Brown (Essence of Math)',
        youtubeId: 'fNk_zzaMoSs',
        youtubeUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
        description: 'Dot and cross product tricks, shortest distance between skew lines, plane intersections, and determinant expansion properties.',
        completed: false,
        badge: 'KEAM Mathematics',
      },
      {
        id: 'keam-vid-3',
        title: '03. KEAM Physics: Kinematics & Mechanics Speed Formula Revision',
        duration: '35:20',
        company: 'Physics Galaxy (Ashish Arora)',
        youtubeId: 'nbdkURzO13U',
        youtubeUrl: 'https://www.youtube.com/watch?v=nbdkURzO13U',
        description: 'Solve physics numericals in under 45 seconds using graphical elimination, dimensional analysis, and standard result memory pegs.',
        completed: false,
        badge: 'KEAM Physics',
      },
      {
        id: 'keam-vid-4',
        title: '04. KEAM Chemistry: Periodic Table Trends & Chemical Bonding',
        duration: '11:25',
        company: 'Crash Course Chemistry (Official)',
        youtubeId: '0RRVV4Diomg',
        youtubeUrl: 'https://www.youtube.com/watch?v=0RRVV4Diomg',
        description: 'Kerala CEE KEAM Chemistry syllabus: Periodic properties, molecular structure, chemical equilibrium, and high-yield scoring chapters.',
        completed: false,
        badge: 'KEAM Chemistry',
      },
    ],
    weeklyPackages: [
      {
        week: 1,
        title: 'KEAM Speed Formula Guide & 5-Year Past Solved Papers',
        releaseDate: 'Available Now',
        status: 'Available',
        modules: ['KEAM High-Yield Formula Mind Map', '120-Question Timed Mock CBT Test', 'Subject-wise Mark Distribution Breakdown'],
      },
    ],
    prompts: [
      {
        title: 'KEAM Speed Calculation Shortcut',
        text: 'Act as a top KEAM Engineering ranker coach. Provide quick 30-second shortcut formulas for solving 3D line intersection and matrix inverse problems without tedious row reduction.',
      },
    ],
  },
};

export default function StudentPortalModal({ 
  onClose, 
  onLaunchMockTest,
  initialCourseId = 'course-aissee-sainik-6',
}: StudentPortalModalProps) {
  const { user, loginWithCredentials, logout, setStudentStandard } = useAuth();

  // Login form state for unauthenticated visitors
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginCourseId, setLoginCourseId] = useState(initialCourseId || COURSES_DATA[0]?.id || 'course-aissee-sainik-6');

  // Determine active course (strictly prefers student's enrolled course and standard)
  const defaultCourse = useMemo(() => {
    if (user?.standard === 'class-9' && COURSE_CURRICULUMS['course-aissee-sainik-9']) {
      return 'course-aissee-sainik-9';
    }
    if (user?.standard === 'class-6' && COURSE_CURRICULUMS['course-aissee-sainik-6']) {
      return 'course-aissee-sainik-6';
    }
    if (user?.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
      const first = user.enrolledCourseIds[0];
      if (COURSE_CURRICULUMS[first]) return first;
    }
    if (user?.targetExamCode === 'AISSEE-9') {
      return 'course-aissee-sainik-9';
    }
    if (user?.targetExamCode === 'AISSEE-6' || user?.targetExamCode === 'AISSEE') {
      return 'course-aissee-sainik-6';
    }
    if (user?.targetExamCode === 'NEET' || user?.enrolledCourseIds?.includes('course-neet-ug')) {
      return 'course-neet-ug';
    }
    return initialCourseId && COURSE_CURRICULUMS[initialCourseId] ? initialCourseId : 'course-aissee-sainik-6';
  }, [user, initialCourseId]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourse);

  // Whenever user changes, ensure the selected course corresponds directly to their enrolled course
  useEffect(() => {
    if (user?.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
      const first = user.enrolledCourseIds[0];
      if (COURSE_CURRICULUMS[first]) {
        setSelectedCourseId(first);
      }
    }
  }, [user]);

  const [studentName, setStudentName] = useState(user?.name || 'Aspirant Student');

  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name);
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState<'lessons' | 'dispatches' | 'mock_tests' | 'badges' | 'prompts' | 'certificate'>('lessons');
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isVoiceDoubtOpen, setIsVoiceDoubtOpen] = useState(false);
  const [isFriendWelcomeOpen, setIsFriendWelcomeOpen] = useState(false);

  // Active curriculum based on selected course
  const currentCurriculum = COURSE_CURRICULUMS[selectedCourseId] || COURSE_CURRICULUMS['course-aissee-sainik'];
  const effectiveVideos = COURSE_VIDEO_PLAYLISTS[selectedCourseId] || currentCurriculum.videos;
  const [activeVideoId, setActiveVideoId] = useState<string>(() => effectiveVideos[0]?.id || 'sainik-vid-1');

  // Reset active video when course changes
  useEffect(() => {
    if (effectiveVideos.length > 0) {
      setActiveVideoId(effectiveVideos[0].id);
    }
  }, [selectedCourseId, effectiveVideos]);

  const targetDate = user?.targetExamDate || (selectedCourseId === 'course-aissee-sainik' ? '2027-01-10' : '2027-05-02');
  const daysLeft = calculateDaysToExam(targetDate);
  const weeksLeft = calculateWeeksToExam(daysLeft);

  const currentLesson = effectiveVideos.find((l) => l.id === activeVideoId) || effectiveVideos[0];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2500);
  };

  const handleDownloadFullStudyPack = () => {
    downloadStudyMaterialFile(selectedCourseId, studentName);
    setDownloadNotice(`✓ Downloaded complete ${currentCurriculum.courseTitle} Study Pack (PDF)!`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleSendToWhatsApp = async (pkgTitle?: string) => {
    setIsSendingWhatsApp(true);
    const targetPhone = user?.phone?.replace(/[^0-9]/g, '') || '8281644058';
    const cleanPhone = targetPhone.length === 10 ? `91${targetPhone}` : targetPhone;
    const customMessage = generateWhatsAppDispatchMessage(studentName, selectedCourseId, cleanPhone);

    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          recipientName: studentName,
          messageType: 'weekly_drop',
          customMessage,
        }),
      });

      setDownloadNotice(`✓ Opening WhatsApp with your study pack links...`);
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`, '_blank');
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`, '_blank');
      setTimeout(() => setDownloadNotice(null), 4000);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handlePortalLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your Username/Email and Password.');
      return;
    }
    setIsLoggingIn(true);
    const res = await loginWithCredentials(loginIdentifier.trim(), loginPassword.trim(), loginCourseId);
    setIsLoggingIn(false);
    if (res.success) {
      setIsFriendWelcomeOpen(true);
    } else {
      setLoginError(res.message || 'Invalid credentials. Please verify or register via enrollment.');
    }
  };

  // Find matching mock test for this course
  const relevantMockTests = useMemo(() => {
    if (selectedCourseId === 'course-aissee-sainik-6' || (selectedCourseId.includes('sainik') && user?.standard === 'class-6')) {
      return MOCK_TESTS_DATA.filter((t) => t.examCode === 'AISSEE-6' || t.id.includes('class6') || (t.examCode === 'AISSEE' && !t.id.includes('class9')));
    }
    if (selectedCourseId === 'course-aissee-sainik-9' || (selectedCourseId.includes('sainik') && user?.standard === 'class-9')) {
      return MOCK_TESTS_DATA.filter((t) => t.examCode === 'AISSEE-9' || t.id.includes('class9'));
    }
    if (selectedCourseId === 'course-aissee-sainik') {
      return MOCK_TESTS_DATA.filter((t) => t.examCode === 'AISSEE' || t.examCode.startsWith('AISSEE') || t.id.includes('sainik'));
    }
    if (selectedCourseId === 'course-navodaya-jnvst') {
      return MOCK_TESTS_DATA.filter((t) => t.examCode === 'NAVODAYA' || t.id.includes('navodaya'));
    }
    if (selectedCourseId === 'course-neet-ug') {
      return MOCK_TESTS_DATA.filter((t) => t.examCode === 'NEET' || t.id.includes('neet'));
    }
    return MOCK_TESTS_DATA;
  }, [selectedCourseId, user?.standard]);

  // UN-AUTHENTICATED STATE: SHOW SECURE LOGIN GATE
  if (!user) {
    return (
      <div
        id="student-portal-login-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans"
      >
        <div className="relative w-full max-w-md rounded-3xl bg-[#0b101b] border border-[#1e293b] text-white shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                NC
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">Student Learning Portal</h3>
                <p className="text-[11px] text-neutral-400">Nextclasses.in Academy</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Lock badge & explanation */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white">Sign In to Student Portal</h4>
              <p className="text-xs text-neutral-300 max-w-xs mx-auto">
                Access study materials, formula sheets, CBT mock tests, and Sunday dispatches.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handlePortalLogin} className="space-y-3.5">
              {/* Course Dropdown */}
              <div>
                <label htmlFor="portal-login-course-select" className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>Select Enrolled Course</span>
                </label>
                <select
                  id="portal-login-course-select"
                  value={loginCourseId}
                  onChange={(e) => {
                    setLoginCourseId(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors font-medium cursor-pointer"
                >
                  {COURSES_DATA.map((course) => (
                    <option key={course.id} value={course.id} className="bg-[#0b101b] text-white">
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  Username or Registered Email
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your username or registered email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center font-medium animate-in fade-in-50">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> : <Lock className="w-4 h-4 text-neutral-950" />}
                <span>Sign In to Student Portal</span>
              </button>
            </form>

            {/* Info for new enrollments */}
            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 text-center space-y-1">
              <p>
                💡 <strong className="text-neutral-200">Just paid via UPI QR Code?</strong> Your personal username and password were generated and sent to your email & phone.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-orange-400 hover:underline font-bold"
              >
                Scan UPI QR Code on Homepage &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="student-portal-demo-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0b101b] border border-[#1e293b] text-white shadow-2xl overflow-hidden my-auto">
        
        {/* Top App Header */}
        <div className="px-5 py-3.5 bg-[#0f172a] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-neutral-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              NC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">Nextclasses.in Student Learning Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Enrolled & Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 flex-wrap">
                <span>Student: <strong className="text-white">{user?.name || studentName}</strong></span>
                {user?.username && (
                  <span className="font-mono text-sky-400 text-[10px] bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                    @{user.username}
                  </span>
                )}
                {user?.standard && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    user.standard === 'class-9'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                      : 'bg-orange-950/80 text-orange-300 border-orange-600/60'
                  }`}>
                    {user.standard === 'class-9' ? 'Class 9 (400 Marks)' : 'Class 6 (300 Marks)'}
                  </span>
                )}
                <span>• Goal: <strong className="text-amber-400">{currentCurriculum.examCode} 2027</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Live Voice Doubt Tutor Button */}
            <button
              type="button"
              onClick={() => setIsVoiceDoubtOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-neutral-950 text-xs font-black transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              title="Ask doubts in real time with Voice AI (gemini-3.8-live)"
            >
              <Mic className="w-3.5 h-3.5 text-neutral-950 animate-pulse" />
              <span className="hidden sm:inline">Voice Doubt AI</span>
              <span className="sm:hidden">Doubts</span>
            </button>

            {/* Friend Welcome & Companion Bot Button */}
            {user && (
              <button
                type="button"
                onClick={() => setIsFriendWelcomeOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                title="Friend Bot: Aim, Doubts & Family Chat"
              >
                <span>🤝</span>
                <span className="hidden sm:inline">Friend Bot</span>
              </button>
            )}

            {/* Direct Study Material Download Button */}
            <button
              type="button"
              onClick={handleDownloadFullStudyPack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              title="Download printable study guide, syllabus & formula sheets"
            >
              <Download className="w-3.5 h-3.5 text-neutral-950" />
              <span className="hidden sm:inline">Download Study Pack (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Direct WhatsApp Dispatch Button */}
            <button
              type="button"
              onClick={() => handleSendToWhatsApp()}
              disabled={isSendingWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              title="Send study links directly to WhatsApp"
            >
              {isSendingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">WhatsApp Links</span>
            </button>

            {/* Logout / Switch Account */}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course Switcher Sub-Bar */}
        <div className="px-5 py-2.5 bg-[#0b1220] border-b border-[#1a2336] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <BookOpen className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-semibold text-neutral-300">Active Exam Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedCourseId(nextId);
                if (nextId === 'course-aissee-sainik-6') {
                  setStudentStandard('class-6');
                } else if (nextId === 'course-aissee-sainik-9') {
                  setStudentStandard('class-9');
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#141d2d] border border-[#263750] text-xs font-bold text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="course-google-ai-studio">💻 Google AI Studio & Gemini 2.0 Flash</option>
              <option value="course-claude-mastery">🤖 Claude AI Masterclass: Claude 3.7 Sonnet</option>
              <option value="course-chatgpt-6-openai">🧠 ChatGPT & OpenAI: GPT-4o, o1, o3-mini</option>
              <option value="course-deepseek-finance-excel">📊 DeepSeek R1 & Excel Financial Modeling</option>
              <option value="course-cursor-copilot-coding">💻 Cursor AI & GitHub Copilot Coding</option>
              <option value="course-autonomous-ai-agents">🤖 Autonomous AI Agents: LangGraph & CrewAI</option>
              <option value="course-voice-ai-telephony">📞 Voice AI & Realtime Telephony Calling</option>
              <option value="course-ai-automation">⚡ AI Automation: n8n & Autonomous Workflows</option>
              <option value="course-ai-video-filmmaking">🎬 AI Video Filmmaking & Viral Content Studio</option>
              <option value="course-midjourney-visuals">🎨 Midjourney v6 & Ideogram Creative Studio</option>
              <option value="course-ai-designer">🎨 Next-Gen AI Designer: Posters, Branding & Creative Media</option>
              <option value="course-genai-beginners">🚀 Generative AI Complete Guide for Beginners</option>
              <option value="course-ai-teachers">🍎 AI for Teachers: Lesson Plans & Question Papers</option>
              <option value="course-ai-students">🎓 AI for Students: Academic Superpowers & Flashcards</option>
              <option value="course-english-speaking">🗣️ Fluent English Speaking & Pronunciation</option>
              <option value="course-french-speaking">🇫🇷 French Speaking & Fluency (CEFR A1–B2)</option>
              <option value="course-german-speaking">🇩🇪 German Speaking & Fluency (Goethe A1–B2)</option>
              <option value="course-public-speaking-articulation">🎙️ Public Speaking, Articulation & Stage Mastery</option>
              <option value="course-aissee-sainik-6">🎖️ AISSEE Sainik School: Class 6 (300 Marks Track)</option>
              <option value="course-aissee-sainik-9">🎖️ AISSEE Sainik School: Class 9 (400 Marks Track)</option>
              <option value="course-aissee-sainik">🎖️ AISSEE Sainik School: Dual Track (Class 6 & 9)</option>
              <option value="course-navodaya-jnvst">🏫 Navodaya Vidyalaya (JNVST) Rapid Kit</option>
              <option value="course-neet-ug">🩺 NEET (UG) 2027 Medical Entrance Track</option>
              <option value="course-iit-jee">📐 IIT JEE (Main & Advanced) 2027 Track</option>
              <option value="course-keam-prep">⚡ KEAM 2027 (Kerala Engineering) Speed Master</option>
            </select>

            {/* Quick Standard Toggle for Sainik School aspirants */}
            {selectedCourseId.includes('sainik') && (
              <div className="flex items-center gap-1 bg-[#141d2d] px-2 py-1 rounded-lg border border-[#263750]">
                <span className="text-[11px] text-neutral-400 font-semibold mr-1">Standard:</span>
                <button
                  type="button"
                  id="portal-toggle-class6-btn"
                  onClick={() => {
                    setSelectedCourseId('course-aissee-sainik-6');
                    setStudentStandard('class-6');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                    selectedCourseId === 'course-aissee-sainik-6' || user?.standard === 'class-6'
                      ? 'bg-orange-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Class 6 (300M)
                </button>
                <button
                  type="button"
                  id="portal-toggle-class9-btn"
                  onClick={() => {
                    setSelectedCourseId('course-aissee-sainik-9');
                    setStudentStandard('class-9');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                    selectedCourseId === 'course-aissee-sainik-9' || user?.standard === 'class-9'
                      ? 'bg-orange-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Class 9 (400M)
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-[#141d2d] border border-[#263750] text-[11px] text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong className="text-white">{daysLeft}</strong> days to exam (<strong className="text-amber-400">{weeksLeft}</strong> study drops)
              </span>
            </div>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="px-5 bg-[#0f172a]/60 border-b border-[#1e293b] flex items-center gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'lessons'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Video Masterclasses ({effectiveVideos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dispatches')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dispatches'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Weekly Study Packs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 text-[10px]">Active Drops</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mock_tests')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mock_tests'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Mock Tests (CBT)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">Live Exam</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'badges'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Medal className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges & Honors</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">New</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'prompts'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Formulas & Prompts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Verified Certificate
          </button>
        </div>

        {downloadNotice && (
          <div className="bg-emerald-950/90 text-emerald-300 text-xs py-2 px-4 text-center border-b border-emerald-800 animate-in fade-in">
            {downloadNotice}
          </div>
        )}

        {/* Enrolled Study Material Package Banner */}
        <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#131d2e] via-[#0f172a] to-[#162035] border border-[#23354e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Your Enrolled Study Material Pack</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Unlocked for {user?.name || studentName}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white">{currentCurriculum.courseTitle}</h4>
            <p className="text-xs text-neutral-300">
              Syllabus breakdown, high-yield arithmetic, reasoning tricks, full printable PDF kit & CBT mock tests.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadFullStudyPack}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-950" />
              <span>Download Study Pack (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendToWhatsApp()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Links</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* LESSONS TAB */}
          {activeTab === 'lessons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Video Player */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative aspect-16/9 rounded-2xl bg-black border border-[#1e293b] overflow-hidden shadow-2xl">
                  {currentLesson ? (
                    <iframe
                      key={currentLesson.youtubeId}
                      src={`https://www.youtube-nocookie.com/embed/${currentLesson.youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
                      title={currentLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                      <Tv className="w-12 h-12 text-neutral-600 mb-2" />
                      <p className="text-sm font-semibold text-neutral-300">No Video Lessons In Portal</p>
                    </div>
                  )}
                </div>

                {/* Lesson Info Card */}
                {currentLesson && (
                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded font-semibold">
                            {currentLesson.badge}
                          </span>
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded flex items-center gap-1">
                            {currentLesson.company}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400 bg-[#1e293b] px-2 py-0.5 rounded">
                            {currentLesson.duration}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-white">{currentLesson.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={currentLesson.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Direct YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </a>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed border-t border-[#1f293d] pt-2.5">
                      {currentLesson.description}
                    </p>

                    {/* Voice Doubt AI Quick Prompt Banner */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-950/50 to-amber-950/40 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 text-neutral-950 flex items-center justify-center font-bold shrink-0">
                          <Mic className="w-4 h-4 text-neutral-950 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Have a doubt in this lesson? Ask Voice Tutor</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">gemini-3.8-live</span>
                          </div>
                          <p className="text-[11px] text-neutral-300">
                            Speak in Malayalam, Tamil, Telugu, Hindi, or English. Get real-time spoken and written clarification.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVoiceDoubtOpen(true)}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                      >
                        <Mic className="w-3 h-3 text-neutral-950" />
                        <span>Ask Doubts</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Playlist */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Curriculum Masterclasses ({effectiveVideos.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {effectiveVideos.map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveVideoId(lesson.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        activeVideoId === lesson.id
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-[#111827] border-[#1e293b] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : activeVideoId === lesson.id ? (
                          <Play className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold block text-neutral-200 leading-snug">{lesson.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
                          <span>{lesson.duration}</span>
                          <span>•</span>
                          <span className="truncate">{lesson.badge}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* WEEKLY DISPATCHES TAB */}
          {activeTab === 'dispatches' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span>Weekly Study Material Dispatches ({currentCurriculum.examCode})</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Structured high-yield study packs designed for direct printout, revision, and mobile practice.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadFullStudyPack}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Modules (PDF)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentCurriculum.weeklyPackages.map((pkg) => (
                  <div
                    key={pkg.week}
                    className="p-4 rounded-2xl border flex flex-col justify-between space-y-4 bg-[#111827] border-[#222e42] shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e293b] text-orange-400">
                          WEEK {pkg.week}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {pkg.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white leading-tight">{pkg.title}</h4>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{pkg.releaseDate}</span>
                      </p>

                      <ul className="pt-2 space-y-1.5 text-xs text-neutral-300">
                        {pkg.modules.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadFullStudyPack}
                        className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>Download Week {pkg.week} Pack (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendToWhatsApp(pkg.title)}
                        disabled={isSendingWhatsApp}
                        className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send to My WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MOCK TESTS TAB */}
          {activeTab === 'mock_tests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <span>Computer Based Test (CBT) Mock Exams — {currentCurriculum.examCode}</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Timed exam simulations matching official NTA scoring patterns with step-by-step solutions.
                  </p>
                </div>
              </div>

              {/* Available Mock Tests */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Available Test Papers for {currentCurriculum.courseTitle}:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relevantMockTests.map((test) => (
                    <div
                      key={test.id}
                      className="p-5 rounded-2xl bg-[#111827] border border-[#222e42] hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            {test.examCode}
                          </span>
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            <span>{test.durationMinutes} Mins • {test.totalMarks} Marks</span>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-white">{test.title}</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {test.questions.length} real entrance questions covering {test.questions.map(q => q.subject).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 font-mono">
                          +{test.positiveMarks} / -{test.negativeMarks} Marking
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (onLaunchMockTest) {
                              onLaunchMockTest(test.id);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-500/20"
                        >
                          <span>Start CBT Exam</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FORMULAS & PROMPTS TAB */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">High-Yield Memory Drills & Formula Cards</h3>
                <p className="text-xs text-neutral-400">
                  Ready-to-use memory drills, mental math shortcuts, and AI prompt templates for {currentCurriculum.courseTitle}.
                </p>
              </div>

              <div className="space-y-3">
                {currentCurriculum.prompts.map((prompt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#111827] border border-[#222e42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">{prompt.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(prompt.text, idx)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedPromptIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Drill</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-neutral-300 bg-[#090d14] p-3 rounded-xl border border-[#1b2536] whitespace-pre-wrap leading-relaxed">
                      {prompt.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BADGES & HONORS TAB */}
          {activeTab === 'badges' && (
            <StudentBadges
              user={user}
              selectedCourseTitle={currentCurriculum.courseTitle}
              totalLessonsCount={effectiveVideos.length}
              completedLessonsCount={effectiveVideos.filter(v => v.completed).length}
              onNavigateToTab={(target) => {
                if (target === 'mock_tests') setActiveTab('mock_tests');
                else if (target === 'lessons') setActiveTab('lessons');
                else if (target === 'dispatches') setActiveTab('dispatches');
              }}
            />
          )}

          {/* VERIFIED CERTIFICATE TAB */}
          {activeTab === 'certificate' && (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto flex items-center gap-2 text-left">
                <label htmlFor="student-name-input" className="text-xs text-neutral-400 whitespace-nowrap">
                  Recipient Student Name:
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[#141d2d] border border-[#263750] text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Certificate Canvas Card */}
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0f172a] border-4 border-amber-500/30 relative shadow-2xl overflow-hidden text-white">
                <div className="border border-neutral-700/80 p-6 sm:p-10 space-y-5 rounded-2xl relative bg-[#0a0f1d]">
                  
                  {/* Decorative Emblem */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-neutral-950 font-black shadow-lg">
                    <Award className="w-7 h-7 text-neutral-950" />
                  </div>

                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-orange-400">
                      Nextclasses.in Academy
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                      {currentCurriculum.certificateTitle}
                    </h2>
                  </div>

                  <p className="text-xs text-neutral-400">This is proudly presented to</p>

                  <div className="text-2xl sm:text-3xl font-serif font-black text-amber-300 underline decoration-amber-500/40 underline-offset-8">
                    {studentName || 'Aspirant Student'}
                  </div>

                  <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                    for successfully completing weekly study sprints, diagnostic baseline assessments, and OMR speed benchmarks in <strong>{currentCurriculum.courseTitle}</strong>.
                  </p>

                  <div className="pt-6 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <div>
                      <span className="block font-mono text-emerald-400 font-bold">VERIFIED ID: NC-2027-{selectedCourseId.slice(-4).toUpperCase()}</span>
                      <span>Authorized Nextclasses.in Credential</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-semibold text-white">Academic Council</span>
                      <span>Director of Curriculum</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#0f172a] border-t border-[#1e293b] flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Helpline & WhatsApp Dispatch: <strong className="text-white">+91 82816 44058</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Close Portal
          </button>
        </div>

        {/* Floating Voice Doubt Tutor Pill */}
        <button
          type="button"
          onClick={() => setIsVoiceDoubtOpen(true)}
          className="fixed sm:absolute bottom-5 right-5 z-30 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-neutral-950 font-black text-xs shadow-2xl shadow-orange-500/30 border border-amber-300/40 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          title="Ask course doubts live with voice AI (Gemini 3.8 Live)"
        >
          <Mic className="w-4 h-4 text-neutral-950 animate-pulse" />
          <span>🎙️ Voice Doubt AI</span>
        </button>

      </div>

      {/* Real-time Voice Doubt Resolution Bot for Active Student Portal Course */}
      <CourseVoiceDoubtBot
        isOpen={isVoiceDoubtOpen}
        onClose={() => setIsVoiceDoubtOpen(false)}
        course={{
          id: selectedCourseId,
          title: currentCurriculum.courseTitle,
          category: currentCurriculum.examCode,
        }}
      />

      {/* Student Friend Welcome & Companion Bot */}
      {isFriendWelcomeOpen && user && (
        <StudentFriendWelcomeBot
          isOpen={isFriendWelcomeOpen}
          onClose={() => setIsFriendWelcomeOpen(false)}
          student={user}
          courseTitle={currentCurriculum.courseTitle}
          courseId={selectedCourseId}
          onContinueToDashboard={() => setIsFriendWelcomeOpen(false)}
        />
      )}
    </div>
  );
}
