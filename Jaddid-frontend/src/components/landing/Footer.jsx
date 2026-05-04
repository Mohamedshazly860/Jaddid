import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-forest text-white">
      <div className="container mx-auto px-4 py-16">
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-12 ${isRTL ? 'text-end' : ''}`}>
          {/* Brand */}
          <div>
            <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <div className="w-12 h-12 bg-orange rounded-xl flex items-center justify-center">
                <Recycle className="w-7 h-7 text-forest" />
              </div>
              <span className={`text-2xl font-bold ${isRTL ? 'font-arabic' : 'font-primary'}`}>
                {isRTL ? 'جديد' : 'Jaddid'}
              </span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className={`flex gap-4 ${isRTL ? 'justify-end' : ''}`}>
              <a href="#" className="w-11 h-11 bg-sage/30 rounded-full flex items-center justify-center hover:bg-orange hover:text-forest transition-all hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-11 h-11 bg-sage/30 rounded-full flex items-center justify-center hover:bg-orange hover:text-forest transition-all hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-11 h-11 bg-sage/30 rounded-full flex items-center justify-center hover:bg-orange hover:text-forest transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-11 h-11 bg-sage/30 rounded-full flex items-center justify-center hover:bg-orange hover:text-forest transition-all hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-bold mb-6 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/80 hover:text-orange transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/marketplace" className="text-white/80 hover:text-orange transition-colors">{t('nav.marketplace')}</Link></li>
              <li><Link to="/marketplace/orders" className="text-white/80 hover:text-orange transition-colors">{t('nav.orders')}</Link></li>
              <li><Link to="/marketplace/favorites" className="text-white/80 hover:text-orange transition-colors">{t('nav.favourites')}</Link></li>
              <li><Link to="/services" className="text-white/80 hover:text-orange transition-colors">{t('nav.services')}</Link></li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className={`text-lg font-bold mb-6 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
              {t('footer.forPartners')}
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-orange transition-colors">{isRTL ? 'انضم كمصنع' : 'Join as Factory'}</a></li>
              <li><a href="#" className="text-white/80 hover:text-orange transition-colors">{isRTL ? 'كن مندوباً' : 'Become a Courier'}</a></li>
              <li><a href="#" className="text-white/80 hover:text-orange transition-colors">{isRTL ? 'الأسعار' : 'Pricing'}</a></li>
              <li><a href="#" className="text-white/80 hover:text-orange transition-colors">{isRTL ? 'الدعم' : 'Support'}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`text-lg font-bold mb-6 ${isRTL ? 'font-arabic' : 'font-primary'}`}>
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-5 h-5 text-orange" />
                <span className="text-white/80">hello@jaddid.com</span>
              </li>
              <li className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-5 h-5 text-orange" />
                <span className="text-white/80">+20 100 123 4567</span>
              </li>
              <li className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-5 h-5 text-orange" />
                <span className="text-white/80">{isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sage/30 mt-12 pt-8 text-center text-white/60">
          <p>© 2024 Jaddid. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
