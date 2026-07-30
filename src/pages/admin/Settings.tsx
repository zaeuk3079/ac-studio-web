import React, { useState, useRef, useEffect } from 'react';
import { useCMS, SiteSettings } from '../../store/CMSContext';
import { motion } from 'motion/react';
import { Save, Home, Image as ImageIcon, Info, Phone, Palette, Download, Globe, Layers, Move, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

export default function Settings() {
  const { settings, updateSettings } = useCMS();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);

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
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!bannerContainerRef.current) return;
    const rect = bannerContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setFormData(prev => ({
      ...prev,
      heroTextX: Math.round(x),
      heroTextY: Math.round(y)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean up truly unused large fields (nuki) to stay under Firestore limits, preserving heroImage
      const cleanedData = {
        ...formData,
        heroNukiImages: [],
        heroNukiConfigs: []
      };
      
      await updateSettings(cleanedData);
      setFormData(cleanedData);
      alert('설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('Settings save error:', error);
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
      try {
        // High Quality Ultra HD (2560px, quality 0.88) for crisp, clear visual sharpness
        const compressedBase64 = await compressImage(file, 2560, 1800, 0.88);
        setFormData({ ...formData, [fieldName]: compressedBase64 });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
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
              <label className="block text-sm font-medium text-stone-700 mb-2">Site Logo (로고 이미지)</label>
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
                    PC에서 찾기
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">* 팁: 배경이 투명한 PNG 형식의 로고를 권장하며, 업로드 시 투명도가 보존됩니다.</p>
              {formData.logoUrl && (
                <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200 flex justify-center items-center">
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

            {/* Main Banner (Hero Visual) Settings */}
            <div className="pt-6 border-t border-stone-200 space-y-6">
              <h3 className="text-base font-semibold text-stone-800">Main Banner (메인 비주얼 배너 16:9)</h3>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Main Banner Image (16:9 가로 비주얼 이미지)</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    name="heroImage"
                    value={formData.heroImage || ''}
                    onChange={handleChange}
                    className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <div className="relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button type="button" className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-lg font-medium transition-colors h-full whitespace-nowrap">
                      PC에서 찾기
                    </button>
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
                        <option value="Pretendard">Pretendard (산세리프)</option>
                        <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                        <option value="Cormorant Garamond">Cormorant Garamond (클래식 Serif)</option>
                        <option value="Cinzel">Cinzel (명품 비주얼)</option>
                        <option value="Inter">Inter (모던 Sans)</option>
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
                        <option value="Pretendard">Pretendard (산세리프)</option>
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair Display</option>
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
            {/* Photoshop-style Detail Typography Controller for About - Placed AT TOP */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
              <h4 className="font-semibold text-stone-100 text-base flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="flex items-center space-x-2">
                  <span>🎨 About 타이틀 포토샵 디테일 편집기</span>
                  <span className="bg-burgundy-600 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Live Editor</span>
                </span>
                <span className="text-xs text-stone-400 font-normal">글자 크기 / 자간 / 폰트 / 정렬 / 색상</span>
              </h4>
              
              {/* Text Alignment */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">글자 정렬 (Text Alignment)</label>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'left' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${(!formData.aboutTextAlign || formData.aboutTextAlign === 'left') ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignLeft size={16} /><span>왼쪽 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'center' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.aboutTextAlign === 'center' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignCenter size={16} /><span>가운데 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, aboutTextAlign: 'right' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.aboutTextAlign === 'right' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignRight size={16} /><span>오른쪽 정렬</span></button>
                </div>
              </div>

              {/* Sliders & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 크기 ({formData.aboutTextFontSize || 42}px)</label>
                  <input type="range" min="18" max="80" name="aboutTextFontSize" value={formData.aboutTextFontSize || 42} onChange={(e) => setFormData({ ...formData, aboutTextFontSize: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">자간 조절 ({formData.aboutTextLetterSpacing ?? 0}px)</label>
                  <input type="range" min="-4" max="16" name="aboutTextLetterSpacing" value={formData.aboutTextLetterSpacing ?? 0} onChange={(e) => setFormData({ ...formData, aboutTextLetterSpacing: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">폰트 종류</label>
                  <select name="aboutTextFontFamily" value={formData.aboutTextFontFamily || 'Pretendard'} onChange={handleChange as any} className="w-full border border-stone-700 rounded-lg px-3 py-2 text-xs bg-stone-800 text-stone-200 font-medium">
                    <option value="Pretendard">Pretendard (산세리프)</option>
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

            {/* Live Preview Box */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-3">
                <span className="font-semibold text-stone-200">✨ About 페이지 실시간 라이브 미리보기 (Live Preview)</span>
                <span>실제 웹사이트 노출 모습</span>
              </div>
              <div className="bg-ivory-100 text-stone-900 p-6 rounded-xl border border-stone-200 shadow-inner max-h-[420px] overflow-y-auto space-y-6">
                <div className="text-center">
                  <h1
                    className="font-bold mb-2"
                    style={{
                      fontSize: `${Math.max(16, Math.round((formData.aboutTextFontSize || 42) * 0.65))}px`,
                      letterSpacing: `${formData.aboutTextLetterSpacing ?? 0}px`,
                      fontFamily: formData.aboutTextFontFamily || 'Pretendard',
                      textAlign: (formData.aboutTextAlign || 'center') as any,
                      color: formData.aboutTextColor || '#1C1917',
                    }}
                  >
                    {formData.aboutTitle || 'About Us'}
                  </h1>
                  <p className="text-stone-500 text-xs uppercase tracking-widest">{formData.aboutSubText}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {formData.aboutImage && (
                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-md">
                      <img src={formData.aboutImage} alt="About Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="space-y-3 text-xs leading-relaxed text-stone-600 font-light">
                    {formData.aboutText && <p>{formData.aboutText}</p>}
                    {formData.aboutText2 && <p>{formData.aboutText2}</p>}
                    {formData.aboutText3 && <p>{formData.aboutText3}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">About Image (소개 대표 이미지)</label>
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
                  <input
                    type="text"
                    name="aboutSubText"
                    value={formData.aboutSubText || ''}
                    onChange={handleChange}
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
            {/* Photoshop-style Detail Typography Controller for Service - Placed AT TOP */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
              <h4 className="font-semibold text-stone-100 text-base flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="flex items-center space-x-2">
                  <span>🎨 Service 타이틀 포토샵 디테일 편집기</span>
                  <span className="bg-burgundy-600 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Live Editor</span>
                </span>
                <span className="text-xs text-stone-400 font-normal">글자 크기 / 자간 / 폰트 / 정렬 / 색상</span>
              </h4>
              
              {/* Text Alignment */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">글자 정렬 (Text Alignment)</label>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setFormData({ ...formData, serviceTextAlign: 'left' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${(!formData.serviceTextAlign || formData.serviceTextAlign === 'left') ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignLeft size={16} /><span>왼쪽 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, serviceTextAlign: 'center' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.serviceTextAlign === 'center' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignCenter size={16} /><span>가운데 정렬</span></button>
                  <button type="button" onClick={() => setFormData({ ...formData, serviceTextAlign: 'right' })} className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${formData.serviceTextAlign === 'right' ? 'bg-white text-stone-900 border-white shadow-md font-bold' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}><AlignRight size={16} /><span>오른쪽 정렬</span></button>
                </div>
              </div>

              {/* Sliders & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 크기 ({formData.serviceTextFontSize || 42}px)</label>
                  <input type="range" min="18" max="80" name="serviceTextFontSize" value={formData.serviceTextFontSize || 42} onChange={(e) => setFormData({ ...formData, serviceTextFontSize: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">자간 조절 ({formData.serviceTextLetterSpacing ?? 0}px)</label>
                  <input type="range" min="-4" max="16" name="serviceTextLetterSpacing" value={formData.serviceTextLetterSpacing ?? 0} onChange={(e) => setFormData({ ...formData, serviceTextLetterSpacing: Number(e.target.value) })} className="w-full accent-burgundy-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">폰트 종류</label>
                  <select name="serviceTextFontFamily" value={formData.serviceTextFontFamily || 'Pretendard'} onChange={handleChange as any} className="w-full border border-stone-700 rounded-lg px-3 py-2 text-xs bg-stone-800 text-stone-200 font-medium">
                    <option value="Pretendard">Pretendard (산세리프)</option>
                    <option value="Playfair Display">Playfair Display (고급 Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (클래식 Serif)</option>
                    <option value="Cinzel">Cinzel (명품 비주얼)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">글자 색상</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={formData.serviceTextColor || '#1C1917'} onChange={(e) => setFormData({ ...formData, serviceTextColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border border-stone-700 p-0.5 bg-stone-800 shrink-0" />
                    <div className="flex items-center space-x-1 overflow-x-auto py-1">
                      {['#1C1917', '#FFFFFF', '#D4AF37', '#800020', '#3B82F6'].map(color => (
                        <button key={color} type="button" onClick={() => setFormData({ ...formData, serviceTextColor: color })} className={`w-5 h-5 rounded-full border border-stone-600 transition-transform cursor-pointer ${formData.serviceTextColor === color ? 'scale-125 ring-2 ring-white z-10' : 'hover:scale-110'}`} style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-3">
                <span className="font-semibold text-stone-200">✨ Service 페이지 실시간 라이브 미리보기 (Live Preview)</span>
                <span>실제 웹사이트 노출 모습</span>
              </div>
              <div className="bg-white text-stone-900 p-6 rounded-xl border border-stone-200 shadow-inner space-y-6">
                <div className="text-center">
                  <h1
                    className="font-bold mb-1"
                    style={{
                      fontSize: `${Math.max(16, Math.round((formData.serviceTextFontSize || 42) * 0.65))}px`,
                      letterSpacing: `${formData.serviceTextLetterSpacing ?? 0}px`,
                      fontFamily: formData.serviceTextFontFamily || 'Pretendard',
                      textAlign: (formData.serviceTextAlign || 'center') as any,
                      color: formData.serviceTextColor || '#1C1917',
                    }}
                  >
                    {formData.serviceTitle || 'Our Services'}
                  </h1>
                  <p className="text-stone-500 text-xs uppercase tracking-widest">{formData.serviceSubText}</p>
                </div>
                {formData.serviceImage && (
                  <div className="w-full aspect-[16/10] rounded-none overflow-hidden shadow-sm">
                    <img src={formData.serviceImage} alt="Service Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">Service Process</h3>
                  <div className="bg-stone-50 p-4 rounded-xl text-xs text-stone-700 leading-relaxed whitespace-pre-line border border-stone-200/60 font-light">
                    {formData.serviceText2 || '촬영 진행 과정 안내 문구...'}
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center space-x-2 bg-[#5C4033] text-white px-5 py-2 rounded-full text-xs font-bold shadow">
                      <span>견적 문의하기 →</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Service Image (서비스 대표 16:9 이미지)</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    name="serviceImage"
                    value={formData.serviceImage || ''}
                    onChange={handleChange}
                    className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                  <div className="relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'serviceImage')}
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">Service Title (서비스 대제목)</label>
                  <input
                    type="text"
                    name="serviceTitle"
                    value={formData.serviceTitle || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Service Sub Title (서비스 서브 타이틀)</label>
                  <input
                    type="text"
                    name="serviceSubText"
                    value={formData.serviceSubText || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Service Process (촬영 진행 과정 상세 설명)</label>
                <textarea
                  name="serviceText2"
                  value={formData.serviceText2 || ''}
                  onChange={handleChange}
                  rows={6}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors text-stone-800 font-medium"
                  placeholder="예: 1. 사전 기획 및 미팅 ➡️ 2. 촬영 세팅 ➡️ 3. 본 촬영 ➡️ 4. 리터칭 ➡️ 5. 완성본 전달"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8">
            {/* Photoshop-style Detail Typography Controller for Contact - Placed AT TOP */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
              <h4 className="font-semibold text-stone-100 text-base flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="flex items-center space-x-2">
                  <span>🎨 견적문의 타이틀 포토샵 디테일 편집기</span>
                  <span className="bg-burgundy-600 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Live Editor</span>
                </span>
                <span className="text-xs text-stone-400 font-normal">글자 크기 / 자간 / 폰트 / 색상</span>
              </h4>
              
              {/* Sliders & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <option value="Pretendard">Pretendard (산세리프)</option>
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

            {/* Live Preview Box */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-3">
                <span className="font-semibold text-stone-200">✨ 견적문의 페이지 실시간 라이브 미리보기 (Live Preview)</span>
                <span>실제 웹사이트 노출 모습</span>
              </div>
              <div className="bg-ivory-100 text-stone-900 p-6 rounded-xl border border-stone-200 shadow-inner space-y-6">
                <div className="text-center">
                  <span
                    className="inline-block bg-[#5C4033] px-6 py-2 rounded-full font-bold shadow-md"
                    style={{
                      fontSize: `${Math.max(14, Math.round((formData.contactTextFontSize || 42) * 0.55))}px`,
                      letterSpacing: `${formData.contactTextLetterSpacing ?? 0}px`,
                      fontFamily: formData.contactTextFontFamily || 'Pretendard',
                      color: formData.contactTextColor || '#FFFFFF',
                    }}
                  >
                    {formData.contactTitle || '견적문의'}
                  </span>
                  <p className="text-stone-500 text-xs mt-2 uppercase tracking-wider">{formData.contactSubText || '견적 및 촬영 문의'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                    <h4 className="font-serif font-bold text-stone-900">{formData.contactMessageTitle || "Let's Create Together"}</h4>
                    <p className="text-stone-600 font-light leading-relaxed text-[11px]">{formData.contactMessageText}</p>
                    <div className="pt-2 space-y-1 text-stone-500 font-medium">
                      <p>📞 {formData.contactPhone}</p>
                      <p>✉️ {formData.contactEmail}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-full h-7 bg-stone-100 rounded border border-stone-200 text-[10px] px-2 flex items-center text-stone-400">성함 / 상호명</div>
                      <div className="w-full h-7 bg-stone-100 rounded border border-stone-200 text-[10px] px-2 flex items-center text-stone-400">연락처</div>
                    </div>
                    <button type="button" className="w-full bg-[#5C4033] text-white py-2 rounded-lg text-xs font-semibold mt-3">
                      견적 문의 제출하기
                    </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contact Message Title (안내 카드 제목)</label>
                  <input
                    type="text"
                    name="contactMessageTitle"
                    value={formData.contactMessageTitle || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contact Phone (전화번호)</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-medium text-stone-800"
                  />
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
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center space-x-2 bg-burgundy-700 hover:bg-burgundy-600 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-all ${
            isSaving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Save size={20} />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
