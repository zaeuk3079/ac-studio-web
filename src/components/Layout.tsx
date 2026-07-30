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
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-stone-200/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-3 items-center h-32">
            {/* Left Nav */}
            <nav className="flex space-x-10 justify-start">
              <Link
                to="/about"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-stone-900 ${
                  location.pathname === '/about' ? 'text-stone-900 font-bold' : 'text-stone-500'
                }`}
              >
                About
              </Link>
              <Link
                to="/service"
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-200 hover:text-stone-900 ${
                  location.pathname === '/service' ? 'text-stone-900 font-bold' : 'text-stone-500'
                }`}
              >
                Service
              </Link>
            </nav>

            {/* Center Logo */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center justify-center p-2 hover:opacity-90 transition-opacity cursor-pointer">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.siteName} className="max-h-20 w-auto object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-sans text-2xl tracking-[0.3em] text-stone-900 font-bold uppercase whitespace-nowrap">
                    {settings.siteName}
                  </span>
                )}
              </Link>
            </div>

            {/* Right Nav */}
            <nav className="flex space-x-8 justify-end items-center">
              <Link
                to="/contact"
                className="text-xs font-bold tracking-wider text-white bg-[#5C4033] hover:bg-[#4A3227] px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center border border-[#6E4E3D] cursor-pointer"
              >
                견적문의
              </Link>
              <div className="pl-4 flex items-center space-x-4 border-l border-stone-200">
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors">
                  <Instagram size={18} />
                </a>
                <Link to="/admin" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors border border-stone-200 px-2 py-0.5 rounded">
                  Admin
                </Link>
              </div>
            </nav>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center py-4 space-y-4">
            <Link to="/" className="flex items-center justify-center p-1 hover:opacity-90 transition-opacity cursor-pointer">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="max-h-14 w-auto object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-sans text-xl tracking-[0.2em] text-stone-900 font-bold uppercase">
                  {settings.siteName}
                </span>
              )}
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link to="/about" className="text-[11px] tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors">About</Link>
              <Link to="/service" className="text-[11px] tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors">Service</Link>
              <Link
                to="/contact"
                className="text-[12px] font-bold tracking-wider text-white bg-[#5C4033] hover:bg-[#4A3227] px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center -my-1 border border-[#6E4E3D]"
              >
                견적문의
              </Link>
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
              <h3 className="font-sans text-lg tracking-widest uppercase mb-4 text-ivory-100">{settings.footerTitle || settings.siteName}</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
                {settings.footerText}
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
