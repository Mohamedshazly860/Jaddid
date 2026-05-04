import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, ArrowLeft, PackagePlus, Truck, Gift, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    titleKey: 'how.step1.title',
    descKey: 'how.step1.desc',
    Icon: PackagePlus,
    iconBg: 'bg-orange/20',
  },
  {
    number: '02',
    titleKey: 'how.step2.title',
    descKey: 'how.step2.desc',
    Icon: Truck,
    iconBg: 'bg-sage/30',
  },
  {
    number: '03',
    titleKey: 'how.step3.title',
    descKey: 'how.step3.desc',
    Icon: Gift,
    iconBg: 'bg-orange/20',
  },
];

export default function HowItWorksSection() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24 bg-forest text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-sage/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-orange/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 text-orange rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {t('how.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {t('how.title')}
          </h2>
          <p className="text-lg text-white/80">
            {t('how.subtitle')}
          </p>
        </div>

        {/* Steps - SVGs aligned with content */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative group"
            >
              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0 -translate-x-full rotate-180' : 'right-0 translate-x-full'} items-center justify-center w-12`}>
                  <Arrow className="w-6 h-6 text-orange/50" />
                </div>
              )}
              
              {/* Card */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 card-hover relative h-full flex flex-col shadow-xl">
                {/* Step number */}
                <div className={`absolute -top-5 ${isRTL ? 'right-8' : 'left-8'} w-12 h-12 bg-orange rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {step.number}
                </div>
                
                {/* Icon - Centered and professional */}
                <div className={`w-full h-32 flex items-center justify-center mt-4 mb-6`}>
                  <step.Icon 
                    className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform duration-500"
                    strokeWidth={1.8}
                  />
                </div>
                
                {/* Text content - aligned below illustration */}
                <div className={`text-center ${isRTL ? 'font-arabic' : 'font-primary'}`}>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
