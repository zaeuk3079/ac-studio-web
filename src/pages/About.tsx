import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';

export default function About() {
  const { settings } = useCMS();

  return (
    <div className="bg-ink-950 text-white min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 border border-white/5"
          >
            <img
              src={settings.aboutImage || 'https://images.unsplash.com/photo-1554046920-90dcac0536d1?q=80&w=2069&auto=format&fit=crop'}
              alt="About Studio"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-ink-950/10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h1
              className="mb-8 font-black"
              style={{
                fontSize: settings.aboutTextFontSize ? `${settings.aboutTextFontSize}px` : undefined,
                letterSpacing: settings.aboutTextLetterSpacing !== undefined ? `${settings.aboutTextLetterSpacing}px` : undefined,
                fontFamily: settings.aboutTextFontFamily || 'Pretendard',
                textAlign: (settings.aboutTextAlign || 'left') as any,
                color: settings.aboutTextColor || '#FFFFFF',
              }}
            >
              {settings.aboutTitle}
            </h1>
            {settings.aboutSubText && (
              <h2 className="text-xl md:text-2xl text-stone-300 font-light mb-6 leading-relaxed whitespace-pre-line">
                {settings.aboutSubText}
              </h2>
            )}
            <div
              className="space-y-6 text-stone-400 font-light leading-loose"
              style={{
                fontSize: settings.aboutBodyFontSize ? `${settings.aboutBodyFontSize}px` : '16px',
                letterSpacing: settings.aboutBodyLetterSpacing !== undefined ? `${settings.aboutBodyLetterSpacing}px` : undefined,
                color: settings.aboutBodyTextColor || undefined,
              }}
            >
              {settings.aboutText && <p className="whitespace-pre-line">{settings.aboutText}</p>}
              {settings.aboutText2 && <p className="whitespace-pre-line">{settings.aboutText2}</p>}
              {settings.aboutText3 && <p className="whitespace-pre-line">{settings.aboutText3}</p>}
            </div>

            {settings.showPhilosophy !== false && (
              <div className="mt-12 pt-12 border-t border-white/10">
                <h3 className="font-serif text-2xl gradient-accent-text mb-6">{settings.philosophyTitle || 'Our Philosophy'}</h3>
                <ul className="space-y-4 text-stone-400 font-light">
                  {settings.philosophyItem1 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-lime-300 mt-1">✦</span>
                      <span>{settings.philosophyItem1}</span>
                    </li>
                  )}
                  {settings.philosophyItem2 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-lime-300 mt-1">✦</span>
                      <span>{settings.philosophyItem2}</span>
                    </li>
                  )}
                  {settings.philosophyItem3 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-lime-300 mt-1">✦</span>
                      <span>{settings.philosophyItem3}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
