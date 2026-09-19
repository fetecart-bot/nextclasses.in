import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  FileText, 
  Layers,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SUPPORTED_EXAMS, SupportedExam, generateWeeklyDispatchRoadmap, calculateDaysToExam, calculateWeeksToExam } from '../utils/examScheduler';
import { Course } from '../types';
import { COURSES_DATA } from '../data';

interface ExamCountdownSchedulerProps {
  onEnrollExam: (course: Course, customExamDate: string) => void;
  onViewCourseDetails: (course: Course) => void;
}

export default function ExamCountdownScheduler({
  onEnrollExam,
  onViewCourseDetails,
}: ExamCountdownSchedulerProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-neet-ug');
  const [customDates, setCustomDates] = useState<Record<string, string>>({
    'exam-neet-ug': '2027-05-02',
    'exam-iit-jee': '2027-04-05',
    'exam-keam': '2027-04-24',
    'exam-aissee': '2027-01-10',
    'exam-navodaya': '2027-01-18',
  });
  const [viewAllWeeks, setViewAllWeeks] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unlocked' | 'revision'>('all');

  const currentExam = useMemo(() => {
    return SUPPORTED_EXAMS.find((e) => e.id === selectedExamId) || SUPPORTED_EXAMS[0];
  }, [selectedExamId]);

  const targetDateStr = customDates[selectedExamId] || currentExam.defaultExamDate;

  // Correlate with course in COURSES_DATA
  const matchedCourse = useMemo(() => {
    return COURSES_DATA.find((c) => c.targetExamCode === currentExam.code) || COURSES_DATA[0];
  }, [currentExam]);

  // Compute live schedule
  const schedule = useMemo(() => {
    return generateWeeklyDispatchRoadmap(
      currentExam.code,
      currentExam.name,
      targetDateStr
    );
  }, [currentExam, targetDateStr]);

  const handleDateChange = (newDate: string) => {
    setCustomDates((prev) => ({
      ...prev,
      [selectedExamId]: newDate,
    }));
  };

  const handleEnrollClick = () => {
    if (matchedCourse) {
      onEnrollExam(matchedCourse, targetDateStr);
    }
  };

  const filteredDispatches = useMemo(() => {
    if (activeTabFilter === 'unlocked') {
      return schedule.dispatches.filter((d) => d.status === 'unlocked');
    }
    if (activeTabFilter === 'revision') {
      return schedule.dispatches.filter((d) => d.phase === 'Final Grand Revision' || d.phase === 'Intensive Mocks');
    }
    return schedule.dispatches;
  }, [schedule, activeTabFilter]);

  const displayedDispatches = viewAllWeeks ? filteredDispatches : filteredDispatches.slice(0, 6);

  return (
    <section id="exam-scheduler" className="py-20 bg-neutral-950 border-t border-neutral-850 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/10 via-orange-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>AI Automated Delivery Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Competitive Exam AI Prep &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Weekly Material Delivery
            </span>
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Targeting <strong>NEET, IIT JEE, KEAM, AISSEE (Sainik School), or Navodaya</strong>? Once you enroll, our engine calculates the exact remaining days to your exam and automatically delivers comprehensive study packs every single week right to your student portal and WhatsApp.
          </p>
        </div>

        {/* Interactive Exam Selector Tabs */}
        <div className="flex items-center justify-start lg:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
          {SUPPORTED_EXAMS.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            const daysLeft = calculateDaysToExam(customDates[exam.id] || exam.defaultExamDate);
            return (
              <button
                key={exam.id}
                id={`btn-select-${exam.id}`}
                onClick={() => setSelectedExamId(exam.id)}
                className={`group px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border flex items-center gap-3 shrink-0 ${
                  isSelected
                    ? 'bg-neutral-900 border-orange-500 text-white shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/50'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
                  }`}
                >
                  {exam.code === 'IIT_JEE' ? 'JEE' : exam.code.slice(0, 3)}
                </div>
                <div className="text-left">
                  <div className="font-bold">{exam.name.split(' (')[0]}</div>
                  <div className="text-[10px] text-amber-400/80 font-normal">
                    {daysLeft} days • {calculateWeeksToExam(daysLeft)} weeks
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Calculation Dashboard Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Top Row: Exam Info & Countdown Timer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-neutral-800">
            {/* Left Col: Exam Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {currentExam.conductingBody}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">
                  Target: {currentExam.targetClasses}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Bilingual: Malayalam & English
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{currentExam.name}</h3>
                <p className="text-sm text-neutral-400 mt-1">{currentExam.tagline}</p>
              </div>

              {/* Subjects Covered */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-neutral-400">Core Subjects:</span>
                {currentExam.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-neutral-800 text-amber-300 border border-neutral-700"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              {/* Target Date Customizer */}
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Target Exam Date:</span>
                    <span className="text-[11px] text-neutral-400">
                      Calculated automatically or set your expected exam session date
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    id="exam-date-picker"
                    aria-label="Select Target Exam Date"
                    value={targetDateStr}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleDateChange(currentExam.defaultExamDate)}
                    title="Reset to Official Expected Date"
                    className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium shrink-0"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: The Live Calculated Countdown Metric Card */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-orange-500/20 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Real-Time Calculation</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AUTOMATED DISPATCH ACTIVE
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                      {schedule.daysRemaining}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      Days to Exam
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono block">
                      {schedule.weeksRemaining}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      Weekly Study Packs
                    </span>
                  </div>
                </div>

                {/* Weekly Delivery Guarantee */}
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                    <span>Every Sunday at 06:00 AM IST</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Fresh unit study notes, 200+ AI questions, and full-length weekly mock test delivered directly to your portal & WhatsApp.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="btn-enroll-exam"
                  onClick={handleEnrollClick}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group"
                >
                  <span>Enroll & Start Weekly Delivery (₹{matchedCourse.price})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  id="btn-preview-course"
                  onClick={() => onViewCourseDetails(matchedCourse)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors"
                >
                  View Full Syllabus
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Week-by-Week Study Material Delivery Roadmap */}
          <div className="pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  <h4 className="text-lg font-extrabold text-white">
                    Calculated Weekly Delivery Roadmap ({schedule.weeksRemaining} Weeks Total)
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Here is the exact schedule of study materials delivered each week based on your {schedule.daysRemaining}-day countdown to {currentExam.name}.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTabFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTabFilter === 'all'
                      ? 'bg-orange-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({schedule.dispatches.length})
                </button>
                <button
                  onClick={() => setActiveTabFilter('unlocked')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTabFilter === 'unlocked'
                      ? 'bg-orange-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Immediate (Week 1)
                </button>
                <button
                  onClick={() => setActiveTabFilter('revision')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTabFilter === 'revision'
                      ? 'bg-orange-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Final Mocks & Revision
                </button>
              </div>
            </div>

            {/* Weekly Dispatch Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedDispatches.map((dispatch) => {
                const isUnlocked = dispatch.status === 'unlocked';
                return (
                  <div
                    key={dispatch.weekNumber}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isUnlocked
                        ? 'bg-neutral-950 border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    {/* Top Status & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-black ${
                            isUnlocked
                              ? 'bg-emerald-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          W{dispatch.weekNumber}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {dispatch.releaseDate}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUnlocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isUnlocked ? 'Unlocked on Checkout' : dispatch.phase}
                      </span>
                    </div>

                    {/* Dispatch Title */}
                    <h5 className="text-sm font-bold text-white mb-2 line-clamp-2">
                      {dispatch.title}
                    </h5>

                    {/* What's Delivered */}
                    <div className="space-y-2 text-xs pt-2 border-t border-neutral-850">
                      <div className="flex items-start gap-2 text-neutral-300">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">
                          {dispatch.materials.theoryNotes}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">
                          <strong>{dispatch.materials.questionBankCount}+ MCQs</strong> + {dispatch.materials.mockTestType}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-neutral-400">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-neutral-400 leading-tight">
                          {dispatch.materials.specialFeature}
                        </span>
                      </div>
                    </div>

                    {/* Unlocked banner on week 1 */}
                    {isUnlocked && (
                      <div className="mt-3 pt-2 border-t border-emerald-900/50 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                        <span>⚡ Instant Access Package</span>
                        <span className="underline cursor-pointer" onClick={handleEnrollClick}>
                          Get Pack Now
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View More / Expand Weeks Toggle */}
            {filteredDispatches.length > 6 && (
              <div className="text-center pt-2">
                <button
                  id="btn-toggle-weeks"
                  onClick={() => setViewAllWeeks(!viewAllWeeks)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors inline-flex items-center gap-2"
                >
                  {viewAllWeeks ? (
                    <>Show Less</>
                  ) : (
                    <>View All {filteredDispatches.length} Weekly Dispatches</>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      viewAllWeeks ? '-rotate-90' : 'rotate-90'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
