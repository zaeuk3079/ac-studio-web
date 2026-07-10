import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Service() {
  const { settings } = useCMS();

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-sans text-3xl md:text-5xl text-stone-900 tracking-[0.2em] uppercase font-bold mb-6"
          >
            {settings.serviceTitle || 'Our Services'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-stone-400 text-sm tracking-[0.15em] uppercase font-semibold"
          >
            {settings.serviceSubText || '서비스 및 촬영 과정 안내'}
          </motion.p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-2xl overflow-hidden shadow-xl shadow-stone-100 border border-stone-100"
          >
            <img
              src={settings.serviceImage || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop'}
              alt="Service Process"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Right Column: Descriptions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-10"
          >
            {/* Description 1 */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-stone-900 tracking-wide uppercase">
                Service Philosophy
              </h2>
              <p className="text-stone-600 font-light leading-relaxed text-base md:text-lg">
                {settings.serviceText}
              </p>
            </div>

            {/* Description 2 (Process) */}
            <div className="space-y-6 pt-8 border-t border-stone-100">
              <h2 className="text-xl font-bold text-stone-900 tracking-wide uppercase">
                How We Work
              </h2>
              <p className="text-stone-600 font-light leading-relaxed text-base whitespace-pre-line bg-stone-50 p-8 rounded-2xl border border-stone-100/50">
                {settings.serviceText2}
              </p>
            </div>

            {/* Call to Action */}
            <div className="pt-6">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-3 bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Calendar size={18} />
                <span>Book a Session</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
