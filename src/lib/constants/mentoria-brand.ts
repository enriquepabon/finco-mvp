/**
 * MentorIA Brand Constants
 * 
 * Paleta de colores, tipografía y constantes de marca para MentorIA.
 * Basado en la estrategia de marca completa y guía de voz y tono.
 */

// ============================================
// MARCA BASE
// ============================================

export const BRAND_NAME = 'MentorIA';
export const TAGLINE = 'Tu mentor financiero personal';

// ============================================
// COLORES DE MARCA
// ============================================

export const COLORS = {
  primaryBlue: '#2E5BFF',
  successGreen: '#00C48C',
  textDark: '#2D3436',
  textGray: '#95A5A6',
  bgLight: '#F8F9FA',
  warning: '#FFB800',
  white: '#FFFFFF',
  gradientPrimary: 'linear-gradient(135deg, #2E5BFF, #00C48C)',
};

export const MENTORIA_COLORS = {
  // Colores Principales
  primary: {
    blue: '#2E5BFF',      // Azul confianza (principal)
    blueHover: '#1E4BEF', // Azul hover
    blueDark: '#1A3DB8',  // Azul oscuro
  },
  
  // Colores de Estado
  success: {
    green: '#00C48C',      // Verde progreso
    greenLight: '#00E5A0', // Verde claro
    greenDark: '#00A375',  // Verde oscuro
  },
  
  warning: {
    yellow: '#FFB800',     // Amarillo alerta suave
    yellowLight: '#FFC933', // Amarillo claro
    yellowDark: '#E6A600',  // Amarillo oscuro
  },
  
  // Colores de Texto
  text: {
    dark: '#2D3436',       // Dark slate (texto principal)
    gray: '#95A5A6',       // Gris (texto secundario)
    light: '#FFFFFF',      // Blanco (texto en fondos oscuros)
    muted: '#636E72',      // Gris más oscuro (texto deshabilitado)
  },
  
  // Colores de Fondo
  background: {
    light: '#F8F9FA',      // Light neutral (fondo principal)
    white: '#FFFFFF',      // Blanco puro
    gradient: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
  },
  
  // Gradientes de Marca
  gradients: {
    primary: 'linear-gradient(135deg, #2E5BFF, #00C48C)',
    hero: 'linear-gradient(135deg, #2E5BFF, #00C48C)',
    cta: 'linear-gradient(135deg, #2E5BFF, #00C48C)',
  },
} as const;

// ============================================
// TIPOGRAFÍA
// ============================================

export const MENTORIA_TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
} as const;

// ============================================
// DIMENSIONES DE PERSONALIDAD (del PDF)
// ============================================

export const MENTORIA_PERSONALITY = {
  humor: 2,        // 2/10 - Ingenioso ocasional, nunca burlón
  formalidad: 5,   // 5/10 - Profesional accesible
  respeto: 9,      // 9/10 - Siempre empático, nunca condescendiente
  entusiasmo: 6,   // 6/10 - Motivador realista
} as const;

// ============================================
// COPY Y MENSAJES DE MARCA
// ============================================

export const MENTORIA_COPY = {
  // Taglines
  tagline: 'Tu mentor financiero personal',
  subtitle: 'Transforma tu relación con el dinero. De la ansiedad a la claridad en solo 2 minutos.',
  
  // Propuesta de Valor
  valueProposition: 'MentorIA transforma el caos financiero en claridad absoluta, convirtiendo la ansiedad del dinero en confianza para tomar decisiones.',
  
  // CTAs Principales
  cta: {
    primary: 'Empezar ahora',
    secondary: 'Ver demo',
    continue: 'Continuar',
    start: 'Empezar',
    save: 'Guardar meta',
    viewMore: 'Ver más',
  },
  
  // Trust Badges (Landing)
  trustBadges: [
    'Setup en 2 min',
    'Sin tarjeta de crédito',
    'IA que te entiende',
  ],
  
  // Mensajes de Onboarding
  onboarding: {
    welcome: '¡Hola! Soy MentorIA 👋 Vamos a mejorar tus finanzas juntos.',
    intro: 'Voy a realizar un análisis completo de tu situación financiera con 9 preguntas estratégicas.',
  },
  
  // Mensajes de Error (Empáticos y Humanos según guía MentorIA)
  errors: {
    // Errores generales
    generic: 'Hmm, algo salió mal. ¿Intentamos de nuevo?',
    serverError: 'Tuve un problema técnico. Inténtalo de nuevo en un momento.',
    unknown: 'No estoy seguro de qué pasó. ¿Probamos otra vez?',
    
    // Errores de red
    network: 'Parece que hay un problema de conexión. Revisa tu internet y vuelve a intentar.',
    timeout: 'Esto está tomando más tiempo del esperado. ¿Intentamos otra vez?',
    offline: 'No tienes conexión a internet. Revisa tu red y vuelve cuando estés en línea.',
    
    // Errores de autenticación
    auth: 'Necesito que inicies sesión de nuevo para continuar.',
    sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo, por favor.',
    unauthorized: 'No tienes permiso para hacer esto. ¿Iniciaste sesión?',
    
    // Errores de validación
    validation: 'Ups, ese dato no parece correcto. ¿Lo revisamos?',
    invalidInput: 'No entendí eso. ¿Puedes darme más detalles?',
    requiredField: 'Necesito que completes este campo para continuar.',
    invalidFormat: 'Este formato no está bien. ¿Puedes intentar de otra forma?',
    
    // Errores de voz y chat
    voiceError: 'No escuché bien. ¿Puedes repetir?',
    voiceNetwork: 'Hubo un problema con el micrófono. Verifica los permisos e inténtalo de nuevo.',
    chatError: 'Tuve un problema al responder. ¿Lo intentamos de nuevo?',
    chatProcessing: 'No pude procesar tu mensaje. ¿Podrías reformularlo?',
    
    // Errores de archivo
    uploadFailed: 'No pude procesar ese archivo. ¿Intentamos con otro formato?',
    fileTooLarge: 'Ese archivo es muy grande. Intenta con uno más pequeño.',
    invalidFileType: 'No puedo leer ese tipo de archivo. Intenta con PDF, imagen o texto.',
    
    // Errores de datos
    noData: 'No encontré esa información. ¿Puedes verificar?',
    dataCorrupted: 'Estos datos no se ven bien. ¿Puedes intentar de nuevo?',
    saveFailed: 'No pude guardar los cambios. Intenta otra vez.',
    
    // Errores de presupuesto/transacciones
    budgetNotFound: 'No encontré ese presupuesto. ¿Creamos uno nuevo?',
    transactionFailed: 'No pude registrar esa transacción. Inténtalo de nuevo.',
    invalidAmount: 'Ese monto no parece correcto. Revísalo, por favor.',
  },
  
  // Mensajes de Celebración (Gamificación)
  celebrations: {
    firstExpense: '¡Primer gasto registrado! 🎯 Así se empieza.',
    streak3: '¡3 días seguidos! 🔥 Vas muy bien.',
    streak7: '¡Primera semana completa! 🎉 Ya eres parte del 30% que lo logra.',
    streak14: '¡2 semanas! 💪 Esto se está volviendo un hábito.',
    streak21: '¡21 días! ⭐ Los expertos dicen que ya es un hábito formado.',
    streak30: '¡Un mes completo! 🏆 Increíble constancia.',
    firstBudget: '¡Tu primer presupuesto está listo! 💰 Ahora sí tenemos un plan.',
    goalCompleted: '¡Meta alcanzada! 🎯 Lo lograste.',
    savingsStart: '¡Empezaste a ahorrar! 💵 Cada paso cuenta.',
    debtPayment: '¡Pagaste deuda! 📉 Vas por buen camino.',
  },
  
  // Nudges Comportamentales (Micro-hábitos)
  nudges: {
    missingDays: 'Llevas 2 días sin registrar gastos. ¿Todo bien?',
    almostMilestone: (days: number, milestone: number) => 
      `¡Vas por ${days} días! ${milestone - days} más y desbloqueas un nuevo logro.`,
    weeklyReminder: 'Es buen momento para revisar tu semana. ¿Vemos cómo va tu presupuesto?',
    monthEndApproaching: 'El mes está por terminar. ¿Revisamos juntos cómo te fue?',
    overspending: 'Veo que gastaste más de lo planeado en esta categoría. ¿Ajustamos el presupuesto?',
    underspending: 'Estás gastando menos de lo esperado. ¡Buen control! 👏',
    savingsOpportunity: 'Basándome en tus gastos, podrías ahorrar un poco más este mes. ¿Te suena?',
    goalProgress: (percentage: number) => 
      `Llevas ${percentage}% de tu meta. ¡Sigue así!`,
  },
} as const;

// Alias para compatibilidad con código existente
export const BRAND_COPY = {
  ctaPrimary: MENTORIA_COPY.cta.primary,
  ctaSecondary: MENTORIA_COPY.cta.secondary,
  trustBadge1: MENTORIA_COPY.trustBadges[0],
  trustBadge2: MENTORIA_COPY.trustBadges[1],
  trustBadge3: MENTORIA_COPY.trustBadges[2],
  onboardingWelcome: MENTORIA_COPY.onboarding.welcome,
  initialOnboardingMessage: MENTORIA_COPY.onboarding.intro,
  initialBudgetMessage: 'Voy a ayudarte a crear un presupuesto mensual claro y realista.',
  errorGeneric: MENTORIA_COPY.errors.generic,
};

// ============================================
// REGLAS DE VOZ Y TONO
// ============================================

export const MENTORIA_TONE_RULES = `
### Reglas de Voz y Tono MentorIA

**Voz en una línea:** "Como el amigo experto que te explica finanzas sin hacerte sentir mal por no saber"

**DO's - Siempre:**
1. Simplicidad Radical
   - ✓ "Gastos" → ✗ "Egresos"
   - ✓ "Dinero que entra" → ✗ "Flujo de efectivo"
   - ✓ "Meta" → ✗ "Objetivo financiero"

2. Empatía Primero
   - ✓ "Este mes fue complicado, ¿verdad?"
   - ✗ "Fallaste en tu presupuesto"

3. Acción Clara
   - ✓ "Registra tu primer gasto. Toma 10 segundos."
   - ✗ "Deberías empezar a trackear tus finanzas"

4. Celebrar Pequeño
   - ✓ "¡3 días seguidos registrando! Vas bien."
   - ✗ "Solo llevas 3 días"

5. Contexto Siempre
   - ✓ "Sugiero 10% porque funciona para 7 de 10 personas como tú"
   - ✗ "Debes ahorrar 10%"

**DON'Ts - Nunca:**
1. Jerga Financiera sin explicar (ROI, APR, yield, liquidez)
2. Juicio o Culpa ("Gastaste demasiado", "Deberías haber...")
3. Promesas Irreales ("Serás rico", "Duplica tu dinero")
4. Paternalismo ("Te voy a enseñar", "Como no sabes...")
5. Ignorar Emociones ("Es solo matemática", "No es para tanto")

**Longitud de Mensajes:**
- Push Notifications: Max 50 caracteres
- In-app Alerts: Max 140 caracteres
- Diálogos IA: Max 280 caracteres por respuesta
- Explicaciones: Max 3 líneas (ofrecer "Ver más detalles")

**Uso de Emojis:** Medido y significativo
- ✓ Celebraciones: 🎯 🎉 ⭐
- ✓ Onboarding: 👋
- ✓ Alertas suaves: 💡
- ✗ Estados negativos
- ✗ Más de 1 por mensaje

**Mantra:** "Menos banco, más mentor"
` as const;

// ============================================
// ESPACIADO Y UI
// ============================================

export const MENTORIA_SPACING = {
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  
  padding: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
  
  gap: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
} as const;

// ============================================
// ANIMACIONES
// ============================================

export const MENTORIA_ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  framerMotion: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
  },
} as const;

// ============================================
// BADGES Y GAMIFICACIÓN
// ============================================

export const MENTORIA_BADGES = {
  primerPaso: {
    id: 'primer-paso',
    name: '🌱 Primer Paso',
    description: 'Completaste el onboarding',
    rarity: 'common',
  },
  racha3: {
    id: 'racha-3',
    name: '🔥 Racha de 3',
    description: '3 días consecutivos registrando gastos',
    rarity: 'common',
  },
  constancia: {
    id: 'constancia',
    name: '⭐ Constancia',
    description: '7 días consecutivos',
    rarity: 'rare',
  },
  compromisoTotal: {
    id: 'compromiso-total',
    name: '💎 Compromiso Total',
    description: '30 días consecutivos',
    rarity: 'epic',
  },
  primeraMeta: {
    id: 'primera-meta',
    name: '🎯 Primera Meta',
    description: 'Completaste tu primera meta de ahorro',
    rarity: 'rare',
  },
  sobreviviente: {
    id: 'sobreviviente',
    name: '💪 Sobreviviente',
    description: 'Te recuperaste de un mes difícil',
    rarity: 'rare',
  },
  fundador: {
    id: 'fundador',
    name: '👑 Fundador',
    description: 'Usuario desde FINCO',
    rarity: 'epic',
  },
} as const;

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene un color de la paleta con type-safety
 */
export function getColor(path: string): string {
  const parts = path.split('.');
  let value: any = MENTORIA_COLORS;
  
  for (const part of parts) {
    value = value[part];
    if (!value) return MENTORIA_COLORS.primary.blue; // Fallback
  }
  
  return value;
}

/**
 * Obtiene el mensaje de celebración según el tipo
 */
export function getCelebrationMessage(type: keyof typeof MENTORIA_COPY.celebrations): string {
  return MENTORIA_COPY.celebrations[type];
}

/**
 * Obtiene el mensaje de error empático
 */
export function getErrorMessage(type: keyof typeof MENTORIA_COPY.errors): string {
  return MENTORIA_COPY.errors[type];
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  colors: MENTORIA_COLORS,
  typography: MENTORIA_TYPOGRAPHY,
  personality: MENTORIA_PERSONALITY,
  copy: MENTORIA_COPY,
  toneRules: MENTORIA_TONE_RULES,
  spacing: MENTORIA_SPACING,
  animations: MENTORIA_ANIMATIONS,
  badges: MENTORIA_BADGES,
  // Utilidades
  getColor,
  getCelebrationMessage,
  getErrorMessage,
} as const;

