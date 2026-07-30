import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';

export default function About() {
  const { settings } = useCMS();

  return (
    <div className="bg-ivory-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[3/4] overflow-hidden rounded-sm bg-stone-200"
          >
            <img
              src={settings.aboutImage}
              alt="Studio Interior"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-stone-900/10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h1
              className="mb-8 font-bold"
              style={{
                fontSize: settings.aboutTextFontSize ? `${settings.aboutTextFontSize}px` : undefined,
                letterSpacing: settings.aboutTextLetterSpacing !== undefined ? `${settings.aboutTextLetterSpacing}px` : undefined,
                fontFamily: settings.aboutTextFontFamily || 'Pretendard',
                textAlign: (settings.aboutTextAlign || 'left') as any,
                color: settings.aboutTextColor || '#1C1917',
              }}
            >
              {settings.aboutTitle}
            </h1>
            {settings.aboutSubText && (
              <h2 className="text-xl md:text-2xl text-stone-800 font-light mb-6 leading-relaxed whitespace-pre-line">
                {settings.aboutSubText}
              </h2>
            )}
            <div className="space-y-6 text-stone-600 font-light leading-loose">
              {settings.aboutText && <p className="whitespace-pre-line">{settings.aboutText}</p>}
              {settings.aboutText2 && <p className="whitespace-pre-line">{settings.aboutText2}</p>}
              {settings.aboutText3 && <p className="whitespace-pre-line">{settings.aboutText3}</p>}
            </div>
            
            {settings.showPhilosophy !== false && (
              <div className="mt-12 pt-12 border-t border-ivory-300">
                <h3 className="font-serif text-2xl text-burgundy-800 mb-6">{settings.philosophyTitle || 'Our Philosophy'}</h3>
                <ul className="space-y-4 text-stone-600 font-light">
                  {settings.philosophyItem1 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-burgundy-500 mt-1">✦</span>
                      <span>{settings.philosophyItem1}</span>
                    </li>
                  )}
                  {settings.philosophyItem2 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-burgundy-500 mt-1">✦</span>
                      <span>{settings.philosophyItem2}</span>
                    </li>
                  )}
                  {settings.philosophyItem3 && (
                    <li className="flex items-start space-x-3">
                      <span className="text-burgundy-500 mt-1">✦</span>
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
