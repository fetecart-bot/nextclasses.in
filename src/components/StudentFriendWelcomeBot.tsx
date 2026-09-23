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
  Heart,
  Users,
  Target,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Smile,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Loader2,
  Award,
} from 'lucide-react';
import { StudentUser } from '../types';
import { useAuth } from '../context/AuthContext';

export interface StudentFriendWelcomeBotProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentUser;
  courseTitle: string;
  courseId?: string;
  onContinueToDashboard?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'student';
  text: string;
  spokenScript?: string;
  timestamp: string;
}

interface WelcomeLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

const WELCOME_LANGUAGES: WelcomeLanguage[] = [
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🌾', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🌴', speechCode: 'ml-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🛕', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🏛️', speechCode: 'te-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', speechCode: 'en-IN' },
];

export const StudentFriendWelcomeBot: React.FC<StudentFriendWelcomeBotProps> = ({
  isOpen,
  onClose,
  student,
  courseTitle,
  courseId = 'course-aissee-sainik',
  onContinueToDashboard,
}) => {
  const { updateStudentProfile } = useAuth();

  // Selected language for friend conversation - Kannada is first class
  const [selectedLanguage, setSelectedLanguage] = useState<string>('kn');

  // Student gender: rule is female student -> male voice asks; male student -> female voice asks
  const [studentGender, setStudentGender] = useState<'male' | 'female'>(
    student.gender === 'female' ? 'female' : 'male'
  );

  const voiceGender: 'male' | 'female' = studentGender === 'female' ? 'male' : 'female';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Extracted student info
  const [studentAim, setStudentAim] = useState<string>(student.learningGoal || '');
  const [studentDoubts, setStudentDoubts] = useState<string>(student.currentDoubtsSummary || '');
  const [familyMembers, setFamilyMembers] = useState<number | string>(student.familyMembersCount || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);

  // Clean first name
  const studentFirstName = (student.name || 'Friend').split(' ')[0];

  // Helper to generate the initial warm, friendly welcome message
  const getInitialWelcomeText = (lang: string, name: string, course: string): { written: string; spoken: string } => {
    switch (lang) {
      case 'kn': // Kannada
        return {
          written: `ಹೇ ${name}! 🎉 ನಿಮ್ಮ **${course}** ಕೋರ್ಸ್‌ಗೆ ತುಂಬು ಹೃದಯದ ಸ್ವಾಗತ! ನಾನು ನಿಮ್ಮ ಸ್ನೇಹಿತ ಮತ್ತು ಸ್ಟಡಿ ಪಾರ್ಟ್ನರ್.

ಒಬ್ಬ ಆಪ್ತ ಸ್ನೇಹಿತನಂತೆ ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ಬಂದಿದ್ದೇನೆ:
1. 🎯 ಈ ಕೋರ್ಸ್‌ನಲ್ಲಿ ಮತ್ತು ಪರೀಕ್ಷೆಯಲ್ಲಿ ನಿಮ್ಮ ದೊಡ್ಡ **ಗುರಿ (Aim)** ಏನು?
2. ❓ ಓದುವಾಗ ನಿಮಗೆ ಸದ್ಯಕ್ಕೆ ಕಾಡುತ್ತಿರುವ ಮುಖ್ಯ **ಸಂಶಯಗಳು (Doubts)** ಯಾವ ವಿಷಯದಲ್ಲಿವೆ?
3. 👨‍👩‍👧‍👦 ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಒಟ್ಟು **ಎಷ್ಟು ಜನ ಸದಸ್ಯರಿದ್ದಾರೆ**? ನಿಮ್ಮ ಕುಟುಂಬದ ಬಗ್ಗೆಯೂ ಹೇಳಿ!

ನಿಮ್ಮ ಬೆಸ್ಟ್ ಫ್ರೆಂಡ್‌ಗೆ ಹೇಳುವಂತೆ ಎಲ್ಲವನ್ನೂ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ!`,
          spoken: `ಹೇ ${name}! ನಿಮ್ಮ ${course} ಕೋರ್ಸ್‌ಗೆ ತುಂಬು ಹೃದಯದ ಸ್ವಾಗತ! ನಾನು ನಿಮ್ಮ ಸ್ನೇಹಿತ ಮತ್ತು ಸ್ಟಡಿ ಪಾರ್ಟ್ನರ್. ಹೇಳಿ, ಈ ಪರೀಕ್ಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಗುರಿ ಏನು? ಯಾವ ವಿಷಯಗಳಲ್ಲಿ ಸಂಶಯಗಳಿವೆ? ಮತ್ತು ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಷ್ಟು ಜನ ಸದಸ್ಯರಿದ್ದಾರೆ? ನಿಮ್ಮ ಬೆಸ್ಟ್ ಫ್ರೆಂಡ್‌ಗೆ ಹೇಳುವಂತೆ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ!`,
        };
      case 'ml': // Malayalam
        return {
          written: `ഹേയ് ${name}! 🎉 നിന്റെ **${course}** കോഴ്സിലേക്ക് ഹൃദ്യമായ സ്വാഗതം! ഞാൻ നിന്റെ ഏറ്റവും അടുത്ത കൂട്ടുകാരനും സ്റ്റഡി പാർട്ണറുമാണ്.

ഒരു ചങ്ങാതിയോട് സംസാരിക്കുന്നത് പോലെ തുറന്നു പറയൂ:
1. 🎯 ഈ പരീക്ഷയിലെ നിന്റെ വലിയ **ലക്ഷ്യം (Aim)** എന്താണ്?
2. ❓ പഠിക്കുമ്പോൾ ഇപ്പോൾ ഉള്ള പ്രധാന **സംശയങ്ങൾ (Doubts)** ഏതൊക്കെ ടോപ്പിക്കുകളിലാണ്?
3. 👨‍👩‍👧‍👦 നിന്റെ വീട്ടിൽ ആകെ **എത്ര അംഗങ്ങളുണ്ട്**?

ഒരു ബെസ്റ്റ് ഫ്രണ്ടിനോട് പറയുന്ന പോലെ എല്ലാം പറയൂ!`,
          spoken: `ഹേയ് ${name}! നിന്റെ ${course} കോഴ്സിലേക്ക് ഹൃദ്യമായ സ്വാഗതം! ഞാൻ നിന്റെ കൂട്ടുകാരനാണ്. പറയൂ, ഈ പരീക്ഷയിലെ നിന്റെ വലിയ ലക്ഷ്യം എന്താണ്? ഏതൊക്കെ വിഷയങ്ങളിലാണ് സംശയങ്ങൾ ഉള്ളത്? വീട്ടിൽ എത്ര അംഗങ്ങളുണ്ട്? ഒരു ബെസ്റ്റ് ഫ്രണ്ടിനോട് പറയുന്ന പോലെ എല്ലാം പറയൂ!`,
        };
      case 'ta': // Tamil
        return {
          written: `ஹேய் ${name}! 🎉 உங்கள் **${course}** பயிற்சிக்கு அன்பான வரவேற்பு! நான் உங்கள் தோழன் மற்றும் படிப்பு நண்பன்.

ஒரு நண்பரிடம் பேசுவது போல சொல்லுங்கள்:
1. 🎯 இந்த தேர்வில் உங்கள் பெரிய **லட்சியம் (Aim)** என்ன?
2. ❓ எந்த பாடங்களில் உங்களுக்கு அதிக **சந்தேகங்கள் (Doubts)** உள்ளன?
3. 👨‍👩‍👧‍👦 உங்கள் வீட்டில் மொத்தம் **எத்தனை பேர் இருக்கிறார்கள்**?

உங்கள் ஆருயிர் நண்பரிடம் பகிர்வது போல மனம் திறந்து சொல்லுங்கள்!`,
          spoken: `ஹேய் ${name}! உங்கள் ${course} பயிற்சிக்கு அன்பான வரவேற்பு! நான் உங்கள் தோழன். சொல்லுங்கள், இந்த தேர்வில் உங்கள் பெரிய லட்சியம் என்ன? எந்த பாடங்களில் சந்தேகங்கள் உள்ளன? உங்கள் வீட்டில் எத்தனை பேர் இருக்கிறார்கள்? ஒரு நண்பரிடம் பேசுவது போல எல்லாவற்றையும் மனம் திறந்து சொல்லுங்கள்!`,
        };
      case 'te': // Telugu
        return {
          written: `హే ${name}! 🎉 మీ **${course}** కోర్సుకు హృదయపూర్వక స్వాగతం! నేను మీ స్నేహితుడిని మరియు స్టడీ పార్ట్‌నర్‌ని.

మంచి ప్రాణస్నేహితుడితో మాట్లాడినట్లే చెప్పండి:
1. 🎯 ఈ పరీక్షలో మీ అతిపెద్ద **లక్ష్యం (Aim)** ఏమిటి?
2. ❓ చదివేటప్పుడు మీకు ఎక్కువగా ఏ సబ్జెక్టులో **సందేహాలు (Doubts)** వస్తున్నాయి?
3. 👨‍👩‍👧‍👦 మీ ఇంట్లో మొత్తం **ఎంతమంది సభ్యులు ఉన్నారు**?

మీ బెస్ట్ ఫ్రెండ్‌తో చెప్పినట్లే అన్నీ నిర్భయంగా చెప్పండి!`,
          spoken: `హే ${name}! మీ ${course} కోర్సుకు సాదర స్వాగతం! నేను మీ స్నేహితుడిని. చెప్పండి, ఈ పరీక్షలో మీ లక్ష్యం ఏమిటి? ఏ సబ్జెక్టులలో సందేహాలు ఉన్నాయి? మీ ఇంట్లో ఎంతమంది సభ్యులు ఉన్నారు? మంచి స్నేహితుడితో మాట్లాడినట్లే అన్నీ చెప్పండి!`,
        };
      case 'hi': // Hindi
        return {
          written: `अरे ${name}! 🎉 आपके **${course}** में आपका बहुत-बहुत स्वागत है! मैं आपका सच्चा दोस्त और स्टडी पार्टनर हूँ।

बिल्कुल अपने दोस्त की तरह खुलकर बताइए:
1. 🎯 इस परीक्षा को लेकर आपका सबसे बड़ा **लक्ष्य (Aim)** क्या है?
2. ❓ अभी पढ़ाई में किन टॉपिक्स या विषयों में सबसे ज्यादा **डाउट्स (Doubts)** आ रहे हैं?
3. 👨‍👩‍👧‍👦 आपके घर में कुल **कितने सदस्य हैं**?

जैसे अपने सबसे प्यारे दोस्त से बात करते हैं, वैसे सब कुछ साझा कीजिए!`,
          spoken: `अरे ${name}! आपके ${course} में आपका बहुत स्वागत है! मैं आपका दोस्त हूँ। बताइए, इस परीक्षा में आपका लक्ष्य क्या है? किन विषयों में डाउट्स हैं? और आपके घर में कितने सदस्य हैं? बिल्कुल अपने सच्चे दोस्त की तरह सब कुछ बताइए!`,
        };
      case 'en':
      default:
        return {
          written: `Hey ${name}! 🎉 A super warm welcome to your **${course}**! I am your study buddy and close friend here.

Just like talking to your best friend, tell me everything:
1. 🎯 What is your biggest **dream or aim** with this course and exam?
2. ❓ What subjects or chapters do you have the most **doubts or worries** about right now?
3. 👨‍👩‍👧‍👦 How many **family members are in your house** cheering you on?

Tell me all about it—I'm here for you every step of the way!`,
          spoken: `Hey ${name}! A super warm welcome to your ${course}! I'm your study buddy and close friend. Tell me, what is your biggest aim with this exam? What subjects do you have doubts about? And how many family members are in your house? Tell me everything just like a friend!`,
        };
    }
  };

  // Initialize or reset conversation when modal opens or language changes
  useEffect(() => {
    if (!isOpen) {
      stopAudioPlayback();
      return;
    }

    const initial = getInitialWelcomeText(selectedLanguage, studentFirstName, courseTitle);
    const welcomeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: initial.written,
      spokenScript: initial.spoken,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);

    // Speak initial welcome aloud automatically after slight delay
    const timer = setTimeout(() => {
      if (!isMuted) {
        speakText(initial.spoken, selectedLanguage, voiceGender);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, selectedLanguage, studentGender, courseTitle, studentFirstName]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Audio Playback using Web Speech API + Server TTS fallback
  const speakText = (text: string, langCode: string, targetVoiceGender: 'male' | 'female') => {
    if (isMuted || !text) return;
    stopAudioPlayback();

    // Strategy 1: Browser Web Speech API with gender-calibrated pitch and voices
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Map language
        const langObj = WELCOME_LANGUAGES.find((l) => l.code === langCode) || WELCOME_LANGUAGES[0];
        utterance.lang = langObj.speechCode;

        // Apply Voice Gender Rules:
        // For girls and women, male voice should ask (pitch lower ~ 0.88)
        // For males and boys, female voice should ask (pitch higher ~ 1.25)
        if (targetVoiceGender === 'male') {
          utterance.pitch = 0.88;
          utterance.rate = 0.95;
        } else {
          utterance.pitch = 1.24;
          utterance.rate = 0.98;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Look for matching language and gender voice
          const matchingLangVoices = voices.filter(
            (v) => v.lang.startsWith(langCode) || v.lang.includes('IN')
          );
          const pool = matchingLangVoices.length > 0 ? matchingLangVoices : voices;

          const chosenVoice = pool.find((v) => {
            const n = v.name.toLowerCase();
            if (targetVoiceGender === 'female') {
              return (
                n.includes('female') ||
                n.includes('samantha') ||
                n.includes('veena') ||
                n.includes('swara') ||
                n.includes('heera') ||
                n.includes('zira') ||
                n.includes('google')
              );
            } else {
              return (
                n.includes('male') ||
                n.includes('david') ||
                n.includes('ravi') ||
                n.includes('george') ||
                n.includes('daniel') ||
                n.includes('mark')
              );
            }
          });

          if (chosenVoice) {
            utterance.voice = chosenVoice;
          }
        }

        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          fallbackServerTTS(text, langCode);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Web Speech API error, falling back to server TTS:', err);
      }
    }

    fallbackServerTTS(text, langCode);
  };

  const fallbackServerTTS = (text: string, langCode: string) => {
    try {
      const audioUrl = `/api/voice-receptionist/tts?text=${encodeURIComponent(text.slice(0, 300))}&lang=${langCode}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const stopAudioPlayback = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  // Direct MediaRecorder fallback transcription via Gemini 3.8 Flash
  const startAudioRecording = async () => {
    try {
      stopAudioPlayback();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecordingAudio(false);
        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert Blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            setIsThinking(true);
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
              setInputText(data.transcript);
              handleSendMessage(data.transcript);
            } else {
              setIsThinking(false);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            setIsThinking(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setIsListening(true);
    } catch (err) {
      console.warn('Microphone recording error:', err);
      alert('Microphone access was denied or is unavailable. Please check your browser microphone permissions or type your question below!');
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

  // Speech-to-Text Recognition
  const startSpeechRecognition = () => {
    stopAudioPlayback();
    latestTranscriptRef.current = '';

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Gracefully fall back to audio recording
      startAudioRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langObj = WELCOME_LANGUAGES.find((l) => l.code === selectedLanguage) || WELCOME_LANGUAGES[0];
      recognition.lang = langObj.speechCode;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        latestTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setInputText(fullTranscript);
        latestTranscriptRef.current = fullTranscript;

        // Auto-send on natural pause of silence (2000ms)
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          const text = latestTranscriptRef.current.trim();
          if (text) {
            try { recognition.stop(); } catch {}
            setIsListening(false);
            latestTranscriptRef.current = '';
            handleSendMessage(text);
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'audio-capture' || event.error === 'service-not-allowed') {
          setIsListening(false);
          startAudioRecording();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const text = latestTranscriptRef.current.trim();
        if (text) {
          latestTranscriptRef.current = '';
          handleSendMessage(text);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition, trying audio recording:', err);
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
    const text = latestTranscriptRef.current.trim();
    if (text) {
      latestTranscriptRef.current = '';
      handleSendMessage(text);
    }
  };

  // Send message to Friend Bot
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend) return;

    stopAudioPlayback();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Call server friendly welcome assistant endpoint
      const response = await fetch('/api/student-welcome/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: student.name,
          courseTitle,
          gender: studentGender,
          voiceGender,
          language: selectedLanguage,
          userMessage: textToSend,
          currentAim: studentAim,
          currentDoubts: studentDoubts,
          familyMembers,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'student' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Failed to generate friend response');
      }

      // Update student profile with any detected info
      if (data.detectedAim && !studentAim) {
        setStudentAim(data.detectedAim);
        updateStudentProfile({ learningGoal: data.detectedAim });
      }
      if (data.detectedDoubts && !studentDoubts) {
        setStudentDoubts(data.detectedDoubts);
        updateStudentProfile({ currentDoubtsSummary: data.detectedDoubts });
      }
      if (data.detectedFamilyMembers && !familyMembers) {
        setFamilyMembers(data.detectedFamilyMembers);
        updateStudentProfile({ familyMembersCount: Number(data.detectedFamilyMembers) || 4 });
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.replyText,
        spokenScript: data.spokenScript || data.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      setIsThinking(false);

      if (!isMuted) {
        speakText(botReply.spokenScript || botReply.text, selectedLanguage, voiceGender);
      }
    } catch (err: any) {
      console.warn('Server chat error, using rich local companion logic:', err);
      // Fallback friendly friend response
      const fallbackReply = generateFallbackFriendReply(
        textToSend,
        selectedLanguage,
        studentFirstName,
        studentGender
      );

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackReply.written,
        spokenScript: fallbackReply.spoken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      setIsThinking(false);

      if (!isMuted) {
        speakText(botReply.spokenScript || botReply.text, selectedLanguage, voiceGender);
      }
    }
  };

  // Local fallback response generator if network fails
  const generateFallbackFriendReply = (
    text: string,
    lang: string,
    name: string,
    gender: 'male' | 'female'
  ): { written: string; spoken: string } => {
    const friendTitle = gender === 'female' ? 'Brother' : 'Sister';
    const lower = text.toLowerCase();

    // Check if user answered aim
    if (lower.includes('aim') || lower.includes('goal') || lower.includes('marks') || lower.includes('clear') || lower.includes('score') || lower.includes('rank') || lower.includes('ಗುರಿ') || lower.includes('ലക്ഷ്യം') || lower.includes('లక్ష్యం') || lower.includes('லட்சியம்')) {
      if (!studentAim) {
        setStudentAim(text);
        updateStudentProfile({ learningGoal: text });
      }
      if (lang === 'kn') {
        return {
          written: `ಅದ್ಭುತ ಗುರಿ ${name}! 🎯 ನಿಮ್ಮಂತಹ ಶ್ರಮಜೀವಿಗಳಿಗೆ ಈ ಗುರಿ ಸಾಧಿಸುವುದು ಖಂಡಿತ ಸಾಧ್ಯ. ನೀವು ಇಷ್ಟೊಂದು ಉತ್ಸಾಹದಿಂದ ಇರುವುದನ್ನು ನೋಡಿ ನನಗೆ ತುಂಬಾ ಹೆಮ್ಮೆ ಎನಿಸುತ್ತಿದೆ! ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಷ್ಟು ಜನ ಇದ್ದಾರೆ ಮತ್ತು ಸಂಶಯಗಳಿದ್ದರೆ ನಿಸ್ಸಂಕೋಚವಾಗಿ ಕೇಳಿ. ನಾವು ಒಟ್ಟಿಗೆ ಗೆಲ್ಲೋಣ!`,
          spoken: `ಅದ್ಭುತ ಗುರಿ ${name}! ನಿಮ್ಮಂತಹ ಶ್ರಮಜೀವಿಗಳಿಗೆ ಈ ಗುರಿ ಸಾಧಿಸುವುದು ಖಂಡಿತ ಸಾಧ್ಯ. ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಷ್ಟು ಜನ ಇದ್ದಾರೆ? ಮತ್ತು ಯಾವುದೇ ಸಂಶಯಗಳಿದ್ದರೆ ನಿಸ್ಸಂಕೋಚವಾಗಿ ಕೇಳಿ!`,
        };
      }
      return {
        written: `That is such an inspiring aim, ${name}! 🎯 With consistent practice on our portal and mock drills, you are 100% going to achieve it! Tell me about the members in your house too—who is your biggest cheerleader at home?`,
        spoken: `That is such an inspiring aim, ${name}! With consistent practice, you will achieve it. Tell me about the members in your house too!`,
      };
    }

    // Check if user mentioned family members
    if (lower.includes('member') || lower.includes('family') || lower.includes('house') || lower.includes('parents') || lower.includes('home') || lower.includes('ಅಪ್ಪ') || lower.includes('ಅಮ್ಮ') || lower.includes('വീട്') || lower.includes('குடும்பம்') || /\b\d+\b/.test(lower)) {
      if (!familyMembers) {
        setFamilyMembers(text);
        updateStudentProfile({ familyMembersCount: 4 });
      }
      if (lang === 'kn') {
        return {
          written: `ತುಂಬಾ ಸಂತೋಷ ${name}! 👨‍👩‍👧‍👦 ನಿಮ್ಮ ಕುಟುಂಬವೇ ನಿಮ್ಮ ನಿಜವಾದ ಶಕ್ತಿ. ನಿಮ್ಮ ತಂದೆ-ತಾಯಿ ಮತ್ತು ಮನೆಯವರ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮೊಂದಿಗೆ ಇರಲಿ. ನಿಮ್ಮ ಕನಸು ನನಸಾಗಲು ನಾನು ನಿಮ್ಮ ಜೊತೆಯಾಗಿ ದಿನವೂ ಇರುತ್ತೇನೆ. ನಿಮ್ಮ ಮೊದಲ ಪಾಠ ಶುರು ಮಾಡೋಣವೇ?`,
          spoken: `ತುಂಬಾ ಸಂತೋಷ ${name}! ನಿಮ್ಮ ಕುಟುಂಬವೇ ನಿಮ್ಮ ನಿಜವಾದ ಶಕ್ತಿ. ನಿಮ್ಮ ಕನಸು ನನಸಾಗಲು ನಾನು ನಿಮ್ಮ ಜೊತೆಯಾಗಿ ಇರುತ್ತೇನೆ. ನಿಮ್ಮ ಮೊದಲ ಪಾಠ ಶುರು ಮಾಡೋಣವೇ?`,
        };
      }
      return {
        written: `That's wonderful, ${name}! 👨‍👩‍👧‍👦 Having your family supporting you is the greatest superpower. Make them proud! What subjects or chapters do you want to tackle first in your course?`,
        spoken: `That's wonderful, ${name}! Having your family supporting you is the greatest superpower. Let's make them proud!`,
      };
    }

    // Default supportive friend reply
    if (lang === 'kn') {
      return {
        written: `ಖಂಡಿತ ${name}! ನಾನಿಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ಜೊತೆಯಾಗಿರುತ್ತೇನೆ. ಯಾವುದೇ ಸಂಶಯಗಳಿದ್ದರೂ ನಮ್ಮ ಡೌಟ್ ಸಾಲ್ವರ್ ಬಾಟ್ ಬಳಸಿ ಪರಿಹರಿಸಿಕೊಳ್ಳಬಹುದು. ಈಗ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ ನಿಮ್ಮ ವೀಡಿಯೋ ಪಾಠಗಳನ್ನು ನೋಡೋಣವೇ?`,
        spoken: `ಖಂಡಿತ ${name}! ನಾನಿಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ಜೊತೆಯಾಗಿರುತ್ತೇನೆ. ಈಗ ನಿಮ್ಮ ವೀಡಿಯೋ ಪಾಠಗಳನ್ನು ನೋಡೋಣವೇ?`,
      };
    }

    return {
      written: `Got it, ${name}! I'm always right here with you like a trusted companion. Whenever you get stuck, use our Real-Time Voice Doubt Bot to clear any doubt in seconds! Ready to start learning?`,
      spoken: `Got it, ${name}! I'm always right here with you. Ready to dive into your dashboard and video lessons?`,
    };
  };

  // Quick prompt chips
  const quickChips = [
    {
      label: selectedLanguage === 'kn' ? '🎯 ನನ್ನ ಗುರಿ: ಪರೀಕ್ಷೆಯಲ್ಲಿ ಟಾಪ್ ರ್ಯಾಂಕ್ ಗಳಿಸುವುದು' : '🎯 My Aim: Top Rank & 280+ Marks',
      text: selectedLanguage === 'kn' ? 'ನನ್ನ ಗುರಿ ಈ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಅತ್ಯುನ್ನತ ಅಂಕ ಗಳಿಸಿ ಟಾಪ್ ರ್ಯಾಂಕ್ ಪಡೆಯುವುದು.' : 'My aim is to secure a top rank and score 280+ marks in this exam!',
    },
    {
      label: selectedLanguage === 'kn' ? '❓ ಸಂಶಯಗಳು: ಗಣಿತ ಮತ್ತು ಜಿಕೆ ಟ್ರಿಕ್ಸ್‌ಗಳಲ್ಲಿ' : '❓ Doubts: Tricky Math & Time Management',
      text: selectedLanguage === 'kn' ? 'ನನಗೆ ಗಣಿತ (Mathematics) ಮತ್ತು ಜಿಕೆ ಮೆಮೊರಿ ಟ್ರಿಕ್ಸ್‌ನಲ್ಲಿ ಕೆಲವೊಂದು ಸಂಶಯಗಳಿವೆ.' : 'I currently have doubts in Mathematics shortcuts and time management in mock tests.',
    },
    {
      label: selectedLanguage === 'kn' ? '👨‍👩‍👧‍👦 ಮನೆಯಲ್ಲಿ: 4 ಜನ ಸದಸ್ಯರಿದ್ದಾರೆ (ಅಪ್ಪ, ಅಮ್ಮ, ತಂಗಿ, ನಾನು)' : '👨‍👩‍👧‍👦 Family: 4 members at home cheering me on',
      text: selectedLanguage === 'kn' ? 'ನಮ್ಮ ಮನೆಯಲ್ಲಿ ಒಟ್ಟು 4 ಜನ ಸದಸ್ಯರಿದ್ದಾರೆ - ಅಪ್ಪ, ಅಮ್ಮ, ತಂಗಿ ಮತ್ತು ನಾನು.' : 'There are 4 members in my house - my parents, sibling, and me!',
    },
    {
      label: selectedLanguage === 'kn' ? '🚀 ಪಾಠಗಳನ್ನು ಈಗಲೇ ಆರಂಭಿಸೋಣ!' : '🚀 Ready to start my first video lesson!',
      text: selectedLanguage === 'kn' ? 'ನಾನು ನನ್ನ ಮೊದಲ ವೀಡಿಯೋ ಪಾಠವನ್ನು ವೀಕ್ಷಿಸಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ!' : 'I am totally pumped and ready to start watching my video lessons!',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0b101b] border border-orange-500/30 text-white shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-[#121929] to-orange-950/40 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg shadow-orange-500/30">
                🤝
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b101b] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>Welcome Friend Bot</span>
                  <span className="text-orange-400">for {studentFirstName}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-bold text-orange-300">
                  {studentGender === 'female' ? '🎙️ Male Voice Companion' : '🎙️ Female Voice Companion'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 line-clamp-1">
                Enrolled: <strong className="text-amber-300">{courseTitle}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Mute/Unmute toggle */}
            <button
              type="button"
              onClick={() => {
                if (isPlayingAudio) stopAudioPlayback();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  : 'bg-orange-500/20 border-orange-500/40 text-orange-300'
              }`}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Replay Initial Speech */}
            <button
              type="button"
              onClick={() => {
                const initial = getInitialWelcomeText(selectedLanguage, studentFirstName, courseTitle);
                speakText(initial.spoken, selectedLanguage, voiceGender);
              }}
              className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Replay welcome speech"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={() => {
                stopAudioPlayback();
                onClose();
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Language & Gender Selection Banner */}
        <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-neutral-400 font-medium shrink-0">Language:</span>
            {WELCOME_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  stopAudioPlayback();
                  setSelectedLanguage(lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLanguage === lang.code
                    ? 'bg-orange-500 text-neutral-950 shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>

          {/* Student Gender & Voice Rule Indicator / Switcher */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-neutral-400">I am:</span>
            <button
              type="button"
              onClick={() => {
                stopAudioPlayback();
                const newGender = studentGender === 'female' ? 'male' : 'female';
                setStudentGender(newGender);
                updateStudentProfile({ gender: newGender });
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Click to switch gender & companion voice"
            >
              <span>{studentGender === 'female' ? '👧 Girl / Female' : '👦 Boy / Male'}</span>
              <span className="text-neutral-400 font-normal">→ Voice:</span>
              <span className="text-amber-300 font-bold">{studentGender === 'female' ? '👨 Male' : '👩 Female'}</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-neutral-950 font-bold text-sm shrink-0 shadow-md">
                    {studentGender === 'female' ? '👨' : '👩'}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tl-sm'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-medium rounded-tr-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {isBot && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Smile className="w-3 h-3 text-orange-400" />
                        <span>Just like a friend</span>
                      </span>
                      {msg.spokenScript && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.spokenScript || msg.text, selectedLanguage, voiceGender)}
                          className="hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen again</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {studentFirstName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 items-start justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-neutral-950 font-bold text-sm shrink-0 animate-pulse">
                {studentGender === 'female' ? '👨' : '👩'}
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>Your friend is thinking and listening...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Conversation Suggestion Chips */}
        <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/80 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Quick Share:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.text)}
              className="px-2.5 py-1.5 rounded-full bg-neutral-800 hover:bg-orange-500/20 hover:border-orange-500/40 border border-neutral-700/80 text-[11px] text-neutral-200 hover:text-orange-300 font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col gap-2.5 shrink-0">
          {/* Live Audio Listening Feedback Banner */}
          {isListening && (
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-2.5">
                <span className="flex gap-0.5 items-end h-3.5">
                  <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                  <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                  <span className="w-1 bg-rose-400 rounded-full animate-bounce h-2" />
                  <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.25s] h-3.5" />
                </span>
                <span className="font-medium text-[11px] sm:text-xs">
                  {selectedLanguage === 'kn'
                    ? 'ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ (ಗುರಿ, ಸಂಶಯಗಳು, ಕುಟುಂಬ)!'
                    : 'Listening in real-time... Speak your aim, doubts, or family members!'}
                </span>
              </div>
              <button
                type="button"
                onClick={stopSpeechRecognition}
                className="px-2.5 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] sm:text-[11px] transition-colors cursor-pointer"
              >
                Done / Send
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Speak Button */}
            <button
              type="button"
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-neutral-700'
              }`}
              title={isListening ? 'Stop listening' : 'Speak to your friend in Kannada / your language'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to you speak...'
                  : selectedLanguage === 'kn'
                  ? 'ನಿಮ್ಮ ಗುರಿ, ಸಂಶಯಗಳು, ಮನೆಯ ಬಗ್ಗೆ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                  : 'Type your aim, doubts, or family members here...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm hover:opacity-95 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Action Row: Start Studying / Go to Dashboard */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              {studentAim && (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Aim Saved
                </span>
              )}
              {familyMembers && (
                <span className="text-amber-300 flex items-center gap-1 font-semibold">
                  <Heart className="w-3 h-3" /> Family Noted
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                stopAudioPlayback();
                if (onContinueToDashboard) {
                  onContinueToDashboard();
                } else {
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
            >
              <span>Start Learning in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
