import { useState, useId } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Linkedin, Twitter, Facebook, Send, Mail, ExternalLink } from 'lucide-react';
import { Course } from '../types';

interface ShareCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCourseModal({ course, isOpen, onClose }: ShareCourseModalProps) {
  const [copied, setCopied] = useState(false);
  const copyInputId = useId();

  if (!isOpen || !course) return null;

  // Construct canonical share URL with deep link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nextclasses.in';
  const shareUrl = `${origin}/courses/${course.id.replace(/^course-/, '')}/`;
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareTitle = `Explore "${course.title}" on Nextclasses.in`;
  const shareDescription = `${course.title} - ${course.subtitle}. Enroll for ₹${course.price} with instant self-paced access and verifiable certificate.`;

  const whatsappMessage = `🎓 Check out this course on Nextclasses.in:\n\n*${course.title}*\n_${course.subtitle}_\n\n💰 Price: ₹${course.price} (Original: ₹${course.originalPrice})\n⚡ Format: ${course.format}\n\n👉 View Syllabus, Video Lessons & Enroll:\n${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Master ${course.title} on Nextclasses.in! 🚀 Practical curriculum with video masterclasses:`)}&url=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`🎓 ${course.title} - Nextclasses.in`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\nExplore syllabus and video lessons here:\n${shareUrl}`)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for iframe restrictions
        const input = document.getElementById(copyInputId) as HTMLInputElement | null;
        if (input) {
          input.select();
          document.execCommand('copy');
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Manual selection fallback
      const input = document.getElementById(copyInputId) as HTMLInputElement | null;
      if (input) {
        input.select();
      }
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-neutral-950 border border-neutral-800 text-white shadow-2xl p-5 sm:p-6 space-y-5 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Share Course</h3>
              <p className="text-xs text-neutral-400">Copy link or share directly across social media</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Summary Card */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-16 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/courses/google-ai-studio-gemini.svg';
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{course.title}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
              <span className="text-emerald-400 font-semibold">₹{course.price}</span>
              <span>•</span>
              <span>{course.duration}</span>
              <span>•</span>
              <span className="text-orange-400 font-medium truncate">{course.format}</span>
            </div>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <label htmlFor={copyInputId} className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
            Course Link to Copy & Paste
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id={copyInputId}
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 font-mono focus:outline-hidden focus:border-orange-500 pr-10"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 hover:opacity-95 shadow-orange-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5" />
              <span>Link successfully copied to clipboard. Ready to paste!</span>
            </p>
          )}
        </div>

        {/* Social Media Sharing Grid */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
            Share Directly to Social Apps
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">WhatsApp</span>
                <span className="block text-[10px] text-emerald-400">Share to Chat/Group</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/50 text-sky-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Linkedin className="w-3.5 h-3.5" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">LinkedIn</span>
                <span className="block text-[10px] text-sky-400">Share to Network</span>
              </div>
            </a>

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Twitter className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">X / Twitter</span>
                <span className="block text-[10px] text-neutral-400">Post Tweet</span>
              </div>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 text-blue-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">Telegram</span>
                <span className="block text-[10px] text-blue-400">Send to Channel</span>
              </div>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Facebook className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">Facebook</span>
                <span className="block text-[10px] text-indigo-400">Share to Feed</span>
              </div>
            </a>

            {/* Email */}
            <a
              href={mailtoUrl}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="truncate text-left">
                <span className="block text-xs text-white">Email</span>
                <span className="block text-[10px] text-neutral-400">Send via Mail</span>
              </div>
            </a>
          </div>
        </div>

        {/* Native Mobile Share Button if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>More Share Options on This Device</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
