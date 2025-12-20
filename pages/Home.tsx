
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { Search, MapPin, Bed, Bath, Car, Maximize, ExternalLink, Home as HomeIcon, X, ChevronLeft, ChevronRight, Info, FileCheck, CheckCircle2, ZoomIn, Share2 } from 'lucide-react';
import { PropertyType, AnnouncementType, Property } from '../types';
import { SUPPORT_PHONE, CITIES_SP } from '../constants';

const HomePage: React.FC = () => {
  const { properties } = useApp();
  const [filterType, setFilterType] = useState<AnnouncementType | 'Todos'>('Todos');
  const [filterProperty, setFilterProperty] = useState<PropertyType | 'Todos'>('Todos');
  const [filterCity, setFilterCity] = useState<string>('Todas');
  const [visibleCount, setVisibleCount] = useState(8);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProperty]);

  const activeProperties = useMemo(() => {
    return properties.filter(p => p.status === 'active');
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return activeProperties.filter(p => {
      const typeMatch = filterType === 'Todos' || p.announcementType === filterType;
      const propertyMatch = filterProperty === 'Todos' || p.propertyType === filterProperty;
      const cityMatch = filterCity === 'Todas' || p.city === filterCity;
      return typeMatch && propertyMatch && cityMatch;
    });
  }, [activeProperties, filterType, filterProperty, filterCity]);

  const handleShare = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    const shareData = {
      title: 'Busca Busca Arealva - Imóveis',
      text: `Confira este imóvel: ${property.propertyType} em ${property.city} - R$ ${property.price.toLocaleString('pt-BR')}`,
      url: window.location.origin + window.location.pathname + '#/?ref=' + property.id.split('-')[0]
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link do imóvel copiado para a área de transferência!");
    }
  };

  const handleVisit = (property: Property) => {
    const text = encodeURIComponent(`Olá, quero agendar uma visita para o imóvel número ${property.id.split('-')[0].toUpperCase()}.`);
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${text}`, '_blank');
  };

  const handleMaps = (property: Property) => {
    window.open(`https://www.google.com/maps?q=${property.location.lat},${property.location.lng}`, '_blank');
  };

  return (
    <div className="pb-20 bg-white">
      <section className="bg-blue-600 text-white py-16 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">O imóvel dos seus sonhos está aqui.</h1>
          <p className="text-blue-100 text-lg">Busca simples, rápida e segura em toda região de Arealva-SP.</p>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 text-gray-800 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1">Finalidade</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none font-bold text-sm transition-all"
              >
                <option value="Todos">Todos</option>
                <option value={AnnouncementType.RENT}>Alugar</option>
                <option value={AnnouncementType.SALE}>Vender</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1">Tipo</label>
              <select 
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value as any)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none font-bold text-sm transition-all"
              >
                <option value="Todos">Todos</option>
                {Object.values(PropertyType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1">Cidade</label>
              <select 
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none font-bold text-sm transition-all"
              >
                <option value="Todas">Todas</option>
                {CITIES_SP.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                <Search size={20} /> PESQUISAR
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">
            {filteredProperties.length} Imóveis Disponíveis
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProperties.slice(0, visibleCount).map((p) => (
            <div 
              key={p.id} 
              onClick={() => { setSelectedProperty(p); setActivePhotoIndex(0); }}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="relative h-56">
                <img 
                  src={p.photos[0]} 
                  alt={p.propertyType} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm ${p.announcementType === AnnouncementType.RENT ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {p.announcementType}
                  </span>
                </div>
                <button 
                  onClick={(e) => handleShare(e, p)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2.5 rounded-full text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white transition-all z-10"
                  title="Compartilhar"
                >
                  <Share2 size={18} />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-black text-blue-900 mb-1">
                  R$ {p.price.toLocaleString('pt-BR')}
                  {p.announcementType === AnnouncementType.RENT && <span className="text-[10px] font-bold text-gray-400"> /MÊS</span>}
                </h3>
                <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase mb-4">
                  <MapPin size={12} className="mr-1 text-blue-600" /> {p.city}, SP
                </div>

                <div className="grid grid-cols-3 gap-y-4 gap-x-2 py-4 border-y border-gray-50 mb-4">
                  <div className="flex flex-col items-center">
                    <Bed size={16} className="text-blue-600 mb-1" />
                    <span className="text-[10px] font-black text-gray-800">{p.rooms} Qtos</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath size={16} className="text-blue-600 mb-1" />
                    <span className="text-[10px] font-black text-gray-800">{p.suites} Suít</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Car size={16} className="text-blue-600 mb-1" />
                    <span className="text-[10px] font-black text-gray-800">{p.parkingSpots} Vag</span>
                  </div>
                </div>

                <button className="w-full bg-blue-50 text-blue-600 font-black py-3 rounded-2xl text-xs uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                   Ver Detalhes Completos
                </button>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filteredProperties.length && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="bg-white border-4 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black px-16 py-4 rounded-full transition-all uppercase tracking-widest text-sm"
            >
              Ver Mais Imóveis
            </button>
          </div>
        )}
      </section>

      {selectedProperty && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="sticky top-0 z-[110] bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                   <HomeIcon size={20} />
                </div>
                <div>
                   <h2 className="font-black text-blue-900 leading-none uppercase tracking-tighter">Detalhes do Imóvel</h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referência: {selectedProperty.id.split('-')[0]}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button 
                   onClick={(e) => handleShare(e, selectedProperty)}
                   className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                   title="Compartilhar Imóvel"
                >
                   <Share2 size={24} />
                </button>
                <button 
                   onClick={() => setSelectedProperty(null)}
                   className="bg-red-50 text-red-600 p-3 rounded-full hover:bg-red-600 hover:text-white transition-all"
                >
                   <X size={24} />
                </button>
             </div>
          </div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">
             <div className="lg:w-2/3 bg-gray-50 flex flex-col">
                <div className="relative aspect-video lg:aspect-auto lg:h-[70vh] group cursor-zoom-in overflow-hidden" onClick={() => setIsLightboxOpen(true)}>
                   <img 
                      src={selectedProperty.photos[activePhotoIndex]} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Foto Principal"
                   />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={48} />
                   </div>
                   
                   {selectedProperty.photos.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(prev => prev > 0 ? prev - 1 : selectedProperty.photos.length - 1); }} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-4 rounded-full text-blue-900 shadow-xl transition-all"><ChevronLeft size={24} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(prev => prev < selectedProperty.photos.length - 1 ? prev + 1 : 0); }} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-4 rounded-full text-blue-900 shadow-xl transition-all"><ChevronRight size={24} /></button>
                      </>
                   )}
                </div>

                <div className="p-6 flex gap-4 overflow-x-auto hide-scrollbar bg-white border-b border-gray-100">
                   {selectedProperty.photos.map((photo, idx) => (
                      <button 
                         key={idx} 
                         onClick={() => setActivePhotoIndex(idx)}
                         className={`w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-4 transition-all ${activePhotoIndex === idx ? 'border-blue-600 scale-105' : 'border-transparent opacity-60'}`}
                      >
                         <img src={photo} className="w-full h-full object-cover" alt="" />
                      </button>
                   ))}
                </div>
             </div>

             <div className="lg:w-1/3 p-8 lg:p-12 bg-white flex flex-col gap-10">
                <div>
                   <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${selectedProperty.announcementType === AnnouncementType.RENT ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                         {selectedProperty.announcementType}
                      </span>
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                         {selectedProperty.propertyType}
                      </span>
                   </div>
                   <h1 className="text-5xl font-black text-blue-900 leading-none mb-3">R$ {selectedProperty.price.toLocaleString('pt-BR')}</h1>
                   <p className="text-gray-400 font-bold flex items-center gap-1.5 uppercase text-sm tracking-wide">
                      <MapPin size={18} className="text-blue-600" /> {selectedProperty.city}, SP
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center">
                      <Bed className="text-blue-600 mb-2" size={28} />
                      <span className="text-2xl font-black text-blue-900">{selectedProperty.rooms}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Quartos</span>
                   </div>
                   <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center">
                      <Maximize className="text-blue-600 mb-2" size={28} />
                      <span className="text-2xl font-black text-blue-900">{selectedProperty.area}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Metros (m²)</span>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                      <Bath className="text-gray-400 mb-2" size={28} />
                      <span className="text-2xl font-black text-blue-900">{selectedProperty.bathrooms}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Banheiros</span>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                      <Car className="text-gray-400 mb-2" size={28} />
                      <span className="text-2xl font-black text-blue-900">{selectedProperty.parkingSpots}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Vagas</span>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info size={18} /> Descrição do Proprietário
                   </h3>
                   <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                      "{selectedProperty.description}"
                   </div>
                </div>

                <div className="mt-auto space-y-4 pt-10">
                   <button 
                      onClick={() => handleVisit(selectedProperty)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-100 transition-all uppercase tracking-widest flex items-center justify-center gap-3 text-lg"
                   >
                      Agendar Visita <ChevronRight size={24} />
                   </button>
                   <button 
                      onClick={() => handleMaps(selectedProperty)}
                      className="w-full bg-white text-blue-600 border-2 border-blue-600 font-black py-4 rounded-2xl hover:bg-blue-50 transition-all uppercase text-xs flex items-center justify-center gap-2"
                   >
                      <MapPin size={20} /> Ver Localização no Mapa
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isLightboxOpen && selectedProperty && (
         <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <button 
               onClick={() => setIsLightboxOpen(false)} 
               className="absolute top-8 right-8 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all"
            >
               <X size={32} />
            </button>
            <img 
               src={selectedProperty.photos[activePhotoIndex]} 
               className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
               alt="Zoom" 
            />
            {selectedProperty.photos.length > 1 && (
               <>
                 <button onClick={() => setActivePhotoIndex(prev => prev > 0 ? prev - 1 : selectedProperty.photos.length - 1)} className="absolute left-8 top-1/2 -translate-y-1/2 text-white bg-white/5 p-8 rounded-full hover:bg-white/10 transition-all"><ChevronLeft size={48} /></button>
                 <button onClick={() => setActivePhotoIndex(prev => prev < selectedProperty.photos.length - 1 ? prev + 1 : 0)} className="absolute right-8 top-1/2 -translate-y-1/2 text-white bg-white/5 p-8 rounded-full hover:bg-white/10 transition-all"><ChevronRight size={48} /></button>
               </>
            )}
         </div>
      )}
    </div>
  );
};

export default HomePage;
