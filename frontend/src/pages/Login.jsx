import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Activity, Brain } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error('Invalid credentials or server error.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full my-auto transition-colors duration-300 border border-brand-border">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4">
            <img src={logo} alt="MindMitra Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tighter">
            MindMitra
          </h1>
          <p className="text-secondary font-medium text-sm tracking-wide mt-1 uppercase">
            Your Mind’s Best Friend.
          </p>
        </div>

        <h2 className="text-gray-700 dark:text-gray-200 text-center font-semibold text-lg mb-8">
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 px-4 rounded-xl text-white font-bold text-lg bg-primary hover:bg-primary-hover transform transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
            Join MindMitra
          </Link>
        </p>

      </div>
    </div>
  );
}
