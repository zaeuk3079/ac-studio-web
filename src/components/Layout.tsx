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
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-sans text-xl tracking-widest text-burgundy-800 font-semibold uppercase">
                {settings.siteName}
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm tracking-widest uppercase transition-colors duration-200 hover:text-burgundy-600 ${
                    location.pathname === link.path ? 'text-burgundy-800 font-medium' : 'text-stone-500'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-burgundy-600 transition-colors">
                <Instagram size={20} />
              </a>
              <Link to="/admin" className="text-xs tracking-widest uppercase text-stone-400 hover:text-burgundy-600 transition-colors border border-stone-300 px-3 py-1 rounded-full">
                Admin
              </Link>
            </div>
            {/* Mobile menu button could go here */}
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
