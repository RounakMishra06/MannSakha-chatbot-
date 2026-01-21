// Vercel Serverless API endpoint for chatbot
// This file handles the /api/gemini endpoint

let GoogleGenerativeAI;

// Dynamic import for better compatibility
async function getGeminiAI() {
  if (!GoogleGenerativeAI && process.env.GEMINI_API_KEY) {
    try {
      const module = await import("@google/generative-ai");
      GoogleGenerativeAI = module.GoogleGenerativeAI;
      return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (error) {
      console.error('Failed to load Gemini AI:', error);
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Log for debugging
  console.log('API Request received:', {
    method: req.method,
    hasBody: !!req.body,
    apiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing'
  });

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string',
        received: typeof message
      });
    }

    // Try to use Gemini API if available
    const genAI = await getGeminiAI();
    
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        // Mental health context
        const context = `You are MannSakha, a compassionate AI mental health support assistant. 
        Provide empathetic, supportive responses to users seeking mental health guidance. 
        Always be understanding, non-judgmental, and encourage professional help when needed.
        Keep responses concise but caring (max 150 words).`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`${context}\n\nUser: ${message}`);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ 
          response: text,
          reply: text,
          timestamp: new Date().toISOString(),
          source: 'gemini'
        });
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError);
        // Fall through to fallback
      }
    }

    // Use fallback response
    const contributorAnswer = getContributorResponse(message);
    if (contributorAnswer) {
      return res.status(200).json({
        response: contributorAnswer,
        reply: contributorAnswer,
        topic: 'contributor-help',
        fallback: true,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      });
    }

    return getSmartFallback(message, res);

  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

function getSmartFallback(message, res) {
  // Smart fallback responses for mental health
  const fallbackResponses = {
    stress: "I understand you're feeling stressed. Take a deep breath with me. Stress is temporary, and you have the strength to overcome this. Consider talking to someone you trust or practicing mindfulness techniques. Would you like to try our guided meditation?",
    anxiety: "Anxiety can feel overwhelming, but you're not alone. Try grounding yourself by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This 5-4-3-2-1 technique can help bring you to the present moment.",
    sad: "I hear that you're feeling sad, and that's completely valid. It's okay to feel this way. Remember that feelings are temporary, and brighter days are ahead. Consider reaching out to a friend, family member, or counselor for support.",
    depression: "I'm concerned about how you're feeling. Depression is a real condition that many people face, and you don't have to go through this alone. Please consider speaking with a mental health professional who can provide proper support and guidance.",
    sleep: "Sleep troubles can really impact how we feel. Try creating a relaxing bedtime routine: dim the lights, avoid screens before bed, and perhaps listen to our sleep meditation sounds. Good sleep hygiene can make a big difference.",
    meditation: "Meditation can be a wonderful tool for mental wellness. Even just 5 minutes a day can help reduce stress and improve focus. Would you like to try our guided meditation feature?",
    default: "I'm here to listen and support you. While I may be experiencing some technical difficulties, please know that your feelings matter and there are people who care about you. If you're in crisis, please reach out to a mental health professional or crisis helpline."
  };

  const lowerMessage = message.toLowerCase();
  let fallbackResponse = fallbackResponses.default;

  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
    fallbackResponse = fallbackResponses.stress;
  } else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worry')) {
    fallbackResponse = fallbackResponses.anxiety;
  } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
    fallbackResponse = fallbackResponses.sad;
  } else if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('hopeless')) {
    fallbackResponse = fallbackResponses.depression;
  } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
    fallbackResponse = fallbackResponses.sleep;
  } else if (lowerMessage.includes('meditat') || lowerMessage.includes('mindful') || lowerMessage.includes('calm')) {
    fallbackResponse = fallbackResponses.meditation;
  }

  return res.status(200).json({ 
    response: fallbackResponse,
    reply: fallbackResponse,
    fallback: true,
    timestamp: new Date().toISOString(),
    source: 'fallback'
  });
}

function getContributorResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Issue assignment
  if (lowerMessage.includes('assign') && lowerMessage.includes('issue')) {
    return 'To get an issue assigned: 1) Comment on the issue asking to be assigned. 2) Wait for a maintainer to confirm/assign you. 3) Only start coding after assignment. If someone is already assigned, ask if you can be a backup or pick another issue.';
  }

  // Fork visibility and forking steps
  if (lowerMessage.includes('fork') && (lowerMessage.includes('button') || lowerMessage.includes('visible') || lowerMessage.includes('not showing'))) {
    return 'Fork button hidden? Make sure you are logged in. If you already forked, GitHub hides the fork button—use your existing fork instead. On mobile view switch to desktop view. Otherwise permissions may restrict forking; you can still clone read-only.';
  }

  if (lowerMessage.includes('fork') && (lowerMessage.includes('how') || lowerMessage.includes('steps'))) {
    return 'Forking workflow: 1) Click Fork on the repo. 2) Clone your fork: git clone <your-fork-url>. 3) Create a branch: git checkout -b feature-name. 4) Commit and push to your fork. 5) Open a PR from your branch to the main repo.';
  }

  // Good first issue guidance
  if (lowerMessage.includes('good first issue') || (lowerMessage.includes('write') && lowerMessage.includes('issue'))) {
    return 'Good first issue tips: keep scope small, describe the problem clearly, add reproduction steps, expected vs actual behavior, and acceptance criteria. Link related files/screens and add labels like good first issue, bug, or documentation so newcomers know it is approachable.';
  }

  // Pull request basics
  if (lowerMessage.includes('pull request') || lowerMessage.includes('pr')) {
    return 'Pull request checklist: 1) Sync your branch with main. 2) Keep changes focused. 3) Add tests or screenshots when relevant. 4) Write a clear title and summary of what/why. 5) Link the issue (Fixes #123). 6) Address review comments and keep conversations resolved.';
  }

  // Labels meaning
  if (lowerMessage.includes('label') || lowerMessage.includes('labels')) {
    return 'Common label meanings: good first issue (beginner-friendly), help wanted (maintainers welcome contributions), bug (fix a defect), enhancement/feature (new capability), documentation (docs-only), question (needs clarification). Ask maintainers if unsure which label applies.';
  }

  // Contribution guidelines reminder
  if (lowerMessage.includes('contribute') || lowerMessage.includes('contributing')) {
    return 'General contribution flow: read README and CONTRIBUTING, pick or request assignment on an issue, create a branch from main, make focused changes with clear commits, run tests/linters, then open a PR with a concise summary and issue link. Follow the Code of Conduct and respond to reviews politely.';
  }

  return null;
}