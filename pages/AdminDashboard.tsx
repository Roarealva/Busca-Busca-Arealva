
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, Home, BarChart3, Settings as SettingsIcon, Eye, EyeOff, Calendar, MessageCircle, TrendingUp, Download, Edit, Plus, Lock, Search, Phone, User as UserIcon, Filter, FileSpreadsheet, Key, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Property, Transaction, User } from '../types';

const AdminDashboard: React.FC = () => {
  const { properties, setProperties, transactions, settings, setSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'ads' | 'finance' | 'users' | 'settings'>('ads');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  // Estados para Modal de Senha
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedUserForPass, setSelectedUserForPass] = useState<User | null>(null);
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [showPassModalFields, setShowPassModalFields] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    return JSON.parse(localStorage.getItem('registered_users') || '[]');
  });

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => 
      u.phone.includes(userSearchTerm) || 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [registeredUsers, userSearchTerm]);

  const revenueStats = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((name, index) => {
      const total = transactions
        .filter(t => new Date(t.date).getMonth() === index && new Date(t.date).getFullYear() === financeYear)
        .reduce((sum, curr) => sum + curr.amount, 0);
      return { name, total };
    });
  }, [transactions, financeYear]);

  const openPassModal = (user: User) => {
    setSelectedUserForPass(user);
    setNewPass('');
    setConfirmNewPass('');
    setPassError('');
    setShowPassModalFields(false);
    setIsPassModalOpen(true);
  };

  const handleUpdateUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!selectedUserForPass) return;

    if (newPass.length < 6) {
      setPassError("A SENHA DEVE TER PELO MENOS 6 CARACTERES.");
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError("AS SENHAS NÃO COINCIDEM.");
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updated = allUsers.map((u: User) => u.id === selectedUserForPass.id ? { ...u, password: newPass } : u);
    
    localStorage.setItem('registered_users', JSON.stringify(updated));
    setRegisteredUsers(updated);
    
    setIsPassModalOpen(false);
    alert(`SUCESSO: SENHA DE ${selectedUserForPass.name.toUpperCase()} ALTERADA!`);
  };

  const exportFinancialData = () => {
    const reportData = transactions.filter(t => new Date(t.date).getFullYear() === financeYear);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `financeiro_busca_arealva_${financeYear}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-white min-h-screen text-gray-900">
      <div className="flex flex-col gap-8 mb-12">
        <div>
           <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase tracking-tighter">Administração Central</h1>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gerenciamento Completo do Portal</p>
        </div>
        
        <div className="flex flex-wrap bg-gray-50 p-2 rounded-3xl border border-gray-100 gap-2 overflow-hidden">
          <button onClick={() => setActiveTab('ads')} className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all min-w-[120px] ${activeTab === 'ads' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}>
            <Home size={16} /> IMÓVEIS
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all min-w-[120px] ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}>
            <UsersIcon size={16} /> USUÁRIOS
          </button>
          <button onClick={() => setActiveTab('finance')} className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all min-w-[120px] ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}>
            <BarChart3 size={16} /> FINANCEIRO
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all min-w-[120px] ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}>
            <SettingsIcon size={16} /> VALORES
          </button>
        </div>
      </div>

      {activeTab === 'ads' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-blue-600 text-[10px] font-black uppercase text-white tracking-widest">
                <tr>
                  <th className="px-8 py-5">Imóvel Publicado</th>
                  <th className="px-8 py-5">Status / Expira</th>
                  <th className="px-8 py-5">Proprietário</th>
                  <th className="px-8 py-5 text-right">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map(p => {
                  const owner = registeredUsers.find(u => u.id === p.userId);
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <img src={p.photos[0]} className="w-14 h-14 rounded-2xl object-cover border border-white shadow-sm" alt="" />
                           <div>
                              <span className="font-black text-blue-900 text-base">{p.city}</span>
                              <div className="text-[10px] font-bold text-gray-400 uppercase">REF: {p.id.split('-')[0]}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${p.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{p.status === 'active' ? 'PUBLICADO' : 'PENDENTE'}</span>
                         <div className="text-[10px] text-gray-400 font-bold mt-2 tracking-tighter">VENC: {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '---'}</div>
                      </td>
                      <td className="px-8 py-6">
                         {owner ? (
                           <button onClick={() => window.open(`https://wa.me/${owner.phone.replace(/\D/g,'')}`)} className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1.5 uppercase tracking-tighter">
                             <Phone size={14} /> {owner.phone}
                           </button>
                         ) : <span className="text-gray-400 text-xs italic">Não localizado</span>}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3">
                            <button onClick={() => navigate(`/editar-imovel/${p.id}`)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={18} /></button>
                            <button onClick={() => setProperties(prev => prev.map(item => item.id === p.id ? { ...item, status: item.status === 'active' ? 'expired' : 'active' } : item))} className={`p-3 rounded-xl transition-all shadow-sm ${p.status === 'active' ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>{p.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 p-6 md:p-10">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
              <h3 className="text-lg font-black text-blue-900 uppercase tracking-tighter">Controle de Usuários</h3>
              <div className="relative w-full sm:w-96">
                 <Search className="absolute left-4 top-4 text-blue-300" size={20} />
                 <input type="text" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} placeholder="Pesquisar por Telefone ou Nome..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] py-4 pl-12 pr-6 text-xs outline-none focus:border-blue-500 font-bold" />
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredUsers.map(u => (
                 <div key={u.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-lg transition-all group relative gap-6">
                    <div className="flex items-center gap-5 w-full">
                       <div className="bg-blue-600 text-white p-4 rounded-[1.5rem] shadow-lg flex-shrink-0">
                          <UserIcon size={24} />
                       </div>
                       <div className="flex-grow">
                          <div className="font-black text-blue-900 text-lg leading-none mb-1">{u.name}</div>
                          <div className="text-[10px] font-black text-gray-400 flex flex-wrap items-center gap-2 uppercase tracking-widest">
                             <button onClick={() => window.open(`https://wa.me/${u.phone.replace(/\D/g,'')}`)} className="text-blue-600 hover:underline flex items-center gap-1 font-bold">
                               <Phone size={10} /> {u.phone}
                             </button>
                             <span>• Criado: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '---'}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                             <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 flex items-center gap-1 uppercase">
                               <Key size={10} /> Senha Atual: {u.password}
                             </span>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => openPassModal(u)} 
                      className="w-full sm:w-auto p-4 bg-gray-50 text-blue-600 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 font-black text-xs"
                    >
                      <Lock size={18} /> ALTERAR SENHA
                    </button>
                 </div>
              ))}
           </div>
        </div>
      )}

      {isPassModalOpen && selectedUserForPass && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="bg-blue-600 p-8 text-center text-white relative">
                 <button onClick={() => setIsPassModalOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X size={24} /></button>
                 <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><Lock size={32} /></div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Alterar Senha</h3>
                 <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Usuário: {selectedUserForPass.name}</p>
              </div>

              <form onSubmit={handleUpdateUserPassword} className="p-10 space-y-6">
                 {passError && (
                   <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black border border-red-100 uppercase">
                     <AlertCircle size={18} /> {passError}
                   </div>
                 )}

                 <div className="space-y-4">
                    <div className="relative">
                       <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2">Nova Senha (Mín. 6 caracteres)</label>
                       <input 
                         type={showPassModalFields ? "text" : "password"} 
                         required 
                         minLength={6}
                         value={newPass} onChange={(e) => setNewPass(e.target.value)}
                         placeholder="••••••••"
                         className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-black text-center text-xl tracking-widest outline-none focus:border-blue-600 transition-all"
                       />
                       <button 
                          type="button"
                          onClick={() => setShowPassModalFields(!showPassModalFields)}
                          className="absolute right-4 top-10 text-gray-400 hover:text-blue-600"
                       >
                          {showPassModalFields ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2">Repita a Nova Senha</label>
                       <input 
                         type={showPassModalFields ? "text" : "password"} 
                         required 
                         minLength={6}
                         value={confirmNewPass} onChange={(e) => setConfirmNewPass(e.target.value)}
                         placeholder="••••••••"
                         className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-black text-center text-xl tracking-widest outline-none focus:border-blue-600 transition-all"
                       />
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} /> Confirmar Alteração
                 </button>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 p-8 md:p-10 rounded-[3rem] shadow-2xl text-white col-span-1 md:col-span-2 relative overflow-hidden group">
                 <TrendingUp className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000" size={240} />
                 <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2">Total Arrecadado ({financeYear})</h3>
                 <p className="text-5xl md:text-6xl font-black tracking-tighter">R$ {revenueStats.reduce((sum, m) => sum + m.total, 0).toLocaleString('pt-BR')}</p>
                 <button onClick={exportFinancialData} className="mt-8 bg-white/20 hover:bg-white/40 px-8 py-3 rounded-2xl text-[10px] font-black flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 uppercase"><FileSpreadsheet size={18} /> Baixar Relatório</button>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col justify-center">
                 <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Filter size={16} /> Ano de Referência</h3>
                 <select value={financeYear} onChange={(e) => setFinanceYear(Number(e.target.value))} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-black outline-none focus:border-blue-500 text-sm">
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>Anuário {y}</option>)}
                 </select>
              </div>
           </div>

           <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-gray-100">
              <h3 className="text-lg font-black text-blue-900 uppercase tracking-tighter mb-12 text-center md:text-left">Gráfico de Performance Mensal</h3>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueStats}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: '10px'}} />
                       <Bar dataKey="total" fill="#2563eb" radius={[12, 12, 0, 0]} barSize={40}>
                          {revenueStats.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#2563eb' : '#e2e8f0'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-gray-50">
           <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-10 text-center">Tabela de Preços</h2>
           <div className="space-y-8">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2">Assinatura Mensal (R$)</label>
                 <input type="number" value={settings.monthlyPrice} onChange={(e) => setSettings({...settings, monthlyPrice: Number(e.target.value)})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-8 font-black outline-none focus:border-blue-500 text-xl" />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2">Assinatura Anual (R$)</label>
                 <input type="number" value={settings.annualPrice} onChange={(e) => setSettings({...settings, annualPrice: Number(e.target.value)})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-8 font-black outline-none focus:border-blue-500 text-xl" />
              </div>
              <button onClick={() => alert("TABELA DE PREÇOS ATUALIZADA!")} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 transition-all">Publicar Novos Valores</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
