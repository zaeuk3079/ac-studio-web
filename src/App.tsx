/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CMSProvider, useCMS } from './store/CMSContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import PortfolioManage from './pages/admin/PortfolioManage';
import Settings from './pages/admin/Settings';

function ThemeApplier() {
  const { settings } = useCMS();
  
  const headingFont = settings.headingFont || 'Playfair Display';
  const bodyFont = settings.bodyFont || 'Inter';

  return (
    <style>
      {`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600&display=swap');
        :root {
          --font-serif: "${headingFont}", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
          --font-sans: "${bodyFont}", ui-sans-serif, system-ui, sans-serif !important;
        }
      `}
    </style>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <ThemeApplier />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/photography" element={<Layout><Portfolio type="photography" /></Layout>} />
          <Route path="/video" element={<Layout><Portfolio type="video" /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/portfolio" element={<ProtectedRoute><AdminLayout><PortfolioManage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </CMSProvider>
  );
}

