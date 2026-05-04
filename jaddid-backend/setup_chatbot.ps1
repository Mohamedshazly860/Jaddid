# Jaddid Chatbot - Quick Setup Script (PowerShell)
# Run this script from the jaddid-backend directory

Write-Host "🚀 Jaddid AI Chatbot Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "jaddid")) {
    Write-Host "❌ Error: Please run this script from the jaddid-backend directory" -ForegroundColor Red
    exit 1
}

# Step 1: Activate virtual environment
Write-Host "📦 Step 1: Activating virtual environment..." -ForegroundColor Cyan
if (Test-Path "env\Scripts\Activate.ps1") {
    & .\env\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Virtual environment not found at env\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "Continuing without virtual environment..." -ForegroundColor Yellow
}

# Step 2: Install OpenAI package
Write-Host ""
Write-Host "📥 Step 2: Installing OpenAI package..." -ForegroundColor Cyan
pip install openai --quiet
Write-Host "✅ OpenAI package installed" -ForegroundColor Green

# Step 3: Check for .env file
Write-Host ""
Write-Host "🔑 Step 3: Checking environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please add your OpenAI API key to .env file" -ForegroundColor Yellow
    Write-Host "   Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Yellow
    Write-Host "   Then edit .env and set: OPENAI_API_KEY=sk-your-key-here" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after you've added your API key to continue"
} else {
    # Check if OPENAI_API_KEY is set
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "✅ OPENAI_API_KEY found in .env" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OPENAI_API_KEY not configured in .env" -ForegroundColor Yellow
        Write-Host "   Please add: OPENAI_API_KEY=sk-your-key-here" -ForegroundColor Yellow
        Write-Host "   Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter after you've added your API key to continue"
    }
}

# Step 4: Run migrations
Write-Host ""
Write-Host "🗄️  Step 4: Running database migrations..." -ForegroundColor Cyan
Set-Location jaddid
python manage.py makemigrations chatbot
python manage.py migrate chatbot
Write-Host "✅ Migrations completed" -ForegroundColor Green

# Step 5: Optional - Create superuser
Write-Host ""
$createSuperuser = Read-Host "Do you want to create a superuser for admin access? (y/n)"
if ($createSuperuser -eq "y" -or $createSuperuser -eq "Y") {
    python manage.py createsuperuser
}

# Step 6: Check if jaddid_guide.txt exists
Write-Host ""
Write-Host "📚 Step 6: Verifying knowledge base..." -ForegroundColor Cyan
if (Test-Path "jaddid_guide.txt") {
    $fileSize = (Get-Item "jaddid_guide.txt").Length
    Write-Host "✅ Knowledge base found ($fileSize bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ Warning: jaddid_guide.txt not found!" -ForegroundColor Red
}

# Step 7: Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. In another terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd ..\jaddid-frontend\Jaddid-frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "4. Click the green chat button (bottom-right)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - Setup Guide: md\CHATBOT_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "   - Quick Start: md\CHATBOT_QUICKSTART.md" -ForegroundColor White
Write-Host "   - Architecture: md\CHATBOT_ARCHITECTURE.md" -ForegroundColor White
Write-Host ""
Write-Host "💡 Try these queries:" -ForegroundColor Cyan
Write-Host "   - 'Show me plastic listings under 500 EGP'" -ForegroundColor White
Write-Host "   - 'I need materials for recycling'" -ForegroundColor White
Write-Host "   - 'What can I sell on Jaddid?'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy chatting!" -ForegroundColor Green
Write-Host ""

Set-Location ..
