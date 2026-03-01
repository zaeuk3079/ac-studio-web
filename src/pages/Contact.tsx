import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, FileText, Download } from 'lucide-react';

export default function Contact() {
  const { settings } = useCMS();

  const getInstagramHandle = (url: string) => {
    if (!url) return '@agingstudio';
    const parts = url.split('/').filter(Boolean);
    const handle = parts[parts.length - 1];
    return handle ? `@${handle}` : '@agingstudio';
  };

  return (
    <div className="bg-ivory-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl text-burgundy-900 mb-6 tracking-tight"
          >
            {settings.contactTitle}
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
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-12 rounded-2xl shadow-sm border border-ivory-300"
          >
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
          </motion.div>

          {/* Booking Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* Google Form Link */}
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-ivory-300 text-center hover:shadow-md transition-shadow">
              <div className="bg-burgundy-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-burgundy-700 mb-6">
                <FileText size={32} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">구글 폼으로 예약하기</h3>
              <p className="text-stone-600 font-light mb-8">
                가장 빠르고 간편하게 촬영을 예약하실 수 있습니다. 아래 버튼을 눌러 양식을 작성해 주세요.
              </p>
              <a
                href={settings.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-burgundy-800 hover:bg-burgundy-700 text-ivory-100 font-medium tracking-widest uppercase py-4 rounded-lg transition-colors duration-300 shadow-md"
              >
                예약 양식 작성하기
              </a>
            </div>

            {/* Download Form Link */}
            <div className="bg-ivory-200 p-10 rounded-2xl text-center hover:shadow-md transition-shadow">
              <div className="bg-white w-16 h-16 mx-auto rounded-full flex items-center justify-center text-stone-700 mb-6 shadow-sm">
                <Download size={32} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">예약 양식 다운로드</h3>
              <p className="text-stone-600 font-light mb-8">
                오프라인 작성이 필요하시거나 이메일로 접수하실 경우, 아래 양식을 다운로드해 주세요.
              </p>
              <a
                href={settings.formDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium tracking-widest uppercase py-4 rounded-lg transition-colors duration-300 shadow-sm"
              >
                양식 다운로드 (PDF/Word)
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
