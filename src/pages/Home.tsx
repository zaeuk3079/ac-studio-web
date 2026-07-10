import { useState, useEffect } from 'react';
import { useCMS, PortfolioItem } from '../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Play, Send } from 'lucide-react';
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
  
  const [activeCategory, setActiveCategory] = useState<'Photography' | 'Video'>('Photography');
  const [subCategory, setSubCategory] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Filter portfolio based on category & subcategory
  const filteredPortfolio = portfolio.filter(item => {
    if (activeCategory === 'Photography') {
      if (item.category === 'Video') return false;
      if (subCategory === 'ALL') return true;
      
      const itemCat = item.category.toUpperCase().replace(/\s+/g, '');
      if (subCategory === 'COMMERCIAL') {
        return itemCat === 'PRODUCT' || itemCat === 'COMMERCIAL';
      }
      if (subCategory === 'FOOD & BEVERAGE') {
        return itemCat === 'FOOD&BEVERAGE' || itemCat === 'FOOD' || itemCat === 'BEVERAGE';
      }
      if (subCategory === 'MODEL') {
        return itemCat === 'MODEL' || itemCat === 'PORTRAIT' || itemCat === 'SNAP' || itemCat === 'WEDDING';
      }
      if (subCategory === 'AI') {
        return itemCat === 'AI';
      }
      return false;
    } else {
      return item.category === 'Video';
    }
  });

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
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Header & Filter */}
        <div className="mb-16 mt-8">
          <h1 className="font-sans text-3xl md:text-5xl text-stone-900 tracking-[0.2em] uppercase font-bold mb-8">
            Work
          </h1>
          
          <div className="flex space-x-12 text-sm font-semibold tracking-[0.25em] uppercase border-b border-stone-100 pb-4">
            <button
              onClick={() => {
                setActiveCategory('Photography');
                setSubCategory('ALL');
              }}
              className={`transition-all duration-300 cursor-pointer pb-4 -mb-5 border-b-2 ${
                activeCategory === 'Photography' 
                  ? 'border-stone-900 text-stone-900 font-bold' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Photography
            </button>
            <button
              onClick={() => setActiveCategory('Video')}
              className={`transition-all duration-300 cursor-pointer pb-4 -mb-5 border-b-2 ${
                activeCategory === 'Video' 
                  ? 'border-stone-900 text-stone-900 font-bold' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Video
            </button>
          </div>

          {/* Subcategories (only under Photography) */}
          {activeCategory === 'Photography' && (
            <div className="flex flex-wrap gap-3 mt-8 text-[11px] tracking-wider uppercase font-semibold text-stone-500">
              {['ALL', 'COMMERCIAL', 'FOOD & BEVERAGE', 'MODEL', 'AI'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubCategory(sub)}
                  className={`px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    subCategory === sub 
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm font-bold' 
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pinterest-style Masonry Gallery Grid */}
        {filteredPortfolio.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredPortfolio.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                className="break-inside-avoid group cursor-pointer mb-4 bg-white border border-stone-100/30 rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500 hover:-translate-y-1.5 relative"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Glassmorphic Glossy Brand Name Badge */}
                  <div className="absolute left-6 top-6 bg-white/10 backdrop-blur-xl border border-white/50 px-6 py-3 rounded-full text-xs font-bold text-white tracking-[0.2em] uppercase shadow-[0_15px_35px_0_rgba(0,0,0,0.12),inset_0_2px_2px_0_rgba(255,255,255,0.6),inset_0_-2px_6px_0_rgba(255,255,255,0.25),inset_0_8px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] transition-transform duration-500 group-hover:scale-105 select-none">
                    {item.title}
                  </div>

                  {item.videoUrl && (
                    <div className="absolute bottom-6 right-6 bg-stone-900/60 backdrop-blur-sm text-white p-3 rounded-full z-10 shadow-md">
                      <Play size={16} fill="currentColor" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-stone-900/[0.02] group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-stone-200 rounded-3xl bg-stone-50 text-stone-400 text-sm">
            등록된 포트폴리오가 없습니다.
          </div>
        )}
      </div>

      {/* About Snippet */}
      {settings.showHomeAbout !== false && (
        <section className="py-24 bg-stone-50 border-t border-stone-100 mt-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-8 italic">The Studio</h2>
            <p className="text-lg md:text-xl text-stone-500 leading-relaxed font-light">
              {settings.aboutText}
            </p>
            <div className="mt-12">
              <Link to="/about" className="text-stone-600 hover:text-stone-900 uppercase tracking-widest text-sm font-semibold border-b border-stone-300 pb-1 transition-colors">
                Read Our Story
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-sm p-0 md:p-8 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-5xl md:rounded-3xl overflow-hidden shadow-2xl my-auto relative min-h-screen md:min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 bg-stone-100 hover:bg-stone-200 text-stone-700 p-2.5 rounded-full transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              <div className="p-8 md:p-12 border-b border-stone-100">
                <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2">{selectedItem.title}</h2>
                <p className="text-sm text-stone-400 tracking-widest uppercase mb-6 font-semibold">{selectedItem.category}</p>
                <p className="text-stone-600 font-light leading-relaxed max-w-2xl">{selectedItem.description}</p>
              </div>

              <div className="p-4 md:p-12 bg-stone-50">
                <div className="flex flex-col gap-4 md:gap-8">
                  {selectedItem.videoUrl && getEmbedUrl(selectedItem.videoUrl) && (
                    <div className="relative w-full aspect-video bg-stone-900 md:rounded-2xl overflow-hidden shadow-lg">
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
                    </div>
                  ) : (
                    galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-full flex justify-center bg-white md:rounded-2xl overflow-hidden shadow-sm">
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
