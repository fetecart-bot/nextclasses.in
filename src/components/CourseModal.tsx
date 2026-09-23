import { useState } from 'react';
import { X, CheckCircle2, Clock, Globe, Calendar, Award, ChevronDown, ChevronUp, Sparkles, Shield, User, Play, ExternalLink, MessageCircle, Share2, Copy, Check, Tv, Mic, Radio } from 'lucide-react';
import { Course, CartItem } from '../types';
import { getCourseVideos } from '../utils/courseVideos';
import ShareCourseModal from './ShareCourseModal';
import { CourseVoiceDoubtBot } from './CourseVoiceDoubtBot';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function CourseModal({ course, onClose, onAddToCart }: CourseModalProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isVoiceDoubtOpen, setIsVoiceDoubtOpen] = useState<boolean>(false);
  const [copiedQuickLink, setCopiedQuickLink] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  if (!course) return null;

  const courseVideos = getCourseVideos(course);
  const activeVideo = courseVideos[activeVideoIndex] || courseVideos[0];

  const toggleModule = (moduleNumber: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleNumber]: !prev[moduleNumber],
    }));
  };

  const discountPercent =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0;

  const handleCopyLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nextclasses.in';
    const shareUrl = `${origin}/courses/${course.id.replace(/^course-/, '')}/`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedQuickLink(true);
      setTimeout(() => setCopiedQuickLink(false), 2500);
    } catch {
      setIsShareModalOpen(true);
    }
  };

  const handleEnroll = () => {
    onAddToCart({
      id: course.id,
      itemType: 'course',
      title: course.title,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      format: course.format,
      category: course.category,
    });
    onClose();
  };

  return (
    <div
      id="course-syllabus-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950 border border-neutral-800 text-white shadow-2xl overflow-hidden my-auto">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-3.5 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
              {course.format}
            </span>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
              • {course.language}
            </span>
            <span className="text-xs text-emerald-400 font-medium hidden md:inline">
              • {courseVideos.length} Video Lessons
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Share Course Link & Social Media"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                copiedQuickLink
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="Copy Course Link"
            >
              {copiedQuickLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 divide-y divide-neutral-800/80">
          
          {/* Hero Banner & Details */}
          <div className="space-y-5">
            {course.thumbnail && (
              <div className="relative aspect-21/9 sm:aspect-16/6 w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-lg">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
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
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                {course.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-md bg-neutral-950/90 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30 shadow-md">
                      {course.badge}
                    </span>
                  </div>
                )}
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {course.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              {course.subtitle}
            </p>

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 block">Total Duration</span>
                <span className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {course.duration}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Delivery Medium</span>
                <span className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  {course.language}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Course Access</span>
                <span className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Instant • Self-Paced
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Certification</span>
                <span className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Official Certificate
                </span>
              </div>
            </div>

            {/* Curated Multi-Video Masterclasses & Demonstrations */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/15 text-red-400 border border-red-500/30 text-xs font-bold">
                    <Tv className="w-3.5 h-3.5 text-red-400" />
                    Curated Video Masterclasses ({courseVideos.length} Lessons)
                  </span>
                  <span className="text-xs text-neutral-400 hidden sm:inline">Select any lesson below to watch preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    HD 1080p Stream
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 text-orange-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Active Video Player */}
              <div className="relative aspect-16/9 rounded-2xl bg-black border border-neutral-800 overflow-hidden shadow-2xl">
                <iframe
                  key={activeVideo.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Active Video Info Bar */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold bg-neutral-800 px-2.5 py-1 rounded-md text-orange-400 border border-neutral-700">
                      {activeVideo.company}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {activeVideo.duration}
                    </span>
                    {activeVideo.badge && (
                      <span className="hidden sm:inline-block text-[11px] font-semibold text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">
                        {activeVideo.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activeVideo.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {activeVideo.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>
              </div>

              {/* Ask Doubts Live with Voice AI Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-orange-950/60 via-neutral-900 to-amber-950/40 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-neutral-950 shrink-0 shadow-md">
                    <Mic className="w-5 h-5 text-neutral-950 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Have Doubts in this Lesson? Ask Live with Voice AI
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 hidden sm:inline">
                        gemini-3.8-live
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Speak your doubt in Malayalam, Tamil, Telugu, Hindi, or English. The bot will hear and explain clearly in voice and written language!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoiceDoubtOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Voice Doubts</span>
                </button>
              </div>

              {/* Video Lessons Playlist Selection */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    All Video Lessons in this Course ({courseVideos.length})
                  </span>
                  <span className="text-[11px] text-neutral-400">Click to switch lesson</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courseVideos.map((video, idx) => {
                    const isActive = idx === activeVideoIndex;
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => setActiveVideoIndex(idx)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 group ${
                          isActive
                            ? 'bg-orange-500/10 border-orange-500/50 shadow-md shadow-orange-500/5'
                            : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                            isActive
                              ? 'bg-orange-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-400 group-hover:text-white group-hover:bg-neutral-700'
                          }`}
                        >
                          {isActive ? <Play className="w-4 h-4 fill-current" /> : String(idx + 1).padStart(2, '0')}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold text-neutral-400 truncate">
                              {video.company}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 shrink-0">
                              {video.duration}
                            </span>
                          </div>
                          <h5
                            className={`text-xs font-bold mt-0.5 line-clamp-2 transition-colors ${
                              isActive ? 'text-orange-400' : 'text-white group-hover:text-orange-300'
                            }`}
                          >
                            {video.title}
                          </h5>
                          {isActive && (
                            <span className="inline-block text-[10px] font-bold text-emerald-400 mt-1">
                              ● Now Playing in Player Above
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tools Covered */}
          <div className="pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Tools & Technologies Mastered
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.toolsCovered.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-medium text-white shadow-xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Syllabus Modules */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Complete Course Curriculum</h3>
                <p className="text-xs text-neutral-400">Structured step-by-step from zero foundations to live capstone implementation.</p>
              </div>
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                {course.curriculum.length} Modules
              </span>
            </div>

            <div className="space-y-3">
              {course.curriculum.map((mod) => {
                const isExpanded = !!expandedModules[mod.moduleNumber];

                return (
                  <div
                    key={mod.moduleNumber}
                    className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.moduleNumber)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-850 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-md bg-neutral-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                          0{mod.moduleNumber}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-white block">
                            {mod.title}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {mod.lessons.length} Lessons • {mod.duration}
                          </span>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-neutral-950/60 border-t border-neutral-800/60">
                        <ul className="space-y-2">
                          {mod.lessons.map((lesson, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* Target Audience & Inclusions */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Who This Course Is For</h4>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {course.targetAudience.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Everything Included</h4>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lifetime access to student dashboard & recordings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VIP WhatsApp batch group for live doubt clearing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloadable prompt sheets, templates & cheat sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifiable Certificate of Completion</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Sticky Enrollment Footer */}
        <div className="sticky bottom-0 z-10 p-4 sm:px-8 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹{course.price}</span>
              <span className="text-sm line-through text-neutral-500">₹{course.originalPrice}</span>
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">No hidden fees • Full course + Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Share Course Link & Social Media"
            >
              <Share2 className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVoiceDoubtOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl bg-gradient-to-r from-orange-950/80 to-amber-950/80 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Ask Doubts in Real Time with Voice AI"
            >
              <Mic className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Doubts</span>
            </button>
            <a
              href={`https://wa.me/918281644058?text=${encodeURIComponent(`Hi Nextclasses.in, I have questions about the "${course.title}" course.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-semibold transition-colors"
              title="Chat with Counselor on WhatsApp (+91 82816 44058)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask on WhatsApp</span>
            </a>
            <button
              id="modal-enroll-now-btn"
              type="button"
              onClick={handleEnroll}
              className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              Enroll & Start Instantly
            </button>
          </div>
        </div>

      </div>

      {/* Social Media Share & Copy Link Modal */}
      <ShareCourseModal
        course={course}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Real-time Voice Doubt Resolution Bot for this course */}
      <CourseVoiceDoubtBot
        course={course}
        isOpen={isVoiceDoubtOpen}
        onClose={() => setIsVoiceDoubtOpen(false)}
      />
    </div>
  );
}
