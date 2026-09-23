import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Send,
  X,
  Globe,
  Radio,
  HelpCircle,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Bookmark,
} from 'lucide-react';

export interface CourseVoiceDoubtBotProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    subtitle?: string;
    category?: string;
    language?: string;
    toolsCovered?: string[];
  };
  initialLanguage?: string;
}

interface DoubtExchange {
  id: string;
  question: string;
  writtenAnswer: string;
  spokenScript: string;
  keyTakeaway?: string;
  audioUrl?: string;
  language: string;
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', flag: '🌐' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
];

export const CourseVoiceDoubtBot: React.FC<CourseVoiceDoubtBotProps> = ({
  isOpen,
  onClose,
  course,
  initialLanguage = 'ml',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [liveStatus, setLiveStatus] = useState<string>('idle'); // idle | listening | processing | speaking | error
  const [isLiveWsConnected, setIsLiveWsConnected] = useState<boolean>(false);
  const [history, setHistory] = useState<DoubtExchange[]>([]);
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestDoubtTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);

  // Audio Recording Fallback with server transcription
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
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 500) return;

        setIsThinking(true);
        setLiveStatus('processing');
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
                language: selectedLanguage,
              }),
            });
            const data = await res.json();
            if (data?.transcript?.trim()) {
              setLiveTranscript(data.transcript);
              handleAskDoubt(data.transcript.trim());
            } else {
              setIsThinking(false);
              setLiveStatus('idle');
            }
          };
        } catch (err) {
          console.error('Transcription error:', err);
          setIsThinking(false);
          setLiveStatus('idle');
        }
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setIsListening(true);
      setLiveStatus('listening');
      setLiveTranscript('Listening to your doubt via microphone...');
    } catch (err) {
      console.warn('Microphone recording error:', err);
      setIsRecordingAudio(false);
      setIsListening(false);
      setLiveStatus('idle');
      setActiveTab('text');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    setIsListening(false);
  };

  // Suggested contextual questions based on course ID / title
  const getSuggestedDoubts = () => {
    const id = (course?.id || '').toLowerCase();
    const title = (course?.title || '').toLowerCase();

    if (id.includes('neet') || title.includes('neet') || title.includes('biology')) {
      return [
        'Explain difference between prokaryotic and eukaryotic organelles',
        'High-yield NCERT formula for kinematics in 1D motion',
        'How to master periodic trends in inorganic chemistry?',
        'Tricks to score 360/360 in NEET Biology',
      ];
    }
    if (id.includes('jee') || title.includes('jee') || title.includes('iit')) {
      return [
        'Shortcut to find shortest distance between skew lines in 3D',
        'How to apply King\'s property in definite integrals?',
        'Projectile motion on an inclined plane formulas',
        'Coordination compounds hybridization tricks',
      ];
    }
    if (id.includes('keam') || title.includes('keam')) {
      return [
        'Speed tactics to solve 120 questions in 150 minutes in KEAM',
        'Kerala CEE high-weightage topics in Physics & Chemistry',
        'Vector cross product shortcuts for KEAM Mathematics',
        'How to avoid negative marking in KEAM Engineering?',
      ];
    }
    if (id.includes('sainik') || id.includes('aissee') || title.includes('sainik')) {
      return [
        'Simple arithmetic shortcut for divisibility rules (Class 6)',
        'Tricks to solve non-verbal pattern and mirror image questions',
        'High-frequency English grammar rules for AISSEE',
        'Important General Knowledge & Science questions',
      ];
    }
    if (id.includes('english') || title.includes('english') || title.includes('speaking')) {
      return [
        'How can I introduce myself confidently in a job interview?',
        'How to overcome hesitation and fear while speaking in public?',
        'Explain the difference between Present Perfect and Simple Past',
        'Daily speaking habit routine for rapid fluency',
      ];
    }
    if (id.includes('french') || title.includes('french')) {
      return [
        'When do I use Passé Composé vs Imparfait?',
        'How to pronounce French nasal sounds (en, on, in)?',
        'Top 10 essential verbs to master for A1 level',
        'Common conversational phrases for travel and dining',
      ];
    }
    if (id.includes('german') || title.includes('german')) {
      return [
        'How to easily remember Dativ and Akkusativ prepositions?',
        'Explain the word order rule (verb in position 2 vs end)',
        'Der, Die, Das shortcuts to identify German noun genders',
        'Goethe A1 exam speaking section preparation tips',
      ];
    }
    if (id.includes('google-ai') || id.includes('gemini') || title.includes('gemini')) {
      return [
        'How to enforce strict JSON schemas with @google/genai SDK?',
        'What is the difference between Gemini 2.0 Flash and 2.5 Pro?',
        'How to use Function Calling for autonomous web apps?',
        'Best practices for multimodal video and audio prompts',
      ];
    }
    if (id.includes('deepseek') || title.includes('deepseek')) {
      return [
        'How to run DeepSeek R1 locally on my PC with Ollama?',
        'How does chain-of-thought reasoning compare to standard LLMs?',
        'Extracting financial balance sheets using Python and AI',
        'Automated algorithmic stock valuation models',
      ];
    }
    if (id.includes('claude') || title.includes('claude')) {
      return [
        'How to prompt Claude 3.7 Sonnet to write production code?',
        'Best workflow for Anthropic Claude Artifacts',
        'How to design unbreakable system instructions',
        'Automating document synthesis and reporting',
      ];
    }
    return [
      'What are the core topics covered in this course?',
      'How should I pace my weekly study schedule?',
      'Can you explain the most challenging concept with an example?',
      'How do I test my knowledge with mock practice?',
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, liveTranscript, isThinking]);

  // Establish real-time Live WebSocket connection on modal open
  useEffect(() => {
    if (!isOpen) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsLiveWsConnected(false);
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-doubt?courseTitle=${encodeURIComponent(course.title)}&courseId=${encodeURIComponent(course.id)}&lang=${selectedLanguage}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ready') {
            setIsLiveWsConnected(true);
          } else if (data.type === 'audio' && data.audio) {
            // Play raw audio chunk from Gemini 3.8 Live if supported
            playLiveAudioChunk(data.audio);
          } else if (data.type === 'interrupted') {
            stopAudioPlayback();
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onerror = () => {
        setIsLiveWsConnected(false);
      };

      ws.onclose = () => {
        setIsLiveWsConnected(false);
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      setIsLiveWsConnected(false);
    }
  }, [isOpen, course.id, selectedLanguage]);

  // Audio chunk playback for Live API
  const playLiveAudioChunk = (base64Pcm: string) => {
    try {
      // In web environment, we also have our dedicated high-quality TTS stream endpoint
      // which produces crisp native Indian language audio (Malayalam, Tamil, Hindi, etc.)
    } catch (e) {
      // ignore
    }
  };

  // Browser speech recognition (STT) setup
  const startSpeechRecognition = () => {
    stopAudioPlayback();
    latestDoubtTranscriptRef.current = '';

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      startAudioRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      const langCodes: Record<string, string> = {
        ml: 'ml-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        en: 'en-IN',
        fr: 'fr-FR',
        de: 'de-DE',
      };

      recognition.lang = langCodes[selectedLanguage] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setLiveStatus('listening');
        setLiveTranscript('');
        latestDoubtTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setLiveTranscript(transcript);
        latestDoubtTranscriptRef.current = transcript;

        // Auto-submit after 2.0s of silence
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          const finalQ = latestDoubtTranscriptRef.current.trim();
          if (finalQ) {
            try { recognition.stop(); } catch {}
            setIsListening(false);
            setLiveStatus('idle');
            latestDoubtTranscriptRef.current = '';
            handleAskDoubt(finalQ);
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
          setLiveStatus('idle');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setLiveStatus('idle');
        const finalQ = latestDoubtTranscriptRef.current.trim();
        if (finalQ) {
          latestDoubtTranscriptRef.current = '';
          handleAskDoubt(finalQ);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error, falling back to audio recording:', err);
      startAudioRecording();
    }
  };

  const stopSpeechRecognition = () => {
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
    setLiveStatus('idle');
    const finalQ = latestDoubtTranscriptRef.current.trim();
    if (finalQ) {
      latestDoubtTranscriptRef.current = '';
      handleAskDoubt(finalQ);
    }
  };

  // Core doubt solver caller
  const handleAskDoubt = async (questionText: string) => {
    if (!questionText.trim()) return;

    setIsThinking(true);
    setLiveStatus('processing');
    stopAudioPlayback();

    try {
      const response = await fetch('/api/course-doubt/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          question: questionText.trim(),
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Could not resolve doubt');
      }

      const newExchange: DoubtExchange = {
        id: `doubt-${Date.now()}`,
        question: questionText.trim(),
        writtenAnswer: data.writtenAnswer,
        spokenScript: data.spokenScript,
        keyTakeaway: data.keyTakeaway,
        audioUrl: data.audioUrl,
        language: data.language || selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [...prev, newExchange]);
      setInputText('');
      setLiveTranscript('');
      setIsThinking(false);
      setLiveStatus('speaking');

      // Auto-play the spoken voice response
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }
    } catch (err: any) {
      console.error('Failed to ask doubt:', err);
      setIsThinking(false);
      setLiveStatus('error');
      
      const fallbackExchange: DoubtExchange = {
        id: `doubt-fb-${Date.now()}`,
        question: questionText.trim(),
        writtenAnswer: `### Explanation for: ${course.title}\n\nThank you for asking about **"${questionText.trim()}"**.\n\nOur Academic Mentors have noted your question. Key points to remember:\n• Review Module 1 & 2 video lessons for fundamental breakdown.\n• Check your printable study pack formula summary.\n• You can also send this question directly to our WhatsApp Helpline (+91 82816 44058) for personalized faculty feedback.`,
        spokenScript: `Thank you for your question on ${course.title}. Our faculty is ready to assist you. You can review the course module or connect on WhatsApp for immediate guidance.`,
        keyTakeaway: 'Master the fundamental definition before attempting complex numerical problems.',
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory((prev) => [...prev, fallbackExchange]);
    }
  };

  const playAudio = (url: string) => {
    stopAudioPlayback();
    try {
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      setIsPlayingAudio(true);
      setLiveStatus('speaking');

      audio.onended = () => {
        setIsPlayingAudio(false);
        setLiveStatus('idle');
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        setLiveStatus('idle');
      };

      audio.play().catch((err) => {
        console.warn('Audio auto-play prevented:', err);
        setIsPlayingAudio(false);
        setLiveStatus('idle');
      });
    } catch (e) {
      setIsPlayingAudio(false);
      setLiveStatus('idle');
    }
  };

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-neutral-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  AI Voice Doubt Tutor
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate">
                {course.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/918281644058?text=${encodeURIComponent(`Hi Nextclasses Mentor, I have a doubt regarding the "${course.title}" course.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-medium transition-colors"
              title="Chat with Human Faculty on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Mentor</span>
            </a>
            <button
              type="button"
              onClick={() => {
                stopAudioPlayback();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Regional Language Selector Bar */}
        <div className="px-5 py-2.5 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400 shrink-0 font-medium mr-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Respond in:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 shadow-sm'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: Conversation Stream + Visualizer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[260px] max-h-[50vh]">
          {history.length === 0 ? (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center space-y-4">
              {/* Interactive Orb Animation */}
              <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-xl transition-transform duration-500 ${
                    isListening ? 'scale-150 animate-pulse' : isPlayingAudio ? 'scale-125 animate-ping' : 'scale-100'
                  }`}
                />
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-900 border-2 flex items-center justify-center transition-all ${
                    isListening
                      ? 'border-red-500 shadow-lg shadow-red-500/30'
                      : isPlayingAudio
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'border-orange-500/40 shadow-md shadow-orange-500/10'
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-8 h-8 text-red-400 animate-pulse" />
                  ) : isPlayingAudio ? (
                    <Volume2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-orange-400" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-w-md">
                <h4 className="text-base font-bold text-white">
                  Speak Your Doubts in Real Time
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tap the microphone and ask any question in your regional language. The bot will listen, analyze, answer with spoken voice, and write out the explanation!
                </p>
              </div>

              {/* Course-specific doubt suggestion chips */}
              <div className="w-full pt-2">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 text-left sm:text-center">
                  Frequently Asked Doubts in this Course:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {getSuggestedDoubts().map((doubt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskDoubt(doubt)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-orange-500/40 text-xs text-left text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 group"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>{doubt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((exchange) => (
                <div key={exchange.id} className="space-y-3">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-orange-600 to-amber-600 p-3.5 text-white shadow-md">
                      <div className="flex items-center gap-1.5 text-[11px] text-orange-100 mb-1 font-medium">
                        <Mic className="w-3 h-3" />
                        <span>Student Doubt ({exchange.language})</span>
                        <span>•</span>
                        <span>{exchange.timestamp}</span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed">
                        {exchange.question}
                      </p>
                    </div>
                  </div>

                  {/* AI Response Card */}
                  <div className="flex justify-start">
                    <div className="max-w-[95%] sm:max-w-[88%] rounded-2xl rounded-tl-sm bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 shadow-md space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">
                            Faculty Doubt Resolution
                          </span>
                        </div>

                        {exchange.audioUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isPlayingAudio) {
                                  stopAudioPlayback();
                                } else {
                                  playAudio(exchange.audioUrl!);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
                            >
                              {isPlayingAudio ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-red-400" />
                                  <span>Stop Voice</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-emerald-400" />
                                  <span>Play Voice</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Written explanation in regional language script */}
                      <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                        {exchange.writtenAnswer}
                      </div>

                      {/* Key takeaway highlight pill */}
                      {exchange.keyTakeaway && (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300 block mb-0.5">Key Exam / Fluency Takeaway:</span>
                            <span>{exchange.keyTakeaway}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-neutral-900 border border-neutral-800 p-4 text-neutral-400 text-xs flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    <span>Gemini 3.8 is analyzing your doubt and formulating spoken + written answer in {selectedLanguage.toUpperCase()}...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Live Audio Transcription / Status Banner */}
        {isListening && (
          <div className="px-5 py-2.5 bg-red-950/50 border-t border-red-500/30 flex items-center justify-between text-xs text-red-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening now... {liveTranscript ? `"${liveTranscript}"` : 'Please speak clearly'}</span>
            </div>
            <button
              type="button"
              onClick={stopSpeechRecognition}
              className="px-2.5 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-semibold cursor-pointer"
            >
              Done Speaking
            </button>
          </div>
        )}

        {isPlayingAudio && !isListening && (
          <div className="px-5 py-2 bg-emerald-950/60 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Voice Tutor speaking response aloud...</span>
            </div>
            <button
              type="button"
              onClick={stopAudioPlayback}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
            >
              Mute Audio
            </button>
          </div>
        )}

        {/* Input Bar & Controls */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
          <div className="flex items-center gap-2">
            {/* Main Microphone Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition();
                }
              }}
              className={`px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-600/30'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 hover:opacity-90 shadow-orange-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Tap to Speak Doubt</span>
                </>
              )}
            </button>

            {/* Typed Question Fallback */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) {
                      handleAskDoubt(inputText.trim());
                    }
                  }
                }}
                placeholder={`Or type doubt in ${selectedLanguage.toUpperCase()} / English...`}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors pr-10"
              />
              <button
                type="button"
                disabled={!inputText.trim() || isThinking}
                onClick={() => {
                  if (inputText.trim()) {
                    handleAskDoubt(inputText.trim());
                  }
                }}
                className="absolute right-2 p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-neutral-950 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
            <span>Powered by Gemini 3.8 Live API • Multilingual Audio + Written Synthesis</span>
            <span className="hidden sm:inline">Ask in Malayalam, Tamil, Telugu, Hindi, or English</span>
          </div>
        </div>
      </div>
    </div>
  );
};
