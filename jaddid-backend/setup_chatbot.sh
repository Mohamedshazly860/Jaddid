#!/bin/bash
# Jaddid Chatbot - Quick Setup Script (Bash for Mac/Linux)
# Run this script from the jaddid-backend directory

echo " Jaddid AI Chatbot Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "jaddid" ]; then
    echo "Error: Please run this script from the jaddid-backend directory"
    exit 1
fi

# Step 1: Activate virtual environment
echo "Step 1: Activating virtual environment..."
if [ -f "env/bin/activate" ]; then
    source env/bin/activate
    echo "Virtual environment activated"
else
    echo "Warning: Virtual environment not found at env/bin/activate"
    echo "Continuing without virtual environment..."
fi

# Step 2: Install OpenAI package
echo ""
echo "Step 2: Installing OpenAI package..."
pip install openai --quiet
echo "OpenAI package installed"

# Step 3: Check for .env file
echo ""
echo "Step 3: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo ".env file not found. Creating from template..."
    cp .env.example .env
    echo "Created .env file"
    echo ""
    echo "IMPORTANT: Please add your OpenAI API key to .env file"
    echo "Get your key from: https://platform.openai.com/api-keys"
    echo "Then edit .env and set: OPENAI_API_KEY=sk-your-key-here"
    echo ""
    read -p "Press Enter after you've added your API key to continue"
else
    # Check if OPENAI_API_KEY is set
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "OPENAI_API_KEY found in .env"
    else
        echo "OPENAI_API_KEY not configured in .env"
        echo "Please add: OPENAI_API_KEY=sk-your-key-here"
        echo "Get your key from: https://platform.openai.com/api-keys"
        echo ""
        read -p "Press Enter after you've added your API key to continue"
    fi
fi

# Step 4: Run migrations
echo ""
echo "Step 4: Running database migrations..."
cd jaddid
python manage.py makemigrations chatbot
python manage.py migrate chatbot
echo "Migrations completed"

# Step 5: Optional - Create superuser
echo ""
read -p "Do you want to create a superuser for admin access? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Step 6: Check if jaddid_guide.txt exists
echo ""
echo "Step 6: Verifying knowledge base..."
if [ -f "jaddid_guide.txt" ]; then
    FILE_SIZE=$(wc -c < jaddid_guide.txt)
    echo "Knowledge base found ($FILE_SIZE bytes)"
else
    echo "Warning: jaddid_guide.txt not found!"
fi

# Step 7: Summary
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "  Next Steps:"
echo "1. Start the backend server:"
echo "   python manage.py runserver"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd ../jaddid-frontend/Jaddid-frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "4. Click the green chat button (bottom-right)"
echo ""
echo "Documentation:"
echo "   - Setup Guide: md/CHATBOT_SETUP_GUIDE.md"
echo "   - Quick Start: md/CHATBOT_QUICKSTART.md"
echo "   - Architecture: md/CHATBOT_ARCHITECTURE.md"
echo ""
echo "Try these queries:"
echo "   - 'Show me plastic listings under 500 EGP'"
echo "   - 'I need materials for recycling'"
echo "   - 'What can I sell on Jaddid?'"
echo ""
echo "Happy chatting!"
echo ""

cd ..
