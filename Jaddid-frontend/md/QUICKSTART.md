# Quick Start Guide - Jaddid Frontend

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "d:\ARCH\Python Full Stack 2025\Graduation Project\Grad Repo\jaddid-frontend\Jaddid-frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── landing/          # Landing page components
│   │   ├── Navbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── HowItWorksSection.jsx
│   │   ├── CTASection.jsx
│   │   └── Footer.jsx
│   └── ui/               # Reusable UI components (shadcn/ui)
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       └── ... (48 components)
├── pages/
│   ├── Index.jsx         # Landing page
│   └── NotFound.jsx      # 404 page
├── contexts/
│   └── LanguageContext.jsx  # i18n context
├── hooks/
│   ├── use-mobile.jsx
│   └── use-toast.js
├── lib/
│   └── utils.js          # Utility functions
├── App.jsx               # Main app component
└── main.jsx              # Entry point
```

## 🎨 Design System

### Colors
The design uses a natural, eco-friendly color palette:
- **Primary**: Forest Green (#2D4F2B)
- **Accent**: Sage Green (#708A58)
- **Secondary**: Orange (#FFB823)
- **Background**: Cream (#FFF1CA) / White

### Typography
- **Primary Font**: Space Grotesk (Latin)
- **Arabic Font**: Cairo (Arabic)

### Components
All components are from shadcn/ui, built with:
- Radix UI primitives
- Tailwind CSS styling
- Full accessibility support

## 🧩 Using Components

### Button Example
```jsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <div>
      <Button variant="default">Default Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="ghost">Ghost Button</Button>
    </div>
  );
}
```

### Card Example
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  );
}
```

### Form Example
```jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function MyForm() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
    </div>
  );
}
```

## 🌐 Internationalization (i18n)

The project supports multiple languages via react-i18next:

```jsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('ar')}>العربية</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

## 📱 Responsive Design

Use the `use-mobile` hook for responsive behavior:

```jsx
import { useIsMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <p>Mobile view</p>
      ) : (
        <p>Desktop view</p>
      )}
    </div>
  );
}
```

## 🔔 Toast Notifications

```jsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showNotification = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
    });
  };
  
  return <button onClick={showNotification}>Show Toast</button>;
}
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📦 Key Dependencies

- **React 18.3.1** - UI library
- **React Router 6.30.1** - Routing
- **@tanstack/react-query 5.83.0** - Data fetching
- **Tailwind CSS 3.4.17** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 🎯 Features

✅ Modern React 18 with hooks
✅ Vite for fast development
✅ Tailwind CSS for styling
✅ shadcn/ui component library
✅ React Router for navigation
✅ React Query for data management
✅ i18n support (Arabic & English)
✅ Dark mode support
✅ Fully responsive design
✅ Accessible components
✅ TypeScript-free (pure JSX)

## 🔗 Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```jsx
// Instead of:
import Button from '../../components/ui/button';

// Use:
import { Button } from '@/components/ui/button';
```

## 📝 Notes

- All components are pure JSX (no TypeScript)
- The design is fully responsive
- Dark mode is available through the theme system
- All UI components follow accessibility best practices

## 🐛 Troubleshooting

### Port already in use
If port 5173 is busy, Vite will automatically use the next available port.

### Module not found
Make sure you've run `npm install` to install all dependencies.

### Path alias not working
Check that `jsconfig.json` exists and `vite.config.js` has the alias configuration.

---

Need help? Check the component documentation at [shadcn/ui docs](https://ui.shadcn.com/)
