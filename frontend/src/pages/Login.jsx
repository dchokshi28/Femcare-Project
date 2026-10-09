import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import '../styles/auth-inputs.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-soft-pink/20">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md glass-panel">
        <div className="flex flex-col items-center mb-6">
          <Activity className="text-[#F472B6] w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to track your health</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              disabled={loading}
              className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-pink focus:border-transparent outline-none transition-smooth disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-pink focus:border-transparent outline-none transition-smooth disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F472B6] hover:bg-[#db62a2] text-white font-semibold py-2 rounded-lg transition-smooth shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-[#F472B6] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
