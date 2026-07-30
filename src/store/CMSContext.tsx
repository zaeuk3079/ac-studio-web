import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface NukiImageConfig {
  url: string;
  left: number; // 0 ~ 100 (%)
  top: number;  // 0 ~ 100 (%)
  size: number; // width in px (e.g. 50 ~ 300)
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  gallery?: string[];
  videoUrl?: string;
  videoAspectRatio?: '16:9' | '9:16';
  description: string;
  isPinned?: boolean;
  objectPosition?: 'top' | 'center' | 'bottom';
}

export interface ProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  desc1: string;
  desc2: string;
  image: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  // Home
  heroText: string;
  heroSubText: string;
  heroImage: string;
  heroImages?: string[];
  heroSlideInterval?: number;
  heroAspectRatio?: '3:2' | '16:9' | '4:3' | string;
  heroObjectPosition?: 'top' | 'center' | 'bottom' | string;
  heroTextFontSize?: number;
  heroTextLetterSpacing?: number;
  heroTextFontFamily?: string;
  heroTextColor?: string;
  heroTextX?: number;
  heroTextY?: number;
  heroSubTextFontSize?: number;
  heroSubTextLetterSpacing?: number;
  heroSubTextFontFamily?: string;
  heroSubTextColor?: string;
  heroTextAlign?: 'left' | 'center' | 'right' | string;
  heroNukiImages?: string[];
  heroNukiConfigs?: NukiImageConfig[];
  showHomeAbout: boolean;
  homePortfolioTitle: string;
  homePortfolioTitleLetterSpacing?: number;
  homePortfolioSubText?: string;
  homePortfolioSubTextFontSize?: number;
  homePortfolioSubTextLetterSpacing?: number;
  homePortfolioSubTextColor?: string;
  // About
  aboutTitle: string;
  aboutSubText: string;
  aboutText: string;
  aboutText2: string;
  aboutText3: string;
  aboutImage: string;
  aboutTextFontSize?: number;
  aboutTextLetterSpacing?: number;
  aboutTextFontFamily?: string;
  aboutTextAlign?: 'left' | 'center' | 'right' | string;
  aboutTextColor?: string;
  aboutTextX?: number;
  aboutTextY?: number;
  aboutBodyFontSize?: number;
  aboutBodyLetterSpacing?: number;
  aboutBodyTextColor?: string;
  // Service
  serviceTitle: string;
  serviceSubText: string;
  serviceText: string;
  serviceText2: string;
  serviceImage: string;
  serviceTextFontSize?: number;
  serviceTextLetterSpacing?: number;
  serviceTextFontFamily?: string;
  serviceTextAlign?: 'left' | 'center' | 'right' | string;
  serviceTextColor?: string;
  serviceTextX?: number;
  serviceTextY?: number;
  serviceProcessTitle?: string;
  serviceProcessSteps?: ProcessStep[];
  // Philosophy
  showPhilosophy: boolean;
  philosophyTitle: string;
  philosophyItem1: string;
  philosophyItem2: string;
  philosophyItem3: string;
  // Contact
  contactTitle: string;
  contactSubText: string;
  contactMessageTitle: string;
  contactMessageText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  instagramUrl: string;
  googleFormUrl: string;
  formDownloadUrl: string;
  web3FormsKey?: string;
  contactTextFontSize?: number;
  contactTextLetterSpacing?: number;
  contactTextFontFamily?: string;
  contactTextAlign?: 'left' | 'center' | 'right' | string;
  contactTextColor?: string;
  contactTextX?: number;
  contactTextY?: number;
  // Appearance
  themeColor: string; // 'ivory' or other
  accentColor: string; // 'burgundy' or other
  headingFont: string;
  bodyFont: string;
  // Footer
  footerTitle: string;
  footerText: string;
}

interface CMSContextType {
  portfolio: PortfolioItem[];
  settings: SiteSettings;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (id: string, item: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  reorderPortfolio: (newPortfolio: PortfolioItem[]) => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  getGalleryImages: (id: string) => Promise<string[]>;
}

const defaultPortfolio: PortfolioItem[] = [
  {
    id: '1',
    title: 'Commercial Product Shot',
    category: 'PRODUCT',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    description: '브랜드의 가치를 높이는 상업 사진.',
  },
  {
    id: '2',
    title: 'Gourmet Food Photography',
    category: 'FOOD&BEVERAGE',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    description: '맛과 향을 시각적으로 담아냅니다.',
  },
  {
    id: '3',
    title: 'Fashion Model Profile',
    category: 'MODEL',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    description: '인물의 고유한 매력을 포착합니다.',
  },
  {
    id: '4',
    title: 'Cinematic Video Work',
    category: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: '감각적인 영상미를 선사합니다.',
  }
];

const defaultSettings: SiteSettings = {
  siteName: 'aging studio',
  logoUrl: '',
  // Home
  heroText: 'aging studio는 당신의 가장 빛나는 순간을 기록합니다.',
  heroSubText: '시간이 흘러도 변하지 않는 가치, 그 찰나의 아름다움을 영원히 간직하세요.',
  heroImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
  heroImages: [],
  heroSlideInterval: 2500,
  heroAspectRatio: '3:2',
  heroObjectPosition: 'center',
  heroTextFontSize: 42,
  heroTextLetterSpacing: 0,
  heroTextFontFamily: 'Pretendard',
  heroTextColor: '#FFFFFF',
  heroTextX: 6,
  heroTextY: 82,
  heroSubTextFontSize: 14,
  heroSubTextLetterSpacing: 1,
  heroSubTextFontFamily: 'Pretendard',
  heroSubTextColor: '#E7E5E4',
  heroTextAlign: 'left',
  heroNukiImages: [],
  heroNukiConfigs: [],
  showHomeAbout: true,
  homePortfolioTitle: 'Work',
  homePortfolioTitleLetterSpacing: 1,
  homePortfolioSubText: '',
  homePortfolioSubTextFontSize: 14,
  homePortfolioSubTextLetterSpacing: 1,
  homePortfolioSubTextColor: '#78716C',
  // Portfolio
  portfolioTitle: 'Portfolio',
  portfolioSubText: 'Our Selected Works',
  // About
  aboutTitle: 'About Us',
  aboutSubText: 'aging studio는 당신의 가장 빛나는 순간을 기록합니다.',
  aboutText: '에이징 스튜디오는 단순한 사진 촬영을 넘어, 당신의 이야기와 감정을 프레임 안에 담아냅니다. 수년간의 경험과 독창적인 시선으로 가장 자연스럽고 아름다운 모습을 찾아드립니다.',
  aboutText2: '우리는 모든 사람이 자신만의 고유한 아름다움을 가지고 있다고 믿습니다. 그 아름다움이 가장 자연스럽게 드러나는 찰나를 포착하여, 시간이 흘러도 변하지 않는 가치 있는 결과물로 만들어냅니다.',
  aboutText3: '단순히 셔터를 누르는 것을 넘어, 당신과 소통하고 교감하며 가장 편안한 분위기 속에서 촬영을 진행합니다. 우리의 프레임 안에서 당신의 이야기가 예술이 됩니다.',
  aboutImage: 'https://images.unsplash.com/photo-1554046920-90dcac0536d1?q=80&w=2069&auto=format&fit=crop',
  aboutTextFontSize: 42,
  aboutTextLetterSpacing: 0,
  aboutTextFontFamily: 'Pretendard',
  aboutTextAlign: 'center',
  aboutTextColor: '#1C1917',
  aboutTextX: 50,
  aboutTextY: 30,
  aboutBodyFontSize: 16,
  aboutBodyLetterSpacing: 0,
  // Service
  serviceTitle: 'Our Services',
  serviceSubText: '촬영 진행 과정 및 서비스 안내',
  serviceText: '에이징 스튜디오는 철저한 사전 기획부터 촬영, 정교한 리터칭까지 원스톱 서비스를 제공합니다. 고객의 브랜드 가치를 시각적으로 극대화하기 위해 각 단계마다 최상의 퀄리티를 지향합니다.',
  serviceText2: '진행 과정: 1. 사전 미팅 및 기획 ➡️ 2. 촬영 준비 및 소품 세팅 ➡️ 3. 본 촬영 진행 ➡️ 4. A컷 셀렉 및 전문 보정 ➡️ 5. 최종 완성본 전달',
  serviceImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop',
  serviceProcessTitle: 'Process',
  serviceProcessSteps: [
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
  ],
  serviceTextFontSize: 42,
  serviceTextLetterSpacing: 0,
  serviceTextFontFamily: 'Pretendard',
  serviceTextAlign: 'center',
  serviceTextColor: '#1C1917',
  serviceTextX: 50,
  serviceTextY: 30,
  // Philosophy
  showPhilosophy: true,
  philosophyTitle: 'Our Philosophy',
  philosophyItem1: '자연스러움: 꾸며지지 않은 본연의 모습을 담습니다.',
  philosophyItem2: '시간의 가치: 유행을 타지 않는 클래식한 아름다움을 추구합니다.',
  philosophyItem3: '소통: 고객과의 깊은 교감을 통해 최상의 결과물을 만듭니다.',
  // Contact
  contactTitle: '견적문의',
  contactSubText: '견적 및 촬영 문의',
  contactMessageTitle: "Let's Create Together",
  contactMessageText: '촬영 문의 및 예약은 아래 연락처나 우측의 구글 폼을 통해 남겨주시면, 최대한 빠르게 답변해 드리겠습니다. 당신의 특별한 순간을 함께할 수 있기를 기대합니다.',
  contactEmail: 'contact@agingstudio.com',
  contactPhone: '010-1234-5678',
  contactAddress: '서울특별시 강남구 논현로 123길 45\naging studio 2F',
  instagramUrl: 'https://instagram.com/agingstudio',
  googleFormUrl: 'https://docs.google.com/forms',
  formDownloadUrl: '#',
  web3FormsKey: '2ad41e7e-6c9c-4c9b-b14a-d160b8fc15bf',
  contactTextFontSize: 42,
  contactTextLetterSpacing: 0,
  contactTextFontFamily: 'Pretendard',
  contactTextAlign: 'center',
  contactTextColor: '#FFFFFF',
  contactTextX: 50,
  contactTextY: 20,
  // Appearance
  themeColor: 'ivory',
  accentColor: 'burgundy',
  headingFont: 'Pretendard',
  bodyFont: 'Pretendard',
  // Footer
  footerTitle: 'aging studio',
  footerText: '당신의 가장 빛나는 순간을 기록합니다. 시간이 흘러도 변하지 않는 가치를 선사합니다.',
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Firebase & listen to real-time changes
  useEffect(() => {
    // 1. Initial local storage check for instant render
    const cachedSettings = localStorage.getItem('ac_studio_settings');
    if (cachedSettings) {
      try {
        setSettings(JSON.parse(cachedSettings));
      } catch (e) {}
    }

    // 2. Real-time Firebase Settings Listener with Smart Local Merge Safeguard
    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'main'),
      (docSnap) => {
        let cachedObj: Partial<SiteSettings> = {};
        const localRaw = localStorage.getItem('ac_studio_settings');
        if (localRaw) {
          try { cachedObj = JSON.parse(localRaw); } catch (e) {}
        }

        if (docSnap.exists()) {
          const fetched = docSnap.data() as SiteSettings;
          // Merge defaultSettings -> fetched -> cachedObj to NEVER lose user customizations
          const merged: SiteSettings = {
            ...defaultSettings,
            ...fetched,
            ...cachedObj
          };
          setSettings(merged);
          localStorage.setItem('ac_studio_settings', JSON.stringify(merged));
        } else {
          // If Firebase doc is not ready, keep user local customizations intact
          const merged = { ...defaultSettings, ...cachedObj };
          setSettings(merged);
          localStorage.setItem('ac_studio_settings', JSON.stringify(merged));
          setDoc(doc(db, 'settings', 'main'), merged).catch(() => {});
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase settings onSnapshot error:", error);
        setIsLoading(false);
      }
    );

    // 3. Load Portfolio
    const loadPortfolio = async () => {
      try {
        const portfolioCollection = collection(db, 'portfolio');
        const portfolioSnapshot = await getDocs(portfolioCollection);
        
        if (!portfolioSnapshot.empty) {
          const loadedPortfolio = portfolioSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as PortfolioItem[];
          
          loadedPortfolio.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            const orderA = (a as any).orderIndex ?? 9999;
            const orderB = (b as any).orderIndex ?? 9999;
            return orderA - orderB;
          });
          
          setPortfolio(loadedPortfolio);
        } else {
          for (const item of defaultPortfolio) {
            await setDoc(doc(db, 'portfolio', item.id), item);
          }
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
      }
    };

    loadPortfolio();

    return () => {
      unsubscribeSettings();
    };
  }, []);

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => {
    const newId = Date.now().toString();
    const { gallery, ...rest } = item;
    const newItem = { ...rest, id: newId, orderIndex: 0 };
    
    setPortfolio(prev => {
      const newPortfolio = [{ ...item, id: newId }, ...prev];
      return newPortfolio.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const orderA = (a as any).orderIndex ?? 9999;
        const orderB = (b as any).orderIndex ?? 9999;
        return orderA - orderB;
      });
    });
    
    try {
      const { writeBatch, collection, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      batch.set(doc(db, 'portfolio', newId), newItem);
      
      if (gallery && gallery.length > 0) {
        gallery.forEach((img, idx) => {
          const galleryDocRef = doc(collection(db, 'portfolio', newId, 'gallery'));
          batch.set(galleryDocRef, { url: img, order: idx });
        });
      }
      
      portfolio.forEach((p, idx) => {
        batch.update(doc(db, 'portfolio', p.id), { orderIndex: idx + 1 });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      alert("항목 추가에 실패했습니다.");
      setPortfolio(prev => prev.filter(p => p.id !== newId));
    }
  };

  const updatePortfolioItem = async (id: string, updatedItem: Partial<PortfolioItem>) => {
    const originalPortfolio = [...portfolio];
    const { gallery, ...rest } = updatedItem;
    
    setPortfolio(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updatedItem } : item);
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const orderA = (a as any).orderIndex ?? 9999;
        const orderB = (b as any).orderIndex ?? 9999;
        return orderA - orderB;
      });
    });
    
    try {
      const { writeBatch, collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      batch.update(doc(db, 'portfolio', id), rest);
      
      if (gallery) {
        const gallerySnap = await getDocs(collection(db, 'portfolio', id, 'gallery'));
        gallerySnap.forEach((d) => {
          batch.delete(d.ref);
        });
        
        gallery.forEach((img, idx) => {
          const galleryDocRef = doc(collection(db, 'portfolio', id, 'gallery'));
          batch.set(galleryDocRef, { url: img, order: idx });
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      alert("항목 수정에 실패했습니다.");
      setPortfolio(originalPortfolio);
    }
  };

  const getGalleryImages = async (id: string): Promise<string[]> => {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const galleryRef = collection(db, 'portfolio', id, 'gallery');
      const q = query(galleryRef, orderBy('order'));
      const snap = await getDocs(q);
      
      if (snap.empty) return [];
      return snap.docs.map(doc => doc.data().url);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      return [];
    }
  };

  const deletePortfolioItem = async (id: string) => {
    // Update local state
    setPortfolio(portfolio.filter(item => item.id !== id));
    
    // Save to Firebase (Note: we need deleteDoc for this, adding it to imports)
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
    }
  };

  const reorderPortfolio = async (newPortfolio: PortfolioItem[]) => {
    // Update local state
    setPortfolio(newPortfolio);
    
    // Save new order to Firebase (This is a simplified approach. 
    // For robust ordering, you'd typically add an 'order' field to each document)
    try {
      // In a real app, you'd update an 'order' field on each document.
      // For this simple version, we'll just rely on the local state 
      // and let the user know reordering might not persist perfectly without an order field.
      // To properly persist order, we would need to batch update all documents with a new index.
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      newPortfolio.forEach((item, index) => {
        const docRef = doc(db, 'portfolio', item.id);
        batch.update(docRef, { orderIndex: index });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error reordering portfolio:", error);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    // Update local state & localStorage immediately for instant UI feedback
    setSettings(updated);
    localStorage.setItem('ac_studio_settings', JSON.stringify(updated));
    
    // Save to Firebase with auto-retry emergency auto-shrink fallback
    try {
      await setDoc(doc(db, 'settings', 'main'), updated);
    } catch (error: any) {
      console.warn("First setDoc failed, attempting emergency auto-shrink fallback...", error);
      try {
        const { compressBase64String } = await import('../utils/imageUtils');
        const emergencyData = {
          ...updated,
          logoUrl: updated.logoUrl ? await compressBase64String(updated.logoUrl, 350, 0.65) : updated.logoUrl,
          heroImage: updated.heroImage ? await compressBase64String(updated.heroImage, 650, 0.65) : updated.heroImage,
          aboutImage: updated.aboutImage ? await compressBase64String(updated.aboutImage, 650, 0.65) : updated.aboutImage,
          serviceImage: updated.serviceImage ? await compressBase64String(updated.serviceImage, 650, 0.65) : updated.serviceImage,
          heroNukiImages: [],
          heroNukiConfigs: []
        };
        await setDoc(doc(db, 'settings', 'main'), emergencyData);
        setSettings(emergencyData);
        localStorage.setItem('ac_studio_settings', JSON.stringify(emergencyData));
      } catch (retryErr: any) {
        console.warn("Firebase setDoc limit fallback to local storage. Settings saved locally.");
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="w-8 h-8 border-4 border-burgundy-800 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <CMSContext.Provider value={{ portfolio, settings, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, reorderPortfolio, updateSettings, getGalleryImages }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
