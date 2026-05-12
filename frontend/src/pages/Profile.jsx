import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Grid, Heart, MessageSquare, Info, Save, Settings, Share2, Calendar, Camera, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import PostModal from '../components/PostModal';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  // Determine if viewing own profile
  const isOwnProfile = !id || id === (currentUser?.id || currentUser?._id);
  const profileId = id || (currentUser?.id || currentUser?._id);

  // Fetch Profile User Info if NOT own profile
  const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (isOwnProfile) return currentUser;
      const res = await api.get(`/users/${profileId}`);
      return res.data.user;
    },
    enabled: !!profileId,
  });

  // Fetch all posts to filter profile user's posts
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get('/posts');
      return res.data;
    }
  });

  const profilePosts = posts.filter(p => (p.user_id === profileId));

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid },
    { id: 'details', label: 'About & Goals', icon: Info },
  ];

  if (isLoadingProfile) return (
    <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-4 md:py-8 px-4 lg:px-8">
      {/* Main Column */}
      <div className="w-full">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 mb-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 relative z-10">
                
                <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-primary flex items-center justify-center text-white text-3xl md:text-5xl font-black shrink-0 shadow-md overflow-hidden border-4 border-white dark:border-slate-800">
                        {profileUser?.profile_image ? (
                            <img src={profileUser.profile_image} alt={profileUser.name} className="w-full h-full object-cover" />
                        ) : (
                            profileUser?.name?.charAt(0).toUpperCase()
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="max-w-xl">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{profileUser?.name}</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1 mb-2">{profileUser?.email}</p>
                            {profileUser?.bio && (
                                <p className="text-slate-700 dark:text-slate-300 text-[15px] font-medium leading-relaxed mb-3">
                                    {profileUser.bio}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            {isOwnProfile ? (
                                <button 
                                    onClick={() => navigate('/settings')}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors flex items-center space-x-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <button className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-lg hover:bg-primary-hover transition-colors">
                                    Follow
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start space-x-8 mt-6 border-t border-slate-50 dark:border-slate-800 pt-6">
                        <div className="text-center">
                            <span className="block text-lg font-bold text-slate-900 dark:text-white">{profilePosts.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Posts</span>
                        </div>
                        <div className="text-center">
                             <div className="flex items-center space-x-1 justify-center md:justify-start">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="block text-xs font-bold text-slate-900 dark:text-white">Joined {new Date(profileUser?.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Activity History</span>
                        </div>
                    </div>
            </div>
        </div>
    </div>

    {/* Content Area */}
        <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex space-x-1 shadow-sm">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                            {profilePosts.length > 0 ? (
                                profilePosts.map(post => (
                                    <div 
                                        key={post.id || post._id} 
                                        onClick={() => setSelectedPostModal(post)}
                                        className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-primary/20 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{post.category}</span>
                                            <div className="flex items-center space-x-3 text-slate-300 group-hover:text-primary transition">
                                                <div className="flex items-center space-x-1"><Heart className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{post.likes?.length || 0}</span></div>
                                                <div className="flex items-center space-x-1"><MessageSquare className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{post.comments?.length || 0}</span></div>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 mt-3 text-sm font-medium leading-relaxed line-clamp-2">{post.content}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(post.created_at).getDate()} {new Date(post.created_at).toLocaleString('en-US', { month: 'short' })}, {new Date(post.created_at).getFullYear()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <Grid className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No activity insights shared yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest mb-4">Complete Biography</h4>
                                <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    {profileUser?.bio || 'This user is keeping their bio a mystery.'}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest mb-4">Current Well-being Mission</h4>
                                <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    {profileUser?.goals || 'No health mission shared yet.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
      </div>

      {selectedPostModal && (
          <PostModal 
              post={profilePosts.find(p => (p.id || p._id) === (selectedPostModal.id || selectedPostModal._id)) || selectedPostModal} 
              onClose={() => setSelectedPostModal(null)} 
          />
      )}
    </div>
  );
}
