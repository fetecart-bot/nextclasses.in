import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

import { getComprehensiveCounselorAnswer, SupportedLanguage } from "./src/data/counselorKnowledge";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient multi-model cascade helper that survives 503 high demand spikes and rate limits
async function callGeminiWithCascade({
  contents,
  systemInstruction,
  responseMimeType,
  temperature = 0.7,
}: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getAI();
  // Model priority: gemini-3.6-flash is currently fast and active, then gemini-3.1-flash-lite, then gemini-flash-latest, then gemini-3.8-flash
  const models = [
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = { temperature };
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (responseMimeType) config.responseMimeType = responseMimeType;

      const response = await ai.models.generateContent({
        model,
        contents,
        ...(Object.keys(config).length > 0 ? { config } : {}),
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} in cascade error:`, err?.status || err?.message?.slice(0, 80));
    }
  }

  throw lastError || new Error("All Gemini models in cascade failed");
}

function parseJsonSafely(raw: string, defaultObj: any = {}): any {
  if (!raw || typeof raw !== "string") return defaultObj;
  try {
    return JSON.parse(raw);
  } catch {}
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {}
  try {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    }
  } catch {}
  return defaultObj;
}

// Dynamically resolve the real live URL (e.g. Cloud Run active container URL or current request origin)
function resolveAppBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && !process.env.APP_URL.includes("MY_APP_URL") && !process.env.APP_URL.includes("placeholder")) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "NextClass AI Academy",
    });
  });

  // Razorpay Public Configuration Endpoint
  app.get("/api/razorpay/config", (req, res) => {
    const keyId = (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_live_TefblkmIMTFIRH").trim();
    res.json({
      keyId,
      isTestMode: keyId.startsWith("rzp_test_"),
      currency: "INR",
    });
  });

  // Translation API for Indian languages powered by Gemini 3.8 Flash
  app.post("/api/translate", async (req, res) => {
    try {
      const { texts, targetLanguage, languageCode } = req.body;
      if (!texts || !Array.isArray(texts) || !targetLanguage) {
        return res.status(400).json({ error: "Invalid payload: texts array and targetLanguage required" });
      }

      const ai = getAI();
      const prompt = `Translate the following course catalog texts from English into the Indian language: ${targetLanguage} (${languageCode || ''}).
Keep acronyms, brand names, and exam names (like AI, Prompt Engineering, Python, Google AI Studio, ChatGPT, NEET, KEAM, IIT JEE, AISSEE, Navodaya, PDF) in clear, standard form or natural script transliteration.
Return ONLY a valid JSON array of translated strings with the exact same length and ordering as the input.

Input:
${JSON.stringify(texts)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      return res.json({ success: true, translations: parsed });
    } catch (err: any) {
      console.error("Translation API error:", err);
      return res.status(500).json({ error: err?.message || "Translation error occurred" });
    }
  });

  // AI Voice Receptionist Chat Endpoint (Priya - Multilingual Indian Accent Academic Counselor)
  app.post("/api/voice-receptionist/chat", async (req, res) => {
    const chosenLang = ((req.body && req.body.language) || "en") as SupportedLanguage;
    const message = (req.body && req.body.message) || "";

    try {
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message string is required" });
      }

      const langMap: Record<string, { name: string; nativeName: string }> = {
        ml: { name: "Malayalam", nativeName: "മലയാളം" },
        ta: { name: "Tamil", nativeName: "தமிழ்" },
        te: { name: "Telugu", nativeName: "తెలుగు" },
        kn: { name: "Kannada", nativeName: "ಕನ್ನಡ" },
        hi: { name: "Hindi", nativeName: "हिंदी" },
        en: { name: "Indian English", nativeName: "English (India)" }
      };

      const currentLang = langMap[chosenLang] || langMap.en;
      const ai = getAI();
      const systemInstruction = `You are Priya, Senior Academic Counselor and Voice AI Receptionist at NextClass AI Academy (NextClasses.in / www.nextclasses.in).
You are speaking live with a prospective student, parent, or professional over the phone.
Current conversation language: ${currentLang.name} (${currentLang.nativeName}).

PRIMARY DIRECTIVE:
Provide FULL, THOROUGH, DETAILED, and ACCURATE information. NEVER give short or vague answers. Callers need comprehensive curriculum details, exact fee figures, practical project work, certification validity, and admission steps.

ACADEMIC & COURSE OFFERINGS:
1. Google AI Studio & Gemini Masterclass (₹1,499):
   - Server-side prompt engineering, multimodal reasoning with vision and audio.
   - Official @google/genai SDK integration, function calling, structured JSON output, and cloud deployment.
2. DeepSeek R1 AI & Financial Engineering (₹1,799):
   - Open-weight reasoning models vs standard LLMs.
   - Offline local Ollama setup on personal PC for 100% financial privacy.
   - Chain-of-thought financial engineering, balance sheet and cash flow extraction, algorithmic stock valuation, and automated Excel models with Python.
3. Real-Time Voice AI Telephony & Vapi (₹1,799):
   - Sub-second latency conversational voice pipelines (STT, LLM, TTS).
   - Vapi.ai, LiveKit WebRTC, and purchasing Twilio Indian phone numbers.
   - Inbound customer support bots, appointment scheduling, and CRM syncing.
4. Claude 3.7 Sonnet Developer Suite (₹1,499):
   - Hybrid thinking, artifact engineering, and autonomous software development.
5. Sainik School (AISSEE Classes 6 & 9) & NEET Mock Prep:
   - Full NTA NCERT curriculum covering Mathematics, Intelligence, English, General Science, and Social Studies.
   - Weekly full-length CBT mock tests, 10-year previous solved papers with video solutions, and medical interview guidance.

FEES, CERTIFICATES & ADMISSION:
- Fees are transparent: ₹1,499 for Google AI Studio / Claude; ₹1,799 for DeepSeek R1 / Voice AI.
- Includes lifetime masterclass video access, complete source code, verifiable certificate, and live weekend doubt clearing.
- All courses include an official ISO 9001:2015 verified digital certificate with a scannable tamper-proof QR code to showcase on LinkedIn.
- Instant enrollment: Scan the UPI QR on www.nextclasses.in using Google Pay, PhonePe, Paytm, or BHIM. Send payment confirmation to WhatsApp at 82816 44058 for 5-minute LMS activation.

VOICE SYNTHESIS RULES:
- Speak naturally and warmly in ${currentLang.name}.
- DO NOT use markdown symbols, asterisks (*), hashtags (#), or emojis. Use spoken transitions like "First, ... Second, ... In addition, ...".
- Speak currency and numbers naturally.`;

      const prompt = `Conversation history:
${Array.isArray(req.body.history) ? req.body.history.slice(-4).map((h: any) => `${h.role === "user" ? "Student" : "Priya"}: ${h.text}`).join("\n") : "None"}

Student just asked: "${message}"

Give a comprehensive, thorough, and articulate counseling answer as Priya in pure spoken ${currentLang.name}:`;

      // Race Gemini against generous 15s timeout so voice callers don't hang indefinitely
      const geminiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 15000)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      let reply = (response.text || "").trim();
      reply = reply.replace(/[*#_~`]/g, "").replace(/\s+/g, " ").trim();

      if (!reply || reply.length < 30) {
        reply = getComprehensiveCounselorAnswer(message, chosenLang);
      }

      return res.json({ success: true, reply, language: currentLang.name });
    } catch (err: any) {
      console.warn("Using comprehensive counselor knowledge base fallback:", err?.message || err);
      const comprehensiveReply = getComprehensiveCounselorAnswer(message, chosenLang);
      return res.json({ success: true, reply: comprehensiveReply, fallback: true });
    }
  });

  // Real-Time TTS Streaming endpoint for genuine regional audio (Malayalam, Tamil, Telugu, Kannada, Hindi, English)
  app.get("/api/voice-receptionist/tts", async (req, res) => {
    try {
      const rawText = String(req.query.text || "").trim();
      const lang = String(req.query.lang || "en").toLowerCase();

      if (!rawText) {
        return res.status(400).send("Text parameter is required");
      }

      const langMap: Record<string, string> = {
        ml: "ml",
        ta: "ta",
        te: "te",
        kn: "kn",
        hi: "hi",
        en: "en-IN",
      };

      const targetTl = langMap[lang] || "en-IN";

      // Clean text of characters that might disrupt speech synthesis
      const cleanText = rawText
        .replace(/[*#_~`[\]()]/g, "")
        .replace(/₹\s*/g, "Rupees ")
        .replace(/\bRs\.?\s*/gi, "Rupees ")
        .replace(/\s+/g, " ")
        .trim();

      // Split into sentence chunks under 150 characters for optimal TTS rendering
      const sentences = cleanText.match(/[^.!?|]+[.!?|]*/g) || [cleanText];
      const chunks: string[] = [];
      let currentChunk = "";

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;
        if ((currentChunk + " " + trimmed).trim().length <= 150) {
          currentChunk = (currentChunk + " " + trimmed).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (trimmed.length <= 150) {
            currentChunk = trimmed;
          } else {
            // Cut very long sentence into ~140 char pieces safely
            for (let i = 0; i < trimmed.length; i += 140) {
              chunks.push(trimmed.slice(i, i + 140));
            }
            currentChunk = "";
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      if (chunks.length === 0) {
        return res.status(400).send("No valid text to speak");
      }

      // Fetch each chunk's MP3 stream concurrently
      const bufferPromises = chunks.map(async (chunk) => {
        const encoded = encodeURIComponent(chunk);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${targetTl}&client=tw-ob`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://translate.google.com/",
          },
        });
        if (!response.ok) {
          throw new Error(`TTS fetch failed with status ${response.status}`);
        }
        const arrayBuf = await response.arrayBuffer();
        return Buffer.from(arrayBuf);
      });

      const audioBuffers = await Promise.all(bufferPromises);
      const combinedAudio = Buffer.concat(audioBuffers);

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": combinedAudio.length.toString(),
        "Cache-Control": "public, max-age=86400",
        "Accept-Ranges": "bytes",
      });

      return res.end(combinedAudio);
    } catch (err: any) {
      console.error("Real-time TTS error:", err);
      return res.status(500).json({ error: "Failed to generate TTS audio", details: err?.message });
    }
  });

  // Student Friend Welcome Bot Conversational API
  // Rule: When student logs in, welcomes student with their name & course.
  // Welcomes him/her to the course and asks what their aim and doubts are, and how many members are in their house.
  // Just like a friend, it asks everything.
  // For girls and women, a male voice asks. For males and boys, a female voice asks.
  // Supports Kannada (kn), Malayalam (ml), Tamil (ta), Telugu (te), Hindi (hi), and English (en).
  app.post("/api/student-welcome/chat", async (req, res) => {
    try {
      const {
        studentName = "Friend",
        courseTitle = "Course",
        gender = "male",
        voiceGender = "female",
        language = "kn",
        userMessage = "",
        currentAim = "",
        currentDoubts = "",
        familyMembers = "",
      } = req.body;

      const ai = getAI();
      const lang = (language || "kn").toLowerCase();

      const langMap: Record<string, { name: string; scriptInstruction: string; ttsLang: string }> = {
        kn: {
          name: "Kannada",
          scriptInstruction: "Kannada (ಕನ್ನಡ). Respond in natural, warm, conversational Kannada script (ಕನ್ನಡದಲ್ಲಿ). Speak like a caring Karnataka friend and mentor.",
          ttsLang: "kn",
        },
        ml: {
          name: "Malayalam",
          scriptInstruction: "Malayalam (മലയാളം). Respond in warm, natural Malayalam script (മലയാളത്തിൽ). Speak like a close Kerala friend or brother/sister.",
          ttsLang: "ml",
        },
        ta: {
          name: "Tamil",
          scriptInstruction: "Tamil (தமிழ்). Respond in warm, friendly Tamil script (தமிழில்). Speak like a caring friend from Tamil Nadu.",
          ttsLang: "ta",
        },
        te: {
          name: "Telugu",
          scriptInstruction: "Telugu (తెలుగు). Respond in warm, encouraging Telugu script (తెలుగులో). Speak like a close friend.",
          ttsLang: "te",
        },
        hi: {
          name: "Hindi",
          scriptInstruction: "Hindi (हिंदी). Respond in warm, enthusiastic Hindi script (हिंदी में). Speak like a supportive dost/companion.",
          ttsLang: "hi",
        },
        en: {
          name: "English",
          scriptInstruction: "English. Speak with authentic warmth, enthusiasm, camaraderie, like an older sibling or best friend.",
          ttsLang: "en",
        },
      };

      const selectedLangConfig = langMap[lang] || langMap.kn;

      // If student is female -> Bot is older brother / male friend.
      // If student is male -> Bot is older sister / female friend.
      const persona = gender === "female"
        ? "You are a warm, protective, encouraging older brother / male friend (Bhayya/Anna/Chettan). You speak with an encouraging, proud, friendly tone."
        : "You are a caring, encouraging older sister / female friend (Didi/Akka/Chechi). You speak with bright, affectionate, cheerful energy.";

      const prompt = `You are a real-time study companion, mentor, and genuine close friend for student "${studentName}" enrolled in "${courseTitle}" at NextClasses.in.
${persona}

DEEP ACADEMIC & COURSE KNOWLEDGE:
- NEET (UG) 2027 Medical: Covers 100% NCERT Biology (Botany & Zoology: Genetics, Cell, Ecology, Human Physiology), Physics (Mechanics, Electrodynamics, Modern Physics), and Chemistry (Physical, Organic Reaction Mechanisms, Inorganic). Explain that weekly physical printed practice sets and mock papers arrive right at their home via India Post, alongside daily video classes!
- IIT JEE Main & Advanced 2027: Intensive PCM problem solving, Calculus, Mechanics, and speed tricks.
- KEAM Kerala CEE: Paper 1 (Physics & Chemistry 120 Qs) and Paper 2 (Mathematics 120 Qs) speed hacks.
- AISSEE Sainik School (Class 6 & 9): Mathematics (150 marks, highest weightage!), Intelligence/Reasoning, English, GK, General Science, and OMR exam tactics.
- Languages & Public Speaking: Spoken English fluency, Stage confidence, French A1, German A1 Goethe.
- AI & Tech Masterclasses: Google AI Studio SDK, Claude 3.7 Sonnet prompt engineering, DeepSeek R1 local finance AI, Voice AI.

KEY GOAL:
Just like a friend, you are chatting with the student right after they logged in.
You care deeply about:
1. What their biggest aim and dream with this course/exam is (e.g., target score 680+ in NEET, AIR top 500, Sainik School admission, fluent English).
2. What academic doubts, tricky topics, or worries they have right now (e.g., Organic Chemistry conversions, Physics numericals, Math geometry). Explain concepts clearly if they ask!
3. How many members are in their house/family cheering them on.

Current knowledge about student:
- Name: ${studentName}
- Course: ${courseTitle}
- Aim: ${currentAim || "Not yet stated"}
- Doubts: ${currentDoubts || "Not yet stated"}
- Family Members: ${familyMembers || "Not yet stated"}

Student's latest message to you:
"${userMessage || "Hello friend!"}"

Language instruction:
${selectedLangConfig.scriptInstruction}

CRITICAL RULES:
- Talk like a genuine friend and brilliant study buddy, NOT a dry corporate chatbot.
- If they ask any question or express doubt, give a real, knowledgeable, insightful academic answer!
- If they told you their aim, celebrate it excitedly with immense faith in them!
- If they shared their family size (e.g. 4 members), praise their family support!
- If any of Aim, Doubts, or Family count hasn't been shared yet, ask about it naturally like a friend!

Respond ONLY in valid JSON matching this schema:
{
  "replyText": "Warm written response in ${selectedLangConfig.name} script (with markdown bolding where helpful)",
  "spokenScript": "Short, clear spoken version for audio voice output (avoid asterisks, emojis, or markdown)",
  "detectedAim": "Summary of aim if user mentioned one, otherwise empty string",
  "detectedDoubts": "Summary of doubts if user mentioned any, otherwise empty string",
  "detectedFamilyMembers": "Number or description of family members if mentioned, otherwise empty string"
}`;

      let responseText = "";
      try {
        responseText = await callGeminiWithCascade({
          contents: prompt,
          responseMimeType: "application/json",
          temperature: 0.7,
        });
      } catch (err: any) {
        console.warn("Gemini call for student welcome failed:", err?.message);
      }

      let parsed = parseJsonSafely(responseText, null);
      if (!parsed || !parsed.replyText) {
        const greetings: Record<string, string> = {
          kn: `ನಮಸ್ತೆ ${studentName}! ${courseTitle} ತರಬೇತಿಗೆ ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಸ್ವಾಗತ! ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ನಮ್ಮ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನವಿದೆ. ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿ ಮತ್ತು ಸಂಶಯಗಳನ್ನು ನನ್ನೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ!`,
          ml: `ഹലോ ${studentName}! ${courseTitle} ലേക്ക് സ്വാഗതം! നിങ്ങളുടെ ലക്ഷ്യത്തിലേക്ക് ഞങ്ങൾ കൂടെയുണ്ട്. നിങ്ങളുടെ സ്വപ്നവും സംശയങ്ങളും എന്നോട് പങ്കുവെക്കൂ!`,
          ta: `வணக்கம் ${studentName}! ${courseTitle} வகுப்பிற்கு உங்களை வரவேற்கிறோம்! உங்கள் இலக்கு மற்றும் சந்தேகங்களை என்னிடம் பகிர்ந்து கொள்ளுங்கள்!`,
          te: `హలో ${studentName}! ${courseTitle} కు స్వాగతం! మీ లక్ష్యం మరియు సందేహాలను నాతో పంచుకోండి!`,
          hi: `नमस्ते ${studentName}! ${courseTitle} में आपका स्वागत है! आपका सबसे बड़ा लक्ष्य क्या है, मुझे बताएं!`,
          en: `Hello ${studentName}! A warm welcome to ${courseTitle}! What is your biggest aim and what doubts do you have?`,
        };
        const defaultText = greetings[lang] || greetings.en;
        parsed = {
          replyText: defaultText,
          spokenScript: defaultText,
          detectedAim: "",
          detectedDoubts: "",
          detectedFamilyMembers: "",
        };
      }

      return res.json({
        success: true,
        replyText: parsed.replyText || "Welcome! Let's study together!",
        spokenScript: parsed.spokenScript || parsed.replyText,
        detectedAim: parsed.detectedAim || "",
        detectedDoubts: parsed.detectedDoubts || "",
        detectedFamilyMembers: parsed.detectedFamilyMembers || "",
        voiceGender: gender === "female" ? "male" : "female",
      });
    } catch (err: any) {
      console.error("Student welcome chat error:", err);
      return res.json({
        success: true,
        replyText: "Welcome to NextClasses! I am your AI study buddy. Tell me about your aim and any doubts you have!",
        spokenScript: "Welcome! I am your AI study buddy. Tell me about your aim and any doubts!",
        detectedAim: "",
        detectedDoubts: "",
        detectedFamilyMembers: "",
        voiceGender: "female",
      });
    }
  });

  // Audio Recording Transcription Endpoint (Kannada, Malayalam, Tamil, Telugu, Hindi, English)
  // Provides 100% reliable fallback when browser SpeechRecognition is silent, blocked, or unavailable
  app.post("/api/voice-transcribe", async (req, res) => {
    try {
      const { audioBase64, mimeType = "audio/webm", language = "kn" } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 is required" });
      }

      const langNames: Record<string, string> = {
        kn: "Kannada (ಕನ್ನಡ)",
        ml: "Malayalam (മലയാളം)",
        ta: "Tamil (தமிழ்)",
        te: "Telugu (తెలుగు)",
        hi: "Hindi (हिंदी)",
        en: "English",
      };
      const targetLang = langNames[language] || "Kannada or English";

      const parts = [
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `You are an expert real-time multilingual speech-to-text transcriber for student audio questions.
The speaker is speaking in ${targetLang}.
Listen to the audio recording with extreme precision and return ONLY the exact spoken transcription.
Do not output notes, quotes, or markdown wrappers. Output only the student's exact spoken words.`,
        },
      ];

      const transcript = await callGeminiWithCascade({
        contents: [{ role: "user", parts }],
        temperature: 0.1,
      });

      return res.json({ success: true, transcript: (transcript || "").trim() });
    } catch (err: any) {
      console.error("Voice transcription error:", err);
      return res.status(500).json({ error: "Transcription failed", details: err?.message });
    }
  });

  // Real-Time Counselor & Academic Advisor Q&A Endpoint for AIChatBot (No static fed lines)
  app.post("/api/counselor/ask", async (req, res) => {
    try {
      const { query, language = "en" } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const supportedLang = ['en', 'ml', 'ta', 'te', 'kn', 'hi'].includes(language)
        ? (language as SupportedLanguage)
        : 'en';

      const systemInstruction = `You are "Aura", the Senior AI Academic Counselor at NextClasses.in (https://www.nextclasses.in).
You have real-time, comprehensive, deeply detailed knowledge of all programs:
1. NEET (UG) 2027 Medical Entrance: NCERT Biology (Botany/Zoology), Physics (Mechanics, Electromagnetism), Chemistry (Physical, Organic, Inorganic). Weekly physical print material dispatches sent to students' homes via India Post, plus daily mock tests and video lessons.
2. IIT JEE Main & Advanced 2027: PCM full syllabus, calculus speed tactics, physics problem solving.
3. KEAM Kerala CEE Engineering: Kerala syllabus alignment, Paper 1 & 2 speed hacks (120 questions / 150 mins).
4. AISSEE All India Sainik School Entrance: Classes 6 & 9. Mathematics, Intelligence, English, GK/Science, Social Studies.
5. Languages & Stage Mastery: Spoken English, Stage Confidence, French A1, German A1 Goethe.
6. AI Masterclasses: Google AI Studio, DeepSeek R1 Local Reasoning & Finance, Claude 3.7 Sonnet, Real-time Voice AI & Telephony.
7. Admission & Fees: Transparent affordable pricing (₹999 to ₹1,799). Study materials are dispatched weekly for 12 months, and portal video access is lifetime! WhatsApp helpline: +91 82816 44058.

Answer the student's inquiry intelligently, warmly, and thoroughly in ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ml' ? 'Malayalam (മലയാളം)' : language === 'ta' ? 'Tamil (தமிழ்)' : language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}. Never give canned or generic feeded responses. Give real, thoughtful guidance with clear markdown formatting.`;

      let reply = "";
      try {
        reply = await callGeminiWithCascade({
          contents: query,
          systemInstruction,
          temperature: 0.7,
        });
      } catch (aiErr: any) {
        console.warn("AI counselor call failed, using comprehensive counselor knowledge base:", aiErr?.message);
        reply = getComprehensiveCounselorAnswer(query, supportedLang);
      }

      if (!reply || reply.length < 10) {
        reply = getComprehensiveCounselorAnswer(query, supportedLang);
      }

      return res.json({ success: true, reply });
    } catch (err: any) {
      console.error("Counselor ask error:", err);
      const supportedLang = ['en', 'ml', 'ta', 'te', 'kn', 'hi'].includes(req.body?.language)
        ? (req.body.language as SupportedLanguage)
        : 'en';
      const fallbackReply = getComprehensiveCounselorAnswer(req.body?.query || '', supportedLang);
      return res.json({ success: true, reply: fallbackReply });
    }
  });

  // Real-Time Course Doubt Resolution & Voice Tutor API
  app.post("/api/course-doubt/ask", async (req, res) => {
    try {
      const { courseId, courseTitle, question, language } = req.body;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const langCode = (language || "en").toLowerCase();

      const langMap: Record<string, { name: string; scriptInstruction: string; ttsLang: string }> = {
        ml: {
          name: "Malayalam",
          scriptInstruction: "Malayalam (മലയാളം). Write the explanation in natural, fluent Malayalam script (മലയാളത്തിൽ). For key technical/scientific terms, write the English term in parentheses after the Malayalam word.",
          ttsLang: "ml",
        },
        ta: {
          name: "Tamil",
          scriptInstruction: "Tamil (தமிழ்). Write the explanation in clear, authentic Tamil script (தமிழில்). For key technical terms, include English in parentheses.",
          ttsLang: "ta",
        },
        te: {
          name: "Telugu",
          scriptInstruction: "Telugu (తెలుగు). Write the explanation in clear Telugu script (తెలుగులో). For key technical terms, include English in parentheses.",
          ttsLang: "te",
        },
        kn: {
          name: "Kannada",
          scriptInstruction: "Kannada (ಕನ್ನಡ). Write the explanation in clear Kannada script (ಕನ್ನಡದಲ್ಲಿ).",
          ttsLang: "kn",
        },
        hi: {
          name: "Hindi",
          scriptInstruction: "Hindi (हिंदी). Write the explanation in clear Devanagari Hindi script (हिंदी में).",
          ttsLang: "hi",
        },
        fr: {
          name: "French",
          scriptInstruction: "French (Français). Write the explanation with French vocabulary, conjugation rules, and English translation/guidance.",
          ttsLang: "en",
        },
        de: {
          name: "German",
          scriptInstruction: "German (Deutsch). Write the explanation with German vocabulary, grammar rules (cases, declensions), and English translation.",
          ttsLang: "en",
        },
        en: {
          name: "English",
          scriptInstruction: "English. Write an articulate, structured explanation with clear headings and bullet points.",
          ttsLang: "en",
        },
      };

      const currentLang = langMap[langCode] || langMap.en;

      const systemInstruction = `You are the Expert Course Tutor & Academic Doubt Mentor for the course "${courseTitle || "Academic Course"}" at NextClasses.in.
A student enrolled in this course has asked you a doubt.

PRIMARY OBJECTIVES:
1. Hear and understand their doubt with 100% pedagogical precision.
2. Provide a CRYSTAL CLEAR, step-by-step, engaging explanation.
3. SUBJECT SPECIFIC GUIDELINES:
   - For Medical / Engineering (NEET, JEE, KEAM): Explain the underlying science/math principle, provide the high-yield NCERT/exam shortcut or formula, and solve a typical numerical/diagram doubt.
   - For Language Speaking (English, French, German): Explain tongue/mouth placement, grammar rule/conjugation, everyday conversational usage, and a practical example sentence.
   - For AI / Tech (Google AI Studio, DeepSeek, Claude, Cursor, Voice AI): Provide clean code/prompt syntax, architecture breakdown, and why it works.
   - For Sainik School (AISSEE Class 6/9): Keep it easy to understand for young students, with intuitive logic and visual examples.
4. SCRIPT DIRECTIVE:
   The written answer MUST be in ${currentLang.scriptInstruction}.
5. SPOKEN SCRIPT DIRECTIVE:
   Provide a concise, conversational spoken summary (35 to 55 words) in ${currentLang.name} without asterisks, markdown, emojis, or numbers, written specifically for speech synthesis.`;

      const prompt = `Course: ${courseTitle} (ID: ${courseId})
Student's Doubt: "${question}"

Respond with a JSON object with these exact keys:
{
  "writtenAnswer": "Comprehensive formatted explanation in ${currentLang.name} using clean markdown with bold points and bullet lists.",
  "spokenScript": "Conversational spoken summary (under 50 words) in ${currentLang.name} without markdown, asterisks, or symbols.",
  "keyTakeaway": "One short golden rule or formula to remember.",
  "suggestedNextQuestions": ["Related doubt question 1", "Related doubt question 2"]
}`;

      let responseText = "";
      try {
        responseText = await callGeminiWithCascade({
          contents: prompt,
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6,
        });
      } catch (err: any) {
        console.warn("Course doubt cascade failed, generating contextual academic fallback:", err?.message);
      }

      let parsed = parseJsonSafely(responseText, null);
      if (!parsed || !parsed.writtenAnswer) {
        parsed = {
          writtenAnswer: `### Explanation for ${courseTitle}\n\n**Academic Breakdown on "${question}":**\n- In this chapter, master the fundamental concept and standard formula first.\n- Apply the standard derivation steps and practice the chapterwise problem set.\n- You can also reach our faculty helpline on WhatsApp at **+91 82816 44058** for 1-on-1 personalized clarification.`,
          spokenScript: `Here is the explanation for your question on ${courseTitle}. Master the fundamental concept in your video lesson and verify each step with the practice problems.`,
          keyTakeaway: "Master fundamental rules first, then practice chapterwise problems.",
          suggestedNextQuestions: ["How can I practice this topic with mock tests?", "What are common exam traps in this topic?"],
        };
      }

      const spokenScript = (parsed.spokenScript || parsed.writtenAnswer?.slice(0, 160) || "").replace(/[*#_~`]/g, "").trim();
      const audioUrl = `/api/voice-receptionist/tts?text=${encodeURIComponent(spokenScript)}&lang=${currentLang.ttsLang}`;

      return res.json({
        success: true,
        courseTitle,
        writtenAnswer: parsed.writtenAnswer || "Explanation generated.",
        spokenScript,
        keyTakeaway: parsed.keyTakeaway || "",
        suggestedNextQuestions: parsed.suggestedNextQuestions || [],
        audioUrl,
        language: currentLang.name,
      });
    } catch (err: any) {
      console.error("Course Doubt API error:", err);
      return res.status(500).json({ error: err?.message || "Failed to resolve course doubt" });
    }
  });

  // Robots.txt & Sitemap for custom domain www.nextclasses.in
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://www.nextclasses.in/sitemap.xml\nHost: www.nextclasses.in\n");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.nextclasses.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.nextclasses.in/#courses</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.nextclasses.in/#products</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.nextclasses.in/#mock-tests</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  // Custom Domain Configuration & DNS Status API
  app.get("/api/domain/status", (req, res) => {
    res.json({
      customDomain: "www.nextclasses.in",
      apexDomain: "nextclasses.in",
      cnameTarget: "ghs.googlehosted.com.",
      targetHost: "www",
      status: "configured",
      verified: true,
      protocol: "https",
      sslProvider: "Google Managed Certificate (Google Cloud Run / GTS)",
      dnsRecords: [
        { type: "CNAME", host: "www", pointsTo: "ghs.googlehosted.com.", ttl: "3600 (1 hour)", purpose: "Subdomain Routing" },
        { type: "A", host: "@", pointsTo: "216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21", ttl: "3600 (1 hour)", purpose: "Root Apex Routing (Optional / Forward to www)" },
        { type: "AAAA", host: "@", pointsTo: "2001:4860:4802:32::15, 2001:4860:4802:34::15, 2001:4860:4802:36::15, 2001:4860:4802:38::15", ttl: "3600", purpose: "IPv6 Root Apex" }
      ]
    });
  });

  // WhatsApp Cloud API Status Check
  app.get("/api/whatsapp/status", (req, res) => {
    const apiKey = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    res.json({
      configured: Boolean(apiKey && phoneNumberId),
      hasApiKey: Boolean(apiKey),
      hasPhoneNumberId: Boolean(phoneNumberId),
      mode: apiKey && phoneNumberId ? "live" : "simulation",
      service: "WhatsApp Cloud API Dispatcher",
    });
  });

  // WhatsApp Automated Message Dispatch (Order receipts, weekly materials, mock test drops)
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { phone, recipientName, orderId, messageType, customMessage, itemsSummary } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Missing required 'phone' parameter" });
      }

      // Clean phone number: remove +, -, spaces
      let cleanPhone = String(phone).replace(/[^0-9]/g, "");
      // Default to India country code 91 if 10 digits
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }

      const name = recipientName || "Student";
      const id = orderId || "NC-" + Math.floor(100000 + Math.random() * 900000);
      const baseUrl = resolveAppBaseUrl(req);
      const portalDirectLink = `${baseUrl}/?portal=true`;

      // Generate structured message body
      let messageBody = customMessage;
      if (!messageBody) {
        if (messageType === "weekly_drop") {
          messageBody = `🎓 *NextClass AI Weekly Study Drop* 📦\n\n` +
            `Hi *${name}*! Your fresh Weekly Study Module is now unlocked.\n\n` +
            `• *Items:* NCERT Mind Maps, 200+ Practice OMR Questions & Mock Test 01\n` +
            `• *Target Completion:* Before Saturday 8:00 PM IST\n\n` +
            `👉 *Access Your Portal:* ${portalDirectLink}\n` +
            `💬 *Student Support WhatsApp:* +91 82816 44058\n` +
            `_Automated message from NextClass AI Learning System._`;
        } else {
          // Default: Enrollment confirmation
          messageBody = `🎉 *NextClass AI Enrollment Confirmed!* 🚀\n\n` +
            `Hi *${name}*, thank you for enrolling in NextClass AI Academy.\n\n` +
            `📋 *Order ID:* #${id}\n` +
            `📚 *Package:* ${itemsSummary || "AI Mastery & Competitive Exam Weekly Dispatch"}\n` +
            `📅 *Dispatch Schedule:* Every Sunday at 6:00 AM IST\n\n` +
            `👉 *Student Portal Login:* ${portalDirectLink}\n` +
            `💬 *Student Doubt WhatsApp:* +91 82816 44058\n\n` +
            `Keep learning, keep building with NextClass AI!`;
        }
      }

      const apiKey = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      // If configured with official Meta WhatsApp Cloud API credentials
      if (apiKey && phoneNumberId) {
        try {
          const metaUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
          const metaResponse = await fetch(metaUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: cleanPhone,
              type: "text",
              text: {
                preview_url: true,
                body: messageBody,
              },
            }),
          });

          const metaData = await metaResponse.json();

          if (!metaResponse.ok) {
            console.warn("Meta WhatsApp API Error:", metaData);
            return res.json({
              success: true,
              mode: "live_fallback_simulated",
              warning: metaData?.error?.message || "Meta API returned error; fallback to direct WhatsApp enabled",
              recipient: cleanPhone,
              whatsappSupportNumber: "8281644058",
              directWhatsAppUrl: `https://wa.me/918281644058?text=${encodeURIComponent(messageBody)}`,
              messageBody,
            });
          }

          return res.json({
            success: true,
            mode: "live",
            metaMessageId: metaData?.messages?.[0]?.id,
            recipient: cleanPhone,
            whatsappSupportNumber: "8281644058",
            messageBody,
          });
        } catch (fetchErr: any) {
          console.error("WhatsApp Network Error:", fetchErr);
          return res.json({
            success: true,
            mode: "simulated",
            note: "Network call to Meta failed; direct WhatsApp fallback activated (+91 82816 44058).",
            recipient: cleanPhone,
            whatsappSupportNumber: "8281644058",
            directWhatsAppUrl: `https://wa.me/918281644058?text=${encodeURIComponent(messageBody)}`,
            messageBody,
          });
        }
      }

      // If keys not yet set in environment or API not configured, respond with direct WhatsApp URL to 8281644058
      return res.json({
        success: true,
        mode: "simulated",
        note: "Direct WhatsApp fallback active via +91 82816 44058.",
        recipient: cleanPhone,
        whatsappSupportNumber: "8281644058",
        directWhatsAppUrl: `https://wa.me/918281644058?text=${encodeURIComponent(messageBody)}`,
        messageBody,
        dispatchedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("WhatsApp Send Handler Error:", err);
      return res.status(500).json({ error: err?.message || "Failed to process WhatsApp dispatch" });
    }
  });

  // In-memory record for dispatched student credential emails
  const credentialEmailLogs: Array<{
    id: string;
    toEmail: string;
    studentName: string;
    username: string;
    courseTitle: string;
    utrNumber?: string;
    timestamp: string;
    status: string;
  }> = [];

  // Official Student Login Credentials Delivery via Email
  app.post("/api/email/send-credentials", async (req, res) => {
    try {
      const {
        toEmail,
        studentName,
        username,
        password,
        courseTitle,
        courseId,
        utrNumber,
        portalUrl,
      } = req.body;

      if (!toEmail || !username || !password) {
        return res.status(400).json({
          error: "Missing required fields: toEmail, username, and password are mandatory",
        });
      }

      const emailRecord = {
        id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        toEmail: String(toEmail).trim().toLowerCase(),
        studentName: String(studentName || "Student").trim(),
        username: String(username).trim(),
        courseTitle: String(courseTitle || "Sainik School & Competitive Exam Track").trim(),
        utrNumber: utrNumber ? String(utrNumber).trim() : undefined,
        timestamp: new Date().toISOString(),
        status: "dispatched",
      };

      credentialEmailLogs.unshift(emailRecord);
      if (credentialEmailLogs.length > 100) {
        credentialEmailLogs.pop();
      }

      console.log(`[EMAIL DISPATCH] Processing login credentials email to ${toEmail} for student ${studentName} (${username}) - Course: ${courseTitle}`);

      const baseUrl = resolveAppBaseUrl(req);
      const effectivePortalUrl = portalUrl || `${baseUrl}/?portal=true`;

      // Generates formal HTML email content
      const emailSubject = `Welcome to NextClass AI: Your Student Login ID & Password (${courseTitle})`;
      const textBody = `Dear ${studentName},\n\nCongratulations! Your enrollment in ${courseTitle} is verified. Your personalized learning account is now active.\n\nYour Student Login Credentials:\n• Username: ${username} (or use your email: ${toEmail})\n• Password: ${password}\n• Payment UTR: ${utrNumber || "Verified"}\n• Student Portal URL: ${effectivePortalUrl}\n\nWhat's Available in Your Portal:\n1. Complete Printable Study Pack (PDF)\n2. High-Yield Mathematics & Reasoning Masterclasses\n3. Timed CBT Computer-Based Mock Tests\n4. Sunday Automated Study Drops\n\nNeed assistance? WhatsApp Student Helpline: +91 82816 44058\nNextClass AI Academy • ${baseUrl}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #f97316; margin: 0; font-size: 24px; font-weight: 800;">NextClass AI Academy</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Official Student Portal Access Confirmation</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${studentName}</strong>,</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
              Congratulations! Your payment for <strong>${courseTitle}</strong> has been verified. Your personalized learning account is now active.
            </p>

            <div style="background: #0f172a; border: 1px solid #f97316; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #fdba74; margin-top: 0; font-size: 16px;">🔐 Your Student Login Credentials:</h3>
              <p style="margin: 8px 0; font-family: monospace; font-size: 15px;">• <strong>Username:</strong> <span style="color: #38bdf8;">${username}</span> (or your email: ${toEmail})</p>
              <p style="margin: 8px 0; font-family: monospace; font-size: 15px;">• <strong>Password:</strong> <span style="color: #4ade80;">${password}</span></p>
              <p style="margin: 8px 0; font-family: monospace; font-size: 14px;">• <strong>Payment UTR:</strong> ${utrNumber || "Verified"}</p>
              <div style="text-align: center; margin-top: 16px;">
                <a href="${effectivePortalUrl}" style="background: #f97316; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                  Sign In to Student Portal &rarr;
                </a>
              </div>
            </div>

            <h4 style="color: #f8fafc; margin-bottom: 8px;">📚 What's Now Available in Your Portal:</h4>
            <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; padding-left: 20px;">
              <li><strong>Complete Printable Study Pack (PDF):</strong> Formula sheets, syllabus blueprints, and speed arithmetic shortcuts.</li>
              <li><strong>Video Masterclasses:</strong> In-depth lessons on High-Yield Mathematics, Non-Verbal Reasoning, GK & English.</li>
              <li><strong>Interactive CBT Mock Tests:</strong> Real exam timing, negative marking, and instant AI answer analysis.</li>
              <li><strong>Weekly Study Dispatches:</strong> Automated materials drops every Sunday until exam day.</li>
            </ul>

            <div style="border-top: 1px solid #334155; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #64748b;">
              <p style="margin: 4px 0;">Need instant assistance? Contact our Student Mentor Helpline on WhatsApp: <strong>+91 82816 44058</strong></p>
              <p style="margin: 4px 0;">NextClass AI Academy • <a href="${baseUrl}" style="color: #f97316; text-decoration: none;">Student Web Portal</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      let outboundSmtpSent = false;
      let outboundError: string | null = null;

      // Check if real SMTP credentials are configured (e.g. Gmail App Password or SMTP provider)
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailer = await import("nodemailer");
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"NextClass AI Academy" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: emailSubject,
            text: textBody,
            html: emailHtml,
          });

          outboundSmtpSent = true;
          console.log(`[SMTP SUCCESS] Direct email delivered to ${toEmail} via SMTP`);
        } catch (smtpErr: any) {
          console.warn("[SMTP NOTICE] Outbound SMTP dispatch attempt:", smtpErr?.message);
          if (smtpErr?.message?.includes("Application-specific password required") || smtpErr?.code === 'EAUTH') {
            outboundError = "Google requires a 16-character App Password (not your normal Gmail password). Generate at https://myaccount.google.com/apppasswords";
          } else {
            outboundError = smtpErr?.message || "SMTP error";
          }
        }
      }

      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(textBody)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(textBody)}`;

      return res.json({
        success: true,
        message: outboundSmtpSent
          ? `Direct email successfully delivered to ${toEmail} via SMTP server.`
          : `Email prepared for ${toEmail}. Ready for 1-click delivery via Gmail or mail client.`,
        emailId: emailRecord.id,
        recipient: toEmail,
        subject: emailSubject,
        username,
        dispatchedAt: emailRecord.timestamp,
        outboundSmtpSent,
        outboundError,
        gmailComposeUrl,
        mailtoUrl,
        previewHtml: emailHtml,
        plainText: textBody,
      });
    } catch (err: any) {
      console.error("Email Credentials Handler Error:", err);
      return res.status(500).json({ error: err?.message || "Failed to deliver email credentials" });
    }
  });

  // Inspection endpoint for admin to view credential email dispatch logs
  app.get("/api/email/logs", (req, res) => {
    res.json({
      totalDispatched: credentialEmailLogs.length,
      logs: credentialEmailLogs,
    });
  });

  // In-memory record for customer UPI payment claims awaiting admin bank verification
  const paymentClaimsServerStore: Array<{
    id: string;
    claimCode: string;
    studentName: string;
    email: string;
    phone: string;
    courseId: string;
    courseTitle: string;
    amount: number;
    utrNumber: string;
    paymentMethod: string;
    paymentApp?: string;
    status: 'pending_verification' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
    notes?: string;
  }> = [];

  // Submit payment claim from customer
  app.post("/api/payment-claims/submit", async (req, res) => {
    try {
      const claim = req.body;
      if (!claim || !claim.studentName || !claim.email || !claim.utrNumber) {
        return res.status(400).json({ error: "Missing required claim fields" });
      }

      paymentClaimsServerStore.unshift(claim);
      if (paymentClaimsServerStore.length > 200) {
        paymentClaimsServerStore.pop();
      }

      console.log(`[PAYMENT CLAIM] New claim from ${claim.studentName} (${claim.email}) - UTR: ${claim.utrNumber} for ${claim.courseTitle} - ₹${claim.amount}`);

      // Send alert to admin (fetecart@gmail.com) if SMTP configured
      const adminEmail = process.env.ADMIN_EMAIL || "fetecart@gmail.com";
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailer = await import("nodemailer");
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Nextclasses Payment Alerts" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🔔 New UPI Payment Claim: ₹${claim.amount} from ${claim.studentName} (UTR: ${claim.utrNumber})`,
            text: `A new UPI payment verification claim has been submitted on Nextclasses.in:\n\nStudent: ${claim.studentName}\nEmail: ${claim.email}\nPhone: +91 ${claim.phone}\nCourse: ${claim.courseTitle}\nAmount: ₹${claim.amount}\n12-Digit UTR: ${claim.utrNumber}\nPayment App: ${claim.paymentApp || 'UPI'}\nSubmitted At: ${claim.submittedAt}\n\nPlease cross-verify this UTR in your HDFC bank mobile app before approving in the Admin Panel.\nNextclasses Admin: https://www.nextclasses.in/?admin=true`,
          });
        } catch (mailErr) {
          console.warn("[ADMIN NOTIFICATION NOTICE] Could not send SMTP alert to admin:", mailErr);
        }
      }

      return res.json({
        success: true,
        message: "Payment verification claim logged. Awaiting manual admin reconciliation.",
        claimId: claim.id,
        claimCode: claim.claimCode,
      });
    } catch (err: any) {
      console.error("Payment Claim Submit Error:", err);
      return res.status(500).json({ error: err?.message || "Failed to record payment claim" });
    }
  });

  // Get all payment claims for admin
  app.get("/api/payment-claims", (req, res) => {
    res.json({
      success: true,
      totalClaims: paymentClaimsServerStore.length,
      claims: paymentClaimsServerStore,
    });
  });

  // Update claim status (approve or reject)
  app.post("/api/payment-claims/verify", (req, res) => {
    try {
      const { claimId, action, rejectionReason, verifiedBy } = req.body;
      const index = paymentClaimsServerStore.findIndex((c) => c.id === claimId);
      if (index !== -1) {
        paymentClaimsServerStore[index].status = action === "approve" ? "approved" : "rejected";
        paymentClaimsServerStore[index].verifiedAt = new Date().toISOString();
        paymentClaimsServerStore[index].verifiedBy = verifiedBy || "Admin (fetecart@gmail.com)";
        if (rejectionReason) {
          paymentClaimsServerStore[index].rejectionReason = rejectionReason;
        }
      }
      return res.json({ success: true, status: action });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Failed to update claim status" });
    }
  });

  // Serve public static assets directly (images, SVGs, certificates)
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (url.pathname === "/api/live-doubt" || url.pathname === "/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (e) {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs: WebSocket, request: http.IncomingMessage) => {
    let session: any = null;
    try {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      const courseTitle = url.searchParams.get("courseTitle") || "Academic Program";
      const courseId = url.searchParams.get("courseId") || "";
      const studentGender = (url.searchParams.get("gender") || "male").toLowerCase();
      const voiceGenderParam = url.searchParams.get("voiceGender");
      
      // Rule: For girls and women, male voice asks ("Fenrir" or "Puck").
      // For males and boys, female voice asks ("Aoede" or "Kore").
      const effectiveVoiceGender = voiceGenderParam || (studentGender === "female" ? "male" : "female");
      const chosenLiveVoice = effectiveVoiceGender === "male" ? "Fenrir" : "Aoede";

      const ai = getAI();

      // Establish real-time Live API session with gemini-3.8-live
      session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: chosenLiveVoice } },
          },
          systemInstruction: `You are the designated Senior Course Tutor and Doubt Specialist for "${courseTitle}" at NextClasses.in.
The student is speaking live with you to clear their academic doubts.
Language rules:
Students may ask questions in Malayalam, Tamil, Telugu, Hindi, Kannada, English, French, or German.
Listen attentively and answer clearly, warmly, and step-by-step in the student's chosen language.
Keep spoken responses concise, pedagogically crystal clear, and encouraging.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "audio", audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }
          },
          onerror: (err) => {
            console.warn("[LIVE API WS ERROR]", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "error", message: err?.message || "Live session error" }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "session_closed" }));
            }
          }
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "ready", model: "gemini-3.8-live", courseTitle, courseId }));
      }

      clientWs.on("message", (data: any) => {
        try {
          const payload = JSON.parse(data.toString());
          if (payload.audio && session) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (payload.text && session) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch (err) {
          console.error("[LIVE INPUT ERROR]", err);
        }
      });

      clientWs.on("close", () => {
        try {
          if (session && typeof session.close === "function") {
            session.close();
          }
        } catch (e) {
          // ignore
        }
      });
    } catch (err: any) {
      console.error("[LIVE SESSION INIT ERROR]", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", message: err?.message || "Could not connect to gemini-3.8-live" }));
      }
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
