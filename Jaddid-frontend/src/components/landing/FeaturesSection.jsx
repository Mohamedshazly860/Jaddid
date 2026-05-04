import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Coins, Leaf, ShieldCheck, Recycle } from 'lucide-react';
import basketImg from '@/assets/basket.svg';

const features = [
  {
    icon: MapPin,
    titleKey: 'features.track.title',
    descKey: 'features.track.desc',
    color: 'bg-forest/10 text-forest',
  },
  {
    icon: Coins,
    titleKey: 'features.earn.title',
    descKey: 'features.earn.desc',
    color: 'bg-orange/20 text-forest',
  },
  {
    icon: Leaf,
    titleKey: 'features.eco.title',
    descKey: 'features.eco.desc',
    color: 'bg-sage/20 text-forest',
  },
  {
    icon: ShieldCheck,
    titleKey: 'features.verified.title',
    descKey: 'features.verified.desc',
    color: 'bg-cream text-forest',
  },
];

export default function FeaturesSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative illustration */}
      <img 
        src={basketImg} 
        alt="" 
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 opacity-10 pointer-events-none"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 text-forest rounded-full text-sm font-semibold mb-4">
            <Leaf className="w-4 h-4" />
            {t('features.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="group bg-card p-8 rounded-3xl border border-sage/20 card-hover shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-10 h-10" strokeWidth={2} />
              </div>
              <h3 className={`text-xl font-bold text-foreground mb-3 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
