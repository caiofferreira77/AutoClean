import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Car, Clock, ChevronRight, X, User } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Booking } from '../types';
import { cn } from '../lib/utils';

export const MyAppointments = ({ user }: { user: FirebaseUser | null }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error("Fetch bookings error:", error);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Acesse sua conta</h2>
          <p className="text-slate-500 dark:text-slate-400">Você precisa estar logado para ver seus agendamentos.</p>
          <a href="/login" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl">Fazer Login</a>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Meus Agendamentos</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Acompanhe e gerencie seus serviços solicitados.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 transition-colors">
            {bookings.length} {bookings.length === 1 ? 'REGISTRO' : 'REGISTROS'}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Parece que você ainda não agendou nenhum serviço conosco.</p>
            <a href="/agendar" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Agendar Agora</a>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {bookings.map((booking, idx) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        booking.status === 'confirmed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        booking.status === 'completed' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        booking.status === 'cancelled' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {booking.status === 'confirmed' ? 'Confirmado' : 
                         booking.status === 'completed' ? 'Finalizado' :
                         booking.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                      </div>
                      <span className="text-xs font-bold text-slate-400 italic">#{booking.id?.slice(-6).toUpperCase()}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{booking.serviceName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {booking.services?.map((s, i) => (
                          <span key={i} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Calendar className="w-4 h-4 text-blue-600" /> {booking.date} às {booking.time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <MapPin className="w-4 h-4 text-blue-600" /> {booking.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 dark:border-slate-800">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {booking.totalPrice}</p>
                    <a 
                      href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Gostaria de suporte sobre meu agendamento #${booking.id?.slice(-6).toUpperCase()}`)}`}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Precisa de ajuda?
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
