import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Plus, Trash2, ExternalLink, Users, LogOut, 
  Settings, Layers, Share2, Menu, X, HelpCircle,
  ChevronRight, BarChart3, Copy, Check, QrCode, Edit3,
  Globe, Shield, CreditCard, UserPlus, Lock, Mail, Layout, Infinity, Zap
} from 'lucide-react';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-black text-2xl tracking-tighter ${className}`}>
    <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200">
      <Share2 className="text-white" size={24} />
    </div>
    <span className="text-slate-900">REDI<span className="text-indigo-600">RECTOR</span></span>
  </div>
);

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1.5">
    <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-center text-[10px] font-bold leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl border border-slate-700">
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
  name?: string;
  email: string;
  role: string;
  planType: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const [modalState, setModalState] = useState<{
    campaign?: boolean;
    group?: boolean;
    user?: boolean;
    qr?: boolean;
  }>({});
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null);
  const [qrSlug, setQrSlug] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formCampaign, setFormCampaign] = useState({ name: '', slug: '', description: 'MODE:BALANCE' });
  const [formGroup, setFormGroup] = useState({ name: '', link: '', maxClicks: 100, isUnlimited: false });
  const [formUser, setFormUser] = useState({ name: '', email: '', password: '', role: 'user', planType: 'free' });
  const [formProfile, setFormProfile] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    if (activeTab === 'settings' && currentUser?.role === 'admin') fetchUsers();
    if (activeTab === 'settings') {
       setFormProfile(prev => ({...prev, name: currentUser?.name || '', email: currentUser?.email || ''}));
    }
    setIsMobileMenuOpen(false);
  }, [activeTab, currentUser]);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    showToast('Link de redirecionamento copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await api.put(`/campaigns/${editingItem.id}`, formCampaign);
        showToast('Campanha atualizada!');
      } else {
        await api.post('/campaigns', formCampaign);
        showToast('Campanha criada com sucesso!');
      }
      setModalState({});
      setEditingItem(null);
      await fetchCampaigns();
    } catch (err: any) { alert(err.response?.data?.error || 'Erro ao salvar'); }
    finally { setLoading(false); }
  };
  
  const openCampaignModal = (campaign: CampaignType | null = null) => {
    if (campaign) {
      setEditingItem(campaign);
      setFormCampaign({ name: campaign.name, slug: campaign.slug, description: campaign.description });
    } else {
      setEditingItem(null);
      setFormCampaign({ name: '', slug: '', description: 'MODE:BALANCE' });
    }
    setModalState({ campaign: true });
  };
  
  const handleDeleteCampaign = async (id: number) => {
    if (confirm('Deseja excluir permanentemente esta campanha e todos os seus grupos?')) {
      await api.delete(`/campaigns/${id}`);
      showToast('Campanha removida.');
      fetchCampaigns();
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalLink = formGroup.link.trim();
    if (finalLink && !finalLink.startsWith('http')) finalLink = 'https://' + finalLink;
    
    const payload = { 
      ...formGroup, 
      link: finalLink,
      maxClicks: formGroup.isUnlimited ? -1 : formGroup.maxClicks 
    };

    try {
      if (editingItem) {
        await api.put(`/groups/${editingItem.id}`, payload);
        showToast('Grupo atualizado!');
      } else {
        await api.post('/groups', { ...payload, campaignId: selectedCampaign?.id });
        showToast('Grupo adicionado!');
      }
      setModalState({});
      setEditingItem(null);
      await fetchCampaigns();
    } catch (err: any) { alert(err.response?.data?.error || 'Erro ao salvar'); }
    finally { setLoading(false); }
  };
  
  const openGroupModal = (group: GroupType | null = null, campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    if (group) {
      setEditingItem(group);
      setFormGroup({ name: group.name, link: group.link, maxClicks: group.maxClicks === -1 ? 100 : group.maxClicks, isUnlimited: group.maxClicks === -1 });
    } else {
      setEditingItem(null);
      setFormGroup({ name: '', link: '', maxClicks: 100, isUnlimited: false });
    }
    setModalState({ group: true });
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm('Excluir este grupo?')) {
      await api.delete(`/groups/${id}`);
      showToast('Grupo removido.');
      fetchCampaigns();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formProfile.newPassword && formProfile.newPassword !== formProfile.confirmPassword) {
      return alert('A nova senha e a confirmação não coincidem.');
    }
    if (!formProfile.oldPassword) return alert('É obrigatório informar sua senha atual.');
    
    setLoading(true);
    try {
      const { data } = await api.put('/admin/profile', formProfile);
      showToast('Perfil atualizado com sucesso!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setFormProfile(prev => ({...prev, oldPassword: '', newPassword: '', confirmPassword: ''}));
    } catch (err: any) { alert(err.response?.data?.error || 'Erro ao atualizar'); }
    finally { setLoading(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/users', formUser);
      showToast('Operador cadastrado!');
      setModalState({});
      setFormUser({ name: '', email: '', password: '', role: 'user', planType: 'free' });
      fetchUsers();
    } catch (err: any) { alert(err.response?.data?.error || 'Erro ao criar usuário'); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Excluir este operador permanentemente?')) {
      await api.delete(`/admin/users/${id}`);
      showToast('Operador removido.');
      fetchUsers();
    }
  };

  const openQrModal = (slug: string) => {
    setQrSlug(slug);
    setModalState({ qr: true });
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
           {currentUser?.role === 'admin' && <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-black px-2.5 py-1 uppercase tracking-tighter rounded-bl-lg">MASTER</div>}
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Operador Ativo</p>
           <p className="font-black truncate text-xs italic uppercase tracking-tight relative z-10 mb-4">{currentUser?.name || currentUser?.email || '...'}</p>
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
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Minhas Campanhas</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Bem vindo, {currentUser?.name || currentUser?.email?.split('@')[0]}</p>
              </div>
              <button 
                onClick={() => openCampaignModal()}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[24px] hover:bg-indigo-700 transition-all font-black shadow-2xl shadow-indigo-200 uppercase italic tracking-widest active:scale-95 border-b-4 border-indigo-800"
              >
                <Plus size={24} /> Nova Campanha
              </button>
            </header>

            {campaigns.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[48px] border border-slate-100 shadow-sm animate-in zoom-in duration-700">
                <Layout className="text-slate-200 mx-auto mb-8" size={48} />
                <h3 className="text-3xl font-black text-slate-900 mb-3 italic uppercase">Nenhum Projeto</h3>
                <p className="text-slate-400 max-w-sm mx-auto font-bold px-6 text-sm">Clique em "Nova Campanha" para começar a distribuir seus leads.</p>
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
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-xs uppercase">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-indigo-600 font-black cursor-pointer hover:bg-white transition-all shadow-inner group" onClick={() => handleCopy(c.slug)}>
                            <span>/{c.slug}</span> 
                            {copiedId === c.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
                          </div>
                          <button onClick={() => openQrModal(c.slug)} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-inner border border-slate-200/50"><QrCode size={18} /></button>
                          <button onClick={() => openCampaignModal(c)} className="p-2 bg-slate-50 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all shadow-inner border border-slate-200/50"><Edit3 size={18} /></button>
                          <a href={`/${c.slug}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-inner border border-slate-200/50"><ExternalLink size={18} /></a>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => { setSelectedCampaign(c); openGroupModal(null, c); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-indigo-100 border-b-4 border-indigo-800 active:scale-95 transition-all"><Plus size={20} /> Novo Grupo</button>
                        <button onClick={() => handleDeleteCampaign(c.id)} className="p-4 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={22} /></button>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {c.groups?.map((g) => (
                          <div key={g.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 duration-500">
                            <div className="mb-8 flex flex-col gap-5">
                              <div className="flex justify-between items-start">
                                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                   <Users size={22} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openGroupModal(g, c)} className="p-2 text-slate-300 hover:text-emerald-500"><Edit3 size={18} /></button>
                                  <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 mb-1.5 tracking-tighter text-xl uppercase italic">{g.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest uppercase bg-slate-50 p-2 rounded-lg border border-slate-100/50 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{g.link}</p>
                              </div>
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                     Ocupação 
                                     <Tooltip text="A capacidade define o limite de cliques que este grupo pode receber." />
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
                      {(!c.groups || c.groups.length === 0) && (
                        <div className="text-center py-10 flex flex-col items-center">
                          <p className="text-slate-300 italic font-black uppercase text-[10px] tracking-widest mb-4">Nenhum grupo ativo nesta campanha</p>
                          <button onClick={() => { setSelectedCampaign(c); openGroupModal(null, c); }} className="text-indigo-600 font-black text-xs hover:underline uppercase tracking-widest">+ Adicionar Primeiro Grupo</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Estatísticas Reais</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: 'Total Redirecionamentos', value: campaigns.reduce((acc, c) => acc + (c.groups?.reduce((gacc, g) => gacc + g.clickCount, 0) || 0), 0), icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                 { label: 'Campanhas Criadas', value: campaigns.length, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                 { label: 'Grupos em Operação', value: campaigns.reduce((acc, c) => acc + (c.groups?.length || 0), 0), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm shadow-indigo-50/50 hover:shadow-xl transition-all duration-500 group">
                    <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}><stat.icon size={32} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{stat.label}</p>
                    <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{stat.value}</h4>
                 </div>
               ))}
            </div>
            <div className="mt-12 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 uppercase italic mb-6">Performance por Campanha</h3>
               <div className="space-y-6">
                 {campaigns.map(c => {
                   const total = c.groups?.reduce((acc, g) => acc + g.clickCount, 0) || 0;
                   return (
                     <div key={c.id} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end px-2">
                           <span className="text-xs font-black uppercase text-slate-600 italic">{c.name}</span>
                           <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{total} leads</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                           <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((total / (campaigns.reduce((acc, cp) => acc + (cp.groups?.reduce((gacc, g) => gacc + g.clickCount, 0) || 0), 0) || 1)) * 100, 100)}%` }}></div>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Configurações</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm group relative overflow-hidden">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="bg-slate-50 p-4 rounded-3xl text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Edit3 size={28} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">Editar Meu<br/>Perfil</h3>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Nome de Exibição</label>
                           <input type="text" placeholder="Seu Nome" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-[20px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all shadow-inner" value={formProfile.name} onChange={e => setFormProfile({...formProfile, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">E-mail Principal</label>
                           <input type="email" placeholder="seu@email.com" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-[20px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all shadow-inner" value={formProfile.email} onChange={e => setFormProfile({...formProfile, email: e.target.value})} required />
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic ml-2">Alteração de Senha (Opcional)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Nova Senha</label>
                              <input type="password" placeholder="Mínimo 6 caracteres" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-[20px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all shadow-inner" value={formProfile.newPassword} onChange={e => setFormProfile({...formProfile, newPassword: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Confirmar Nova Senha</label>
                              <input type="password" placeholder="Repita a senha" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-[20px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all shadow-inner" value={formProfile.confirmPassword} onChange={e => setFormProfile({...formProfile, confirmPassword: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 space-y-4">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2 text-left animate-pulse italic">Senha Atual (Obrigatório para salvar)</label>
                           <input type="password" placeholder="Confirme sua senha atual para validar" className="w-full bg-white border-2 border-indigo-100 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none font-black text-sm transition-all" value={formProfile.oldPassword} onChange={e => setFormProfile({...formProfile, oldPassword: e.target.value})} required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black uppercase italic tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 border-b-4 border-indigo-800 active:scale-[0.98]">
                           {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                     </div>
                  </form>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
               </div>

               {currentUser?.role === 'admin' && (
                 <div className="bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 shadow-sm group">
                    <div className="flex items-center justify-between mb-10">
                       <div className="flex items-center gap-5">
                          <div className="bg-slate-50 p-4 rounded-3xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                             <UserPlus size={28} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">Operadores</h3>
                       </div>
                       <button onClick={() => setModalState({ user: true })} className="bg-indigo-600 text-white p-4 rounded-[20px] hover:bg-indigo-700 transition-all shadow-lg active:rotate-90 duration-500"><Plus size={24} /></button>
                    </div>
                    <div className="space-y-5 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                       {users.map(u => (
                         <div key={u.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 group/u transition-all hover:bg-white hover:shadow-xl">
                            <div>
                               <p className="font-black text-slate-900 text-sm mb-1 tracking-tight italic uppercase">{u.name || u.email?.split('@')[0]}</p>
                               <p className="text-[10px] text-slate-400 font-bold mb-2">{u.email}</p>
                               <div className="flex items-center gap-3">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{u.role}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 rounded-lg bg-white border border-slate-100">{u.planType}</span>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover/u:opacity-100"><Trash2 size={18} /></button>
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
       {/* Toast Notification */}
       {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-3xl border border-slate-700 flex items-center gap-4 z-[999] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-indigo-500 p-2 rounded-xl">
             <Check size={18} className="text-white" />
          </div>
          <p className="text-xs font-black uppercase italic tracking-widest leading-none">{toastMessage}</p>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-[100] flex justify-between items-center shadow-sm">
        <Logo className="scale-90 origin-left" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-slate-50 rounded-2xl text-slate-900 shadow-inner active:scale-90 transition-all">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 bg-white border-r border-slate-100 p-2 sticky top-0 h-screen shadow-sm"><SidebarContent /></aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-500 border-r border-slate-100"><SidebarContent /></aside>
        </div>
      )}

      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full overflow-x-hidden">{renderContent()}</main>

      {/* Campaign Modal */}
      {modalState.campaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase text-center md:text-left">{editingItem ? 'Editar' : 'Nova'} Campanha</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10 text-center md:text-left">Configure os parâmetros básicos do seu fluxo.</p>
            <form onSubmit={handleSaveCampaign} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identificação</label>
                <input placeholder="Ex: Lançamento VIP" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm uppercase italic transition-all shadow-inner" value={formCampaign.name} onChange={e => setFormCampaign({...formCampaign, name: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Slug Amigável (URL)</label>
                <input placeholder="promo-leads" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm text-indigo-600 uppercase italic transition-all shadow-inner" value={formCampaign.slug} onChange={e => setFormCampaign({...formCampaign, slug: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Inteligência de Distribuição</label>
                <select className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic transition-all shadow-inner" value={formCampaign.description} onChange={e => setFormCampaign({...formCampaign, description: e.target.value})}>
                   <option value="MODE:BALANCE">Smart Balance (Equilibrado)</option>
                   <option value="MODE:SEQUENTIAL">Sequencial (Por Capacidade)</option>
                </select>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase italic tracking-widest text-[11px] border-b-4 border-indigo-800">{loading ? '...' : 'Salvar Alterações'}</button>
                <button type="button" onClick={() => { setModalState({}); setEditingItem(null); }} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 transition-all text-[11px] uppercase italic">Voltar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {modalState.group && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase text-center md:text-left">{editingItem ? 'Editar' : 'Novo'} Grupo</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10 text-center md:text-left">Destino: <span className="text-indigo-600 italic">{selectedCampaign?.name}</span></p>
            <form onSubmit={handleSaveGroup} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 italic tracking-widest">Nome do Grupo</label>
                <input placeholder="Ex: Grupo 01" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm uppercase italic shadow-inner" value={formGroup.name} onChange={e => setFormGroup({...formGroup, name: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">Link (WhatsApp/Telegram)</label>
                <input placeholder="chat.whatsapp.com/..." className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[11px] shadow-inner" value={formGroup.link} onChange={e => setFormGroup({...formGroup, link: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center px-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Capacidade Máxima</label>
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={formGroup.isUnlimited} onChange={e => setFormGroup({...formGroup, isUnlimited: e.target.checked})} className="w-4 h-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 shadow-inner" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase italic">Ilimitado</span>
                   </label>
                </div>
                {!formGroup.isUnlimited && (
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm italic shadow-inner" value={formGroup.maxClicks} onChange={e => setFormGroup({...formGroup, maxClicks: parseInt(e.target.value)})} required />
                )}
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all border-b-4 border-indigo-800 uppercase italic text-[11px]">{loading ? '...' : 'Salvar Grupo'}</button>
                <button type="button" onClick={() => { setModalState({}); setEditingItem(null); }} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 uppercase italic text-[11px]">Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {modalState.user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-lg w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase text-center">Novo Operador</h2>
            <form onSubmit={handleCreateUser} className="space-y-8">
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">Nome Completo</label>
                <input type="text" placeholder="Nome do Operador" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm uppercase italic transition-all shadow-inner" value={formUser.name} onChange={e => setFormUser({...formUser, name: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">E-mail Corporativo</label>
                <input type="email" placeholder="email@exemplo.com" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm transition-all shadow-inner" value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} required />
              </div>
              <div className="space-y-3 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">Senha Provisória</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 px-8 py-5 rounded-[28px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-sm transition-all shadow-inner" value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-6 px-1">
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">Privilégios</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value})}>
                       <option value="user">Operador</option>
                       <option value="admin">Administrador</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 text-left italic tracking-widest">Pacote</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none font-black text-[10px] uppercase italic shadow-inner" value={formUser.planType} onChange={e => setFormUser({...formUser, planType: e.target.value})}>
                       <option value="free">Free</option>
                       <option value="pro">Pro</option>
                       <option value="enterprise">Enterprise</option>
                    </select>
                 </div>
              </div>
              <div className="flex gap-5 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all border-b-4 border-indigo-800 uppercase italic text-[11px]">{loading ? '...' : 'Cadastrar Agora'}</button>
                <button type="button" onClick={() => setModalState({})} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[28px] font-black hover:bg-slate-200 uppercase italic text-[11px]">Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {modalState.qr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] p-10 md:p-14 max-w-sm w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-500 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter italic uppercase">QR Code de Acesso</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-inner border-2 border-slate-50 inline-block mb-8 mx-auto">
               <QRCodeCanvas 
                 value={`${window.location.origin}/${qrSlug}`} 
                 size={200}
                 level={"H"}
                 includeMargin={true}
               />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 px-4 leading-relaxed italic">Aponte a câmera para testar o redirecionamento imediato da campanha <span className="text-indigo-600">/{qrSlug}</span></p>
            <button onClick={() => setModalState({})} className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black uppercase italic tracking-widest text-[11px] hover:bg-black transition-all">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
