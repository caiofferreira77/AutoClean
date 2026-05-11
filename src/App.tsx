import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useLocation
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';

import { auth, db } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { BookingPage } from './pages/BookingPage';
import { MyAppointments } from './pages/MyAppointments';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { UserProfile } from './types';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <span className="text-xl font-bold tracking-tighter">AC</span>
        </div>
        <span className="text-xl font-black tracking-tight">AutoClean</span>
      </div>
      <p className="text-slate-500 text-sm mb-8">© 2026 AutoClean Estética Automotiva. Todos os direitos reservados.</p>
      <div className="flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <a href="#" className="hover:text-blue-500 transition-colors">Termos</a>
        <a href="#" className="hover:text-blue-500 transition-colors">Privacidade</a>
        <a href="#" className="hover:text-blue-500 transition-colors">Contato</a>
      </div>
    </div>
  </footer>
);

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'phelippes593@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-blue-600 animate-pulse tracking-widest uppercase text-xs">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <Toaster position="bottom-right" />
        <Navbar 
          user={user} 
          isAdmin={isAdmin} 
          onLogout={handleLogout} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/agendar" element={<BookingPage user={user} />} />
              <Route path="/meus-agendamentos" element={<MyAppointments user={user} />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
              />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
