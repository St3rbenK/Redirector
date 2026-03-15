import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, ExternalLink, Users, LogOut, 
  Settings, Layers, Share2, Menu, X,
  ChevronRight, BarChart3, Copy, Check, Globe, Shield, CreditCard, UserPlus, Lock, Mail, Layout
} from 'lucide-react';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-black text-2xl tracking-tighter ${className}`}>
    <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser] = useState<any>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

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
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (activeTab === 'settings' && currentUser?.role === 'admin') {
      fetchUsers();
    }
    setIsMobileMenuOpen(false); // Fecha menu ao trocar aba
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100/50">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
        {[
          { id: 'campaigns', label: 'Campanhas', icon: Layers },
          { id: 'analytics', label: 'Estatísticas', icon: BarChart3 },
          { id: 'settings', label: 'Configurações', icon: Settings },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl font-black transition-all text-left uppercase italic text-[11px] tracking-[0.15em] ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} /> 
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900 rounded-[32px] p-5 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-600/20 rounded-full blur-2xl group-hover:bg-indigo-600/40 transition-all duration-700"></div>
           {currentUser?.role === 'admin' && (
             <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-black px-2.5 py-1 uppercase tracking-tighter rounded-bl-xl shadow-sm">MASTER</div>
           )}
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 relative z-10">Operador Ativo</p>
           <p className="font-black truncate text-xs italic uppercase tracking-tight relative z-10 mb-4">{currentUser?.email || '...'}</p>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600 text-white py-3 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest relative z-10 border border-slate-700 hover:border-rose-500">
             <LogOut size={12} /> Sair com Segurança
           </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'campaigns':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Dashboard</h1>
                </div>
                <p className="text-slate-500 font-bold ml-10">Controle total sobre seus fluxos de tráfego</p>
              </div>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[24px] hover:bg-indigo-700 transition-all font-black shadow-2xl shadow-indigo-200 uppercase italic tracking-widest active:scale-95 border-b-4 border-indigo-800"
              >
                <Plus size={24} /> Criar Campanha
              </button>
            </header>

            {campaigns.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[48px] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-700">
                <div className="bg-slate-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                   <Layout className="text-slate-200" size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 italic uppercase tracking-tighter">Nenhum Projeto Ativo</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-12 font-bold px-6 text-sm">Sua lista de campanhas está vazia. Clique no botão acima para iniciar seu primeiro redirecionador inteligente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {campaigns.map((c, index) => (
                  <div key={c.id} className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-8 md:p-10 border-b border-slate-50 bg-white flex flex-col xl:flex-row justify-between xl:items-center gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{c.name}</h3>
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border border-emerald-100/50 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativa agora
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-2xl text-indigo-600 font-black tracking-tight group/link cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => handleCopy(c.slug)}>
                            <span className="opacity-50 font-medium">LINK: </span>/{c.slug}
                            <div className="ml-2 p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                              {copiedId === c.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400 group-hover/link:text-indigo-600" />}
                            </div>
                          </div>
                          <p className="italic text-slate-400 normal-case tracking-normal max-w-md truncate">{c.description || 'Nenhuma descrição detalhada fornecida para esta campanha.'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <a href={`/${c.slug}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-50 text-slate-700 px-6 py-4 rounded-2xl hover:bg-slate-100 transition-all font-black text-[10px] uppercase border border-slate-200/60 shadow-sm tracking-widest">
                          <ExternalLink size={18} className="text-slate-400" /> Testar Fluxo
                        </a>
                        <button onClick={() => { setSelectedCampaign(c); setShowGroupModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase shadow-xl shadow-indigo-100 active:scale-95 tracking-widest border-b-4 border-indigo-800">
                          <Plus size={20} /> Novo Grupo
                        </button>
                        <button onClick={() => handleDeleteCampaign(c.id)} className="p-4 text-slate-200 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100">
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {c.groups?.map((g) => (
                          <div key={g.id} className="group/card bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-200 transition-all duration-500 shadow-sm hover:shadow-3xl hover:shadow-indigo-50/50 relative overflow-hidden">
                            <div className="mb-8 flex flex-col gap-5 relative z-10">
                              <div className="flex justify-between items-start">
                                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 group-hover/card:bg-indigo-600 group-hover/card:text-white group-hover/card:rotate-12 transition-all duration-500 shadow-inner">
                                   <Users size={22} />
                                </div>
                                <button onClick={() => handleDeleteGroup(g.id)} className="text-slate-200 hover:text-rose-500 transition-colors p-2 bg-slate-50/50 rounded-xl opacity-0 group-hover/card:opacity-100 duration-300">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 mb-1.5 tracking-tighter text-xl uppercase italic leading-tight">{g.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold truncate tracking-[0.1em] uppercase bg-slate-50 p-2 rounded-lg border border-slate-100/50 shadow-inner">{g.link}</p>
                              </div>
                              <div className="space-y-4">
                                <div className="flex justify-between items-end px-1">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ocupação</span>
                                   <span className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">{g.currentClicks}<span className="text-slate-200 mx-1">/</span>{g.maxClicks}</span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200/30">
                                  <div style={{ width: `${Math.min((g.currentClicks / g.maxClicks) * 100, 100)}%` }} className={`h-full rounded-full transition-all duration-[1500ms] ease-out shadow-sm ${ (g.currentClicks / g.maxClicks) > 0.9 ? 'bg-rose-500 shadow-rose-200' : (g.currentClicks / g.maxClicks) > 0.7 ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-500 shadow-indigo-200' }`}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-50 pt-6 group-hover/card:text-slate-500 transition-colors relative z-10 px-1">
                               <div className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Hits: {g.clickCount}</div>
                               <div className={`flex items-center gap-1.5 ${g.currentClicks >= g.maxClicks ? 'text-rose-500 font-black' : 'text-emerald-500'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${g.currentClicks >= g.maxClicks ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                 {g.currentClicks >= g.maxClicks ? 'LOTADO' : 'ON-FIRE'}
                               </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl group-hover/card:bg-indigo-50/50 transition-all duration-700"></div>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-10">
               <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Analytics</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               {[
                 { label: 'Redirecionamentos', value: campaigns.reduce((acc, c) => acc + (c.groups?.reduce((gacc, g) => gacc + g.clickCount, 0) || 0), 0), icon: Share2, color: 'bg-indigo-50 text-indigo-600', shadow: 'shadow-indigo-100' },
                 { label: 'Campanhas', value: campaigns.length, icon: Layers, color: 'bg-emerald-50 text-emerald-600', shadow: 'shadow-emerald-100' },
                 { label: 'Grupos Ativos', value: campaigns.reduce((acc, c) => acc + (c.groups?.length || 0), 0), icon: Users, color: 'bg-amber-50 text-amber-600', shadow: 'shadow-amber-100' }
               ].map((stat, i) => (
                 <div key={i} className={`bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 ${stat.shadow}`}>
                    <div className={`${stat.color} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner`}>
                       <stat.icon size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h4>
                 </div>
               ))}
            </div>
            <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-600/20 blur-[100px]"></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Relatórios Inteligentes</h3>
                  <p className="text-slate-400 font-bold max-w-md leading-relaxed mb-8">Estamos processando os dados históricos para gerar gráficos de calor e picos de acesso por hora.</p>
                  <div className="flex gap-4">
                     <div className="h-2 w-24 bg-indigo-600 rounded-full animate-pulse"></div>
                     <div className="h-2 w-12 bg-slate-700 rounded-full"></div>
                     <div className="h-2 w-8 bg-slate-700 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex items-center gap-2 mb-10 text-center md:text-left justify-center md:justify-start">
               <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Settings</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm group">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="bg-slate-50 p-4 rounded-3xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Lock size={28} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">Segurança da<br/>Sua Conta</h3>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Redefinir Senha de Acesso</label>
                        <input type="password" placeholder="Digite a nova senha mestra" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 outline-none font-black text-sm transition-all shadow-inner" value={profileData.password} onChange={e => setProfileProfileData({ password: e.target.value })} />
                     </div>
                     <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase italic tracking-widest text-[11px] hover:bg-black transition-all shadow-xl active:scale-[0.98] border-b-4 border-slate-700">
                        Confirmar Alteração
                     </button>
                  </form>
               </div>

               {currentUser?.role === 'admin' && (
                 <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm group">
                    <div className="flex items-center justify-between mb-10">
                       <div className="flex items-center gap-5">
                          <div className="bg-slate-50 p-4 rounded-3xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                             <UserPlus size={28} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">Gestão de<br/>Operadores</h3>
                       </div>
                       <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white p-4 rounded-[20px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:rotate-90">
                         <Plus size={24} />
                       </button>
                    </div>
                    
                    <div className="space-y-5 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                       {users.map(u => (
                         <div key={u.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 group/u transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                            <div>
                               <p className="font-black text-slate-900 text-sm mb-1 tracking-tight">{u.email}</p>
                               <div className="flex items-center gap-3">
                                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{u.role}</span>
                                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 py-1 rounded-lg bg-white border border-slate-100 shadow-sm">{u.planType}</span>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover/u:opacity-100">
                               <Trash2 size={18} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {currentUser?.role === 'admin' && (
                 <div className="lg:col-span-2 bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-5 mb-12">
                       <div className="bg-slate-50 p-4 rounded-3xl text-slate-400 shadow-inner">
                          <CreditCard size={28} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">Planos & Monetização</h3>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configurações globais da plataforma</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {[
                         { name: 'FREE', limit: '03 Campanhas', price: 'R$ 0,00', color: 'indigo' },
                         { name: 'PRO', limit: '20 Campanhas', price: 'R$ 49,90', color: 'amber' },
                         { name: 'ENTERPRISE', limit: 'Ilimitado', price: 'R$ 99,90', color: 'emerald' }
                       ].map((plan, i) => (
                         <div key={i} className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 hover:scale-[1.03] transition-all duration-500 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${plan.color}-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-700`}></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{plan.name}</p>
                            <h4 className="text-3xl font-black text-slate-900 mb-8 italic">{plan.price}<span className="text-[10px] text-slate-400 font-bold not-italic tracking-normal"> / mensal</span></h4>
                            <div className="space-y-4 mb-10">
                               <div className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase italic tracking-tight">
                                  <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100"><Check size={14} className="text-emerald-500" /></div> {plan.limit}
                               </div>
                               <div className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase italic tracking-tight">
                                  <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100"><Check size={14} className="text-emerald-500" /></div> Suporte VIP
                               </div>
                            </div>
                            <button className="w-full bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                               Ajustar Limites
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-[100] flex justify-between items-center shadow-sm">
        <Logo className="scale-90 origin-left" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-slate-50 rounded-2xl text-slate-900 shadow-inner active:scale-90 transition-all">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 bg-white border-r border-slate-100 p-2 sticky top-0 h-screen shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-500 border-r border-slate-100">
              <SidebarContent />
           </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full overflow-x-hidden">
        {renderContent()}
      </main>

      {/* Modais - Unificados com Design Premium */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter italic uppercase text-center md:text-left">Nova Campanha</h2>
            <p className="text-slate-400 font-bold mb-10 text-center md:text-left">Configure os parâmetros básicos do seu fluxo.</p>
            <form onSubmit={handleCreateCampaign} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identificação Principal</label>
                <input placeholder="Ex: Lançamento Produto X" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 outline-none font-black text-sm uppercase italic transition-all shadow-inner" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Slug da URL (Único)</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[28px] overflow-hidden focus-within:ring-4 focus-within:ring-indigo-50 focus-within:bg-white focus-within:border-indigo-200 transition-all shadow-inner">
                   <span className="pl-8 pr-2 text-slate-300 font-black text-lg italic">/</span>
                   <input placeholder="promo-verao" className="flex-1 bg-transparent border-none py-5 pr-8 text-sm font-black text-indigo-600 uppercase italic focus:ring-0 outline-none" value={newCampaign.slug} onChange={e => setNewCampaign({...newCampaign, slug: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-[11px] border-b-4 border-indigo-800">{loading ? 'Criando...' : 'Finalizar e Salvar'}</button>
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Novo Grupo</h2>
            <p className="text-slate-400 font-bold mb-10">Adicionando ao: <span className="text-indigo-600 uppercase">{selectedCampaign?.name}</span></p>
            <form onSubmit={handleCreateGroup} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Título do Grupo</label>
                <input placeholder="Ex: Grupo 05 - VIP" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 outline-none font-black text-sm uppercase italic transition-all shadow-inner" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Link Completo</label>
                <input placeholder="https://chat.whatsapp.com/..." className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 outline-none font-black text-[11px] transition-all shadow-inner" value={newGroup.link} onChange={e => setNewGroup({...newGroup, link: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Capacidade Máxima</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 outline-none font-black text-sm italic transition-all shadow-inner" value={newGroup.maxClicks} onChange={e => setNewGroup({...newGroup, maxClicks: parseInt(e.target.value)})} required />
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-[11px] border-b-4 border-indigo-800">{loading ? '...' : 'Adicionar Grupo'}</button>
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Novo Operador</h2>
            <p className="text-slate-400 font-bold mb-10">Cadastre um novo usuário administrador ou comum.</p>
            <form onSubmit={handleCreateUser} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">E-mail Corporativo</label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                   <input type="email" placeholder="email@exemplo.com" className="w-full bg-slate-50 border border-slate-200 pl-16 pr-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none font-black text-sm transition-all shadow-inner" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Senha Provisória</label>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                   <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 pl-16 pr-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none font-black text-sm transition-all shadow-inner" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 px-1">
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Permissão</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                       <option value="user">Operador Comum</option>
                       <option value="admin">Administrador</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Pacote</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={newUser.planType} onChange={e => setNewUser({...newUser, planType: e.target.value})}>
                       <option value="free">Plano Free</option>
                       <option value="pro">Plano Pro</option>
                       <option value="enterprise">Enterprise</option>
                    </select>
                 </div>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest text-[11px] border-b-4 border-indigo-800">{loading ? '...' : 'Cadastrar Operador'}</button>
                <button type="button" onClick={() => setShowUserModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
