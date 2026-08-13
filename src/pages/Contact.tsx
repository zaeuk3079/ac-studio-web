import React, { useState } from 'react';
import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, MessageCircle, Send } from 'lucide-react';

export default function Contact() {
  const { settings } = useCMS();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(''); // 희망 일정
  const [budget, setBudget] = useState(''); // 촬영 예산
  const [message, setMessage] = useState(''); // 촬영 목적 및 내용 (자유 서술)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getInstagramHandle = (url: string) => {
    if (!url) return '@puffstudio';
    const parts = url.split('/').filter(Boolean);
    const handle = parts[parts.length - 1];
    return handle ? `@${handle}` : '@puffstudio';
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
          subject: `[상담 문의] ${name}님 - 촬영 문의`,
          from_name: name,
          name,
          phone,
          email,
          category: 'INQUIRY',
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
    <div className="min-h-screen pt-12 pb-24 transition-colors duration-500 text-white" style={{ backgroundColor: settings.contactBgColor || '#0B0C10' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">{settings.contactSubText || 'Contact'}</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mt-2">{settings.contactTitle || '견적문의'}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Service intro + Contact info (Left Side) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 p-12 rounded-2xl shadow-sm border border-white/10 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-serif text-3xl text-white mb-8">{settings.contactMessageTitle}</h2>
              <p className="text-stone-400 font-light leading-relaxed mb-12 whitespace-pre-line">
                {settings.contactMessageText}
              </p>

              {settings.kakaoChannelUrl && (
                <a
                  href={settings.kakaoChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-[#FEE500] hover:brightness-95 text-[#191919] font-bold tracking-wide py-3.5 rounded-xl transition-all duration-300 shadow-sm mb-12"
                >
                  <MessageCircle size={18} />
                  <span>카카오톡 채널로 문의하기</span>
                </a>
              )}

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-lime-300/10 p-3 rounded-full text-lime-300">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-white mb-1">Phone</h3>
                    <p className="text-stone-400 font-light">{settings.contactPhone || '010-1234-5678'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-lime-300/10 p-3 rounded-full text-lime-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-white mb-1">Email</h3>
                    <p className="text-stone-400 font-light">{settings.contactEmail || 'contact@puffstudio.com'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-lime-300/10 p-3 rounded-full text-lime-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-white mb-1">Studio Address</h3>
                    <p className="text-stone-400 font-light whitespace-pre-line">
                      {settings.address || settings.contactAddress || '서울특별시 강남구 역삼동 스튜디오'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-lime-300/10 p-3 rounded-full text-lime-300">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-white mb-1">Instagram</h3>
                    <a href={settings.instagramUrl || 'https://instagram.com/puffstudio'} target="_blank" rel="noopener noreferrer" className="text-stone-400 font-light hover:text-lime-300 transition-colors">
                      {getInstagramHandle(settings.instagramUrl || 'https://instagram.com/puffstudio')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Consultation Form (Right Side) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 p-10 md:p-12 rounded-2xl shadow-sm border border-white/10 w-full"
          >
            <h2 className="font-serif text-3xl text-white mb-2">상담 신청</h2>
            <p className="text-stone-400 font-light text-sm mb-8 leading-relaxed">
              원하시는 촬영 조건과 목적을 기재해 주시면, 검토 후 이메일 또는 연락처로 신속히 안내해 드리겠습니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">이름 / 브랜드명 <span className="text-lime-300">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동 (또는 puff studio)"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">연락처 <span className="text-lime-300">*</span></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">이메일 주소 <span className="text-lime-300">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">희망 일정</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="대략적으로"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">예산</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="예: 50만원 선, 협의 가능"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-stone-300 mb-2">촬영 목적 및 내용 <span className="text-lime-300">*</span></label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={settings.contactMessagePlaceholder || "촬영 목적(SNS 컨텐츠, 상세페이지, 숏폼 등)과 원하는 컨셉, 필요한 예상 컷 수/영상 갯수를 자유롭게 적어주세요.\n상담을 먼저 원하시면 '상담희망'이라고 남겨주셔도 됩니다."}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-stone-500 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-lime-300/30 focus:border-lime-300/50 transition-colors resize-none leading-relaxed"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-sm text-center">
                  ✨ 상담 신청이 성공적으로 접수되었습니다. 지정하신 메일/연락처로 곧 연락해 드리겠습니다!
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm text-center">
                  ⚠️ 문의 발송 중 문제가 발생했습니다. 번거로우시겠지만 관리자 이메일({settings.contactEmail})로 직접 발송해 주세요.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-accent-bg hover:brightness-105 disabled:opacity-50 text-ink-950 font-bold tracking-widest uppercase py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer border-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-ink-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>상담 신청하기</span>
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
