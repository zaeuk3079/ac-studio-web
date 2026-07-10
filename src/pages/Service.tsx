import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Service() {
  const { settings } = useCMS();

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        {/* Content Section (Wide Image Layout) */}
        <div className="flex flex-col items-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-stone-100 border border-stone-100/50"
          >
            <img
              src={settings.serviceImage || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop'}
              alt="Service Information"
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6"
          >
            <Link
              to="/contact"
              className="inline-flex items-center space-x-3 bg-stone-900 hover:bg-stone-800 text-white px-10 py-4.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Calendar size={18} />
              <span>Book a Session</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
