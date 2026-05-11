import React, { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  updateDoc, 
  doc,
  getDocs
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckCircle, 
  X, 
  TrendingUp, 
  Clock, 
  Search, 
  Car,
  MapPin,
  Phone,
  LogOut,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Booking } from '../types';
import { cn } from '../lib/utils';

export const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue: bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + (b.totalPrice || 0) : sum, 0)
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">ADMIN PAINEL</h1>
            <p className="text-slate-500 font-medium">Gestão centralizada de agendamentos e serviços.</p>
          </div>
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            {['all', 'pending', 'confirmed', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                  filter === f 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {f === 'all' ? 'Tudo' : f === 'pending' ? 'Pendentes' : f === 'confirmed' ? 'Confirmados' : 'Concluídos'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total', value: stats.total, icon: ClipboardList, color: 'text-blue-500' },
            { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
            { label: 'Confirmados', value: stats.confirmed, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Receita Est.', value: `R$ ${stats.revenue}`, icon: TrendingUp, color: 'text-indigo-500' }
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={cn("w-5 h-5", s.color)} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors">
          {/* Header/Search */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Filas de Agendamento
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 transition-all w-full sm:w-64 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Carregando dados...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-20 text-center">
                <X className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4">Serviço/Valor</th>
                    <th className="px-8 py-4">Data/Local</th>
                    <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                  {filteredBookings.map((b) => (
                    <motion.tr 
                      layout
                      key={b.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <select 
                          value={b.status}
                          onChange={(e) => b.id && updateStatus(b.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer outline-none",
                            b.status === 'pending' ? "border-yellow-200 bg-yellow-50 text-yellow-600" :
                            b.status === 'confirmed' ? "border-green-200 bg-green-50 text-green-600" :
                            b.status === 'completed' ? "border-blue-200 bg-blue-50 text-blue-600" :
                            "border-red-200 bg-red-50 text-red-600"
                          )}
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <Phone className="w-3 h-3" /> {b.customerPhone}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-blue-600 dark:text-blue-400">{b.serviceName}</div>
                        <div className="text-lg font-black mt-1">R$ {b.totalPrice}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{b.date} às {b.time}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium max-w-[200px] truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {b.address}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a 
                          href={`https://wa.me/${b.customerPhone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-100 dark:shadow-none"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
