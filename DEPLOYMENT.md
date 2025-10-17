# MannSakha AI Chatbot - Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites:
1. GitHub account
2. Vercel account (free)

### Steps:

#### 1. Prepare Environment Variables
Create these environment variables in Vercel:

```env
PORT=3051
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
COHERE_API_KEY=your_cohere_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

#### 2. Deploy Steps:
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Sign up/Login with GitHub
4. Import your repository
5. Add environment variables
6. Deploy!

#### 3. After Deployment:
- Update GOOGLE_CALLBACK_URL with your actual Vercel URL
- Test all functionality
- Your app will be live at: https://your-app.vercel.app

## 🛠 Alternative: Railway Deployment

### Steps:
1. Go to [Railway](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy

## 🐳 Docker Deployment (Advanced)

### Dockerfile included for containerized deployment
1. Build: `docker build -t mannsakha-ai .`
2. Run: `docker run -p 3051:3051 mannsakha-ai`

## 📊 Features Deployed:
✅ Multiple AI APIs (Gemini, OpenAI, Hugging Face)
✅ Smart fallback responses
✅ MongoDB database
✅ Google OAuth authentication
✅ Newsletter functionality
✅ Mental health support chatbot

## 🔧 Production Checklist:
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection working
- [ ] API keys valid and secured
- [ ] Google OAuth URLs updated
- [ ] SSL/HTTPS enabled
- [ ] Domain configured (optional)

Your MannSakha AI chatbot is production-ready! 🎉