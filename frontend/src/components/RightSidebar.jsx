import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Heart, Flame, MessageCircle } from 'lucide-react';
import api from '../services/api';

export default function RightSidebar({ onPostClick }) {
  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      const res = await api.get('/users/search?q='); // empty query fetches recent users
      return res.data;
    },
  });

  const { data: posts = [] } = useQuery({ 
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get('/posts');
      return res.data;
    }
  });

  const trendingPosts = [...posts]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);

  return (
    <div className="hidden lg:block w-80 xl:w-96 shrink-0 py-8 px-4 h-full sticky top-0 overflow-y-auto no-scrollbar">
      
      {/* Suggestions Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-slate-900 dark:text-white">Suggested for You</h3>
        </div>
        
        <div className="flex flex-col space-y-4">
          {suggestions.slice(0, 5).map(user => (
            <Link 
              key={user.id || user._id} 
              to={`/profile/${user.id || user._id}`}
              className="flex items-center group"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition">
                 {user.profile_image ? (
                     <img src={user.profile_image} className="w-full h-full object-cover" alt="" />
                 ) : (
                     user.name.charAt(0).toUpperCase()
                 )}
              </div>
              <div className="ml-3 flex flex-col min-w-0 flex-1">
                 <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{user.name}</span>
                 <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
              </div>
              <button className="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                View
              </button>
            </Link>
          ))}
          {suggestions.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No suggestions yet.</p>
          )}
        </div>
      </div>

      {/* Trending Posts Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Flame className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          <h3 className="font-black text-slate-900 dark:text-white">Trending Posts</h3>
        </div>
        
        <div className="space-y-4">
          {trendingPosts.length > 0 ? trendingPosts.map((post) => (
            <div 
               key={post.id || post._id} 
               onClick={() => onPostClick && onPostClick(post)}
               className="flex justify-between items-start group cursor-pointer pb-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors last:border-0 last:pb-2"
            >
               <div className="flex flex-col min-w-0 flex-1">
                   <div className="flex items-center space-x-2 mb-1">
                       <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                           {post.user?.profile_image ? (
                               <img src={post.user.profile_image} className="w-full h-full object-cover" alt="" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{post.user?.name?.charAt(0).toUpperCase()}</div>
                           )}
                       </div>
                       <span className="text-[10px] font-medium text-slate-500 truncate">{post.user?.name || 'Unknown'}</span>
                   </div>
                   <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug">
                      {post.content}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-2 flex items-center space-x-3">
                      <span className="flex items-center"><Heart className="w-3 h-3 mr-1 text-rose-500 fill-rose-500/20" /> {post.likes?.length || 0}</span> 
                      <span className="flex items-center"><MessageCircle className="w-3 h-3 mr-1 text-indigo-500 fill-indigo-500/20" /> {post.comments?.length || 0}</span> 
                   </span>
               </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 text-center py-2">No trending posts yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center px-4">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
              &copy; 2026 MindMitra.<br/> Built for Health & Wellness.
          </p>
      </div>
    </div>
  );
}
