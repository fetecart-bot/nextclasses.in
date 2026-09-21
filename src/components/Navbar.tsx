import { useState } from 'react';
import { ShoppingBag, BookOpen, Menu, X, Sparkles, UserCheck, MessageSquare, MessageCircle, LogIn, User, LogOut, Target, Languages, Settings, QrCode, Send, Phone } from 'lucide-react';
import { CartItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenStudentPortal: () => void;
  onNavigateTo: (sectionId: string) => void;
  onOpenAuthModal?: () => void;
  onOpenMockTest?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenAdmin?: () => void;
  onOpenUpiModal?: () => void;
  onOpenAdminDispatch?: () => void;
  onOpenVoiceReceptionist?: () => void;
}

export default function Navbar({
  cartItems,
  onOpenCart,
  onOpenStudentPortal,
  onNavigateTo,
  onOpenAuthModal,
  onOpenMockTest,
  onOpenLanguageSelector,
  onOpenAdmin,
  onOpenUpiModal,
  onOpenAdminDispatch,
  onOpenVoiceReceptionist,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalCartCount = cartItems.length;
  const cartTotalAmount = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const navLinks = [
    { label: 'AI Courses', href: 'courses' },
    { label: 'AI Digital Products', href: 'products' },
    { label: 'Why Nextclasses.in', href: 'why-us' },
    { label: 'Testimonials', href: 'testimonials' },
    { label: 'FAQ', href: 'faq' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateTo(id);
  };

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Identity */}
          <button
            type="button"
            onClick={() => handleLinkClick('hero')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              NC
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
                <span>NextClasses</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  .in
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                Practical AI & Competitive Exam Masterclasses
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleLinkClick(link.href)}
                className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Translate Button */}
            <button
              id="navbar-translate-btn"
              type="button"
              onClick={onOpenLanguageSelector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition-colors cursor-pointer"
              title="Translate courses into major Indian languages"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{currentLanguage.code === 'en' ? 'Translate' : currentLanguage.nativeName}</span>
              <span className="text-xs">{currentLanguage.flag}</span>
            </button>

            {/* CBT Mock Test Shortcut */}
            <button
              id="navbar-mock-test-btn"
              type="button"
              onClick={onOpenMockTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-orange-500/50 text-neutral-200 text-xs font-semibold hover:text-white transition-colors cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span>Mock Tests (CBT)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Student Portal */}
            <button
              id="navbar-student-portal-btn"
              type="button"
              onClick={onOpenStudentPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-semibold hover:border-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal</span>
            </button>

            {/* Voice Receptionist Button (Priya - Indian Accent) */}
            {onOpenVoiceReceptionist && (
              <button
                id="navbar-voice-receptionist-btn"
                type="button"
                onClick={onOpenVoiceReceptionist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                title="Talk to Priya • AI Voice Receptionist (Indian Accent)"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Talk to Priya</span>
                <span className="hidden xl:inline text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-medium">Voice</span>
              </button>
            )}

            {/* Admin Dispatch Study Materials Button */}
            {onOpenAdminDispatch && (
              <button
                id="navbar-dispatch-materials-btn"
                type="button"
                onClick={onOpenAdminDispatch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Send Sainik School & Entrance Study Packs to Student WhatsApp & Email"
              >
                <Send className="w-3.5 h-3.5 text-orange-400" />
                <span>Send Materials</span>
              </button>
            )}

            {/* Direct WhatsApp Helpline */}
            <a
              id="navbar-whatsapp-helpline"
              href="https://wa.me/918281644058?text=Hi%20Nextclasses.in%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900 text-xs font-semibold transition-colors"
              title="Chat with Nextclasses.in Academic Support on WhatsApp (+91 82816 44058)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* User Account / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-xs text-white font-medium cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-neutral-950 font-black text-[10px] flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl py-2 z-50 text-xs text-neutral-200 space-y-1">
                    <div className="px-3 py-1.5 border-b border-neutral-800">
                      <div className="font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenStudentPortal();
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      <span>My Learning Portal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-neutral-800 flex items-center gap-2 text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              id="navbar-cart-btn"
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
              <span>Cart</span>
              {totalCartCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-neutral-950 text-white rounded-full text-[10px] font-extrabold">
                  {totalCartCount} (₹{cartTotalAmount})
                </span>
              ) : (
                <span className="text-[11px] opacity-75">(0)</span>
              )}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-neutral-950 rounded-full text-[9px] font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-panel" className="lg:hidden border-b border-neutral-800 bg-neutral-900 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleLinkClick(link.href)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2">
            {/* Mobile Translate Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLanguageSelector) onOpenLanguageSelector();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/25 transition-colors cursor-pointer"
            >
              <Languages className="w-4 h-4" />
              <span>Translate Courses: {currentLanguage.nativeName} ({currentLanguage.name}) {currentLanguage.flag}</span>
            </button>

            {/* Mobile Admin Button */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-orange-400" />
                <span>Admin: Add/Delete Products & Courses</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMockTest) onOpenMockTest();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700 transition-colors"
            >
              <Target className="w-4 h-4 text-orange-400" />
              <span>Interactive Mock Tests (CBT)</span>
            </button>

            {onOpenVoiceReceptionist && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVoiceReceptionist();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Talk to Priya • AI Voice Receptionist</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudentPortal();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{user ? `Portal (${user.name})` : 'Preview Student Dashboard'}</span>
            </button>

            {onOpenAdminDispatch && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDispatch();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold hover:bg-orange-500/30 transition-colors"
              >
                <Send className="w-4 h-4 text-orange-400" />
                <span>Send Materials to Student WhatsApp</span>
              </button>
            )}

            {!user && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors"
              >
                <LogIn className="w-4 h-4 text-neutral-400" />
                <span>Student Login / Register</span>
              </button>
            )}

            <a
              href="https://wa.me/918281644058?text=Hi%20Nextclasses.in%20Support"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold hover:bg-emerald-900 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Support: +91 82816 44058</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCart();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 text-xs font-bold shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Checkout Cart {totalCartCount > 0 ? `(${totalCartCount} items • ₹${cartTotalAmount})` : '(Empty)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
