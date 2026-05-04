import {
  Recycle,
  Package,
  Truck,
  CheckCircle,
  Leaf,
  Factory,
  Heart,
  TrendingUp,
  ArrowRight,
  Award,
  MapPin,
  Shield,
  Gift,
  Clock,
  Phone,
  Sparkles,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const heroStats = [
    { value: '200+', labelEn: 'Partners', labelAr: 'شريك' },
    { value: '50K+', labelEn: 'Kg Recycled', labelAr: 'كجم معاد تدويره' },
    { value: '25K+', labelEn: 'Active Users', labelAr: 'مستخدم نشط' },
  ];

  const valuePillars = [
    {
      icon: Shield,
      titleEn: 'Certified Chain',
      titleAr: 'سلسلة معتمدة',
      descEn: 'Verified couriers, audited factories, and quality checks.',
      descAr: 'مندوبون موثوقون، مصانع مُعتمدة، وفحوصات جودة.',
    },
    {
      icon: Gift,
      titleEn: 'Rewards That Matter',
      titleAr: 'مكافآت مجزية',
      descEn: 'Cash + points + perks for every kilo you recycle.',
      descAr: 'نقد + نقاط + مزايا لكل كيلو تعيد تدويره.',
    },
    {
      icon: Leaf,
      titleEn: 'Real Impact',
      titleAr: 'أثر حقيقي',
      descEn: 'Track CO₂ saved and waste diverted with live metrics.',
      descAr: 'تتبع الكربون المُوفَّر والنفايات المُحوّلة بأرقام لحظية.',
    },
    {
      icon: Phone,
      titleEn: 'Live Support',
      titleAr: 'دعم فوري',
      descEn: 'Multilingual chat and hotline for sellers and couriers.',
      descAr: 'دردشة وخط ساخن متعدد اللغات للبائعين والمندوبين.',
    },
  ];

  const processSteps = [
    {
      icon: Package,
      number: '01',
      titleEn: 'List or Request',
      titleAr: 'إدراج أو طلب',
      descEn: 'Tell us what you have or what you need collected.',
      descAr: 'أخبرنا بما لديك أو ما تريد جمعه.',
    },
    {
      icon: Truck,
      number: '02',
      titleEn: 'Pickup & Safety',
      titleAr: 'الاستلام والأمان',
      descEn: 'Certified couriers with sealed packaging and live ETAs.',
      descAr: 'مندوبون معتمدون وتغليف محكم مع توقيت وصول لحظي.',
    },
    {
      icon: Factory,
      number: '03',
      titleEn: 'Processing',
      titleAr: 'المعالجة',
      descEn: 'Partner factories sort, clean, and transform materials.',
      descAr: 'مصانعنا الشريكة تفرز وتنظف وتحول المواد.',
    },
    {
      icon: CheckCircle,
      number: '04',
      titleEn: 'Rewards & Proof',
      titleAr: 'مكافآت وإثبات',
      descEn: 'Get paid, earn points, and download impact certificates.',
      descAr: 'احصل على المدفوعات، اكسب النقاط، وحمّل شهادات الأثر.',
    },
  ];

  const services = [
    {
      icon: Recycle,
      titleEn: 'Smart Materials Hub',
      titleAr: 'مركز المواد الذكي',
      descEn: 'Browse, price, and move materials with verified buyers.',
      descAr: 'تصفح، سعّر، وانقل المواد مع مشترين موثوقين.',
    },
    {
      icon: MapPin,
      titleEn: 'Nationwide Pickup',
      titleAr: 'استلام على مستوى الجمهورية',
      descEn: 'Doorstep collection with optimized routing and ETAs.',
      descAr: 'استلام من الباب مع مسارات محسّنة وتوقيت وصول.',
    },
    {
      icon: Zap,
      titleEn: 'Instant Quotes',
      titleAr: 'عروض فورية',
      descEn: 'Get real-time pricing based on market rates.',
      descAr: 'احصل على أسعار لحظية بناءً على أسعار السوق.',
    },
    {
      icon: Clock,
      titleEn: 'Real-Time Tracking',
      titleAr: 'تتبع لحظي',
      descEn: 'Track every pickup, route, and delivery milestone.',
      descAr: 'تتبع كل استلام ومسار ومرحلة تسليم.',
    },
  ];

  const materials = [
    { nameEn: 'Plastics', nameAr: 'بلاستيك', image: new URL('../assets/material-plastic.jpg', import.meta.url).href },
    { nameEn: 'Paper', nameAr: 'ورق', image: new URL('../assets/material-paper.jpg', import.meta.url).href },
    { nameEn: 'Metals', nameAr: 'معادن', image: new URL('../assets/material-metal.jpg', import.meta.url).href },
    { nameEn: 'Glass', nameAr: 'زجاج', image: new URL('../assets/material-glass.jpg', import.meta.url).href },
    { nameEn: 'Electronics', nameAr: 'إلكترونيات', image: new URL('../assets/material-electronics.jpg', import.meta.url).href },
    { nameEn: 'Textiles', nameAr: 'منسوجات', image: new URL('../assets/material-textiles.jpg', import.meta.url).href },
  ];

  const benefits = [
    {
      icon: Leaf,
      titleEn: 'Environmental Impact',
      titleAr: 'أثر بيئي',
      descEn: 'Reduce landfill waste and CO₂ with transparent reporting.',
      descAr: 'قلل النفايات وانبعاثات الكربون بتقارير شفافة.',
      stat: '50t',
      statLabelEn: 'CO₂ saved / month',
      statLabelAr: 'طن كربون مُوفَّر شهرياً',
    },
    {
      icon: TrendingUp,
      titleEn: 'Earn More',
      titleAr: 'أربح أكثر',
      descEn: 'Competitive payouts plus points, coupons, and bonuses.',
      descAr: 'عوائد منافسة مع نقاط وكوبونات ومكافآت.',
      stat: 'EGP 100K',
      statLabelEn: 'paid monthly',
      statLabelAr: 'مدفوعة شهرياً',
    },
    {
      icon: Heart,
      titleEn: 'Community Uplift',
      titleAr: 'تمكين المجتمع',
      descEn: 'Support local jobs and circular-economy partners.',
      descAr: 'دعم الوظائف المحلية وشركاء الاقتصاد الدائري.',
      stat: '500+',
      statLabelEn: 'jobs created',
      statLabelAr: 'وظيفة تم خلقها',
    },
  ];

  const impactStats = [
    { value: '200+', en: 'Factories & recyclers', ar: 'مصانع ومُعاد تدوير' },
    { value: '50K+', en: 'Kg diverted monthly', ar: 'كجم مُحوّل شهرياً' },
    { value: '98%', en: 'On-time pickups', ar: 'استلام في الموعد' },
    { value: '4.8⭐', en: 'Courier rating', ar: 'تقييم المندوب' },
  ];

  return (
    <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero Section - Completely Redesigned */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3a6a4a] via-[#4d7b57] to-[#3f6549] min-h-screen pt-32 pb-24 px-4 flex items-center">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#F0A84D]/20 to-transparent blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#708A58]/30 to-transparent blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-gradient-to-r from-[#F0A84D]/10 via-[#708A58]/10 to-transparent blur-3xl rounded-full" />
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Sparkles className="w-16 h-16 text-[#F0A84D]" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-15 animate-spin" style={{ animationDuration: '8s' }}>
          <Recycle className="w-20 h-20 text-[#F0A84D]" />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-[0.08]">
          <Leaf className="w-32 h-32 text-white" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Centered content layout */}
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F0A84D]/20 backdrop-blur-sm border border-[#F0A84D]/50 px-6 py-3 rounded-full hover:border-[#F0A84D]/80 transition-all">
              <Zap className="w-5 h-5 text-[#F0A84D]" />
              <span className="text-white font-semibold text-sm">
                {isArabic ? 'تقنية متطورة للتدوير الذكي' : 'Smart Recycling Technology'}
              </span>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight max-w-5xl mx-auto ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? (
                <>
                  <span className="text-[#F0A84D]">كل كيلو يُحدث فرقاً.</span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-[#E8F3E8] to-[#F0A84D] bg-clip-text text-transparent">نحوّل مواردك إلى دخل مستدام</span>
                </>
              ) : (
                <>
                  <span className="text-[#F0A84D]">Every Kilo Counts.</span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-[#E8F3E8] to-[#F0A84D] bg-clip-text text-transparent">We Turn Your Recyclables Into Revenue</span>
                </>
              )}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/85 max-w-3xl mx-auto leading-relaxed">
              {isArabic
                ? 'منصة متكاملة تربط بين جامعي المواد، المصانع، والمندوبين بنظام مكافآت فوري وتتبع شفاف من الباب إلى المصنع.'
                : 'A complete platform connecting collectors, factories, and couriers with instant rewards and transparent door-to-factory tracking.'}
            </p>
            
            <div className="flex flex-wrap gap-5 justify-center items-center pt-4">
              <Button
                onClick={() => navigate('/marketplace')}
                size="lg"
                className="bg-[#F0A84D] hover:bg-[#e09a3d] text-white px-10 py-6 rounded-full text-lg font-bold shadow-2xl hover:shadow-[0_0_30px_rgba(240,168,77,0.4)] transition-all hover:scale-105"
              >
                {isArabic ? 'ابدأ الربح الآن' : 'Start Earning Now'}
                <ArrowRight className={`w-6 h-6 ml-2 ${isArabic ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                onClick={() => navigate('/services')}
                size="lg"
                className="bg-[#708A58] hover:bg-[#5f7349] text-white px-10 py-6 rounded-full text-lg font-bold shadow-2xl hover:shadow-[0_0_30px_rgba(112,138,88,0.4)] transition-all hover:scale-105"
              >
                {isArabic ? 'شاهد الخدمات' : 'View Services'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className={`text-4xl font-bold text-[#2D4F2B] mb-3 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'لماذا يختارنا الشركاء؟' : 'Why partners choose us'}
            </h2>
            <p className="text-lg text-gray-600">
              {isArabic
                ? 'سلسلة موثوقة، تجربة سلسة، ومكافآت حقيقية مدعومة بالبيانات.'
                : 'A trusted chain, smooth experience, and meaningful rewards backed by data.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuePillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="border-2 border-[rgba(112,138,88,0.15)] hover:border-[rgba(240,168,77,0.6)] hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur">
                  <CardHeader className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[rgba(112,138,88,0.15)] flex items-center justify-center text-[#2D4F2B]">
                      <Icon className="w-7 h-7" />
                    </div>
                    <CardTitle className={`text-xl text-[#2D4F2B] ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? item.titleAr : item.titleEn}
                    </CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isArabic ? item.descAr : item.descEn}
                    </p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-[#E8F3E8]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-[#2D4F2B] mb-3 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'كيف يعمل جدد' : 'How Jaddid works'}
            </h2>
            <p className="text-lg text-gray-700">
              {isArabic ? 'رحلة موحدة من الطلب إلى الإثبات' : 'A single journey from request to verified proof'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card key={idx} className="relative border-2 border-[rgba(112,138,88,0.25)] bg-white/85 backdrop-blur hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#F0A84D] text-white font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </div>
                  <CardHeader className="pt-10 space-y-3 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(112,138,88,0.12)] flex items-center justify-center text-[#2D4F2B]">
                      <Icon className="w-9 h-9" />
                    </div>
                    <CardTitle className={`text-xl text-[#2D4F2B] ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? step.titleAr : step.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-gray-700 leading-relaxed">
                      {isArabic ? step.descAr : step.descEn}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services we provide */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className={`text-4xl font-bold text-[#2D4F2B] mb-3 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'ماذا نقدم؟' : 'What we deliver'}
            </h2>
            <p className="text-lg text-gray-600">
              {isArabic ? 'خدمات متكاملة تغطي الحركة والتتبع والمكافآت.' : 'End-to-end services across movement, tracking, and rewards.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <Card key={idx} className="border-2 border-[rgba(112,138,88,0.2)] hover:border-[rgba(240,168,77,0.6)] hover:shadow-lg transition-all duration-300 bg-white/85">
                  <CardHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(240,168,77,0.18)] text-[#2D4F2B] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className={`text-lg text-[#2D4F2B] ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? svc.titleAr : svc.titleEn}
                    </CardTitle>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {isArabic ? svc.descAr : svc.descEn}
                    </p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="py-16 px-4 bg-[#FFF8F0]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-[#2D4F2B] mb-3 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'المواد التي نقبلها' : 'Materials we accept'}
            </h2>
            <p className="text-lg text-gray-700">
              {isArabic ? 'من البلاستيك حتى الإلكترونيات، كل مادة لها مسار معتمد.' : 'From plastics to electronics, every material has a verified path.'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {materials.map((m, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl bg-card shadow-lg hover:shadow-2xl transition-all duration-500 aspect-square cursor-pointer"
              >
                <img 
                  src={m.image} 
                  alt={isArabic ? m.nameAr : m.nameEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D4F2B]/90 via-[#2D4F2B]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className={`font-bold text-white text-lg ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? m.nameAr : m.nameEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics & Tracking */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <div className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
            <Badge className="bg-[rgba(112,138,88,0.15)] text-[#2D4F2B] px-4 py-2 rounded-full border border-[rgba(112,138,88,0.25)]">
              {isArabic ? 'التشغيل واللوجستيات' : 'Operations & logistics'}
            </Badge>
            <h3 className={`text-3xl md:text-4xl font-bold text-[#2D4F2B] ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'تتبع لحظي وسلسلة موثقة' : 'Live tracking with verified chain-of-custody'}
            </h3>
            <p className="text-lg text-gray-700">
              {isArabic
                ? 'نرسل مندوباً معتمداً، نربطك بالخريطة، ونقدم إثبات التسليم والتدوير.'
                : 'We dispatch certified couriers, keep you on the map, and provide delivery and recycling proof.'}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• {isArabic ? 'إشعارات وصول فورية وأوقات تقديرية دقيقة' : 'Instant arrival alerts and precise ETAs'}</li>
              <li>• {isArabic ? 'تغليف آمن وحفظ وزن/صور الشحنة' : 'Secure sealing plus weight and photo logs'}</li>
              <li>• {isArabic ? 'شهادات تدوير قابلة للتحميل وإثبات بيئي' : 'Downloadable recycling certificates and impact proofs'}</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/orders')} className="bg-[#2D4F2B] hover:bg-[#708A58] text-white px-6 py-3 rounded-full text-sm">
                {isArabic ? 'تابع طلباتك' : 'Track your orders'}
              </Button>
              <Button onClick={() => navigate('/order-tracking/1')} variant="outline" className="border-2 border-[#2D4F2B] text-[#2D4F2B] hover:bg-[#E8F3E8] px-6 py-3 rounded-full text-sm">
                {isArabic ? 'شاهد تجربة التتبع' : 'Preview tracking'}
              </Button>
            </div>
          </div>

          <Card className="border-2 border-[rgba(112,138,88,0.2)] bg-[#E8F3E8]/60 backdrop-blur shadow-xl">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F0A84D] text-white flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <CardTitle className={`text-2xl text-[#2D4F2B] ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic ? 'خط سير المندوب' : 'Courier live route'}
              </CardTitle>
              <p className="text-sm text-gray-700">
                {isArabic ? 'الموقع الحالي، زمن الوصول، ونقاط التسليم.' : 'Current position, ETA, and drop-off checkpoints.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-white border border-[rgba(112,138,88,0.15)] p-4">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>{isArabic ? 'المندوب: كريم' : 'Courier: Kareem'}</span>
                  <span className="font-semibold text-[#2D4F2B]">4.8 ⭐</span>
                </div>
                <div className="mt-3 h-2 bg-[rgba(112,138,88,0.15)] rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-[#F0A84D]" />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{isArabic ? 'تم الاستلام' : 'Picked up'}</span>
                  <span>{isArabic ? 'قيد الشحن' : 'In transit'}</span>
                  <span>{isArabic ? 'التسليم' : 'Delivery'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white/80 border border-[rgba(112,138,88,0.15)]">
                  <p className="font-semibold text-[#2D4F2B]">14 min</p>
                  <p className="text-gray-600">{isArabic ? 'زمن الوصول' : 'ETA to you'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-[rgba(112,138,88,0.15)]">
                  <p className="font-semibold text-[#2D4F2B]">Cairo → Helwan</p>
                  <p className="text-gray-600">{isArabic ? 'المسار المُعتمد' : 'Approved route'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits & Rewards */}
      <section className="py-16 px-4 bg-[#E8F3E8]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-[#2D4F2B] mb-3 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
              {isArabic ? 'المكافآت والأثر' : 'Rewards and impact'}
            </h2>
            <p className="text-lg text-gray-700">
              {isArabic ? 'اكسب، احتسب الأثر، وشارك النتائج مع فريقك.' : 'Earn, measure impact, and share results with your team.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <Card key={idx} className="border-2 border-[rgba(112,138,88,0.2)] bg-white/85 backdrop-blur hover:shadow-xl transition-all duration-300">
                  <CardHeader className="space-y-3 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(240,168,77,0.2)] text-[#2D4F2B] flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className={`text-xl text-[#2D4F2B] ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? b.titleAr : b.titleEn}
                    </CardTitle>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {isArabic ? b.descAr : b.descEn}
                    </p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="bg-[rgba(112,138,88,0.08)] rounded-xl p-4">
                      <div className="text-2xl font-bold text-[#2D4F2B]">{b.stat}</div>
                      <div className="text-xs text-gray-700">
                        {isArabic ? b.statLabelAr : b.statLabelEn}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {impactStats.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl border-2 border-[rgba(112,138,88,0.18)] bg-[rgba(112,138,88,0.05)]">
                <div className="text-3xl font-bold text-[#2D4F2B]">{s.value}</div>
                <div className="text-sm text-gray-700 mt-2">{isArabic ? s.ar : s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#FFF8F0] via-white to-[#E8F3E8]">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Award className="w-14 h-14 mx-auto text-[#F0A84D]" />
          <h2 className={`text-4xl md:text-5xl font-bold text-[#2D4F2B] ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'جاهز للبدء؟' : 'Ready to get started?'}
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            {isArabic
              ? 'انضم إلى آلاف المستخدمين والشركاء الذين يحولون التدوير إلى قيمة ملموسة.'
              : 'Join thousands turning recycling into measurable value.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => navigate('/register')}
              className="bg-[#2D4F2B] hover:bg-[#708A58] text-white px-10 py-4 rounded-full text-lg shadow-lg"
            >
              {isArabic ? 'إنشاء حساب' : 'Create account'}
              <ArrowRight className={`w-5 h-5 ml-2 ${isArabic ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-[#F0A84D] hover:bg-[#F0A84D]/90 text-white px-10 py-4 rounded-full text-lg shadow-lg"
            >
              {isArabic ? 'تصفح السوق' : 'Browse marketplace'}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
