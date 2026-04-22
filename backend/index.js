import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import connectDB from "./config/db.js";
import newsletterRoutes from "./routes/newsletter.js";
import User from "./models/User.js";

dotenv.config();
console.log("Gemini Key:", process.env.GEMINI_API_KEY);
const app = express();
const port = process.env.PORT || 3051;

// Production security
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- CONNECT DATABASE ----------------
connectDB();

// ---------------- MIDDLEWARE ----------------
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app', 'https://your-domain.com'] 
    : ['http://localhost:3051', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ---------------- STATIC FILES ----------------
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/signup.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/newsletter", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/newsletter.html"));
});

// ---------------- PASSPORT SETUP ----------------
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,
            gender: "Not specified",
            dob: null,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ---------------- NEWSLETTER ROUTES ----------------
app.use("/api/newsletter", newsletterRoutes);

// ---------------- AUTH ROUTES ----------------

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, gender, dob, provider } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (provider === "local") {
      if (!name || !email || !password || !gender || !dob) {
        return res
          .status(400)
          .json({ error: "All fields are required for local signup" });
      }
    }

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      gender,
      dob,
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      userId: newUser._id,
      redirect: "/index.html",
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Local login
app.post("/api/login", async (req, res) => {
  try {
    console.log("[LOGIN] req.body:", req.body);

    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    console.log("[LOGIN] fetched user:", user ? {
      id: user._id,
      email: user.email,
      provider: user.provider,
    } : null);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log("[LOGIN] stored password:", user.password);

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] bcrypt.compare result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.session.user = { id: user._id, email: user.email };
    res.json({ message: "Login successful", redirect: "/index.html" });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/index.html");
  }
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Alternative AI API functions
async function tryOpenAIAPI(message) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey === 'your_openai_key_here') {
    console.log("⚪ OpenAI: No API key configured");
    return null;
  }
  
  try {
    console.log("🤖 Trying OpenAI API...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are MannSakha AI, a compassionate mental health support chatbot. Provide empathetic, helpful responses in 2-3 sentences.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    console.log("📨 OpenAI API response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      const reply = data.choices[0]?.message?.content;
      console.log("✅ OpenAI API success");
      return reply;
    } else if (response.status === 429) {
      console.log("⚠️ OpenAI API rate limited");
      return null;
    } else {
      console.log("❌ OpenAI API error:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ OpenAI API failed:", error.message);
  }
  return null;
}

async function tryHuggingFaceAPI(message) {
  try {
    console.log("🤗 Trying Hugging Face API...");
    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Mental health support conversation: User says "${message}". Respond with empathy and helpful advice.`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          do_sample: true
        }
      })
    });
    
    console.log("📨 Hugging Face API response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      let reply = data[0]?.generated_text || null;
      if (reply) {
        // Clean up the response
        reply = reply.replace(`Mental health support conversation: User says "${message}". Respond with empathy and helpful advice.`, '').trim();
        if (reply.length > 10) {
          console.log("✅ Hugging Face API success");
          return reply;
        }
      }
    } else {
      console.log("⚠️ Hugging Face API error:", response.status);
    }
  } catch (error) {
    console.log("❌ Hugging Face API failed:", error.message);
  }
  return null;
}

async function tryCoHereAPI(message) {
  const cohereKey = process.env.COHERE_API_KEY;
  if (!cohereKey || cohereKey === 'your_cohere_key_here') return null;
  
  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cohereKey}`
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: `As a mental health support AI, respond empathetically to: ${message}`,
        max_tokens: 100,
        temperature: 0.7
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.generations[0]?.text?.trim();
    }
  } catch (error) {
    console.log("❌ Cohere API failed:", error.message);
  }
  return null;
}

// Smart response system with keyword matching
function getSmartFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Anxiety-related keywords
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
    return "I understand you're feeling anxious. Anxiety is very common and manageable. Try taking slow, deep breaths - inhale for 4 counts, hold for 4, exhale for 6. Focus on things you can control right now. Would you like to talk about what's making you feel this way?";
  }
  
  // Depression-related keywords
  if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
    return "I hear that you're going through a difficult time. Your feelings are valid, and it's brave of you to reach out. Remember that depression is treatable, and you don't have to face this alone. Small steps count - even talking to me right now is a positive step. What's one small thing that usually brings you comfort?";
  }
  
  // Stress-related keywords
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure') || lowerMessage.includes('burden')) {
    return "Stress can feel overwhelming, but you're taking the right step by acknowledging it. Let's break this down - what's the most pressing thing causing your stress right now? Sometimes writing down your worries or talking through them can help you see solutions more clearly.";
  }
  
  // Sleep-related keywords
  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
    return "Sleep issues can really affect how we feel and think. Good sleep hygiene can help - try to keep a consistent sleep schedule, avoid screens before bed, and create a calming bedtime routine. If sleep problems persist, it might be worth talking to a healthcare provider. How long have you been having trouble sleeping?";
  }
  
  // Work-related stress
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss') || lowerMessage.includes('career')) {
    return "Work-related stress is very common. Remember that your worth isn't defined by your job performance. Setting boundaries, taking breaks, and practicing self-care are important. Is there a specific aspect of work that's bothering you most?";
  }
  
  // Relationship issues
  if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('friend') || lowerMessage.includes('partner')) {
    return "Relationships can be challenging, and it's normal to have difficulties sometimes. Communication, empathy, and setting healthy boundaries are key. Remember, you can only control your own actions and responses. What aspect of this relationship is troubling you most?";
  }
  
  // General positive responses
  const positiveResponses = [
    `Thank you for sharing "${message}" with me. Your mental health matters, and I'm here to support you. What would be most helpful for you right now?`,
    `I appreciate you opening up about "${message}". Taking care of your mental health is important, and seeking support shows strength. How can I best help you today?`,
    `You've shared something important: "${message}". Remember that it's okay to not be okay sometimes. Every step toward better mental health, including talking to me, is valuable. What's on your mind?`,
    `I hear you saying "${message}". Your feelings and experiences are valid. Mental health is a journey, and you don't have to walk it alone. What support would be most helpful right now?`
  ];
  
  return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit

function checkRateLimit(clientId) {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId) || { requests: [], lastReset: now };
  
  // Remove old requests outside the window
  clientData.requests = clientData.requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (clientData.requests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limited
  }
  
  clientData.requests.push(now);
  rateLimitMap.set(clientId, clientData);
  return true; // OK to proceed
}

// ---------------- GEMINI API ----------------
async function listGeminiModels(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.models;
  } catch (error) {
    console.error("❌ Error listing models:", error);
    return null;
  }
}

app.post("/api/gemini", async (req, res) => {
  console.log("🔍 Received request to /api/gemini");
  console.log("📝 Request body:", req.body);
  
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    console.log("❌ Invalid message format");
    return res.status(400).json({ reply: "Invalid message format" });
  }

  // Check rate limit first
  const clientId = req.ip || 'default';
  if (!checkRateLimit(clientId)) {
    console.log("⏰ Rate limited - providing fallback response");
    const rateLimitResponses = [
      "I'm taking a moment to process your message: '" + message + "'. While I do that, remember that it's completely normal to have ups and downs in life.",
      "Thank you for sharing '" + message + "' with me. Sometimes the best conversations happen when we slow down and really listen.",
      "I hear you saying '" + message + "'. Take a deep breath with me - mental health is about taking things one step at a time.",
      "Your message about '" + message + "' is important. While I'm processing, remember that asking for help is a sign of strength, not weakness."
    ];
    const fallbackResponse = rateLimitResponses[Math.floor(Math.random() * rateLimitResponses.length)];
    return res.json({ reply: fallbackResponse });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "Not found");
  
  if (!apiKey) {
    console.log("❌ API key not configured");
    return res.status(500).json({ reply: "API key not configured" });
  }

  // Check if API key has the correct format (should start with "AIza")
  if (!apiKey.startsWith("AIza")) {
    console.log("⚠️ Warning: API key doesn't appear to be a valid Google Gemini API key");
    // Return demo response for invalid API key
    const demoResponses = [
      "Hello! I'm a demo chatbot. Please provide a valid Google Gemini API key to enable AI responses.",
      "I understand you're asking about: " + message + ". However, I need a valid API key to provide AI-powered responses.",
      "This is a demo response. To get real AI responses, please set up a valid Google Gemini API key.",
      "I'm currently running in demo mode. Please configure a proper Gemini API key (starting with 'AIza') for full functionality."
    ];
    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    return res.json({ reply: randomResponse });
  }

   try {
  //   console.log("📡 Checking available models...");
  //   const availableModels = await listGeminiModels(apiKey);
  //   console.log("📋 Available models:", availableModels?.length || 0);
    
  //   if (!availableModels?.length) {
  //     console.log("❌ No Gemini models available - trying alternative APIs");
      
  //     // Try alternative APIs when Gemini is completely unavailable
  //     let altResponse = await tryOpenAIAPI(message);
  //     if (altResponse) {
  //       console.log("✅ Using OpenAI as primary backup");
  //       return res.json({ reply: altResponse });
  //     }
      
  //     altResponse = await tryHuggingFaceAPI(message);
  //     if (altResponse) {
  //       console.log("✅ Using Hugging Face as primary backup");
  //       return res.json({ reply: altResponse });
  //     }
      
  //     altResponse = await tryCoHereAPI(message);
  //     if (altResponse) {
  //       console.log("✅ Using Cohere as primary backup");
  //       return res.json({ reply: altResponse });
  //     }
      
  //     // Use smart fallback if all APIs fail
  //     console.log("✅ Using smart fallback - all APIs unavailable");
  //     const smartResponse = getSmartFallbackResponse(message);
  //     return res.json({ reply: smartResponse });
  //   }



const prompt = `You are MannSakha AI, a compassionate mental health support chatbot. Respond empathetically and helpfully to: ${message}`;

const selectedModel = "gemini-2.5-flash";

const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    })
  }
);
    console.log("📨 Gemini API response status:", geminiResponse.status);
    
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.log("❌ Gemini API Error:", errorData);
      
      // Handle rate limiting with multiple backup options
      if (geminiResponse.status === 429) {
        console.log("⚠️ Rate limited - trying alternative APIs");
        
        // Try OpenAI first
        let altResponse = await tryOpenAIAPI(message);
        if (altResponse) {
          console.log("✅ Using OpenAI backup response");
          return res.json({ reply: altResponse });
        }
        
        // Try Hugging Face
        altResponse = await tryHuggingFaceAPI(message);
        if (altResponse) {
          console.log("✅ Using Hugging Face backup response");
          return res.json({ reply: altResponse });
        }
        
        // Try Cohere
        altResponse = await tryCoHereAPI(message);
        if (altResponse) {
          console.log("✅ Using Cohere backup response");
          return res.json({ reply: altResponse });
        }
        
        // Use smart fallback system
        console.log("✅ Using smart fallback response");
        const smartResponse = getSmartFallbackResponse(message);
        return res.json({ reply: smartResponse });
      }
      
      return res
        .status(geminiResponse.status)
        .json({ reply: "I'm having some technical difficulties right now. Please try again in a moment.", error: errorData });
    }

    const geminiData = await geminiResponse.json();
    console.log("📦 Gemini response structure:", JSON.stringify(geminiData, null, 2));
    
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("💬 Extracted reply:", reply);

    if (reply) {
      console.log("✅ Sending successful response");
      res.json({ reply: reply.trim() });
    } else {
      console.log("❌ Unexpected response structure");
      res
        .status(500)
        .json({ reply: "Unexpected Gemini API response structure" });
    }
  } catch (error) {
    console.error("❌ Gemini API Request Failed:", error);
    res.status(500).json({ reply: "Internal Server Error" });
  }
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
