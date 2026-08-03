import { useState, useEffect } from 'react';
import { useCMS, PortfolioItem } from '../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to get embed URL from YouTube or Vimeo link with autoplay
const getEmbedUrl = (url: string, autoPlay: boolean = true) => {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const autoPlayParam = autoPlay ? '?autoplay=1&rel=0' : '';
    return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}${autoPlayParam}` };
  }
  
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const autoPlayParam = autoPlay ? '?autoplay=1' : '';
    return { type: 'vimeo', url: `https://player.vimeo.com/video/${vimeoMatch[1]}${autoPlayParam}` };
  }
  
  // Direct video file
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: 'direct', url: url };
  }
  
  return null;
};

// Helper function to determine aspect ratio for video items
const getItemVideoAspectRatio = (item: PortfolioItem): '16:9' | '9:16' => {
  if (item.videoAspectRatio) return item.videoAspectRatio;
  if (item.videoUrl && (item.videoUrl.includes('/shorts/') || item.videoUrl.includes('reels'))) {
    return '9:16';
  }
  return '16:9';
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
      return item.category === 'Video' || !!item.videoUrl;
    }
  });

  // Split video items by aspect ratio
  const videoItems16x9 = filteredPortfolio.filter(item => getItemVideoAspectRatio(item) === '16:9');
  const videoItems9x16 = filteredPortfolio.filter(item => getItemVideoAspectRatio(item) === '9:16');

  const handleItemClick = async (item: PortfolioItem) => {
    setSelectedItem(item);
    
    // If it's a video item, do not fetch extra gallery images so it directly plays the video in lightbox
    if (item.videoUrl || item.category === 'Video') {
      setGalleryImages([]);
      setIsLoadingGallery(false);
      return;
    }

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

  // Hero Cross-Dissolve Image Slider Logic
  const heroImageList = (() => {
    const listFromArr = (settings.heroImages || []).filter(url => typeof url === 'string' && url.trim().length > 0);
    if (listFromArr.length > 0) return listFromArr;
    return settings.heroImage ? [settings.heroImage] : [];
  })();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (heroImageList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroImageList.length);
    }, settings.heroSlideInterval || 2500);
    return () => clearInterval(interval);
  }, [heroImageList.length, settings.heroSlideInterval]);

  const isSelectedVideo = selectedItem && (!!selectedItem.videoUrl || selectedItem.category === 'Video');
  const selectedVideoRatio = selectedItem ? getItemVideoAspectRatio(selectedItem) : '16:9';

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Banner (16:9 Sharp Edges with Draggable Copy Position & Detailed Typography) */}
        {heroImageList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full mb-16 rounded-none overflow-hidden relative shadow-xl shadow-stone-200/40 border border-stone-100/60"
            style={{
              aspectRatio: settings.heroAspectRatio === '16:9' ? '16/9' : settings.heroAspectRatio === '4:3' ? '4/3' : '3/2'
            }}
          >
            {/* Single High-Resolution Premium Hero Banner Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={settings.heroImage || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=100&w=2800&auto=format&fit=crop'}
                alt={settings.heroText || settings.siteName}
                className="w-full h-full object-cover select-none"
                style={{ 
                  objectPosition: settings.heroObjectPosition || 'center',
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Positioned Brand Copy Container - Mobile Responsive clamp */}
            <div
              className={`absolute flex flex-col pointer-events-none px-4 sm:px-0 max-w-[90%] md:max-w-2xl ${
                settings.heroTextAlign === 'center'
                  ? 'items-center text-center left-1/2 -translate-x-1/2'
                  : settings.heroTextAlign === 'right'
                  ? 'items-end text-right right-4 md:right-8'
                  : 'items-start text-left left-4 md:left-10'
              }`}
              style={{
                top: `${settings.heroTextY ?? 80}%`,
                transform: 'translateY(-100%)',
              }}
            >
              {settings.heroSubText && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    fontSize: `clamp(11px, 2.5vw, ${settings.heroSubTextFontSize || 14}px)`,
                    letterSpacing: `${settings.heroSubTextLetterSpacing ?? 1}px`,
                    fontFamily: settings.heroSubTextFontFamily || 'Pretendard',
                    color: settings.heroSubTextColor || '#E7E5E4',
                  }}
                  className="uppercase font-semibold mb-1 drop-shadow text-stone-200"
                >
                  {settings.heroSubText}
                </motion.p>
              )}
              {settings.heroText && (
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{
                    fontSize: `clamp(20px, 4.5vw, ${settings.heroTextFontSize || 42}px)`,
                    letterSpacing: `${settings.heroTextLetterSpacing ?? 0}px`,
                    fontFamily: settings.heroTextFontFamily || 'Pretendard',
                    color: settings.heroTextColor || '#FFFFFF',
                  }}
                  className="font-bold leading-tight drop-shadow-lg whitespace-pre-line"
                >
                  {settings.heroText}
                </motion.h2>
              )}
            </div>
          </motion.div>
        )}

        {/* Category Header & Filter */}
        <div className="mb-16 mt-4">
          <div className="mb-8">
            <h1 
              className="text-3xl md:text-5xl text-stone-900 uppercase font-bold"
              style={{
                fontFamily: '"Apple SD Gothic Neo", "AppleGothic", "Malgun Gothic", sans-serif',
                letterSpacing: `${settings.homePortfolioTitleLetterSpacing ?? 1}px`,
              }}
            >
              {settings.homePortfolioTitle || 'Work'}
            </h1>
            {settings.homePortfolioSubText && (
              <p
                style={{
                  fontSize: `${settings.homePortfolioSubTextFontSize || 14}px`,
                  letterSpacing: `${settings.homePortfolioSubTextLetterSpacing ?? 1}px`,
                  color: settings.homePortfolioSubTextColor || '#78716C',
                  fontFamily: '"Apple SD Gothic Neo", "AppleGothic", "Malgun Gothic", sans-serif',
                }}
                className="font-medium mt-2"
              >
                {settings.homePortfolioSubText}
              </p>
            )}
          </div>
          
          <div className="flex space-x-12 text-sm font-semibold tracking-[0.2em] border-b border-stone-100 pb-4">
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
              사진
            </button>
            <button
              onClick={() => setActiveCategory('Video')}
              className={`transition-all duration-300 cursor-pointer pb-4 -mb-5 border-b-2 ${
                activeCategory === 'Video' 
                  ? 'border-stone-900 text-stone-900 font-bold' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              영상
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

        {/* Content Display: Photography vs Video (No Border, 3px Corner Radius) */}
        {activeCategory === 'Video' ? (
          <div className="space-y-16">
            {/* 16:9 Landscape Video Section */}
            {videoItems16x9.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {videoItems16x9.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                    className="w-full group cursor-pointer bg-stone-900 border-0 rounded-[3px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-500 hover:-translate-y-1 relative"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/15 transition-colors duration-500 flex items-center justify-center">
                        <div className="bg-stone-900/70 backdrop-blur-md text-white p-3.5 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play size={20} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 text-white text-xs font-semibold drop-shadow-md truncate">
                        {item.title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 9:16 Vertical Shorts Section */}
            {videoItems9x16.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                {videoItems9x16.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                    className="w-full group cursor-pointer bg-stone-900 border-0 rounded-[3px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-500 hover:-translate-y-1 relative"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative overflow-hidden w-full" style={{ aspectRatio: '9/16' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/15 transition-colors duration-500 flex items-center justify-center">
                        <div className="bg-stone-900/70 backdrop-blur-md text-white p-3 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold drop-shadow-md truncate text-center">
                        {item.title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredPortfolio.length === 0 && (
              <div className="text-center py-24 border border-dashed border-stone-200 rounded-[3px] bg-stone-50 text-stone-400 text-sm">
                등록된 영상 포트폴리오가 없습니다.
              </div>
            )}
          </div>
        ) : (
          /* Photography Grid (No Border, 3px Corner Radius) */
          filteredPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {filteredPortfolio.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                  className="w-full group cursor-pointer bg-white border-0 rounded-[3px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500 hover:-translate-y-1 relative"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative overflow-hidden w-full" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {item.videoUrl && (
                      <div className="absolute bottom-4 right-4 bg-stone-900/60 backdrop-blur-sm text-white p-2.5 rounded-full z-10 shadow-md">
                        <Play size={14} fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-stone-900/[0.01] group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-stone-200 rounded-[3px] bg-stone-50 text-stone-400 text-sm">
              등록된 포트폴리오가 없습니다.
            </div>
          )
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

      {/* Process Section in Home Page (Matches User Design 100%) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-28 pt-20 border-t border-stone-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Process Title */}
          <div className="lg:col-span-4 sticky top-32">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight font-sans">
              {settings.serviceProcessTitle || 'Process'}
            </h2>
            {settings.serviceSubText && (
              <p className="text-stone-500 text-sm tracking-wide mt-4 whitespace-pre-line">
                {settings.serviceSubText}
              </p>
            )}
          </div>

          {/* Right Column: Steps */}
          <div className="lg:col-span-8 space-y-10">
            {((settings.serviceProcessSteps && settings.serviceProcessSteps.length > 0)
              ? settings.serviceProcessSteps
              : [
                  { id: '1', stepNumber: '01', title: '상담·기획', desc1: '24시간 안에 답장합니다.', desc2: '목적과 무드를 듣고 레퍼런스·세팅·견적을 제안합니다.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
                  { id: '2', stepNumber: '02', title: '촬영', desc1: '역삼 스튜디오 또는 로케이션.', desc2: '현장에서 컷을 함께 확인하며 진행합니다.', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop' },
                  { id: '3', stepNumber: '03', title: '셀렉·리터칭', desc1: '정리된 컷에서 고르시면,', desc2: '피드백을 반영해 정성껏 보정합니다.', image: 'https://images.unsplash.com/photo-1554046920-90dcac0536d1?q=80&w=600&auto=format&fit=crop' },
                  { id: '4', stepNumber: '04', title: '전달', desc1: '고해상도 완성본을 일정에 맞춰드립니다.', desc2: '', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop' }
                ]).map((step, idx) => (
              <div key={step.id || idx} className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-start justify-between gap-6 group">
                <div className="flex items-start space-x-6 flex-1">
                  <span className="text-xs font-mono font-bold text-stone-400 tracking-wider pt-1 shrink-0">
                    {step.stepNumber || `0${idx + 1}`}
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-sans">
                      {step.title}
                    </h3>
                    <div className="text-sm text-stone-600 space-y-1 font-normal leading-relaxed">
                      {step.desc1 && <p className="whitespace-pre-line">{step.desc1}</p>}
                      {step.desc2 && <p className="text-stone-500 whitespace-pre-line">{step.desc2}</p>}
                    </div>
                  </div>
                </div>
                {step.image && (
                  <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-stone-200 pt-4" />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-stone-900 w-full overflow-hidden shadow-2xl relative my-auto rounded-[3px] border border-stone-800 ${
                isSelectedVideo && selectedVideoRatio === '9:16'
                  ? 'max-w-sm md:max-w-md'
                  : 'max-w-4xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 bg-stone-800/80 hover:bg-stone-700 text-white p-2.5 rounded-full transition-colors shadow-lg backdrop-blur-sm"
              >
                <X size={18} />
              </button>
              
              {/* Video Player or Photo Gallery */}
              {isSelectedVideo ? (
                <div className="flex flex-col bg-black">
                  <div 
                    className="relative w-full bg-black flex items-center justify-center"
                    style={{ aspectRatio: selectedVideoRatio === '9:16' ? '9/16' : '16/9' }}
                  >
                    {selectedItem.videoUrl && getEmbedUrl(selectedItem.videoUrl, true) ? (
                      getEmbedUrl(selectedItem.videoUrl, true)?.type === 'direct' ? (
                        <video 
                          src={getEmbedUrl(selectedItem.videoUrl, true)!.url} 
                          controls 
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <iframe
                          src={getEmbedUrl(selectedItem.videoUrl, true)!.url}
                          title={selectedItem.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )
                    ) : (
                      <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="p-6 bg-stone-900 text-white border-t border-stone-800">
                    <h3 className="text-xl font-bold mb-1">{selectedItem.title}</h3>
                    {selectedItem.description && (
                      <p className="text-sm text-stone-400 font-light mt-2 leading-relaxed">{selectedItem.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Photo Lightbox */
                <div className="bg-white rounded-[3px] overflow-hidden">
                  <div className="p-8 md:p-10 border-b border-stone-100">
                    <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2">{selectedItem.title}</h2>
                    <p className="text-xs text-stone-400 tracking-widest uppercase mb-4 font-semibold">{selectedItem.category}</p>
                    <p className="text-stone-600 font-light text-sm leading-relaxed max-w-2xl">{selectedItem.description}</p>
                  </div>

                  <div className="p-4 md:p-8 bg-stone-50 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col gap-6">
                      {isLoadingGallery ? (
                        <div className="flex justify-center items-center py-16">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-800"></div>
                        </div>
                      ) : (
                        galleryImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative w-full flex justify-center bg-white rounded-[3px] overflow-hidden shadow-sm">
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
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
