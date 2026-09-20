import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  X, Play, CheckCircle2, Clock, Calendar, Download, Send, 
  Copy, Check, Award, Tv, ExternalLink, Target, 
  BarChart3, ArrowRight, Loader2, MessageCircle, Settings, BookOpen, Sparkles,
  Lock, KeyRound, LogOut, Mail, Eye, EyeOff, UserCheck, ShieldCheck, Medal
} from 'lucide-react';
import StudentBadges from './StudentBadges';
import { useAuth } from '../context/AuthContext';
import { MOCK_TESTS_DATA } from '../data/mockTestsData';
import { downloadStudyMaterialFile, generateWhatsAppDispatchMessage, STUDY_MATERIALS_DATABASE } from '../utils/studyMaterialGenerator';
import { COURSES_DATA } from '../data';
import { PortalVideoLesson } from '../types';
import { generateMailtoUrl } from '../utils/studentRegistry';

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
  onOpenAdmin?: () => void;
  initialCourseId?: string;
  onOpenAdminDispatch?: () => void;
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
        company: 'NextClass Sainik Wing (Class 6)',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Complete breakdown of the 50-question (150 marks) Class 6 Mathematics section: Vedic shortcuts, LCM & HCF fundamental theorem, unitary method, and speed calculations.',
        completed: false,
        badge: 'Class 6 Math (150 Marks)',
      },
      {
        id: 'sainik6-vid-2',
        title: '02. Class 6 Intelligence & Non-Verbal Reasoning: Analogies & Pattern Series',
        duration: '32:15',
        company: 'NextClass Reasoning Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Step-by-step visual puzzle solving, mirror images, pattern series completion, embedded figures, and direction sense tests for Class 6.',
        completed: false,
        badge: 'Class 6 Reasoning (50 Marks)',
      },
      {
        id: 'sainik6-vid-3',
        title: '03. Class 6 General Knowledge & Defence Forces: Param Vir Chakra & Commands',
        duration: '28:10',
        company: 'NextClass GK Council',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: 'Param Vir Chakra recipients, Indian Army/Navy/Air Force commands, national parks, capitals, monuments, and Class 6 general science trivia.',
        completed: false,
        badge: 'Class 6 GK (50 Marks)',
      },
      {
        id: 'sainik6-vid-4',
        title: '04. Class 6 English Grammar & Unseen Comprehension Mastery',
        duration: '25:30',
        company: 'NextClass Language Hub',
        youtubeId: 'Wn_eS5dcVyc',
        youtubeUrl: 'https://www.youtube.com/watch?v=Wn_eS5dcVyc',
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
        company: 'NextClass Sainik Wing (Class 9)',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Class 9 heavyweight Mathematics: 50 Questions carrying 4 Marks each (200 Marks total). NCERT Class 8 advanced algebraic identities, cylinders/cuboids mensuration, compound interest, and powers/exponents.',
        completed: false,
        badge: 'Class 9 Math (200 Marks / 50%)',
      },
      {
        id: 'sainik9-vid-2',
        title: '02. Class 9 General Science: Physics, Chemistry & Biology NCERT Drills',
        duration: '36:10',
        company: 'NextClass Science Faculty',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: '25 Questions (50 Marks): Force and pressure, friction, sound, metals and non-metals, cell structure and reproduction in animals with NCERT highlights.',
        completed: false,
        badge: 'Class 9 Science (50 Marks)',
      },
      {
        id: 'sainik9-vid-3',
        title: '03. Class 9 Social Studies: Revolt of 1857 & The Indian Constitution',
        duration: '30:45',
        company: 'NextClass Humanities Cell',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: '25 Questions (50 Marks): Indian National Movement, leaders of 1857, Fundamental Rights, Judiciary, resources, and geography of India.',
        completed: false,
        badge: 'Class 9 Social Studies (50 Marks)',
      },
      {
        id: 'sainik9-vid-4',
        title: '04. Class 9 Intelligence & Logical Reasoning: Syllogisms & Venn Diagrams',
        duration: '28:50',
        company: 'NextClass Reasoning Lab',
        youtubeId: 'Wn_eS5dcVyc',
        youtubeUrl: 'https://www.youtube.com/watch?v=Wn_eS5dcVyc',
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
        company: 'NextClass Sainik Wing',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Complete breakdown of the 50-question (150 marks) Class 6 & 9 Mathematics section: Vedic shortcuts, LCM & HCF fundamental theorem, unitary method, and speed calculations.',
        completed: false,
        badge: 'High-Yield Math (150 Marks)',
      },
      {
        id: 'sainik-vid-2',
        title: '02. AISSEE Intelligence & Non-Verbal Reasoning: Analogies & Pattern Series',
        duration: '32:15',
        company: 'NextClass Reasoning Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Step-by-step visual puzzle solving, mirror images, pattern series completion, embedded figures, and direction sense tests.',
        completed: false,
        badge: 'Reasoning (50 Marks)',
      },
      {
        id: 'sainik-vid-3',
        title: '03. AISSEE General Knowledge & Defence Forces: Param Vir Chakra & Commands',
        duration: '28:10',
        company: 'NextClass GK Council',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: 'Param Vir Chakra recipients, Indian Army/Navy/Air Force commands, national parks, capitals, monuments, and general science trivia.',
        completed: false,
        badge: 'General Knowledge (50 Marks)',
      },
      {
        id: 'sainik-vid-4',
        title: '04. AISSEE English Grammar & Unseen Comprehension Mastery',
        duration: '25:30',
        company: 'NextClass Language Hub',
        youtubeId: 'Wn_eS5dcVyc',
        youtubeUrl: 'https://www.youtube.com/watch?v=Wn_eS5dcVyc',
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
        company: 'NextClass Navodaya Cell',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Complete breakdown of the 40-question (50 marks) Mental Ability Test in JNVST: Odd-man-out, pattern completion, and paper folding.',
        completed: false,
        badge: 'Mental Ability (50 Marks)',
      },
      {
        id: 'navodaya-vid-2',
        title: '02. JNVST Arithmetic Section: Decimal Numbers & 5-Digit Operations',
        duration: '30:10',
        company: 'NextClass Arithmetic Wing',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
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
        duration: '42:15',
        company: 'Anthropic AI Engineering',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Master Claude 3.7 hybrid reasoning, budget tokens, and zero-shot multi-step task synthesis.',
        completed: false,
        badge: 'Claude 3.7 Mastery',
      },
      {
        id: 'claude-vid-2',
        title: '02. Interactive Artifacts & Single-File Application Development',
        duration: '36:40',
        company: 'NextClass Dev Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Building full React & SVG visualizations directly inside Claude Artifacts without external dependencies.',
        completed: false,
        badge: 'Artifacts Architecture',
      },
      {
        id: 'claude-vid-3',
        title: '03. Claude Projects, Knowledge Bases & Custom Instructions',
        duration: '29:50',
        company: 'Anthropic Official',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Structuring project files, codebase context, custom personas, and 200k context window optimization.',
        completed: false,
        badge: 'Claude Projects • 1080p',
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
        title: '01. Claude 3.7 Sonnet Hybrid Reasoning & Deep Research Workflow',
        duration: '38:20',
        company: 'Anthropic AI Engineering',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Toggle between standard generation and extended thinking modes with precision token allocation.',
        completed: false,
        badge: 'Sonnet 3.7 Core',
      },
      {
        id: 'claude-m-2',
        title: '02. Production Web UI & Data Dashboards in Claude Artifacts',
        duration: '32:10',
        company: 'Anthropic Academy',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Designing interactive calculators, stateful charts, and single-page apps entirely inside Claude Artifacts.',
        completed: false,
        badge: 'UI Prototyping',
      },
      {
        id: 'claude-m-3',
        title: '03. Claude Projects & Automated Technical Documentation',
        duration: '27:45',
        company: 'Nextclasses.in Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Curate project knowledge docs, custom team instructions, and multi-file code review workflows.',
        completed: false,
        badge: 'Enterprise Claude',
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
        title: '01. Google AI Studio Walkthrough: System Prompts & Structured Outputs',
        duration: '46:32',
        company: 'Google Cloud Tech',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Deep dive into Google AI Studio UI, system instructions, temperature settings, and JSON schema constraints using @google/genai SDK.',
        completed: false,
        badge: 'Core Google AI Studio',
      },
      {
        id: 'gemini-vid-2',
        title: '02. Gemini 2.0 Flash Multimodal Video & Audio Parsing in Code',
        duration: '34:15',
        company: 'Google Cloud Tech',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Pass video files, audio snippets, and documents to Gemini 2.0 with low-latency streaming responses.',
        completed: false,
        badge: 'Multimodal AI • 1080p',
      },
      {
        id: 'gemini-vid-3',
        title: '03. Gemini Function Calling & Tool Declarations: Live Database Queries',
        duration: '31:20',
        company: 'NextClass Developer Wing',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Write TypeScript tool declarations and handle automated function dispatch for external REST APIs and database lookups.',
        completed: false,
        badge: 'Tool Calling • Verified',
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
        title: '01. Building Enterprise Custom GPTs with Actions & Knowledge Files',
        duration: '41:20',
        company: 'OpenAI (Official)',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Create domain-specific custom GPTs with schema-driven OpenAPI actions and retrieval-augmented generation.',
        completed: false,
        badge: 'Custom GPTs • Verified',
      },
      {
        id: 'openai-vid-2',
        title: '02. OpenAI o1 & o3-mini Reasoning Models: Complex Logic & Coding',
        duration: '35:45',
        company: 'Nextclasses.in Wing',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Benchmark thinking tokens, step-by-step mathematical reasoning, and automated code debugging using OpenAI reasoning series.',
        completed: false,
        badge: 'Frontier Reasoning',
      },
      {
        id: 'openai-vid-3',
        title: '03. Advanced Data Analysis (Python Sandbox) for Business Analytics',
        duration: '28:10',
        company: 'OpenAI Academy',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Upload raw Excel spreadsheets and CSV files; have ChatGPT execute Python scripts in sandbox to generate statistical charts and regressions.',
        completed: false,
        badge: 'Python Analytics',
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
        title: '01. DeepSeek R1 Architecture: Chain-of-Thought & Reasoning Tokens',
        duration: '45:10',
        company: 'DeepSeek Research',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'How DeepSeek R1 generates reinforcement-learning reasoning chains, open-source model deployment, and local Ollama setup.',
        completed: false,
        badge: 'DeepSeek Core',
      },
      {
        id: 'deepseek-vid-2',
        title: '02. Automated Excel Financial Models: DCF, Multiples & Sensitivity Tables',
        duration: '38:30',
        company: 'Financial Modeling Lab',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Pairing DeepSeek with Excel formulas, Power Query, and automated VBA macros to produce institutional-grade financial forecasts.',
        completed: false,
        badge: 'Excel Modeling • HD',
      },
      {
        id: 'deepseek-vid-3',
        title: '03. Running DeepSeek Locally with Ollama: 100% Private Offline AI',
        duration: '26:15',
        company: 'Open Source AI Wing',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Download 7B/14B/32B quantized GGUF weights on your local machine and process confidential business data with zero internet exposure.',
        completed: false,
        badge: 'Offline Privacy',
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
        title: '01. Cursor AI Setup: Multi-File Composer & Codebase Indexing',
        duration: '39:40',
        company: 'Cursor AI',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Master Cursor Cmd+K inline editing, Cmd+I Composer for multi-file generation, and codebase vector indexing.',
        completed: false,
        badge: 'Cursor Official • HD',
      },
      {
        id: 'cursor-vid-2',
        title: '02. Building a Production React & Tailwind App in 30 Minutes',
        duration: '42:15',
        company: 'NextClass Coding Studio',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'From blank workspace to full responsive web app: component architecture, mock data generators, and clean TypeScript types.',
        completed: false,
        badge: 'Full-Stack Build',
      },
      {
        id: 'cursor-vid-3',
        title: '03. Debugging Terminal Errors & Git Deployments with AI',
        duration: '28:50',
        company: 'DevOps & AI Wing',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Auto-fix build errors, package conflicts, and lint warnings; deploy production apps to Vercel and Cloud Run.',
        completed: false,
        badge: 'DevOps & Deploy',
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
        title: '01. Introduction to Agentic Workflows: ReAct, Reflection & Planning',
        duration: '44:20',
        company: 'LangChain & CrewAI',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Understand the difference between linear LLM prompting and autonomous agents with loop-based reasoning, memory, and tools.',
        completed: false,
        badge: 'Agent Architecture',
      },
      {
        id: 'agents-vid-2',
        title: '02. Building Multi-Agent Swarms with CrewAI & LangGraph',
        duration: '48:15',
        company: 'CrewAI Official',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Assign roles (Researcher, Writer, Fact-Checker, Senior Editor) and coordinate autonomous handoffs between agents.',
        completed: false,
        badge: 'Multi-Agent Swarms',
      },
      {
        id: 'agents-vid-3',
        title: '03. Equipping Agents with Web Search, Database Tools & Python Execution',
        duration: '36:10',
        company: 'Nextclasses.in Lab',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Integrate Tavily search, SQL database access, and secure sandboxed code execution tools with guardrails.',
        completed: false,
        badge: 'Tool Calling',
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
        title: '01. Building Low-Latency Voice AI with Vapi, ElevenLabs & LiveKit',
        duration: '41:10',
        company: 'Vapi & ElevenLabs',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Under 500ms voice-to-voice pipelines: Deepgram Speech-to-Text, LLM streaming, and ultra-natural ElevenLabs TTS voices.',
        completed: false,
        badge: 'Sub-500ms Voice',
      },
      {
        id: 'voice-vid-2',
        title: '02. Connecting AI Agents to Real Phone Numbers via Twilio SIP Trunks',
        duration: '35:30',
        company: 'Telephony Lab',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Acquiring phone numbers, routing inbound calls to an AI agent, and automating outbound appointment confirmations.',
        completed: false,
        badge: 'Twilio Integration',
      },
      {
        id: 'voice-vid-3',
        title: '03. Handling Interruptions, Call Transfers & CRM Calendar Booking',
        duration: '32:45',
        company: 'NextClass Voice Wing',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Configuring natural conversational barge-in, transferring calls to human agents, and booking Google Calendar slots live.',
        completed: false,
        badge: 'CRM Automation',
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

  'course-ai-automation': {
    courseTitle: 'AI Automation & Agents: n8n, Make & Autonomous Workflows',
    examCode: 'N8N-AUTOMATION',
    certificateTitle: 'Certified Enterprise AI Automation Engineer',
    videos: [
      {
        id: 'auto-vid-1',
        title: '01. Self-Hosting n8n & Connecting OpenAI/Gemini Nodes',
        duration: '37:50',
        company: 'n8n Community',
        youtubeId: 'RObvOx_z0oQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=RObvOx_z0oQ',
        description: 'Step-by-step installation of self-hosted n8n on Docker, securing API keys, and building your first AI chain node.',
        completed: false,
        badge: 'n8n Mastery',
      },
      {
        id: 'auto-vid-2',
        title: '02. Automated WhatsApp & Lead Nurturing AI Workflows',
        duration: '42:10',
        company: 'Automation Engineering Lab',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Receive incoming WhatsApp webhook messages, pass query to AI with company FAQ embeddings, and dispatch personalized answers.',
        completed: false,
        badge: 'WhatsApp AI',
      },
      {
        id: 'auto-vid-3',
        title: '03. End-to-End Invoice Processing & Google Sheets Auto-Sync',
        duration: '29:30',
        company: 'NextClass Automation',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Extract line items, GST totals, and vendor details from PDF attachments in Gmail; append records cleanly into Google Sheets.',
        completed: false,
        badge: 'Invoice Pipeline',
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
        title: '01. Cinematic AI Cinematography: Camera Directing in Runway Gen-3 & Sora',
        duration: '43:10',
        company: 'Runway & Cinema AI',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Controlling camera pans, tilt angles, drone zooms, shallow depth of field, and lighting prompts for photoreal video clips.',
        completed: false,
        badge: 'Cinematic AI',
      },
      {
        id: 'video-vid-2',
        title: '02. Character Consistency & AI Voice Cloning with ElevenLabs & HeyGen',
        duration: '38:40',
        company: 'HeyGen Studio',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Maintain identical face and costume characteristics across multiple scenes with realistic lip-syncing and multilingual dubbing.',
        completed: false,
        badge: 'Avatar & Voice',
      },
      {
        id: 'video-vid-3',
        title: '03. Assembling Viral Reels, Sound Effects & Final 4K Rendering in Premiere/CapCut',
        duration: '31:15',
        company: 'NextClass Creative Studio',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Upscale AI footage to 4K 60fps, generate cinematic foley sound effects, and add viral captions with maximum retention pacing.',
        completed: false,
        badge: 'Viral Editing',
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
        title: '01. Midjourney v6 Parameters: Aspect Ratios, Stylize & Style Reference (--sref)',
        duration: '36:20',
        company: 'Midjourney Creative Lab',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Using --sref codes for brand consistency, --cref for character preservation, and advanced lighting modifiers.',
        completed: false,
        badge: 'Midjourney v6 Master',
      },
      {
        id: 'mid-vid-2',
        title: '02. Ideogram 2.0 Typography: Perfect Text in AI Posters & Logos',
        duration: '31:45',
        company: 'Ideogram Designers',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Generate advertising posters, merchandise logos, and book covers with zero misspelled text or distorted typography.',
        completed: false,
        badge: 'Typography & Ads',
      },
      {
        id: 'mid-vid-3',
        title: '03. Vector Upscaling & Commercial Packaging Mockups',
        duration: '26:50',
        company: 'NextClass Design Studio',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Convert raster AI artwork into infinite resolution SVG vectors and place into 3D commercial product mockups.',
        completed: false,
        badge: 'Vector & Mockups',
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
        title: '01. Demystifying AI: How LLMs, Tokens & Neural Networks Actually Work',
        duration: '32:10',
        company: 'Nextclasses.in Academy',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Plain English walkthrough of generative AI with zero confusing jargon or heavy mathematics.',
        completed: false,
        badge: 'Zero to Hero',
      },
      {
        id: 'genai-b-2',
        title: '02. Everyday Productivity: Email Writing, Travel Planning & Document Summaries',
        duration: '28:40',
        company: 'Productivity Lab',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Save 2 hours every day by delegating routine drafts, grammar checks, calendar agendas, and spreadsheet calculations to AI.',
        completed: false,
        badge: 'Productivity',
      },
      {
        id: 'genai-b-3',
        title: '03. Safe AI Practices, Privacy & Spotting Deepfakes',
        duration: '22:15',
        company: 'Digital Safety Council',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Guidelines on protecting private personal info, data security, checking hallucinations, and recognizing deepfakes.',
        completed: false,
        badge: 'Safety & Ethics',
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

  'course-ai-teachers': {
    courseTitle: 'AI for Teachers & Educators: Lesson Plans, Question Papers & Class Magic',
    examCode: 'AI-TEACHER',
    certificateTitle: 'Certified Modern AI Educator & Curriculum Designer',
    videos: [
      {
        id: 'teach-vid-1',
        title: '01. 30-Second Lesson Plans Aligned to CBSE, ICSE & State Boards',
        duration: '35:20',
        company: 'NextClass Educator Wing',
        youtubeId: 'IHOJUJjZbzc',
        youtubeUrl: 'https://www.youtube.com/watch?v=IHOJUJjZbzc',
        description: 'Generate comprehensive 45-minute lesson plans with warm-up hooks, interactive board activities, and exit slips.',
        completed: false,
        badge: 'Curriculum Magic',
      },
      {
        id: 'teach-vid-2',
        title: '02. Generating Differentiated Worksheets & Bloom\'s Taxonomy Question Papers',
        duration: '31:15',
        company: 'Modern Teacher Lab',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Create multi-tier question papers (Easy, Moderate, HOTS) with complete marking keys and grading rubrics instantly.',
        completed: false,
        badge: 'Assessments',
      },
      {
        id: 'teach-vid-3',
        title: '03. Interactive Visual Classroom Slides & Storyboards in 60 Seconds',
        duration: '26:40',
        company: 'Classroom Tech Hub',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Turn curriculum textbook topics into illustrated visual presentations that capture students\' full attention.',
        completed: false,
        badge: 'Visual Slides',
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
        title: '01. Active Recall, Feynman Technique & 24/7 AI Personal Tutor',
        duration: '33:15',
        company: 'NextClass Academic Studio',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'How to use AI as an infinite-patience personal tutor that tests your comprehension without spoon-feeding answers.',
        completed: false,
        badge: 'Personal Tutor',
      },
      {
        id: 'stud-vid-2',
        title: '02. Converting Heavy PDF Textbooks into Flashcards & Mind Maps',
        duration: '29:40',
        company: 'Student Study Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Auto-generate Anki spaced repetition question decks and hierarchical bullet summaries from chapters in seconds.',
        completed: false,
        badge: 'Flashcards & Maps',
      },
      {
        id: 'stud-vid-3',
        title: '03. Step-by-Step Problem Solving for Math, Physics & Chemistry',
        duration: '31:20',
        company: 'NextClass STEM Wing',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Break down multi-step algebra, calculus, and stoichiometry questions into easy conceptual building blocks.',
        completed: false,
        badge: 'STEM Problem Solving',
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
        title: '01. Overcoming Hesitation, Mental Translation & Natural Cadence',
        duration: '38:15',
        company: 'BBC Learning English',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Stop translating from your native language in your head; learn chunking patterns and everyday conversational bridges.',
        completed: false,
        badge: 'BBC English • 1080p',
      },
      {
        id: 'eng-vid-2',
        title: '02. Professional Workplace English: Meetings, Small Talk & Presentations',
        duration: '34:50',
        company: 'Corporate English Lab',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: 'Master polite disagreement, handling tough Q&A sessions, status updates, and professional phone etiquette.',
        completed: false,
        badge: 'Workplace Fluency',
      },
      {
        id: 'eng-vid-3',
        title: '03. Daily Pronunciation Drills & Accent Neutralization Secrets',
        duration: '27:30',
        company: 'NextClass Language Wing',
        youtubeId: 'Wn_eS5dcVyc',
        youtubeUrl: 'https://www.youtube.com/watch?v=Wn_eS5dcVyc',
        description: 'Vowel length, consonant clusters, intonation rise and fall, and clear vocal enunciation without fake accents.',
        completed: false,
        badge: 'Pronunciation Lab',
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
        title: '01. French Phonetics: Nasal Vowels, Silent Letters & Liaisons',
        duration: '36:10',
        company: 'TV5MONDE & Easy French',
        youtubeId: 'ujDtm0hZyII',
        youtubeUrl: 'https://www.youtube.com/watch?v=ujDtm0hZyII',
        description: 'Master the distinct rhythm and mouth shapes of authentic French spoken communication.',
        completed: false,
        badge: 'Phonétique • HD',
      },
      {
        id: 'french-vid-2',
        title: '02. Daily Life French: Ordering at a Café, Asking Directions & Shopping',
        duration: '32:45',
        company: 'Alliance Française Prep',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Practical dialogues with native Parisian speakers, informal contractions, and essential everyday vocabulary.',
        completed: false,
        badge: 'Conversational A1-B1',
      },
      {
        id: 'french-vid-3',
        title: '03. Past, Present & Future Tenses: Passé Composé vs Imparfait Made Simple',
        duration: '29:20',
        company: 'NextClass French Wing',
        youtubeId: 'WFM2pvj00oc',
        youtubeUrl: 'https://www.youtube.com/watch?v=WFM2pvj00oc',
        description: 'Clear structural frameworks to narrate past memories, describe ongoing actions, and express future goals effortlessly.',
        completed: false,
        badge: 'Grammar Accelerator',
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
        title: '01. German Sentence Structure: Verb-Second (V2) Rule & Case System',
        duration: '39:20',
        company: 'Deutsche Welle DW Learn German',
        youtubeId: '4-rWPEqXy-M',
        youtubeUrl: 'https://www.youtube.com/watch?v=4-rWPEqXy-M',
        description: 'Understand der, die, das and master Nominativ, Akkusativ, and Dativ cases through visual color coding.',
        completed: false,
        badge: 'DW German • Official',
      },
      {
        id: 'ger-vid-2',
        title: '02. Living & Working in Germany: Train Stations, Doctors & Appointments',
        duration: '35:10',
        company: 'Goethe Institut Track',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Real-world dialogues for professionals, nurses, and students preparing for the German job market.',
        completed: false,
        badge: 'Work & Study in Germany',
      },
      {
        id: 'ger-vid-3',
        title: '03. Modal Verbs, Subordinate Clauses (weil, dass) & Natural Fluency',
        duration: '30:45',
        company: 'NextClass German Wing',
        youtubeId: 'eIho2S0ZahI',
        youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
        description: 'Learn how to form complex compound thoughts and speak fluidly without awkward hesitation.',
        completed: false,
        badge: 'B1-B2 Mastery',
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
        duration: '26:50',
        company: 'NextClass Speech Wing',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Overcome stage fright with physiological sighs; convert "um", "uh", and "like" into powerful silent pauses.',
        completed: false,
        badge: 'Stage Presence',
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
        title: '01. Biology High-Yield: NCERT Diagram Questions & Genetics Pedigree',
        duration: '45:30',
        company: 'NextClass Medical Faculty',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Target 360/360 in Biology: Decode line-by-line NCERT statements, trick options, assertion-reason drills, and Mendelian pedigree trees.',
        completed: false,
        badge: 'NEET Biology (360M)',
      },
      {
        id: 'neet-vid-2',
        title: '02. Chemistry Masterclass: Organic Reaction Mechanisms & Electrochemistry',
        duration: '42:15',
        company: 'NextClass Chemistry Wing',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Electrophilic addition, Named reactions (Cannizzaro, Aldol), Nernst equation shortcuts, and chemical bonding geometry.',
        completed: false,
        badge: 'NEET Chemistry (180M)',
      },
      {
        id: 'neet-vid-3',
        title: '03. Physics Speed Hacks: Dimensional Analysis, Optics & Current Electricity',
        duration: '39:50',
        company: 'NextClass Physics Lab',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Solve physics numericals in under 50 seconds using symmetry rules, Kirchhoff shortcuts, and lens formula approximations.',
        completed: false,
        badge: 'NEET Physics (180M)',
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
        title: '01. Advanced Mechanics: Rotational Dynamics & Conservation Laws',
        duration: '48:10',
        company: 'NextClass JEE Advanced Wing',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Master instantaneous axis of rotation, rolling without slipping, angular momentum conservation, and multi-concept JEE Advanced problems.',
        completed: false,
        badge: 'JEE Physics Mechanics',
      },
      {
        id: 'jee-vid-2',
        title: '02. Calculus & Coordinate Geometry: Conic Sections & Integration Hacks',
        duration: '44:30',
        company: 'NextClass Mathematics Council',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Definite integrals using King\'s Property, tangents to parabolas and ellipses, and parametric coordinates shortcuts.',
        completed: false,
        badge: 'JEE Mathematics',
      },
      {
        id: 'jee-vid-3',
        title: '03. Physical Chemistry: Thermodynamics & Chemical Equilibrium Rigor',
        duration: '40:25',
        company: 'NextClass Chemistry Wing',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'First & Second Laws, Carnot cycle PV diagrams, Le Chatelier shifts, and buffer solution pH calculations.',
        completed: false,
        badge: 'JEE Chemistry',
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
        title: '01. KEAM Speed Solving: 120 Questions in 150 Minutes Protocol',
        duration: '38:20',
        company: 'NextClass Kerala Wing',
        youtubeId: 'mG9R0vjZqj0',
        youtubeUrl: 'https://www.youtube.com/watch?v=mG9R0vjZqj0',
        description: 'Master fast option elimination, mental arithmetic, and time-budgeting for Kerala Engineering Architecture Medical (KEAM) CBT exams.',
        completed: false,
        badge: 'KEAM Speed Tactics',
      },
      {
        id: 'keam-vid-2',
        title: '02. KEAM Mathematics High-Yield: Matrices, Vectors & 3D Geometry',
        duration: '35:40',
        company: 'NextClass Math Lab',
        youtubeId: 'r5z_V-tLz4A',
        youtubeUrl: 'https://www.youtube.com/watch?v=r5z_V-tLz4A',
        description: 'Dot and cross product tricks, shortest distance between skew lines, and determinant expansion properties.',
        completed: false,
        badge: 'KEAM Mathematics',
      },
      {
        id: 'keam-vid-3',
        title: '03. KEAM Physics & Chemistry Formula Revision Sprint',
        duration: '31:10',
        company: 'NextClass Science Faculty',
        youtubeId: 'yk9lXobJ95E',
        youtubeUrl: 'https://www.youtube.com/watch?v=yk9lXobJ95E',
        description: 'Formula flashcards for electrostatics, modern physics, chemical kinetics, and p-block trends.',
        completed: false,
        badge: 'KEAM Revision Sprint',
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
  onOpenAdmin,
  initialCourseId = 'course-aissee-sainik-6',
  onOpenAdminDispatch,
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

  // Active curriculum based on selected course
  const currentCurriculum = COURSE_CURRICULUMS[selectedCourseId] || COURSE_CURRICULUMS['course-aissee-sainik'];
  const effectiveVideos = currentCurriculum.videos;
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

  const handlePortalLogin = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your Username/Email and Password.');
      return;
    }
    setIsLoggingIn(true);
    const res = loginWithCredentials(loginIdentifier.trim(), loginPassword.trim(), loginCourseId);
    setIsLoggingIn(false);
    if (!res.success) {
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

            {/* Admin Dispatch button if provided */}
            {onOpenAdminDispatch && (
              <button
                type="button"
                onClick={onOpenAdminDispatch}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#2d3d56] text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                title="Admin Dispatcher"
              >
                <Send className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">Admin Send</span>
              </button>
            )}

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
                  </div>
                )}
              </div>

              {/* Right Playlist */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Curriculum Masterclasses ({effectiveVideos.length})
                  </span>
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={onOpenAdmin}
                      className="text-[11px] font-bold text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  )}
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

      </div>
    </div>
  );
}
