import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Heart, MessageCircle, MoreHorizontal, Send, Image as ImageIcon, X, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import RightSidebar from '../components/RightSidebar';
import PostModal from '../components/PostModal';

export default function Feed() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Fitness');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Post Management States
  const [activeMenuPost, setActiveMenuPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  // Fetch Posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get('/posts');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const submitPostMutation = useMutation({
    mutationFn: (formData) => api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post published');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  });

  const likePostMutation = useMutation({
    mutationFn: (postId) => api.post(`/posts/${postId}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, comment }) => api.post(`/posts/${postId}/comment`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCommentText('');
      setActiveCommentPost(null);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully');
    }
  });

  const editPostMutation = useMutation({
    mutationFn: ({ id, content, category }) => api.put(`/posts/${id}`, { content, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post updated');
      setEditingPost(null);
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('category', category);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    submitPostMutation.mutate(formData);
  };

  const handleCommentSubmit = (postId) => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ postId, comment: commentText });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex justify-center xl:justify-between items-start gap-6 lg:gap-12 px-4 lg:px-12 xl:px-24">
      {/* Main Feed Column */}
      <div className="w-full max-w-2xl py-4 md:py-8">
      
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4 md:mb-8">
          Community Feed
      </h1>

      {/* Simple Create Post */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <form onSubmit={handlePostSubmit}>
          <div className="p-3 flex space-x-3 items-start">
             <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ring-2 ring-primary/10">
                {user?.profile_image ? (
                    <img src={user.profile_image} className="w-full h-full object-cover" alt="" />
                ) : (
                    user?.name?.charAt(0).toUpperCase()
                )}
             </div>
             <div className="flex-1 pt-0.5">
                <textarea
                  className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-none resize-none font-medium text-[15px] placeholder-slate-400"
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                  rows="2"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl border border-slate-100 dark:border-slate-800 object-contain bg-slate-50 dark:bg-slate-950" />
                    <button 
                      type="button"
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition backdrop-blur-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
             </div>
          </div>
          
          {/* Categories Strip */}
          <div className="px-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800">
            <div className="flex space-x-2">
              {['Fitness', 'Mental Health', 'Diet', 'Yoga'].map(cat => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${category === cat ? 'bg-secondary text-white shadow-sm ring-2 ring-secondary/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Action container with distinct background */}
          <div className="bg-slate-50 dark:bg-slate-800/30 px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label title="Attach Image" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors shadow-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <ImageIcon className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>

            <button 
              type="submit" 
              className="bg-primary text-white font-bold py-1.5 px-6 rounded-full hover:bg-primary-hover shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-xs" 
              disabled={(!content.trim() && !selectedImage) || submitPostMutation.isPending}
            >
              {submitPostMutation.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mb-5 md:mb-6 mt-1 sm:mt-0">
        <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 md:space-y-6">
        {isLoadingPosts ? (
          <div className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Feed...</div>
        ) : posts.map(post => {
          const isLiked = post.likes?.includes(user?.id || user?._id);
          return (
            <div key={post.id || post._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              
              <div className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/profile/${post.user_id}`} className="hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-primary ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
                        {post.user?.profile_image ? (
                           <img src={post.user.profile_image} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                           post.user?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${post.user_id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none">{post.user?.name}</h3>
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium lowercase">
                          • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {post.user_id === (user?.id || user?._id) && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuPost(activeMenuPost === (post.id || post._id) ? null : (post.id || post._id))}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {activeMenuPost === (post.id || post._id) && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 z-20 py-1 overflow-hidden">
                          <button 
                            onClick={() => { setEditingPost(post); setActiveMenuPost(null); }}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            Edit Post
                          </button>
                          <button 
                            onClick={() => { deletePostMutation.mutate(post.id || post._id); setActiveMenuPost(null); }}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                          >
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingPost && (editingPost.id === post.id && editingPost._id === post._id) ? (
                  <div className="mb-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <textarea
                      className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-none resize-none font-medium text-sm mb-2"
                      rows="3"
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                       <button onClick={() => setEditingPost(null)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">Cancel</button>
                       <button 
                        onClick={() => editPostMutation.mutate({ id: post.id || post._id, content: editingPost.content, category: editingPost.category || post.category })} 
                        disabled={editPostMutation.isPending || !editingPost.content.trim()}
                        className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
                       >
                         {editPostMutation.isPending ? 'Saving...' : 'Save Changes'}
                       </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium mb-4">
                    {post.content}
                  </p>
                )}

                {post.image && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img src={post.image} alt="Post content" className="w-full object-cover max-h-[512px]" />
                  </div>
                )}

                <div className="flex items-center space-x-6 pt-3 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={() => likePostMutation.mutate(post.id || post._id)} 
                    className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const pid = post.id || post._id;
                      setActiveCommentPost(activeCommentPost === pid ? null : pid);
                    }}
                    className={`flex items-center space-x-2 transition-colors ${activeCommentPost === (post.id || post._id) ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Simple Comments */}
                {activeCommentPost === (post.id || post._id) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex items-center space-x-2 mb-4">
                        <input 
                          type="text"
                          placeholder="Write a comment..."
                          className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white font-medium"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id || post._id)}
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id || post._id)}
                          className="bg-primary text-white p-1.5 rounded-lg shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-30"
                          disabled={!commentText.trim() || commentMutation.isPending}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                     </div>

                     <div className="space-y-3">
                       {post.comments?.length > 0 ? (
                         post.comments.map((comment, idx) => (
                           <div key={idx} className="flex space-x-3 group">
                              <Link to={`/profile/${comment.user_id}`} className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden hover:opacity-80 transition">
                                 {comment.user_image ? (
                                    <img src={comment.user_image} alt={comment.user_name} className="w-full h-full object-cover" />
                                 ) : (
                                    comment.user_name?.charAt(0).toUpperCase()
                                 )}
                              </Link>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{comment.user_name}</h4>
                                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal font-medium">{comment.text}</p>
                              </div>
                           </div>
                         ))
                       ) : (
                         <p className="text-center text-slate-400 text-[10px] py-2 font-medium">No comments yet.</p>
                       )}
                     </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Right Sidebar Column */}
    <RightSidebar onPostClick={(post) => setSelectedPostModal(post)} />

    {/* Post Modal Overlay */}
    {selectedPostModal && (
        <PostModal 
           post={posts.find(p => (p.id || p._id) === (selectedPostModal.id || selectedPostModal._id)) || selectedPostModal} 
           onClose={() => setSelectedPostModal(null)} 
        />
    )}
  </div>
  );
}
