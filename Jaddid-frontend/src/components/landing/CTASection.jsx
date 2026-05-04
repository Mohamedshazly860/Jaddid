import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Handshake, Recycle, Lock, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ctaIllustration from '@/assets/cta-illustration.svg';

export default function CTASection() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cream/50 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-5xl mx-auto bg-card rounded-[3rem] p-8 md:p-12 shadow-2xl border border-sage/20 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
          <div className={`grid md:grid-cols-2 gap-8 items-center ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
            {/* Illustration - Using Asset_12 */}
            <div className={`flex justify-center ${isRTL ? 'md:col-start-2' : ''}`}>
              <img 
                src={ctaIllustration} 
                alt="" 
                className="w-full max-w-sm floating drop-shadow-lg"
              />
            </div>
            
            {/* Content */}
            <div className={`text-center md:text-start ${isRTL ? 'md:col-start-1 md:text-end' : ''}`}>
              {/* Recycling decoration */}
              <div className={`flex gap-4 mb-6 justify-center md:justify-start ${isRTL ? 'md:justify-end' : ''}`}>
                <div className="w-14 h-14 bg-sage/20 rounded-full flex items-center justify-center">
                  <Recycle className="w-7 h-7 text-forest" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('cta.subtitle')}
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 justify-center md:justify-start ${isRTL ? 'md:justify-end sm:flex-row-reverse' : ''}`}>
                <Button onClick={() => navigate('/register')} className="btn-primary group">
                  {t('cta.button')}
                  <Arrow className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'group-hover:-translate-x-1' : ''}`} />
                </Button>
                <Button onClick={() => navigate('/services')} variant="outline" className="px-6 py-3 rounded-full font-semibold border-2 border-sage text-forest hover:bg-sage hover:text-white transition-all group">
                  <Handshake className="w-5 h-5" />
                  {t('cta.secondary')}
                </Button>
              </div>
              
              {/* Trust badges */}
              <div className={`flex flex-wrap gap-4 mt-8 pt-6 border-t border-border justify-center md:justify-start ${isRTL ? 'md:justify-end' : ''}`}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-5 h-5 text-forest" />
                  <span className="text-sm font-medium">{isRTL ? 'آمن' : 'Secure'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-5 h-5 text-forest" />
                  <span className="text-sm font-medium">{isRTL ? 'مجاني' : 'Free'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-forest" />
                  <span className="text-sm font-medium">{isRTL ? 'موثوق' : 'Verified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
