import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Calendar, MapPin, Phone, CheckCircle, 
  ChevronRight, Smartphone, Shield, Star, Sun, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  serverTimestamp, 
  addDoc, 
  collection 
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Booking, Service } from '../types';

export const BookingPage = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState<Partial<Booking>>({
    serviceId: '',
    serviceName: '',
    services: [],
    totalPrice: 0,
    status: 'pending',
    paymentMethod: 'local',
    customerName: user?.displayName || '',
    customerPhone: '',
    address: '',
    date: '',
    time: '',
    userId: user?.uid || undefined
  });

  const availableServices = [
    { id: 'lavagem-simples', name: 'Lavagem Simples', price: 80 },
    { id: 'lavagem-completa', name: 'Lavagem Completa', price: 120 },
    { id: 'polimento', name: 'Polimento Técnico', price: 500 },
    { id: 'cristalizacao', name: 'Cristalização', price: 320 },
    { id: 'higienizacao', name: 'Higienização Interna', price: 250 }
  ];

  // Handle initial service from navigation state
  useEffect(() => {
    const passedService = location.state?.service as Service;
    if (passedService) {
      const s = { id: passedService.id, name: passedService.name, price: passedService.price };
      setBookingData(prev => {
        const alreadySelected = prev.services?.find(item => item.id === s.id);
        if (alreadySelected) return prev;
        
        const newServices = [...(prev.services || []), s];
        const newTotal = newServices.reduce((sum, item) => sum + item.price, 0);
        return {
          ...prev,
          services: newServices,
          serviceId: s.id,
          serviceName: newServices.map(item => item.name).join(', '),
          totalPrice: newTotal
        };
      });
    }
  }, [location.state]);

  const toggleService = (s: { id: string, name: string, price: number }) => {
    setBookingData(prev => {
      const isSelected = prev.services?.find(item => item.id === s.id);
      let newServices;
      if (isSelected) {
        newServices = prev.services?.filter(item => item.id !== s.id) || [];
      } else {
        newServices = [...(prev.services || []), s];
      }
      const newTotal = newServices.reduce((sum, item) => sum + item.price, 0);
      return {
        ...prev,
        services: newServices,
        serviceId: newServices.length > 0 ? newServices[0].id : '',
        serviceName: newServices.map(item => item.name).join(', '),
        totalPrice: newTotal
      };
    });
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date
    const today = format(new Date(), 'yyyy-MM-dd');
    if (bookingData.date && bookingData.date < today) {
      toast.error('Não é possível agendar para uma data passada.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { userId, ...rest } = bookingData;
      const dataToSave: any = {
        ...rest,
        createdAt: serverTimestamp(),
      };

      if (user) {
        dataToSave.userId = user.uid;
      }

      await addDoc(collection(db, 'bookings'), dataToSave);
      toast.success('Agendamento realizado com sucesso!');
      setStep(4);
    } catch (error) {
      toast.error('Erro ao realizar agendamento.');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                  step >= i 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                    : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                )}
              >
                {i === 4 ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step - 1) * 33.33}%` }}
              className="absolute left-0 top-0 h-full bg-blue-600"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[500px] flex flex-col items-stretch transition-colors">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">O que faremos hoje?</h2>
                  {bookingData.totalPrice! > 0 && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Estimado</p>
                      <p className="text-3xl font-black text-blue-600 italic">R$ {bookingData.totalPrice}</p>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {availableServices.map((s) => {
                    const isSelected = bookingData.services?.find(item => item.id === s.id);
                    return (
                      <button 
                        key={s.id}
                        onClick={() => toggleService(s)}
                        className={cn(
                          "group p-6 border-2 rounded-2xl text-left transition-all font-bold shadow-sm flex flex-col justify-between h-full min-h-[140px]",
                          isSelected 
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" 
                            : "border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-200 bg-white dark:bg-slate-800"
                        )}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xl">{s.name}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 dark:border-slate-700"
                          )}>
                            {isSelected && <CheckCircle className="w-4 h-4" />}
                          </div>
                        </div>
                        <span className="text-2xl font-black mt-4">R$ {s.price}</span>
                      </button>
                    );
                  })}
                </div>

                <button 
                  disabled={!bookingData.services || bookingData.services.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all disabled:opacity-50 tracking-tight shadow-xl shadow-blue-100 dark:shadow-none"
                >
                  Continuar Agendamento
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form 
                  onSubmit={(e) => { e.preventDefault(); setStep(3); }} 
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Suas Informações</h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Seu Nome</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Como podemos te chamar?"
                        value={bookingData.customerName || ''}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all font-bold"
                        onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest">WhatsApp</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="(11) 99999-9999"
                        value={bookingData.customerPhone || ''}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all font-bold"
                        onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Endereço Completo</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          required
                          type="text" 
                          placeholder="Onde seu carro está?"
                          value={bookingData.address || ''}
                          className="w-full p-5 pl-14 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all font-bold"
                          onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl"
                  >
                    Próxima Etapa
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleBooking} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Data e Hora</h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Escolha a Data</label>
                      <input 
                        required
                        type="date" 
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={bookingData.date || ''}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all font-bold"
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Escolha o Horário</label>
                      <select 
                        required
                        value={bookingData.time || ''}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all font-bold appearance-none"
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                      >
                        <option value="">Selecione...</option>
                        {['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-400">Resumo da Reserva</h4>
                    <div className="space-y-2">
                      <p className="font-black text-lg text-slate-900 dark:text-white">
                        {bookingData.services?.map(s => s.name).join(' + ')}
                      </p>
                      <p className="text-blue-600 font-black text-2xl">Total: R$ {bookingData.totalPrice}</p>
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
                  >
                    {isSubmitting ? 'Agendando...' : 'Finalizar Agora'}
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-8"
              >
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">Tudo Pronto!</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto text-lg">
                    Seu agendamento foi registrado. Agora é só aguardar o dia marcado!
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white py-5 px-8 rounded-2xl font-black text-xl transition-all"
                  >
                    Voltar ao Início
                  </button>
                  <a 
                    href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Acabei de agendar na AutoClean:\n\n*Serviços:* ${bookingData.serviceName}\n*Total:* R$ ${bookingData.totalPrice}\n*Data:* ${bookingData.date}\n*Horário:* ${bookingData.time}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-green-600 font-bold hover:underline"
                  >
                    <Phone className="w-5 h-5" /> Enviar no WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
