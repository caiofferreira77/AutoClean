import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Car, Mail, Lock, User, LogIn, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao entrar com Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vindo de volta!');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 pt-24 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100 dark:shadow-none">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isRegister ? 'Criar Conta' : 'Área do Cliente'}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {isRegister ? 'Junte-se à revolução da limpeza automotiva.' : 'Entre para gerenciar seus agendamentos.'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="text" 
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                required
                type="email" 
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                required
                type="password" 
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : (isRegister ? 'Criar Conta' : 'Entrar Agora')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs font-bold"><span className="px-2 bg-white dark:bg-slate-900 text-slate-400 uppercase tracking-widest transition-colors">Ou continue com</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Entrar com Google
          </button>

          <p className="text-center text-sm font-medium text-slate-500">
            {isRegister ? 'Já possui conta?' : 'Ainda não é cliente?'}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isRegister ? 'Fazer login' : 'Criar conta gratuita'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
