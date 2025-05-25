import { useState } from 'react';
import { Home, CreditCard, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function AppSidebarUser() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const menuItems = [
    { name: 'Reservasi', icon: <Calendar size={20} />, href: '/landing-page/reservasi' },
    { name: 'Pembayaran', icon: <CreditCard size={20} />, href: '/landing-page/pembayaran' },
    { name: 'Riwayat', icon: <Clock size={20} />, href: '/landing-page/riwayat' },
    { name: 'Kembali ke Beranda', icon: <Home size={20} />, href: '/landing-page' }
  ];
  
  return (
    <div className={`fixed left-0 top-1/4 z-50 transition-all duration-300 ${isExpanded ? 'w-48' : 'w-12'}`}>
      <div className="bg-white rounded-r-lg shadow-lg overflow-hidden">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="absolute -right-3 top-12 bg-green-500 text-white p-1 rounded-full shadow-md z-10"
        >
          <ChevronRight 
            size={16} 
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
        
        <div className="py-2">
          {menuItems.map((item, index) => (
            <a 
              href={item.href}
              key={index}
              className="flex items-center px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors duration-200"
            >
              <div className="text-green-500">
                {item.icon}
              </div>
              <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}