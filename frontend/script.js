// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Login successful
        window.location.href = data.redirect || "/index.html";
      } else {
        // ❌ Show error message
        errorMessage.textContent = data.message || "Login failed";
      }
    } catch (err) {
      console.error("Error:", err);
      errorMessage.textContent = "Something went wrong. Try again later.";
    }
  });
});




// Dark Mode Functionality



let currentTheme = localStorage.getItem("theme") || "auto";

// Function to get system theme preference
function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
}

// Function to set theme
function setTheme(theme) {
    let actualTheme = theme;
    
    // Handle auto theme
    if (theme === "auto") {
        actualTheme = getSystemTheme();
    }
    
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", actualTheme);
    localStorage.setItem("theme", theme);
    
    // Update toggle button
    const toggleBtn = document.querySelector(".theme-toggle");
    if (toggleBtn) {
        const icon = toggleBtn.querySelector("i");
        const text = toggleBtn.querySelector("span");
        
        if (actualTheme === "dark") {
            icon.className = "fas fa-sun";
            text.textContent = theme === "auto" ? "Auto" : "Light";
        } else {
            icon.className = "fas fa-moon";
            text.textContent = theme === "auto" ? "Auto" : "Dark";
        }
    }
}

// Function to toggle theme
function toggleTheme() {
    let newTheme;
    if (currentTheme === "light") {
        newTheme = "dark";
    } else if (currentTheme === "dark") {
        newTheme = "auto";
    } else {
        newTheme = "light";
    }
    setTheme(newTheme);
}

// Initialize theme on page load
function initializeTheme() {
    setTheme(currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            if (currentTheme === "auto") {
                setTheme("auto");
            }
        });
    }
}

// Toast Notification System
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastIcon = toast.querySelector(".toast-icon");
    const toastMessage = toast.querySelector(".toast-message");
    
    // Set content and style based on type
    toastMessage.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    
    // Update icon based on type
    switch(type) {
        case "success":
            toastIcon.className = "fas fa-check-circle toast-icon";
            break;
        case "error":
            toastIcon.className = "fas fa-exclamation-circle toast-icon";
            break;
        case "warning":
            toastIcon.className = "fas fa-exclamation-triangle toast-icon";
            break;
        default:
            toastIcon.className = "fas fa-info-circle toast-icon";
    }
    
    // Show toast
    toast.classList.add("show");
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

// User Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem("users")) || [];
        this.currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
    }
    
    signUp(email, password, confirmPassword) {
        // Validate inputs
        if (!email || !password || !confirmPassword) {
            showToast("All fields are required", "error");
            return false;
        }
        
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return false;
        }
        
        // Check if user already exists
        if (this.users.some(user => user.email === email)) {
            showToast("Email already exists", "error");
            return false;
        }
        
        // Add new user
        this.users.push({ email, password });
        localStorage.setItem("users", JSON.stringify(this.users));
        
        // Log in the new user
        this.login(email, password);
        
        showToast("Account created successfully!", "success");
        return true;
    }
    
    login(email, password) {
        // Validate inputs
        if (!email || !password) {
            showToast("Email and password are required", "error");
            return false;
        }
        
        // Check credentials
        const user = this.users.find(user => user.email === email && user.password === password);
        if (!user) {
            showToast("Invalid email or password", "error");
            return false;
        }
        
        // Set current user
        this.currentUser = { email };
        localStorage.setItem("loggedInUser", JSON.stringify(this.currentUser));
        
        showToast("Logged in successfully!", "success");
        return true;
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem("loggedInUser");
        showToast("Logged out successfully", "success");
        return true;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Initialize users array in localStorage if not exists
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
}

// Display logged-in user email in header and handle redirects
function checkAuthState() {
    if (auth.isLoggedIn()) {
        const userEmailElement = document.getElementById("userEmail");
        if (userEmailElement) {
            userEmailElement.textContent = auth.getCurrentUser().email;
        }
        
        // Hide login/signup pages if user is logged in
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage === "login.html" || currentPage === "signup.html") {
            window.location.href = "index.html";
        }
    } else {
        // Redirect to login if not logged in (except for login/signup pages)
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage === "index.html") {
            window.location.href = "login.html";
        }
    }
}

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    if (auth.signUp(email, password, confirmPassword)) {
        window.location.href = "index.html";
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    console.log("inside login handle");
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (auth.login(email, password)) {
        window.location.href = "index.html";
    }
}

// Logout functionality
function logout() {
    if (auth.logout()) {
        window.location.href = "login.html";
    }
}

// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const navMenu = document.querySelector("nav");
    if (navMenu) {
        navMenu.classList.toggle("active");
    }
}

// Close mobile menu when clicking outside
document.addEventListener("click", function(event) {
    const navMenu = document.querySelector("nav");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    
    if (navMenu && navMenu.classList.contains("active") && 
        !navMenu.contains(event.target) && 
        !mobileToggle.contains(event.target)) {
        navMenu.classList.remove("active");
    }
});

// Close mobile menu when clicking on a link
document.addEventListener("click", function(event) {
    if (event.target.tagName === "A" && event.target.href) {
        const navMenu = document.querySelector("nav");
        if (navMenu && navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
        }
    }
});

// Redirect to Chatbot Section
document.getElementById("chatRedirect")?.addEventListener("click", function() {
    document.getElementById("chatbot")?.scrollIntoView({ behavior: "smooth" });
});

// AI Chatbot with API Call (Backend Integration)
async function sendMessage() {
    const userInput = document.getElementById("userInput")?.value.trim();
    if (!userInput) {
        showToast("Please enter a message", "warning");
        return;
    }

    const chatArea = document.getElementById("chatArea");
    
    // Add user message to chat
    const userMessage = document.createElement("div");
    userMessage.className = "chat-bubble user-message";
    userMessage.innerHTML = `
        <div class="chat-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="chat-text">
            <div class="chat-sender">You</div>
            <div class="chat-content">${userInput}</div>
            <div class="chat-time">Just now</div>
        </div>
    `;
    chatArea.appendChild(userMessage);
    
    // Clear input
    document.getElementById("userInput").value = "";
    
    // Show typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-bubble ai-message";
    typingIndicator.innerHTML = `
        <div class="chat-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="chat-text">
            <div class="chat-sender">MannSakha AI</div>
            <div class="chat-content typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    try {
        // Call the actual Gemini API through backend
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });
        
        // Remove typing indicator
        chatArea.removeChild(typingIndicator);
        
        let aiResponseText;
        if (response.ok) {
            const data = await response.json();
            aiResponseText = data.reply || "I'm having trouble understanding. Could you try rephrasing that?";
        } else {
            aiResponseText = "I'm experiencing some technical difficulties. Please try again in a moment.";
        }
        
        // Add AI response
        const aiMessage = document.createElement("div");
        aiMessage.className = "chat-bubble ai-message";
        aiMessage.innerHTML = `
            <div class="chat-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chat-text">
                <div class="chat-sender">MannSakha AI</div>
                <div class="chat-content">${aiResponseText}</div>
                <div class="chat-time">Just now</div>
            </div>
        `;
        chatArea.appendChild(aiMessage);
        chatArea.scrollTop = chatArea.scrollHeight;
    } catch (error) {
        // Remove typing indicator if it exists
        if (typingIndicator.parentNode) {
            chatArea.removeChild(typingIndicator);
        }
        
        // Add error message
        const errorMessage = document.createElement("div");
        errorMessage.className = "chat-bubble ai-message";
        errorMessage.innerHTML = `
            <div class="chat-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chat-text">
                <div class="chat-sender">MannSakha AI</div>
                <div class="chat-content">I'm sorry, I'm having trouble connecting right now. Please try again later.</div>
                <div class="chat-time">Just now</div>
            </div>
        `;
        chatArea.appendChild(errorMessage);
        chatArea.scrollTop = chatArea.scrollHeight;
        
        showToast("Failed to get AI response", "error");
        console.error("Chat error:", error);
    }
}

// Handle Enter key in chat input
document.getElementById("userInput")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Mood Tracking
let selectedMood = null;
let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

function selectMood(element) {
    // Remove selected class from all options
    document.querySelectorAll(".mood-option").forEach(option => {
        option.classList.remove("selected");
    });

    // Add selected class to clicked option
    element.classList.add("selected");
    selectedMood = element.getAttribute("data-mood");
}

function logMood() {
    if (!selectedMood) {
        showToast("Please select a mood first", "warning");
        return;
    }

    const intensity = document.getElementById("moodIntensity").value;
    const date = new Date();
    
    // Create mood entry
    const moodEntry = {
        mood: selectedMood,
        intensity: parseInt(intensity),
        date: date.toISOString(),
        timestamp: date.getTime()
    };
    
    // Add to history
    moodHistory.push(moodEntry);
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
    
    // Show confirmation
    showToast(`Your ${selectedMood} mood (intensity: ${intensity}) has been logged!`);
    
    // Update mood chart
    updateMoodChart();
}

// Journaling
const journalPrompts = [
    "What made you happy today?",
    "What challenge did you overcome today?",
    "What are you grateful for today?",
    "What did you learn about yourself today?",
    "How are you feeling right now and why?",
    "What would make today great?",
    "What's something you're looking forward to?",
    "What's a small win you had today?"
];

let journalEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];

function newPrompt() {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    document.getElementById("journalPrompt").textContent = randomPrompt;
    document.getElementById("journalEntry").value = "";
    document.getElementById("journalEntry").focus();
}

function saveJournal() {
    const entry = document.getElementById("journalEntry").value.trim();
    if (!entry) {
        showToast("Please write something in your journal before saving", "warning");
        return;
    }

    const prompt = document.getElementById("journalPrompt").textContent;
    const date = new Date();
    
    // Create journal entry
    const journalEntry = {
        prompt,
        entry,
        date: date.toISOString(),
        timestamp: date.getTime(),
        wordCount: entry.trim() ? entry.trim().split(/\s+/).length : 0
    };
    
    // Add to entries
    journalEntries.push(journalEntry);
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
    
    // Show confirmation
    showToast("Your journal entry has been saved!");
    
    // Clear the textarea
    document.getElementById("journalEntry").value = "";
    
    // Update word count
    updateWordCount();
}

// Word count for journal
document.getElementById("journalEntry")?.addEventListener("input", updateWordCount);

function updateWordCount() {
    const text = document.getElementById("journalEntry").value;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.querySelector(".word-count").textContent = `${wordCount}/500 words`;
}

// Mood Chart
let moodChart;

function updateMoodChart() {
    const ctx = document.getElementById("moodChart").getContext("2d");
    
    // Process mood data - in a real app, this would come from your database
    const last7Days = moodHistory.slice(-7);
    const labels = last7Days.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const data = last7Days.map(entry => entry.intensity);
    
    // Fill with default data if not enough entries
    while (labels.length < 7) {
        const date = new Date();
        date.setDate(date.getDate() - (7 - labels.length - 1));
        labels.unshift(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.unshift(5); // Default neutral mood
    }
    
    const moodData = {
        labels: labels,
        datasets: [{
            label: "Mood Level",
            data: data,
            backgroundColor: "rgba(255, 145, 77, 0.2)",
            borderColor: "rgba(255, 145, 77, 1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };

    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(ctx, {
        type: "line",
        data: moodData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Mood level: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Time range selector
document.getElementById("timeRange")?.addEventListener("change", function() {
    // In a real app, this would fetch different data based on the time range
    updateMoodChart();
    showToast(`Showing data for ${this.value}`, "success");
});

// Insights
function showSuggestion() {
    const suggestions = [
        "Try a 5-minute breathing exercise to reduce stress",
        "Consider journaling about your current feelings",
        "A short walk outside might help clear your mind",
        "Listen to calming music for 10 minutes",
        "Practice gratitude by listing 3 things you're thankful for",
        "Try the 5-4-3-2-1 grounding technique to reduce anxiety",
        "Set a small, achievable goal for today to build momentum",
        "Reach out to a friend or loved one for support"
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    document.getElementById("insightText").textContent = randomSuggestion;
    showToast("New suggestion generated", "success");
}

function shareInsight() {
    const insight = document.getElementById("insightText").textContent;
    if (navigator.share) {
        navigator.share({
            title: "MannSakha Insight",
            text: insight,
            url: window.location.href
        }).catch(err => {
            showToast("Sharing cancelled", "warning");
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `mailto:?subject=MannSakha%20Insight&body=${encodeURIComponent(insight + '\n\nShared from MannSakha AI')}`;
        window.open(shareUrl, '_blank');
        showToast("Share dialog opened", "success");
    }
}

// Meditation Audio Player
let currentAudio = null;
let isPlaying = false;

function playMeditation(type) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        isPlaying = false;
        updatePlayButton(currentAudioType, false);
    }
    
    // Determine which audio file to play based on the type
    let audioFile;
    let meditationName;
    
    switch(type) {
        case "stress":
            audioFile = "./calm-music.mp3";
            meditationName = "Stress Relief";
            break;
        case "focus":
            audioFile = "./nature-sounds.mp3";
            meditationName = "Focus & Clarity";
            break;
        case "sleep":
            audioFile = "./rain-sounds.mp3";
            meditationName = "Sleep & Relaxation";
            break;
        case "anxiety":
            audioFile = "./piano-ambient.mp3";
            meditationName = "Anxiety Relief";
            break;
        case "meditation":
            audioFile = "./lofi-chill.mp3";
            meditationName = "Guided Meditation";
            break;
        default:
            showToast("Invalid meditation type", "error");
            return;
    }
    
    currentAudioType = type;
    
    // Create new audio element and play
    currentAudio = new Audio(audioFile);
    
    // Add error handling for audio
    currentAudio.onerror = function() {
        console.error(`Failed to load audio: ${audioFile}`);
        showToast(`Unable to load ${meditationName} audio. Please check your connection.`, "error");
        isPlaying = false;
        updatePlayButton(type, false);
        currentAudio = null;
    };
    
    currentAudio.onloadstart = function() {
        showToast(`Loading ${meditationName}...`, "info");
    };
    
    currentAudio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton(type, true);
            showToast(`Now playing: ${meditationName}`, "success");
            
            // Update UI when audio ends
            currentAudio.onended = function() {
                isPlaying = false;
                updatePlayButton(type, false);
                currentAudio = null;
                currentAudioType = null;
                showToast(`${meditationName} completed`, "info");
            };
        })
        .catch((error) => {
            console.error('Audio play error:', error);
            showToast(`Unable to play ${meditationName}. Please try again.`, "error");
            isPlaying = false;
            updatePlayButton(type, false);
            currentAudio = null;
        });
}

function updatePlayButton(type, playing) {
    const card = document.querySelector(`.meditation-card[onclick="playMeditation('${type}')"]`);
    if (card) {
        const playBtn = card.querySelector(".play-btn i");
        if (playBtn) {
            playBtn.className = playing ? "fas fa-pause" : "fas fa-play";
        }
    }
}

// Add click handler to stop button if you have one
document.getElementById("stopMeditation")?.addEventListener("click", function() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        isPlaying = false;
        updatePlayButton(currentAudioType, false);
        currentAudio = null;
        showToast("Meditation stopped", "warning");
    }
});

// Gamification
let userStats = JSON.parse(localStorage.getItem("userStats")) || {
    points: 125,
    streak: 7,
    activities: 12,
    badges: ["beginner", "self-care"],
    lastActivityDate: new Date().toISOString()
};

function updateStatsDisplay() {
    document.getElementById("points").textContent = userStats.points;
    document.getElementById("streak").textContent = userStats.streak;
    document.getElementById("activities").textContent = userStats.activities;
    
    // Update progress bar
    const progressFill = document.querySelector(".progress-fill");
    const progressPercent = Math.min(Math.floor((userStats.activities % 10) * 10), 100);
    progressFill.style.width = `${progressPercent}%`;
    document.querySelector(".progress-header span").textContent = `${progressPercent}% completed`;
    
    // Update badges
    document.querySelectorAll(".badge").forEach(badge => {
        const badgeName = badge.querySelector("h4").textContent.toLowerCase();
        if (userStats.badges.includes(badgeName.replace(" ", "-"))) {
            badge.classList.add("earned");
        } else {
            badge.classList.remove("earned");
        }
    });
}

function completeActivity() {
    const today = new Date().toDateString();
    const lastActivityDate = new Date(userStats.lastActivityDate).toDateString();
    
    // Update streak if not already completed today
    if (today !== lastActivityDate) {
        // Check if streak should continue (within 24 hours)
        const timeDiff = new Date() - new Date(userStats.lastActivityDate);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff <= 48) {
            // Continue streak
            userStats.streak++;
        } else {
            // Reset streak
            userStats.streak = 1;
        }
    }
    
    // Update points and activities
    userStats.points += 10;
    userStats.activities++;
    userStats.lastActivityDate = new Date().toISOString();
    
    // Check for new badges
    checkBadges();
    
    // Save to localStorage
    localStorage.setItem("userStats", JSON.stringify(userStats));
    
    // Update display
    updateStatsDisplay();
    
    // Show confirmation
    showToast("Activity completed! +10 points", "success");
}

function checkBadges() {
    // Check for new badges based on stats
    const newBadges = [];
    
    if (userStats.streak >= 30 && !userStats.badges.includes("streak")) {
        newBadges.push("streak");
    }
    
    if (userStats.points >= 500 && !userStats.badges.includes("dedicated")) {
        newBadges.push("dedicated");
    }
    
    if (newBadges.length > 0) {
        userStats.badges = [...userStats.badges, ...newBadges];
        localStorage.setItem("userStats", JSON.stringify(userStats));
        
        newBadges.forEach(badge => {
            showToast(`Congratulations! You earned the ${badge.replace("-", " ")} badge!`, "success");
        });
    }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    // Initialize theme
    initializeTheme();
    
    // Check auth state
    checkAuthState();
    
    // Set current year in footer
    document.getElementById("current-year").textContent = new Date().getFullYear();
    
    // Set initial journal prompt
    if (document.getElementById("journalPrompt")) {
        newPrompt();
    }
    
    // Initialize mood chart
    if (document.getElementById("moodChart")) {
        updateMoodChart();
    }
    
    // Set up mood intensity slider
    if (document.getElementById("moodIntensity")) {
        document.getElementById("moodIntensity").addEventListener("input", function() {
            document.getElementById("intensityValue").textContent = this.value;
        });
    }
    
    // Initialize user stats
    if (document.getElementById("points")) {
        updateStatsDisplay();
    }
    
    // Add animation to sections when they come into view
    const sections = document.querySelectorAll(".feature-section, .info-section");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = "translateY(20px)";
        section.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(section);
    });
    
    // Handle newsletter form submission
    const newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // In a real app, you would send this to your backend
                showToast("Thank you for subscribing to our newsletter!", "success");
                emailInput.value = "";
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
});

window.onload = function () {
  window.scrollTo(0, 0);
};

// Prevent scroll restoration
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

// Also ensure no anchor is in the URL
if (window.location.hash) {
  window.location.hash = "";
}