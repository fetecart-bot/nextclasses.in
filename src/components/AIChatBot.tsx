import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);

  const initialMessages: Message[] = [
    {
      id: 'm-1',
      sender: 'bot',
      text: "Hello! 👋 I'm **Aura**, your real-time NextClasses Academic Advisor & Counselor. Ask me anything about our NEET (UG) 2027 weekly physical study dispatches, KEAM & IIT JEE syllabus, Sainik School entrance, AI masterclasses, or fees! You can also tap the 🎙️ mic to speak directly with me in real time.",
      timestamp: 'Just now',
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const quickQuestions = [
    'How do NEET weekly dispatches work?',
    'Does KEAM course include Chemistry?',
    'Tell me about Sainik School Class 6 & 9 Kit',
    'Which AI course is best for beginners?',
    'What fees and discount coupons are available?',
    'How do I speak with a human counselor?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudioPlayback = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentlyPlayingId(null);
  };

  const fallbackServerTTS = (cleanText: string, messageId?: string) => {
    try {
      const audioUrl = `/api/voice-receptionist/tts?text=${encodeURIComponent(cleanText.slice(0, 350))}&lang=en`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setIsSpeaking(true);
      if (messageId) setCurrentlyPlayingId(messageId);

      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentlyPlayingId(null);
        currentAudioRef.current = null;
      };
      audio.onerror = (e) => {
        console.warn('Server TTS playback error:', e);
        setIsSpeaking(false);
        setCurrentlyPlayingId(null);
        currentAudioRef.current = null;
      };
      audio.play().catch((err) => {
        console.warn('Audio auto-play policy prevented playback:', err);
        setIsSpeaking(false);
        setCurrentlyPlayingId(null);
      });
    } catch (e) {
      console.warn('Fallback server TTS error:', e);
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    }
  };

  const speakText = (text: string, messageId?: string) => {
    if (!voiceEnabled || !text) return;
    stopAudioPlayback();

    // Clean markdown, links, asterisks, bullet points
    const clean = text
      .replace(/[*#_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim()
      .slice(0, 300);

    if (!clean) return;

    // Strategy 1: Browser Web Speech API with SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-IN';
        utterance.pitch = 1.05;
        utterance.rate = 1.0;

        // Try to pick a clear Indian English or natural voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const match = voices.find(
            (v) =>
              v.lang.includes('IN') ||
              v.name.toLowerCase().includes('india') ||
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('google')
          );
          if (match) utterance.voice = match;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          if (messageId) setCurrentlyPlayingId(messageId);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentlyPlayingId(null);
        };
        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error, falling back to server TTS:', e);
          setIsSpeaking(false);
          fallbackServerTTS(clean, messageId);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Web Speech API error, falling back to server TTS:', err);
      }
    }

    // Strategy 2: Dedicated high-fidelity Server TTS endpoint fallback
    fallbackServerTTS(clean, messageId);
  };

  const startAudioRecording = async () => {
    stopAudioPlayback();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 500) return;

        setIsTyping(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const res = await fetch('/api/voice-transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: 'audio/webm',
                language: 'en',
              }),
            });
            const data = await res.json();
            if (data?.transcript?.trim()) {
              setInput(data.transcript);
              handleSend(data.transcript.trim());
            } else {
              setIsTyping(false);
            }
          };
        } catch (err) {
          console.error('Audio transcription error:', err);
          setIsTyping(false);
        }
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setIsListening(true);
    } catch (err) {
      console.warn('Microphone error:', err);
      setIsRecordingAudio(false);
      setIsListening(false);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    setIsListening(false);
  };

  const startVoiceListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      startAudioRecording();
      return;
    }

    stopAudioPlayback();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      let recognizedSoFar = '';

      recognition.onstart = () => {
        setIsListening(true);
        recognizedSoFar = '';
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        recognizedSoFar = fullTranscript;
        setInput(fullTranscript);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          const text = recognizedSoFar.trim();
          if (text) {
            try { recognition.stop(); } catch {}
            setIsListening(false);
            recognizedSoFar = '';
            handleSend(text);
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'audio-capture' || event.error === 'service-not-allowed') {
          setIsListening(false);
          startAudioRecording();
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (recognizedSoFar.trim()) {
          const text = recognizedSoFar.trim();
          recognizedSoFar = '';
          handleSend(text);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition, falling back to audio recording:', err);
      startAudioRecording();
    }
  };

  const stopVoiceListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (isRecordingAudio) {
      stopAudioRecording();
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    stopAudioPlayback();

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Real-time call to Gemini 3.8 Flash counselor endpoint
      const response = await fetch('/api/counselor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data?.error || 'Failed to get counselor response');
      }

      // Check if action buttons are relevant
      const qLower = query.toLowerCase();
      let action: Message['action'] = undefined;
      if (qLower.includes('enroll') || qLower.includes('cart') || qLower.includes('buy') || qLower.includes('fee') || qLower.includes('pay')) {
        action = { type: 'open_cart', label: 'View Cart & Instant Enroll' };
      } else if (qLower.includes('mock') || qLower.includes('test')) {
        action = { type: 'navigate', payload: 'mock-tests', label: 'Try Free CBT Mock Test' };
      } else if (qLower.includes('course') || qLower.includes('neet') || qLower.includes('sainik') || qLower.includes('keam')) {
        action = { type: 'navigate', payload: 'courses', label: 'Explore Course Catalog' };
      }

      const botMessage: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: 'Just now',
        action,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      speakText(data.reply, botMessage.id);
    } catch (err: any) {
      console.warn('Real-time counselor error, using fallback:', err);
      // Fallback
      const botMessage: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: `At NextClasses.in, our courses include weekly physical study kits dispatched to your doorstep, lifetime video lessons, chapterwise mock tests, and WhatsApp faculty helpline (+91 82816 44058). For your query "${query}", we are happy to guide you!`,
        timestamp: 'Just now',
        action: { type: 'navigate', payload: 'courses', label: 'Browse Courses' },
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      speakText(botMessage.text, botMessage.id);
    }
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;

    if (action.type === 'open_cart' || action.type === 'coupon') {
      if (onOpenCart) onOpenCart();
      setIsOpen(false);
    } else if (action.type === 'navigate') {
      if (action.payload === 'mock-tests' && onOpenMockTest) {
        onOpenMockTest();
        setIsOpen(false);
      } else if (onNavigateTo && action.payload) {
        onNavigateTo(action.payload);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          id="advisor-chat-window"
          className="w-[92vw] sm:w-[390px] h-[540px] max-h-[85vh] rounded-3xl bg-[#0b111e] border border-[#1e2c47] shadow-2xl flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-neutral-950 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-neutral-950/20 backdrop-blur-sm border border-neutral-950/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-neutral-950" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-orange-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight text-neutral-950 flex items-center gap-1.5">
                  Aura AI Advisor
                  <span className="text-[10px] bg-neutral-950/20 px-1.5 py-0.5 rounded-full font-bold">
                    Real-Time
                  </span>
                </h4>
                <p className="text-[11px] font-medium text-neutral-900/90">
                  {isListening ? '🎙️ Listening to you...' : isSpeaking ? '🔊 Speaking...' : 'Online • Powered by Gemini 3.8'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-xl text-neutral-950 hover:bg-black/10 transition-colors cursor-pointer ${!voiceEnabled ? 'opacity-50' : ''}`}
                title={voiceEnabled ? 'Voice output active' : 'Voice output muted'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  stopAudioPlayback();
                }}
                className="p-1.5 rounded-xl text-neutral-950 hover:bg-black/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0b101c]/95">
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
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-orange-500 text-neutral-950 font-medium rounded-tr-sm'
                      : 'bg-[#152136] text-neutral-200 border border-[#223352] rounded-tl-sm space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.action && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.action)}
                      className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-[11px] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{m.action.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/5">
                    {m.sender === 'bot' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (currentlyPlayingId === m.id) {
                            stopAudioPlayback();
                          } else {
                            speakText(m.text, m.id);
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          currentlyPlayingId === m.id
                            ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                        }`}
                        title="Listen to vocal answer"
                      >
                        {currentlyPlayingId === m.id ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-current text-orange-400" />
                            <span>Stop voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-2.5 h-2.5 text-orange-400" />
                            <span>Listen voice</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}
                    <span className="text-[9px] opacity-60">
                      {m.timestamp}
                    </span>
                  </div>
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

          {/* Live Listening Feedback Banner */}
          {isListening && (
            <div className="px-3 py-1.5 bg-orange-500/10 border-t border-orange-500/30 flex items-center justify-between text-[11px] text-orange-300 animate-pulse">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                Listening now... Speak your question clearly
              </span>
              <button
                type="button"
                onClick={stopVoiceListening}
                className="px-2 py-0.5 rounded bg-orange-500 text-neutral-950 font-bold text-[10px]"
              >
                Done
              </button>
            </div>
          )}

          {/* Chat Input with Voice STT */}
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
              placeholder="Ask anything, or tap the mic to speak..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#141d2e] border border-[#27364f] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            
            {/* Microphone Button */}
            <button
              type="button"
              onClick={isListening ? stopVoiceListening : startVoiceListening}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                  : 'bg-[#152136] border-[#223352] text-orange-400 hover:bg-orange-500/20'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
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
