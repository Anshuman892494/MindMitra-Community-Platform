import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Home, User as UserIcon, LogOut, Search, Compass, PlusCircle, Brain } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const lastNotificationIdRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Fetch Search Results
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['usersSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await api.get(`/users/search?q=${searchQuery}`);
      return res.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    // Detect new notifications for toast
    if (notifications.length > 0) {
      const latest = notifications[0];
      const latestId = latest.id || latest._id;
      
      if (lastNotificationIdRef.current === null) {
          lastNotificationIdRef.current = latestId;
      } else if (latestId !== lastNotificationIdRef.current && !latest.is_read) {
          toast.info(latest.message, {
              icon: latest.type === 'like' ? '❤️' : '💬',
          });
          lastNotificationIdRef.current = latestId;
      }
    }
  }, [notifications]);

  return (
    <nav className="sticky top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 px-4 md:px-6 flex justify-between md:justify-center items-center shadow-sm">
      
      {/* Mobile Brand (Hidden on Desktop) */}
      <div className="flex items-center space-x-2 md:hidden">
         <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary tracking-tight group">
            <div className="w-8 h-8 overflow-hidden transform transition-transform group-hover:scale-110">
                <img src={logo} alt="MindMitra Logo" className="w-full h-full object-contain" />
            </div>
            <span>MindMitra</span>
         </Link>
      </div>

      {/* Global Search - Centered on Desktop, Hidden on Mobile */}
      <div className="hidden md:flex flex-col w-full max-w-xl relative">
          <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search users..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-medium"
               />
          </div>
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
              <div 
                 className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                 onMouseDown={(e) => e.preventDefault()}
              >
                 {isSearching ? (
                     <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
                 ) : searchResults.length > 0 ? (
                     <div className="max-h-80 overflow-y-auto py-2">
                       {searchResults.map(result => (
                           <Link 
                               key={result.id || result._id} 
                               to={`/profile/${result.id || result._id}`}
                               className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                               onClick={() => {
                                   setSearchQuery('');
                                   setIsSearchFocused(false);
                               }}
                           >
                               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden ring-2 ring-primary/20">
                                   {result.profile_image ? (
                                       <img src={result.profile_image} className="w-full h-full object-cover" alt="" />
                                   ) : (
                                       result.name.charAt(0).toUpperCase()
                                   )}
                               </div>
                               <div className="ml-3 flex flex-col min-w-0">
                                   <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.name}</span>
                                   <span className="text-[10px] text-slate-500 truncate">{result.email}</span>
                               </div>
                           </Link>
                       ))}
                     </div>
                 ) : (
                     <div className="p-4 text-center text-slate-400 text-sm">No users found</div>
                 )}
              </div>
          )}
      </div>

      {/* Mobile Notifications (Hidden on Desktop) */}
      <div className="md:hidden">
          <Link 
            to="/notifications"
            className="p-2 rounded-lg transition-colors relative hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 block"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </Link>
      </div>

    </nav>
  );
}
