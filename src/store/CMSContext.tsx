import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  gallery?: string[];
  videoUrl?: string;
  description: string;
}

export interface SiteSettings {
  siteName: string;
  // Home
  heroText: string;
  heroSubText: string;
  heroImage: string;
  showHomeAbout: boolean;
  homePortfolioTitle: string;
  // Portfolio
  portfolioTitle: string;
  portfolioSubText: string;
  // About
  aboutTitle: string;
  aboutSubText: string;
  aboutText: string;
  aboutText2: string;
  aboutText3: string;
  aboutImage: string;
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
  // Appearance
  themeColor: string; // 'ivory' or other
  accentColor: string; // 'burgundy' or other
  headingFont: string;
  bodyFont: string;
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
  // Home
  heroText: 'aging studio는 당신의 가장 빛나는 순간을 기록합니다.',
  heroSubText: '시간이 흘러도 변하지 않는 가치, 그 찰나의 아름다움을 영원히 간직하세요.',
  heroImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
  showHomeAbout: true,
  homePortfolioTitle: 'Selected Works',
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
  // Philosophy
  showPhilosophy: true,
  philosophyTitle: 'Our Philosophy',
  philosophyItem1: '자연스러움: 꾸며지지 않은 본연의 모습을 담습니다.',
  philosophyItem2: '시간의 가치: 유행을 타지 않는 클래식한 아름다움을 추구합니다.',
  philosophyItem3: '소통: 고객과의 깊은 교감을 통해 최상의 결과물을 만듭니다.',
  // Contact
  contactTitle: 'Contact',
  contactSubText: 'Get in touch & Booking',
  contactMessageTitle: "Let's Create Together",
  contactMessageText: '촬영 문의 및 예약은 아래 연락처나 우측의 구글 폼을 통해 남겨주시면, 최대한 빠르게 답변해 드리겠습니다. 당신의 특별한 순간을 함께할 수 있기를 기대합니다.',
  contactEmail: 'contact@agingstudio.com',
  contactPhone: '010-1234-5678',
  contactAddress: '서울특별시 강남구 논현로 123길 45\naging studio 2F',
  instagramUrl: 'https://instagram.com/agingstudio',
  googleFormUrl: 'https://docs.google.com/forms',
  formDownloadUrl: '#',
  // Appearance
  themeColor: 'ivory',
  accentColor: 'burgundy',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Settings
        const settingsDoc = await getDocs(collection(db, 'settings'));
        if (!settingsDoc.empty) {
          setSettings(settingsDoc.docs[0].data() as SiteSettings);
        } else {
          // Initialize default settings if empty
          await setDoc(doc(db, 'settings', 'main'), defaultSettings);
        }

        // Load Portfolio
        const portfolioCollection = collection(db, 'portfolio');
        const portfolioSnapshot = await getDocs(portfolioCollection);
        
        if (!portfolioSnapshot.empty) {
          const loadedPortfolio = portfolioSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PortfolioItem[];
          
          // Sort by orderIndex
          loadedPortfolio.sort((a, b) => {
            const orderA = (a as any).orderIndex ?? 9999;
            const orderB = (b as any).orderIndex ?? 9999;
            return orderA - orderB;
          });
          
          setPortfolio(loadedPortfolio);
        } else {
          // Initialize default portfolio if empty
          for (const item of defaultPortfolio) {
            await setDoc(doc(db, 'portfolio', item.id), item);
          }
        }
      } catch (error) {
        console.error("Error loading data from Firebase:", error);
        // Fallback to defaults if Firebase fails
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => {
    const newId = Date.now().toString();
    const { gallery, ...rest } = item;
    const newItem = { ...rest, id: newId, orderIndex: 0 };
    
    setPortfolio(prev => {
      const newPortfolio = [{ ...item, id: newId }, ...prev];
      return newPortfolio;
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
    
    setPortfolio(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    
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
    // Update local state
    setSettings(updated);
    
    // Save to Firebase
    try {
      await setDoc(doc(db, 'settings', 'main'), updated);
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("설정 저장에 실패했습니다.");
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
