'use client';

import { Navigation } from '@/components/branding/Navigation';
import { BRAND_COPY, COLORS } from '@/lib/constants/mentoria-brand';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics/events';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="mt-20 pt-16 pb-24 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center bg-gradient-to-br from-bg-light to-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              className="text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                variants={fadeInUp}
                transition={{ duration: 0.6, ease: [0.17, 0.55, 0.55, 1] }}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tu mentor financiero personal
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-text-gray mb-8 leading-relaxed"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Transforma tu relación con el dinero. De la ansiedad a la claridad en solo 2 minutos.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link 
                  href="/auth/signup"
                  onClick={() => trackEvent(AnalyticsEvents.LANDING_CTA_PRIMARY, { location: 'hero' })}
                  className="bg-primary-blue text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all inline-block text-center"
                >
                  {BRAND_COPY.ctaPrimary}
                </Link>
                <button 
                  onClick={() => trackEvent(AnalyticsEvents.LANDING_DEMO_CLICKED, { location: 'hero' })}
                  className="bg-white text-primary-blue px-8 py-4 rounded-xl text-lg font-semibold border-2 border-primary-blue hover:bg-primary-blue hover:text-white transition-all"
                >
                  {BRAND_COPY.ctaSecondary}
                </button>
              </motion.div>
              
              {/* Trust Badges */}
              <motion.div 
                className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-text-gray"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-success-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span>{BRAND_COPY.trustBadge1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-success-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span>{BRAND_COPY.trustBadge2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-success-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span>{BRAND_COPY.trustBadge3}</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Visual - Phone Mockup */}
            <motion.div 
              className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 relative overflow-hidden">
                {/* Chat Bubbles */}
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="bg-bg-light p-4 rounded-2xl rounded-tl-none"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-text-dark">Hola 👋 Soy MentorIA. ¿Cómo te llamo?</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-primary-blue text-white p-4 rounded-2xl rounded-tr-none ml-auto max-w-[80%]"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                  >
                    <p>María</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-bg-light p-4 rounded-2xl rounded-tl-none"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-text-dark">Mucho gusto, María. Vamos a ordenar tus finanzas juntos. ¿Cuál es tu meta principal?</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-primary-blue text-white p-4 rounded-2xl rounded-tr-none ml-auto max-w-[80%]"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                  >
                    <p>Quiero ahorrar para emergencias</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-bg-light p-4 rounded-2xl rounded-tl-none"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-text-dark">Excelente decisión. Te ayudaré a crear un fondo de emergencia. Empecemos con 10% de tu ingreso...</p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Todo lo que necesitas, nada que no
          </h2>
          <p className="text-xl text-text-gray text-center mb-12">
            Diseñado para ser simple, efectivo y humano
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: IA Conversacional */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                💬
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                IA Conversacional
              </h3>
              <p className="text-text-gray leading-relaxed">
                Habla o escribe. Tu mentor te entiende en lenguaje natural, sin comandos complicados.
              </p>
            </div>

            {/* Feature 2: Presupuesto Automático */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                🎯
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                Presupuesto Automático
              </h3>
              <p className="text-text-gray leading-relaxed">
                Creamos tu presupuesto en segundos basado en tus respuestas. Sin hojas de cálculo.
              </p>
            </div>

            {/* Feature 3: Insights Accionables */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                📊
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                Insights Accionables
              </h3>
              <p className="text-text-gray leading-relaxed">
                No solo datos. Te decimos exactamente qué hacer para mejorar tus finanzas.
              </p>
            </div>

            {/* Feature 4: Micro-hábitos */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                🔄
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                Micro-hábitos
              </h3>
              <p className="text-text-gray leading-relaxed">
                Cambios pequeños, impacto grande. Basado en ciencia del comportamiento.
              </p>
            </div>

            {/* Feature 5: Privacidad Total */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                🔒
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                Privacidad Total
              </h3>
              <p className="text-text-gray leading-relaxed">
                Tus datos son tuyos. Encriptación bancaria y transparencia completa.
              </p>
            </div>

            {/* Feature 6: Gamificación Sutil */}
            <div className="p-8 rounded-xl hover:-translate-y-2 transition-transform duration-300">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
                }}
              >
                🏆
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-3">
                Gamificación Sutil
              </h3>
              <p className="text-text-gray leading-relaxed">
                Logros y rachas que motivan sin presionar. Celebramos cada pequeño paso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how" className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            De cero a control en 4 pasos
          </h2>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-4 border-primary-blue rounded-full flex items-center justify-center text-2xl font-bold text-primary-blue mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                Conversa 2 minutos
              </h3>
              <p className="text-text-gray">
                Responde preguntas simples sobre tu situación actual
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-4 border-primary-blue rounded-full flex items-center justify-center text-2xl font-bold text-primary-blue mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                Recibe tu plan
              </h3>
              <p className="text-text-gray">
                Presupuesto personalizado y primera meta lista
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-4 border-primary-blue rounded-full flex items-center justify-center text-2xl font-bold text-primary-blue mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                Registra fácil
              </h3>
              <p className="text-text-gray">
                Gastos en segundos, por voz o texto
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-4 border-primary-blue rounded-full flex items-center justify-center text-2xl font-bold text-primary-blue mx-auto mb-6">
                4
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                Mejora continua
              </h3>
              <p className="text-text-gray">
                Ajustes semanales y coaching constante
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Historias reales de cambio
          </h2>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-bg-light p-8 rounded-xl">
              <div className="text-warning text-2xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-dark italic leading-relaxed mb-6">
                "Por primera vez en mi vida tengo claro a dónde va mi dinero. MentorIA no me juzga, solo me ayuda."
              </p>
              <div>
                <p className="text-text-dark font-semibold">Ana García</p>
                <p className="text-text-gray text-sm">Diseñadora, 28 años</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-bg-light p-8 rounded-xl">
              <div className="text-warning text-2xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-dark italic leading-relaxed mb-6">
                "En 3 meses pagué mi tarjeta de crédito. La app me guió paso a paso sin hacerme sentir mal."
              </p>
              <div>
                <p className="text-text-dark font-semibold">Carlos Mendoza</p>
                <p className="text-text-gray text-sm">Profesor, 35 años</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-bg-light p-8 rounded-xl">
              <div className="text-warning text-2xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-dark italic leading-relaxed mb-6">
                "Como freelancer mis ingresos varían. MentorIA se adapta y me ayuda a mantener estabilidad."
              </p>
              <div>
                <p className="text-text-dark font-semibold">Laura Díaz</p>
                <p className="text-text-gray text-sm">Consultora, 31 años</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - To be implemented */}
      <section 
        className="py-20 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.successGreen})`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tu futuro financiero empieza hoy
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sin compromisos. Sin tarjeta. Solo 2 minutos.
          </p>
          <Link 
            href="/auth/signup"
            onClick={() => trackEvent(AnalyticsEvents.LANDING_CTA_FOOTER, { location: 'cta_section' })}
            className="bg-white text-primary-blue px-10 py-4 rounded-xl text-lg font-semibold inline-block hover:scale-105 transition-transform"
          >
            Comenzar gratis ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Producto */}
            <div>
              <h4 className="font-bold text-lg mb-4">Producto</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-white/80 hover:text-white transition-colors">
                  Características
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Seguridad
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Roadmap
                </a>
              </div>
            </div>

            {/* Column 2: Compañía */}
            <div>
              <h4 className="font-bold text-lg mb-4">Compañía</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Sobre nosotros
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Blog
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Carreras
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Prensa
                </a>
              </div>
            </div>

            {/* Column 3: Recursos */}
            <div>
              <h4 className="font-bold text-lg mb-4">Recursos</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Centro de ayuda
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Guías
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  API Docs
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Community
                </a>
              </div>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Privacidad
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Términos
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Cookies
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Licencias
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-white/10 text-center text-white/60">
            <p>© 2024 MentorIA - Transformando la relación con el dinero, una conversación a la vez.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

