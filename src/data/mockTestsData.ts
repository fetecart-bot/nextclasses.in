import { MockTest } from '../types';

export const MOCK_TESTS_DATA: MockTest[] = [
  {
    id: 'mock-neet-ug-sprint',
    title: 'NEET UG 2027: All-India Medical Entrance High-Yield Mock Sprint',
    examCode: 'NEET',
    category: 'competitive',
    durationMinutes: 15,
    totalMarks: 20,
    positiveMarks: 4,
    negativeMarks: 1,
    instructions: [
      '+4 marks for every correct answer, -1 mark deducted for every incorrect response (NTA pattern).',
      'Unattempted questions carry zero penalty.',
      'Timer will automatically auto-submit upon expiration.',
      'Instant percentile estimation and NCERT line-by-line solution analysis will be shown upon submission.'
    ],
    questions: [
      {
        id: 1,
        subject: 'Biology (Botany)',
        topic: 'Cell Cycle & Cell Division',
        questionText: 'During which phase of meiosis does crossing over between non-sister chromatids of homologous chromosomes take place?',
        options: [
          'Leptotene',
          'Zygotene',
          'Pachytene',
          'Diplotene'
        ],
        correctOptionIndex: 2,
        explanation: 'Crossing over occurs during the Pachytene stage of Prophase-I of Meiosis mediated by the enzyme recombinase (NCERT Biology Class 11, Chapter 10).',
        difficulty: 'Easy'
      },
      {
        id: 2,
        subject: 'Physics',
        topic: 'Current Electricity',
        questionText: 'A wire of resistance R is stretched uniformly so that its length increases by 10%. What is the approximate percentage increase in its resistance?',
        options: [
          '10%',
          '21%',
          '19%',
          '25%'
        ],
        correctOptionIndex: 1,
        explanation: 'Volume remains constant (V = A * L). If length becomes L\' = 1.1 L, area becomes A\' = A / 1.1. Since R = ρL/A, R\' = ρ(1.1 L)/(A/1.1) = 1.21 R. Percentage increase is (1.21 - 1) * 100 = 21%.',
        difficulty: 'Moderate'
      },
      {
        id: 3,
        subject: 'Chemistry',
        topic: 'Organic Chemistry: Reaction Mechanisms',
        questionText: 'Which of the following alkyl halides undergoes nucleophilic substitution via the SN1 mechanism most rapidly?',
        options: [
          'CH3-CH2-Cl',
          '(CH3)2CH-Cl',
          '(CH3)3C-Cl',
          'CH3-Cl'
        ],
        correctOptionIndex: 2,
        explanation: 'SN1 reaction rate depends directly on the stability of the carbocation intermediate. The tertiary carbocation (CH3)3C+ is stabilized by 9 hyperconjugative alpha-hydrogens, making (CH3)3C-Cl the most reactive via SN1.',
        difficulty: 'Easy'
      },
      {
        id: 4,
        subject: 'Biology (Zoology)',
        topic: 'Human Physiology: Excretion',
        questionText: 'Which hormone acts on the DCT and collecting duct of the nephron to stimulate the reabsorption of water and prevent diuresis?',
        options: [
          'Oxytocin',
          'Atrial Natriuretic Factor (ANF)',
          'Anti-Diuretic Hormone (Vasopressin)',
          'Prolactin'
        ],
        correctOptionIndex: 2,
        explanation: 'Anti-Diuretic Hormone (ADH) / Vasopressin, released from the posterior pituitary in response to high blood osmolarity, stimulates aquaporin water channels in DCT and collecting tubules, reducing water loss.',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'Physics',
        topic: 'Modern Physics: Photoelectric Effect',
        questionText: 'If the frequency of light incident on a photosensitive metal is doubled while keeping intensity constant, what happens to the maximum kinetic energy of the emitted photoelectrons?',
        options: [
          'Remains unchanged',
          'Doubles',
          'Increases by more than double',
          'Increases but remains less than double'
        ],
        correctOptionIndex: 2,
        explanation: 'From Einstein\'s photoelectric equation: KE_max = hν - Φ. When ν becomes 2ν, KE\'_max = 2hν - Φ = 2(hν - Φ) + Φ = 2(KE_max) + Φ. Since work function Φ > 0, the new maximum kinetic energy is strictly more than double the original value.',
        difficulty: 'Challenging'
      }
    ]
  },
  {
    id: 'mock-iit-jee-sprint',
    title: 'IIT JEE Main 2027: Physics, Math & Chemistry Speed Diagnostic',
    examCode: 'IIT_JEE',
    category: 'competitive',
    durationMinutes: 15,
    totalMarks: 20,
    positiveMarks: 4,
    negativeMarks: 1,
    instructions: [
      'JEE Main Computer Based Test (CBT) Interface.',
      '+4 for correct, -1 for incorrect attempt.',
      'Numerical accuracy and shortcut application are emphasized.'
    ],
    questions: [
      {
        id: 1,
        subject: 'Mathematics',
        topic: 'Calculus: Limits & Indeterminate Forms',
        questionText: 'Evaluate lim (x -> 0) of [ (sin x - x) / x^3 ]:',
        options: [
          '0',
          '-1/6',
          '1/6',
          '1/3'
        ],
        correctOptionIndex: 1,
        explanation: 'Using Taylor expansion: sin x = x - x^3/6 + x^5/120... Hence (sin x - x)/x^3 = (-x^3/6)/x^3 = -1/6. Or applying L\'Hôpital\'s rule three consecutive times gives -1/6.',
        difficulty: 'Moderate'
      },
      {
        id: 2,
        subject: 'Physics',
        topic: 'Rotational Dynamics',
        questionText: 'A solid sphere and a hollow sphere of identical masses and outer radii roll down an inclined plane without slipping from the same height. Which reaches the bottom first?',
        options: [
          'Hollow sphere',
          'Solid sphere',
          'Both reach simultaneously',
          'Depends on the coefficient of friction'
        ],
        correctOptionIndex: 1,
        explanation: 'Acceleration on an incline without slipping is a = g sinθ / (1 + I/(mR^2)). For solid sphere, I = 2/5 mR^2 (factor 0.4). For hollow sphere, I = 2/3 mR^2 (factor 0.67). The solid sphere has lower rotational inertia, giving higher translational acceleration, so it reaches first.',
        difficulty: 'Easy'
      },
      {
        id: 3,
        subject: 'Chemistry',
        topic: 'Chemical Bonding: Molecular Orbital Theory',
        questionText: 'According to Molecular Orbital Theory, which of the following diatomic species is paramagnetic with a bond order of 1.0?',
        options: [
          'C2',
          'B2',
          'N2',
          'O2^2-'
        ],
        correctOptionIndex: 1,
        explanation: 'B2 has 10 electrons. Electronic configuration: σ1s^2 σ*1s^2 σ2s^2 σ*2s^2 (π2px^1 = π2py^1). It contains 2 unpaired electrons in degenerate pi orbitals, making it paramagnetic, with bond order = (6 - 4)/2 = 1.0.',
        difficulty: 'Moderate'
      },
      {
        id: 4,
        subject: 'Mathematics',
        topic: 'Vectors & 3D Geometry',
        questionText: 'If vector a = 2i + j - k and vector b = i + 3k, what is the value of the dot product a · b?',
        options: [
          '-1',
          '1',
          '5',
          '-3'
        ],
        correctOptionIndex: 0,
        explanation: 'a · b = (2)(1) + (1)(0) + (-1)(3) = 2 + 0 - 3 = -1.',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'Physics',
        topic: 'Thermodynamics',
        questionText: 'A Carnot engine operates between temperatures 500 K and 300 K. What is its maximum theoretical thermal efficiency?',
        options: [
          '20%',
          '40%',
          '60%',
          '37.5%'
        ],
        correctOptionIndex: 1,
        explanation: 'Efficiency η = 1 - (T_cold / T_hot) = 1 - (300 / 500) = 1 - 0.60 = 0.40 or 40%.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'mock-google-ai-studio',
    title: 'Google AI Studio & Gemini API: Official Certification Readiness Test',
    examCode: 'AI_STUDIO',
    category: 'ai_platform',
    durationMinutes: 10,
    totalMarks: 20,
    positiveMarks: 4,
    negativeMarks: 0,
    instructions: [
      'Tests practical architecture with Google AI Studio, Gemini 2.0 Flash, Multimodal context, System Instructions & Function Calling.',
      'No negative marking for AI Platform skill evaluations.',
      'Passing score: 80% (16/20).'
    ],
    questions: [
      {
        id: 1,
        subject: 'Gemini Architecture',
        topic: 'SDK & Modern Library',
        questionText: 'In modern TypeScript / JavaScript with Google AI Studio and Gemini, which is the officially recommended, current Google Gen AI SDK?',
        options: [
          '@google/generative-ai (Legacy)',
          '@google/genai (Google Gen AI SDK)',
          'google-gemini-node-v1',
          '@tensorflow/gemini'
        ],
        correctOptionIndex: 1,
        explanation: 'The new unified, current SDK released by Google DeepMind is @google/genai, providing first-class TypeScript support for Gemini 2.0/2.5 models, multimodal inputs, live API, and structured JSON.',
        difficulty: 'Easy'
      },
      {
        id: 2,
        subject: 'Prompt Design & Schema',
        topic: 'Structured JSON Outputs',
        questionText: 'To guarantee that Gemini returns valid, parseable JSON conforming to a specific TypeScript schema without extra markdown backticks, which parameter configuration in Google AI Studio / SDK is used?',
        options: [
          'temperature: 0.0 with prompt text "Please do not use backticks"',
          'responseMimeType: "application/json" with responseSchema defined',
          'enableJsonMode: true in headers only',
          'maxOutputTokens: 256'
        ],
        correctOptionIndex: 1,
        explanation: 'Specifying responseMimeType: "application/json" along with a defined responseSchema (using Type.OBJECT / Type.ARRAY) forces the model to strictly adhere to that JSON schema at the decoding level.',
        difficulty: 'Moderate'
      },
      {
        id: 3,
        subject: 'Function Calling & Tools',
        topic: 'Tool Calling Execution Loop',
        questionText: 'When Gemini calls a declared tool / function during a multi-turn chat, what does the model return to your client server?',
        options: [
          'It executes the database query directly on Google servers',
          'A FunctionCall object containing the function name and structured arguments to be executed by your code',
          'An HTTP 200 response with raw HTML code',
          'A pre-computed answer without needing tool execution'
        ],
        correctOptionIndex: 1,
        explanation: 'Gemini outputs a FunctionCall object detailing which tool to call and with what arguments. Your application executes the function and returns the result as a FunctionResponse back to the model.',
        difficulty: 'Moderate'
      },
      {
        id: 4,
        subject: 'Context Window & Multimodal',
        topic: 'Gemini 2.0 Multimodal Capabilities',
        questionText: 'Which types of input modalities can be ingested directly into Google AI Studio and Gemini 2.0 Flash natively in a single prompt?',
        options: [
          'Text and raw JSON only',
          'Text, High-resolution Images, Audio recordings, and Video files',
          'Images only if converted to ASCII art',
          'Only text files smaller than 50 KB'
        ],
        correctOptionIndex: 1,
        explanation: 'Gemini was trained multimodally from the ground up and natively processes Text, Images, Audio, and Video files with context windows up to 1M+ tokens in Google AI Studio.',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'System Instructions',
        topic: 'System Prompts vs User Prompts',
        questionText: 'What is the primary architectural advantage of defining behavior in "System Instructions" rather than repeating it inside every user turn?',
        options: [
          'It costs 10x fewer tokens and disables all safety filters',
          'It establishes authoritative behavioral guardrails, tone, and constraints that persist across all turns and resist prompt injection',
          'It forces the model to only write in Python',
          'It is only accessible in paid enterprise accounts'
        ],
        correctOptionIndex: 1,
        explanation: 'System Instructions set the foundational persona and constraints for the model before any user turn begins, providing strong behavioral guardrails and consistent output formatting.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'mock-chatgpt-6-openai',
    title: 'ChatGPT (GPT-4o / o1 / GPT-6) & OpenAI Advanced Certification Sprint',
    examCode: 'CHATGPT',
    category: 'ai_platform',
    durationMinutes: 10,
    totalMarks: 20,
    positiveMarks: 4,
    negativeMarks: 0,
    instructions: [
      'Tests advanced prompt architecture, Custom GPT Actions, Python Sandboxing, Reasoning models (o1/o3-mini), and Canvas.',
      'Passing score: 80% (16/20).'
    ],
    questions: [
      {
        id: 1,
        subject: 'OpenAI Reasoning Models',
        topic: 'o1 & o3-mini Reasoning Tokens',
        questionText: 'How do OpenAI\'s reasoning models (like o1 and o3-mini) differ fundamentally from standard autoregressive models like GPT-4o?',
        options: [
          'They do not use neural networks at all',
          'They generate internal chain-of-thought "reasoning tokens" before outputting their final answer to deliberate through complex logic',
          'They only work with voice inputs',
          'They cannot write code or mathematics'
        ],
        correctOptionIndex: 1,
        explanation: 'OpenAI reasoning models spend time thinking before responding. They produce internal reasoning tokens where they break down complex multi-step problems, self-correct, and try alternative approaches before generating the final visible response.',
        difficulty: 'Moderate'
      },
      {
        id: 2,
        subject: 'Custom GPTs & Actions',
        topic: 'OpenAPI Specification & Endpoints',
        questionText: 'When building a Custom GPT that communicates with an external database or CRM, what standard format is required to configure the custom Actions?',
        options: [
          'GraphQL schema only',
          'OpenAPI (Swagger) 3.0+ JSON or YAML specification',
          'Plain English instructions without schema',
          'Windows Batch Script (.bat)'
        ],
        correctOptionIndex: 1,
        explanation: 'Custom GPT Actions require a valid OpenAPI 3.0 schema that defines available endpoints, HTTP methods (GET, POST), parameters, and authentication headers.',
        difficulty: 'Moderate'
      },
      {
        id: 3,
        subject: 'Advanced Data Analysis (Code Interpreter)',
        topic: 'Python Execution Sandbox',
        questionText: 'When ChatGPT Advanced Data Analysis processes a 500,000-row CSV file, how does it compute statistics and generate downloadable charts?',
        options: [
          'It predicts each calculation token-by-token without computation',
          'It executes real Python code (using pandas, numpy, and matplotlib) inside a sandboxed Linux runtime environment',
          'It forwards the file to a human data analyst',
          'It requires you to install Python on your local phone first'
        ],
        correctOptionIndex: 1,
        explanation: 'Advanced Data Analysis writes and executes actual Python code inside an isolated, stateless Linux container with popular data science libraries pre-installed, returning exact calculated numbers and generated charts.',
        difficulty: 'Easy'
      },
      {
        id: 4,
        subject: 'Zapier AI & Actions Integration',
        topic: 'No-Code Tool Calling',
        questionText: 'How does Zapier AI Actions empower ChatGPT to automate operations across 6,000+ business applications?',
        options: [
          'By providing pre-authenticated API triggers that ChatGPT can execute directly to send Slack messages, update Google Sheets, or trigger emails',
          'By replacing ChatGPT with a spreadsheet formula',
          'By running on physical floppy disks',
          'By restricting automation strictly to internal Zapier tables'
        ],
        correctOptionIndex: 0,
        explanation: 'Zapier AI Actions creates an action layer where ChatGPT can invoke pre-authenticated actions across any connected app in the user\'s Zapier workspace (e.g. Gmail, HubSpot, Trello, Google Calendar).',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'Canvas & Collaborative Writing',
        topic: 'Inline Targeted Edits',
        questionText: 'What is the key benefit of ChatGPT Canvas over standard conversational chat for coding and long-form documents?',
        options: [
          'It allows users to highlight specific code blocks or paragraphs for targeted in-place revisions without re-generating the entire output',
          'It turns ChatGPT into a 3D video game',
          'It permanently locks documents from further edits',
          'It eliminates the need for any prompts'
        ],
        correctOptionIndex: 0,
        explanation: 'Canvas provides a dedicated split-screen workspace where users can select specific sections, adjust reading level, adjust code comments, or make surgical line-by-line edits without rewriting the entire document from scratch.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'mock-aissee-sainik-class6',
    title: 'AISSEE 2027 Sainik School Class 6 All-India Entrance Mock Exam (300 Marks Sprint)',
    examCode: 'AISSEE-6',
    category: 'competitive',
    durationMinutes: 20,
    totalMarks: 25,
    positiveMarks: 5,
    negativeMarks: 0,
    instructions: [
      '+5 marks for every correct answer. ZERO negative marking (Official NTA AISSEE Class 6 Pattern).',
      'Class 6 (300 Marks total) curriculum coverage: 150M Maths, 50M Reasoning, 50M GK, 50M English.',
      'Sections: Mathematics & Arithmetic, Intelligence & Reasoning, General Knowledge, and English Comprehension.',
      'Instant score report and step-by-step solutions provided upon completion.'
    ],
    questions: [
      {
        id: 1,
        subject: 'Mathematics',
        topic: 'LCM & HCF Fundamental Theorem',
        questionText: 'The HCF of two numbers is 12 and their LCM is 72. If one of the numbers is 24, what is the other number?',
        options: [
          '36',
          '48',
          '18',
          '32'
        ],
        correctOptionIndex: 0,
        explanation: 'According to the theorem, Product of Numbers = LCM × HCF. 24 × Other Number = 72 × 12 = 864. Other Number = 864 ÷ 24 = 36.',
        difficulty: 'Easy'
      },
      {
        id: 2,
        subject: 'Mathematics',
        topic: 'Speed, Distance and Time',
        questionText: 'A train 150 meters long is running at a speed of 54 km/h. How many seconds will it take to pass a stationary telegraph post?',
        options: [
          '8 seconds',
          '10 seconds',
          '12 seconds',
          '15 seconds'
        ],
        correctOptionIndex: 1,
        explanation: 'Convert speed to m/s: 54 × (5/18) = 15 m/s. Time = Distance ÷ Speed = 150 m ÷ 15 m/s = 10 seconds.',
        difficulty: 'Moderate'
      },
      {
        id: 3,
        subject: 'Intelligence & Reasoning',
        topic: 'Number Sequences & Odd One Out',
        questionText: 'Find the odd one out among the given options: 27, 64, 125, 144.',
        options: [
          '27',
          '64',
          '125',
          '144'
        ],
        correctOptionIndex: 3,
        explanation: '27 (3³), 64 (4³), and 125 (5³) are all perfect cubes. 144 (12²) is a perfect square but not a perfect cube of an integer.',
        difficulty: 'Easy'
      },
      {
        id: 4,
        subject: 'General Knowledge',
        topic: 'Indian Armed Forces & Gallantry Awards',
        questionText: 'What is the highest wartime gallantry decoration in the Republic of India?',
        options: [
          'Maha Vir Chakra',
          'Param Vir Chakra',
          'Ashok Chakra',
          'Kirti Chakra'
        ],
        correctOptionIndex: 1,
        explanation: 'Param Vir Chakra (PVC) is India\'s highest military honour, awarded for displaying distinguished acts of valour during wartime.',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'Language & English',
        topic: 'Vocabulary & Synonyms',
        questionText: 'Choose the word which is nearest in meaning (synonym) to the word "COURAGEOUS":',
        options: [
          'Timid',
          'Valiant',
          'Hesitant',
          'Fearful'
        ],
        correctOptionIndex: 1,
        explanation: '"Courageous" means brave or possessing courage. "Valiant" is its direct synonym.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'mock-aissee-sainik-class9',
    title: 'AISSEE 2027 Sainik School Class 9 All-India Entrance Mock Exam (400 Marks Sprint)',
    examCode: 'AISSEE-9',
    category: 'competitive',
    durationMinutes: 20,
    totalMarks: 25,
    positiveMarks: 5,
    negativeMarks: 0,
    instructions: [
      '+5 marks for every correct answer. ZERO negative marking (Official NTA AISSEE Class 9 Pattern).',
      'Class 9 (400 Marks total) coverage: 200M NCERT Maths, 50M Science, 50M Social Studies, 50M Reasoning, 50M English.',
      'Advanced Class 8-9 syllabus questions with instant AI analysis upon completion.'
    ],
    questions: [
      {
        id: 1,
        subject: 'Advanced Mathematics',
        topic: 'Exponents & Powers',
        questionText: 'If 3^(x-1) = 81, what is the value of x?',
        options: [
          '3',
          '4',
          '5',
          '6'
        ],
        correctOptionIndex: 2,
        explanation: '81 can be expressed as 3⁴. So 3^(x-1) = 3⁴. Equating exponents: x - 1 = 4 => x = 5.',
        difficulty: 'Easy'
      },
      {
        id: 2,
        subject: 'General Science',
        topic: 'Metals & Non-Metals Reactivity',
        questionText: 'Which of the following metals is stored in kerosene due to its extreme reactivity with air and water?',
        options: [
          'Sodium',
          'Iron',
          'Copper',
          'Silver'
        ],
        correctOptionIndex: 0,
        explanation: 'Sodium (and Potassium) reacts vigorously with oxygen and moisture producing flammable hydrogen gas, so it is preserved safely in kerosene.',
        difficulty: 'Easy'
      },
      {
        id: 3,
        subject: 'Social Studies',
        topic: 'Indian Freedom Movement: Revolt of 1857',
        questionText: 'Who was declared the symbolic Emperor of India by the rebel sepoys during the Revolt of 1857?',
        options: [
          'Nana Saheb',
          'Bahadur Shah Zafar',
          'Tantia Tope',
          'Kunwar Singh'
        ],
        correctOptionIndex: 1,
        explanation: 'The rebel sepoys from Meerut reached the Red Fort in Delhi and proclaimed the last Mughal Emperor, Bahadur Shah Zafar, as Shahenshah-e-Hindustan.',
        difficulty: 'Easy'
      },
      {
        id: 4,
        subject: 'English Grammar',
        topic: 'Active and Passive Voice',
        questionText: 'Choose the correct passive form of: "The cadet completed the obstacle race."',
        options: [
          'The obstacle race was completed by the cadet.',
          'The obstacle race is completed by the cadet.',
          'The cadet had been completing the race.',
          'The obstacle race has been completed by cadet.'
        ],
        correctOptionIndex: 0,
        explanation: 'Simple past tense passive formula: Object + was/were + past participle (completed) + by + subject.',
        difficulty: 'Easy'
      },
      {
        id: 5,
        subject: 'Intelligence & Reasoning',
        topic: 'Analogy & Logical Relations',
        questionText: 'Complete the analogy: Cadet : Academy :: Sailor : ?',
        options: [
          'Barracks',
          'Naval Base / Ship',
          'Hangar',
          'Armoury'
        ],
        correctOptionIndex: 1,
        explanation: 'A cadet trains in an Academy, and a sailor serves aboard a Ship or Naval Base.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'mock-navodaya-jnvst-class6',
    title: 'Navodaya Vidyalaya (JNVST) 2027 Class 6 & 9 All-India Entrance Mock Exam',
    examCode: 'NAVODAYA',
    category: 'competitive',
    durationMinutes: 20,
    totalMarks: 25,
    positiveMarks: 5,
    negativeMarks: 0,
    instructions: [
      '+5 marks for every correct answer. No negative marking in JNVST.',
      'Sections: Mental Ability Test (MAT), Arithmetic Test, and Language Comprehension.',
      'Instant percentile estimation and detailed explanations upon completion.'
    ],
    questions: [
      {
        id: 1,
        subject: 'Mental Ability',
        topic: 'Figure Classification',
        questionText: 'Which letter of the English alphabet has only one line of vertical symmetry: A, B, C, D?',
        options: [
          'Letter A',
          'Letter B',
          'Letter C',
          'Letter D'
        ],
        correctOptionIndex: 0,
        explanation: 'Letter A has a vertical line of symmetry down its middle. Letters B, C, and D have horizontal lines of symmetry.',
        difficulty: 'Easy'
      },
      {
        id: 2,
        subject: 'Arithmetic',
        topic: '5-Digit Number Differences',
        questionText: 'What is the difference between the greatest and the smallest 5-digit numbers that can be formed using digits 0, 3, 6, 7 and 9 without repetition?',
        options: [
          '66,951',
          '67,000',
          '66,851',
          '67,951'
        ],
        correctOptionIndex: 0,
        explanation: 'Greatest number = 97630. Smallest 5-digit number (cannot start with 0) = 30679. Difference = 97630 - 30679 = 66,951.',
        difficulty: 'Moderate'
      }
    ]
  }
];
