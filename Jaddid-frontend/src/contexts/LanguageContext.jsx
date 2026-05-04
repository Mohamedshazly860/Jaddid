import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.favourites': 'Favourites',
    'nav.services': 'Services',
    'nav.getStarted': 'Get Started',
    
    // Hero Section
    'hero.tagline': 'Recycle. Earn. Repeat.',
    'hero.title': 'Turn Your Waste Into Value',
    'hero.subtitle': 'Connect with certified recycling factories, schedule pickups, and earn rewards for your recyclable materials. Join the circular economy today.',
    'hero.cta': 'Start Recycling',
    'hero.secondaryCta': 'How It Works',
    'hero.stat1': 'Recycling Partners',
    'hero.stat2': 'Materials Collected',
    'hero.stat3': 'Happy Users',
    
    // Features Section
    'features.tagline': 'Why Choose Jaddid?',
    'features.title': 'The Smart Way to Recycle',
    'features.subtitle': 'We connect you directly with certified recycling factories, making recycling convenient, profitable, and transparent.',
    'features.track.title': 'Track Everything',
    'features.track.desc': 'Real-time tracking from pickup to processing. Know exactly where your materials go and their environmental impact.',
    'features.earn.title': 'Earn Rewards',
    'features.earn.desc': 'Get paid for your recyclables! Earn points, coupons, and cash rewards for every material you recycle.',
    'features.eco.title': 'Eco-Friendly',
    'features.eco.desc': 'Reduce landfill waste and carbon footprint. Every item recycled contributes to a cleaner planet.',
    'features.verified.title': 'Verified Partners',
    'features.verified.desc': 'All factories and couriers are certified and verified for quality assurance and trust.',
    
    // How It Works
    'how.tagline': 'Simple & Easy',
    'how.title': 'How Jaddid Works',
    'how.subtitle': 'From your home to the recycling factory in just a few simple steps.',
    'how.step1.title': 'List Your Materials',
    'how.step1.desc': 'Add your recyclable materials to the platform - plastics, paper, metals, electronics, and more.',
    'how.step2.title': 'Schedule Pickup',
    'how.step2.desc': 'Choose a convenient time for our verified courier to collect your materials from your doorstep.',
    'how.step3.title': 'Get Rewarded',
    'how.step3.desc': 'Track your delivery, receive confirmation, and earn rewards once materials reach the factory.',
    
    // CTA Section
    'cta.title': 'Ready to Make an Impact?',
    'cta.subtitle': 'Join thousands of eco-conscious users who are turning waste into value every day.',
    'cta.button': 'Start Recycling Now',
    'cta.secondary': 'Partner With Us',
    
    // Footer
    'footer.tagline': 'Connecting communities with sustainable recycling solutions.',
    'footer.quickLinks': 'Quick Links',
    'footer.forPartners': 'For Partners',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
  },
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.marketplace': 'السوق',
    'nav.orders': 'الطلبات',
    'nav.profile': 'الملف الشخصي',
    'nav.favourites': 'المفضلة',
    'nav.services': 'الخدمات',
    'nav.getStarted': 'ابدأ الآن',
    
    // Hero Section
    'hero.tagline': 'أعد التدوير. اربح. كرر.',
    'hero.title': 'حوّل نفاياتك إلى قيمة',
    'hero.subtitle': 'تواصل مع مصانع إعادة التدوير المعتمدة، حدد مواعيد الاستلام، واحصل على مكافآت مقابل موادك القابلة لإعادة التدوير. انضم للاقتصاد الدائري اليوم.',
    'hero.cta': 'ابدأ التدوير',
    'hero.secondaryCta': 'كيف يعمل',
    'hero.stat1': 'شريك تدوير',
    'hero.stat2': 'مادة تم جمعها',
    'hero.stat3': 'مستخدم سعيد',
    
    // Features Section
    'features.tagline': 'لماذا جديد؟',
    'features.title': 'الطريقة الذكية لإعادة التدوير',
    'features.subtitle': 'نربطك مباشرة بمصانع إعادة التدوير المعتمدة، لجعل التدوير مريحاً ومربحاً وشفافاً.',
    'features.track.title': 'تتبع كل شيء',
    'features.track.desc': 'تتبع لحظي من الاستلام إلى المعالجة. اعرف بالضبط أين تذهب موادك وأثرها البيئي.',
    'features.earn.title': 'اكسب مكافآت',
    'features.earn.desc': 'احصل على مقابل لموادك! اربح نقاط وكوبونات ومكافآت نقدية لكل مادة تعيد تدويرها.',
    'features.eco.title': 'صديق للبيئة',
    'features.eco.desc': 'قلل من نفايات المكبات والبصمة الكربونية. كل عنصر يُعاد تدويره يساهم في كوكب أنظف.',
    'features.verified.title': 'شركاء موثوقون',
    'features.verified.desc': 'جميع المصانع والمندوبين معتمدون وموثوقون لضمان الجودة والثقة.',
    
    // How It Works
    'how.tagline': 'بسيط وسهل',
    'how.title': 'كيف يعمل جديد',
    'how.subtitle': 'من منزلك إلى مصنع التدوير في بضع خطوات بسيطة.',
    'how.step1.title': 'أضف موادك',
    'how.step1.desc': 'أضف موادك القابلة لإعادة التدوير - بلاستيك، ورق، معادن، إلكترونيات، والمزيد.',
    'how.step2.title': 'حدد موعد الاستلام',
    'how.step2.desc': 'اختر وقتاً مناسباً لمندوبنا المعتمد لاستلام موادك من باب منزلك.',
    'how.step3.title': 'احصل على مكافأتك',
    'how.step3.desc': 'تتبع توصيلتك، استلم التأكيد، واحصل على مكافآتك عند وصول المواد للمصنع.',
    
    // CTA Section
    'cta.title': 'مستعد لإحداث فرق؟',
    'cta.subtitle': 'انضم لآلاف المستخدمين الواعين بيئياً الذين يحولون النفايات إلى قيمة كل يوم.',
    'cta.button': 'ابدأ التدوير الآن',
    'cta.secondary': 'كن شريكاً معنا',
    
    // Footer
    'footer.tagline': 'نربط المجتمعات بحلول إعادة التدوير المستدامة.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.forPartners': 'للشركاء',
    'footer.contact': 'تواصل معنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
  },
};

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  // Load language from localStorage on initial mount
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });
  
  const isRTL = language === 'ar';

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
