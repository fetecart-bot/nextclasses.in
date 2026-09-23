import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'open_cart' | 'navigate' | 'coupon';
    payload?: string;
    label: string;
  };
}

interface AIChatBotProps {
  onNavigateTo?: (sectionId: string) => void;
  onOpenMockTest?: () => void;
  onOpenCart?: () => void;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({
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
      text: "Hello! 👋 I'm **Aura**, your Nextclasses.in Academic Advisor. How can I guide your learning journey today? Feel free to ask about our courses, fees, syllabus, NEET/KEAM materials, or discount coupons.",
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
    'How do I checkout & enroll?',
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

    if (q.includes('sainik') || q.includes('aissee') || q.includes('rimc') || q.includes('rms')) {
      return {
        text: "**AISSEE 2027 Sainik School Entrance Success Kit**:\n• Comprehensive preparation for Class 6 & Class 9\n• All 5 subjects: Math (150m), Intelligence, English, GK, General Science\n• Weekly video drops + 10 full-length CBT mock tests with instant scoring and negative marking.\n\nEverything is accessible right inside your student portal!",
        action: {
          type: 'navigate',
          payload: 'courses',
          label: 'View AISSEE Sainik Kit',
        },
      };
    }

    if (q.includes('neet') || q.includes('keam') || q.includes('jee') || q.includes('exam') || q.includes('competitive')) {
      return {
        text: "Our **Competitive Exam Study Materials** provide complete syllabus coverage for NEET UG, KEAM Engineering & Medical, and JEE Mains with high-yield formula sheets, chapterwise question vaults, and simulated online CBT tests.",
        action: {
          type: 'navigate',
          payload: 'courses',
          label: 'Explore Exam Preparation Kits',
        },
      };
    }

    if (q.includes('mock') || q.includes('test') || q.includes('practice') || q.includes('cbt')) {
      return {
        text: "We provide an **Interactive CBT Mock Test Simulation Platform** modeled exactly after NTA and AISSEE exams with real-time timers, question palettes, and automated score cards.",
        action: {
          type: 'navigate',
          payload: 'mock-tests',
          label: 'Launch Free CBT Mock Test',
        },
      };
    }

    if (q.includes('coupon') || q.includes('discount') || q.includes('offer') || q.includes('code')) {
      return {
        text: "🎉 Exclusive Special Discount Codes:\n• Use coupon **AIFUTURE** at checkout for **40% OFF** your entire order!\n• Use **NEXTCLASS20** for an instant 20% discount on all courses.",
        action: {
          type: 'coupon',
          payload: 'AIFUTURE',
          label: 'Apply Coupon in Cart',
        },
      };
    }

    if (q.includes('pay') || q.includes('qr') || q.includes('upi') || q.includes('gpay') || q.includes('phonepe') || q.includes('payment') || q.includes('razorpay') || q.includes('checkout') || q.includes('enroll')) {
      return {
        text: "We offer secure online checkout via **Razorpay Secure Gateway**!\n• Supports UPI (Google Pay, PhonePe, Paytm, CRED, BHIM), Debit & Credit Cards, and Net Banking.\n• Zero transaction charges & instant automated portal activation.\n• Enter your mobile number & email in the cart drawer to initiate checkout.",
        action: {
          type: 'open_cart',
          label: 'Open Cart & Checkout',
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

    if (q.includes('human') || q.includes('whatsapp') || q.includes('support') || q.includes('contact') || q.includes('call') || q.includes('phone')) {
      return {
        text: "Our academic counselor desk is available directly on WhatsApp at **+91 82816 44058** and email at **support@nextclasses.in** for personalized guidance, admissions, or technical assistance.",
        action: {
          type: 'navigate',
          payload: 'contact',
          label: 'Contact Support Team',
        },
      };
    }

    // Default helpful general response
    return {
      text: "I'm here to assist you with everything at **Nextclasses.in**:\n• AI Masterclasses (Claude, Gemini, ChatGPT)\n• AISSEE Sainik School, NEET & KEAM Exam Kits\n• Languages & Public Speaking\n• Mock CBT Test Series\n\nWhat would you like to explore?",
      action: {
        type: 'navigate',
        payload: 'courses',
        label: 'Browse All Courses',
      },
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCounselorResponse(query);
      const botMessage: Message = {
        id: `b-${Date.now()}`,
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

    if (action.type === 'open_cart') {
      if (onOpenCart) onOpenCart();
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
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-orange-600" />
              </div>
              <div>
                <div className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>Aura • Nextclasses AI Advisor</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-200" />
                </div>
                <div className="text-[10px] text-orange-100 font-medium">
                  Instant Course & Syllabus Guidance
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#0b1220]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-orange-500 text-neutral-950 font-medium rounded-br-none'
                      : 'bg-[#152136] border border-[#223352] text-neutral-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.action && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.action)}
                      className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{m.action.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[9px] opacity-60 block text-right mt-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-neutral-400">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#152136] border border-[#223352] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-[#090e18] border-t border-[#1e293b] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#152136] hover:bg-[#1f2f4c] text-neutral-300 text-[10px] font-medium border border-[#243553] transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
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

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
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
