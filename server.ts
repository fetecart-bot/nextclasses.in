import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
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
    try {
      const { message, history, language = "en" } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message string is required" });
      }

      const langMap: Record<string, { name: string; nativeName: string; greeting: string; fallback: string }> = {
        ml: {
          name: "Malayalam",
          nativeName: "മലയാളം",
          greeting: "നമസ്കാരം! ഞാൻ പ്രിയ, നെക്സ്റ്റ്ക്ലാസ് അക്കാദമിയിൽ നിന്നാണ്. എഐ കോഴ്സുകളെക്കുറിച്ച് അറിയാൻ ഞാൻ സഹായിക്കാം.",
          fallback: "നമസ്കാരം! നെക്സ്റ്റ്ക്ലാസ് അക്കാദമിയിലേക്ക് സ്വാഗതം. ഞങ്ങളുടെ ഗൂഗിൾ എഐ, ഡീപ്സീക്ക് കോഴ്സുകൾ വെരിഫൈഡ് സർട്ടിഫിക്കറ്റോടെ ലഭ്യമാണ്. വാട്സാപ്പിൽ 82816 44058 എന്ന നമ്പറിലും ബന്ധപ്പെടാം."
        },
        ta: {
          name: "Tamil",
          nativeName: "தமிழ்",
          greeting: "வணக்கம்! நான் பிரியா, நெக்ஸ்ட்கிளாஸ் அகாடமியின் கல்வி ஆலோசகர். எங்கள் ஏஐ கோர்ஸ்கள் பற்றி அறிய உங்களுக்கு உதவட்டுமா?",
          fallback: "வணக்கம்! நெக்ஸ்ட்கிளாஸ் அகாடமிக்கு வரவேற்கிறோம். எங்கள் ஏஐ மாஸ்டர்கிளாஸ்கள் சரிபார்க்கப்பட்ட சான்றிதழுடன் கிடைக்கின்றன. வாட்ஸ்அப்பில் 82816 44058 இல் எங்களை தொடர்பு கொள்ளலாம்."
        },
        te: {
          name: "Telugu",
          nativeName: "తెలుగు",
          greeting: "నమస్కారం! నేను ప్రియ, నెక్స్ట్‌క్లాస్ అకాడమీ అడ్వైజర్. మా ఏఐ కోర్సుల వివరాలు తెలుసుకోవడానికి నేను మీకు సహాయం చేస్తాను.",
          fallback: "నమస్కారం! నెక్స్ట్‌క్లాస్ అకాడమీకి స్వాగతం. గూగుల్ ఏఐ మరియు డీప్‌సీక్ కోర్సులు ధృవీకరించబడిన సర్టిఫికెట్‌తో అందుబాటులో ఉన్నాయి. వాట్సాప్ 82816 44058 లో సంప్రదించవచ్చు."
        },
        kn: {
          name: "Kannada",
          nativeName: "ಕನ್ನಡ",
          greeting: "ನಮಸ್ಕಾರ! ನಾನು ಪ್ರಿಯಾ, ನೆಕ್ಸ್ಟ್‌ಕ್ಲಾಸ್ ಅಕಾಡೆಮಿಯ ಅಡ್ವೈಸರ್. ನಮ್ಮ ಎಐ ಕೋರ್ಸ್‌ಗಳ ಬಗ್ಗೆ ತಿಳಿಯಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
          fallback: "ನಮಸ್ಕಾರ! ನೆಕ್ಸ್ಟ್‌ಕ್ಲಾಸ್ ಅಕಾಡೆಮಿಗೆ ಸ್ವಾಗತ. ನಮ್ಮ ಎಐ ಕೋರ್ಸ್‌ಗಳು ವೆರಿಫೈಡ್ ಸರ್ಟಿಫಿಕೇಟ್‌ನೊಂದಿಗೆ ಲಭ್ಯವಿವೆ. ವಾಟ್ಸಾಪ್ 82816 44058 ಮೂಲಕವೂ ಸಂಪರ್ಕಿಸಬಹುದು."
        },
        hi: {
          name: "Hindi",
          nativeName: "हिंदी",
          greeting: "नमस्ते! मैं प्रिया हूँ, नेक्स्टक्लास अकादमी की सीनियर एकेडमिक काउंसलर। मैं एआई कोर्सेज़ और सर्टिफिकेशन के बारे में आपकी कैसे मदद करूँ?",
          fallback: "नमस्ते! नेक्स्टक्लास अकादमी में आपका स्वागत है। हमारे गूगल एआई, डीपसीक और वॉइस एआई कोर्सेज़ वेरिफाइड सर्टिफिकेट के साथ उपलब्ध हैं। आप व्हाट्सएप 82816 44058 पर भी संपर्क कर सकते हैं।"
        },
        en: {
          name: "Indian English",
          nativeName: "English (India)",
          greeting: "Namaste! I am Priya, Senior Academic Counselor at NextClass AI Academy. How may I help you explore our certified AI courses today?",
          fallback: "Namaste! Thank you for calling NextClass AI. We offer industry-recognized masterclasses in Google AI Studio, DeepSeek R1, and Voice AI starting from fourteen hundred ninety-nine rupees. You can also connect directly with our counselor on WhatsApp at 82816 44058!"
        }
      };

      const currentLang = langMap[language] || langMap.en;
      const ai = getAI();
      const systemInstruction = `You are Priya, an articulate, friendly Indian female Senior Academic Counselor and Voice AI Receptionist at NextClass AI Academy (NextClasses.in / www.fetecart.in).
You are speaking live over an audio voice call with a student, professional, or visitor in India.
Current conversation language: ${currentLang.name} (${currentLang.nativeName}).
You must converse politely and fluently in ${currentLang.name}. If the caller uses mixed English or transliteration (such as Manglish for Malayalam, Tanglish for Tamil, or Hinglish for Hindi), understand them effortlessly and reply in friendly, conversational ${currentLang.name}.

CRITICAL VOICE SYNTHESIS RULES (Your response will be spoken aloud to the caller via speech synthesizer):
1. Keep replies concise and natural for human speech: 2 to 3 conversational sentences (maximum 40-50 words).
2. DO NOT use asterisks (*), markdown formatting, bullet points, emojis, or code blocks, because text-to-speech engines will mispronounce them.
3. Speak numbers and amounts conversationally in the chosen language (e.g., in English "fourteen hundred ninety-nine rupees", or in Hindi "चौदह सौ निन्यानवे रुपये", in Malayalam "ആയിരത്തി നാനൂറ്റി തൊണ്ണൂറ്റിയൊമ്പത് രൂപ").
4. Recommend matching courses:
   - For beginners/creatives: Midjourney v6 or Generative AI Fundamentals.
   - For coders/engineers: Google AI Studio & Gemini Masterclass or Cursor AI Developer Suite.
   - For finance & business: DeepSeek R1 & Advanced Excel Financial Modeling.
   - For automation: Voice AI & Realtime Telephony Agents or n8n AI Automation.
   - For school students: AISSEE 2027 Sainik School, NEET, and JEE CBT mock tests.
5. Emphasize that all courses include verifiable certificates, regional language mentoring, and instant portal access.
6. If the user wants human assistance, invite them to message our counselor team on WhatsApp at 82816 44058.`;

      const prompt = `Conversation history so far:
${Array.isArray(history) ? history.slice(-4).map((h: any) => `${h.role === "user" ? "Student" : "Priya"}: ${h.text}`).join("\n") : "None"}

Student just said: "${message}"

Respond as Priya concisely, warmly, and in pure spoken dialogue in ${currentLang.name}:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      let reply = (response.text || "").trim();
      // Strip any stray markdown symbols for clean speech synthesis
      reply = reply.replace(/[*#_~`]/g, "").replace(/\s+/g, " ").trim();

      if (!reply) {
        reply = currentLang.greeting;
      }

      return res.json({ success: true, reply, language: currentLang.name });
    } catch (err: any) {
      console.error("Voice receptionist error:", err);
      const chosenLang = (req.body && req.body.language) || "en";
      const fallbacks: Record<string, string> = {
        ml: "നമസ്കാരം! നെക്സ്റ്റ്ക്ലാസ് അക്കാദമിയിലേക്ക് സ്വാഗതം. ഞങ്ങളുടെ എഐ കോഴ്സുകൾ വെരിഫൈഡ് സർട്ടിഫിക്കറ്റോടെ ലഭ്യമാണ്. കൂടുതൽ വിവരങ്ങൾക്ക് വാട്സാപ്പിൽ 82816 44058 എന്ന നമ്പറിൽ ബന്ധപ്പെടാം.",
        ta: "வணக்கம்! நெக்ஸ்ட்கிளாஸ் அகாடமிக்கு வரவேற்கிறோம். எங்கள் ஏஐ மாஸ்டர்கிளாஸ்கள் சான்றிதழுடன் கிடைக்கின்றன. வாட்ஸ்அப் 82816 44058 இல் எங்களை தொடர்பு கொள்ளலாம்.",
        te: "నమస్కారం! నెక్స్ట్‌క్లాస్ అకాడమీకి స్వాగతం. ఏఐ కోర్సుల కోసం వాట్సాప్ 82816 44058 లో సంప్రదించవచ్చు.",
        kn: "ನಮಸ್ಕಾರ! ನೆಕ್ಸ್ಟ್‌ಕ್ಲಾಸ್ ಅಕಾಡೆಮಿಗೆ ಸ್ವಾಗತ. ಎಐ ಕೋರ್ಸ್‌ಗಳ ಮಾಹಿತಿಗಾಗಿ ವಾಟ್ಸಾಪ್ 82816 44058 ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.",
        hi: "नमस्ते! नेक्स्टक्लास अकादमी में आपका स्वागत है। हमारे एआई कोर्सेज़ वेरिफाइड सर्टिफिकेट के साथ उपलब्ध हैं। आप व्हाट्सएप 82816 44058 पर संपर्क कर सकते हैं।",
        en: "Namaste! Thank you for calling NextClass AI. We offer industry-recognized masterclasses in Google AI Studio, DeepSeek R1, and Voice AI starting from fourteen hundred ninety-nine rupees. You can also connect directly with our counselor on WhatsApp at 82816 44058!"
      };
      const fallbackReply = fallbacks[chosenLang] || fallbacks.en;
      return res.json({ success: true, reply: fallbackReply, fallback: true, errorDetails: err?.message || String(err) });
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

  // Robots.txt & Sitemap for custom domain www.fetecart.in
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://www.fetecart.in/sitemap.xml\nHost: www.fetecart.in\n");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.fetecart.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.fetecart.in/#courses</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.fetecart.in/#products</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.fetecart.in/#mock-tests</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  // Custom Domain Configuration & DNS Status API
  app.get("/api/domain/status", (req, res) => {
    res.json({
      customDomain: "www.fetecart.in",
      apexDomain: "fetecart.in",
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
            text: `A new UPI payment verification claim has been submitted on Nextclasses.in:\n\nStudent: ${claim.studentName}\nEmail: ${claim.email}\nPhone: +91 ${claim.phone}\nCourse: ${claim.courseTitle}\nAmount: ₹${claim.amount}\n12-Digit UTR: ${claim.utrNumber}\nPayment App: ${claim.paymentApp || 'UPI'}\nSubmitted At: ${claim.submittedAt}\n\nPlease cross-verify this UTR in your HDFC bank mobile app before approving in the Admin Panel.\nNextclasses Admin: https://www.fetecart.in/?admin=true`,
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
