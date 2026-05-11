import React from 'react';
import { motion } from 'motion/react';
import { Car, Shield, Star, CheckCircle, Sun, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../types';

interface ServicesProps {
  onSelect?: (s: Service) => void;
}

export const ServicesList = ({ onSelect }: ServicesProps) => {
  const navigate = useNavigate();
  const services: Service[] = [
    {
      id: 'lavagem-simples',
      name: 'Lavagem Simples',
      description: 'Limpeza externa detalhada e aspiração básica.',
      price: 60,
      duration: '45 min',
      icon: 'Car'
    },
    {
      id: 'lavagem-completa',
      name: 'Lavagem Completa',
      description: 'Lavagem detalhada, higienização interna e cera líquida.',
      price: 120,
      duration: '1h 30min',
      icon: 'Shield'
    },
    {
      id: 'polimento',
      name: 'Polimento Técnico',
      description: 'Remoção de riscos leves e brilho intenso na pintura.',
      price: 500,
      duration: '4h',
      icon: 'Star'
    },
    {
      id: 'cristalizacao',
      name: 'Cristalização',
      description: 'Proteção duradoura e brilho espelhado para a pintura.',
      price: 320,
      duration: '2h 30min',
      icon: 'Sun'
    },
    {
      id: 'higienizacao',
      name: 'Higienização Interna',
      description: 'Limpeza profunda de bancos, teto e carpetes.',
      price: 250,
      duration: '3h',
      icon: 'CheckCircle'
    }
  ];

  const handleSelect = (service: Service) => {
    if (onSelect) {
      onSelect(service);
    } else {
      // In standalone mode, navigate to booking with state
      navigate('/agendar', { state: { service } });
    }
  };

  return (
    <section id="servicos" className="py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">Nossos Serviços</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl transition-colors">
              Escolha o cuidado ideal para o seu veículo. Todos os serviços são realizados com produtos biodegradáveis de alta performance.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">POPULARES</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.div 
              key={service.id}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                {service.id === 'lavagem-simples' && <Car className="w-7 h-7" />}
                {service.id === 'lavagem-completa' && <Shield className="w-7 h-7" />}
                {service.id === 'polimento' && <Star className="w-7 h-7" />}
                {service.id === 'higienizacao' && <CheckCircle className="w-7 h-7" />}
                {service.id === 'cristalizacao' && <Sun className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{service.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed transition-colors">{service.description}</p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 transition-colors">Investimento</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white transition-colors">R$ {service.price}</span>
                </div>
                <button 
                  onClick={() => handleSelect(service)}
                  className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:scale-110 transition-all shadow-lg active:scale-95"
                  aria-label={`Agendar ${service.name}`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
