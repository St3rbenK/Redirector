import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, ExternalLink, Users, LogOut, 
  Settings, LayoutDashboard, Layers, Share2, 
  ChevronRight, BarChart3, Copy, Check
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

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newCampaign, setNewCampaign] = useState({ name: '', slug: '', description: '' });
  const [newGroup, setNewGroup] = useState({ name: '', link: '', maxClicks: 100 });
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <Logo />
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 bg-indigo-50 text-indigo-700 p-3 rounded-xl font-bold transition-all border border-indigo-100 shadow-sm text-left">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-3 rounded-xl font-semibold transition-all text-left">
            <Layers size={20} /> Campanhas
          </button>
          <button className="flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-3 rounded-xl font-semibold transition-all text-left">
            <BarChart3 size={20} /> Analytics
          </button>
          <button className="flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-3 rounded-xl font-semibold transition-all text-left">
            <Settings size={20} /> Configurações
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
             <p className="text-xs text-slate-400 mb-1">Logado como</p>
             <p className="font-bold truncate text-sm">admin@admin.com</p>
             <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-rose-400 hover:text-rose-300 text-xs font-bold transition">
               <LogOut size={14} /> ENCERRAR SESSÃO
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
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
      </main>

      {/* Modals remained same but with fixed TS issues */}
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
    </div>
  );
};

export default Dashboard;
