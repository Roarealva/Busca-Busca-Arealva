
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, DollarSign, CheckCircle, Clock, Copy, X, Loader2, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Property, AnnouncementType } from '../types';

const MyProperties: React.FC = () => {
  const { user, properties, settings, addTransaction, setProperties } = useApp();
  const [payingProperty, setPayingProperty] = useState<Property | null>(null);
  const [paymentStep, setPaymentStep] = useState<'options' | 'generating' | 'pix' | 'error'>('options');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  const [pixCode, setPixCode] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const myProperties = properties.filter(p => p.userId === user?.id);

  const handleStartPayment = (p: Property) => {
    setPayingProperty(p);
    setPaymentStep('options');
    setIsApproved(false);
    setErrorMessage('');
  };

  const handleGeneratePix = async (period: 'monthly' | 'annual') => {
    if (!payingProperty) return;
    
    setSelectedPlan(period);
    setPaymentStep('generating');
    setErrorMessage('');
    
    try {
      const amount = period === 'monthly' ? settings.monthlyPrice : settings.annualPrice;
      
      // Chamada real para o seu backend PHP
      const response = await fetch('api/gerar_pix.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: payingProperty.id,
          amount: amount,
          description: `Anúncio ${payingProperty.propertyType} - ${payingProperty.id.split('-')[0].toUpperCase()}`
        })
      });

      const data = await response.json();

      if (data.status === 'error' || !data.point_of_interaction) {
        throw new Error(data.message || 'Erro ao conectar com Mercado Pago.');
      }

      // O código PIX real retornado pela API do Mercado Pago
      setPixCode(data.point_of_interaction.transaction_data.qr_code);
      setPaymentStep('pix');

      // Inicia verificação automática (Polling) enquanto espera o webhook
      startStatusCheck(data.id);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Não foi possível gerar a chave PIX. Verifique sua conexão ou tente mais tarde.');
      setPaymentStep('error');
    }
  };

  // Verifica se o pagamento foi aprovado a cada 5 segundos
  const startStatusCheck = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`api/verificar_pagamento.php?id=${paymentId}`);
        const statusData = await res.json();
        
        if (statusData.status === 'approved') {
          clearInterval(interval);
          handlePaymentSuccess();
        }
      } catch (e) {
        console.error("Erro ao verificar status");
      }
    }, 5000);

    // Limpa o intervalo se o modal fechar
    return () => clearInterval(interval);
  };

  const handlePaymentSuccess = () => {
    if (!payingProperty || !selectedPlan) return;
    
    setIsApproved(true);
    
    setTimeout(() => {
      const amount = selectedPlan === 'monthly' ? settings.monthlyPrice : settings.annualPrice;
      
      addTransaction({
        id: crypto.randomUUID(),
        propertyId: payingProperty.id,
        amount,
        status: 'paid',
        method: 'pix',
        date: new Date().toISOString(),
        period: selectedPlan
      });

      const expiry = new Date();
      if (selectedPlan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
      else expiry.setFullYear(expiry.getFullYear() + 1);

      setProperties(prev => prev.map(p => p.id === payingProperty.id ? {
        ...p,
        status: 'active',
        expiryDate: expiry.toISOString()
      } : p));

      setPayingProperty(null);
    }, 2000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Copiado! Agora abra o app do seu banco e escolha 'PIX Copia e Cola'.");
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
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 flex justify-between items-center text-white relative">
              <h3 className="font-black text-xl uppercase tracking-tight">Pagamento Seguro PIX</h3>
              <button onClick={() => setPayingProperty(null)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            <div className="p-10">
              {paymentStep === 'options' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Escolha seu plano</p>
                    <h4 className="text-blue-900 font-black text-lg">IMÓVEL #{payingProperty.id.split('-')[0].toUpperCase()}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => handleGeneratePix('monthly')} className="flex items-center justify-between border-2 border-gray-100 p-6 rounded-3xl hover:border-blue-600 transition-all group">
                      <div className="text-left">
                         <span className="block text-[10px] font-black text-gray-400 uppercase">Mensal</span>
                         <span className="text-2xl font-black text-blue-900">R$ {settings.monthlyPrice}</span>
                      </div>
                      <PlusCircle className="text-gray-200 group-hover:text-blue-600" />
                    </button>
                    <button onClick={() => handleGeneratePix('annual')} className="flex items-center justify-between border-2 border-blue-600 bg-blue-50/50 p-6 rounded-3xl hover:bg-blue-50 transition-all group relative">
                      <div className="text-left">
                         <span className="block text-[10px] font-black text-blue-600 uppercase">Anual (Melhor Valor)</span>
                         <span className="text-2xl font-black text-blue-900">R$ {settings.annualPrice}</span>
                         <span className="text-[10px] text-blue-600 font-bold">Equivalente a R$ 16.67/mês</span>
                      </div>
                      <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full absolute -top-2 right-6">RECOMENDADO</div>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'generating' && (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
                  <h4 className="text-xl font-black text-blue-900 uppercase">Conectando...</h4>
                  <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">Gerando cobrança oficial no Mercado Pago</p>
                </div>
              )}

              {paymentStep === 'error' && (
                <div className="text-center py-10">
                   <div className="bg-red-50 p-6 rounded-3xl border border-red-100 mb-6">
                      <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                      <h4 className="text-lg font-black text-red-600 uppercase mb-2">Erro na Geração</h4>
                      <p className="text-xs font-bold text-red-400 leading-relaxed uppercase">{errorMessage}</p>
                   </div>
                   <button onClick={() => setPaymentStep('options')} className="bg-blue-600 text-white font-black py-4 px-8 rounded-2xl uppercase text-xs">Tentar Novamente</button>
                </div>
              )}

              {paymentStep === 'pix' && (
                <div className="text-center space-y-6">
                  {isApproved ? (
                    <div className="animate-in zoom-in duration-500 py-10">
                       <CheckCircle2 className="text-green-500 mx-auto mb-4" size={64} />
                       <h4 className="text-2xl font-black text-green-600 uppercase">PAGAMENTO APROVADO!</h4>
                       <p className="text-gray-400 text-xs font-bold">O anúncio já está disponível no portal.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-dashed border-blue-200">
                        <Smartphone className="text-blue-600 mx-auto mb-4" size={32} />
                        <p className="text-[10px] text-blue-900 font-black uppercase mb-4 tracking-widest">Código PIX "Copia e Cola"</p>
                        <div className="bg-white p-4 rounded-xl text-[9px] break-all font-mono text-gray-700 border border-blue-100 mb-6 leading-tight select-all">
                          {pixCode}
                        </div>
                        <button 
                          onClick={handleCopyPix}
                          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 uppercase text-xs"
                        >
                          <Copy size={16} /> Copiar Código PIX
                        </button>
                      </div>

                      <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-blue-600">
                           <Loader2 className="animate-spin" size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Aguardando Pagamento...</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-relaxed">
                          Assim que o pagamento for confirmado, seu anúncio será ativado automaticamente. Não é necessário enviar comprovante.
                        </p>
                      </div>
                    </>
                  )}
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
