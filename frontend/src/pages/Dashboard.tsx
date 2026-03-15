import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, ExternalLink, Users, LogOut, 
  Settings, Layers, Share2, Menu, X, HelpCircle,
  ChevronRight, BarChart3, Copy, Check, Globe, Shield, CreditCard, UserPlus, Lock, Mail, Layout, Infinity
} from 'lucide-react';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-black text-2xl tracking-tighter ${className}`}>
    <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200">
      <Share2 className="text-white" size={24} />
    </div>
    <span className="text-slate-900">REDI<span className="text-indigo-600">RECTOR</span></span>
  </div>
);

// Custom Tooltip Component
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-indigo-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl border border-slate-700">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
    </div>
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
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser] = useState<UserType | null>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newCampaign, setNewCampaign] = useState({ name: '', slug: '', description: 'MODE:BALANCE' });
  const [newGroup, setNewGroup] = useState({ name: '', link: '', maxClicks: 100, isUnlimited: false });
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', planType: 'free' });
  const [profileData, setProfileData] = useState({ password: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    if (activeTab === 'settings' && currentUser?.role === 'admin') fetchUsers();
    setIsMobileMenuOpen(false);
  }, [activeTab, currentUser]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) { console.error(err); }
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
      setNewCampaign({ name: '', slug: '', description: 'MODE:BALANCE' });
      await fetchCampaigns(); // Real-time update in state
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar campanha');
    } finally { setLoading(false); }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setLoading(true);
    
    // Auto-sanitização do Link (Garante HTTPS)
    let finalLink = newGroup.link.trim();
    if (finalLink && !finalLink.startsWith('http')) {
      finalLink = 'https://' + finalLink;
    }

    try {
      await api.post('/groups', { 
        ...newGroup, 
        link: finalLink,
        campaignId: selectedCampaign.id,
        maxClicks: newGroup.isUnlimited ? -1 : newGroup.maxClicks 
      });
      setShowGroupModal(false);
      setNewGroup({ name: '', link: '', maxClicks: 100, isUnlimited: false });
      await fetchCampaigns(); // Real-time update in state
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar grupo');
    } finally { setLoading(false); }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (confirm('Deseja excluir permanentemente?')) {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
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
      setProfileData({ password: '' });
    } catch (err) { alert('Erro ao atualizar'); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/users', newUser);
      setShowUserModal(false);
      setNewUser({ email: '', password: '', role: 'user', planType: 'free' });
      fetchUsers();
    } catch (err: any) { alert(err.response?.data?.error || 'Erro'); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Excluir operador?')) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100/50"><Logo /></div>
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
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <div className="bg-slate-900 rounded-[32px] p-5 text-white shadow-2xl relative overflow-hidden">
           {currentUser?.role === 'admin' && <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-black px-2.5 py-1 uppercase rounded-bl-lg">MASTER</div>}
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Operador Ativo</p>
           <p className="font-black truncate text-xs italic uppercase tracking-tight mb-4">{currentUser?.email || '...'}</p>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600 text-white py-3 rounded-xl text-[9px] font-black transition-all border border-slate-700 uppercase tracking-widest"><LogOut size={12} /> Sair</button>
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
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Dashboard</h1>
                <p className="text-slate-500 font-bold">Gerencie seus fluxos de distribuição inteligentes</p>
              </div>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[24px] hover:bg-indigo-700 transition-all font-black shadow-2xl shadow-indigo-200 uppercase italic tracking-widest active:scale-95 border-b-4 border-indigo-800"
              >
                <Plus size={24} /> Criar Campanha
              </button>
            </header>

            {campaigns.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[48px] border border-slate-100 shadow-sm animate-in zoom-in duration-700">
                <Layout className="text-slate-200 mx-auto mb-8" size={48} />
                <h3 className="text-3xl font-black text-slate-900 mb-3 italic uppercase">Nenhum Projeto</h3>
                <p className="text-slate-400 max-w-sm mx-auto font-bold px-6 text-sm">Clique em "Criar Campanha" para começar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {campaigns.map((c, index) => (
                  <div key={c.id} className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col xl:flex-row justify-between xl:items-center gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{c.name}</h3>
                          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-indigo-100">
                             {c.description?.includes('MODE:SEQUENTIAL') ? 'Modo Sequencial' : 'Modo Smart Balance'}
                             <Tooltip text={c.description?.includes('MODE:SEQUENTIAL') ? 'Preenche o primeiro grupo até o limite antes de passar para o próximo.' : 'Distribui igualmente priorizando sempre o grupo com menos acessos.'} />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold text-xs uppercase">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-indigo-600 font-black cursor-pointer hover:bg-white transition-all shadow-inner" onClick={() => handleCopy(c.slug)}>
                            <span>/{c.slug}</span> <Copy size={14} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => { setSelectedCampaign(c); setShowGroupModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-indigo-100 border-b-4 border-indigo-800"><Plus size={20} /> Novo Grupo</button>
                        <button onClick={() => handleDeleteCampaign(c.id)} className="p-4 text-slate-200 hover:text-rose-500"><Trash2 size={22} /></button>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {c.groups?.map((g) => (
                          <div key={g.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                            <div className="mb-8 flex flex-col gap-5">
                              <div className="flex justify-between items-start">
                                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                   <Users size={22} />
                                </div>
                                <button onClick={() => handleDeleteGroup(g.id)} className="text-slate-200 hover:text-rose-500"><Trash2 size={18} /></button>
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 mb-1.5 tracking-tighter text-xl uppercase italic">{g.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest uppercase bg-slate-50 p-2 rounded-lg border border-slate-100/50 shadow-inner">{g.link}</p>
                              </div>
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                     Ocupação 
                                     <Tooltip text="A capacidade define o limite de cliques que este grupo pode receber antes de ser ignorado pelo redirecionador." />
                                   </span>
                                   <span className="text-sm font-black text-slate-900 italic uppercase">
                                     {g.currentClicks} / {g.maxClicks === -1 ? <Infinity className="inline" size={16} /> : g.maxClicks}
                                   </span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/30 shadow-inner">
                                  <div style={{ width: g.maxClicks === -1 ? '100%' : `${Math.min((g.currentClicks / g.maxClicks) * 100, 100)}%` }} className={`h-full rounded-full transition-all duration-1000 ${ g.maxClicks === -1 ? 'bg-indigo-400' : (g.currentClicks / g.maxClicks) > 0.9 ? 'bg-rose-500' : (g.currentClicks / g.maxClicks) > 0.7 ? 'bg-amber-500' : 'bg-indigo-500' }`}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-50 pt-6">
                               <div className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Hits: {g.clickCount}</div>
                               <div className={g.maxClicks !== -1 && g.currentClicks >= g.maxClicks ? 'text-rose-500' : 'text-emerald-500'}>
                                 {g.maxClicks !== -1 && g.currentClicks >= g.maxClicks ? 'LOTADO' : 'ATIVO'}
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: 'Redirecionamentos', value: campaigns.reduce((acc, c) => acc + (c.groups?.reduce((gacc, g) => gacc + g.clickCount, 0) || 0), 0), icon: Share2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                 { label: 'Campanhas', value: campaigns.length, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                 { label: 'Grupos Ativos', value: campaigns.reduce((acc, c) => acc + (c.groups?.length || 0), 0), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm shadow-indigo-50">
                    <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner`}><stat.icon size={32} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h4>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-5 mb-10">
                     <Lock className="text-indigo-600" size={28} />
                     <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Segurança</h3>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nova Senha</label>
                        <input type="password" placeholder="Digite a nova senha" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm transition-all" value={profileData.password} onChange={e => setProfileData({ password: e.target.value })} />
                     </div>
                     <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase italic tracking-widest text-[11px] hover:bg-black transition-all shadow-xl">Atualizar Senha</button>
                  </form>
               </div>

               {currentUser?.role === 'admin' && (
                 <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                       <div className="flex items-center gap-5">
                          <UserPlus className="text-indigo-600" size={28} />
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Operadores</h3>
                       </div>
                       <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white p-4 rounded-[20px] hover:bg-indigo-700 transition-all shadow-lg"><Plus size={24} /></button>
                    </div>
                    <div className="space-y-5 max-h-[350px] overflow-y-auto pr-4">
                       {users.map(u => (
                         <div key={u.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <div>
                               <p className="font-black text-slate-900 text-sm tracking-tight">{u.email}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 px-2 py-1 rounded">{u.role}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-2 py-1 rounded">{u.planType}</span>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
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
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-slate-50 rounded-2xl text-slate-900 shadow-inner active:scale-90 transition-all">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      <aside className="hidden lg:block w-72 bg-white border-r border-slate-100 p-2 sticky top-0 h-screen shadow-sm"><SidebarContent /></aside>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-500 border-r border-slate-100"><SidebarContent /></aside>
        </div>
      )}

      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full overflow-x-hidden">{renderContent()}</main>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter italic uppercase text-center md:text-left">Nova Campanha</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Nome</label>
                <input placeholder="Ex: Lançamento VIP" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none font-black text-sm uppercase italic transition-all" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} required />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Slug URL</label>
                <input placeholder="promo-leads" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none font-black text-sm text-indigo-600 uppercase italic transition-all" value={newCampaign.slug} onChange={e => setNewCampaign({...newCampaign, slug: e.target.value})} required />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Modo de Distribuição <Tooltip text="SEQUENCIAL: Enche um grupo até o fim. SMART BALANCE: Distribui igualmente para manter todos com o mesmo número de pessoas." /></label>
                <select className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic transition-all shadow-inner" value={newCampaign.description} onChange={e => setNewCampaign({...newCampaign, description: e.target.value})}>
                   <option value="MODE:BALANCE">Smart Balance (Recomendado)</option>
                   <option value="MODE:SEQUENTIAL">Sequencial por Capacidade</option>
                </select>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic text-[11px] border-b-4 border-indigo-800">{loading ? 'Criando...' : 'Finalizar'}</button>
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase text-center md:text-left">Novo Grupo</h2>
            <form onSubmit={handleCreateGroup} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Título do Grupo</label>
                <input placeholder="Ex: Grupo 01" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm uppercase italic transition-all shadow-inner" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} required />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Link do Destino <Tooltip text="Pode colar apenas o link (ex: chat.whatsapp.com). O sistema adicionará o https:// automaticamente para você." /></label>
                <input placeholder="chat.whatsapp.com/..." className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[11px] transition-all shadow-inner" value={newGroup.link} onChange={e => setNewGroup({...newGroup, link: e.target.value})} required />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase">Capacidade <Tooltip text="A capacidade define o limite de leads. Quando atingido, o redirecionador passa a ignorar este grupo." /></label>
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={newGroup.isUnlimited} onChange={e => setNewGroup({...newGroup, isUnlimited: e.target.checked})} className="w-4 h-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase italic">Sem Limite</span>
                   </label>
                </div>
                {!newGroup.isUnlimited && (
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm italic transition-all shadow-inner animate-in slide-in-from-top-2" value={newGroup.maxClicks} onChange={e => setNewGroup({...newGroup, maxClicks: parseInt(e.target.value)})} required />
                )}
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic text-[11px] border-b-4 border-indigo-800">Salvar Grupo</button>
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">Novo Operador</h2>
            <form onSubmit={handleCreateUser} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">E-mail</label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                   <input type="email" placeholder="email@exemplo.com" className="w-full bg-slate-50 border border-slate-200 pl-16 pr-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm transition-all shadow-inner" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Senha</label>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                   <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 pl-16 pr-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm transition-all shadow-inner" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Nível</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                       <option value="user">Operador</option>
                       <option value="admin">Administrador</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2">Pacote</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={newUser.planType} onChange={e => setNewUser({...newUser, planType: e.target.value})}>
                       <option value="free">Free</option>
                       <option value="pro">Pro</option>
                       <option value="enterprise">Enterprise</option>
                    </select>
                 </div>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase italic text-[11px] border-b-4 border-indigo-800">Cadastrar</button>
                <button type="button" onClick={() => setShowUserModal(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
