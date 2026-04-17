import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', bio: '', goals: '' });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Collect specific validation errors from Laravel
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0]; // Extract the first specific validation string
        toast.error(firstError);
      } else {
        toast.error('Error creating account. Please check your details.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full my-auto transition-colors duration-300 border border-brand-border">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-3">
             <img src={logo} alt="MindMitra Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tighter">
            Join MindMitra
          </h1>
          <p className="text-secondary font-medium text-xs tracking-widest mt-1 uppercase">
            Your Mind’s Best Friend.
          </p>
        </div>

        <h2 className="text-gray-700 dark:text-gray-200 text-center font-semibold text-sm mb-6">
          Start your wellness journey today
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              name="name" type="text" required
              value={formData.name}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="Alex Johnson"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              name="email" type="email" required
              value={formData.email}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="alex@example.com"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-400 mb-1 uppercase tracking-wider">Password</label>
            <input 
              name="password" type="password" required minLength="8"
              value={formData.password}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="Min 8 characters"
              onChange={handleChange}
            />
          </div>
          <div>
             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-400 mb-1 uppercase tracking-wider">Bio (Optional)</label>
            <textarea 
              name="bio" rows="2"
              value={formData.bio}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="E.g. Meditation enthusiast..."
              onChange={handleChange}
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 rounded-xl text-white font-bold text-lg bg-primary hover:bg-primary-hover transform transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          Already a member?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
