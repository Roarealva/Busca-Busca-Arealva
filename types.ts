

export enum PropertyType {
  HOUSE = 'Casa',
  APARTMENT = 'Apartamento',
  LAND = 'Terreno',
  COMMERCIAL = 'Comercial',
  RANCH = 'Rancho/Sítio'
}

export enum AnnouncementType {
  RENT = 'Alugar',
  SALE = 'Vender'
}

export interface Property {
  id: string;
  userId: string;
  announcementType: AnnouncementType;
  price: number;
  propertyType: PropertyType;
  city: string;
  rooms: number;
  suites: number;
  bathrooms: number;
  area: number;
  hasDeed: boolean;
  parkingSpots: number;
  description: string;
  photos: string[]; // base64 or URLs
  location: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'active' | 'expired';
  expiryDate?: string;
  createdAt: string;
}

// Fixed missing createdAt property which caused errors in AdminDashboard.tsx
export interface User {
  id: string;
  phone: string;
  password: string; // 6 digits
  name: string;
  email: string;
  city: string;
  isAdmin: boolean;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  amount: number;
  status: 'paid' | 'pending';
  method: 'pix';
  date: string;
  period: 'monthly' | 'annual';
}

export interface AppSettings {
  monthlyPrice: number;
  annualPrice: number;
}