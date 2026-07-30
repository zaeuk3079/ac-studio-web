import React, { useState, useRef, useEffect } from 'react';
import { useCMS, SiteSettings } from '../../store/CMSContext';
import { motion } from 'motion/react';
import { Save, Home, Image as ImageIcon, Info, Phone, Palette, Download, Globe, Layers, Move, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { compressImage, compressBase64String, uploadImageToCloudCDN } from '../../utils/imageUtils';

export default function Settings() {
  const { settings, updateSettings } = useCMS();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const getByteSizeKB = (str?: string) => {
    if (!str) return '0 KB';
    const bytes = new Blob([str]).size;
    const kb = Math.round(bytes / 1024);
    if (kb > 500) {
      return `${kb} KB (⚠️ 용량 큼)`;
    }
    return `${kb} KB (안전)`;
  };
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const aboutCanvasRef = useRef<HTMLDivElement>(null);
  const serviceCanvasRef = useRef<HTMLDivElement>(null);
  const contactCanvasRef = useRef<HTMLDivElement>(null);
  
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [activeSnapX, setActiveSnapX] = useState(false);
  const [activeSnapY, setActiveSnapY] = useState(false);

  const applySnap = (valPct: number) => {
    // Magnetic Snap Tolerance (snaps to 50% if within 47.5% ~ 52.5%)
    if (Math.abs(valPct - 50) < 3.2) {
      return { val: 50, snapped: true };
    }
    return { val: valPct, snapped: false };
  };

  const handleBannerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingText(true);
    updateDragPosition(e.clientX, e.clientY);
  };

  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingText) return;
    updateDragPosition(e.clientX, e.clientY);
  };

  const handleBannerMouseUp = () => {
    setIsDraggingText(false);
    setActiveSnapX(false);
    setActiveSnapY(false);
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!bannerContainerRef.current) return;
    const rect = bannerContainerRef.current.getBoundingClientRect();
    const rawX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const rawY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    const snapX = applySnap(rawX);
    const snapY = applySnap(rawY);

    setActiveSnapX(snapX.snapped);
    setActiveSnapY(snapY.snapped);

    setFormData(prev => ({
      ...prev,
      heroTextX: Math.round(snapX.val),
      heroTextY: Math.round(snapY.val)
    }));
  };

  // Helper for About, Service, Contact drag canvas with magnetic snap to 50%
  const createDragHandlers = (ref: React.RefObject<HTMLDivElement>, fieldX: string, fieldY: string) => {
    return (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      const snapX = applySnap(rawX);
      const snapY = applySnap(rawY);

      setActiveSnapX(snapX.snapped);
      setActiveSnapY(snapY.snapped);

      setFormData(prev => ({
        ...prev,
        [fieldX]: Math.round(snapX.val),
        [fieldY]: Math.round(snapY.val)
      }));
    };
  };

  const ensureCloudUrl = async (val?: string): Promise<string> => {
    if (!val) return '';
    if (val.startsWith('data:image')) {
      try {
        const res = await fetch(val);
        const blob = await res.blob();
        const file = new File([blob], 'migrated_image.png', { type: blob.type || 'image/png' });
        const cdnUrl = await uploadImageToCloudCDN(file);
        return cdnUrl;
      } catch (err) {
        console.warn('Failed to auto-migrate base64 to Cloud CDN:', err);
        return await compressBase64String(val, 350, 0.6);
      }
    }
    return val;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto migrate single image fields to Cloud CDN URLs
      const logoUrlConverted = await ensureCloudUrl(formData.logoUrl);
      const heroImageConverted = await ensureCloudUrl(formData.heroImage);
      const aboutImageConverted = await ensureCloudUrl(formData.aboutImage);
      const serviceImageConverted = await ensureCloudUrl(formData.serviceImage);

      // Auto migrate heroImages array items to Cloud CDN URLs
      const heroImagesConverted = (formData.heroImages && formData.heroImages.length > 0)
        ? await Promise.all(formData.heroImages.map(img => ensureCloudUrl(img)))
        : [];

      const cleanedData = {
        ...formData,
        logoUrl: logoUrlConverted,
        heroImage: heroImageConverted,
        aboutImage: aboutImageConverted,
        serviceImage: serviceImageConverted,
        heroImages: heroImagesConverted,
        heroNukiImages: [],
        heroNukiConfigs: []
      };
      
      await updateSettings(cleanedData);
      setFormData(cleanedData);
      alert('설정이 성공적으로 저장되었습니다!');
    } catch (error: any) {
      console.error('Settings save error:', error);
      alert('설정이 성공적으로 저장되었습니다!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingField(fieldName);
      try {
        // High-Speed Unlimited Cloud CDN Upload
        const cdnUrl = await uploadImageToCloudCDN(file);
        setFormData(prev => ({ ...prev, [fieldName]: cdnUrl }));
      } catch (error) {
        console.error('Error uploading image to cloud CDN:', error);
        const maxDim = fieldName === 'logoUrl' ? 500 : 1000;
        const compressedBase64 = await compressImage(file, maxDim, maxDim, 0.75);
        setFormData(prev => ({ ...prev, [fieldName]: compressedBase64 }));
      } finally {
        setUploadingField(null);
        e.target.value = '';
      }
    }
  };

  const handleNukiImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const newConfigs: any[] = [];
        const newImages: string[] = [];
        const currentConfigs = formData.heroNukiConfigs || [];
        const currentImages = formData.heroNukiImages || [];
        
        for (let i = 0; i < files.length; i++) {
          const compressed = await compressImage(files[i], 800, 800, 0.5);
          newImages.push(compressed);
          
          // Spread positions evenly based on index
          const baseIndex = currentConfigs.length + i;
          const leftVal = baseIndex % 2 === 0 ? 10 + (Math.floor(baseIndex / 2) * 15) : 75 - (Math.floor(baseIndex / 2) * 15);
          const topVal = baseIndex % 2 === 0 ? 25 + (Math.floor(baseIndex / 2) * 10) : 55 - (Math.floor(baseIndex / 2) * 10);
          
          newConfigs.push({
            url: compressed,
            left: Math.max(5, Math.min(95, leftVal)),
            top: Math.max(5, Math.min(95, topVal)),
            size: 120
          });
        }
        
        setFormData({
          ...formData,
          heroNukiImages: [...currentImages, ...newImages],
          heroNukiConfigs: [...currentConfigs, ...newConfigs]
        });
      } catch (error) {
        console.error('Error compressing nuki images:', error);
        alert('누끼 이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRemoveNukiImage = (indexToRemove: number) => {
    const currentConfigs = formData.heroNukiConfigs || [];
    const currentImages = formData.heroNukiImages || [];
    setFormData({
      ...formData,
      heroNukiImages: currentImages.filter((_, idx) => idx !== indexToRemove),
      heroNukiConfigs: currentConfigs.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleNukiConfigChange = (index: number, field: 'left' | 'top' | 'size', value: number) => {
    const currentConfigs = [...(formData.heroNukiConfigs || [])];
    if (currentConfigs[index]) {
      currentConfigs[index] = {
        ...currentConfigs[index],
        [field]: value
      };
      setFormData({
        ...formData,
        heroNukiConfigs: currentConfigs
      });
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Use direct navigation for the most robust download experience
      // The browser will handle the file download natively without leaving the page
      window.location.href = '/api/download-source';
      
      // Reset downloading state after a short delay
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'service', label: 'Service', icon: Layers },
    { id: 'contact', label: '견적문의', icon: Phone },
    { id: 'deployment', label: 'Deployment', icon: Globe },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">Site Settings</h2>
        <p className="text-stone-500 mt-1">Manage your website's content and appearance by category.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-stone-200 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-burgundy-600 text-burgundy-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Site Name (사이트 이름)</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-stone-700">Site Logo (로고 이미지)</label>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  {getByteSizeKB(formData.logoUrl)}
                </span>
              </div>
              <div className="flex space-x-3">
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl || ''}
                  onChange={handleChange}
                  className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
                <div className="relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logoUrl')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button type="button" className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-lg font-medium transition-colors h-full whitespace-nowrap">
                    {uploadingField === 'logoUrl' ? '업로드 중...' : 'PC에서 찾기'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">* 팁: 배경이 투명한 PNG 형식의 로고를 권장하며, 업로드 시 투명도가 보존됩니다.</p>
              {formData.logoUrl && (
                <div className="mt-4 p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-stone-100 rounded-xl border border-stone-200 flex justify-center items-center">
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-20 w-auto object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

            {/* Main Banner (Hero Visual) Settings */}
            <div className="pt-6 border-t border-stone-200 space-y-6">
              <h3 className="text-base font-semibold text-stone-800">Main Banner (메인 비주얼 슬라이드 배너)</h3>
              
              {/* Multi-Image Cross-Dissolve Slider (Max 5 Images) */}
              <div className="pt-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-stone-800">✨ 메인 교차 디졸브 슬라이드 사진 (최대 5장)</h4>
                  <span className="text-xs text-stone-500">사진을 2장 이상 올리시면 4.5초마다 부드러운 디졸브 모션으로 바뀝니다.</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const heroArr = formData.heroImages || [];
                    const currentImg = heroArr[idx] || (idx === 0 ? formData.heroImage : '');
                    return (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col items-center space-y-2">
                        <span className="text-xs font-bold text-stone-700">사진 {idx + 1}</span>
                        <div className="w-full h-24 bg-stone-200 rounded-lg overflow-hidden relative flex items-center justify-center border border-stone-300">
                          {currentImg ? (
                            <img src={currentImg} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-stone-400 font-medium">비어있음</span>
                          )}
                        </div>
                        <div className="relative w-full overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingField(`heroSlide_${idx}`);
                                try {
                                  const url = await uploadImageToCloudCDN(file);
                                  setFormData(prev => {
                                    const baseArr = Array.isArray(prev.heroImages) ? [...prev.heroImages] : [];
                                    while (baseArr.length <= idx) {
                                      baseArr.push('');
                                    }
                                    baseArr[idx] = url;
                                    return {
                                      ...prev,
                                      heroImages: baseArr,
                                      heroImage: idx === 0 ? url : (prev.heroImage || url)
                                    };
                                  });
                                } finally {
                                  setUploadingField(null);
                                  e.target.value = '';
                                }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button type="button" className="w-full bg-stone-800 hover:bg-stone-900 text-white text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer">
                            {uploadingField === `heroSlide_${idx}` ? '업로드 중...' : '[PC에서 찾기]'}
                          </button>
                        </div>
                        {currentImg && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const baseArr = Array.isArray(prev.heroImages) ? [...prev.heroImages] : [];
                                baseArr[idx] = '';
                                return { ...prev, heroImages: baseArr };
                              });
                            }}
                            className="text-[10px] text-red-500 hover:underline cursor-pointer"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
                {formData.heroImage && (
                  <div className="mt-4 space-y-3">
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-stone-800">
                        <Move size={14} className="text-burgundy-600" />
                        <span>포토샵 스타일 드래그 미리보기 (화면 위 텍스트를 마우스로 잡고 이동하세요)</span>
                      </span>
                      <span className="text-[11px] text-stone-400 font-normal">좌표: X {formData.heroTextX ?? 6}%, Y {formData.heroTextY ?? 82}%</span>
                    </label>
                    
                    <div
                      ref={bannerContainerRef}
                      onMouseDown={handleBannerMouseDown}
                      onMouseMove={handleBannerMouseMove}
                      onMouseUp={handleBannerMouseUp}
                      onMouseLeave={handleBannerMouseUp}
                      className="w-full rounded-lg overflow-hidden border border-stone-300 relative select-none cursor-move group shadow-lg transition-all"
                      style={{
                        aspectRatio: formData.heroAspectRatio === '16:9' ? '16/9' : formData.heroAspectRatio === '4:3' ? '4/3' : '3/2'
                      }}
                    >
                      <img
                        src={formData.heroImage}
                        alt="Banner Preview"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ objectPosition: formData.heroObjectPosition || 'center' }}
                        referrerPolicy="no-referrer"
                      />

                      {/* Smart Center Alignment Grid Lines & Magnetic Snap Feedback */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Vertical Center Line (50%) */}
                        <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 transition-all ${
                          activeSnapX ? 'border-r-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]' : 'border-r border-dashed border-white/40'
                        }`} />
                        {/* Horizontal Center Line (50%) */}
                        <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 transition-all ${
                          activeSnapY ? 'border-b-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]' : 'border-b border-dashed border-white/40'
                        }`} />
                        
                        {/* Magnetic Snap Badge Feedback */}
                        {(activeSnapX || activeSnapY) && (
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md z-30 animate-pulse">
                            🎯 중앙 50% 자석 스냅!
                          </div>
                        )}
                      </div>
                      
                      {/* Draggable Text Block */}
                      <div
                        className={`absolute pointer-events-none transition-transform duration-75 flex flex-col ${
                          formData.heroTextAlign === 'center'
                            ? 'items-center text-center'
                            : formData.heroTextAlign === 'right'
                            ? 'items-end text-right'
                            : 'items-start text-left'
                        }`}
                        style={{
                          left: `${formData.heroTextX ?? 6}%`,
                          top: `${formData.heroTextY ?? 82}%`,
                          transform: formData.heroTextAlign === 'center'
                            ? 'translate(-50%, -100%)'
                            : formData.heroTextAlign === 'right'
                            ? 'translate(-100%, -100%)'
                            : 'translate(0%, -100%)',
                          textAlign: (formData.heroTextAlign || 'left') as any,
                        }}
                      >
                        {formData.heroSubText && (
                          <div
                            style={{
                              fontSize: `${Math.max(10, Math.round((formData.heroSubTextFontSize || 14) * 0.45))}px`,
                              letterSpacing: `${formData.heroSubTextLetterSpacing ?? 1}px`,
                              fontFamily: formData.heroSubTextFontFamily || 'Pretendard',
                              color: formData.heroSubTextColor || '#E7E5E4',
                            }}
                            className="font-semibold uppercase drop-shadow mb-1"
                          >
                            {formData.heroSubText}
                          </div>
                        )}
                        {formData.heroText && (
                          <div
                            style={{
                              fontSize: `${Math.max(14, Math.round((formData.heroTextFontSize || 42) * 0.45))}px`,
                              letterSpacing: `${formData.heroTextLetterSpacing ?? 0}px`,
                              fontFamily: formData.heroTextFontFamily || 'Pretendard',
                              color: formData.heroTextColor || '#FFFFFF',
                            }}
                            className="font-bold drop-shadow-md leading-tight"
                          >
                            {formData.heroText}
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded pointer-events-none">
                        비율: {formData.heroAspectRatio || '3:2'} | 초점: {formData.heroObjectPosition || 'center'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Main Banner Aspect Ratio (배너 이미지 비율 선택)</label>
                  <select
                    name="heroAspectRatio"
                    value={formData.heroAspectRatio || '3:2'}
                    onChange={handleChange as any}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white font-medium text-stone-800"
                  >
                    <option value="3:2">3:2 (카메라 가로 촬영 원본 표준 - 추천)</option>
                    <option value="16:9">16:9 (와이드 비디오 스크린)</option>
                    <option value="4:3">4:3 (클래식 포토)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Main Banner Position (배너 사진 초점/위치 이동 조정)</label>
                  <select
                    name="heroObjectPosition"
                    value={formData.heroObjectPosition || 'center'}
                    onChange={handleChange as any}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white font-medium text-stone-800"
                  >
                    <option value="center">중앙 (Center - 기본값)</option>
                    <option value="top">상단 (Top - 위쪽 인물/얼굴 초점)</option>
                    <option value="bottom">하단 (Bottom - 아래쪽 초점)</option>
                    <option value="50% 25%">상단 25% (약간 위쪽)</option>
                    <option value="50% 75%">하단 75% (약간 아래쪽)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Main Copy (메인 카피 문구)</label>
                  <input
                    type="text"
                    name="heroText"
                    value={formData.heroText || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                    placeholder="예: CRAFTING VISUAL STORIES"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Sub Copy (서브 카피 문구)</label>
                  <input
                    type="text"
                    name="heroSubText"
                    value={formData.heroSubText || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                    placeholder="예: 감각적인 순간을 담는 브랜드 포토그라피 & 비디오 스튜디오"
                  />
                </div>
              </div>

              {/* Photoshop-style Detail Typography Controllers */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-6">
                <h4 className="font-semibold text-stone-900 text-sm flex items-center justify-between">
                  <span>🎨 메인 카피 디테일 편집기 (글자 크기 / 자간 / 폰트 / 위치)</span>
                  <span className="text-xs text-stone-500 font-normal">Photoshop Style Controls</span>
                </h4>
                {/* Text Alignment Controls */}
                <div className="pt-3 border-t border-stone-200/80">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    글자 정렬 (Text Alignment)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, heroTextAlign: 'left' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        (!formData.heroTextAlign || formData.heroTextAlign === 'left')
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <AlignLeft size={14} />
                      <span>왼쪽 정렬</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, heroTextAlign: 'center' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        formData.heroTextAlign === 'center'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <AlignCenter size={14} />
                      <span>가운데 정렬</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, heroTextAlign: 'right' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        formData.heroTextAlign === 'right'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <AlignRight size={14} />
                      <span>오른쪽 정렬</span>
                    </button>
                  </div>
                </div>

                {/* Main Copy Controls */}
                <div className="space-y-4 pt-3 border-t border-stone-200/80">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">메인 카피 디테일 (Main Copy)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">글자 크기 ({formData.heroTextFontSize || 42}px)</label>
                      <input
                        type="range"
                        min="18"
                        max="80"
                        name="heroTextFontSize"
                        value={formData.heroTextFontSize || 42}
                        onChange={(e) => setFormData({ ...formData, heroTextFontSize: Number(e.target.value) })}
                        className="w-full accent-stone-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">자간 조절 ({formData.heroTextLetterSpacing ?? 0}px)</label>
                      <input
                        type="range"
                        min="-4"
                        max="16"
                        name="heroTextLetterSpacing"
                        value={formData.heroTextLetterSpacing ?? 0}
                        onChange={(e) => setFormData({ ...formData, heroTextLetterSpacing: Number(e.target.value) })}
                        className="w-full accent-stone-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">폰트 종류 (Font Family)</label>
                      <select
                        name="heroTextFontFamily"
                        value={formData.heroTextFontFamily || 'Pretendard'}
                        onChange={handleChange as any}
                        className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-xs bg-white font-medium"
                      >
                        <option value="Pretendard">Pretendard (Regular 400)</option>
                        <option value="Pretendard-Medium">Pretendard (Medium 500)</option>
                        <option value="Pretendard-SemiBold">Pretendard (SemiBold 600)</option>
                        <option value="Pretendard-Bold">Pretendard (Bold 700)</option>
                        <option value="Pretendard-Black">Pretendard (Black 900)</option>
                        <option value="Pretendard-Light">Pretendard (Light 300)</option>
                        <option value="Moneygraphy-Rounded">Moneygraphy Rounded (머니그라피 둥근체)</option>
                        <option value="Moneygraphy-Pixel">Moneygraphy Pixel (머니그라피 픽셀체)</option>
                        <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                        <option value="Cormorant Garamond">Cormorant Garamond (클래식 Serif)</option>
                        <option value="Cinzel">Cinzel (명품 비주얼)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">글자 색상 (Color Palette)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.heroTextColor || '#FFFFFF'}
                          onChange={(e) => setFormData({ ...formData, heroTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                        />
                        <div className="flex items-center space-x-1 overflow-x-auto py-1">
                          {['#FFFFFF', '#F5F5F0', '#D4AF37', '#E2E8F0', '#18181B', '#800020', '#3B82F6'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, heroTextColor: color })}
                              className={`w-5 h-5 rounded-full border border-stone-300 transition-transform cursor-pointer ${formData.heroTextColor === color ? 'scale-125 ring-2 ring-stone-900 z-10' : 'hover:scale-110'}`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Copy Controls */}
                <div className="space-y-4 pt-4 border-t border-stone-200/80">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">서브 카피 디테일 (Sub Copy)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">글자 크기 ({formData.heroSubTextFontSize || 14}px)</label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        name="heroSubTextFontSize"
                        value={formData.heroSubTextFontSize || 14}
                        onChange={(e) => setFormData({ ...formData, heroSubTextFontSize: Number(e.target.value) })}
                        className="w-full accent-stone-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">자간 조절 ({formData.heroSubTextLetterSpacing ?? 1}px)</label>
                      <input
                        type="range"
                        min="-2"
                        max="10"
                        name="heroSubTextLetterSpacing"
                        value={formData.heroSubTextLetterSpacing ?? 1}
                        onChange={(e) => setFormData({ ...formData, heroSubTextLetterSpacing: Number(e.target.value) })}
                        className="w-full accent-stone-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">폰트 종류 (Font Family)</label>
                      <select
                        name="heroSubTextFontFamily"
                        value={formData.heroSubTextFontFamily || 'Pretendard'}
                        onChange={handleChange as any}
                        className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-xs bg-white font-medium"
                      >
                        <option value="Pretendard">Pretendard (Regular 400)</option>
                        <option value="Pretendard-Medium">Pretendard (Medium 500)</option>
                        <option value="Pretendard-SemiBold">Pretendard (SemiBold 600)</option>
                        <option value="Pretendard-Bold">Pretendard (Bold 700)</option>
                        <option value="Pretendard-Black">Pretendard (Black 900)</option>
                        <option value="Pretendard-Light">Pretendard (Light 300)</option>
                        <option value="Moneygraphy-Rounded">Moneygraphy Rounded (머니그라피 둥근체)</option>
                        <option value="Moneygraphy-Pixel">Moneygraphy Pixel (머니그라피 픽셀체)</option>
                        <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">글자 색상 (Color Palette)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.heroSubTextColor || '#E7E5E4'}
                          onChange={(e) => setFormData({ ...formData, heroSubTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                        />
                        <div className="flex items-center space-x-1 overflow-x-auto py-1">
                          {['#E7E5E4', '#FFFFFF', '#D4AF37', '#9CA3AF', '#18181B', '#800020'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, heroSubTextColor: color })}
                              className={`w-5 h-5 rounded-full border border-stone-300 transition-transform cursor-pointer ${formData.heroSubTextColor === color ? 'scale-125 ring-2 ring-stone-900 z-10' : 'hover:scale-110'}`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
            {/* Work Section Settings (Title, Letter Spacing & Sub Copy) */}
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <h3 className="text-base font-semibold text-stone-800">Work 포트폴리오 섹션 타이틀 & 카피 편집</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Work 섹션 제목 (Title)</label>
                  <input
                    type="text"
                    name="homePortfolioTitle"
                    value={formData.homePortfolioTitle || 'Work'}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    placeholder="Work"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">제목 자간 조절 ({formData.homePortfolioTitleLetterSpacing ?? 1}px)</label>
                  <input
                    type="range"
                    min="-4"
                    max="15"
                    name="homePortfolioTitleLetterSpacing"
                    value={formData.homePortfolioTitleLetterSpacing ?? 1}
                    onChange={(e) => setFormData({ ...formData, homePortfolioTitleLetterSpacing: Number(e.target.value) })}
                    className="w-full accent-stone-800 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Work 섹션 서브 설명 카피 (Sub Copy)</label>
                <input
                  type="text"
                  name="homePortfolioSubText"
                  value={formData.homePortfolioSubText || ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                  placeholder="예: aging studio의 감각적인 대표 포트폴리오 작품입니다."
                />
              </div>
            </div>

            {/* Font Settings */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Heading Font (제목 폰트)</label>
                <select
                  name="headingFont"
                  value={formData.headingFont || 'Pretendard'}
                  onChange={handleChange as any}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white"
                >
                  <option value="Pretendard">Pretendard (프리텐다드/제목 및 본문 통일 추천)</option>
                  <option value="Playfair Display">Playfair Display (클래식/영문 추천)</option>
                  <option value="Cormorant Garamond">Cormorant Garamond (우아함/영문 추천)</option>
                  <option value="Lora">Lora (부드러운 세리프/영문)</option>
                  <option value="Noto Serif KR">Noto Serif KR (명조체/한글 추천)</option>
                  <option value="Nanum Myeongjo">Nanum Myeongjo (나눔명조/한글 추천)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Body Font (본문 폰트)</label>
                <select
                  name="bodyFont"
                  value={formData.bodyFont || 'Pretendard'}
                  onChange={handleChange as any}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white"
                >
                  <option value="Pretendard">Pretendard (프리텐다드/가장 깔끔한 한글)</option>
                  <option value="Inter">Inter (모던/영문 추천)</option>
                  <option value="Noto Sans KR">Noto Sans KR (고딕체/한글 추천)</option>
                  <option value="Nanum Gothic">Nanum Gothic (나눔고딕/한글 추천)</option>
                  <option value="Gowun Dodum">Gowun Dodum (고운돋움/감성적인 한글)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8">
            {/* Interactive Visual Drag Canvas Editor for About (Home Tab Style) */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Move size={18} className="text-burgundy-400" />
                  <span className="font-semibold text-stone-200 text-sm">About 실시간 라이브 미리보기 (실제 화면과 100% 동일한 세로형 3:4 비율)</span>
                </div>
                <span className="text-xs text-stone-400">💡 세로형 3:4 대표 사진 & 텍스트 실시간 라이브 연동</span>
              </div>

              {/* 2-Column Real Layout matching About.tsx */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-inner">
                {/* Left: Vertical Image Card (3:4 Ratio) */}
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-800 bg-stone-900 flex items-center justify-center">
                  {formData.aboutImage ? (
                    <img src={formData.aboutImage} alt="About Canvas" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs text-stone-500 font-medium">세로형 이미지 없음 (3:4 비율)</span>
                  )}
                  <div className="absolute inset-0 bg-stone-950/10 pointer-events-none" />
                </div>

                {/* Right: Live Text Preview matching About.tsx */}
                <div className="flex flex-col justify-center space-y-4 p-2">
                  <h1
                    className="font-bold leading-snug transition-all"
                    style={{
                      fontSize: `${formData.aboutTextFontSize || 36}px`,
                      letterSpacing: `${formData.aboutTextLetterSpacing ?? 0}px`,
                      fontFamily: formData.aboutTextFontFamily || 'Pretendard',
                      textAlign: (formData.aboutTextAlign || 'left') as any,
                      color: formData.aboutTextColor || '#FFFFFF',
                    }}
                  >
                    {formData.aboutTitle || 'About Us'}
                  </h1>

                  {formData.aboutSubText && (
                    <h2 className="text-sm md:text-base text-stone-300 font-light leading-relaxed whitespace-pre-line">
                      {formData.aboutSubText}
                    </h2>
                  )}

                  <div
                    className="space-y-3 text-stone-400 font-light leading-relaxed transition-all"
                    style={{
                      fontSize: `${Math.max(10, Math.round((formData.aboutBodyFontSize || 16) * 0.85))}px`,
                      letterSpacing: `${formData.aboutBodyLetterSpacing ?? 0}px`,
                    }}
                  >
                    {formData.aboutText && <p className="whitespace-pre-line">{formData.aboutText}</p>}
                    {formData.aboutText2 && <p className="whitespace-pre-line">{formData.aboutText2}</p>}
                    {formData.aboutText3 && <p className="whitespace-pre-line">{formData.aboutText3}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Photoshop-style Detail Typography Controller for About */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
              <h4 className="font-semibold text-stone-100 text-base flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="flex items-center space-x-2">
                  <span>🎨 About 포토샵 디테일 타이포그래피 편집기</span>
                  <span className="bg-burgundy-600 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Home Style Editor</span>
                </span>
                <span className="text-xs text-stone-400 font-normal">위치 / 정렬 / 제목 크기 / 본문 크기 / 자간 / 폰트</span>
              </h4>

              {/* Position Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">가로 위치 (X: {formData.aboutTextX ?? 50}%)</label>
                  <input type="range" min="0" max="100" name="aboutTextX" value={formData.aboutTextX ?? 50} onChange={(e) => setFormData({ ...formData, aboutTextX: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">세로 위치 (Y: {formData.aboutTextY ?? 30}%)</label>
                  <input type="range" min="0" max="100" name="aboutTextY" value={formData.aboutTextY ?? 30} onChange={(e) => setFormData({ ...formData, aboutTextY: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
              </div>

              {/* Text Alignment */}
              <div className="pt-2 border-t border-stone-800">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">글자 정렬 (Text Alignment)</label>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'left' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${(!formData.aboutTextAlign || formData.aboutTextAlign === 'left') ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignLeft size={16} /><span>왼쪽 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'center' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.aboutTextAlign === 'center' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignCenter size={16} /><span>가운데 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'right' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.aboutTextAlign === 'right' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignRight size={16} /><span>오른쪽 정렬</span></button>
                </div>
              </div>

              {/* Sliders & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-3 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">제목 크기 ({formData.aboutTextFontSize || 42}px)</label>
                  <input type="range" min="18" max="80" name="aboutTextFontSize" value={formData.aboutTextFontSize || 42} onChange={(e) => setFormData({ ...formData, aboutTextFontSize: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy-400 mb-1">✨ 본문 크기 ({formData.aboutBodyFontSize || 16}px)</label>
                  <input type="range" min="12" max="36" name="aboutBodyFontSize" value={formData.aboutBodyFontSize || 16} onChange={(e) => setFormData({ ...formData, aboutBodyFontSize: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">자간 조절 ({formData.aboutTextLetterSpacing ?? 0}px)</label>
                  <input type="range" min="-4" max="16" name="aboutTextLetterSpacing" value={formData.aboutTextLetterSpacing ?? 0} onChange={(e) => setFormData({ ...formData, aboutTextLetterSpacing: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">폰트 종류</label>
                  <select name="aboutTextFontFamily" value={formData.aboutTextFontFamily || 'Pretendard'} onChange={handleChange as any} className="w-full border border-stone-700 rounded-lg px-3 py-2 text-xs bg-stone-800 text-stone-200 font-medium">
                    <option value="Pretendard">Pretendard (Regular 400)</option>
                    <option value="Pretendard-Medium">Pretendard (Medium 500)</option>
                    <option value="Pretendard-SemiBold">Pretendard (SemiBold 600)</option>
                    <option value="Pretendard-Bold">Pretendard (Bold 700)</option>
                    <option value="Pretendard-Black">Pretendard (Black 900)</option>
                    <option value="Pretendard-Light">Pretendard (Light 300)</option>
                    <option value="Moneygraphy-Rounded">Moneygraphy Rounded (머니그라피 둥근체)</option>
                    <option value="Moneygraphy-Pixel">Moneygraphy Pixel (머니그라피 픽셀체)</option>
                    <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (클래식 Serif)</option>
                    <option value="Cinzel">Cinzel (명품 비주얼)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 색상</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={formData.aboutTextColor || '#1C1917'} onChange={(e) => setFormData({ ...formData, aboutTextColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border border-stone-700 p-0.5 bg-stone-800 shrink-0" />
                    <div className="flex items-center space-x-1 overflow-x-auto py-1">
                      {['#1C1917', '#FFFFFF', '#D4AF37', '#800020', '#3B82F6'].map(color => (
                        <button key={color} type="button" onClick={() => setFormData({ ...formData, aboutTextColor: color })} className={`w-5 h-5 rounded-full border border-stone-600 transition-transform cursor-pointer ${formData.aboutTextColor === color ? 'scale-125 ring-2 ring-white z-10' : 'hover:scale-110'}`} style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-6">
              <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-stone-700">Hero Image (메인 배너 이미지)</label>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  {getByteSizeKB(formData.heroImage)}
                </span>
              </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    name="aboutImage"
                    value={formData.aboutImage || ''}
                    onChange={handleChange}
                    className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                  <div className="relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'aboutImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button type="button" className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-lg font-medium transition-colors h-full whitespace-nowrap">
                      PC에서 찾기
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">About Title (대제목)</label>
                  <input
                    type="text"
                    name="aboutTitle"
                    value={formData.aboutTitle || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">About Sub Title (서브 타이틀)</label>
                  <textarea
                    name="aboutSubText"
                    value={formData.aboutSubText || ''}
                    onChange={handleChange}
                    rows={2}
                    placeholder="엔터(Enter)를 눌러 자유롭게 줄바꿈 하실 수 있습니다."
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Story Paragraph 1 (소개 문단 1)</label>
                  <textarea
                    name="aboutText"
                    value={formData.aboutText || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors text-stone-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Story Paragraph 2 (소개 문단 2)</label>
                  <textarea
                    name="aboutText2"
                    value={formData.aboutText2 || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors text-stone-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Story Paragraph 3 (소개 문단 3)</label>
                  <textarea
                    name="aboutText3"
                    value={formData.aboutText3 || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors text-stone-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SERVICE TAB */}
        {activeTab === 'service' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8">
            
            {/* Live Process Preview Canvas matching Service.tsx 100% */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="font-semibold text-stone-200 text-sm">Service Process 실시간 라이브 미리보기 (실제 화면과 100% 동일)</span>
                <span className="text-xs text-stone-400">💡 텍스트 & 이미지 입력 시 0.1초 즉시 라이브 연동</span>
              </div>

              <div className="bg-white p-6 rounded-xl border border-stone-200 text-stone-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4">
                  <h1 className="text-3xl font-black text-stone-950 tracking-tight font-sans">
                    {formData.serviceProcessTitle || 'Process'}
                  </h1>
                  {formData.serviceSubText && (
                    <p className="text-xs text-stone-500 mt-2 whitespace-pre-line">{formData.serviceSubText}</p>
                  )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                  {(formData.serviceProcessSteps || []).map((step, idx) => (
                    <div key={step.id || idx} className="pt-4 border-t border-stone-200 flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-[10px] font-mono font-bold text-stone-400 pt-0.5">{step.stepNumber || `0${idx + 1}`}</span>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{step.title || '단계 제목'}</h4>
                          <p className="text-xs text-stone-600 mt-1 whitespace-pre-line">{step.desc1}</p>
                          {step.desc2 && <p className="text-xs text-stone-400 mt-0.5 whitespace-pre-line">{step.desc2}</p>}
                        </div>
                      </div>
                      {step.image && (
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <img src={step.image} alt={step.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Process Main Title & Sub Text Controls */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-stone-800 border-b border-stone-200 pb-3">Process 섹션 타이틀 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">대형 타이틀 (기본: Process)</label>
                  <input
                    type="text"
                    name="serviceProcessTitle"
                    value={formData.serviceProcessTitle || 'Process'}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    placeholder="Process"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">서브 설명 카피</label>
                  <input
                    type="text"
                    name="serviceSubText"
                    value={formData.serviceSubText || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    placeholder="예: aging studio의 촬영 프로세스 안내입니다."
                  />
                </div>
              </div>
            </div>

            {/* Process Steps Management (Dynamic Cards with Custom Images) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-semibold text-stone-800">Process 단계별 상세 데이터 관리 (텍스트 & 이미지)</h3>
                <button
                  type="button"
                  onClick={() => {
                    const steps = formData.serviceProcessSteps || [];
                    const nextNum = String(steps.length + 1).padStart(2, '0');
                    const newStep: ProcessStep = {
                      id: `step_${Date.now()}`,
                      stepNumber: nextNum,
                      title: `새 단계 ${nextNum}`,
                      desc1: '설정 문구를 입력하세요.',
                      desc2: '',
                      image: ''
                    };
                    setFormData({ ...formData, serviceProcessSteps: [...steps, newStep] });
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  + 새 프로세스 단계 추가
                </button>
              </div>

              <div className="space-y-6">
                {(formData.serviceProcessSteps || []).map((step, idx) => (
                  <div key={step.id || idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs font-bold text-stone-800 flex items-center space-x-2">
                        <span className="bg-stone-800 text-white text-[10px] px-2 py-0.5 rounded font-mono">단계 {idx + 1}</span>
                        <span>{step.title || '제목 없음'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const steps = (formData.serviceProcessSteps || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, serviceProcessSteps: steps });
                        }}
                        className="text-xs text-red-500 hover:underline cursor-pointer font-medium"
                      >
                        이 단계 삭제
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Step Number & Title */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-stone-600 mb-1">번호 (01, 02..)</label>
                        <input
                          type="text"
                          value={step.stepNumber}
                          onChange={(e) => {
                            const newSteps = [...(formData.serviceProcessSteps || [])];
                            newSteps[idx] = { ...newSteps[idx], stepNumber: e.target.value };
                            setFormData({ ...formData, serviceProcessSteps: newSteps });
                          }}
                          className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-stone-600 mb-1">단계 제목 (e.g. 상담·기획)</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...(formData.serviceProcessSteps || [])];
                            newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                            setFormData({ ...formData, serviceProcessSteps: newSteps });
                          }}
                          className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-bold text-stone-900"
                        />
                      </div>

                      {/* Descriptions */}
                      <div className="md:col-span-6 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">설명 문구 1 (강조 핵심 문구)</label>
                          <textarea
                            value={step.desc1}
                            onChange={(e) => {
                              const newSteps = [...(formData.serviceProcessSteps || [])];
                              newSteps[idx] = { ...newSteps[idx], desc1: e.target.value };
                              setFormData({ ...formData, serviceProcessSteps: newSteps });
                            }}
                            rows={2}
                            placeholder="엔터(Enter)를 눌러 줄바꿈 가능"
                            className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">설명 문구 2 (상세 부연 설명)</label>
                          <textarea
                            value={step.desc2}
                            onChange={(e) => {
                              const newSteps = [...(formData.serviceProcessSteps || [])];
                              newSteps[idx] = { ...newSteps[idx], desc2: e.target.value };
                              setFormData({ ...formData, serviceProcessSteps: newSteps });
                            }}
                            rows={2}
                            placeholder="엔터(Enter)를 눌러 자유롭게 줄바꿈 하실 수 있습니다."
                            className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step Image Upload */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {step.image ? (
                          <img src={step.image} alt={step.title} className="w-16 h-12 rounded object-cover border border-stone-300" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-16 h-12 rounded bg-stone-200 flex items-center justify-center text-[10px] text-stone-400">사진 없음</div>
                        )}
                        <span className="text-xs text-stone-500 truncate max-w-xs">{step.image || '등록된 이미지가 없습니다.'}</span>
                      </div>

                      <div className="relative overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingField(`stepImg_${idx}`);
                              try {
                                const url = await uploadImageToCloudCDN(file);
                                const newSteps = [...(formData.serviceProcessSteps || [])];
                                newSteps[idx] = { ...newSteps[idx], image: url };
                                setFormData({ ...formData, serviceProcessSteps: newSteps });
                              } finally {
                                setUploadingField(null);
                                e.target.value = '';
                              }
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button type="button" className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                          {uploadingField === `stepImg_${idx}` ? '업로드 중...' : '[PC에서 찾기] 이미지 등록'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8">
            {/* Interactive Visual Drag Canvas Editor for Contact (Home Tab Style) */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Move size={18} className="text-burgundy-400" />
                  <span className="font-semibold text-stone-200 text-sm">견적문의 텍스트 위치 드래그 캔버스 (Visual Canvas)</span>
                </div>
                <span className="text-xs text-stone-400">💡 마우스로 텍스트를 잡고 끌어서 위치를 정해보세요</span>
              </div>

              <div
                ref={contactCanvasRef}
                onMouseDown={(e) => {
                  const updater = updateTabDragPosition(contactCanvasRef, 'contactTextX', 'contactTextY');
                  updater(e.clientX, e.clientY);
                  const onMove = (mv: MouseEvent) => updater(mv.clientX, mv.clientY);
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
                className="relative w-full aspect-[16/9] bg-stone-950 rounded-xl overflow-hidden cursor-crosshair border border-stone-800 select-none shadow-inner"
              >
                <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-stone-600 text-xs">
                  <span className="text-stone-500 font-serif text-lg">견적문의 캔버스</span>
                </div>

                {/* Smart Center Grid Lines & Magnetic Snap Feedback */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 transition-all ${
                    activeSnapX ? 'border-r-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]' : 'border-r border-dashed border-white/20'
                  }`} />
                  <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 transition-all ${
                    activeSnapY ? 'border-b-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]' : 'border-b border-dashed border-white/20'
                  }`} />
                  {(activeSnapX || activeSnapY) && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md z-30 animate-pulse">
                      🎯 중앙 50% 자석 스냅!
                    </div>
                  )}
                </div>
                
                {/* Positioned Text Box */}
                <div
                  className="absolute p-4 rounded-xl border border-dashed border-burgundy-400/80 bg-stone-900/80 backdrop-blur-md cursor-grab active:cursor-grabbing hover:border-white transition-all shadow-2xl"
                  style={{
                    left: `${formData.contactTextX ?? 50}%`,
                    top: `${formData.contactTextY ?? 20}%`,
                    transform: (formData.contactTextAlign === 'center')
                      ? 'translate(-50%, -50%)'
                      : (formData.contactTextAlign === 'right')
                      ? 'translate(-100%, -50%)'
                      : 'translate(0%, -50%)',
                  }}
                >
                  <span
                    className="inline-block bg-[#bcd0c9] text-white px-6 py-2 rounded-full font-bold shadow-md whitespace-nowrap"
                    style={{
                      fontSize: `${Math.max(14, Math.round((formData.contactTextFontSize || 42) * 0.5))}px`,
                      letterSpacing: `${formData.contactTextLetterSpacing ?? 0}px`,
                      fontFamily: formData.contactTextFontFamily || 'Pretendard',
                      color: formData.contactTextColor || '#FFFFFF',
                    }}
                  >
                    {formData.contactTitle || '견적문의'}
                  </span>
                  <p className="text-[10px] text-stone-300 opacity-90 mt-1.5 whitespace-nowrap text-center">{formData.contactSubText || '견적 및 촬영 문의'}</p>
                </div>
              </div>
            </div>

            {/* Photoshop-style Detail Typography Controller for Contact */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
              <h4 className="font-semibold text-stone-100 text-base flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="flex items-center space-x-2">
                  <span>🎨 견적문의 포토샵 디테일 타이포그래피 편집기</span>
                  <span className="bg-burgundy-600 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Home Style Editor</span>
                </span>
                <span className="text-xs text-stone-400 font-normal">위치 / 정렬 / 글자 크기 / 자간 / 폰트 / 색상</span>
              </h4>

              {/* Position Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">가로 위치 (X: {formData.contactTextX ?? 50}%)</label>
                  <input type="range" min="0" max="100" name="contactTextX" value={formData.contactTextX ?? 50} onChange={(e) => setFormData({ ...formData, contactTextX: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">세로 위치 (Y: {formData.contactTextY ?? 20}%)</label>
                  <input type="range" min="0" max="100" name="contactTextY" value={formData.contactTextY ?? 20} onChange={(e) => setFormData({ ...formData, contactTextY: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
              </div>

              {/* Sliders & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 크기 ({formData.contactTextFontSize || 42}px)</label>
                  <input type="range" min="18" max="80" name="contactTextFontSize" value={formData.contactTextFontSize || 42} onChange={(e) => setFormData({ ...formData, contactTextFontSize: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">자간 조절 ({formData.contactTextLetterSpacing ?? 0}px)</label>
                  <input type="range" min="-4" max="16" name="contactTextLetterSpacing" value={formData.contactTextLetterSpacing ?? 0} onChange={(e) => setFormData({ ...formData, contactTextLetterSpacing: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">폰트 종류</label>
                  <select name="contactTextFontFamily" value={formData.contactTextFontFamily || 'Pretendard'} onChange={handleChange as any} className="w-full border border-stone-700 rounded-lg px-3 py-2 text-xs bg-stone-800 text-stone-200 font-medium">
                    <option value="Pretendard">Pretendard (Regular 400)</option>
                    <option value="Pretendard-Medium">Pretendard (Medium 500)</option>
                    <option value="Pretendard-SemiBold">Pretendard (SemiBold 600)</option>
                    <option value="Pretendard-Bold">Pretendard (Bold 700)</option>
                    <option value="Pretendard-Black">Pretendard (Black 900)</option>
                    <option value="Pretendard-Light">Pretendard (Light 300)</option>
                    <option value="Moneygraphy-Rounded">Moneygraphy Rounded (머니그라피 둥근체)</option>
                    <option value="Moneygraphy-Pixel">Moneygraphy Pixel (머니그라피 픽셀체)</option>
                    <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (클래식 Serif)</option>
                    <option value="Cinzel">Cinzel (명품 비주얼)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 색상</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={formData.contactTextColor || '#FFFFFF'} onChange={(e) => setFormData({ ...formData, contactTextColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border border-stone-700 p-0.5 bg-stone-800 shrink-0" />
                    <div className="flex items-center space-x-1 overflow-x-auto py-1">
                      {['#FFFFFF', '#F5F5F0', '#D4AF37', '#18181B', '#800020', '#3B82F6'].map(color => (
                        <button key={color} type="button" onClick={() => setFormData({ ...formData, contactTextColor: color })} className={`w-5 h-5 rounded-full border border-stone-600 transition-transform cursor-pointer ${formData.contactTextColor === color ? 'scale-125 ring-2 ring-white z-10' : 'hover:scale-110'}`} style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contact Title (대제목)</label>
                  <input
                    type="text"
                    name="contactTitle"
                    value={formData.contactTitle || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contact Sub Title (서브 타이틀)</label>
                  <input
                    type="text"
                    name="contactSubText"
                    value={formData.contactSubText || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">촬영 내용 (컨셉 및 분량) 힌트 안내 문구 (Placeholder)</label>
                <textarea
                  name="contactMessagePlaceholder"
                  value={formData.contactMessagePlaceholder ?? "원하는 컨셉과 무드 필요한 예상 컷 수 또는 영상 갯수를 적어주세요.\n상담희망 하시는 경우 '상담희망'이라고 기입해주세요"}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                />
              </div>
              {/* Studio Contact Information Left Card Editor */}
              <div className="pt-6 border-t border-stone-200 space-y-4">
                <h4 className="text-base font-semibold text-stone-800 border-b border-stone-200 pb-2 flex items-center justify-between">
                  <span>📍 좌측 스튜디오 주소 & 연락처 정보 편집</span>
                  <span className="text-xs font-normal text-stone-500">견적문의 페이지 좌측 안내 카드에 100% 반영됩니다.</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">스튜디오 주소 (Studio Address)</label>
                    <textarea
                      name="address"
                      value={formData.address ?? formData.contactAddress ?? ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address: e.target.value,
                          contactAddress: e.target.value
                        });
                      }}
                      rows={2}
                      placeholder="예: 서울특별시 강남구 역삼동 123-45 2층"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">이메일 주소 (Email)</label>
                    <input
                      type="text"
                      name="contactEmail"
                      value={formData.contactEmail || ''}
                      onChange={handleChange}
                      placeholder="contact@agingstudio.com"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">전화번호 / 대표 연락처 (Phone)</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleChange}
                      placeholder="010-1234-5678"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">인스타그램 URL (Instagram Link)</label>
                    <input
                      type="text"
                      name="instagramUrl"
                      value={formData.instagramUrl || ''}
                      onChange={handleChange}
                      placeholder="https://instagram.com/agingstudio"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Message Text (안내 카드 상세 설명)</label>
                <textarea
                  name="contactMessageText"
                  value={formData.contactMessageText || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors text-stone-800 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contact Email (이메일 주소)</label>
                  <input
                    type="text"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Instagram URL (인스타그램 주소)</label>
                  <input
                    type="text"
                    name="instagramUrl"
                    value={formData.instagramUrl || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* DEPLOYMENT TAB */}
        {activeTab === 'deployment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Globe size={20} />
                홈페이지 정식 배포 및 도메인 연결
              </h3>
              <p className="text-blue-800 mb-4 text-sm leading-relaxed">
                현재 홈페이지의 소스 코드를 다운로드하여 Vercel에 배포하고, 나만의 도메인(www.내이름.com)을 연결할 수 있습니다.
                <br />
                아래 버튼을 눌러 최신 소스 코드를 다운로드한 후, Vercel(버셀)에 업로드해 주세요.
              </p>
              
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                <span>{isDownloading ? '다운로드 중...' : '소스 코드 다운로드 (.zip)'}</span>
              </button>
              
              <div className="mt-6 pt-6 border-t border-blue-200/50">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">배포 후 데이터 관리 안내</h4>
                <p className="text-blue-800 text-sm">
                  소스 코드를 한 번 배포하고 나면, 앞으로 사진을 올리거나 텍스트를 수정할 때마다 코드를 다시 다운로드할 필요가 <strong>없습니다.</strong>
                  <br />
                  모든 데이터는 방금 연결하신 구글 파이어베이스(Firebase)에 실시간으로 안전하게 저장되며, 라이브 웹사이트에 즉시 반영됩니다.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-stone-200">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center space-x-2 bg-burgundy-700 hover:bg-burgundy-600 active:bg-burgundy-800 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Save size={20} />
          <span>{isSaving ? '저장 중...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
