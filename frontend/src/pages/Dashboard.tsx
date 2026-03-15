import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, ExternalLink, Users, LogOut, 
  Settings, Layers, Share2, 
  ChevronRight, BarChart3, Copy, Check, Globe, Shield, CreditCard, UserPlus, Lock, Mail
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
    <div className="bg-indigo-600 p-1.5 rounded-lg">
      <Share2 className="text-white" size={24} />
    </div>
    <span className="text-slate-900">REDI<span className="text-indigo-600">RECTOR</span></span>
  </div>
);

interface GroupType {
  id: number;
  name: string;
  link: string;
  maxClicks: number;
  currentClicks: number;
  clickCount: number;
}

interface CampaignType {
  id: number;
  name: string;
  slug: string;
  description: string;
  groups?: GroupType[];
}

interface UserType {
  id: number;
  email: string;
  role: string;
  planType: string;
  createdAt: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newCampaign, setNewCampaign] = useState({ name: '', slug: '', description: '' });
  const [newGroup, setNewGroup] = useState({ name: '', link: '', maxClicks: 100 });
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', planType: 'free' });
  const [profileData, setProfileProfileData] = useState({ password: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (activeTab === 'settings' && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, currentUser]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/campaigns', newCampaign);
      setShowCampaignModal(false);
      setNewCampaign({ name: '', slug: '', description: '' });
      fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (confirm('Deseja excluir permanentemente esta campanha?')) {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setLoading(true);
    try {
      await api.post('/groups', { ...newGroup, campaignId: selectedCampaign.id });
      setShowGroupModal(false);
      setNewGroup({ name: '', link: '', maxClicks: 100 });
      fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm('Excluir este grupo?')) {
      await api.delete(`/groups/${id}`);
      fetchCampaigns();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/profile', profileData);
      alert('Perfil atualizado!');
      setProfileProfileData({ password: '' });
    } catch (err) {
      alert('Erro ao atualizar perfil');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/users', newUser);
      setShowUserModal(false);
      setNewUser({ email: '', password: '', role: 'user', planType: 'free' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Excluir este usuário permanentemente?')) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'campaigns':
        return (
          <>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Minhas Campanhas</h1>
                <p className="text-slate-500 font-bold">Gerencie e otimize seus links de redirecionamento</p>
              </div>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="group flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-all font-black shadow-xl shadow-indigo-100 uppercase italic tracking-widest active:scale-95"
              >
                <Plus size={22} /> Nova Campanha
              </button>
            </header>

            {campaigns.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[40px] border border-slate-200/60 shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Layers className="text-slate-300" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Sua jornada começa aqui</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-10 font-bold">Adicione sua primeira campanha para começar a distribuir seus leads entre os grupos.</p>
                <button 
                  onClick={() => setShowCampaignModal(true)}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all font-black shadow-xl active:scale-95 uppercase italic"
                >
                  <Plus size={24} /> Criar Campanha
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {campaigns.map((c, index) => (
                  <div key={c.id} className="bg-white rounded-[40px] shadow-sm border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-8 border-b border-slate-100 bg-white flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{c.name}</h3>
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativa
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-sm">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-indigo-600 font-black tracking-tight group">
                            <span>/{c.slug}</span>
                            <button onClick={() => handleCopy(c.slug)} className="hover:text-indigo-800 transition">
                              {copiedId === c.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <span className="text-slate-300">|</span>
                          <p className="italic text-slate-400 max-w-xs truncate">{c.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={`/${c.slug}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase border border-slate-200 shadow-sm">
                          <ExternalLink size={18} /> Testar
                        </a>
                        <button onClick={() => { setSelectedCampaign(c); setShowGroupModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase shadow-lg shadow-indigo-100 active:scale-95 tracking-widest">
                          <Plus size={18} /> Add Grupo
                        </button>
                        <button onClick={() => handleDeleteCampaign(c.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-50/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {c.groups?.map((g) => (
                          <div key={g.id} className="group bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-100 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50">
                            <div className="mb-6 flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <div className="bg-slate-50 w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                   <Users size={20} />
                                </div>
                                <button onClick={() => handleDeleteGroup(g.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100 duration-300">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 mb-1 tracking-tight text-lg uppercase italic">{g.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest uppercase">{g.link}</p>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acessos</span>
                                   <span className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">{g.currentClicks} / {g.maxClicks}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-200/50">
                                  <div style={{ width: `${Math.min((g.currentClicks / g.maxClicks) * 100, 100)}%` }} className={`h-full rounded-full transition-all duration-1000 ${ (g.currentClicks / g.maxClicks) > 0.9 ? 'bg-rose-500' : (g.currentClicks / g.maxClicks) > 0.7 ? 'bg-amber-500' : 'bg-indigo-500' } shadow-sm`}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-50 pt-4 group-hover:text-slate-400 transition-colors">
                               <div className="flex items-center gap-1.5"><ChevronRight size={14} /> Total: {g.clickCount}</div>
                               <div className={g.currentClicks >= g.maxClicks ? 'text-rose-500' : 'text-indigo-400'}>
                                 {g.currentClicks >= g.maxClicks ? 'Lotado' : 'Operando'}
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case 'analytics':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-10 text-center md:text-left">Performance Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               {[
                 { label: 'Total de Cliques', value: campaigns.reduce((acc, c) => acc + (c.groups?.reduce((gacc, g) => gacc + g.clickCount, 0) || 0), 0), icon: BarChart3, color: 'text-indigo-600' },
                 { label: 'Campanhas Ativas', value: campaigns.length, icon: Layers, color: 'text-emerald-600' },
                 { label: 'Grupos Totais', value: campaigns.reduce((acc, c) => acc + (c.groups?.length || 0), 0), icon: Users, color: 'text-amber-600' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <stat.icon className={`${stat.color} mb-4`} size={28} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h4>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-10">Configurações</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Seção de Perfil - Visível para todos */}
               <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                        <Lock size={24} />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 uppercase italic">Segurança do Perfil</h3>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                     <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                        <input 
                          type="password" 
                          placeholder="Mudar sua senha de acesso"
                          className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                          value={profileData.password}
                          onChange={e => setProfileProfileData({ password: e.target.value })}
                        />
                     </div>
                     <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-black transition-all">
                        Atualizar Senha
                     </button>
                  </form>
               </div>

               {/* Seção Admin - Apenas Super Admin */}
               {currentUser?.role === 'admin' && (
                 <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                             <UserPlus size={24} />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 uppercase italic">Gestão de Usuários</h3>
                       </div>
                       <button 
                         onClick={() => setShowUserModal(true)}
                         className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                       >
                         <Plus size={20} />
                       </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                       {users.map(u => (
                         <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                               <p className="font-black text-slate-900 text-sm">{u.email}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{u.role}</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{u.planType}</span>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Seção de Planos - Apenas Admin */}
               {currentUser?.role === 'admin' && (
                 <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                          <CreditCard size={24} />
                       </div>
                       <h3 className="text-xl font-black text-slate-900 uppercase italic">Configuração de Planos e Valores</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {[
                         { name: 'FREE', limit: '3 Campanhas', price: 'R$ 0,00' },
                         { name: 'PRO', limit: '20 Campanhas', price: 'R$ 49,90' },
                         { name: 'ENTERPRISE', limit: 'Ilimitado', price: 'R$ 99,90' }
                       ].map((plan, i) => (
                         <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-200 transition-all group">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{plan.name}</p>
                            <h4 className="text-2xl font-black text-slate-900 mb-4 italic">{plan.price}<span className="text-xs text-slate-400 font-bold not-italic">/mês</span></h4>
                            <div className="space-y-2 mb-6">
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                  <Check size={14} className="text-emerald-500" /> {plan.limit}
                               </div>
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                  <Check size={14} className="text-emerald-500" /> Suporte 24/7
                               </div>
                            </div>
                            <button className="w-full bg-white border border-slate-200 text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                               Editar Limites
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 md:h-screen">
        <Logo />
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-3 p-4 rounded-2xl font-black transition-all text-left uppercase italic text-xs tracking-widest ${activeTab === 'campaigns' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <Layers size={20} /> Campanhas
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 p-4 rounded-2xl font-black transition-all text-left uppercase italic text-xs tracking-widest ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <BarChart3 size={20} /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-4 rounded-2xl font-black transition-all text-left uppercase italic text-xs tracking-widest ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <Settings size={20} /> Configurações
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-[32px] p-5 text-white shadow-2xl">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Operador {currentUser?.role === 'admin' ? '(Admin)' : ''}</p>
             <p className="font-black truncate text-sm italic uppercase tracking-tight">{currentUser?.email || '...'}</p>
             <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-rose-400 hover:text-rose-300 text-[10px] font-black transition uppercase tracking-widest">
               <LogOut size={14} /> Sair do Sistema
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Modals */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Nova Campanha</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome</label>
                <input placeholder="Ex: Lançamento VIP" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-sm uppercase italic" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Slug</label>
                <input placeholder="promo-leads" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-sm text-indigo-600 uppercase italic" value={newCampaign.slug} onChange={e => setNewCampaign({...newCampaign, slug: e.target.value})} required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-sm">{loading ? '...' : 'Salvar'}</button>
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Novo Grupo</h2>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome</label>
                <input placeholder="Ex: Grupo 01" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-sm uppercase italic" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Link</label>
                <input placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-sm italic" value={newGroup.link} onChange={e => setNewGroup({...newGroup, link: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Limite</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-sm italic" value={newGroup.maxClicks} onChange={e => setNewGroup({...newGroup, maxClicks: parseInt(e.target.value)})} required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-sm">{loading ? '...' : 'Salvar'}</button>
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Novo Usuário</h2>
            <p className="text-slate-500 font-bold mb-8">Cadastre um novo operador no sistema.</p>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                <div className="relative group">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="email" placeholder="email@exemplo.com" className="w-full bg-slate-50 border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Inicial</label>
                <div className="relative group">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nível</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xs uppercase italic" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                       <option value="user">Usuário</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Plano</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xs uppercase italic" value={newUser.planType} onChange={e => setNewUser({...newUser, planType: e.target.value})}>
                       <option value="free">Free</option>
                       <option value="pro">Pro</option>
                       <option value="enterprise">Enterprise</option>
                    </select>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-sm">{loading ? '...' : 'Cadastrar'}</button>
                <button type="button" onClick={() => setShowUserModal(false)} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
