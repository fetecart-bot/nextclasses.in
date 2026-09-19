import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  User,
  QrCode,
  BookOpen,
  Tag,
  GraduationCap,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'open_upi' | 'navigate' | 'coupon';
    payload?: string;
    label: string;
  };
}

interface AIChatBotProps {
  onOpenUpiModal?: () => void;
  onNavigateTo?: (sectionId: string) => void;
  onOpenMockTest?: () => void;
  onOpenCart?: () => void;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({
  onOpenUpiModal,
  onNavigateTo,
  onOpenMockTest,
  onOpenCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: Message[] = [
    {
      id: 'm-1',
      sender: 'bot',
      text: "Hello! 👋 I'm **Aura**, your Nextclasses.in Academic Counselor. How can I guide your learning journey today? Feel free to ask about our courses, fees, syllabus, NEET/KEAM materials, or discount coupons.",
      timestamp: 'Just now',
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const quickQuestions = [
    'Which course is best for beginners?',
    'What is included in Claude AI course?',
    'Tell me about Languages & Public Speaking',
    'How do NEET & KEAM study materials work?',
    'What discount coupons are available?',
    'How do I pay via UPI QR code?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Intelligent local counselor knowledge base
  const generateCounselorResponse = (query: string): { text: string; action?: Message['action'] } => {
    const q = query.toLowerCase();

    if (q.includes('claude') || q.includes('anthropic') || q.includes('prompt')) {
      return {
        text: "**Master Claude AI & Advanced Prompt Engineering** is our flagship masterclass! It covers Anthropic Claude 3.7 Sonnet, Artifacts, coding full apps, document synthesis, and prompt engineering in English and Indian languages. Ideal for developers, students, and working professionals.\n\nFee: ₹999 (Discounted from ₹2,999).",
        action: {
          type: 'navigate',
          payload: 'courses',
          label: 'View Claude AI Course',
        },
      };
    }

    if (q.includes('language') || q.includes('speaking') || q.includes('english') || q.includes('french') || q.includes('german')) {
      return {
        text: "**Languages & Stage Mastery Academy** includes:\n• Spoken English & Workplace Fluency\n• Stage Confidence, Public Speaking & Debate Mastery\n• French for Beginners (A1 Level)\n• German for Beginners (A1 Level)\n\nInteractive sessions, speech recordings review, and lifetime community access included!",
        action: {
          type: 'navigate',
          payload: 'courses',
          label: 'Explore Language Programs',
        },
      };
    }

    if (q.includes('teacher') || q.includes('school') || q.includes('college teacher') || q.includes('educator')) {
      return {
        text: "**Generative AI for School & College Teachers** is designed specifically for educators. You will learn to:\n• Generate structured lesson plans in 2 minutes\n• Create auto-grading quizzes and question banks\n• Build interactive visual presentations and classroom games\n• Support regional language instruction effortlessly.",
        action: {
          type: 'navigate',
          payload: 'courses',
          label: 'View Teachers Program',
        },
      };
    }

    if (q.includes('neet') || q.includes('keam') || q.includes('iit') || q.includes('jee') || q.includes('navodaya') || q.includes('sainik') || q.includes('aissee') || q.includes('competitive')) {
      return {
        text: "Our **Competitive Exam Study Drops (2026–2027)** provide:\n• Scheduled weekly PDF question banks curated with AI\n• Previous 15 years solved paper walkthroughs\n• Interactive CBT Mock Tests with instant AI scoring\n• Covered exams: NEET UG, KEAM, IIT JEE Main, Navodaya Vidyalaya (Class 6 & 9), and AISSEE Sainik School.",
        action: {
          type: 'navigate',
          payload: 'mock-tests',
          label: 'Take Free AI Mock Test',
        },
      };
    }

    if (q.includes('fee') || q.includes('price') || q.includes('cost') || q.includes('coupon') || q.includes('discount') || q.includes('offer')) {
      return {
        text: "🎉 **Special Offer Active Today!**\nUse coupon code **`AIFUTURE`** at checkout to receive **40% INSTANT DISCOUNT** across all courses and competitive exam materials!\n\nStandard course fees range from ₹499 to ₹1,499 with lifetime updates.",
        action: {
          type: 'coupon',
          payload: 'AIFUTURE',
          label: 'Apply Coupon in Cart',
        },
      };
    }

    if (q.includes('pay') || q.includes('qr') || q.includes('upi') || q.includes('gpay') || q.includes('phonepe') || q.includes('payment')) {
      return {
        text: "You can pay instantly using our **Direct UPI QR Scan**!\n• Works with GPay, PhonePe, Paytm, BHIM, or any bank UPI app.\n• Zero transaction fees.\n• Instant access activation once your 12-digit UTR is verified.",
        action: {
          type: 'open_upi',
          label: 'Open Direct UPI QR Code',
        },
      };
    }

    if (q.includes('delivery') || q.includes('access') || q.includes('material') || q.includes('portal') || q.includes('login')) {
      return {
        text: "All enrollments receive **Instant Digital Access**! Your course dashboard, video lectures, and PDF study packs are immediately available in the **Student Learning Portal**, and dispatched to your registered email and WhatsApp.",
        action: {
          type: 'navigate',
          payload: 'portal',
          label: 'Open Student Portal',
        },
      };
    }

    if (q.includes('human') || q.includes('whatsapp') || q.includes('call') || q.includes('support') || q.includes('contact')) {
      return {
        text: "Our academic support team is available 24/7. You can connect with our human counselors directly on WhatsApp for personalized batch guidance or payment help.",
        action: {
          type: 'navigate',
          payload: 'contact',
          label: 'Contact Support Team',
        },
      };
    }

    // Default helpful general response
    return {
      text: "At **Nextclasses.in**, we offer hands-on generative AI masterclasses, language & public speaking programs, and weekly competitive exam packs (NEET, KEAM, IIT JEE, Navodaya). All courses include hands-on projects, bilingual explanations (English and Indian languages), and verified completion certificates!\n\nWould you like details on a specific course or how to enroll?",
    };
  };

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!userText) setInput('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const response = generateCounselorResponse(textToSend);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: 'Just now',
        action: response.action,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;

    if (action.type === 'open_upi') {
      if (onOpenUpiModal) onOpenUpiModal();
      setIsOpen(false);
    } else if (action.type === 'coupon') {
      if (onOpenCart) onOpenCart();
      setIsOpen(false);
    } else if (action.type === 'navigate') {
      if (action.payload === 'mock-tests' && onOpenMockTest) {
        onOpenMockTest();
      } else if (action.payload && onNavigateTo) {
        onNavigateTo(action.payload);
      }
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end print:hidden">
      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-[390px] h-[520px] max-h-[82vh] rounded-3xl bg-[#0f172a] border border-neutral-800 shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-orange-600" />
              </div>
              <div>
                <div className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>Nextclasses.in Counselor</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </div>
                <span className="text-[10px] text-orange-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Instant Admissions Help
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages(initialMessages)}
                className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-orange-100 hover:text-white transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0f1d] text-neutral-200 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-neutral-950 font-medium rounded-tr-sm shadow-md'
                        : 'bg-[#151f33] border border-[#222f48] text-neutral-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.action)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-bold text-[11px] shadow-md transition-all cursor-pointer group"
                    >
                      {msg.action.type === 'open_upi' && <QrCode className="w-3.5 h-3.5" />}
                      {msg.action.type === 'coupon' && <Tag className="w-3.5 h-3.5" />}
                      {msg.action.type === 'navigate' && <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#151f33] border border-[#222f48] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Pills */}
          <div className="p-2.5 bg-[#0e1626] border-t border-[#1e293b] overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#23314d] text-neutral-300 hover:text-white border border-[#263550] text-[11px] transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0d1422] border-t border-[#1e293b] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, fees, or study packs..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#141d2e] border border-[#27364f] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:hover:bg-orange-500 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button (NO PHONE NUMBER SHOWN) */}
      <div className="flex items-center gap-2">
        {onOpenUpiModal && (
          <button
            id="floating-upi-qr-btn"
            type="button"
            onClick={onOpenUpiModal}
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-full bg-[#121824] hover:bg-[#1a2335] text-white shadow-xl shadow-black/60 border border-[#2b3952] hover:border-orange-500/50 transition-all duration-200 cursor-pointer"
            title="Scan QR to Pay with any UPI App"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold tracking-tight hidden sm:inline text-neutral-200">
              Scan & Pay
            </span>
          </button>
        )}

        <button
          id="floating-chatbot-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-neutral-950 font-bold shadow-xl shadow-orange-950/60 hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer border border-amber-400/40"
          aria-label="Open AI Academic Advisor"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <Bot className="w-5 h-5 text-neutral-950" />
          <span className="text-xs font-black tracking-tight text-neutral-950">
            Ask AI Advisor
          </span>
        </button>
      </div>
    </div>
  );
};
