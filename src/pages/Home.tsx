import React from 'react';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { ServicesList } from '../components/Services';
import { Testimonials } from '../components/Testimonials';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <HowItWorks />
      <ServicesList />
      <Testimonials />
      
      {/* CTA section */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1605398333359-99bb3330669c?auto=format&fit=crop&q=80&w=1600" 
            alt="Professional Car Detailing Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-blue-900/40" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 italic uppercase tracking-tighter leading-none">
            Pronto para transformar <br /> seu patrimônio?
          </h2>
          <p className="text-xl opacity-90 mb-12 font-medium max-w-2xl mx-auto">
            Junte-se a milhares de motoristas exigentes que não abrem mão do cuidado profissional e da conveniência total.
          </p>
          <div className="flex justify-center">
            <Link to="/agendar">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-12 py-6 rounded-2xl text-xl font-black shadow-2xl hover:shadow-white/20 transition-all uppercase tracking-tight"
              >
                Agendar Lavagem VIP
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
