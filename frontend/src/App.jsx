import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Calendar, Activity, MessageCircle, Star, UserCircle, LogOut, Sparkles, Bell, CalendarDays, MapPin, Crown, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LogCycle from './pages/LogCycle';
import Posts from './pages/Posts';
import CommunityChat from './pages/CommunityChat';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import HealthAssessment from './pages/HealthAssessment';
import PeriodHistory from './pages/PeriodHistory';
import Symptoms from './pages/Symptoms';
import Awareness from './pages/Awareness';

const Navigation = () => {
  const { user, logout } = useAuth();

  const location = useLocation();

  if (!user) return null;

  const navLinks = [
    { name: 'Dashboard',       path: '/dashboard',   icon: LayoutDashboard },
    { name: 'Calendar',        path: '/log-cycle',   icon: CalendarDays    },
    { name: 'Bookings & Care', path: '/find-care',   icon: MapPin          },
    { name: 'Assessment',      path: '/assessment',  icon: Sparkles        },
    { name: 'Awareness',       path: '/awareness',   icon: ShieldCheck     },
    { name: 'Subscription',    path: '/subscription',icon: Crown           },
    { name: 'Community',       path: '/chat',        icon: MessageCircle   },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 px-2 pt-2 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1800px] rounded-[24px] border border-[var(--soft-border)] bg-[var(--card-bg)]/90 px-3 py-2 shadow-[0_16px_30px_rgba(23,33,61,0.04)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--soft-lavender)] text-[var(--deep-navy)]">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[1.2rem] font-black tracking-[-0.04em] text-[var(--deep-navy)] sm:text-[1.35rem]">
                  <span className="font-[Georgia] italic">Fem</span>
                  <span className="font-[Georgia] italic text-[var(--rose-gold)]">Care</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-2 rounded-[20px] border border-[var(--soft-border)] bg-[var(--soft-lavender)] p-1.5 shadow-inner shadow-[var(--soft-lavender)]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex h-9 w-9 items-center justify-center rounded-[14px] transition-all duration-200 ${active ? 'bg-[#17213D] text-[#FFFDFC] shadow-md scale-[1.04]' : 'text-[#667085] hover:bg-[#FFFDFC] hover:text-[#17213D] hover:shadow-sm'}`}
                    title={link.name}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--soft-border)] bg-[var(--card-bg)] text-[var(--deep-navy)]">
              <Bell className="h-4 w-4" />
            </button>
            <Link to="/profile" className="flex items-center gap-2 rounded-full border border-[var(--soft-border)] bg-[var(--card-bg)] px-1.5 py-1 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--blush)] text-[0.72rem] font-bold text-[var(--deep-navy)]">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hidden min-w-0 text-left sm:block">
                <div className="truncate text-xs font-semibold text-[var(--deep-navy)]">{user?.name || user?.email?.split('@')[0] || 'Profile'}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-pink"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

// Components
import ChatbotWidget from './components/ChatbotWidget';
import SplashScreen from './components/SplashScreen';
import FindCare from './pages/FindCare';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-full overflow-x-hidden bg-[var(--page-bg)] flex flex-col font-sans">
          <Navigation />
          <main className="relative w-full flex-grow overflow-x-hidden bg-[var(--page-bg)]">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/log-cycle" element={<ProtectedRoute><LogCycle /></ProtectedRoute>} />
              <Route path="/period-history" element={<ProtectedRoute><PeriodHistory /></ProtectedRoute>} />
              <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
              <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><HealthAssessment /></ProtectedRoute>} />
              <Route path="/awareness"   element={<ProtectedRoute><Awareness /></ProtectedRoute>} />
              <Route path="/learn"       element={<Navigate to="/awareness" replace />} />
              <Route path="/find-care"    element={<ProtectedRoute><FindCare /></ProtectedRoute>} />
              {/* /chat-support redirects to Support Community (AI Assistant tab opened via navigate state) */}
              <Route path="/chat-support" element={<Navigate to="/chat" />} />
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>

            {/* Global Floating Chatbot Widget */}
            <ChatbotWidget />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

