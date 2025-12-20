
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ADMIN_PHONE, CITIES_SP, SUPPORT_PHONE } from '../constants';
import { Lock, Phone, User, Mail, MapPin, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  const formatName = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleForgotPassword = () => {
    const text = encodeURIComponent(`Olá, esqueci minha senha no portal Busca Busca Arealva. Meu telefone cadastrado é: ${phone}`);
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${text}`, '_blank');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      
      if (phone === ADMIN_PHONE && (password === '123456' || password === 'admin123')) {
        const adminUser = { id: 'admin-id', phone, password, name: 'Admin Marcos', email: 'admin@busca.com', city: 'Arealva', isAdmin: true, createdAt: new Date().toISOString() };
        setUser(adminUser);
        navigate('/admin');
        setLoading(false);
        return;
      }

      const foundUser = users.find((u: any) => u.phone === phone);
      if (!foundUser) {
        setErrorMsg('Usuário não encontrado. Verifique o número digitado.');
      } else if (foundUser.password !== password) {
        setErrorMsg('Senha inválida. Tente novamente.');
      } else {
        setUser(foundUser);
        navigate('/meus-imoveis');
      }
      setLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg("A SENHA DEVE TER NO MÍNIMO 6 CARACTERES.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("AS SENHAS DIGITADAS NÃO COINCIDEM.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (users.find((u: any) => u.phone === phone)) {
        setErrorMsg("ESTE NÚMERO DE TELEFONE JÁ POSSUI CADASTRO.");
        setLoading(false);
        return;
      }

      const newUser = { 
        id: crypto.randomUUID(), 
        phone, 
        password, 
        name: formatName(name), 
        email: email.toLowerCase(), 
        city, 
        isAdmin: phone === ADMIN_PHONE,
        createdAt: new Date().toISOString() 
      };
      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
      
      setUser(newUser);
      navigate('/meus-imoveis');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 p-10 text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            {isRegistering ? 'CRIAR MINHA CONTA' : 'ACESSO AO PORTAL'}
          </h2>
          <p className="text-blue-100 text-xs font-bold mt-2 uppercase tracking-widest tracking-tight">Busca Busca Arealva Imóveis</p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="p-10 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={18} className="flex-shrink-0" /> {errorMsg.toUpperCase()}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Seu Telefone (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(14) 99999-9999" className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Senha (Mínimo 6 caracteres)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  minLength={6}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-blue-500 transition-all font-bold" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Repita sua Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    minLength={6}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold" 
                  />
                </div>
              </div>
            )}
          </div>

          {!isRegistering && (
             <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">Esqueci minha senha cadastrada</button>
             </div>
          )}

          {isRegistering && (
            <div className="space-y-4 pt-2">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nome e Sobrenome" 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold outline-none focus:border-blue-500" 
              />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold outline-none focus:border-blue-500" 
              />
              <select required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold outline-none focus:border-blue-500">
                <option value="">Cidade de SP</option>
                {CITIES_SP.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 mt-6 uppercase tracking-widest transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : (isRegistering ? 'Concluir Cadastro' : 'Entrar Agora')}
          </button>

          <div className="text-center mt-8">
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter">
              {isRegistering ? '← Já sou cadastrado? Entrar' : 'Ainda não tem conta? Clique aqui →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
