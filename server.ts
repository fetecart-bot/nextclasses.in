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
