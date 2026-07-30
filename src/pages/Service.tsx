import { useCMS } from '../store/CMSContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Service() {
  const { settings } = useCMS();

  const steps = settings.serviceProcessSteps && settings.serviceProcessSteps.length > 0
    ? settings.serviceProcessSteps
    : [
        {
          id: 'step_1',
          stepNumber: '01',
          title: '상담·기획',
          desc1: '24시간 안에 답장합니다.',
          desc2: '목적과 무드를 듣고 레퍼런스·세팅·견적을 제안합니다.',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop'
        },
        {
          id: 'step_2',
          stepNumber: '02',
          title: '촬영',
          desc1: '역삼 스튜디오 또는 로케이션.',
          desc2: '현장에서 컷을 함께 확인하며 진행합니다.',
          image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop'
        },
        {
          id: 'step_3',
          stepNumber: '03',
          title: '셀렉·리터칭',
          desc1: '정리된 컷에서 고르시면,',
          desc2: '피드백을 반영해 정성껏 보정합니다.',
          image: 'https://images.unsplash.com/photo-1554046920-90dcac0536d1?q=80&w=600&auto=format&fit=crop'
        },
        {
          id: 'step_4',
          stepNumber: '04',
          title: '전달',
          desc1: '고해상도 완성본을 일정에 맞춰드립니다.',
          desc2: '',
          image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop'
        }
      ];

  return (
    <div className="bg-white min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Process Layout: Left Title & Right List (Matches Image Design 100%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Big Bold Process Title */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 sticky top-32"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight font-sans">
              {settings.serviceProcessTitle || 'Process'}
            </h1>
            {settings.serviceSubText && (
              <p className="text-stone-500 text-sm tracking-wide mt-4 whitespace-pre-line">
                {settings.serviceSubText}
              </p>
            )}
          </motion.div>

          {/* Right Column: Process Steps List */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-8 space-y-10"
          >
            {steps.map((step, idx) => (
              <div 
                key={step.id || idx} 
                className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-start justify-between gap-6 group"
              >
                {/* Step Text Info */}
                <div className="flex items-start space-x-6 flex-1">
                  {/* Step Number (e.g. 01) */}
                  <span className="text-xs font-mono font-bold text-stone-400 tracking-wider pt-1 shrink-0">
                    {step.stepNumber || `0${idx + 1}`}
                  </span>

                  {/* Title & Descriptions */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-sans">
                      {step.title}
                    </h3>
                    <div className="text-sm text-stone-600 space-y-1 font-normal leading-relaxed whitespace-pre-line">
                      {step.desc1 && <p>{step.desc1}</p>}
                      {step.desc2 && <p className="text-stone-500">{step.desc2}</p>}
                    </div>
                  </div>
                </div>

                {/* Step Thumbnail Image */}
                {step.image && (
                  <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Bottom Border */}
            <div className="border-t border-stone-200 pt-4" />

            {/* Call to Action Button */}
            <div className="pt-6 flex justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-3 bg-[#bcd0c9] hover:bg-[#a9c1b9] text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 shadow-sm hover:shadow border-none"
              >
                <Calendar size={18} />
                <span>견적 문의하기</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
