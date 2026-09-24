import { useState, useMemo } from 'react';
import { Search, Sparkles, Star, Users, CheckCircle2, BookOpen, Clock, Globe, ArrowRight, ShieldCheck, Languages, Settings, Play, Share2, Mic } from 'lucide-react';
import { Course, CourseCategory, CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getCourseVideos } from '../utils/courseVideos';
import ShareCourseModal from './ShareCourseModal';
import { CourseVoiceDoubtBot } from './CourseVoiceDoubtBot';

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenAdmin?: () => void;
  onOpenLanguageSelector?: () => void;
}

export default function CourseCatalog({ 
  courses, 
  onSelectCourse, 
  onAddToCart,
  onOpenAdmin,
  onOpenLanguageSelector,
}: CourseCatalogProps) {
  const { currentLanguage, allLanguages, setLanguageByCode, t, getCourseTranslation } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sharingCourse, setSharingCourse] = useState<Course | null>(null);
  const [voiceDoubtCourse, setVoiceDoubtCourse] = useState<Course | null>(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const categories: { id: CourseCategory; label: string; count: number }[] = [
    { id: 'all', label: t('allPrograms', 'All Programs'), count: courses.length },
    { id: 'ai_platforms', label: '⚡ Frontier AI & Platforms (Gemini 2.0, ChatGPT, Claude, DeepSeek, Cursor)', count: courses.filter(c => c.category === 'ai_platforms').length },
    { id: 'automation', label: '🤖 AI Agents & Automations (LangGraph, CrewAI, Voice AI, Zapier)', count: courses.filter(c => c.category === 'automation').length },
    { id: 'creators', label: '🎬 AI Creators & Video (Sora, Runway Gen-3, Midjourney, HeyGen)', count: courses.filter(c => c.category === 'creators').length },
    { id: 'beginners', label: '🌱 Beginners & Productivity', count: courses.filter(c => c.category === 'beginners').length },
    { id: 'students', label: '🎓 Students & Academics', count: courses.filter(c => c.category === 'students').length },
    { id: 'educators', label: '🍎 Teachers & Educators', count: courses.filter(c => c.category === 'educators').length },
    { id: 'languages', label: '🗣️ Languages & Speaking (English, French, German)', count: courses.filter(c => c.category === 'languages').length },
    { id: 'competitive_exams', label: '🎯 Competitive Exams (NEET, JEE, KEAM, AISSEE, Navodaya)', count: courses.filter(c => c.category === 'competitive_exams').length },
  ];

  const filteredCourses = useMemo(() => {
    const list = courses.filter((course) => {
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        course.title.toLowerCase().includes(query) ||
        course.subtitle.toLowerCase().includes(query) ||
        course.toolsCovered.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesLevel && matchesSearch;
    });

    // When showing 'All Programs', ensure all AI & Automation courses come at the top
    if (activeCategory === 'all' && !searchQuery) {
      const aiCategories = new Set(['ai_platforms', 'automation', 'creators', 'beginners', 'students', 'educators']);
      return [...list].sort((a, b) => {
        const aRank = aiCategories.has(a.category) ? 0 : a.category === 'languages' ? 1 : 2;
        const bRank = aiCategories.has(b.category) ? 0 : b.category === 'languages' ? 1 : 2;
        return aRank - bRank;
      });
    }

    return list;
  }, [courses, activeCategory, selectedLevel, searchQuery]);

  const shouldLimitCatalog = activeCategory === 'all' && !searchQuery && selectedLevel === 'all' && !showAllCourses;
  const visibleCourses = shouldLimitCatalog ? filteredCourses.slice(0, 9) : filteredCourses;

  return (
    <section id="courses" className="py-20 sm:py-28 bg-neutral-950 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Learning Paths</span>
            </div>
            <h2 id="courses-section-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {t('coursesHeading', 'Practical AI Courses for Real Impact')}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              {t('coursesSubheading', 'Every course is taught by experienced practitioners in your preferred language with actionable digital superpowers.')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lifetime Updates & Community Access</span>
          </div>
        </div>

        {/* Major Indian Languages Translation Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-neutral-900/90 border border-orange-500/20 shadow-lg shadow-orange-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white">
                  Translate Courses into Major Indian Languages:
                </span>
                <span className="hidden md:inline text-xs text-neutral-400 ml-2">
                  (Instant 1-click switch for titles, syllabi & descriptions)
                </span>
              </div>
            </div>

            {onOpenLanguageSelector && (
              <button
                type="button"
                onClick={onOpenLanguageSelector}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>All {allLanguages.length} Languages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {allLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguageByCode(lang.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-neutral-950 shadow-md shadow-orange-500/20'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm select-none">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {lang.code !== 'en' && (
                    <span className={`text-[10px] ${isSelected ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}`}>
                      {lang.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-4 mb-10">
          
          {/* Category Tabs */}
          <div id="course-category-tabs" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`course-tab-${cat.id}`}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 shadow-md shadow-orange-500/10'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* Search & Level Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="courses-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by tool or keyword (e.g., Claude, Teacher, Midjourney, n8n)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <label htmlFor="course-level-select" className="text-xs text-neutral-400 whitespace-nowrap">
                Difficulty:
              </label>
              <select
                id="course-level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 transition-colors cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner (No coding)</option>
                <option value="All Levels">All Levels</option>
                <option value="Intermediate">Intermediate</option>
              </select>
            </div>
          </div>

        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
            <p className="text-base text-neutral-400">No courses found matching your criteria.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setSelectedLevel('all');
              }}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div id="course-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleCourses.map((course) => {
              const discountPercent =
                course.originalPrice && course.originalPrice > course.price
                  ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                  : 0;
              const translated = getCourseTranslation(course);

              return (
                <div
                  key={course.id}
                  id={course.id}
                  className="group rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all duration-300 shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Card Media Header */}
                  <div>
                    <div className="relative aspect-16/10 overflow-hidden bg-neutral-850">
                      <img
                        src={course.thumbnail}
                        alt={translated.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            if (course.id === 'course-google-ai-studio') {
                              target.src = '/courses/google-ai-studio-gemini.svg';
                            } else if (course.id === 'course-autonomous-ai-agents') {
                              target.src = '/courses/autonomous-ai-agents.svg';
                            } else if (course.id.includes('claude')) {
                              target.src = '/courses/claude-3-7-masterclass.svg';
                            } else {
                              target.src = '/courses/google-ai-studio-gemini.svg';
                            }
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        {translated.badge || course.badge ? (
                          <span className="px-2.5 py-1 rounded-md bg-neutral-950/90 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-500/30 truncate">
                            {translated.badge || course.badge}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-neutral-300 text-[11px] font-medium">
                            {course.level}
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/85 backdrop-blur-md text-[10px] font-bold text-red-400 border border-red-500/40 shadow-xs">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            YouTube Preview
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingCourse(course);
                            }}
                            className="p-1 rounded-md bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-orange-400 border border-neutral-700/80 transition-colors cursor-pointer"
                            title="Share Course Link & Social Media"
                          >
                            <Share2 className="w-3 h-3 text-orange-400" />
                          </button>
                          {discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Video Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-300">
                        <span className="flex items-center gap-1 font-semibold text-orange-400">
                          <Globe className="w-3.5 h-3.5" />
                          {currentLanguage.code !== 'en' ? currentLanguage.nativeName : course.language}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-neutral-400">
                          <Clock className="w-3 h-3" />
                          {course.duration.split('•')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      
                      {/* Rating & Social Proof */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{course.rating}</span>
                          <span className="text-neutral-500 font-normal">({course.reviewCount})</span>
                        </div>
                        <span className="text-neutral-400 text-[11px]">
                          {course.enrolledCount.toLocaleString()}+ students
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                          {translated.title}
                        </h3>
                        <p className="text-xs text-neutral-300 mt-2 line-clamp-2 leading-relaxed">
                          {translated.subtitle}
                        </p>
                      </div>

                      {/* Tools Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {course.toolsCovered.slice(0, 4).map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] text-neutral-300 border border-neutral-700"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>

                      {/* Key highlights checklist */}
                      <div className="pt-2 space-y-1.5 text-xs text-neutral-300 border-t border-neutral-800/80">
                        {course.isCompetitiveExam && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 mb-1.5">
                            <span>📦 Automated Weekly Delivery: Calculated from Exam Countdown</span>
                          </div>
                        )}
                        {course.highlights.slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Card Footer: Price and CTA */}
                  <div className="p-6 pt-0 mt-2 border-t border-neutral-800/80">
                    <div className="pt-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white">₹{course.price}</span>
                          <span className="text-xs line-through text-neutral-500">₹{course.originalPrice}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block">{course.format}</span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoiceDoubtCourse(course);
                          }}
                          className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-orange-400 hover:bg-neutral-700 transition-colors cursor-pointer shrink-0"
                          title="Ask Doubts Live with Voice AI (gemini-3.8-live)"
                        >
                          <Mic className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSharingCourse(course);
                          }}
                          className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-orange-400 hover:bg-neutral-700 transition-colors cursor-pointer shrink-0"
                          title="Share course link / social media"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCourse(course)}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
                          title="Watch official YouTube demo & view curriculum"
                        >
                          <Play className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
                          <span className="hidden xs:inline">Demo & Syllabus</span>
                          <span className="xs:hidden">Demo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddToCart({
                            id: course.id,
                            itemType: 'course',
                            title: translated.title || course.title,
                            price: course.price,
                            originalPrice: course.originalPrice,
                            thumbnail: course.thumbnail,
                            format: course.format,
                            category: course.category,
                            isCompetitiveExam: course.isCompetitiveExam,
                            targetExamCode: course.targetExamCode,
                            examName: course.examName,
                            targetExamDate: course.defaultExamDate,
                          })}
                          className="px-3 sm:px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer shrink-0"
                        >
                          {t('enrollNow', 'Enroll')}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {shouldLimitCatalog && filteredCourses.length > visibleCourses.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAllCourses(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-sm hover:border-orange-500/60 hover:text-orange-300 transition-colors"
            >
              View all {filteredCourses.length} programs
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-2 text-xs text-neutral-500">Or choose a category above to find the right program faster.</p>
          </div>
        )}

      </div>

      {/* Social Media Share & Copy Link Modal */}
      <ShareCourseModal
        course={sharingCourse}
        isOpen={!!sharingCourse}
        onClose={() => setSharingCourse(null)}
      />

      {/* Voice Doubt Bot for Selected Course */}
      {voiceDoubtCourse && (
        <CourseVoiceDoubtBot
          isOpen={!!voiceDoubtCourse}
          onClose={() => setVoiceDoubtCourse(null)}
          course={voiceDoubtCourse}
        />
      )}
    </section>
  );
}
