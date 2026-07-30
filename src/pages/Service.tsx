import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Service() {
  const { settings } = useCMS();

  return (
    <div className="bg-white min-h-screen py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Content Section (Vertical Stack: Image followed by Process details) */}
        <div className="flex flex-col items-center space-y-16">
          {/* Top Title & Sub Text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1
              className="mb-2 font-bold"
              style={{
                fontSize: settings.serviceTextFontSize ? `${settings.serviceTextFontSize}px` : undefined,
                letterSpacing: settings.serviceTextLetterSpacing !== undefined ? `${settings.serviceTextLetterSpacing}px` : undefined,
                fontFamily: settings.serviceTextFontFamily || 'Pretendard',
                textAlign: (settings.serviceTextAlign || 'center') as any,
                color: settings.serviceTextColor || '#1C1917',
              }}
            >
              {settings.serviceTitle}
            </h1>
            <p className="text-stone-500 text-sm tracking-widest uppercase text-center">{settings.serviceSubText}</p>
          </motion.div>

          {/* Top: Wide Service Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-stone-100 border border-stone-100/50"
          >
            <img
              src={settings.serviceImage || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop'}
              alt="Service Information"
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Bottom: Process details (Render only if serviceText2 exists) */}
          {settings.serviceText2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-4xl space-y-6 pt-4"
            >
              <h2 className="text-xl font-bold text-stone-900 tracking-widest uppercase border-b border-stone-100 pb-4 text-center">
                Service Process
              </h2>
              <div className="bg-stone-50/50 p-8 md:p-12 rounded-2xl border border-stone-100 leading-relaxed text-stone-700 whitespace-pre-line text-sm md:text-base font-light shadow-sm">
                {settings.serviceText2}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-6"
          >
            <Link
              to="/contact"
              className="inline-flex items-center space-x-3 bg-[#5C4033] hover:bg-[#4A3227] text-white px-10 py-4.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-[#6E4E3D]/50"
            >
              <Calendar size={18} />
              <span>견적 문의하기</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
