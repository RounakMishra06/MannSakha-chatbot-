// Simple, reliable Vercel API endpoint using direct fetch
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Log for debugging (remove in production)
    console.log('Received message:', message.substring(0, 50));

    // Try Gemini API with direct fetch
    if (process.env.GEMINI_API_KEY) {
      try {
        const context = `You are MannSakha, a compassionate AI mental health support assistant. Provide empathetic, supportive responses to users seeking mental health guidance. Always be understanding, non-judgmental, and encourage professional help when needed. Keep responses concise but caring (max 150 words).`;
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${context}\n\nUser: ${message}`
              }]
            }]
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            return res.status(200).json({
              response: text,
              source: 'gemini',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback responses for mental health support
    const fallbackResponses = getSmartFallbackResponse(message);
    
    return res.status(200).json({
      response: fallbackResponses.response,
      source: 'fallback',
      category: fallbackResponses.category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      timestamp: new Date().toISOString()
    });
  }
}

function getSmartFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    stress: {
      response: "I understand you're feeling stressed. Take a deep breath with me. Stress is temporary, and you have the strength to overcome this. Consider talking to someone you trust or practicing mindfulness techniques. Would you like to try our guided meditation?",
      category: "stress"
    },
    anxiety: {
      response: "Anxiety can feel overwhelming, but you're not alone. Try grounding yourself by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This 5-4-3-2-1 technique can help bring you to the present moment.",
      category: "anxiety"
    },
    sad: {
      response: "I hear that you're feeling sad, and that's completely valid. It's okay to feel this way. Remember that feelings are temporary, and brighter days are ahead. Consider reaching out to a friend, family member, or counselor for support.",
      category: "sadness"
    },
    depression: {
      response: "I'm concerned about how you're feeling. Depression is a real condition that many people face, and you don't have to go through this alone. Please consider speaking with a mental health professional who can provide proper support and guidance.",
      category: "depression"
    },
    sleep: {
      response: "Sleep troubles can really impact how we feel. Try creating a relaxing bedtime routine: dim the lights, avoid screens before bed, and perhaps listen to our sleep meditation sounds. Good sleep hygiene can make a big difference.",
      category: "sleep"
    },
    meditation: {
      response: "Meditation can be a wonderful tool for mental wellness. Even just 5 minutes a day can help reduce stress and improve focus. Would you like to try our guided meditation feature?",
      category: "meditation"
    },
    greeting: {
      response: "Hello! I'm MannSakha, your AI mental health support companion. I'm here to listen and provide support. How are you feeling today? Remember, it's okay to not be okay sometimes.",
      category: "greeting"
    }
  };

  // Pattern matching for categories
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
    return responses.stress;
  } else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worry')) {
    return responses.anxiety;
  } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
    return responses.sad;
  } else if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('hopeless')) {
    return responses.depression;
  } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
    return responses.sleep;
  } else if (lowerMessage.includes('meditat') || lowerMessage.includes('mindful') || lowerMessage.includes('calm')) {
    return responses.meditation;
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage === '') {
    return responses.greeting;
  }

  // Default supportive response
  return {
    response: "I'm here to listen and support you. While I may be experiencing some technical difficulties, please know that your feelings matter and there are people who care about you. If you're in crisis, please reach out to a mental health professional or crisis helpline immediately.",
    category: "general"
  };
}