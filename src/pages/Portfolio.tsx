import { useState, useEffect } from 'react';
import { useCMS, PortfolioItem } from '../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';

// Helper function to get embed URL from YouTube or Vimeo link
const getEmbedUrl = (url: string) => {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'vimeo', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  
  // Direct video file
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: 'direct', url: url };
  }
  
  return null;
};

export default function Portfolio({ type }: { type?: 'photography' | 'video' }) {
  const { portfolio, settings, getGalleryImages } = useCMS();
  const [filter, setFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const handleItemClick = async (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsLoadingGallery(true);
    try {
      const images = await getGalleryImages(item.id);
      setGalleryImages(images.length > 0 ? images : [item.imageUrl]);
    } catch (error) {
      console.error("Error loading gallery:", error);
      setGalleryImages([item.imageUrl]);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // Filter portfolio based on type (photography or video)
  const basePortfolio = portfolio.filter(item => {
    if (type === 'video') return !!item.videoUrl;
    if (type === 'photography') return !item.videoUrl || item.category !== 'Video';
    return true;
  });

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItem]);

  // For photography, we want specific categories: PRODUCT, FOOD&BEVERAGE, MODEL, AI
  const categories = type === 'photography' 
    ? ['All', 'PRODUCT', 'FOOD&BEVERAGE', 'MODEL', 'AI']
    : ['All', ...Array.from(new Set(basePortfolio.map(item => item.category)))];

  const filteredPortfolio = filter === 'All' 
    ? basePortfolio 
    : basePortfolio.filter(item => item.category === filter);

  return (
    <div className="bg-ivory-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-4xl md:text-5xl text-burgundy-900 mb-6 tracking-[0.2em] uppercase font-bold"
          >
            {type === 'video' ? 'VIDEO' : (type === 'photography' ? 'PHOTOGRAPHY' : settings.portfolioTitle)}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-stone-500 tracking-[0.3em] uppercase text-xs font-light"
          >
            {type === 'video' ? 'Motion Works' : (type === 'photography' ? 'PRODUCT, FOOD&BEVERAGE, MODEL' : settings.portfolioSubText)}
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-6 mb-20 border-b border-ivory-300 pb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`text-[11px] tracking-[0.2em] uppercase transition-all duration-300 relative pb-1 ${
                filter === category
                  ? 'text-burgundy-800 font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {category}
              {filter === category && (
                <motion.div 
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy-800"
                />
              )}
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
              onClick={() => handleItemClick(item)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-4 bg-stone-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {item.videoUrl && (
                  <div className="absolute top-4 right-4 bg-stone-900/60 backdrop-blur-sm text-white p-2 rounded-full z-10">
                    <Play size={16} fill="currentColor" />
                  </div>
                )}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/95 backdrop-blur-sm p-0 md:p-8 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-ivory-100 w-full max-w-5xl md:rounded-2xl overflow-hidden shadow-2xl my-auto relative min-h-screen md:min-h-0"
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

              <div className="p-4 md:p-12 bg-white">
                <div className="flex flex-col gap-4 md:gap-8">
                  {selectedItem.videoUrl && getEmbedUrl(selectedItem.videoUrl) && (
                    <div className="relative w-full aspect-video bg-stone-900 md:rounded-lg overflow-hidden shadow-lg">
                      {getEmbedUrl(selectedItem.videoUrl)?.type === 'direct' ? (
                        <video 
                          src={getEmbedUrl(selectedItem.videoUrl)!.url} 
                          controls 
                          className="absolute top-0 left-0 w-full h-full"
                          autoPlay
                          muted
                        />
                      ) : (
                        <iframe
                          src={getEmbedUrl(selectedItem.videoUrl)!.url}
                          title="Video player"
                          className="absolute top-0 left-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  )}
                  
                  {isLoadingGallery ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-700"></div>
                    </div>
                  ) : (
                    galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-full flex justify-center bg-stone-50 md:rounded-lg overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`${selectedItem.title} - ${idx + 1}`}
                          className="w-full h-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
