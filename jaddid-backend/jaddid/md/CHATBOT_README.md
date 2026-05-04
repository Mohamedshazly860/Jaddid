# 🤖 Jaddid AI Chatbot

<div align="center">

![Chatbot Banner](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai)
![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai)

**An intelligent AI assistant for the Jaddid recyclable materials marketplace**

[Quick Start](#-quick-start) • [Features](#-features) • [Demo](#-demo) • [Documentation](#-documentation) • [API](#-api)

</div>

---

## 🌟 Overview

The Jaddid AI Chatbot is an intelligent conversational assistant that helps users find recyclable materials, eco-friendly products, and get expert advice about sustainable commerce. Built with OpenAI's GPT-4o-mini and powered by RAG (Retrieval-Augmented Generation), it provides contextual, database-aware responses.

## ✨ Features

### 🎯 **Intelligent Understanding**
- Natural language query processing
- Multi-intent recognition (material search, product search, bundle planning)
- Context-aware responses
- Budget and quantity awareness

### 🔍 **Smart Search**
- Real-time database queries
- Category-based filtering
- Price range matching
- Keyword search across titles and descriptions

### 💰 **Budget Planning**
- Multi-material bundle allocation
- Weighted category distribution
- Total cost calculation
- Alternative suggestions when over budget

### 🧠 **RAG Knowledge Base**
- 5000+ words of marketplace information
- Material categories and descriptions
- Pricing guidelines
- Environmental impact data
- Platform usage instructions

### 💬 **Beautiful UI**
- Floating chat widget
- Real-time typing indicators
- Quick question suggestions
- Mobile-responsive design
- Smooth animations

### 📊 **Analytics**
- Chat history storage
- User conversation tracking
- Intent classification
- Admin dashboard integration

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### Installation (5 minutes)

#### 1️⃣ Backend Setup
```bash
cd jaddid-backend

# Activate virtual environment
.\env\Scripts\activate  # Windows
# or
source env/bin/activate  # Mac/Linux

# Install dependencies
pip install openai

# Configure environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run migrations
cd jaddid
python manage.py makemigrations chatbot
python manage.py migrate

# Start server
python manage.py runserver
```

#### 2️⃣ Frontend - Already Integrated! ✅
```bash
cd jaddid-frontend/Jaddid-frontend
npm run dev
```

#### 3️⃣ Test It!
1. Open http://localhost:5173
2. Click the green chat button (bottom-right)
3. Try: "Show me plastic listings under 500 EGP"

### Automated Setup (Even Faster!)
```bash
# Windows
cd jaddid-backend
.\setup_chatbot.ps1

# Mac/Linux
cd jaddid-backend
chmod +x setup_chatbot.sh
./setup_chatbot.sh
```

---

## 🎬 Demo

### Example Conversations

<details>
<summary><b>💬 Material Search</b></summary>

**User:** "I need 100kg of plastic bottles under 500 EGP"

**Bot:** "I found 3 plastic bottle listings within your budget:

1. **PET Bottles** - 100 kg @ 450 EGP
   - Condition: Good
   - Seller: john@example.com
   - Location: Cairo

2. **HDPE Containers** - 120 kg @ 380 EGP
   - Condition: Excellent
   - Seller: sarah@example.com
   - Location: Alexandria

3. **Mixed Plastic Bottles** - 150 kg @ 220 EGP
   - Condition: Acceptable
   - Seller: recycler@example.com
   - Location: Giza

Would you like more details about any of these listings?"
</details>

<details>
<summary><b>💰 Bundle Planning</b></summary>

**User:** "I have 5000 EGP for plastic, paper, and metal"

**Bot:** "Here's your optimized material bundle plan:

**Budget Allocation (Total: 5000 EGP)**

✅ **Plastic (25% = 1250 EGP)**
- PET Bottles: 100 kg @ 1100 EGP

✅ **Paper (20% = 1000 EGP)**
- Cardboard Boxes: 200 kg @ 950 EGP

✅ **Metal (20% = 1000 EGP)**
- Aluminum Cans: 30 kg @ 900 EGP

**Summary:**
- Total Cost: 2950 EGP
- Remaining Budget: 2050 EGP
- All items within allocation!

Would you like to adjust the quantities or explore additional materials?"
</details>

<details>
<summary><b>ℹ️ General Information</b></summary>

**User:** "What materials have the highest recycling value?"

**Bot:** "Based on current market rates, here are the most valuable recyclable materials:

1. **Copper** (60-100 EGP/kg)
   - Electrical wiring, pipes
   - High demand from manufacturers

2. **Aluminum** (15-25 EGP/kg)
   - Beverage cans, scrap metal
   - Energy-efficient to recycle

3. **Electronics** (varies widely)
   - Circuit boards, CPUs
   - Precious metal recovery

4. **Clean PET Plastic** (3-8 EGP/kg)
   - Bottles, containers
   - High recycling demand

Pro tip: Clean, sorted materials always fetch better prices! Would you like pricing details for a specific material?"
</details>

---

## 🏗️ Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  React Frontend     │
│  ChatbotWidget.jsx  │
└──────┬──────────────┘
       │ HTTP/REST
       ↓
┌─────────────────────┐
│  Django Backend     │
│  ChatbotView        │
└──────┬──────────────┘
       │
       ├─────→ OpenAI API (Intent Extraction)
       │       ↓
       │       JSON: {intent, budget, categories}
       │
       ├─────→ PostgreSQL (Search Materials)
       │       ↓
       │       Results: Listings, Products
       │
       ├─────→ Knowledge Base (jaddid_guide.txt)
       │       ↓
       │       Context: Platform info, pricing
       │
       └─────→ OpenAI API (Response Generation)
               ↓
               Friendly, contextual reply
```

---

## 📡 API

### Send Message
```http
POST /api/chatbot/chat/
Content-Type: application/json

{
  "message": "Show me eco-friendly products"
}
```

**Response:**
```json
{
  "bot_reply": "Here are some eco-friendly products...",
  "intent": "product_search",
  "debug_categories": [],
  "debug_budget": null
}
```

### Get Chat History
```http
GET /api/chatbot/history/
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "history": [
    {
      "user_message": "Show me products",
      "bot_response": "Here are eco-friendly products...",
      "timestamp": "2025-12-22T10:30:00Z",
      "intent": "product_search"
    }
  ]
}
```

---

## 📁 Project Structure

```
jaddid-backend/jaddid/
├── chatbot/
│   ├── models.py           # ChatHistory model
│   ├── views.py            # AI logic & database queries
│   ├── serializers.py      # API serializers
│   ├── urls.py             # API routing
│   └── admin.py            # Admin panel
├── jaddid_guide.txt        # RAG knowledge base
└── md/
    ├── CHATBOT_SETUP_GUIDE.md
    ├── CHATBOT_QUICKSTART.md
    ├── CHATBOT_ARCHITECTURE.md
    └── CHATBOT_IMPLEMENTATION_SUMMARY.md

jaddid-frontend/Jaddid-frontend/src/
├── components/chatbot/
│   └── ChatbotWidget.jsx   # UI component
└── services/
    └── chatbotService.js   # API integration
```

---

## 🎯 Supported Queries

The chatbot understands:

### ✅ Material Searches
- "Show me plastic listings"
- "I need 100kg of metal under 1000 EGP"
- "Find cardboard in Cairo"

### ✅ Product Searches
- "Show eco-friendly products"
- "What products are made from recycled plastic?"
- "Find sustainable home decor"

### ✅ Bundle Planning
- "I have 5000 EGP for plastic, paper, and metal"
- "Plan a material bundle for 10000 EGP"

### ✅ General Questions
- "What materials can I sell?"
- "How does pricing work?"
- "Tell me about material quality"
- "What's the environmental impact?"

---

## 💰 Cost Analysis

### Per Conversation (using gpt-4o-mini)
- Cost: ~$0.00022 USD
- Tokens: ~850 tokens

### Monthly Estimates
| Messages | Cost (USD) |
|----------|------------|
| 1,000    | $0.22      |
| 10,000   | $2.20      |
| 100,000  | $22        |

**Cost-effective for production use! 🎉**

---

## 🔧 Configuration

### Category Weights
Customize budget allocation in `views.py`:
```python
CATEGORY_WEIGHTS = {
    'plastic': 25,
    'paper': 20,
    'metal': 20,
    'glass': 15,
    # ... customize
}
```

### AI Model
Change model in `views.py`:
```python
model="gpt-4o-mini"  # or "gpt-4", "gpt-3.5-turbo"
```

### Knowledge Base
Edit `jaddid_guide.txt` to update:
- Material descriptions
- Pricing guidelines
- Platform information

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](md/CHATBOT_SETUP_GUIDE.md) | Complete installation & configuration |
| [Quick Start](md/CHATBOT_QUICKSTART.md) | 5-minute setup guide |
| [Architecture](md/CHATBOT_ARCHITECTURE.md) | System design & diagrams |
| [Summary](md/CHATBOT_IMPLEMENTATION_SUMMARY.md) | Implementation details |

---

## 🛠️ Tech Stack

**Backend:**
- Django 4.2.7
- Django REST Framework
- OpenAI Python SDK
- PostgreSQL

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Lucide React

**AI:**
- OpenAI GPT-4o-mini
- RAG Architecture
- JSON Mode

---

## 🐛 Troubleshooting

### Backend Issues

**"OPENAI_API_KEY not found"**
```bash
# Add to .env file
OPENAI_API_KEY=sk-your-key-here
```

**"Module not found: openai"**
```bash
pip install openai
```

### Frontend Issues

**Chatbot not visible**
- Check browser console
- Verify backend is running
- Clear cache and reload

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Enable caching
- [ ] Configure logging
- [ ] Secure API keys

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- [ ] Arabic language support
- [ ] Voice input/output
- [ ] Image recognition
- [ ] Multi-turn context
- [ ] Advanced analytics

---

## 📄 License

This chatbot is part of the Jaddid project.

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Django community
- React team
- All contributors

---

<div align="center">

**Built with ❤️ for sustainable commerce**

[⬆ Back to Top](#-jaddid-ai-chatbot)

</div>
