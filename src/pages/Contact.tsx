import React, { useState } from 'react';
import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, FileText, Download, Send } from 'lucide-react';

export default function Contact() {
  const { settings } = useCMS();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState(''); // 촬영 목적 (SNS/상세페이지/숏츠 등)
  const [date, setDate] = useState(''); // 희망 일정
  const [budget, setBudget] = useState(''); // 촬영 예산
  const [message, setMessage] = useState(''); // 촬영 내용 (컨셉 및 분량)
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getInstagramHandle = (url: string) => {
    if (!url) return '@agingstudio';
    const parts = url.split('/').filter(Boolean);
    const handle = parts[parts.length - 1];
    return handle ? `@${handle}` : '@agingstudio';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Web3Forms 키 확인 (폴백 처리)
    if (!settings.web3FormsKey) {
      const confirmFallback = window.confirm(
        '온라인 문의 전송 키가 설정되지 않았습니다.\n기존의 구글 폼 신청 페이지로 이동하시겠습니까?'
      );
      if (confirmFallback && settings.googleFormUrl) {
        window.open(settings.googleFormUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: settings.web3FormsKey,
          subject: `[견적 문의] ${name}님 - 촬영 문의`,
          from_name: name,
          name,
          phone,
          email,
          category: 'INQUIRY',
          purpose,
          date,
          budget: budget || '협의/미정',
          message
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus('success');
        // Reset form
        setName('');
        setPhone('');
        setEmail('');
        setPurpose('');
        setDate('');
        setBudget('');
        setMessage('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-[#0a4416] px-10 py-3.5 rounded-full mb-6 shadow-lg border border-[#0e5c1d]/50 font-bold text-white"
            style={{
              fontSize: settings.contactTextFontSize ? `${settings.contactTextFontSize}px` : undefined,
              letterSpacing: settings.contactTextLetterSpacing !== undefined ? `${settings.contactTextLetterSpacing}px` : undefined,
              fontFamily: settings.contactTextFontFamily || 'Pretendard',
              color: settings.contactTextColor || '#FFFFFF',
            }}
          >
            {settings.contactTitle === 'Contact' ? '견적문의' : (settings.contactTitle || '견적문의')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-stone-500 tracking-widest uppercase text-sm"
          >
            {settings.contactSubText}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info (Left Side) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-12 rounded-2xl shadow-sm border border-ivory-300 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-serif text-3xl text-stone-900 mb-8">{settings.contactMessageTitle}</h2>
              <p className="text-stone-600 font-light leading-relaxed mb-12">
                {settings.contactMessageText}
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-burgundy-50 p-3 rounded-full text-burgundy-700">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-1">Phone</h3>
                    <p className="text-stone-600 font-light">{settings.contactPhone}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-burgundy-50 p-3 rounded-full text-burgundy-700">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-1">Email</h3>
                    <p className="text-stone-600 font-light">{settings.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-burgundy-50 p-3 rounded-full text-burgundy-700">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-1">Studio</h3>
                    <p className="text-stone-600 font-light whitespace-pre-line">
                      {settings.contactAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-burgundy-50 p-3 rounded-full text-burgundy-700">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-1">Instagram</h3>
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-600 font-light hover:text-burgundy-600 transition-colors">
                      {getInstagramHandle(settings.instagramUrl)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Inquiry Form (Right Side) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-10 md:p-12 rounded-2xl shadow-sm border border-ivory-300 w-full"
          >
            <h2 className="font-serif text-3xl text-stone-900 mb-2">온라인 견적 문의</h2>
            <p className="text-stone-500 font-light text-sm mb-8 leading-relaxed">
              원하시는 촬영 조건과 목적을 기재해 주시면, 검토 후 이메일 또는 연락처로 신속히 견적 안내를 드리겠습니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">브랜드명 혹은 성함 <span className="text-burgundy-700">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동 (또는 에이징스튜디오)"
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">연락처 <span className="text-burgundy-700">*</span></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">이메일 주소 <span className="text-burgundy-700">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">희망 일정 <span className="text-burgundy-700">*</span></label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">촬영 예산</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="예: 50만원 선, 협의 가능"
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">촬영 목적 <span className="text-burgundy-700">*</span></label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="예: sns 컨텐츠, 상세페이지, 숏폼"
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">촬영 내용 (컨셉 및 분량) <span className="text-burgundy-700">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="촬영하고 싶으신 컨셉과 필요한 예상 컷 수 또는 영상 분량을 적어주세요."
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-sm text-center">
                  ✨ 견적 문의가 성공적으로 접수되었습니다. 지정하신 메일/연락처로 곧 연락해 드리겠습니다!
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg text-sm text-center">
                  ⚠️ 문의 발송 중 문제가 발생했습니다. 번거로우시겠지만 관리자 이메일({settings.contactEmail})로 직접 발송해 주세요.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0a4416] hover:bg-[#073310] disabled:bg-stone-300 text-white font-medium tracking-widest uppercase py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-[#0e5c1d]/50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>견적 문의 제출하기</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
