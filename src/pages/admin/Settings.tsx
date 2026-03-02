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
        const compressedBase64 = await compressImage(file, 1600, 900, 0.6); // Slightly smaller to avoid 1MB limit
        setFormData({ ...formData, [fieldName]: compressedBase64 });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
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
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Google Form URL (예약 폼)</label>
              <input
                type="url"
                name="googleFormUrl"
                value={formData.googleFormUrl || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Form Download URL (양식 다운로드 링크)</label>
              <input
                type="url"
                name="formDownloadUrl"
                value={formData.formDownloadUrl || ''}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              />
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
