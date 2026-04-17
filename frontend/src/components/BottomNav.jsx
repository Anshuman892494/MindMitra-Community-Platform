import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User as UserIcon, Bell } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Compass, path: '#', label: 'Explore' },
    { icon: Bell, path: '/notifications', label: 'Notifications', count: unreadCount },
    { icon: 'profile', path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around items-center px-2 safe-area-bottom">
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.path;
        
        if (item.icon === 'profile') {
          return (
             <Link key={idx} to={item.path} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ${isActive ? 'ring-primary' : 'ring-transparent'}`}>
                    {user?.profile_image ? (
                        <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
             </Link>
          );
        }

        return (
          <Link 
            key={idx} 
            to={item.path} 
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
            {item.count > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
