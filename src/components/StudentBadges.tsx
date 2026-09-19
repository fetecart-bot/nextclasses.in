import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Flame, Brain, CheckCircle2, Zap, Trophy, Target, Star,
  ShieldCheck, Clock, BookOpen, Sparkles, AlertCircle, ChevronRight
} from 'lucide-react';
import { StudentUser } from '../types';

export interface BadgeDefinition {
  id: string;
  name: string;
  category: 'mastery' | 'consistency' | 'excellence' | 'curriculum';
  description: string;
  icon: typeof Award;
  color: string;
  accentBg: string;
  borderActive: string;
  glowColor: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  unlocked: boolean;
  unlockedDate?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

interface StudentBadgesProps {
  user: StudentUser | null;
  selectedCourseTitle?: string;
  totalLessonsCount?: number;
  completedLessonsCount?: number;
  onNavigateToTab?: (tab: 'lessons' | 'mock_tests' | 'dispatches') => void;
}

export default function StudentBadges({
  user,
  selectedCourseTitle = 'AI & Competitive Track',
  totalLessonsCount = 12,
  completedLessonsCount = 0,
  onNavigateToTab,
}: StudentBadgesProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeBadgeModal, setActiveBadgeModal] = useState<BadgeDefinition | null>(null);

  // Compute stats from user state and props
  const mockTestScores = user?.mockTestScores || [];
  const totalMocksAttempted = mockTestScores.length;
  const bestAccuracy = mockTestScores.reduce((max, curr) => Math.max(max, curr.accuracy || 0), 0);
  const averageAccuracy = totalMocksAttempted > 0 
    ? Math.round(mockTestScores.reduce((sum, curr) => sum + (curr.accuracy || 0), 0) / totalMocksAttempted)
    : 0;

  // Streak calculation (persisted locally or simulated based on activity)
  const streakDays = useMemo(() => {
    if (totalMocksAttempted > 3 || completedLessonsCount > 4) return 7;
    if (totalMocksAttempted > 1 || completedLessonsCount > 1) return 3;
    if (totalMocksAttempted > 0 || completedLessonsCount > 0) return 1;
    return 0;
  }, [totalMocksAttempted, completedLessonsCount]);

  // Construct achievement badges
  const badges: BadgeDefinition[] = useMemo(() => {
    return [
      {
        id: 'quiz-master',
        name: 'Quiz Master',
        category: 'excellence',
        description: 'Complete at least 3 official CBT mock tests with accuracy benchmarks.',
        icon: Brain,
        color: 'text-purple-400',
        accentBg: 'bg-purple-500/10',
        borderActive: 'border-purple-500/50 hover:border-purple-400',
        glowColor: 'shadow-purple-500/20',
        currentValue: totalMocksAttempted,
        targetValue: 3,
        unit: 'tests',
        unlocked: totalMocksAttempted >= 3,
        unlockedDate: totalMocksAttempted >= 3 ? 'Achieved this month' : undefined,
        tier: totalMocksAttempted >= 5 ? 'Diamond' : totalMocksAttempted >= 3 ? 'Gold' : 'Silver',
      },
      {
        id: 'consistency-streak',
        name: 'Consistency Streak',
        category: 'consistency',
        description: 'Maintain a 5-day continuous learning streak across lessons or practice tests.',
        icon: Flame,
        color: 'text-orange-400',
        accentBg: 'bg-orange-500/10',
        borderActive: 'border-orange-500/50 hover:border-orange-400',
        glowColor: 'shadow-orange-500/20',
        currentValue: streakDays,
        targetValue: 5,
        unit: 'days',
        unlocked: streakDays >= 5,
        unlockedDate: streakDays >= 5 ? 'Active Today' : undefined,
        tier: streakDays >= 7 ? 'Diamond' : streakDays >= 5 ? 'Gold' : 'Bronze',
      },
      {
        id: 'first-flight',
        name: 'First Flight',
        category: 'curriculum',
        description: 'Watch your first masterclass video lesson or complete an initial assessment.',
        icon: Zap,
        color: 'text-amber-400',
        accentBg: 'bg-amber-500/10',
        borderActive: 'border-amber-500/50 hover:border-amber-400',
        glowColor: 'shadow-amber-500/20',
        currentValue: Math.max(completedLessonsCount, totalMocksAttempted > 0 ? 1 : 0),
        targetValue: 1,
        unit: 'activity',
        unlocked: completedLessonsCount >= 1 || totalMocksAttempted >= 1,
        unlockedDate: (completedLessonsCount >= 1 || totalMocksAttempted >= 1) ? 'Verified' : undefined,
        tier: 'Bronze',
      },
      {
        id: 'high-accuracy-sniper',
        name: 'Accuracy Sniper',
        category: 'excellence',
        description: 'Attain 80% or higher score accuracy on any standard CBT mock paper.',
        icon: Target,
        color: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10',
        borderActive: 'border-emerald-500/50 hover:border-emerald-400',
        glowColor: 'shadow-emerald-500/20',
        currentValue: Math.round(bestAccuracy),
        targetValue: 80,
        unit: '%',
        unlocked: bestAccuracy >= 80,
        unlockedDate: bestAccuracy >= 80 ? `${Math.round(bestAccuracy)}% Accuracy` : undefined,
        tier: bestAccuracy >= 90 ? 'Diamond' : 'Gold',
      },
      {
        id: 'syllabus-sprinter',
        name: 'Curriculum Conqueror',
        category: 'mastery',
        description: 'Complete 5 or more masterclasses in your current course curriculum.',
        icon: BookOpen,
        color: 'text-blue-400',
        accentBg: 'bg-blue-500/10',
        borderActive: 'border-blue-500/50 hover:border-blue-400',
        glowColor: 'shadow-blue-500/20',
        currentValue: completedLessonsCount,
        targetValue: Math.min(5, totalLessonsCount),
        unit: 'lessons',
        unlocked: completedLessonsCount >= Math.min(5, totalLessonsCount),
        unlockedDate: completedLessonsCount >= Math.min(5, totalLessonsCount) ? 'Completed' : undefined,
        tier: 'Gold',
      },
      {
        id: 'elite-scholar',
        name: 'Grandmaster Aspirant',
        category: 'mastery',
        description: 'Enroll in verified curriculum and build continuous portfolio progress.',
        icon: Trophy,
        color: 'text-yellow-400',
        accentBg: 'bg-yellow-500/10',
        borderActive: 'border-yellow-500/50 hover:border-yellow-400',
        glowColor: 'shadow-yellow-500/20',
        currentValue: (user?.enrolledCourseIds?.length || 1),
        targetValue: 1,
        unit: 'track',
        unlocked: true,
        unlockedDate: 'Enrolled Aspirant',
        tier: 'Gold',
      },
    ];
  }, [totalMocksAttempted, bestAccuracy, streakDays, completedLessonsCount, totalLessonsCount, user]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const displayedBadges = useMemo(() => {
    if (selectedFilter === 'unlocked') return badges.filter(b => b.unlocked);
    if (selectedFilter === 'locked') return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, selectedFilter]);

  return (
    <div className="space-y-6" id="student-badges-container">
      {/* Header Summary Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#1e1b4b]/40 border border-[#2a3449] shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Student Achievement & Badges</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>{user?.name ? `${user.name}’s Honors Showcase` : 'Aspirant Honors & Badges'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                {unlockedCount}/{totalBadges} Unlocked
              </span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Earn official digital credentials and milestone badges by watching curriculum video masterclasses, maintaining your daily learning streak, and taking CBT mock tests.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-[#0a0f1d]/80 border border-[#1f293d] p-3 rounded-2xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Streak</span>
              <span className="text-base font-black text-orange-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                {streakDays}d
              </span>
            </div>
            <div className="h-7 w-[1px] bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Avg Acc.</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Level</span>
              <span className="text-xs font-bold text-amber-300 block mt-0.5">
                {unlockedCount >= 4 ? 'Scholar 🌟' : unlockedCount >= 2 ? 'Explorer 🚀' : 'Novice 🌱'}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[#1f293d]/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300">Milestone Completion Index</span>
            <span className="font-mono text-orange-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#1e293b] overflow-hidden p-0.5 border border-[#334155]/60">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 shadow-sm shadow-orange-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#111827] p-1 rounded-xl border border-[#1f293d]">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-orange-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('unlocked')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'unlocked'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Unlocked ({unlockedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('locked')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'locked'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            In Progress ({badges.length - unlockedCount})
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Course Track: <strong className="text-white">{selectedCourseTitle}</strong></span>
        </div>
      </div>

      {/* Badge Grid with Framer Motion layout animations */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {displayedBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            const progressRatio = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));

            return (
              <motion.div
                layout
                key={badge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                onClick={() => setActiveBadgeModal(badge)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  badge.unlocked
                    ? `bg-[#111827]/90 ${badge.borderActive} shadow-lg ${badge.glowColor}`
                    : 'bg-[#0e1320]/60 border-[#1f293d] opacity-75 hover:opacity-95 hover:border-neutral-700'
                }`}
              >
                {/* Status Ribbons */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    badge.tier === 'Diamond'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : badge.tier === 'Gold'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : badge.tier === 'Silver'
                      ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                      : 'bg-orange-800/30 text-orange-300 border border-orange-700/30'
                  }`}>
                    {badge.tier} Tier
                  </span>

                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>In Progress</span>
                    </span>
                  )}
                </div>

                {/* Badge Icon & Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      badge.unlocked 
                        ? `${badge.accentBg} ${badge.color} border-current/30 shadow-md` 
                        : 'bg-neutral-800/80 text-neutral-500 border-neutral-700'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{badge.name}</span>
                        {badge.unlocked && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress / Unlock Details */}
                <div className="mt-4 pt-3 border-t border-[#1f293d] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 font-medium">Progress</span>
                    <span className="font-mono font-bold text-neutral-200">
                      {badge.currentValue} / {badge.targetValue} {badge.unit}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.unlocked 
                          ? 'bg-gradient-to-r from-orange-400 to-emerald-400' 
                          : 'bg-neutral-600'
                      }`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>

                  {badge.unlockedDate && (
                    <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 pt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{badge.unlockedDate}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Action Prompt Card */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#222e42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-white">How to Earn Next Badges:</h5>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Attempt mock test questions in the CBT simulation tab or finish video masterclasses to level up your credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('mock_tests')}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Take CBT Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Badge Details Modal Dialog */}
      <AnimatePresence>
        {activeBadgeModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveBadgeModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0f172a] border border-[#2a3854] shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                  NextClass Achievement Award
                </span>
                <button
                  type="button"
                  onClick={() => setActiveBadgeModal(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                  activeBadgeModal.unlocked 
                    ? `${activeBadgeModal.accentBg} ${activeBadgeModal.color} border-current/30 shadow-xl` 
                    : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                }`}>
                  <activeBadgeModal.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeBadgeModal.name}</h3>
                  <span className="text-xs font-semibold text-amber-400">{activeBadgeModal.tier} Tier Award</span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed bg-[#141d2d] p-3 rounded-xl border border-[#263750]">
                {activeBadgeModal.description}
              </p>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Current Milestone</span>
                  <span className="font-mono font-bold text-white">
                    {activeBadgeModal.currentValue} / {activeBadgeModal.targetValue} {activeBadgeModal.unit}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, (activeBadgeModal.currentValue / activeBadgeModal.targetValue) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveBadgeModal(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
