# 🚀 Quick Start - Jaddid Chatbot

## ⚡ 5-Minute Setup

### 1. Backend Setup
```bash
cd jaddid-backend
.\env\Scripts\activate                    # Activate virtual env
pip install openai                        # Install OpenAI package
```

Create `.env` file:
```env
OPENAI_API_KEY=sk-your-key-here
```

Run migrations:
```bash
cd jaddid
python manage.py makemigrations chatbot
python manage.py migrate
python manage.py runserver
```

### 2. Frontend - Already Done! ✅
The chatbot widget is already integrated in App.jsx and will appear automatically.

```bash
cd jaddid-frontend/Jaddid-frontend
npm run dev
```

## 🎯 Test It

Open your browser and you'll see a green chat button in the bottom-right corner!

### Try These Queries:
- "Show me plastic listings under 500 EGP"
- "I need materials for recycling"
- "What can I sell on Jaddid?"

## 📁 Files Created

**Backend:**
- `chatbot/` - Complete Django app
- `jaddid_guide.txt` - Knowledge base
- Updated `settings.py` and `urls.py`

**Frontend:**
- `components/chatbot/ChatbotWidget.jsx`
- `services/chatbotService.js`
- Updated `App.jsx`

## 🔑 API Endpoints
- `POST /api/chatbot/chat/` - Send message
- `GET /api/chatbot/history/` - Get history (auth required)

## 🐛 Troubleshooting

**"Module not found: openai"**
```bash
pip install openai
```

**"OPENAI_API_KEY not found"**
Add to `.env` file and restart server

**Chatbot not visible**
- Check browser console
- Verify backend is running
- Clear cache and reload

## 💡 How It Works

1. User types message → Frontend sends to backend
2. Backend uses OpenAI to understand intent
3. Searches database for matching materials/products  
4. OpenAI generates friendly response with results
5. Response shown in chat widget

## 🎨 Customize

**Change colors:** Edit `ChatbotWidget.jsx` Tailwind classes
**Modify responses:** Edit `jaddid_guide.txt`
**Change AI model:** Edit `views.py` model parameter

---

**That's it! You now have an AI chatbot for your marketplace! 🎉**
