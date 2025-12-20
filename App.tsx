
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  User as UserIcon, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  MessageCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { User, Property, Transaction, AppSettings } from './types';
import { ADMIN_PHONE, SUPPORT_PHONE, DEFAULT_SETTINGS } from './constants';

// Pages
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import MyProperties from './pages/MyProperties';
import PropertyForm from './pages/PropertyForm';
import AdminDashboard from './pages/AdminDashboard';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('properties');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (t: Transaction) => setTransactions(prev => [...prev, t]);

  const handleSupport = () => {
    const text = encodeURIComponent("Olá, vim através do site Busca Busca Arealva e preciso de suporte.");
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${text}`, '_blank');
  };

  return (
    <AppContext.Provider value={{ user, setUser, properties, setProperties, settings, setSettings, transactions, addTransaction }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <Link to="/" className="flex flex-col items-center sm:flex-row sm:gap-2">
                  <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
                    <HomeIcon size={24} />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight text-blue-900 hidden sm:block">
                    BUSCA BUSCA <span className="text-blue-600">AREALVA</span>
                  </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button 
                    onClick={handleSupport}
                    className="hidden sm:flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm transition-all"
                  >
                    <MessageCircle size={18} /> SUPORTE
                  </button>
                  
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link to="/meus-imoveis" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-bold text-sm">
                         MEUS IMÓVEIS
                      </Link>
                      {user.phone === ADMIN_PHONE && (
                        <Link to="/admin" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
                          <ShieldCheck size={20} />
                          <span className="hidden md:inline">Painel Admin</span>
                        </Link>
                      )}
                      <button 
                        onClick={() => setUser(null)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Sair"
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to="/login" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-200"
                    >
                      LOGIN
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/meus-imoveis" element={user ? <MyProperties /> : <Navigate to="/login" />} />
              <Route path="/cadastrar-imovel" element={user ? <PropertyForm /> : <Navigate to="/login" />} />
              <Route path="/editar-imovel/:id" element={user ? <PropertyForm /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.phone === ADMIN_PHONE ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Busca Busca Arealva</h3>
                  <p className="text-sm">Seu portal especializado em encontrar o imóvel perfeito na região de São Paulo.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Mail size={16} /> roarealva@gmail.com</li>
                    <li className="flex items-center gap-2"><Phone size={16} /> (14) 99623-6447</li>
                    <li className="flex items-center gap-2"><MapPin size={16} /> Região de São Paulo</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Administração</h3>
                  <p className="text-sm">Administrado por Marcos Rogério Botelho Pavani - Arealva-SP</p>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs">
                <p>&copy; 2024 Busca Busca Arealva Imóveis. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
