// Chatbot Functionality
console.log("testing");
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
console.log("chatbot.js loaded");

// Function to add a message to the chat
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the bottom
}

// Function to make API call to Gemini API through backend
async function fetchBotResponse(userMessage) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply || "I didn't understand that.";
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "Sorry, I'm having trouble connecting to the AI service. Please try again.";
    }
}

// Handle chat input
sendBtn.addEventListener('click', async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        // Add user message to chat
        addMessage(userMessage, 'user');
        
        // Get bot response from API
        const botResponse = await fetchBotResponse(userMessage);
        
        // Add bot response to chat
        addMessage(botResponse, 'bot');

        // Clear input
        chatInput.value = '';
    }
});

// Allow pressing Enter to send message
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});
