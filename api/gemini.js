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

    // Mental health context
    const context = `You are MannSakha, a compassionate AI mental health support assistant. 
    Provide empathetic, supportive responses to users seeking mental health guidance. 
    Always be understanding, non-judgmental, and encourage professional help when needed.
    Keep responses concise but caring.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`${context}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response for mental health
    const fallbackResponses = {
      stress: "I understand you're feeling stressed. Take a deep breath with me. Stress is temporary, and you have the strength to overcome this. Consider talking to someone you trust or practicing mindfulness techniques.",
      anxiety: "Anxiety can feel overwhelming, but you're not alone. Try grounding yourself by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
      sad: "I hear that you're feeling sad, and that's completely valid. It's okay to feel this way. Remember that feelings are temporary, and brighter days are ahead. Consider reaching out to a friend or counselor.",
      default: "I'm here to listen and support you. While I may be experiencing some technical difficulties, please know that your feelings matter and there are people who care about you. If you're in crisis, please reach out to a mental health professional."
    };

    const lowerMessage = message.toLowerCase();
    let fallbackResponse = fallbackResponses.default;

    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
      fallbackResponse = fallbackResponses.stress;
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worry')) {
      fallbackResponse = fallbackResponses.anxiety;
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      fallbackResponse = fallbackResponses.sad;
    }

    return res.status(200).json({ 
      response: fallbackResponse,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}