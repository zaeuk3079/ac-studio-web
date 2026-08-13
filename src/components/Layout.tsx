import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../store/CMSContext';
import { Instagram, Mail, Phone } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { settings } = useCMS();

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-white font-sans selection:bg-lime-300/30 selection:text-lime-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ink-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 md:h-28">
            {/* Logo */}
            <Link to="/" className="flex items-center p-1 hover:opacity-90 transition-opacity cursor-pointer">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="max-h-20 md:max-h-24 w-auto object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-sans text-xl md:text-2xl tracking-[0.2em] text-white font-bold uppercase whitespace-nowrap">
                  {settings.siteName}
                </span>
              )}
            </Link>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-lime-300 transition-colors">
                <Instagram size={18} />
              </a>
              <Link to="/admin" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-white transition-colors border border-white/10 px-2 py-0.5 rounded">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 text-stone-300 py-12 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-sans text-lg tracking-widest uppercase mb-4 text-white">{settings.footerTitle || settings.siteName}</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs whitespace-pre-line">
                {settings.footerText}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-white">Contact</h4>
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
              <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-white">Social</h4>
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-stone-400 hover:text-lime-300 transition-colors">
                <Instagram size={16} />
                <span>Instagram</span>
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-stone-500 flex justify-between items-center">
            <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
            <p className="tracking-widest uppercase">Photography Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
