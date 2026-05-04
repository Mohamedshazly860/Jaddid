# Team Collaboration Guide
# دليل التعاون الجماعي

---

## English Version

### 🎯 Getting Started for Team Members

#### 1. Initial Setup (First Time Only)

```powershell
# Clone the repository
git clone https://github.com/Mohamedshazly860/jaddid-backend.git
cd jaddid-backend

# Activate virtual environment
.\env\Scripts\Activate.ps1

# Install all dependencies
pip install -r requirements.txt

# Setup your local environment
cp .env.example .env
# Edit .env with YOUR LOCAL database credentials
```

#### 2. Database Setup

**Option A: Using pgAdmin (Recommended for Windows)**
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `jaddid_db`
5. Save

**Option B: Using Command Line**
```powershell
# If psql is in PATH
$env:PGPASSWORD='your-password'
psql -U postgres -c "CREATE DATABASE jaddid_db;"
```

#### 3. Apply Migrations

```powershell
cd jaddid
python manage.py migrate
python manage.py createsuperuser  # Create your admin account
```

#### 4. Test Everything Works

```powershell
# Run checks
python manage.py check

# Start server
python manage.py runserver

# Visit: http://localhost:8000/swagger/
```

---

### 🔄 Daily Workflow

#### Morning Routine
```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for new migrations
cd jaddid
python manage.py migrate

# 3. Check for new dependencies
cd ..
pip install -r requirements.txt

# 4. Start working
python manage.py runserver
```

#### Before Starting New Work
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make sure you're up to date
git pull origin main
```

#### While Working
```powershell
# Run server with auto-reload
cd jaddid
python manage.py runserver

# Keep testing your changes
# Use Swagger UI: http://localhost:8000/swagger/
```

#### After Completing Work
```bash
# 1. Check what changed
git status
git diff

# 2. Stage your changes
git add jaddid/marketplace/views.py
git add jaddid/marketplace/models.py
# OR add all changes
git add .

# 3. Commit with clear message
git commit -m "feat: Add order confirmation endpoint"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
```

---

### 📝 Commit Message Guidelines

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "feat: Add product filtering by price range"
git commit -m "fix: Resolve duplicate order number issue"
git commit -m "docs: Update API documentation for reviews"
git commit -m "refactor: Optimize product query performance"

# Bad examples (avoid these)
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "asdasd"
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

### 🚫 What NOT to Commit

**Never commit these files:**
```
.env                 # Your local environment variables
*.pyc                # Python compiled files
__pycache__/         # Python cache directories
db.sqlite3           # SQLite database (we use PostgreSQL)
media/               # User uploaded files
.DS_Store            # Mac OS files
.vscode/             # Editor settings (unless team agrees)
*.log                # Log files
```

These are already in `.gitignore` - but double check!

---

### 🔀 Branch Strategy

```
main (protected)
  ├── feature/marketplace-products
  ├── feature/order-system
  ├── feature/messaging
  ├── fix/image-upload-bug
  └── docs/api-documentation
```

**Rules:**
- `main` branch is protected - no direct commits
- Always create feature branches
- Branch naming: `feature/`, `fix/`, `docs/`, etc.
- Delete branch after merging

---

### 🤝 Pull Request Process

#### Creating a PR
1. Push your feature branch to GitHub
2. Go to repository on GitHub
3. Click "Pull Request" → "New Pull Request"
4. Select your branch
5. Fill in description:
   ```markdown
   ## What changed?
   - Added order confirmation feature
   - Updated order model with confirmed_at field
   - Added tests for order confirmation
   
   ## How to test?
   1. Create an order
   2. Call POST /api/orders/{id}/confirm/
   3. Check order status changed to "confirmed"
   
   ## Screenshots (if applicable)
   [Add screenshots]
   ```
6. Request review from team members

#### Reviewing a PR
- Read the code changes
- Test locally if needed:
  ```bash
  git fetch origin
  git checkout feature/branch-name
  python manage.py migrate
  python manage.py runserver
  ```
- Leave comments/suggestions
- Approve or request changes

---

### 🗄️ Database Best Practices

#### Working with Migrations

```powershell
# Create migrations for your changes
python manage.py makemigrations

# Check what the migration will do (before applying)
python manage.py sqlmigrate marketplace 0001

# Apply migrations
python manage.py migrate

# Rollback if needed
python manage.py migrate marketplace 0001
```

#### Important Rules
1. **Always create migrations for model changes**
2. **Test migrations before committing**
3. **Coordinate with team on migrations**
4. **Never edit applied migrations**
5. **Backup database before major migrations**

#### Sharing Database Schema

```powershell
# Export current schema
python manage.py dumpdata marketplace --indent 2 > marketplace_data.json

# Import schema (on another machine)
python manage.py loaddata marketplace_data.json
```

---

### 🔧 Environment Configuration

#### Each Team Member's `.env` Should Have:

```env
# Your local setup
DB_NAME=jaddid_db
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_PASSWORD  # Change this!
DB_HOST=localhost
DB_PORT=5432

# Keep these same
SECRET_KEY=django-insecure-@!g0$h)g48c@)x$fl=@zx)#_ys7vg+ry(g1(eq-#s_3hujbs+f
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Why Each Person Has Different Setup?
- Different PostgreSQL passwords
- Different database configurations
- Local vs remote database
- Different development ports

---

### 🐛 Troubleshooting Common Issues

#### Issue: "Database does not exist"
```powershell
# Solution: Create the database
psql -U postgres
CREATE DATABASE jaddid_db;
\q
```

#### Issue: "Module not found"
```powershell
# Solution: Install dependencies
pip install -r requirements.txt
```

#### Issue: "Migration conflicts"
```powershell
# Solution: Pull latest changes
git pull origin main
python manage.py migrate
```

#### Issue: "Port already in use"
```powershell
# Solution: Use different port
python manage.py runserver 8001
```

#### Issue: "Permission denied on models"
```powershell
# Solution: Check your permissions.py
# Make sure you're authenticated
# Check if you're the owner of the resource
```

---

### 📞 Communication

#### Daily Standup (Recommended)
- What did you do yesterday?
- What will you do today?
- Any blockers?

#### Code Reviews
- Review PRs within 24 hours
- Be constructive and respectful
- Ask questions if unclear

#### Questions?
- Check documentation first
- Ask in team chat
- Create GitHub issue for bugs
- Tag relevant team members

---

### 📚 Resources for Team

#### Documentation Files
- `README.md` - Quick start guide
- `MARKETPLACE_DOCUMENTATION.md` - Complete feature docs
- `API_EXAMPLES.md` - API usage examples
- `DATABASE_SETUP.md` - Database setup guide
- This file - Team collaboration

#### Useful Commands
```powershell
# Check Django version
python -m django --version

# Check installed packages
pip list

# Django shell (for testing)
python manage.py shell

# Create admin user
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

---

## النسخة العربية

### 🎯 البدء لأعضاء الفريق

#### 1. الإعداد الأولي (أول مرة فقط)

```powershell
# استنساخ المستودع
git clone https://github.com/Mohamedshazly860/jaddid-backend.git
cd jaddid-backend

# تفعيل البيئة الافتراضية
.\env\Scripts\Activate.ps1

# تثبيت جميع التبعيات
pip install -r requirements.txt

# إعداد البيئة المحلية
cp .env.example .env
# تحرير .env ببيانات قاعدة البيانات المحلية الخاصة بك
```

#### 2. إعداد قاعدة البيانات

**الخيار أ: استخدام pgAdmin (موصى به لـ Windows)**
1. افتح pgAdmin
2. اتصل بخادم PostgreSQL
3. انقر بزر الماوس الأيمن على "قواعد البيانات" → إنشاء → قاعدة بيانات
4. الاسم: `jaddid_db`
5. حفظ

#### 3. تطبيق الترحيلات

```powershell
cd jaddid
python manage.py migrate
python manage.py createsuperuser  # إنشاء حساب المسؤول الخاص بك
```

---

### 🔄 سير العمل اليومي

#### روتين الصباح
```bash
# 1. سحب أحدث التغييرات
git pull origin main

# 2. التحقق من الترحيلات الجديدة
cd jaddid
python manage.py migrate

# 3. التحقق من التبعيات الجديدة
cd ..
pip install -r requirements.txt

# 4. بدء العمل
python manage.py runserver
```

#### قبل بدء عمل جديد
```bash
# 1. إنشاء فرع ميزة
git checkout -b feature/اسم-الميزة

# 2. تأكد من أنك محدث
git pull origin main
```

#### أثناء العمل
```powershell
# تشغيل الخادم مع إعادة التحميل التلقائي
cd jaddid
python manage.py runserver

# استمر في اختبار التغييرات الخاصة بك
# استخدم Swagger UI: http://localhost:8000/swagger/
```

#### بعد إكمال العمل
```bash
# 1. تحقق مما تغير
git status
git diff

# 2. إضافة التغييرات
git add jaddid/marketplace/views.py
git add jaddid/marketplace/models.py
# أو إضافة جميع التغييرات
git add .

# 3. الالتزام برسالة واضحة
git commit -m "feat: إضافة نقطة نهاية تأكيد الطلب"

# 4. الدفع إلى الفرع الخاص بك
git push origin feature/اسم-الميزة

# 5. إنشاء طلب سحب على GitHub
```

---

### 📝 إرشادات رسائل الالتزام

استخدم رسائل التزام واضحة ووصفية:

```bash
# أمثلة جيدة
git commit -m "feat: إضافة تصفية المنتجات حسب نطاق السعر"
git commit -m "fix: حل مشكلة رقم الطلب المكرر"
git commit -m "docs: تحديث وثائق API للمراجعات"

# أمثلة سيئة (تجنب هذه)
git commit -m "إصلاح الأشياء"
git commit -m "تحديث"
git commit -m "asdasd"
```

**أنواع الالتزامات:**
- `feat:` ميزة جديدة
- `fix:` إصلاح خطأ
- `docs:` توثيق
- `refactor:` إعادة هيكلة الكود
- `test:` إضافة اختبارات
- `chore:` مهام الصيانة

---

### 🚫 ما لا يجب الالتزام به

**لا تلتزم أبدًا بهذه الملفات:**
```
.env                 # متغيرات البيئة المحلية الخاصة بك
*.pyc                # ملفات Python المجمعة
__pycache__/         # دلائل ذاكرة التخزين المؤقت Python
db.sqlite3           # قاعدة بيانات SQLite (نستخدم PostgreSQL)
media/               # الملفات التي تم تحميلها من قبل المستخدم
.vscode/             # إعدادات المحرر
*.log                # ملفات السجل
```

هذه موجودة بالفعل في `.gitignore` - لكن تحقق مرة أخرى!

---

### 🤝 عملية طلب السحب

#### إنشاء PR
1. ادفع فرع الميزة الخاص بك إلى GitHub
2. انتقل إلى المستودع على GitHub
3. انقر على "طلب سحب" → "طلب سحب جديد"
4. حدد الفرع الخاص بك
5. املأ الوصف
6. اطلب المراجعة من أعضاء الفريق

---

### 🔧 تكوين البيئة

#### يجب أن يحتوي `.env` لكل عضو في الفريق على:

```env
# الإعداد المحلي الخاص بك
DB_NAME=jaddid_db
DB_USER=postgres
DB_PASSWORD=كلمة_المرور_المحلية_الخاصة_بك  # غير هذا!
DB_HOST=localhost
DB_PORT=5432

# احتفظ بهذه متطابقة
SECRET_KEY=django-insecure-@!g0$h)g48c@)x$fl=@zx)#_ys7vg+ry(g1(eq-#s_3hujbs+f
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

### 🐛 استكشاف الأخطاء الشائعة

#### المشكلة: "قاعدة البيانات غير موجودة"
```powershell
# الحل: إنشاء قاعدة البيانات
psql -U postgres
CREATE DATABASE jaddid_db;
\q
```

#### المشكلة: "الوحدة غير موجودة"
```powershell
# الحل: تثبيت التبعيات
pip install -r requirements.txt
```

#### المشكلة: "تعارض الترحيلات"
```powershell
# الحل: سحب أحدث التغييرات
git pull origin main
python manage.py migrate
```

---

### 📞 التواصل

#### الاجتماع اليومي (موصى به)
- ماذا فعلت أمس؟
- ماذا ستفعل اليوم؟
- أي عوائق؟

#### مراجعات الكود
- راجع PRs في غضون 24 ساعة
- كن بناءً ومحترمًا
- اسأل أسئلة إذا لم تكن واضحة

#### أسئلة؟
- تحقق من الوثائق أولاً
- اسأل في دردشة الفريق
- أنشئ مشكلة GitHub للأخطاء
- ضع علامة على أعضاء الفريق ذوي الصلة

---

### 📚 موارد للفريق

#### ملفات التوثيق
- `README.md` - دليل البدء السريع
- `MARKETPLACE_DOCUMENTATION.md` - وثائق الميزات الكاملة
- `API_EXAMPLES.md` - أمثلة استخدام API
- `DATABASE_SETUP.md` - دليل إعداد قاعدة البيانات
- هذا الملف - التعاون الجماعي

---

## 🎯 Quick Reference - مرجع سريع

### Essential Commands - الأوامر الأساسية

```powershell
# Activate environment - تفعيل البيئة
.\env\Scripts\Activate.ps1

# Run server - تشغيل الخادم
python manage.py runserver

# Make migrations - إنشاء ترحيلات
python manage.py makemigrations

# Apply migrations - تطبيق الترحيلات
python manage.py migrate

# Create superuser - إنشاء مستخدم خارق
python manage.py createsuperuser

# Check code - فحص الكود
python manage.py check
```

### Git Commands - أوامر Git

```bash
# Pull updates - سحب التحديثات
git pull origin main

# Create branch - إنشاء فرع
git checkout -b feature/name

# Stage changes - إضافة التغييرات
git add .

# Commit - الالتزام
git commit -m "message"

# Push - الدفع
git push origin feature/name

# Check status - فحص الحالة
git status
```

---

**Remember**: Communication is key! Ask questions, help teammates, and keep learning together.
**تذكر**: التواصل هو المفتاح! اسأل أسئلة، ساعد زملائك، واستمر في التعلم معًا.

---

**Happy Coding! 🚀**
**برمجة سعيدة! 🚀**
