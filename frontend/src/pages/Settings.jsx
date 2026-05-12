import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Shield, Phone, Mail, Save, Lock, Camera, Trash2, Globe, Heart, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    goals: '',
    email: '',
    mobile: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        goals: user.goals || '',
        email: user.email || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.post('/user', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    }),
    onSuccess: (res) => {
      updateUser(res.data.user);
      queryClient.setQueryData(['user'], res.data.user);
      toast.success('Profile settings updated ✨');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.post('/user/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully 🔒');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  });

  const removeImageMutation = useMutation({
    mutationFn: () => api.delete('/user/image'),
    onSuccess: (res) => {
      updateUser(res.data.user);
      queryClient.setQueryData(['user'], res.data.user);
      toast.success('Photo removed');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    formData.append('bio', profileData.bio);
    formData.append('goals', profileData.goals);
    formData.append('mobile', profileData.mobile);
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return toast.error('Passwords do not match');
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    formData.append('bio', profileData.bio);
    formData.append('goals', profileData.goals);
    formData.append('mobile', profileData.mobile);
    formData.append('image', file);

    setIsUploading(true);
    updateProfileMutation.mutate(formData, {
        onSettled: () => setIsUploading(false)
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 md:py-8 px-4 lg:px-8">
      {/* Main Column */}
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
            Settings
        </h1>
        <p className="text-slate-500 font-medium mt-2 mb-8">Personalize your profile and manage security.</p>

        <div className="grid grid-cols-1 gap-8">
            
            {/* 1. Profile Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Public Profile</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Visible to others on the platform.</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 mb-10">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-2xl bg-primary flex items-center justify-center text-white text-4xl font-black shrink-0 shadow-lg overflow-hidden ring-4 ring-white dark:ring-slate-800">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 flex flex-col space-y-1">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-hover transition-transform active:scale-90"
                                    title="Change Photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                {user?.profile_image && (
                                    <button 
                                        onClick={() => removeImageMutation.mutate()}
                                        className="p-2 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-transform active:scale-90"
                                        title="Remove Photo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your Avatar</h3>
                            <p className="text-slate-500 text-sm font-medium mb-3">Square image, max 5MB.</p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                Upload New Photo
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Display Name</label>
                                <input 
                                    value={profileData.name} 
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Public Bio</label>
                                <input 
                                    value={profileData.bio} 
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    placeholder="Brief description"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Health Goals</label>
                            <textarea 
                                rows="3" 
                                value={profileData.goals} 
                                onChange={(e) => setProfileData({...profileData, goals: e.target.value})}
                                placeholder="What are your goals?"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white resize-none" 
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <Globe className="w-4 h-4 mr-2 text-slate-400" /> Private Contact Information
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email"
                                            value={profileData.email} 
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel"
                                            placeholder="+91 00000 00000"
                                            value={profileData.mobile} 
                                            onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={updateProfileMutation.isPending}
                                className="bg-primary text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:bg-primary-hover transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save All Details'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 2. Security Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-12">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Security & Password</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Keep account secure.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="password"
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={changePasswordMutation.isPending}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 px-8 rounded-xl font-bold shadow-lg hover:opacity-90 transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                            >
                                <Lock className="w-5 h-5" />
                                <span>{changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 3. Account Actions */}
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-none">Account Actions</h2>
                    <p className="text-xs text-rose-500/70 font-medium mt-1">Manage your session and account security.</p>
                </div>
                <button 
                    onClick={logout}
                    className="w-full md:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
