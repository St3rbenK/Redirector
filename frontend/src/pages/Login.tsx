import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Share2, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
      window.location.reload(); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciais inválidas. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-black text-3xl tracking-tighter mb-20">
            <div className="bg-white p-1.5 rounded-lg">
              <Share2 className="text-indigo-600" size={28} />
            </div>
            <span>REDI<span className="text-indigo-200">RECTOR</span></span>
          </div>
          
          <h2 className="text-6xl font-black leading-tight mb-6">
            Sua distribuição de tráfego, <br />
            <span className="text-indigo-300">inteligente e automática.</span>
          </h2>
          <p className="text-xl text-indigo-100 max-w-lg font-medium leading-relaxed">
            Gerencie múltiplos grupos de WhatsApp, Telegram ou links externos com redirecionamento baseado em capacidade e analytics em tempo real.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-indigo-200 font-bold text-sm uppercase tracking-widest">
           <span>Capacidade Ilimitada</span>
           <span>•</span>
           <span>Round Robin Inteligente</span>
           <span>•</span>
           <span>Analytics 2026</span>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-700 rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-right-10 duration-700">
          <div className="md:hidden flex items-center gap-2 font-black text-2xl tracking-tighter mb-10 justify-center">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Share2 className="text-white" size={24} />
            </div>
            <span className="text-slate-900">REDI<span className="text-indigo-600">RECTOR</span></span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Bem-vindo de volta</h1>
            <p className="text-slate-500 font-bold">Acesse sua conta para gerenciar suas campanhas.</p>
          </div>
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 mb-8 rounded-2xl flex items-center gap-3 animate-shake">
              <div className="bg-rose-100 p-1 rounded-full">
                <Lock size={14} />
              </div>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Endereço de E-mail</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="w-full bg-white border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold shadow-sm"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                <a href="#" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition">Esqueceu a senha?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  className="w-full bg-white border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  ACESSAR DASHBOARD <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400 font-bold text-sm">
            Não tem uma conta? <a href="#" className="text-indigo-600 hover:underline">Entre em contato com o suporte.</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
