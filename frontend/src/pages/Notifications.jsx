import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Info } from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';
import PostModal from '../components/PostModal';

export default function Notifications() {
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFetchingPost, setIsFetchingPost] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  useEffect(() => {
     // Mark as read when opening the page if there are unread ones
     if (notifications.length > 0 && notifications.some(n => !n.is_read)) {
         markReadMutation.mutate();
     }
  }, [notifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.post_id) return;
    
    setIsFetchingPost(true);
    try {
        const res = await api.get(`/posts/${notification.post_id}`);
        setSelectedPost(res.data);
    } catch (err) {
        console.error("Failed to fetch post:", err);
    } finally {
        setIsFetchingPost(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 md:py-8 px-4 lg:px-8">
      {/* Main Column */}
      <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4 md:mb-8">
          Notifications
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {notifications.length > 0 ? (
           <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {notifications.map((n, idx) => (
                <div 
                    key={n.id || n._id || idx} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 md:p-6 flex items-start space-x-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                    
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-lg overflow-hidden ring-2 ring-primary/20">
                            {n.actor_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white ${n.type === 'like' ? 'bg-rose-500' : 'bg-primary'}`}>
                            {n.type === 'like' ? <Heart className="w-3 h-3 fill-current" /> : <MessageCircle className="w-3 h-3 fill-current" />}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                        <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-snug">
                            <span className="font-bold text-slate-900 dark:text-white">{n.actor_name}</span> 
                            {n.type === 'like' ? ' liked your recent post.' : ' commented on your post.'}
                        </p>
                            <span className="text-[10px] text-slate-400 font-medium mt-1.5 block lowercase">
                                {new Date(n.created_at).getDate()} {new Date(n.created_at).toLocaleString('en-US', { month: 'long' })}, {new Date(n.created_at).getFullYear()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                    </div>

                    {!n.is_read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-3"></div>
                    )}
                </div>
             ))}
           </div>
        ) : (
           <div className="p-12 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                   <Info className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Notifications Yet</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm">When someone interacts with your posts, you'll see it here.</p>
           </div>
        )}
      </div>
      </div>

      {/* Popup / Modal */}
      {selectedPost && (
          <PostModal 
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
          />
      )}

      {/* Loading Overlay for fetching post */}
      {isFetchingPost && (
          <div className="fixed inset-0 z-[110] bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Opening post...</span>
              </div>
          </div>
      )}
    </div>
  );
}
