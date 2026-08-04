import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Recycle, Leaf, Coins, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '@/assets/illustration-1.svg';
import leavesDecoration from '@/assets/leaves-decoration.svg';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Floating leaves decorations - using icons */}
      <div className="absolute top-20 left-10 text-sage/60 rotate-45">
        <Leaf className="w-6 h-6" />
      </div>
      <div className="absolute top-32 right-20 text-sage/50 -rotate-12">
        <Leaf className="w-4 h-4" />
      </div>
      <div className="absolute top-48 left-1/4 text-sage/40 rotate-90">
        <Leaf className="w-5 h-5" />
      </div>
      <div className="absolute top-24 right-1/3 text-sage/60 rotate-180">
        <Leaf className="w-4 h-4" />
      </div>
      <div className="absolute top-60 right-1/4 text-sage/50 rotate-45">
        <Leaf className="w-3 h-3" />
      </div>
      
      {/* Bottom leaves decoration - moved lower with lower z-index */}
      <div className="absolute -bottom-20 left-0 right-0 z-0 pointer-events-none">
        <img 
          src={leavesDecoration} 
          alt="" 
          className="w-full h-auto opacity-70"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Content */}
          <div className={`text-center lg:text-start ${isRTL ? 'lg:col-start-2 lg:text-end' : ''}`}>
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 text-forest rounded-full text-sm font-semibold mb-6">
                <Recycle className="w-4 h-4" />
                {t('hero.tagline')}
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up delay-100 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
              <span className="text-gradient">{t('hero.title')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl animate-fade-in-up delay-200 mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300 ${isRTL ? 'lg:justify-end sm:flex-row-reverse' : ''}`}>
              <Button onClick={() => navigate('/marketplace')} className="btn-primary group">
                {t('hero.cta')}
                <Arrow className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'group-hover:-translate-x-1' : ''}`} />
              </Button>
              <Button onClick={() => navigate('/services')} variant="outline" className="px-8 py-4 rounded-full font-semibold text-lg border-2 border-sage text-forest hover:bg-sage hover:text-white transition-all">
                {t('hero.secondaryCta')}
              </Button>
            </div>
          </div>

          {/* Illustration - Made much bigger */}
          <div className={`relative flex justify-center ${isRTL ? 'lg:col-start-1' : ''}`}>
            <div className="relative animate-scale-in">
              {/* Main illustration - significantly increased size */}
              <img 
                src={heroIllustration} 
                alt="Recycling illustration" 
                className="w-full h-auto max-w-[320px] sm:max-w-[520px] md:max-w-[800px] lg:max-w-[1200px] xl:max-w-[1400px] drop-shadow-2xl scale-100 sm:scale-105 md:scale-125 lg:scale-150 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
