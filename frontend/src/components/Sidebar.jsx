import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    Home, Bell, Bookmark, MessageSquare, Moon, Sun, 
    Settings, LogOut, User as UserIcon, PanelLeftClose, PanelLeft,
    Box
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import logo from '../assets/logo.png';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        setIsDarkMode(false);
        localStorage.setItem('theme', 'light');
    } else {
        root.classList.add('dark');
        setIsDarkMode(true);
        localStorage.setItem('theme', 'dark');
    }
  };

  const navLinks = [
    { label: 'Home', icon: Home, path: '/', activeHighlight: true },
    { label: 'Notification', icon: Bell, path: '/notifications', badge: unreadCount, activeHighlight: true },
    { label: 'Book mark', icon: Bookmark, path: '#', disabled: true },
    { label: 'Messages', icon: MessageSquare, path: '#', disabled: true },
    { label: 'Profile', icon: UserIcon, path: '/profile', activeHighlight: true },
  ];

  const actionLinks = [
    { label: 'Theme', icon: isDarkMode ? Sun : Moon, action: toggleTheme, isToggle: false },
  ];

  const footerLinks = [
    { label: 'Setting', icon: Settings, path: '#', disabled: true },
    { label: 'Log out', icon: LogOut, action: logout },
  ];

  return (
    <aside className={`hidden md:flex flex-col h-screen bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center px-5 h-20 shrink-0">
        <Link to="/" className={`flex items-center space-x-3 overflow-hidden ${!isExpanded && 'opacity-0 w-0'}`}>
            <div className="w-8 h-8 shrink-0">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">MindMitra</span>
        </Link>
      </div>

      <div className="px-4">
         <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-6"></div>
      </div>

      {/* Main Links */}
      <div className="flex-1 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
         {navLinks.map((item, idx) => {
            const isActive = location.pathname === item.path && item.activeHighlight;
            return (
                <Link 
                    key={idx} 
                    to={item.disabled ? '#' : item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.label}
                    </span>
                    
                    {isExpanded && item.badge > 0 && (
                        <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                        </span>
                    )}
                </Link>
            )
         })}

         <div className="py-2"></div>

         {/* Action Links */}
         {actionLinks.map((item, idx) => (
            <button 
                key={idx} 
                onClick={item.action}
                className="w-full flex items-center px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium hover:text-slate-900 dark:hover:text-white transition-all"
            >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.label}
                </span>

                {isExpanded && item.isToggle && (
                    <div className={`ml-auto w-8 h-4 rounded-full transition-colors relative ${item.toggleState ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${item.toggleState ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                )}
            </button>
         ))}

         <div className="py-6"></div>

         {/* Footer Links */}
         {footerLinks.map((item, idx) => (
            item.path ? (
                <Link 
                    key={idx} 
                    to={item.disabled ? '#' : item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium hover:text-slate-900 dark:hover:text-white`}
                >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.label}
                    </span>
                </Link>
            ) : (
                <button 
                    key={idx} 
                    onClick={item.action}
                    className="w-full flex items-center px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-medium hover:text-rose-500 transition-all"
                >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.label}
                    </span>
                </button>
            )
         ))}
      </div>

      {/* User Area Footer */}
      <div className="p-4 shrink-0">
          <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4"></div>
          
          <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${!isExpanded ? 'flex-col space-y-4' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}>
              <Link to="/profile" className={`flex items-center min-w-0 ${isExpanded ? 'flex-1' : ''}`}>
                  <div className={`w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden ring-2 ring-primary/20 ${!isExpanded ? 'mx-auto' : ''}`}>
                    {user?.profile_image ? (
                        <img src={user.profile_image} className="w-full h-full object-cover" alt="" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={`ml-3 flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</span>
                      <span className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</span>
                  </div>
              </Link>
              <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition shrink-0 ${!isExpanded ? 'bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700 ml-2'}`}
              >
                  {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>
          </div>
      </div>
    </aside>
  );
}
