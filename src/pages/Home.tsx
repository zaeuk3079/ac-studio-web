import { useState, useEffect } from 'react';
import { useCMS, PortfolioItem } from '../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function Home() {
  const { settings, portfolio, getGalleryImages } = useCMS();
  const featuredPortfolio = portfolio.slice(0, 3);
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

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItem]);

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
                onClick={() => handleItemClick(item)}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-6 rounded-sm">
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
                  {selectedItem.videoUrl && getEmbedUrl(selectedItem.videoUrl) && (
                    <div className="relative w-full aspect-video bg-stone-900 rounded-lg overflow-hidden shadow-lg">
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
                      <div key={idx} className="relative w-full flex justify-center bg-stone-50 rounded-lg overflow-hidden p-4 md:p-8">
                        <img
                          src={imgUrl}
                          alt={`${selectedItem.title} - ${idx + 1}`}
                          className="max-w-full max-h-[85vh] object-contain"
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
