import { useCMS } from '../../store/CMSContext';
import { motion } from 'motion/react';
import { Image as ImageIcon, FileText, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { portfolio, settings } = useCMS();

  const stats = [
    { name: 'Total Portfolio Items', value: portfolio.length, icon: ImageIcon, color: 'bg-blue-50 text-blue-600' },
    { name: 'Active Categories', value: new Set(portfolio.map(i => i.category)).size, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Recent Inquiries', value: '12', icon: Users, color: 'bg-amber-50 text-amber-600' },
    { name: 'Site Status', value: 'Live', icon: Settings, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">Welcome back, Admin</h2>
          <p className="text-stone-500 mt-1">Here's what's happening with {settings.siteName} today.</p>
        </div>
        <Link
          to="/admin/portfolio"
          className="bg-burgundy-700 hover:bg-burgundy-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          Add New Work
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4"
            >
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Portfolio */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-stone-800">Recent Portfolio Additions</h3>
          <Link to="/admin/portfolio" className="text-sm text-burgundy-600 hover:text-burgundy-800 font-medium">
            View All
          </Link>
        </div>
        <div className="divide-y divide-stone-100">
          {portfolio.slice(0, 5).map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{item.title}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mt-0.5">{item.category}</p>
                </div>
              </div>
              <div className="text-sm text-stone-500">
                ID: {item.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
