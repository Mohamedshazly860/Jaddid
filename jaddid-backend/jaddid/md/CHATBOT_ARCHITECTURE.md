# Jaddid AI Chatbot Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                          │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │      ChatbotWidget.jsx (Floating Chat UI)            │ │  │
│  │  │  - Message display                                    │ │  │
│  │  │  - Input field                                        │ │  │
│  │  │  - Quick questions                                    │ │  │
│  │  │  - Loading states                                     │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                          ↓ ↑                               │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │      chatbotService.js (API Layer)                   │ │  │
│  │  │  - sendChatMessage()                                  │ │  │
│  │  │  - getChatHistory()                                   │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/REST
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Django Backend API                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              chatbot/urls.py (Routing)                     │  │
│  │  /api/chatbot/chat/     → ChatbotView                     │  │
│  │  /api/chatbot/history/  → ChatHistoryView                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                ↓                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              chatbot/views.py (Logic)                      │  │
│  │                                                             │  │
│  │  ChatbotView:                                              │  │
│  │  1. Receive user message                                   │  │
│  │  2. Extract intent with OpenAI  ──────────┐               │  │
│  │  3. Search database for matches           │               │  │
│  │  4. Generate response with RAG            │               │  │
│  │  5. Save to chat history                  │               │  │
│  │  6. Return formatted response             │               │  │
│  └───────────────────────────────────────────┼───────────────┘  │
│                                               │                  │
└───────────────────────────────────────────────┼──────────────────┘
                                                │
                        ┌───────────────────────┼──────────────────┐
                        │                       ↓                  │
                        │            OpenAI API (GPT-4o-mini)      │
                        │                                           │
                        │  Step 1: Intent Extraction               │
                        │  ┌─────────────────────────────────────┐ │
                        │  │ Input: User message                  │ │
                        │  │ Output: {                            │ │
                        │  │   "intent": "material_search",       │ │
                        │  │   "budget": 500,                     │ │
                        │  │   "categories": ["plastic"],         │ │
                        │  │   "keywords": "bottles"              │ │
                        │  │ }                                    │ │
                        │  └─────────────────────────────────────┘ │
                        │                                           │
                        │  Step 2: Response Generation (RAG)       │
                        │  ┌─────────────────────────────────────┐ │
                        │  │ Context:                             │ │
                        │  │  - Database search results           │ │
                        │  │  - Knowledge base (jaddid_guide.txt) │ │
                        │  │ Output: Friendly conversational      │ │
                        │  │         response with results        │ │
                        │  └─────────────────────────────────────┘ │
                        └───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                            │
│                                                                   │
│  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   ChatHistory     │  │  MaterialListing │  │   Product    │ │
│  │                   │  │                   │  │              │ │
│  │ - user_message    │  │ - title          │  │ - name       │ │
│  │ - bot_response    │  │ - material       │  │ - price      │ │
│  │ - timestamp       │  │ - price          │  │ - category   │ │
│  │ - intent          │  │ - quantity       │  │ - stock      │ │
│  │ - categories      │  │ - seller         │  │              │ │
│  └───────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                   │
│  ┌───────────────────┐  ┌──────────────────┐                    │
│  │    Material       │  │    Category      │                    │
│  │                   │  │                   │                    │
│  │ - name            │  │ - name           │                    │
│  │ - category        │  │ - description    │                    │
│  │ - default_unit    │  │ - icon           │                    │
│  └───────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Knowledge Base (RAG)                        │
│                                                                   │
│  jaddid_guide.txt                                                │
│  ├── Platform overview                                           │
│  ├── Material categories & descriptions                          │
│  ├── Pricing guidelines                                          │
│  ├── How it works (sellers & buyers)                             │
│  ├── Quality requirements                                        │
│  ├── Sustainability tips                                         │
│  ├── FAQs                                                        │
│  └── Environmental impact info                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Diagram

```
User Types Message
       ↓
[Frontend: ChatbotWidget]
       ↓
sendChatMessage(message)
       ↓
POST /api/chatbot/chat/
       ↓
[Backend: ChatbotView]
       ↓
┌──────────────────────────┐
│ 1. Intent Extraction     │
│    (OpenAI API Call)     │
│                          │
│ System Prompt:           │
│ "You are an assistant    │
│  for Jaddid. Extract     │
│  intent and params"      │
│                          │
│ User Query:              │
│ "I need plastic under    │
│  500 EGP"                │
│                          │
│ Response:                │
│ {                        │
│   intent: "material_     │
│            search",      │
│   budget: 500,           │
│   categories: ["plastic"]│
│ }                        │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ 2. Database Query        │
│                          │
│ MaterialListing          │
│  .filter(               │
│    material__category    │
│      __name='plastic',   │
│    price__lte=550,       │
│    status='active'       │
│  )                       │
│  .order_by('price')[:5]  │
│                          │
│ Results:                 │
│ - PET Bottles: 450 EGP   │
│ - HDPE Containers: 380   │
│ - Mixed Plastic: 220     │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ 3. Load Knowledge Base   │
│                          │
│ Read jaddid_guide.txt    │
│                          │
│ Context includes:        │
│ - Plastic types          │
│ - Price ranges           │
│ - Quality tips           │
│ - Platform info          │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ 4. Generate Response     │
│    (OpenAI API Call)     │
│                          │
│ System Prompt:           │
│ "You are Jaddid          │
│  Assistant. Here are     │
│  search results and      │
│  knowledge base"         │
│                          │
│ Context:                 │
│ - DB results             │
│ - Knowledge base         │
│ - User query             │
│                          │
│ Response:                │
│ "I found 3 plastic       │
│  listings within your    │
│  budget of 500 EGP:      │
│  1. PET Bottles...       │
│  2. HDPE Containers..."  │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ 5. Save Chat History     │
│                          │
│ ChatHistory.create(      │
│   user=request.user,     │
│   user_message=query,    │
│   bot_response=reply,    │
│   intent="material_      │
│           search",       │
│   categories=["plastic"] │
│ )                        │
└──────────────────────────┘
       ↓
Return JSON Response
       ↓
[Frontend: Display Bot Reply]
       ↓
User Sees Message
```

## 🎯 Intent Processing Flow

```
                    User Query
                        ↓
         ┌──────────────┴──────────────┐
         │    Intent Classification    │
         └──────────────┬──────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        │               │               │
    material_       product_       bundle_      general_
     search          search         search        info
        │               │               │            │
        ↓               ↓               ↓            ↓
  Filter by:      Filter by:      Allocate        Use KB
  - Category      - Keywords       budget by       only
  - Budget        - Category       weights
  - Quantity      - Budget            │
  - Keywords                          ↓
        │               │         Find best
        │               │         match per
        │               │         category
        │               │              │
        └───────────────┴──────────────┴────────────┘
                        ↓
              Generate Response (RAG)
                        ↓
                  Return to User
```

## 📊 Data Model Relationships

```
User ─────┬─────── ChatHistory
          │        (chat records)
          │
          ├─────── MaterialListing ───── Material ───── Category
          │        (seller's ads)        (type info)    (grouping)
          │
          └─────── Product ───────────── Category
                   (finished items)      (grouping)
```

## 🔐 Authentication Flow

```
Anonymous User              Authenticated User
      │                            │
      ├─ Can chat ✓                ├─ Can chat ✓
      ├─ No history saved ✗        ├─ History saved ✓
      ├─ Basic results ✓           ├─ Basic results ✓
      └─ No personalization ✗      └─ Can view history ✓
```

## 💰 OpenAI API Cost Flow

```
User Message
    ↓
Intent Extraction
  (~100 tokens input + ~50 tokens output)
  Cost: ~$0.000022
    ↓
Response Generation
  (~500 tokens input + ~200 tokens output)
  Cost: ~$0.000195
    ↓
Total per message: ~$0.00022 USD
(with gpt-4o-mini)

Monthly estimates:
- 1,000 messages: ~$0.22
- 10,000 messages: ~$2.20
- 100,000 messages: ~$22
```

## 🚀 Deployment Architecture (Production)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Gateway │────▶│   Backend    │
│   (Vercel)   │     │   (NGINX)    │     │   (Django)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                           ┌──────────────────────┼─────────────┐
                           ↓                      ↓             ↓
                    ┌─────────────┐     ┌──────────────┐  ┌─────────┐
                    │  PostgreSQL │     │  OpenAI API  │  │  Redis  │
                    │  (Database) │     │   (AI)       │  │ (Cache) │
                    └─────────────┘     └──────────────┘  └─────────┘
```

---

**This architecture ensures:**
- ✅ Real-time conversational experience
- ✅ Intelligent context-aware responses
- ✅ Database integration for live data
- ✅ Knowledge base for consistent info
- ✅ Chat history persistence
- ✅ Scalable and maintainable design
