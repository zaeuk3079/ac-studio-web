import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCMS } from '../store/CMSContext';
import { Instagram, Mail, Phone } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { settings } = useCMS();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-stone-900 font-sans selection:bg-burgundy-200 selection:text-burgundy-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ivory-100/90 backdrop-blur-md border-b border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-3 items-center h-24">
            {/* Left Nav */}
            <nav className="flex space-x-10 justify-start">
              <Link
                to="/photography"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                  location.pathname === '/photography' ? 'text-burgundy-800 font-semibold' : 'text-stone-500'
                }`}
              >
                Photography
              </Link>
              <Link
                to="/video"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                  location.pathname === '/video' ? 'text-burgundy-800 font-semibold' : 'text-stone-500'
                }`}
              >
                Video
              </Link>
            </nav>

            {/* Center Logo */}
            <div className="flex justify-center">
              <Link to="/" className="font-sans text-2xl tracking-[0.3em] text-burgundy-900 font-bold uppercase whitespace-nowrap">
                {settings.siteName}
              </Link>
            </div>

            {/* Right Nav */}
            <nav className="flex space-x-10 justify-end items-center">
              <Link
                to="/"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                  location.pathname === '/' ? 'text-burgundy-800 font-semibold' : 'text-stone-500'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                  location.pathname === '/about' ? 'text-burgundy-800 font-semibold' : 'text-stone-500'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                  location.pathname === '/contact' ? 'text-burgundy-800 font-semibold' : 'text-stone-500'
                }`}
              >
                Contact
              </Link>
              <div className="pl-4 flex items-center space-x-4 border-l border-stone-200">
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-burgundy-600 transition-colors">
                  <Instagram size={18} />
                </a>
                <Link to="/admin" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-burgundy-600 transition-colors border border-stone-200 px-2 py-0.5 rounded">
                  Admin
                </Link>
              </div>
            </nav>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center py-4 space-y-4">
            <Link to="/" className="font-sans text-xl tracking-[0.2em] text-burgundy-900 font-bold uppercase">
              {settings.siteName}
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/" className="text-[10px] tracking-widest uppercase text-stone-500">Home</Link>
              <Link to="/photography" className="text-[10px] tracking-widest uppercase text-stone-500">Photography</Link>
              <Link to="/video" className="text-[10px] tracking-widest uppercase text-stone-500">Video</Link>
              <Link to="/about" className="text-[10px] tracking-widest uppercase text-stone-500">About</Link>
              <Link to="/contact" className="text-[10px] tracking-widest uppercase text-stone-500">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-ivory-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-sans text-lg tracking-widest uppercase mb-4 text-ivory-100">{settings.siteName}</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
                당신의 가장 빛나는 순간을 기록합니다. 시간이 흘러도 변하지 않는 가치를 선사합니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-ivory-100">Contact</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{settings.contactEmail}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>{settings.contactPhone}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-ivory-100">Social</h4>
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-stone-400 hover:text-ivory-100 transition-colors">
                <Instagram size={16} />
                <span>Instagram</span>
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500 flex justify-between items-center">
            <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
            <p className="tracking-widest uppercase">Photography Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
