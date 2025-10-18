# 🧠 MannSakha - Complete Setup Guide

<p align="center">
  <img src="https://img.shields.io/github/stars/RounakMishra06/MannSakha-chatbot-?style=social" />
  <img src="https://img.shields.io/github/forks/RounakMishra06/MannSakha-chatbot-?style=social" />
  <img src="https://img.shields.io/github/issues/RounakMishra06/MannSakha-chatbot-" />
  <img src="https://img.shields.io/github/license/RounakMishra06/MannSakha-chatbot-" />
</p>

<!-- GSSoC Banner -->
<p align="center">
  <img src="https://user-images.githubusercontent.com/92252895/259034403-7ad22f22-60f9-4c7f-b817-a5012bae4bb9.png" width="100%" />
</p>

## Project Overview
**MannSakha** is an AI-powered chatbot designed to help users manage their busy schedules efficiently while incorporating stress management features. Unlike therapy-based mental health chatbots, MannSakha focuses on productivity, time management, and workload balance. 

### Problem it Solves:
- Helps users organize tasks and appointments in a structured manner.
- Provides personalized scheduling suggestions based on workload.
- Offers stress management techniques to maintain a balanced lifestyle.
- Includes a **doctor recommendation feature** to connect users with professionals.
 
### Key Features & Benefits:
- **Task Scheduling**: AI-powered smart scheduling to prioritize tasks.
- **Workload Management**: Adjusts schedules dynamically to balance work.
- **Stress Management**: Provides relaxation tips and guided techniques.
- **Doctor Recommendations**: Connects users with verified professionals.
- **MannSakha+ (Premium)**: Offers advanced features for productivity enhancement.

### 🌙 Dark Mode Support
- **Automatic Theme Detection**: Automatically detects your system's preferred color scheme
- **Manual Theme Control**: Toggle between Light, Dark, and Auto modes
- **Persistent Preferences**: Your theme choice is saved and persists across sessions
- **Smooth Transitions**: Beautiful animations when switching between themes
- **Brand-Aligned Colors**: Carefully crafted color palette that maintains your brand identity

---

## Dependencies
Ensure you have the following software and libraries installed:

| Dependency | Version |
|------------|---------|
| Node.js    | 20.x or higher |
| Express.js | 4.x     |
| React.js   | 18.x    |
| MongoDB    | 6.x     |
| Gemini API | Latest  |
| Vite       | 7.x     |

---

## Prerequisites
Before starting the setup, install these on your computer:

1. **Node.js** (v20 or higher): https://nodejs.org/
2. **MongoDB Community Edition** (v6 or higher): https://www.mongodb.com/try/download/community
3. **Git**: https://git-scm.com/

Verify installations by running:
```bash
node --version
npm --version
mongod --version
git --version
```

---

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/MannSakha-chatbot-.git
cd MannSakha-chatbot-
```

### Step 2: Install Frontend Dependencies
Navigate to the frontend folder and install dependencies:
```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies
Navigate to the backend folder and install dependencies:
```bash
cd ../backend
npm install
```

### Step 4: Set Up Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **APIs & Services** → **Credentials**
4. Click **"Configure OAuth consent screen"** → Choose **"External"** → Fill in app details
5. Click **"+ Create Credentials"** → Select **"OAuth 2.0 Client ID"** → Choose **"Web application"**
6. Add these **Authorized redirect URIs**:
   - `http://localhost:3050/auth/google/callback`
   - `http://localhost:3000/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### Step 5: Get Gemini API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Search for **"Gemini API"** (or "Generative Language API")
3. Click **"ENABLE"**
4. Go to **Credentials** and click **"+ Create Credentials"**
5. Select **"API Key"**
6. Copy your API key

### Step 6: Create Backend Environment Variables
In the `backend` folder, create a `.env` file:

**Path:** `MannSakha-chatbot-\backend\.env`

```
MONGO_URI=mongodb://localhost:27017/MannSakha
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
PORT=3050
```

Replace the placeholders with your actual credentials.

### Step 7: Start the Backend Server
Open another **new PowerShell/Terminal window**, navigate to the backend folder, and run:
```bash
cd MannSakha-chatbot-\backend
npm start
```

The backend will run on `http://localhost:3050/`

### Step 8: Access the Application
Open your web browser and go to:
```
http://localhost:3050/
```

---


## Usage Guide
- **Schedule Tasks:** Add tasks and deadlines for better organization.
- **Balance Workload:** Get AI-based recommendations for task prioritization.
- **Manage Stress:** Access relaxation exercises and mindfulness techniques.
- **Find a Doctor:** Get recommendations for professionals (MannSakha+ feature).

---

## Troubleshooting

**Port already in use?**
- Change the PORT in backend `.env` file to `5001`, `5002`, etc.
- For frontend, Vite will automatically use the next available port

**MongoDB connection fails?**
- Ensure `mongod` is running in a separate terminal
- Check your connection string in `.env`

**Dependencies won't install?**
```bash
npm cache clean --force
npm install
```

**"Cannot find module" errors?**
- Delete `node_modules` folder: `rm -r node_modules`
- Clear cache: `npm cache clean --force`
- Reinstall: `npm install`

**OAuth errors?**
- Verify Client ID and Client Secret are correctly added to `.env`
- Check redirect URIs match exactly in Google Console

**Frontend not connecting to backend?**
- Ensure backend is running on port 3050
- Check your frontend API endpoint configuration

---

## License
This project is licensed under the **MIT License**.

---

## Future Plans
- **Mobile App Version** for easier access.
- **Voice Assistant Integration** for hands-free scheduling.
- **AI-powered Task Predictions** to improve efficiency.
- **More Partnerships with Health Professionals** to enhance recommendations.

---

## Contribution Guidelines
Want to contribute? Follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## Contributors
We appreciate your efforts in making **MannSakha** better. Your contributions help us build a more productive and stress-free experience for everyone!

---
<a href="https://github.com/RounakMishra06/MannSakha-chatbot-/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RounakMishra06/MannSakha-chatbot-" />
</a>

---


<h3 align="center">🚀 MannSakha - Your Smart Productivity Partner! 🚀</h3>
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=100&section=footer" />
</p>
