import React, { useState } from 'react';
import { useCMS, SiteSettings } from '../../store/CMSContext';
import { motion } from 'motion/react';
import { Save, Home, Image as ImageIcon, Info, Phone, Palette, Download, Globe } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

export default function Settings() {
  const { settings, updateSettings } = useCMS();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 2K resolution (2560px), quality 0.6 to stay under Firestore 1MB limit for the settings doc
        const compressedBase64 = await compressImage(file, 2560, 1800, 0.6);
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
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'appearance', label: 'Appearance', icon: Palette },
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
              <label className="block text-sm font-medium text-stone-700 mb-2">Site Name</label>
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
              <p className="text-[10px] text-stone-400 mt-2">* 팁: 배경이 투명한 PNG 형식의 가로형 로고(높이 60px 내외)를 권장합니다.</p>
              {formData.logoUrl && (
                <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200 flex justify-center items-center">
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Background Image</label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  name="heroImage"
                  value={formData.heroImage || ''}
                  onChange={handleChange}
                  className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  placeholder="https://example.com/image.jpg"
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
              <p className="text-[10px] text-stone-400 mt-2">* 고화질 팁: 메인 배경은 2560px(2K) 이상의 고해상도 사진을 권장합니다.</p>
              {formData.heroImage && (
                <div className="mt-4 w-full h-48 rounded-lg overflow-hidden border border-stone-200">
                  <img src={formData.heroImage} alt="Hero Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Main Text</label>
              <input
                type="text"
                name="heroText"
                value={formData.heroText}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Sub Text</label>
              <textarea
                name="heroSubText"
                value={formData.heroSubText}
                onChange={handleChange}
                rows={2}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>
            
            {/* 메인 플로팅 누끼 이미지 관리 */}
            <div className="pt-6 border-t border-stone-200 space-y-6">
              <div>
                <label className="block text-base font-bold text-stone-900 mb-1">메인 플로팅 누끼 이미지 배치 설정 (여러 장)</label>
                <p className="text-xs text-stone-500">* 메인 화면의 여백에 둥실둥실 배치할 누끼 컷들을 올리고 각 기기의 위치 및 크기를 조절할 수 있습니다.</p>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="relative overflow-hidden flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNukiImagesUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button type="button" className="w-full bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-800 border border-burgundy-200/50 py-3 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-sm">
                      <span>누끼 이미지 파일 추가 (PNG 추천)</span>
                    </button>
                  </div>
                </div>

                {formData.heroNukiConfigs && formData.heroNukiConfigs.length > 0 ? (
                  <div className="space-y-6">
                    {/* 실시간 위치 미니맵 보드 */}
                    <div className="border border-stone-200 rounded-xl overflow-hidden shadow-inner">
                      <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex justify-between items-center text-xs font-semibold text-stone-500">
                        <span>실시간 배치 미니맵 (가로 100% * 세로 50vh 비율)</span>
                        <span className="text-burgundy-700">점선 영역 = 메인 텍스트 영역 (피해서 배치하세요!)</span>
                      </div>
                      
                      <div className="relative w-full aspect-[2/1] bg-gradient-to-tr from-ivory-200 via-white to-ivory-100 overflow-hidden select-none">
                        {/* Apple-style floating blurred circles (mock) */}
                        <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-burgundy-100/30 rounded-full filter blur-xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-ivory-300/40 rounded-full filter blur-xl" />
                        
                        {/* Mock Text Area */}
                        <div className="absolute inset-x-[20%] top-[30%] bottom-[30%] border-2 border-dashed border-burgundy-900/10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-[2px] z-20">
                          <span className="text-[10px] md:text-xs font-serif text-stone-900 font-semibold tracking-wider select-none">TEXT AREA</span>
                        </div>

                        {/* Rendering config objects dynamically */}
                        {formData.heroNukiConfigs.map((config, idx) => (
                          <div
                            key={idx}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${config.left}%`,
                              top: `${config.top}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `${(config.size / 300) * 100}%` // scale based on board width
                            }}
                          >
                            <img
                              src={config.url}
                              alt={`Nuki ${idx + 1}`}
                              className="w-full h-auto object-contain mix-blend-multiply drop-shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-0 left-0 bg-burgundy-800 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              #{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 개별 이미지 편집 슬라이더 리스트 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.heroNukiConfigs.map((config, idx) => (
                        <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="bg-burgundy-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              이미지 #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNukiImage(idx)}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                            >
                              삭제
                            </button>
                          </div>

                          <div className="flex space-x-3 items-center">
                            <div className="w-16 h-16 bg-white border border-stone-200 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                              <img src={config.url} alt={`Thumb ${idx + 1}`} className="max-h-full max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              {/* Left X좌표 */}
                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-medium text-stone-500 w-12">가로 (X):</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={config.left}
                                  onChange={(e) => handleNukiConfigChange(idx, 'left', parseInt(e.target.value))}
                                  className="flex-1 accent-burgundy-800 h-1 bg-stone-200 rounded-lg cursor-pointer"
                                />
                                <span className="text-[11px] font-semibold text-stone-700 w-8 text-right">{config.left}%</span>
                              </div>
                              
                              {/* Top Y좌표 */}
                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-medium text-stone-500 w-12">세로 (Y):</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={config.top}
                                  onChange={(e) => handleNukiConfigChange(idx, 'top', parseInt(e.target.value))}
                                  className="flex-1 accent-burgundy-800 h-1 bg-stone-200 rounded-lg cursor-pointer"
                                />
                                <span className="text-[11px] font-semibold text-stone-700 w-8 text-right">{config.top}%</span>
                              </div>
                              
                              {/* Size 크기 */}
                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-medium text-stone-500 w-12">크기 (W):</span>
                                <input
                                  type="range"
                                  min="50"
                                  max="300"
                                  value={config.size || 120}
                                  onChange={(e) => handleNukiConfigChange(idx, 'size', parseInt(e.target.value))}
                                  className="flex-1 accent-burgundy-800 h-1 bg-stone-200 rounded-lg cursor-pointer"
                                />
                                <span className="text-[11px] font-semibold text-stone-700 w-8 text-right">{config.size || 120}px</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 text-stone-400 text-xs">
                    등록된 플로팅 이미지가 없습니다. (비어있을 경우 카메라와 렌즈 이미지가 화면 좌우에 기본값으로 표시됩니다.)
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-semibold text-stone-800 mb-4">Footer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Footer Title</label>
                  <input
                    type="text"
                    name="footerTitle"
                    value={formData.footerTitle || ''}
                    onChange={handleChange}
                    placeholder="e.g. aging studio"
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Footer Text</label>
                  <textarea
                    name="footerText"
                    value={formData.footerText || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-semibold text-stone-800 mb-4">Home Page Sections</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showHomeAbout !== false}
                    onChange={(e) => setFormData({ ...formData, showHomeAbout: e.target.checked })}
                    className="w-5 h-5 text-burgundy-600 border-stone-300 rounded focus:ring-burgundy-500"
                  />
                  <span className="text-sm font-medium text-stone-700">Show "The Studio" section on Home page</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Portfolio Section Title</label>
                  <input
                    type="text"
                    name="homePortfolioTitle"
                    value={formData.homePortfolioTitle || ''}
                    onChange={handleChange}
                    placeholder="e.g. Selected Works"
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Portfolio Page Title</label>
              <input
                type="text"
                name="portfolioTitle"
                value={formData.portfolioTitle || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Portfolio Sub Text</label>
              <input
                type="text"
                name="portfolioSubText"
                value={formData.portfolioSubText || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
          </motion.div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">About Image</label>
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
              {formData.aboutImage && (
                <div className="mt-4 w-48 h-64 rounded-lg overflow-hidden border border-stone-200">
                  <img src={formData.aboutImage} alt="About Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">About Title</label>
              <input
                type="text"
                name="aboutTitle"
                value={formData.aboutTitle || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">About Sub Title</label>
              <input
                type="text"
                name="aboutSubText"
                value={formData.aboutSubText || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Paragraph 1</label>
              <textarea
                name="aboutText"
                value={formData.aboutText || ''}
                onChange={handleChange}
                rows={3}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Paragraph 2</label>
              <textarea
                name="aboutText2"
                value={formData.aboutText2 || ''}
                onChange={handleChange}
                rows={3}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Paragraph 3</label>
              <textarea
                name="aboutText3"
                value={formData.aboutText3 || ''}
                onChange={handleChange}
                rows={3}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>

            <div className="pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Philosophy Section</h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPhilosophy !== false}
                    onChange={(e) => setFormData({ ...formData, showPhilosophy: e.target.checked })}
                    className="w-5 h-5 text-burgundy-600 border-stone-300 rounded focus:ring-burgundy-500"
                  />
                  <span className="text-sm font-medium text-stone-700">Show Philosophy Section</span>
                </label>
              </div>

              {formData.showPhilosophy !== false && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Philosophy Title</label>
                    <input
                      type="text"
                      name="philosophyTitle"
                      value={formData.philosophyTitle || ''}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Philosophy Item 1</label>
                    <input
                      type="text"
                      name="philosophyItem1"
                      value={formData.philosophyItem1 || ''}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Philosophy Item 2</label>
                    <input
                      type="text"
                      name="philosophyItem2"
                      value={formData.philosophyItem2 || ''}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Philosophy Item 3</label>
                    <input
                      type="text"
                      name="philosophyItem3"
                      value={formData.philosophyItem3 || ''}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Page Title</label>
                <input
                  type="text"
                  name="contactTitle"
                  value={formData.contactTitle || ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Sub Text</label>
                <input
                  type="text"
                  name="contactSubText"
                  value={formData.contactSubText || ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Message Title</label>
              <input
                type="text"
                name="contactMessageTitle"
                value={formData.contactMessageTitle || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Message Text</label>
              <textarea
                name="contactMessageText"
                value={formData.contactMessageText || ''}
                onChange={handleChange}
                rows={3}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Studio Address</label>
              <textarea
                name="contactAddress"
                value={formData.contactAddress || ''}
                onChange={handleChange}
                rows={2}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Instagram URL</label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div className="pt-4 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-2">Web3Forms Access Key (이메일 자동 발송용 키)</label>
              <input
                type="text"
                name="web3FormsKey"
                value={formData.web3FormsKey || ''}
                onChange={handleChange}
                placeholder="예: 1234abcd-1234-abcd-1234-abcd1234abcd"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors font-mono text-sm"
              />
              <div className="mt-3 bg-stone-50 border border-stone-200 rounded-lg p-4 text-xs text-stone-600 leading-relaxed">
                <p className="font-semibold text-stone-700 mb-1">💡 웹사이트에서 견적 문의 메일을 받는 방법:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li><a href="https://web3forms.com/" target="_blank" rel="noopener noreferrer" className="text-burgundy-700 underline font-medium hover:text-burgundy-600">Web3Forms 홈페이지</a>에 접속합니다.</li>
                  <li>견적 문의를 받을 <strong>본인의 이메일 주소</strong>를 입력하고 Access Key를 신청합니다.</li>
                  <li>입력한 이메일로 즉시 발송되는 <strong>Access Key</strong>를 복사하여 위 입력란에 붙여넣고 저장하세요.</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Theme Color</label>
                <select
                  name="themeColor"
                  value={formData.themeColor || 'ivory'}
                  onChange={handleChange as any}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white"
                >
                  <option value="ivory">Ivory (Default)</option>
                  <option value="white">Minimal White</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Accent Color</label>
                <select
                  name="accentColor"
                  value={formData.accentColor || 'burgundy'}
                  onChange={handleChange as any}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors bg-white"
                >
                  <option value="burgundy">Burgundy (Default)</option>
                  <option value="gold">Gold</option>
                  <option value="forest">Forest Green</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-2">Heading Font (제목 폰트)</label>
              <select
                name="headingFont"
                value={formData.headingFont || 'Playfair Display'}
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
                value={formData.bodyFont || 'Inter'}
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
