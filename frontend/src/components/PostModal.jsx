import { X, Heart, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function PostModal({ post, onClose }) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const likeMutation = useMutation({
    mutationFn: (postId) => api.post(`/posts/${postId}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, comment }) => api.post(`/posts/${postId}/comment`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCommentText('');
    }
  });

  if (!post) return null;

  const isLiked = post.likes?.includes(user?.id || user?._id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-10 mb-10 relative">
        
        {/* Header / Close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-primary ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
                {post.user?.profile_image ? (
                    <img src={post.user.profile_image} className="w-full h-full object-cover" alt="" />
                ) : (
                    post.user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                 <span className="font-bold text-slate-900 dark:text-white text-base leading-none">{post.user?.name}</span>
                 <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{post.category}</span>
                    <span className="text-[10px] text-slate-400 font-medium lowercase">• {new Date(post.created_at).getDate()} {new Date(post.created_at).toLocaleString('en-US', { month: 'long' })}, {new Date(post.created_at).getFullYear()} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
           >
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Post Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
            {post.content && (
              <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
              </p>
            )}
            {post.image_url && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <img src={post.image_url} alt="Post image" className="w-full h-auto max-h-96 object-contain" />
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center space-x-6 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
               <button 
                 onClick={() => likeMutation.mutate(post.id || post._id)}
                 className={`flex items-center space-x-2 transition-colors font-bold text-sm ${isLiked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}
               >
                 <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                 <span>{post.likes?.length || 0}</span>
               </button>
               <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                 <MessageCircle className="w-5 h-5" />
                 <span>{post.comments?.length || 0}</span>
               </div>
            </div>

            {/* Comments Section */}
            <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Comments</h4>
               
               <div className="flex items-start space-x-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden ring-1 ring-primary/20">
                    {user?.profile_image ? (
                        <img src={user.profile_image} className="w-full h-full object-cover" alt="" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase()
                    )}
                 </div>
                 <div className="flex-1 flex space-x-2">
                   <input
                     type="text"
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && commentText.trim()) {
                         commentMutation.mutate({ postId: post.id || post._id, comment: commentText });
                       }
                     }}
                     placeholder="Write a comment..."
                     className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition"
                   />
                   <button
                     onClick={() => commentMutation.mutate({ postId: post.id || post._id, comment: commentText })}
                     disabled={!commentText.trim()}
                     className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition"
                   >
                     Post
                   </button>
                 </div>
               </div>

               <div className="space-y-4">
                 {post.comments?.length > 0 ? (
                   [...post.comments].reverse().map((comment, idx) => (
                     <div key={idx} className="flex space-x-3">
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[10px] text-slate-500 flex items-center justify-center shrink-0">
                          {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                       </div>
                       <div className="bg-white dark:bg-slate-900 rounded-lg rounded-tl-none p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex-1">
                          <div className="flex justify-between items-baseline">
                             <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.user_name}</span>
                             <span className="text-[9px] text-slate-400">{new Date(comment.created_at).getDate()} {new Date(comment.created_at).toLocaleString('en-US', { month: 'long' })}, {new Date(comment.created_at).getFullYear()} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-snug font-medium">{comment.text}</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-center text-slate-400 text-xs py-4">No comments yet. Be the first to start the conversation!</p>
                 )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
