
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, MapPin, Loader2, Save, X, Plus, AlertCircle, Info, FileCheck } from 'lucide-react';
import { PropertyType, AnnouncementType, Property } from '../types';
import { CITIES_SP, ADMIN_PHONE } from '../constants';

declare const L: any;

const PropertyForm: React.FC = () => {
  const { user, properties, setProperties } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<Partial<Property>>({
    announcementType: AnnouncementType.SALE,
    propertyType: PropertyType.HOUSE,
    price: 0,
    city: 'Arealva',
    rooms: 1,
    suites: 0,
    bathrooms: 1,
    area: 0,
    hasDeed: true,
    parkingSpots: 0,
    description: '',
    photos: [],
    location: { lat: -22.0294, lng: -48.9103 }
  });

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      const p = properties.find(prop => prop.id === id);
      if (p) {
        if (p.userId !== user?.id && user?.phone !== ADMIN_PHONE) {
           navigate('/meus-imoveis');
           return;
        }
        setFormData(p);
      }
    }
  }, [id, properties, isEditing, user, navigate]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const initialLat = formData.location?.lat || -22.0294;
    const initialLng = formData.location?.lng || -48.9103;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        setFormData(prev => ({ ...prev, location: { lat: pos.lat, lng: pos.lng } }));
      });
    }

    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (formData.photos!.length + files.length > 4) {
      setErrorMsg("O LIMITE MÁXIMO É DE 4 FOTOS.");
      return;
    }
    setErrorMsg('');
    const readers = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(newPhotos => {
      setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...newPhotos] }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.photos!.length === 0) {
      setErrorMsg("POR FAVOR, ADICIONE PELO MENOS UMA FOTO.");
      return;
    }
    if (!formData.description || formData.description.trim().length < 20) {
       setErrorMsg("DESCRIÇÃO MUITO CURTA. ESCREVA MAIS PARA VALORIZAR SEU IMÓVEL.");
       return;
    }
    setLoading(true);

    setTimeout(() => {
      const existing = properties.find(p => p.id === id);
      const newProperty: Property = {
        id: isEditing ? id! : crypto.randomUUID(),
        userId: isEditing ? (existing?.userId || user!.id) : user!.id,
        announcementType: formData.announcementType!,
        price: Number(formData.price),
        propertyType: formData.propertyType!,
        city: formData.city!,
        rooms: Number(formData.rooms),
        suites: Number(formData.suites),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        hasDeed: formData.hasDeed!,
        parkingSpots: Number(formData.parkingSpots),
        description: formData.description!,
        photos: formData.photos!,
        location: formData.location!,
        status: isEditing ? (formData.status || 'pending') : 'pending',
        expiryDate: isEditing ? formData.expiryDate : undefined,
        createdAt: isEditing ? formData.createdAt! : new Date().toISOString()
      };

      if (isEditing) {
        setProperties(prev => prev.map(p => p.id === id ? newProperty : p));
      } else {
        setProperties(prev => [...prev, newProperty]);
      }
      setLoading(false);
      navigate('/meus-imoveis');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white text-gray-900">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none mb-2">
          {isEditing ? 'Atualizar Anúncio' : 'Publicar Novo Imóvel'}
        </h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Preencha todos os detalhes técnicos abaixo</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 p-6 md:p-12 space-y-10">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-3 text-xs font-black border border-red-100 animate-bounce">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        <section>
          <h2 className="text-xs font-black text-blue-600 uppercase mb-6 tracking-widest flex items-center gap-3">
             <span className="w-10 h-1 bg-blue-600 rounded-full"></span> Configurações de Venda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Tipo de Anúncio</label>
              <div className="flex gap-2">
                {Object.values(AnnouncementType).map(type => (
                  <button 
                    key={type} type="button"
                    onClick={() => setFormData({...formData, announcementType: type})}
                    className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all uppercase text-xs ${formData.announcementType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Tipo de Imóvel</label>
              <select value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value as any})} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-5 font-black outline-none focus:border-blue-500 text-sm text-gray-900">
                {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Preço Sugerido (R$)</label>
               <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-5 font-black outline-none focus:border-blue-500 text-gray-900" />
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Localização (Cidade SP)</label>
               <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-5 font-black outline-none focus:border-blue-500 text-gray-900">
                {CITIES_SP.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-blue-600 uppercase mb-6 tracking-widest flex items-center gap-3">
             <span className="w-10 h-1 bg-blue-600 rounded-full"></span> Características Técnicas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Dormitórios</label>
                <input type="number" min="0" value={formData.rooms} onChange={(e) => setFormData({...formData, rooms: Number(e.target.value)})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-center font-black text-gray-900" />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Sendo Suítes</label>
                <input type="number" min="0" value={formData.suites} onChange={(e) => setFormData({...formData, suites: Number(e.target.value)})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-center font-black text-gray-900" />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Banheiros</label>
                <input type="number" min="0" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-center font-black text-gray-900" />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Área Total m²</label>
                <input type="number" min="1" value={formData.area} onChange={(e) => setFormData({...formData, area: Number(e.target.value)})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-center font-black text-gray-900" />
             </div>
             <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Escritura?</label>
                <select value={formData.hasDeed ? "S" : "N"} onChange={(e) => setFormData({...formData, hasDeed: e.target.value === "S"})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-center font-black outline-none text-gray-900">
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
             </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
              <span className="w-10 h-1 bg-blue-600 rounded-full"></span> Descrição Detalhada do Imóvel
            </h2>
            <span className={`text-[10px] font-black ${formData.description!.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.description!.length} / 500
            </span>
          </div>
          <textarea 
            required maxLength={500}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Destaque as vantagens: banheira, condomínio, rio, área de lazer, local tranquilo, etc..."
            className="w-full bg-white border-2 border-gray-100 rounded-[2rem] p-6 md:p-8 h-48 outline-none text-sm font-medium focus:border-blue-500 transition-all leading-relaxed text-gray-900"
          ></textarea>
        </section>

        <section>
          <h2 className="text-xs font-black text-blue-600 uppercase mb-6 tracking-widest flex items-center gap-3">
             <span className="w-10 h-1 bg-blue-600 rounded-full"></span> Fotos do Imóvel (Max 4)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {formData.photos!.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-gray-100 group shadow-sm">
                <img src={photo} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setFormData(prev => ({...prev, photos: prev.photos?.filter((_, i) => i !== index)}))} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90"><X size={18} /></button>
              </div>
            ))}
            {formData.photos!.length < 4 && (
              <label className="aspect-square rounded-[1.5rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-300 hover:text-blue-500">
                <Camera size={40} />
                <span className="text-[10px] font-black mt-2 uppercase">Adicionar</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-blue-600 uppercase mb-6 tracking-widest flex items-center gap-3">
             <span className="w-10 h-1 bg-blue-600 rounded-full"></span> Localização Google Maps
          </h2>
          <div className="bg-gray-50 rounded-[2.5rem] h-[400px] md:h-[450px] relative overflow-hidden border-4 border-white shadow-xl">
            <div ref={mapContainerRef} className="h-full w-full z-10" />
            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white hidden sm:block">
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase mb-1">
                   <MapPin size={14} /> Marcador:
                </div>
                <p className="text-[10px] font-mono text-gray-500">{formData.location?.lat.toFixed(6)}, {formData.location?.lng.toFixed(6)}</p>
            </div>
          </div>
        </section>

        <div className="pt-6 md:pt-10 flex flex-col md:flex-row gap-4 md:gap-5">
          <button type="button" onClick={() => navigate('/meus-imoveis')} className="w-full md:flex-1 bg-white border-2 border-gray-100 font-black py-5 rounded-[2rem] uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="w-full md:flex-[2] bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
            {loading ? <Loader2 className="animate-spin" /> : <Save />} {isEditing ? 'Gravar Alterações' : 'Publicar Agora'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
