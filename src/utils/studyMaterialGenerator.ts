import { Course } from '../types';

export interface StudyMaterialPack {
  courseId: string;
  courseTitle: string;
  targetExam: string;
  description: string;
  syllabusOverview: {
    section: string;
    weightage: string;
    keyTopics: string[];
  }[];
  formulaAndTips: string[];
  sampleQuestions: {
    id: number;
    subject: string;
    question: string;
    options: string[];
    correctOption: string;
    explanation: string;
  }[];
  weeklySchedule: {
    week: number;
    title: string;
    focus: string;
    deliverables: string;
  }[];
}

export const STUDY_MATERIALS_DATABASE: Record<string, StudyMaterialPack> = {
  'course-aissee-sainik-6': {
    courseId: 'course-aissee-sainik-6',
    courseTitle: 'AISSEE 2027: Class 6 Entrance Success Kit (Sainik School 300 Marks)',
    targetExam: 'AISSEE 2027 (Class 6 / Standard VI)',
    description: 'Specialized Class 6 blueprint: 125 Questions, 300 Marks. Heavyweight speed arithmetic (150 marks), non-verbal reasoning puzzles, English grammar, and Indian defence GK.',
    syllabusOverview: [
      {
        section: 'Section I: Class 6 Mathematics & Speed Arithmetic',
        weightage: '50 Questions / 150 Marks (50% of total score)',
        keyTopics: [
          'Natural Numbers, Roman Numerals & Place Value',
          'LCM & HCF with Speed Factorization Shortcuts',
          'Fractions, Decimals & Unitary Method Applications',
          'Percentages, Profit & Loss, Simple Interest',
          'Perimeter & Area of Rectangles, Squares, Triangles',
          'Speed, Distance, Time & Train/Bus Travel Problems',
        ],
      },
      {
        section: 'Section II: Class 6 Intelligence & Visual Reasoning',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Analogy (Verbal & Picture Analogy)',
          'Classification & Non-Verbal Odd One Out',
          'Pattern Series Completion & Mirror Images',
          'Embedded Figures & Paper Folding/Punching',
          'Alphabet Code Decoders & Direction Logic',
        ],
      },
      {
        section: 'Section III: Class 6 General Knowledge & Defence Awareness',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Indian Armed Forces commands, ranks & supreme commander',
          'Param Vir Chakra recipients & Indian Gallantry Awards',
          'Major Rivers, Mountains, Wildlife Sanctuaries & National Parks',
          'Human Body Organs, Nutrients & Common Diseases',
          'Indian Freedom Movement, National Symbols & Monuments',
        ],
      },
      {
        section: 'Section IV: Class 6 Language (English / Regional)',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Reading Comprehension Passages with Direct Answers',
          'Parts of Speech: Nouns, Pronouns, Verbs, Adjectives & Prepositions',
          'Synonyms, Antonyms, Gender & Plurals',
          'Spelling Corrections & Sentence Ordering',
        ],
      },
    ],
    formulaAndTips: [
      'Class 6 Exam Total is 300 Marks with ZERO NEGATIVE MARKING: Never leave any question unbubbled!',
      'Mathematics carries 150 out of 300 Marks (3 Marks per question!). Allocate 60 full minutes to Mathematics first.',
      'Speed Trick for LCM/HCF: Product of two numbers = LCM × HCF.',
      'Unitary Formula: Value of required items = (Value of given items / Quantity of given items) × Required Quantity.',
      'To convert speed from km/h to m/s, multiply by 5/18. To convert m/s to km/h, multiply by 18/5.',
      'OMR Bubbling Tip: Use blue/black ballpoint pen. Fill bubbles completely from center outward.',
    ],
    sampleQuestions: [
      {
        id: 1,
        subject: 'Mathematics (3 Marks)',
        question: 'The HCF of two numbers is 12 and their LCM is 72. If one of the numbers is 24, find the other number.',
        options: ['A) 36', 'B) 48', 'C) 18', 'D) 32'],
        correctOption: 'A) 36',
        explanation: 'Using fundamental rule: Product = LCM × HCF. 24 × Other = 72 × 12 = 864. Other = 864 / 24 = 36.',
      },
      {
        id: 2,
        subject: 'Mathematics (3 Marks)',
        question: 'A train 150 meters long is running at a speed of 54 km/h. How many seconds will it take to pass a stationary pole?',
        options: ['A) 8 seconds', 'B) 10 seconds', 'C) 12 seconds', 'D) 15 seconds'],
        correctOption: 'B) 10 seconds',
        explanation: 'Speed = 54 × (5/18) = 15 m/s. Time = Distance / Speed = 150 / 15 = 10 seconds.',
      },
      {
        id: 3,
        subject: 'Intelligence (2 Marks)',
        question: 'Find the odd one out among: 27, 64, 125, 144.',
        options: ['A) 27', 'B) 64', 'C) 125', 'D) 144'],
        correctOption: 'D) 144',
        explanation: '27 (3³), 64 (4³), 125 (5³) are cubes. 144 is 12² (square), not a cube.',
      },
      {
        id: 4,
        subject: 'General Knowledge (2 Marks)',
        question: 'What is the highest wartime gallantry decoration in India?',
        options: ['A) Maha Vir Chakra', 'B) Param Vir Chakra', 'C) Ashok Chakra', 'D) Kirti Chakra'],
        correctOption: 'B) Param Vir Chakra',
        explanation: 'Param Vir Chakra is India highest military decoration awarded for valor in the presence of enemy.',
      },
    ],
    weeklySchedule: [
      { week: 1, title: 'Week 1: Arithmetic Warmup', focus: 'Number Systems & Vedic LCM/HCF', deliverables: 'Class 6 Study Pack PDF + 50 Practice MCQs' },
      { week: 2, title: 'Week 2: Visual Intelligence', focus: 'Pattern Series & Mirror Images', deliverables: 'Class 6 Non-Verbal Flashcards' },
      { week: 3, title: 'Week 3: Defence GK & Science', focus: 'Gallantry Awards & Human Anatomy', deliverables: 'Illustrated GK Fact Vault' },
      { week: 4, title: 'Week 4: Class 6 Full Mock', focus: '300-Mark OMR Speed Simulation', deliverables: 'Full OMR Sheet + AI Score Analysis' },
    ],
  },
  'course-aissee-sainik-9': {
    courseId: 'course-aissee-sainik-9',
    courseTitle: 'AISSEE 2027: Class 9 Entrance Advanced Sprint (Sainik School 400 Marks)',
    targetExam: 'AISSEE 2027 (Class 9 / Standard IX)',
    description: 'Advanced Class 9 blueprint: 150 Questions, 400 Marks. High-yield NCERT Class 8 Mathematics (200 marks), General Science (50 marks), Social Studies (50 marks), English & Reasoning.',
    syllabusOverview: [
      {
        section: 'Section I: Class 9 Advanced Mathematics',
        weightage: '50 Questions / 200 Marks (4 Marks each!)',
        keyTopics: [
          'Linear Equations in One Variable & Algebraic Expressions',
          'Standard Identities: (a+b)², (a-b)², a²-b²',
          'Squares & Square Roots, Cubes & Cube Roots',
          'Exponents, Powers & Scientific Notation',
          'Mensuration: Surface Area & Volume of Cube, Cuboid, Cylinder',
          'Direct & Inverse Proportions, Compound Interest',
        ],
      },
      {
        section: 'Section II: Class 9 General Science',
        weightage: '25 Questions / 50 Marks (Physics, Chemistry, Biology)',
        keyTopics: [
          'Physics: Force, Friction, Sound, Chemical Effects of Current, Light & Reflections',
          'Chemistry: Synthetic Fibres, Metals & Non-Metals, Combustion & Flame, Petroleum',
          'Biology: Crop Production, Microorganisms, Cell Structure & Functions, Reproduction in Animals',
        ],
      },
      {
        section: 'Section III: Class 9 Social Studies',
        weightage: '25 Questions / 50 Marks (History, Civics, Geography)',
        keyTopics: [
          'History: Revolt of 1857, Indian National Movement, Colonialism & Tribal Societies',
          'Civics: The Indian Constitution, Secularism, Judiciary & Parliament',
          'Geography: Resources, Land, Soil, Water, Agriculture & Industries',
        ],
      },
      {
        section: 'Section IV: Class 9 Intelligence & Reasoning',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Coding-Decoding, Blood Relations & Direction Sense',
          'Venn Diagrams, Syllogisms & Logical Sequences',
          'Mathematical Operations & Number Matrix Puzzles',
        ],
      },
      {
        section: 'Section V: Class 9 English Grammar & Composition',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Active & Passive Voice, Direct & Indirect Speech',
          'Tenses, Subject-Verb Agreement, Prepositions & Conjunctions',
          'Idioms, Phrases, Synonyms, Antonyms & Reading Passages',
        ],
      },
    ],
    formulaAndTips: [
      'Class 9 Exam Total is 400 Marks with ZERO NEGATIVE MARKING: Bubble every question on the OMR sheet!',
      'Class 9 Mathematics carries 200 Marks (50 Questions × 4 Marks each). This is 50% of your total admission merit!',
      'Mensuration Shortcuts: Cylinder Total Surface Area = 2πr(r+h), Volume = πr²h.',
      'Compound Interest: A = P(1 + r/100)ⁿ, CI = A - P.',
      'Science Tip: Learn NCERT Class 8 summary boxes — over 70% of science questions directly mirror these statements.',
      'Social Studies Tip: Memorize the sequence of 1857 leaders (Mangal Pandey, Rani Lakshmibai, Kunwar Singh).',
    ],
    sampleQuestions: [
      {
        id: 1,
        subject: 'Mathematics (4 Marks)',
        question: 'If 3^(x-1) = 81, what is the value of x?',
        options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
        correctOption: 'C) 5',
        explanation: '81 = 3⁴. So 3^(x-1) = 3⁴. Equating exponents: x - 1 = 4 => x = 5.',
      },
      {
        id: 2,
        subject: 'General Science (2 Marks)',
        question: 'Which of the following metals is stored in kerosene due to its extreme reactivity with air and water?',
        options: ['A) Sodium', 'B) Iron', 'C) Copper', 'D) Silver'],
        correctOption: 'A) Sodium',
        explanation: 'Sodium (and Potassium) reacts violently with moisture and oxygen producing hydrogen gas and catching fire, hence preserved under kerosene.',
      },
      {
        id: 3,
        subject: 'Social Studies (2 Marks)',
        question: 'Who was declared the symbolic Emperor of India by the sepoys during the Revolt of 1857?',
        options: ['A) Nana Saheb', 'B) Bahadur Shah Zafar', 'C) Tantia Tope', 'D) Kunwar Singh'],
        correctOption: 'B) Bahadur Shah Zafar',
        explanation: 'Sepoys marched from Meerut to Delhi and declared Mughal Emperor Bahadur Shah Zafar as the leader of the uprising.',
      },
      {
        id: 4,
        subject: 'English (2 Marks)',
        question: 'Convert to Passive Voice: "The cadet completed the obstacle race."',
        options: [
          'A) The obstacle race was completed by the cadet.',
          'B) The obstacle race is completed by the cadet.',
          'C) The cadet was completing the race.',
          'D) Completed was the race by cadet.'
        ],
        correctOption: 'A) The obstacle race was completed by the cadet.',
        explanation: 'Simple past passive voice formula: Object + was/were + past participle (completed) + by + Subject.',
      },
    ],
    weeklySchedule: [
      { week: 1, title: 'Week 1: Class 9 Algebra & Equations', focus: 'Linear Equations & Exponents', deliverables: 'Class 9 Math Vault + 60 Problem Sets' },
      { week: 2, title: 'Week 2: Physics & Chemistry Core', focus: 'Force, Light & Metals/Non-Metals', deliverables: 'NCERT Science Drill Notes' },
      { week: 3, title: 'Week 3: 1857 Revolt & Indian Constitution', focus: 'Freedom Movement & Fundamental Rights', deliverables: 'Social Studies Quick Maps & Timelines' },
      { week: 4, title: 'Week 4: Full 400-Mark CBT Mock Test', focus: 'Complete 150-minute Speed Exam', deliverables: 'Instant AI Scorecard + Ranking Analysis' },
    ],
  },
  'course-aissee-sainik': {
    courseId: 'course-aissee-sainik',
    courseTitle: 'AISSEE (All India Sainik School Entrance Exam) 2027: Class 6 & 9 Complete Success Kit',
    targetExam: 'AISSEE 2027 (Class 6 & Class 9)',
    description: 'Comprehensive study blueprint, high-yield speed mental math, non-verbal intelligence puzzles, GK trivia, and official OMR practice sheet with solutions.',
    syllabusOverview: [
      {
        section: 'Section I: Mathematics & Mental Arithmetic',
        weightage: '50 Questions / 150 Marks (Class 6) • 50 Questions / 200 Marks (Class 9)',
        keyTopics: [
          'Number Systems, Roman Numerals & Place Value',
          'LCM & HCF with Speed Factorization Shortcuts',
          'Fractions, Decimals & Unitary Method Applications',
          'Percentages, Profit & Loss, Simple Interest',
          'Perimeter, Area & Volume (Triangles, Rectangles, Cuboids)',
          'Speed, Distance, Time & Train Problems',
        ],
      },
      {
        section: 'Section II: Intelligence & Reasoning',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Analogy (Verbal & Mathematical)',
          'Classification & Odd One Out',
          'Pattern Series Completion & Number Sequences',
          'Embedded Figures & Mirror Images',
          'Direction Sense & Family Relationship Logic',
        ],
      },
      {
        section: 'Section III: General Knowledge & Defence Trivia',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Indian Armed Forces (Army, Navy, Air Force) structure & ranks',
          'National Symbols, Gallantry Awards (Param Vir Chakra, etc.)',
          'Indian Geography: Rivers, Mountains, States & Capitals',
          'Basic Science & Human Body Organs',
          'Historical Monuments, Freedom Movement & Leaders',
        ],
      },
      {
        section: 'Section IV: Language (English / Regional)',
        weightage: '25 Questions / 50 Marks',
        keyTopics: [
          'Reading Comprehension Passages',
          'Nouns, Pronouns, Verbs, Adjectives & Prepositions',
          'Synonyms, Antonyms & One-Word Substitutions',
          'Spelling Corrections & Sentence Rearrangement',
        ],
      },
    ],
    formulaAndTips: [
      'Sainik School Exam has ZERO NEGATIVE MARKING: Never leave any question blank on the OMR sheet!',
      'Mathematics carries 50% of the total marks in Class 6 (150 out of 300 marks). Allocate the first 60 minutes exclusively to Mathematics.',
      'Speed Trick for LCM/HCF: Product of two numbers = LCM × HCF. Use this formula for 2-3 guaranteed direct questions.',
      'Unitary Method Formula: Value of many items = (Value of 1 item) × Number of items.',
      'Speed = Distance / Time. To convert km/h to m/s, multiply by 5/18. To convert m/s to km/h, multiply by 18/5.',
      'OMR Bubbling Tip: Darken the circle completely using a blue or black ballpoint pen. Do not make stray marks.',
    ],
    sampleQuestions: [
      {
        id: 1,
        subject: 'Mathematics',
        question: 'The HCF of two numbers is 12 and their LCM is 72. If one of the numbers is 24, find the other number.',
        options: ['A) 36', 'B) 48', 'C) 18', 'D) 32'],
        correctOption: 'A) 36',
        explanation: 'Using the fundamental theorem: Product of two numbers = LCM × HCF. First Number × Second Number = 72 × 12. 24 × Second Number = 864. Second Number = 864 / 24 = 36.',
      },
      {
        id: 2,
        subject: 'Mathematics',
        question: 'A train 150 meters long is running at a speed of 54 km/h. How many seconds will it take to pass a stationary telegraph post?',
        options: ['A) 8 seconds', 'B) 10 seconds', 'C) 12 seconds', 'D) 15 seconds'],
        correctOption: 'B) 10 seconds',
        explanation: 'First convert speed to m/s: 54 × (5/18) = 15 m/s. Time to pass the post = Length of train / Speed = 150 / 15 = 10 seconds.',
      },
      {
        id: 3,
        subject: 'Intelligence',
        question: 'Find the odd one out among the given options: 27, 64, 125, 144.',
        options: ['A) 27', 'B) 64', 'C) 125', 'D) 144'],
        correctOption: 'D) 144',
        explanation: '27 = 3³, 64 = 4³, 125 = 5³ are all perfect cubes. 144 = 12² is a perfect square, but not a perfect cube of an integer. Therefore, 144 is the odd one out.',
      },
      {
        id: 4,
        subject: 'General Knowledge',
        question: 'What is the highest wartime gallantry decoration awarded in the Republic of India?',
        options: ['A) Maha Vir Chakra', 'B) Param Vir Chakra', 'C) Ashok Chakra', 'D) Kirti Chakra'],
        correctOption: 'B) Param Vir Chakra',
        explanation: 'The Param Vir Chakra (PVC) is India\'s highest military decoration awarded for distinguished acts of valour during wartime.',
      },
      {
        id: 5,
        subject: 'English',
        question: 'Choose the correct synonym of the word "COURAGEOUS":',
        options: ['A) Timid', 'B) Fearful', 'C) Valiant', 'D) Hesitant'],
        correctOption: 'C) Valiant',
        explanation: 'Courageous means having courage or brave. "Valiant" means possessing or showing courage or determination.',
      },
    ],
    weeklySchedule: [
      {
        week: 1,
        title: 'Week 1: Mathematics Speed Arithmetic & Basic Geometry',
        focus: 'Number Systems, LCM/HCF, Prime Factorization, Fractions & Vedic Mental Math tricks.',
        deliverables: 'PDF Notes, 100 Questions Practice Sheet, Weekly Diagnostic Mock 01.',
      },
      {
        week: 2,
        title: 'Week 2: Visual Reasoning & Pattern Completion Mastery',
        focus: 'Non-verbal puzzles, mirror images, analogies, classification & number series.',
        deliverables: 'Visual Reasoning Workbook, 150 Practice Puzzles, Video Walkthroughs.',
      },
      {
        week: 3,
        title: 'Week 3: General Knowledge & Defence Forces Trivia',
        focus: 'Armed forces hierarchy, awards, Indian geography, national monuments & basic science.',
        deliverables: 'Colourful Illustrated Mind Maps, 200 Question Flashcard Pack.',
      },
      {
        week: 4,
        title: 'Week 4: Language Proficiency & Full-Length AISSEE OMR Mock',
        focus: 'Reading comprehension passages, grammar rules, spelling corrections & full 300-mark OMR simulation.',
        deliverables: 'Full-size Printable OMR Sheet, Answer Key with Step-by-Step Solutions.',
      },
    ],
  },
  'course-navodaya-jnvst': {
    courseId: 'course-navodaya-jnvst',
    courseTitle: 'Navodaya Vidyalaya (JNVST Class 6 & 9) 2027 Rapid Mastery Kit',
    targetExam: 'JNVST 2027 (Class 6 & Class 9)',
    description: 'Mental Ability (50% marks), Arithmetic (25%), and Language (25%) complete high-yield preparation pack with previous 10 years solved papers.',
    syllabusOverview: [
      {
        section: 'Section I: Mental Ability Test (MAT)',
        weightage: '40 Questions / 50 Marks (50% of Total Score)',
        keyTopics: [
          'Odd-One-Out & Figure Matching',
          'Pattern Completion & Figure Series',
          'Analogy & Geometrical Figure Completion (Triangle, Square, Circle)',
          'Mirror Imaging & Punched Hold Pattern (Folding/Unfolding)',
          'Space Visualization & Embedded Figures',
        ],
      },
      {
        section: 'Section II: Arithmetic Test',
        weightage: '20 Questions / 25 Marks',
        keyTopics: [
          'Number and Numeric System',
          'Four Fundamental Operations on Whole Numbers',
          'Fractional Numbers & Four Fundamental Operations',
          'Factors and Multiples including their properties',
          'LCM and HCF of Numbers',
          'Decimals and Fundamental Operations',
        ],
      },
      {
        section: 'Section III: Language Test',
        weightage: '20 Questions / 25 Marks',
        keyTopics: [
          'Reading Comprehension: 4 Unseen Passages',
          'Vocabulary in context (Synonyms/Antonyms)',
          'Grammatical accuracy & sentence structure',
        ],
      },
    ],
    formulaAndTips: [
      'Mental Ability carries 50% of the marks in JNVST. Practice 30 non-verbal figures daily.',
      'Speed in arithmetic comes from memorizing tables up to 25 and squares up to 30.',
      'There is NO negative marking in JNVST. Attempt all 80 questions on the OMR sheet.',
    ],
    sampleQuestions: [
      {
        id: 1,
        subject: 'Arithmetic',
        question: 'What is the difference between the greatest and the smallest 5-digit numbers formed using digits 0, 3, 6, 7 and 9 without repetition?',
        options: ['A) 66,951', 'B) 67,000', 'C) 66,851', 'D) 67,951'],
        correctOption: 'A) 66,951',
        explanation: 'Greatest 5-digit number = 97630. Smallest 5-digit number (cannot start with 0) = 30679. Difference = 97630 - 30679 = 66,951.',
      },
    ],
    weeklySchedule: [
      {
        week: 1,
        title: 'Week 1: JNVST Mental Ability Non-Verbal Drills',
        focus: 'Figure matching, odd-one-out, and pattern completion.',
        deliverables: 'MAT 100 Figure Workbook, Arithmetic Fundamentals Sheet.',
      },
    ],
  },
  'course-claude-ai': {
    courseId: 'course-claude-ai',
    courseTitle: 'Master Claude AI & Advanced Prompt Engineering 2026',
    targetExam: 'Professional AI Certification',
    description: 'Anthropic Claude 3.7 Sonnet, Artifacts, full-stack app scaffolding, and multi-lingual prompt engineering cookbook.',
    syllabusOverview: [
      {
        section: 'Module 1: Anthropic Claude Architecture & 3.7 Sonnet',
        weightage: 'Hands-on Coding & System Prompts',
        keyTopics: [
          'Context Windows (200K tokens) & Needle in a Haystack Retrieval',
          'Claude Artifacts: Live React, SVG, HTML & Markdown Preview Rendering',
          'Role-based System Instructions & Guardrailing',
        ],
      },
    ],
    formulaAndTips: [
      'Always structure complex Claude prompts with XML tags like <context>, <instructions>, and <output_format>.',
      'Give Claude positive examples (Few-Shot Prompting) to reduce hallucination rate to under 0.1%.',
    ],
    sampleQuestions: [
      {
        id: 1,
        subject: 'Prompt Engineering',
        question: 'Which tag convention is officially recommended by Anthropic for Claude system prompt structuring?',
        options: ['A) JSON-only', 'B) XML tags like <system> and <context>', 'C) YAML frontmatter', 'D) Markdown bold headers'],
        correctOption: 'B) XML tags like <system> and <context>',
        explanation: 'Anthropic Claude is specifically fine-tuned to parse and adhere to XML tagged instructions with high fidelity.',
      },
    ],
    weeklySchedule: [
      {
        week: 1,
        title: 'Week 1: Claude 3.7 Foundations & System Prompt Architecture',
        focus: 'Context window mechanics, XML schemas, and role prompt engineering.',
        deliverables: 'Prompt Cookbook PDF, 50 Tested System Instructions.',
      },
    ],
  },
};

/**
 * Generates an attractive, standalone, printable HTML document representing the official study package.
 * This can be opened, printed, or saved as PDF in any browser with 1-click.
 */
export function generatePrintableStudyMaterialHtml(courseId: string, studentName = 'NextClass Student'): string {
  const pack = STUDY_MATERIALS_DATABASE[courseId] || STUDY_MATERIALS_DATABASE['course-aissee-sainik'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pack.courseTitle} - Official Study Package</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1a202c;
      background: #f7fafc;
      line-height: 1.6;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 3px solid #dd6b20;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 800;
      color: #c05621;
      margin: 0;
    }
    .logo-sub {
      font-size: 13px;
      color: #718096;
      margin-top: 4px;
    }
    .badge {
      background: #feebc8;
      color: #7b341e;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 22px;
      color: #1a202c;
      margin-top: 0;
    }
    h2 {
      font-size: 17px;
      color: #c05621;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 8px;
      margin-top: 25px;
    }
    .student-badge {
      background: #ebf8ff;
      border: 1px solid #bee3f8;
      padding: 12px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .topic-box {
      background: #f7fafc;
      border-left: 4px solid #dd6b20;
      padding: 12px 16px;
      margin-bottom: 14px;
      border-radius: 0 8px 8px 0;
    }
    .topic-title {
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 4px;
    }
    .question-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .question-title {
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 8px;
    }
    .option-item {
      padding: 4px 0;
      color: #4a5568;
    }
    .explanation {
      background: #f0fff4;
      border-left: 3px solid #38a169;
      padding: 8px 12px;
      margin-top: 10px;
      font-size: 13px;
      color: #22543d;
    }
    .btn-print {
      background: #dd6b20;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn-print:hover {
      background: #c05621;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #a0aec0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div>
        <div class="logo-title">NEXTCLASSES.IN ACADEMY</div>
        <div class="logo-sub">Automated Academic Excellence & Competitive Exam Prep</div>
      </div>
      <div class="badge">Official Study Material Pack</div>
    </div>

    <div class="student-badge">
      <div>
        <strong>Enrolled Student:</strong> ${studentName}<br>
        <strong>Target Examination:</strong> ${pack.targetExam}
      </div>
      <div style="text-align: right;">
        <strong>Academic Session:</strong> 2026–2027<br>
        <strong>Official Helpline:</strong> +91 82816 44058
      </div>
    </div>

    <h1>${pack.courseTitle}</h1>
    <p style="color: #4a5568; font-size: 14px;">${pack.description}</p>

    <h2>1. High-Yield Exam Syllabus Breakdown & Weightage</h2>
    ${pack.syllabusOverview
      .map(
        (sec) => `
      <div class="topic-box">
        <div class="topic-title">${sec.section}</div>
        <div style="font-size: 13px; color: #718096; margin-bottom: 6px;">Weightage: <strong>${sec.weightage}</strong></div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4a5568;">
          ${sec.keyTopics.map((t) => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    `
      )
      .join('')}

    <h2>2. Golden Rules & Speed Formulas</h2>
    <ul style="padding-left: 20px; font-size: 13.5px; color: #2d3748;">
      ${pack.formulaAndTips.map((tip) => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
    </ul>

    <div class="page-break"></div>

    <h2>3. High-Yield Practice Questions & Detailed Step-by-Step Solutions</h2>
    ${pack.sampleQuestions
      .map(
        (q, idx) => `
      <div class="question-card">
        <div class="question-title">Question ${idx + 1} (${q.subject}):</div>
        <p style="margin: 0 0 10px 0; font-size: 14px;">${q.question}</p>
        <div style="margin-bottom: 8px;">
          ${q.options.map((opt) => `<div class="option-item">${opt}</div>`).join('')}
        </div>
        <div class="explanation">
          <strong>Correct Answer: ${q.correctOption}</strong><br>
          <em>Solution Explanation:</em> ${q.explanation}
        </div>
      </div>
    `
      )
      .join('')}

    <h2>4. Weekly Study Delivery & Mock Test Schedule</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
      <thead>
        <tr style="background: #edf2f7; text-align: left;">
          <th style="padding: 8px; border: 1px solid #e2e8f0;">Week</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0;">Module Title</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0;">Focus Topics</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0;">Included Materials</th>
        </tr>
      </thead>
      <tbody>
        ${pack.weeklySchedule
          .map(
            (w) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Week ${w.week}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${w.title}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${w.focus}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #c05621;">${w.deliverables}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      Nextclasses.in Academic Council • 24/7 Academic Support on WhatsApp: +91 82816 44058 • https://www.nextclasses.in<br>
      © 2026–2027 Nextclasses.in. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a browser download of the complete study package as an HTML/PDF printable document.
 */
export function downloadStudyMaterialFile(courseId: string, studentName = 'Student'): void {
  const htmlContent = generatePrintableStudyMaterialHtml(courseId, studentName);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const pack = STUDY_MATERIALS_DATABASE[courseId] || STUDY_MATERIALS_DATABASE['course-aissee-sainik'];
  const cleanTitle = pack.targetExam.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `NextClass_${cleanTitle}_Study_Pack.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats a clean, professional WhatsApp study pack dispatch message ready to send to a student or parent.
 */
export function generateWhatsAppDispatchMessage(
  studentName: string,
  courseId: string,
  studentPhone: string,
  credentials?: { username?: string; password?: string },
  standardChoice?: 'class-6' | 'class-9' | string
): string {
  const effectiveId = (courseId === 'course-aissee-sainik' && standardChoice)
    ? (standardChoice === 'class-9' ? 'course-aissee-sainik-9' : 'course-aissee-sainik-6')
    : courseId;

  const pack = STUDY_MATERIALS_DATABASE[effectiveId] || STUDY_MATERIALS_DATABASE['course-aissee-sainik-6'] || STUDY_MATERIALS_DATABASE['course-aissee-sainik'];

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://www.nextclasses.in';
  const portalUrl = `${origin}/?portal=true`;

  const isClass6 = effectiveId.includes('-6') || standardChoice === 'class-6';
  const isClass9 = effectiveId.includes('-9') || standardChoice === 'class-9';

  let syllabusBullets = `• Complete Class 6 & 9 Blueprint & Syllabus Breakdown\n• Speed Arithmetic, Non-Verbal Intelligence & GK Question Bank\n• Official 300/400-Mark OMR Practice Sheet & Solutions`;
  if (isClass6) {
    syllabusBullets = `• Complete Class 6 Blueprint & 300-Mark Official Syllabus (Maths 150 M, Reason 50 M, GK 50 M, Lang 50 M)\n• Speed Vedic Arithmetic, Non-Verbal Picture Puzzles & Defence GK\n• Official 300-Mark Sainik OMR Practice Sheet & Answer Solutions`;
  } else if (isClass9) {
    syllabusBullets = `• Complete Class 9 Advanced Blueprint & 400-Mark Official Syllabus (Maths 200 M, Science 50 M, SS 50 M, Reason 50 M, Eng 50 M)\n• High-Weightage NCERT Mathematics Formulas & Science Practice Bank\n• Full-Length 400-Mark Sunday CBT Mock Test with Instant AI Scorecard`;
  }

  const standardLine = isClass6 ? '• Standard: *Class 6 (Std VI) - 300 Marks Track*\n' : (isClass9 ? '• Standard: *Class 9 (Std IX) - 400 Marks Track*\n' : '');

  const credsBlock = credentials?.username
    ? `🔐 *Your Student Portal Login Credentials:*\n` +
      standardLine +
      `• Username: *${credentials.username}*\n` +
      `• Password: *${credentials.password || '••••••••'}*\n` +
      `• Portal Login Link: ${portalUrl}\n\n`
    : '';

  return `🎓 *Nextclasses.in Academy • Official Study Material Pack* 📦\n\n` +
    `Hello *${studentName || 'Student'}*! Welcome to Nextclasses.in.\n\n` +
    `✅ *Your enrollment in:* *${pack.courseTitle}* is verified & active!\n\n` +
    credsBlock +
    `📚 *Study Material Access:* \n` +
    syllabusBullets + `\n` +
    `• Interactive CBT Online Mock Test Simulator\n\n` +
    `👉 *Open Student Learning Portal:* ${portalUrl}\n` +
    `👉 *Direct Study Pack Download:* ${portalUrl}&course=${encodeURIComponent(effectiveId)}\n\n` +
    `💬 *Official Academic Helpline:* +91 82816 44058\n\n` +
    `_Best wishes for your exam preparation from Nextclasses.in!_`;
}
