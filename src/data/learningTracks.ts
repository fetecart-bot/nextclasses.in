import type { Course, CurriculumModule } from '../types';

export const LEARNING_TRACKS = [
  {id:'maths-foundations',title:'Maths Foundations',audience:'CBSE Classes 5–8',access:'Included in the existing tuition plan',topics:['Division, fractions and decimals','Percentages and everyday word problems','Basic algebra and progress checks'],courseId:'course-cbse-class-5'},
  {id:'board-revision',title:'CBSE Board Revision',audience:'Classes 10 & 12',access:'Included in the existing tuition plan',topics:['Chapter revision and concept checks','Sample-paper practice with explained answers','Answer structure, timing and correction'],courseId:'course-cbse-class-10'},
  {id:'school-ai',title:'AI & Computational Thinking',audience:'Classes 5–8 · parent-managed learning',access:'Introductory activities in tuition · enquire about the extended track',topics:['Patterns, puzzles and step-by-step algorithms','What AI can and cannot do','Digital safety and responsible use'],courseId:'course-cbse-class-5'},
  {id:'student-speaking',title:'Spoken English & Confidence for Students',audience:'School learners · parent-managed access',access:'A focused pathway in our English speaking course',topics:['Self-introductions and classroom conversations','Storytelling and short presentations','Clear speech and constructive self-review'],courseId:'course-english-speaking'},
  {id:'teacher-chatgpt',title:'Practical ChatGPT for Teachers',audience:'Teachers and adult educators',access:'A focused pathway in our existing ChatGPT course',topics:['Lesson plans and differentiated explanations','Worksheets, quizzes and answer rubrics','Fact-checking and protecting student information'],courseId:'course-chatgpt-6-openai'},
];

const module = (title:string,lessons:string[]):CurriculumModule => ({moduleNumber:0,title,duration:'Guided lessons and practice',lessons});
export function enrichLearningTracks(course:Course):Course {
  const additions:CurriculumModule[]=[];
  const gradeMatch=/^course-cbse-class-(\d+)$/.exec(course.id);
  if(gradeMatch){
    const grade=Number(gradeMatch[1]);
    if(grade<=8) additions.push(module('Maths Foundations — strengthen prerequisites',[
      'Place value and long division: explain each step and check using multiplication',
      'Equivalent fractions and comparing fractions using visual models',
      'Adding and subtracting fractions with common and different denominators',
      'Decimals and money: compare values and calculate a shopping total',
      'Percentages as parts of 100: use grids and simple discounts',
      'Word problems: identify the question, select an operation and check units',
      'Unknown numbers: use a balance model to solve a simple equation',
      'Foundation progress check: explain mistakes and choose the next practice task',
    ]));
    if(grade<=8) additions.push(module('AI & Computational Thinking — introductory activities',[
      'Find patterns and break an everyday problem into smaller steps using paper-based puzzles',
      'Write an algorithm for a familiar task and debug a missing or misplaced step',
      'Compare a fixed rule with an AI prediction using a sorting activity; discuss mistakes',
      'Digital safety: keep personal information private and ask an adult to check AI claims; no child AI account required',
    ]));
    if(grade===10||grade===12) additions.push(module('CBSE Board Revision — practice and correction',[
      `Class ${grade}: revise one textbook concept and solve a matching worked question`,
      `Class ${grade}: practise a subject-appropriate case-based question and explain the reasoning`,
      `Class ${grade}: use the current official sample paper and marking scheme to review answer structure`,
      `Class ${grade}: timed practice, error log and a targeted correction plan without predicted exam questions`,
    ]));
  }
  if(course.id==='course-english-speaking') additions.push(module('Student Speaking & Confidence',[
    'Prepare a short self-introduction using familiar words and clear sentence structure',
    'Ask and answer a classroom question politely; practise requesting clarification',
    'Describe a picture and tell a short story with a beginning, middle and ending',
    'Present a school topic for one minute with an opening, two points and a conclusion',
    'Practise turn-taking and respectful disagreement in a small discussion',
    'Review pace, clarity and filler words using a simple self-assessment rubric',
  ]));
  if(course.id==='course-chatgpt-6-openai') additions.push(module('Practical ChatGPT for Teachers',[
    'Write a lesson-planning prompt with subject, class, objective, time and available resources',
    'Request two explanations of the same concept and verify both against the textbook',
    'Draft a worksheet with varied difficulty and independently check every answer',
    'Create a practice quiz and an explicit marking rubric aligned with the lesson objective',
    'Adapt an activity for different learning needs without sharing personal student data',
    'Review an AI draft for factual errors, bias and inappropriate content before classroom use',
  ]));
  if(!additions.length)return course;
  return {...course, highlights:[...course.highlights,...additions.map(m=>m.title)],curriculum:[...course.curriculum,...additions].map((m,i)=>({...m,moduleNumber:i+1}))};
}
