import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import '../styles/auth-inputs.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    cycleLength: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const signupInFlight = useRef(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (signupInFlight.current) return;

    setError('');
    setSuccess('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    signupInFlight.current = true;
    setLoading(true);

    try {
      const parsedAge = parseInt(formData.age, 10);
      const parsedCycle = parseInt(formData.cycleLength, 10);

      const result = await signup(trimmedEmail, formData.password, {
        name: trimmedName,
        age: !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : 25,
        cycleLength: !isNaN(parsedCycle) && parsedCycle > 0 ? parsedCycle : 28,
      });

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setSuccess(result.message || 'Account created! Please check your email to confirm your account.');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again later.');
    } finally {
      signupInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 bg-soft-lavender/20 min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md glass-panel">
        <div className="flex flex-col items-center mb-6">
          <Heart className="text-[#A78BFA] w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Join us for better health tracking</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" name="name" required
              disabled={loading}
              className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-deep-lavender focus:ring-1 focus:ring-deep-lavender transition-smooth disabled:opacity-50"
              onChange={handleChange} placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" name="email" required
              disabled={loading}
              className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-deep-lavender focus:ring-1 focus:ring-deep-lavender transition-smooth disabled:opacity-50"
              onChange={handleChange} placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input 
                type="number" name="age" required
                disabled={loading}
                className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-deep-lavender focus:ring-1 focus:ring-deep-lavender transition-smooth disabled:opacity-50"
                onChange={handleChange} placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Length (Days)</label>
              <input 
                type="number" name="cycleLength" required
                disabled={loading}
                className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-deep-lavender focus:ring-1 focus:ring-deep-lavender transition-smooth disabled:opacity-50"
                onChange={handleChange} placeholder="28"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" name="password" required
              minLength={8}
              disabled={loading}
              className="auth-form-input w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-deep-lavender focus:ring-1 focus:ring-deep-lavender transition-smooth disabled:opacity-50"
              onChange={handleChange} placeholder="•••••••• (min. 8 characters)"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#A78BFA] hover:bg-[#8b6dfa] text-white font-semibold py-2 rounded-lg transition-smooth shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#A78BFA] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
