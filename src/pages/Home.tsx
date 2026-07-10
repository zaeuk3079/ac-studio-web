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
  
  // Photography items only, already sorted by isPinned in CMSContext
  const displayPortfolio = portfolio
    .filter(item => item.category !== 'Video')
    .slice(0, 6);

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
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-tr from-ivory-300 via-white to-ivory-100">
        {/* Apple-style floating blurred backdrop elements */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-burgundy-100/40 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ivory-400/50 rounded-full filter blur-3xl" style={{ animationDelay: '2s' }} />

        {/* Floating Nuki Images */}
        {settings.heroNukiConfigs && settings.heroNukiConfigs.length > 0 ? (
          settings.heroNukiConfigs.map((config, index) => {
            const isLeft = config.left < 50;
            
            const style = {
              left: `${config.left}%`,
              top: `${config.top}%`,
              transform: 'translate(-50%, -50%)',
              width: `${config.size || 120}px`
            };
              
            const duration = 5 + (index * 1.2);
            const rotateDir = isLeft ? 1 : -1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, isLeft ? -15 : 15, 0],
                  rotate: [0, rotateDir * 2, rotateDir * -1, 0]
                }}
                transition={{
                  scale: { duration: 0.8, ease: "easeOut" },
                  opacity: { duration: 0.8 },
                  y: { duration: duration, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: duration + 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute pointer-events-none select-none z-10 hidden sm:block"
                style={style}
              >
                <img
                  src={config.url}
                  alt={`Nuki Object ${index + 1}`}
                  className="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            );
          })
        ) : settings.heroNukiImages && settings.heroNukiImages.length > 0 ? (
          settings.heroNukiImages.map((imgUrl, index) => {
            const isLeft = index % 2 === 0;
            const step = Math.floor(index / 2);
            
            const style = isLeft 
              ? { left: `${8 + step * 8}%`, bottom: `${12 + step * 18}%` }
              : { right: `${8 + step * 8}%`, top: `${12 + step * 18}%` };
              
            const duration = 5 + (index * 1.2);
            const rotateDir = isLeft ? 1 : -1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -100 : 100, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: [0, isLeft ? -20 : 20, 0],
                  rotate: [0, rotateDir * 3, rotateDir * -1, 0]
                }}
                transition={{
                  x: { duration: 1.2, ease: "easeOut" },
                  opacity: { duration: 1.2 },
                  y: { duration: duration, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: duration + 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute w-14 md:w-24 lg:w-36 pointer-events-none select-none z-10 hidden sm:block"
                style={style}
              >
                <img
                  src={imgUrl}
                  alt={`Nuki Object ${index + 1}`}
                  className="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            );
          })
        ) : (
          <>
            {/* Left Floating Camera */}
            <motion.div
              initial={{ opacity: 0, x: -100, y: 0 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -20, 0],
                rotate: [0, 3, -1, 0]
              }}
              transition={{
                x: { duration: 1.2, ease: "easeOut" },
                opacity: { duration: 1.2 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute left-8 md:left-16 lg:left-24 bottom-12 md:bottom-24 w-20 md:w-32 lg:w-40 pointer-events-none select-none z-10 hidden sm:block"
            >
              <img
                src="/camera_white.jpg"
                alt="Camera Model"
                className="w-full h-auto mix-blend-multiply drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
              />
            </motion.div>

            {/* Right Floating Lens */}
            <motion.div
              initial={{ opacity: 0, x: 100, y: 0 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, 20, 0],
                rotate: [0, -2, 2, 0]
              }}
              transition={{
                x: { duration: 1.2, ease: "easeOut" },
                opacity: { duration: 1.2 },
                y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute right-8 md:right-16 lg:right-24 top-12 md:top-24 w-18 md:w-28 lg:w-36 pointer-events-none select-none z-10 hidden sm:block"
            >
              <img
                src="/lens_white.jpg"
                alt="Camera Lens"
                className="w-full h-auto mix-blend-multiply drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
              />
            </motion.div>
          </>
        )}

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 font-light tracking-tight mb-6 leading-tight drop-shadow-sm"
          >
            {settings.heroText}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-stone-700 font-light tracking-wide max-w-2xl mx-auto"
          >
            {settings.heroSubText}
          </motion.p>
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
            {displayPortfolio.map((item, index) => (
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
                    style={{ objectPosition: item.objectPosition || 'center' }}
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
