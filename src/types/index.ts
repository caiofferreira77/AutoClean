export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
}

export interface BookingService {
  id: string;
  name: string;
  price: number;
}

export interface Booking {
  id?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  serviceId: string; // Keep for legacy or primary service
  serviceName: string; // Keep for legacy or summary
  services: BookingService[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: 'online' | 'local';
  totalPrice: number;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'client';
}
