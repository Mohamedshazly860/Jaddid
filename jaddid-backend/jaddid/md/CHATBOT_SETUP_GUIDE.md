# Jaddid AI Chatbot - Setup & Usage Guide

## 🎯 Overview
An AI-powered chatbot for the Jaddid marketplace that helps users find recyclable materials, eco-friendly products, and get recommendations. Based on OpenAI's GPT models with RAG (Retrieval-Augmented Generation).

## 📁 What Was Created

### Backend (Django)
```
jaddid-backend/jaddid/
├── chatbot/
│   ├── __init__.py
│   ├── apps.py
│   ├── admin.py
│   ├── models.py          # ChatHistory model
│   ├── views.py           # ChatbotView, ChatHistoryView
│   ├── serializers.py     # ChatHistory serializer
│   ├── urls.py            # API endpoints
│   ├── tests.py
│   └── migrations/
└── jaddid_guide.txt       # Knowledge base for RAG
```

### Frontend (React)
```
jaddid-frontend/Jaddid-frontend/src/
├── components/
│   └── chatbot/
│       └── ChatbotWidget.jsx    # Floating chatbot UI
└── services/
    └── chatbotService.js        # API service layer
```

## 🔧 Backend Setup

### 1. Install Required Package
```bash
cd jaddid-backend
# Activate virtual environment
.\env\Scripts\activate  # Windows
# or
source env/bin/activate  # Mac/Linux

# Install OpenAI package
pip install openai python-dotenv
```

### 2. Update requirements.txt
Add to `requirements.txt`:
```
openai>=1.0.0
```

### 3. Configure Environment Variables
Add to `.env` file (create if doesn't exist):
```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Get your API key from:** https://platform.openai.com/api-keys

### 4. Run Migrations
```bash
cd jaddid
python manage.py makemigrations chatbot
python manage.py migrate
```

### 5. Create Superuser (if needed)
```bash
python manage.py createsuperuser
```

### 6. Start Development Server
```bash
python manage.py runserver
```

The chatbot API will be available at:
- POST `http://localhost:8000/api/chatbot/chat/` - Send messages
- GET `http://localhost:8000/api/chatbot/history/` - Get chat history

## 🎨 Frontend Setup

### 1. Install Dependencies (if needed)
```bash
cd jaddid-frontend/Jaddid-frontend
npm install
# or
bun install
```

The chatbot uses existing dependencies:
- `lucide-react` - Icons (MessageCircle, Send, X, Loader2)
- `axios` - HTTP client (already configured)

### 2. Start Development Server
```bash
npm run dev
# or
bun run dev
```

The chatbot widget will appear on all pages as a floating button in the bottom-right corner.

## 📡 API Endpoints

### Send Chat Message
```http
POST /api/chatbot/chat/
Content-Type: application/json

{
  "message": "I need 100kg of plastic bottles under 500 EGP"
}
```

**Response:**
```json
{
  "bot_reply": "Here are some plastic bottle listings...",
  "intent": "material_search",
  "debug_categories": ["plastic"],
  "debug_budget": 500
}
```

### Get Chat History (Authenticated)
```http
GET /api/chatbot/history/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "history": [
    {
      "user_message": "Show me eco products",
      "bot_response": "Here are some eco-friendly products...",
      "timestamp": "2025-12-22T10:30:00Z",
      "intent": "product_search"
    }
  ]
}
```

## 🤖 Chatbot Features

### Intent Recognition
The chatbot recognizes these intents:
1. **material_search** - Find raw recyclable materials
2. **product_search** - Find eco-friendly products
3. **bundle_search** - Multiple materials within budget
4. **general_info** - General questions about the platform

### Smart Features
- **Budget-aware search** - Finds items within user's budget
- **Category detection** - Automatically identifies material types
- **Quantity matching** - Considers quantity requirements
- **Location awareness** - Can filter by location
- **Bundle planning** - Allocates budget across multiple categories

### Example Queries
```
✅ "I need 100kg of plastic bottles under 500 EGP"
✅ "Show me eco-friendly products made from recycled materials"
✅ "I have 2000 EGP for plastic, metal, and paper"
✅ "What materials can I sell?"
✅ "Tell me about material pricing"
✅ "How does the platform work?"
```

## 🎯 Material Categories Supported

- **Plastic** (bottles, bags, containers)
- **Paper** (cardboard, newspapers, office paper)
- **Metal** (aluminum, copper, steel, iron)
- **Glass** (bottles, jars)
- **Wood** (pallets, sawdust, chips)
- **Electronics** (e-waste, circuit boards)
- **Textiles** (old clothes, fabric scraps)
- **Organic** (compost materials)

## 💡 Usage Examples

### Simple Material Search
**User:** "Show me plastic listings"
**Bot:** Returns active plastic material listings with prices and sellers

### Budget-Based Search
**User:** "I need metal under 1000 EGP"
**Bot:** Returns metal listings within budget, sorted by price

### Bundle Planning
**User:** "I have 5000 EGP for plastic, paper, and metal"
**Bot:** 
- Allocates budget: Plastic (25%), Paper (20%), Metal (20%)
- Finds best match for each category
- Shows total cost and remaining budget

### General Information
**User:** "What's the price range for aluminum?"
**Bot:** Provides pricing information from knowledge base

## 🔒 Security & Permissions

- **Anonymous users:** Can use chatbot but history is not saved
- **Authenticated users:** Chat history is saved and retrievable
- **Admin users:** Can view all chat history in Django admin

## 📊 Admin Panel

Access chat history at: `http://localhost:8000/admin/chatbot/chathistory/`

Features:
- View all user conversations
- Filter by date, intent, user
- Search messages
- Export data

## 🎨 Customization

### Modify Knowledge Base
Edit `jaddid_guide.txt` to update:
- Material descriptions
- Pricing guidelines
- Platform features
- FAQs

### Adjust Category Weights
In `chatbot/views.py`, modify `CATEGORY_WEIGHTS`:
```python
CATEGORY_WEIGHTS = {
    'plastic': 25,
    'paper': 20,
    'metal': 20,
    # ... customize weights
}
```

### Change AI Model
In `chatbot/views.py`, update model:
```python
model="gpt-4o-mini"  # or "gpt-4", "gpt-3.5-turbo"
```

### Customize UI
Edit `components/chatbot/ChatbotWidget.jsx`:
- Colors (Tailwind classes)
- Quick questions
- Messages styling
- Animation effects

## 🐛 Troubleshooting

### Backend Issues

**Error: "OPENAI_API_KEY not found"**
- Add `OPENAI_API_KEY` to `.env` file
- Restart Django server

**Error: "No module named 'openai'"**
```bash
pip install openai
```

**Error: "relation chatbot_chathistory does not exist"**
```bash
python manage.py migrate chatbot
```

### Frontend Issues

**Chatbot button not appearing**
- Check browser console for errors
- Verify `ChatbotWidget` is imported in App.jsx
- Clear browser cache

**API connection errors**
- Verify backend is running on port 8000
- Check CORS settings in Django
- Verify API_BASE_URL in frontend

## 📈 Performance Tips

1. **Rate Limiting:** Consider adding rate limiting to prevent abuse
2. **Caching:** Cache common queries to reduce API costs
3. **Streaming:** Implement streaming responses for better UX
4. **Error Handling:** Add retry logic for failed API calls

## 💰 Cost Management

OpenAI API costs:
- `gpt-4o-mini`: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Monitor usage at: https://platform.openai.com/usage

Tips to reduce costs:
- Use `gpt-4o-mini` instead of `gpt-4`
- Implement caching for common queries
- Set token limits in API calls
- Add rate limiting per user

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False` in settings
2. Use environment variables for `OPENAI_API_KEY`
3. Add rate limiting middleware
4. Configure proper CORS settings
5. Set up logging for chat interactions
6. Use database connection pooling

### Frontend
1. Build for production: `npm run build`
2. Configure proper API URL
3. Enable error tracking (Sentry, etc.)
4. Optimize bundle size
5. Add analytics tracking

## 📝 Next Steps

1. **Add Authentication Context:** Show user-specific recommendations
2. **Implement Feedback:** Add thumbs up/down for responses
3. **Voice Input:** Add speech-to-text for accessibility
4. **Multi-language:** Support Arabic alongside English
5. **Advanced Filters:** Location, seller ratings, delivery options
6. **Analytics Dashboard:** Track popular queries and user satisfaction

## 🎓 Learning Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [RAG Implementation Guide](https://python.langchain.com/docs/tutorials/rag/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Best Practices](https://react.dev/learn)

---

**Built with ❤️ for sustainable commerce**
