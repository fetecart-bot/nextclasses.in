import React, { useState, useEffect, useRef } from 'react';
import { getComprehensiveCounselorAnswer, SupportedLanguage } from '../data/counselorKnowledge';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  MessageSquare,
  Bot,
  User,
  Settings,
  HelpCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Languages,
  Globe,
  Copy,
  Check,
} from 'lucide-react';

export type VoiceLanguageCode = 'en' | 'ml' | 'ta' | 'te' | 'kn' | 'hi';

export interface VoiceLanguageConfig {
  code: VoiceLanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  recognitionLang: string;
  ttsLangPrefix: string;
  azureVoice: string;
  samplePhrase: string;
  welcomeMessage: string;
  quickChips: string[];
}

export const VOICE_LANGUAGES: Record<VoiceLanguageCode, VoiceLanguageConfig> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English (IN)',
    flag: '🇮🇳',
    recognitionLang: 'en-IN',
    ttsLangPrefix: 'en',
    azureVoice: 'en-IN-NeerjaNeural',
    samplePhrase: 'Namaste! I am Priya, your academic advisor at NextClass.',
    welcomeMessage: 'Namaste! Welcome to NextClass AI Academy. I am Priya, your senior academic counselor. I can provide complete details on our Google AI Studio, DeepSeek R1 Finance, Real-Time Voice AI, and Sainik School prep programs, along with fees, verifiable certificates, and UPI admission. How may I guide you today?',
    quickChips: [
      'Full Details on All Courses',
      'DeepSeek R1 Course & Fees',
      'Voice AI & Vapi Telephony',
      'Google AI Studio Course',
      'Do I get a verified certificate?',
      'Sainik School & NEET Prep',
      'How do I pay via UPI QR?',
    ],
  },
  ml: {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    flag: '🌴',
    recognitionLang: 'ml-IN',
    ttsLangPrefix: 'ml',
    azureVoice: 'ml-IN-SobhanaNeural',
    samplePhrase: 'നമസ്കാരം! ഞാൻ പ്രിയ, നെക്സ്റ്റ്ക്ലാസ് അക്കാദമിയിൽ നിന്നാണ്.',
    welcomeMessage: 'നമസ്കാരം! നെക്സ്റ്റ്ക്ലാസ് എഐ അക്കാദമിയിലേക്ക് സ്വാഗതം. ഞാൻ പ്രിയ, സീനിയർ അക്കാദമിക് കൗൺസിലർ. ഗൂഗിൾ എഐ, ഡീപ്സീക്ക് R1 ഫിനാൻസ്, റിയൽ-ടൈം വോയ്സ് എഐ, സൈനിക് സ്കൂൾ പ്രവേശന പരീക്ഷകൾ എന്നിവയെക്കുറിച്ചുള്ള എല്ലാ വിവരങ്ങളും ഞാൻ നൽകാം. എന്താണ് അറിയാൻ ആഗ്രഹിക്കുന്നത്?',
    quickChips: [
      'എല്ലാ കോഴ്സുകളുടെയും പൂർണ്ണ വിവരങ്ങൾ',
      'ഡീപ്സീക്ക് R1 കോഴ്സ് ഫീസ്?',
      'വോയ്സ് എഐ കോഴ്സ് വിവരങ്ങൾ',
      'ഗൂഗിൾ എഐ സ്റ്റുഡിയോ കോഴ്സ്',
      'വെരിഫൈഡ് സർട്ടിഫിക്കറ്റ് ലഭിക്കുമോ?',
      'സൈനിക് സ്കൂൾ / നീറ്റ് പരീക്ഷകൾ',
      'യുപിഐ വഴി എങ്ങനെ പണമടയ്ക്കാം?',
    ],
  },
  ta: {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    flag: '🛕',
    recognitionLang: 'ta-IN',
    ttsLangPrefix: 'ta',
    azureVoice: 'ta-IN-PallaviNeural',
    samplePhrase: 'வணக்கம்! நான் பிரியா, நெக்ஸ்ட்கிளாஸ் அகாடமி ஆலோசகர்.',
    welcomeMessage: 'வணக்கம்! நெக்ஸ்ட்கிளாஸ் ஏஐ அகாடமிக்கு வரவேற்கிறோம். நான் பிரியா, சீனியர் கல்வி ஆலோசகர். கூகிள் ஏഐ, டீப்ஸீக் R1, வாய்ஸ் ஏഐ மற்றும் சைனிக் பள்ளி நுழைவுத் தேர்வு கோர்ஸ்கள் குறித்த முழு விவரங்களையும் கட்டணங்களையும் உங்களுக்கு விளக்க தயாராக உள்ளேன். எதை பற்றி அறிய விரும்புகிறீர்கள்?',
    quickChips: [
      'அனைத்து கோர்ஸ்களின் முழு விவரங்கள்',
      'டீப்ஸீக் ஆர்1 கோர்ஸ் கட்டணம்',
      'வாய்ஸ் ஏஐ & வாபி தகவல்கள்',
      'சான்றிதழ் கிடைக்குமா?',
      'கோர்ஸ் கால அளவு என்ன?',
      'யுபிஐ மூலம் பணம் செலுத்துவது எப்படி?',
    ],
  },
  te: {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    flag: '🏛️',
    recognitionLang: 'te-IN',
    ttsLangPrefix: 'te',
    azureVoice: 'te-IN-ShrutiNeural',
    samplePhrase: 'నమస్కారం! నేను ప్రియ, నెక్స్ట్‌క్లాస్ అకాడమీ అడ్వైజర్.',
    welcomeMessage: 'నమస్కారం! నెక్స్ట్‌క్లాస్ ఏఐ అకాడమీకి స్వాగతం. నేను ప్రియ, సీనియర్ అకాడమిక్ కౌన్సెలర్. గూగుల్ ఏఐ, డీప్‌సీక్ R1 ఫైనాన్షియల్ మోడలింగ్, వాయిస్ ఏഐ మరియు సైనిక్ స్కూల్ పరీక్షల పూర్తి వివరాలు మరియు ఫీజుల గురించి నేను మీకు మార్గదర్శనం చేస్తాను. దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?',
    quickChips: [
      'అన్ని కోర్సుల పూర్తి వివరాలు',
      'డీప్‌సీక్ ఆర్1 కోర్సు ఫీజు ఎంత?',
      'వాయిస్ ఏఐ టెలిఫోనీ కోర్సు',
      'సర్టిఫికేట్ ఎలా వస్తుంది?',
      'యూపీఐ ద్వారా చెల్లింపు ఎలా చేయాలి?',
    ],
  },
  kn: {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    flag: '🌺',
    recognitionLang: 'kn-IN',
    ttsLangPrefix: 'kn',
    azureVoice: 'kn-IN-SapnaNeural',
    samplePhrase: 'ನಮಸ್ಕಾರ! ನಾನು ಪ್ರಿಯಾ, ನೆಕ್ಸ್ಟ್‌ಕ್ಲಾಸ್ ಅಕಾಡೆಮಿಯ ಅಡ್ವೈಸರ್.',
    welcomeMessage: 'ನಮಸ್ಕಾರ! ನೆಕ್ಸ್ಟ್‌ಕ್ಲಾಸ್ ಎಐ ಅಕಾಡೆಮಿಗೆ ಸ್ವಾಗತ. ನಾನು ಪ್ರಿಯಾ, ಸೀನಿಯರ್ ಅಕಾಡೆಮಿಕ್ ಕೌನ್ಸಿಲರ್. ಗೂಗಲ್ ಎಐ, ಡೀಪ್‌ಸೀಕ್ R1, ವಾಯ್ಸ್ ಎಐ ಮತ್ತು ಸೈನಿಕ ಸ್ಕೂಲ್ ಪ್ರವೇಶ ಪರೀಕ್ಷಾ ತರಬೇತಿಯ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ ಮತ್ತು ಶುಲ್ಕದ ವಿವರಗಳನ್ನು ನೀಡಲು ಸಿದ್ಧಳಾಗಿದ್ದೇನೆ. ನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    quickChips: [
      'ಎಲ್ಲಾ ಕೋರ್ಸ್‌ಗಳ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ',
      'ಡೀಪ್‌ಸೀಕ್ ಕೋರ್ಸ್ ಶುಲ್ಕ ಎಷ್ಟು?',
      'ವಾಯ್ಸ್ ಎಐ ಕೋರ್ಸ್ ಮಾಹಿತಿ',
      'ಸರ್ಟಿಫಿಕೇಟ್ ಸಿಗುತ್ತದೆಯೇ?',
      'ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸುವುದು ಹೇಗೆ?',
    ],
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी',
    flag: '🪷',
    recognitionLang: 'hi-IN',
    ttsLangPrefix: 'hi',
    azureVoice: 'hi-IN-SwaraNeural',
    samplePhrase: 'नमस्ते! मैं प्रिया हूँ, नेक्स्टक्लास अकादमी की सीनियर काउंसलर।',
    welcomeMessage: 'नमस्ते! नेक्स्टक्लास एआई अकादमी में आपका स्वागत है। मैं प्रिया हूँ, आपकी सीनियर एकेडमिक काउंसलर। गूगल एआई स्टूडियो, डीपसीक R1 फाइनेंस, रियल-टाइम वॉइस एआई और सैनिक स्कूल प्रवेश परीक्षा की पूरी जानकारी, फीस और वेरिफाइड सर्टिफिकेट के बारे में आप मुझसे पूछ सकते हैं। आप किस बारे में जानना चाहते हैं?',
    quickChips: [
      'सभी कोर्सेज़ की पूरी जानकारी',
      'डीपसीक R1 कोर्स की फीस कितनी है?',
      'वॉइस एआई और टेलीफोनी कोर्स',
      'क्या वेरिफाइड सर्टिफिकेट मिलेगा?',
      'यूपीआई से पेमेंट कैसे करें?',
    ],
  },
};

interface VoiceReceptionistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo?: (sectionId: string) => void;
  onOpenUpiModal?: () => void;
  onOpenCourseCatalog?: () => void;
}

interface TranscriptItem {
  id: string;
  sender: 'priya' | 'user';
  text: string;
  time: string;
}

// Play pleasant synthetic call chimes using Web Audio API
function playChime(type: 'connect' | 'disconnect' | 'bop') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'connect') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'disconnect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

export const VoiceReceptionistModal: React.FC<VoiceReceptionistModalProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
  onOpenUpiModal,
  onOpenCourseCatalog,
}) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [indianVoiceName, setIndianVoiceName] = useState<string>('Detecting Indian Voice...');
  const [micError, setMicError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguageCode>('en');

  // Vapi Custom Config (Option 1)
  const [vapiPublicKey, setVapiPublicKey] = useState(() => localStorage.getItem('nextclass_vapi_public_key') || '');
  const [vapiAssistantId, setVapiAssistantId] = useState(() => localStorage.getItem('nextclass_vapi_assistant_id') || '');
  const [useVapiLive, setUseVapiLive] = useState(() => localStorage.getItem('nextclass_use_vapi_live') === 'true');

  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);
  const audioWaveIntervalRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 25, 45, 30, 60, 40, 20]);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, interimText]);

  // Helper to strictly prioritize Indian Female speech voices & regional Indian voices
  const getBestIndianFemaleVoice = (
    voices: SpeechSynthesisVoice[],
    langCode: VoiceLanguageCode = selectedLanguage
  ): SpeechSynthesisVoice | undefined => {
    const isExplicitlyMale = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes('ravi') ||
        lower.includes('david') ||
        lower.includes('mark') ||
        lower.includes('george') ||
        lower.includes('daniel') ||
        lower.includes('guy') ||
        lower.includes('james') ||
        lower.includes('steve') ||
        (lower.includes('male') && !lower.includes('female'))
      );
    };

    // 1. Regional Indian Language Voice (Malayalam, Tamil, Telugu, Kannada, Hindi)
    if (langCode !== 'en') {
      const prefix = VOICE_LANGUAGES[langCode].ttsLangPrefix;
      const regionalMatch = voices.find(
        (v) => v.lang.toLowerCase().startsWith(prefix) && !isExplicitlyMale(v.name)
      );
      if (regionalMatch) return regionalMatch;
    }

    // 2. Explicit Indian female names across platforms:
    // Windows: Microsoft Neerja (en-IN), Microsoft Heera (en-IN), Microsoft Swara (hi-IN)
    // macOS/iOS: Veena (en-IN), Lekha (hi-IN), Kanya
    // Chrome/Android: Priya, Kalpana, Kavya, Geeta, Ananya
    const indianFemaleKeywords = [
      'neerja',
      'veena',
      'heera',
      'priya',
      'swara',
      'kavya',
      'kalpana',
      'geeta',
      'lekha',
      'kanya',
      'ananya',
    ];

    const specificIndianFemale = voices.find((v) => {
      const lower = v.name.toLowerCase();
      return indianFemaleKeywords.some((keyword) => lower.includes(keyword)) && !isExplicitlyMale(lower);
    });
    if (specificIndianFemale) return specificIndianFemale;

    // 3. Any en-IN or hi-IN voice that is not explicitly male
    const indianLangVoice = voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      const isIndian = lang.includes('en-in') || lang.includes('hi-in') || name.includes('india');
      return isIndian && !isExplicitlyMale(name);
    });
    if (indianLangVoice) return indianLangVoice;

    // 4. Fallback to articulate natural English female voices
    const englishFemale = voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      const isFemale =
        name.includes('female') ||
        name.includes('samantha') ||
        name.includes('victoria') ||
        name.includes('karen') ||
        name.includes('zira') ||
        name.includes('jenny') ||
        name.includes('aria') ||
        name.includes('ava') ||
        name.includes('sonia');
      return lang.startsWith('en') && isFemale && !isExplicitlyMale(name);
    });
    if (englishFemale) return englishFemale;

    // 5. Any English voice that is not male
    return voices.find((v) => v.lang.toLowerCase().startsWith('en') && !isExplicitlyMale(v.name));
  };

  // Load available system speech voices & detect best Indian English female voice
  useEffect(() => {
    const updateVoices = () => {
      const cfg = VOICE_LANGUAGES[selectedLanguage];
      if (selectedLanguage === 'ml') {
        setIndianVoiceName(`Priya • Real-time Neural Voice (മലയാളം • HD Native Audio)`);
        return;
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIndianVoiceName(`Priya • Real-time Neural Voice (${cfg.label})`);
        return;
      }
      const voices = window.speechSynthesis.getVoices();
      const inVoice = getBestIndianFemaleVoice(voices, selectedLanguage);
      if (inVoice) {
        setIndianVoiceName(`${inVoice.name} (${inVoice.lang}) • Real-time Stream`);
      } else {
        setIndianVoiceName(`Priya • Real-time Neural Voice (${cfg.nativeLabel})`);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedLanguage]);

  // Timer effect when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callStatus]);

  // Animated Waveform when speaking or listening
  useEffect(() => {
    if (isSpeaking || isListening) {
      audioWaveIntervalRef.current = setInterval(() => {
        setWaveformBars([
          Math.floor(Math.random() * 45) + 15,
          Math.floor(Math.random() * 70) + 20,
          Math.floor(Math.random() * 95) + 30,
          Math.floor(Math.random() * 100) + 35,
          Math.floor(Math.random() * 85) + 25,
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 40) + 15,
        ]);
      }, 110);
    } else {
      if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
      setWaveformBars([15, 20, 25, 20, 25, 20, 15]);
    }
    return () => {
      if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
    };
  }, [isSpeaking, isListening]);

  // Format call duration (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Speak aloud in warm Indian accent (tuned per selected language with real-time neural audio)
  const speakText = (text: string, onComplete?: () => void, langOverride?: VoiceLanguageCode) => {
    if (typeof window === 'undefined' || !isSpeakerOn) {
      if (onComplete) onComplete();
      return;
    }

    const targetLang = langOverride || selectedLanguage;

    // Immediately stop any current audio playback or speech synthesis
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clean text of markdown, asterisks, brackets, or code symbols
    const cleanText = text
      .replace(/[*#_~`[\]()]/g, '')
      .replace(/\bRs\.?\s*/gi, 'Rupees ')
      .replace(/₹\s*/g, 'Rupees ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onComplete) onComplete();
      return;
    }

    setIsSpeaking(true);

    let hasCompleted = false;
    const finish = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      setIsSpeaking(false);
      currentAudioRef.current = null;
      if (onComplete) onComplete();
    };

    // 1. Primary: High-definition Real-Time Neural Speech Audio Stream from server
    // Guarantees 100% authentic Malayalam (ml), Tamil (ta), Telugu (te), Kannada (kn), Hindi (hi), and Indian English (en)
    try {
      const audioUrl = `/api/voice-receptionist/tts?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        finish();
      };

      audio.onerror = () => {
        console.warn('Real-time TTS stream failed, attempting browser speech synthesis fallback');
        // Do NOT use browser speech synthesis for Malayalam because standard browsers lack ml-IN and incorrectly speak in Telugu!
        if (targetLang === 'ml') {
          finish();
          return;
        }

        // Secondary fallback for languages supported by browser SpeechSynthesis
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = getBestIndianFemaleVoice(voices, targetLang);

          if (femaleVoice) {
            utterance.voice = femaleVoice;
            utterance.lang = femaleVoice.lang || VOICE_LANGUAGES[targetLang]?.recognitionLang || 'en-IN';
          } else {
            utterance.lang = VOICE_LANGUAGES[targetLang]?.recognitionLang || 'en-IN';
          }

          utterance.pitch = 1.08;
          utterance.rate = 0.98;
          utterance.onend = () => finish();
          utterance.onerror = () => finish();
          window.speechSynthesis.speak(utterance);
        } catch {
          finish();
        }
      };

      audio.play().catch((playErr) => {
        console.warn('Audio play prevented (browser autoplay policy):', playErr);
        // If autoplay blocked, check if browser synthesis works (except for Malayalam to avoid Telugu)
        if (targetLang !== 'ml' && window.speechSynthesis) {
          try {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = getBestIndianFemaleVoice(voices, targetLang);
            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.lang = VOICE_LANGUAGES[targetLang]?.recognitionLang || 'en-IN';
            utterance.onend = () => finish();
            utterance.onerror = () => finish();
            window.speechSynthesis.speak(utterance);
            return;
          } catch {}
        }
        finish();
      });
    } catch (err) {
      console.error('Audio initialization error:', err);
      finish();
    }
  };

  // Start Speech Recognition in selected Indian language
  const startListening = (overrideLang?: VoiceLanguageCode) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Browser voice recognition not supported. You can type queries below!');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const activeLangCode = overrideLang || selectedLanguage;
      const targetLang = VOICE_LANGUAGES[activeLangCode]?.recognitionLang || 'en-IN';

      const recognition = new SpeechRecognition();
      recognition.lang = targetLang; // e.g. 'ml-IN', 'ta-IN', 'te-IN', 'kn-IN', 'hi-IN', 'en-IN'
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalTranscript) {
          setInterimText('');
          handleUserUtterance(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Microphone access was denied. Please allow microphone permissions or use typed input below.');
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');
  };

  const [copiedConfig, setCopiedConfig] = useState(false);

  // Switch active language and gracefully acknowledge in that language
  const handleSelectLanguage = (langCode: VoiceLanguageCode) => {
    setSelectedLanguage(langCode);
    const cfg = VOICE_LANGUAGES[langCode];

    // Cancel any playing audio or speech synthesis immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (callStatus === 'connected') {
      const switchAcks: Record<VoiceLanguageCode, string> = {
        en: 'Sure! Let us continue in English. How can I help you?',
        ml: 'തീർച്ചയായും, നമുക്ക് മലയാളത്തിൽ സംസാരിക്കാം. എന്ത് വിവരമാണ് അറിയേണ്ടത്?',
        ta: 'நிச்சயமாக, நாம் தமிழில் பேசலாம். என்ன விவரங்கள் தேவை?',
        te: 'ఖచ్చితంగా, మనం తెలుగులో మాట్లాడుకుందాం. మీకు ఏం సమాచారం కావాలి?',
        kn: 'ಖಂಡಿತ, ನಾವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡೋಣ. ನಿಮಗೆ ಯಾವ ಮಾಹಿತಿ ಬೇಕು?',
        hi: 'ज़रूर, हम हिंदी में बात करते हैं। आप क्या जानना चाहते हैं?',
      };

      const ack = switchAcks[langCode] || cfg.welcomeMessage;

      const switchItem: TranscriptItem = {
        id: `lang-switch-${Date.now()}`,
        sender: 'priya',
        text: ack,
        time: formatTime(callDuration),
      };

      setTranscripts((prev) => [...prev, switchItem]);

      speakText(ack, () => {
        if (!isMuted && callStatus === 'connected') {
          setTimeout(() => startListening(langCode), 300);
        }
      }, langCode);
    }
  };

  // Copy complete Vapi assistant JSON configuration for current language
  const handleCopyVapiBlueprint = () => {
    const currentCfg = VOICE_LANGUAGES[selectedLanguage];
    const blueprint = {
      assistant: {
        name: `Priya - NextClass AI Receptionist (${currentCfg.label})`,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: currentCfg.recognitionLang,
          smart_format: true,
        },
        model: {
          provider: 'google',
          model: 'gemini-2.5-flash',
          temperature: 0.3,
          systemPrompt: `You are Priya, senior academic counselor at NextClass AI Academy. You speak fluent ${currentCfg.label} and English. Keep spoken answers under 2 sentences, warm, and helpful. Course fees: Google AI Studio Rs 1,499, DeepSeek R1 Rs 1,799, Voice AI Rs 1,799. AISSEE Sainik School prep is also provided. All courses include ISO verified certificates and UPI payment.`,
        },
        voice: {
          provider: 'azure',
          voiceId: currentCfg.azureVoice,
          speed: 0.98,
          pitch: 1.05,
        },
        firstMessage: currentCfg.welcomeMessage,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2500);
  };

  // Local knowledge response generator (ultra-fast sub-second latency with multilingual comprehensive knowledge)
  const getIntelligentLocalAnswer = (query: string, lang: VoiceLanguageCode = selectedLanguage): string => {
    return getComprehensiveCounselorAnswer(query, (lang || 'en') as SupportedLanguage);
  };

  // Handle incoming user speech
  const handleUserUtterance = async (userText: string) => {
    if (!userText.trim()) return;

    stopListening();

    const newTranscripts: TranscriptItem[] = [
      ...transcripts,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: userText,
        time: formatTime(callDuration),
      },
    ];
    setTranscripts(newTranscripts);

    // Call backend API with timeout fallback to ensure instant Indian accent voice reply
    let reply = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5 sec for Gemini multilingual response

      const res = await fetch('/api/voice-receptionist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language: selectedLanguage,
          history: newTranscripts.map((t) => ({
            role: t.sender === 'user' ? 'user' : 'assistant',
            text: t.text,
          })),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          reply = data.reply;
        }
      }
    } catch {
      // Fast fallback to intelligent local engine
    }

    if (!reply) {
      reply = getIntelligentLocalAnswer(userText, selectedLanguage);
    }

    // Add Priya's reply to transcript
    const priyaTranscript: TranscriptItem = {
      id: `p-${Date.now()}`,
      sender: 'priya',
      text: reply,
      time: formatTime(callDuration),
    };
    setTranscripts([...newTranscripts, priyaTranscript]);

    // Speak Priya's response aloud
    speakText(
      reply,
      () => {
        // Once speaking completes, restart listening in active language if not muted
        if (!isMuted && callStatus === 'connected') {
          setTimeout(() => {
            startListening(selectedLanguage);
          }, 300);
        }
      },
      selectedLanguage
    );
  };

  // Initiate Call
  const handleStartCall = () => {
    playChime('connect');
    setCallStatus('calling');
    setCallDuration(0);
    setTranscripts([]);

    setTimeout(() => {
      setCallStatus('connected');
      const welcome = VOICE_LANGUAGES[selectedLanguage]?.welcomeMessage || VOICE_LANGUAGES.en.welcomeMessage;

      setTranscripts([
        {
          id: 'welcome-1',
          sender: 'priya',
          text: welcome,
          time: '00:00',
        },
      ]);

      speakText(
        welcome,
        () => {
          if (!isMuted) {
            setTimeout(() => {
              startListening(selectedLanguage);
            }, 300);
          }
        },
        selectedLanguage
      );
    }, 1200);
  };

  // End Call
  const handleEndCall = () => {
    playChime('disconnect');
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    setCallStatus('ended');
    setIsSpeaking(false);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      stopListening();
    }
  };

  // Send typed query
  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const text = manualInput.trim();
    setManualInput('');
    handleUserUtterance(text);
  };

  // Save Vapi Settings
  const handleSaveVapiSettings = () => {
    localStorage.setItem('nextclass_vapi_public_key', vapiPublicKey);
    localStorage.setItem('nextclass_vapi_assistant_id', vapiAssistantId);
    localStorage.setItem('nextclass_use_vapi_live', useVapiLive ? 'true' : 'false');
    setShowSettings(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-receptionist-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="voice-receptionist-card"
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Status Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-bold text-base">
                P
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  callStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : callStatus === 'calling'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-semibold text-base leading-tight">Priya • AI Receptionist</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium tracking-wide">
                  Indian Female Voice
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {callStatus === 'connected' ? (
                  <span className="text-emerald-400 font-medium">Live Voice Call • {formatTime(callDuration)}</span>
                ) : callStatus === 'calling' ? (
                  <span className="text-amber-400">Connecting audio line...</span>
                ) : callStatus === 'ended' ? (
                  <span className="text-slate-400">Call Ended ({formatTime(callDuration)})</span>
                ) : (
                  'NextClass Senior Academic Advisor'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              id="voice-receptionist-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Voice, Language & Vapi Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              id="voice-receptionist-close-btn"
              onClick={() => {
                handleEndCall();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Regional Indian Languages Selection Bar */}
        <div className="px-3 sm:px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300 text-[11px] hidden sm:inline">Language:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {(Object.keys(VOICE_LANGUAGES) as VoiceLanguageCode[]).map((code) => {
              const lang = VOICE_LANGUAGES[code];
              const isSelected = selectedLanguage === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectLanguage(code)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-900/40 font-bold ring-1 ring-emerald-300'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60 text-[11px]'
                  }`}
                  title={`${lang.label} (${lang.nativeLabel})`}
                >
                  <span className="text-xs leading-none">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Drawer / Overlay */}
        {showSettings && (
          <div className="p-4 bg-slate-800/95 border-b border-slate-700/80 text-xs space-y-3.5 max-h-[360px] overflow-y-auto">
            {/* Language & Voice synthesis status */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
              <div>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Voice Engine: {VOICE_LANGUAGES[selectedLanguage].label}
                </span>
                <span className="text-slate-300 font-mono text-[11px] truncate block max-w-[260px] mt-0.5">
                  {indianVoiceName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => speakText(VOICE_LANGUAGES[selectedLanguage].samplePhrase, undefined, selectedLanguage)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] transition-colors"
              >
                Test Voice ({VOICE_LANGUAGES[selectedLanguage].label})
              </button>
            </div>

            {/* Vapi.ai Telephony Blueprint Section */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-teal-400" />
                  <span className="text-white font-medium">Vapi Multilingual Telephony Blueprint</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVapiBlueprint}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-medium text-[11px] transition-colors"
                >
                  {copiedConfig ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Vapi JSON</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Connect NextClass AI Receptionist directly to phone lines (Twilio) or web calls with Vapi:
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400">
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block">Azure TTS Voice:</span>
                  <span className="text-emerald-400">{VOICE_LANGUAGES[selectedLanguage].azureVoice}</span>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block">Deepgram STT Lang:</span>
                  <span className="text-cyan-400">{VOICE_LANGUAGES[selectedLanguage].recognitionLang}</span>
                </div>
              </div>
            </div>

            {/* Vapi Custom WebRTC Key Setup */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Connect Your Own Vapi Key (Optional)</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useVapiLive}
                    onChange={(e) => setUseVapiLive(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-600"
                  />
                  <span className="text-slate-300 text-[11px]">Use Vapi</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vapi Public Key"
                  value={vapiPublicKey}
                  onChange={(e) => setVapiPublicKey(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Vapi Assistant ID"
                  value={vapiAssistantId}
                  onChange={(e) => setVapiAssistantId(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveVapiSettings}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs"
                >
                  Save Vapi Config
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {callStatus === 'idle' && (
            <div className="text-center py-6 px-4 space-y-5">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-950/60 border-2 border-emerald-400/40">
                  <Phone className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">Talk to Priya • AI Academic Counselor</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  Natural regional speech voice AI in <strong className="text-slate-200">Malayalam, Tamil, Telugu, Kannada, Hindi & English</strong>. Ask about courses, pricing,
                  certificates, or entrance mock tests.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected: {VOICE_LANGUAGES[selectedLanguage].flag} {VOICE_LANGUAGES[selectedLanguage].label} ({VOICE_LANGUAGES[selectedLanguage].nativeLabel})</span>
              </div>

              <div className="pt-2">
                <button
                  id="voice-receptionist-start-call-btn"
                  onClick={handleStartCall}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  Start Live Voice Call
                </button>
              </div>
            </div>
          )}

          {callStatus === 'calling' && (
            <div className="text-center py-10 space-y-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-400/60 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>
              </div>
              <h4 className="text-white font-semibold text-base">Calling Priya...</h4>
              <p className="text-xs text-slate-400">Connecting to NextClass Realtime Voice Telephony Pipeline</p>
            </div>
          )}

          {(callStatus === 'connected' || callStatus === 'ended') && (
            <>
              {/* Animated Waveform Visualizer & Speaking Status */}
              <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-end justify-center gap-1.5 h-12 w-full px-8">
                  {waveformBars.map((height, i) => (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className={`w-2 rounded-full transition-all duration-100 ${
                        isSpeaking
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-md shadow-emerald-500/50'
                          : isListening
                          ? 'bg-gradient-to-t from-sky-600 to-cyan-300 shadow-md shadow-sky-500/50'
                          : 'bg-slate-700/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  {isSpeaking ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Priya is speaking...
                    </span>
                  ) : isListening ? (
                    <span className="flex items-center gap-1.5 text-cyan-400 font-medium animate-pulse">
                      <Mic className="w-3.5 h-3.5" /> Listening to your voice... (Speak now)
                    </span>
                  ) : (
                    <span className="text-slate-400">Ready • Ask your question</span>
                  )}
                </div>

                {interimText && (
                  <div className="text-center text-xs text-cyan-300 italic bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-800/30">
                    "{interimText}..."
                  </div>
                )}
              </div>

              {micError && (
                <div className="px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Real-time Subtitles / Live Transcripts */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-start gap-2.5 ${t.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {t.sender === 'priya' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 mt-0.5">
                        P
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                        t.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/50 rounded-tl-none'
                      }`}
                    >
                      <p>{t.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1">{t.time}</span>
                    </div>
                    {t.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={transcriptsEndRef} />
              </div>

              {/* Quick Voice Topics Chips in Selected Language */}
              {callStatus === 'connected' && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-slate-400 font-medium">Suggested queries in {VOICE_LANGUAGES[selectedLanguage].nativeLabel}:</p>
                    <span className="text-[10px] text-emerald-400 font-mono">{VOICE_LANGUAGES[selectedLanguage].flag} {VOICE_LANGUAGES[selectedLanguage].label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {VOICE_LANGUAGES[selectedLanguage].quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUserUtterance(chip)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Call Controls Bar */}
        <div className="px-4 py-3.5 border-t border-slate-800/80 bg-slate-900/80">
          {callStatus === 'connected' && (
            <div className="space-y-3">
              {/* Type fallback input for noisy surroundings */}
              <form onSubmit={handleSendManual} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type here if mic is busy..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 rounded-xl text-xs font-semibold"
                >
                  Send
                </button>
              </form>

              {/* Telephony Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    id="voice-receptionist-mute-btn"
                    onClick={handleToggleMute}
                    className={`p-2.5 rounded-full border transition-all ${
                      isMuted
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    id="voice-receptionist-speaker-btn"
                    onClick={() => {
                      if (isSpeakerOn && typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeakerOn(!isSpeakerOn);
                    }}
                    className={`p-2.5 rounded-full border transition-all ${
                      !isSpeakerOn
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title={isSpeakerOn ? 'Mute Speaker' : 'Enable Speaker'}
                  >
                    {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <a
                    href="https://wa.me/918281644058?text=Hi%20NextClass%20Counselor%2C%20I%20would%20like%20guidance%20on%20AI%20courses"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Counselor</span>
                  </a>
                </div>

                <button
                  id="voice-receptionist-end-call-btn"
                  onClick={handleEndCall}
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </button>
              </div>
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Thank you for speaking with Priya!</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStartCall}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Again
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {callStatus === 'idle' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                NextClass Realtime Voice Agent
              </span>
              <span>Available 24/7</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
