import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { settings, portfolio } = useCMS();
  const featuredPortfolio = portfolio.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={settings.heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/50 z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-ivory-100 font-light tracking-tight mb-6 leading-tight"
          >
            {settings.heroText}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-ivory-300 font-light tracking-wide mb-12 max-w-2xl mx-auto"
          >
            {settings.heroSubText}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link
              to="/photography"
              className="inline-flex items-center space-x-2 bg-burgundy-700 hover:bg-burgundy-600 text-ivory-100 px-8 py-4 rounded-full transition-all duration-300 uppercase tracking-widest text-sm font-medium shadow-lg shadow-burgundy-900/20"
            >
              <span>View Portfolio</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Snippet */}
      {settings.showHomeAbout !== false && (
        <section className="py-32 bg-ivory-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-burgundy-900 mb-8 italic">The Studio</h2>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed font-light">
              {settings.aboutText}
            </p>
            <div className="mt-12">
              <Link to="/about" className="text-burgundy-700 hover:text-burgundy-500 uppercase tracking-widest text-sm font-medium border-b border-burgundy-300 pb-1 transition-colors">
                Read Our Story
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Portfolio */}
      <section className="py-24 bg-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-serif text-4xl text-stone-900 tracking-tight">{settings.homePortfolioTitle || 'Selected Works'}</h2>
            <Link to="/photography" className="hidden md:flex items-center space-x-2 text-stone-500 hover:text-burgundy-700 transition-colors uppercase tracking-widest text-xs font-medium">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPortfolio.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-6 rounded-sm">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-xl text-stone-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-stone-500 tracking-widest uppercase">{item.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/photography" className="inline-flex items-center space-x-2 text-stone-600 hover:text-burgundy-700 transition-colors uppercase tracking-widest text-sm font-medium border-b border-stone-300 pb-1">
              <span>View All Works</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
