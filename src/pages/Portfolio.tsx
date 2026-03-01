import { useState, useEffect } from 'react';
import { useCMS, PortfolioItem } from '../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function Portfolio() {
  const { portfolio, settings } = useCMS();
  const [filter, setFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItem]);

  const categories = ['All', ...Array.from(new Set(portfolio.map(item => item.category)))];

  const filteredPortfolio = filter === 'All' 
    ? portfolio 
    : portfolio.filter(item => item.category === filter);

  return (
    <div className="bg-ivory-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl text-burgundy-900 mb-6 tracking-tight"
          >
            {settings.portfolioTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-stone-500 tracking-widest uppercase text-sm"
          >
            {settings.portfolioSubText}
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                filter === category
                  ? 'bg-burgundy-800 text-ivory-100 shadow-md'
                  : 'bg-ivory-200 text-stone-600 hover:bg-burgundy-100 hover:text-burgundy-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filteredPortfolio.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-4 bg-stone-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-ivory-100 text-sm font-light leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-sans text-lg font-light text-stone-800 mb-1 tracking-wide">{item.title}</h3>
                <p className="text-xs text-stone-500 tracking-widest uppercase">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/95 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-ivory-100 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-stone-900/10 hover:bg-stone-900/20 text-stone-900 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 md:p-12 border-b border-ivory-300">
                <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2">{selectedItem.title}</h2>
                <p className="text-sm text-stone-500 tracking-widest uppercase mb-6">{selectedItem.category}</p>
                <p className="text-stone-600 font-light leading-relaxed max-w-2xl">{selectedItem.description}</p>
              </div>

              <div className="p-8 md:p-12 bg-white">
                <div className="flex flex-col gap-8">
                  {(selectedItem.gallery && selectedItem.gallery.length > 0 
                    ? selectedItem.gallery 
                    : [selectedItem.imageUrl]
                  ).map((imgUrl, idx) => (
                    <div key={idx} className="relative w-full flex justify-center bg-stone-50 rounded-lg overflow-hidden p-4 md:p-8">
                      <img
                        src={imgUrl}
                        alt={`${selectedItem.title} - ${idx + 1}`}
                        className="max-w-full max-h-[85vh] object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
