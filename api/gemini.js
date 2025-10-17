// Vercel API endpoint for chatbot
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return getSmartFallback(message, res);
    }

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
      timestamp: new Date().toISOString(),
      source: 'gemini'
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return getSmartFallback(req.body.message, res);
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
    fallback: true,
    timestamp: new Date().toISOString(),
    source: 'fallback'
  });
}