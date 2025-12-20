
import React, { useState } from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, DollarSign, CheckCircle, Clock, Copy, X } from 'lucide-react';
import { Property, AnnouncementType } from '../types';

const MyProperties: React.FC = () => {
  const { user, properties, settings, addTransaction, setProperties } = useApp();
  const [payingProperty, setPayingProperty] = useState<Property | null>(null);
  const [paymentStep, setPaymentStep] = useState<'options' | 'pix'>('options');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);

  const myProperties = properties.filter(p => p.userId === user?.id);

  const handleStartPayment = (p: Property) => {
    setPayingProperty(p);
    setPaymentStep('options');
  };

  const handleGeneratePix = (period: 'monthly' | 'annual') => {
    setSelectedPlan(period);
    setPaymentStep('pix');
  };

  const pixCode = selectedPlan ? `00020126580014BR.GOV.BCB.PIX01366236447-AREALVA-SP5204000053039865405${selectedPlan === 'monthly' ? settings.monthlyPrice : settings.annualPrice}005802BR5913BUSCA AREALVA6009SAO PAULO62070503***6304E2D3` : '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código PIX copiado com sucesso!");
  };

  const handleConfirmPayment = () => {
    if (!payingProperty || !selectedPlan) return;
    
    const amount = selectedPlan === 'monthly' ? settings.monthlyPrice : settings.annualPrice;
    
    const tx = {
      id: crypto.randomUUID(),
      propertyId: payingProperty.id,
      amount,
      status: 'paid' as const,
      method: 'pix' as const,
      date: new Date().toISOString(),
      period: selectedPlan
    };

    addTransaction(tx);

    const expiry = new Date();
    if (selectedPlan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else expiry.setFullYear(expiry.getFullYear() + 1);

    setProperties(prev => prev.map(p => p.id === payingProperty.id ? {
      ...p,
      status: 'active',
      expiryDate: expiry.toISOString()
    } : p));

    setPayingProperty(null);
    alert("Pagamento confirmado com sucesso! Seu imóvel agora está visível.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-blue-900">MEUS IMÓVEIS</h1>
        <Link 
          to="/cadastrar-imovel"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
        >
          <PlusCircle size={20} /> NOVO IMÓVEL
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
           <p className="text-gray-400 font-bold text-lg mb-4">Você ainda não tem nenhum imóvel cadastrado.</p>
           <Link to="/cadastrar-imovel" className="text-blue-600 font-black underline">Cadastre o primeiro agora</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myProperties.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src={p.photos[0]} className="w-full h-full object-cover" alt="" />
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${p.announcementType === AnnouncementType.RENT ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {p.announcementType}
                  </span>
                  <span className="text-gray-400 text-xs">{p.propertyType} em {p.city}</span>
                </div>
                <h3 className="font-extrabold text-blue-900 text-lg">R$ {p.price.toLocaleString('pt-BR')}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.description}</p>
              </div>

              <div className="flex items-center gap-4 border-l border-gray-100 pl-6 h-full min-w-[200px]">
                {p.status === 'active' ? (
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-green-600 font-black text-xs uppercase mb-1">
                      <CheckCircle size={14} /> STATUS: PAGO
                    </span>
                    <span className="text-[10px] text-gray-400">Expira em: {new Date(p.expiryDate!).toLocaleDateString('pt-BR')}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStartPayment(p)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-1 uppercase"
                  >
                    <DollarSign size={14} /> Efetuar Pagamento
                  </button>
                )}
                
                <Link 
                  to={`/editar-imovel/${p.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors border border-gray-100 rounded-lg"
                >
                  <Edit size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {payingProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
              <h3 className="font-black text-xl uppercase tracking-tight">Ativar Anúncio</h3>
              <button onClick={() => setPayingProperty(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {paymentStep === 'options' ? (
                <>
                  <p className="text-gray-600 text-center mb-8">
                    Escolha o plano para o imóvel <span className="font-bold">#{payingProperty.id.split('-')[0].toUpperCase()}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleGeneratePix('monthly')} className="border-2 border-gray-100 p-6 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <span className="text-xs font-bold text-gray-400 mb-1 uppercase">Mensal</span>
                      <span className="text-2xl font-black text-blue-900">R$ {settings.monthlyPrice}</span>
                    </button>
                    <button onClick={() => handleGeneratePix('annual')} className="border-2 border-blue-500 bg-blue-50 p-6 rounded-2xl hover:bg-blue-100 transition-all">
                      <span className="text-xs font-bold text-blue-600 mb-1 uppercase">Anual</span>
                      <span className="text-2xl font-black text-blue-900">R$ {settings.annualPrice}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl mb-6">
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase">CÓDIGO PIX:</p>
                    <div className="bg-white border border-gray-100 p-3 rounded-lg text-[10px] break-all font-mono text-gray-600 mb-4">
                      {pixCode}
                    </div>
                    <button 
                      onClick={handleCopyPix}
                      className="flex items-center justify-center gap-2 w-full bg-blue-100 text-blue-700 font-bold py-2 rounded-lg text-sm"
                    >
                      <Copy size={16} /> COPIAR CÓDIGO
                    </button>
                  </div>
                  <button 
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-500 text-white font-black py-4 rounded-xl"
                  >
                    CONFIRMAR PAGAMENTO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;
