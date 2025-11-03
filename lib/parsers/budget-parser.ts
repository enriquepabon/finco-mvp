// ============================================================================
// PARSER INTELIGENTE PARA PRESUPUESTO CONVERSACIONAL - FINCO
// Versión: 1.0.0
// Fecha: Enero 2025
// Descripción: Parser avanzado para categorizar y procesar respuestas del chat de presupuesto
// ============================================================================

export interface BudgetCategory {
  name: string;
  type: 'income' | 'fixed_expense' | 'variable_expense';
  amount: number;
  description?: string;
  icon?: string;
  subcategories?: BudgetSubcategory[];
  isEssential?: boolean;
}

export interface BudgetSubcategory {
  name: string;
  amount: number;
  description?: string;
}

export interface BudgetPeriod {
  month: number;
  year: number;
}

export interface BudgetGoals {
  savingsTarget: number;
  emergencyFund: number;
  debtReduction?: number;
}

export interface ParsedBudgetResponse {
  question: number;
  original: string;
  parsed: {
    period?: BudgetPeriod;
    categories?: BudgetCategory[];
    goals?: BudgetGoals;
    concepts?: string[];
    priorities?: string[];
    amount?: number;
    text?: string;
  };
  categoriesCreated?: BudgetCategory[];
  timestamp: string;
}

// Mapeo de conceptos financieros a categorías sugeridas
const FINANCIAL_CONCEPTS = {
  // Ingresos
  income: {
    keywords: ['salario', 'sueldo', 'nómina', 'ingreso', 'gano', 'recibo', 'cobro', 'pago', 'honorarios', 'freelance', 'independiente', 'comisiones', 'bonos', 'prima', 'aguinaldo', 'pensión', 'renta', 'dividendos', 'intereses', 'arriendos'],
    defaultCategories: [
      { name: 'Salario Principal', icon: 'Briefcase', color: '#10B981' },
      { name: 'Ingresos Secundarios', icon: 'PlusCircle', color: '#059669' },
      { name: 'Ingresos Pasivos', icon: 'TrendingUp', color: '#047857' }
    ]
  },
  
  // Gastos fijos
  fixed_expenses: {
    keywords: ['fijo', 'fijos', 'mensual', 'siempre', 'cada mes', 'arriendo', 'alquiler', 'hipoteca', 'servicios', 'luz', 'agua', 'gas', 'internet', 'teléfono', 'celular', 'seguro', 'cuota', 'préstamo', 'crédito', 'tarjeta', 'administración', 'parqueadero', 'gimnasio', 'suscripción', 'netflix', 'spotify', 'transporte público', 'gasolina fija'],
    defaultCategories: [
      { name: 'Vivienda', icon: 'Home', color: '#DC2626' },
      { name: 'Servicios Públicos', icon: 'Zap', color: '#EA580C' },
      { name: 'Transporte Fijo', icon: 'Car', color: '#D97706' },
      { name: 'Seguros', icon: 'Shield', color: '#CA8A04' },
      { name: 'Deudas', icon: 'CreditCard', color: '#A16207' },
      { name: 'Suscripciones', icon: 'Repeat', color: '#92400E' }
    ]
  },
  
  // Gastos variables
  variable_expenses: {
    keywords: ['variable', 'variables', 'ocasional', 'a veces', 'depende', 'mercado', 'comida', 'alimentación', 'restaurante', 'salir', 'entretenimiento', 'cine', 'diversión', 'ropa', 'zapatos', 'personal', 'médico', 'salud', 'medicina', 'doctor', 'gasolina', 'uber', 'taxi', 'transporte', 'educación', 'cursos', 'libros', 'hogar', 'decoración', 'reparaciones', 'hormiga', 'café', 'dulces', 'compras'],
    defaultCategories: [
      { name: 'Alimentación', icon: 'UtensilsCrossed', color: '#7C2D12' },
      { name: 'Transporte Variable', icon: 'Navigation', color: '#78350F' },
      { name: 'Salud', icon: 'Heart', color: '#BE185D' },
      { name: 'Entretenimiento', icon: 'Gamepad2', color: '#A21CAF' },
      { name: 'Compras Personales', icon: 'ShoppingBag', color: '#86198F' },
      { name: 'Educación', icon: 'BookOpen', color: '#701A75' },
      { name: 'Gastos Hormiga', icon: 'Coffee', color: '#581C87' }
    ]
  }
};

// Iconos de Lucide React para categorías
const CATEGORY_ICONS: Record<string, string> = {
  // Ingresos
  'salario': 'Briefcase', 'sueldo': 'Briefcase', 'trabajo': 'Briefcase',
  'freelance': 'PlusCircle', 'independiente': 'PlusCircle', 'extra': 'PlusCircle',
  'inversiones': 'TrendingUp', 'dividendos': 'TrendingUp', 'renta': 'TrendingUp',
  
  // Vivienda
  'arriendo': 'Home', 'alquiler': 'Home', 'hipoteca': 'Home', 'vivienda': 'Home',
  'servicios': 'Zap', 'luz': 'Zap', 'agua': 'Droplets', 'gas': 'Flame',
  'internet': 'Wifi', 'teléfono': 'Phone', 'celular': 'Smartphone',
  
  // Transporte
  'transporte': 'Car', 'gasolina': 'Fuel', 'uber': 'Navigation', 'taxi': 'Navigation',
  'bus': 'Bus', 'metro': 'Train', 'parqueadero': 'ParkingCircle',
  
  // Otros
  'seguro': 'Shield', 'médico': 'Heart', 'salud': 'Heart', 'medicina': 'Pill',
  'comida': 'UtensilsCrossed', 'alimentación': 'UtensilsCrossed', 'mercado': 'ShoppingCart',
  'entretenimiento': 'Gamepad2', 'cine': 'Film', 'diversión': 'PartyPopper',
  'ropa': 'Shirt', 'zapatos': 'Footprints', 'educación': 'BookOpen',
  'gimnasio': 'Dumbbell', 'deporte': 'Trophy', 'café': 'Coffee'
};

// Función principal de parsing
export function parseBudgetResponse(question: number, userMessage: string): ParsedBudgetResponse {
  const original = userMessage.trim();
  const lowerMessage = original.toLowerCase();
  
  console.log(`🔍 Budget Parser - Pregunta ${question}: "${original}"`);
  
  const result: ParsedBudgetResponse = {
    question,
    original,
    parsed: {},
    timestamp: new Date().toISOString()
  };
  
  try {
    switch (question) {
      case 1: // Período (mes/año)
        result.parsed.period = parsePeriod(lowerMessage);
        break;
        
      case 2: // Período confirmación (puede ser ingresos genéricos)
        result.parsed.categories = parseIncomeCategories(original, lowerMessage);
        result.categoriesCreated = result.parsed.categories;
        break;
        
      case 3: // INGRESOS (salario, rentas, otros)
        result.parsed.categories = parseIncomeCategories(original, lowerMessage);
        result.categoriesCreated = result.parsed.categories;
        break;
        
      case 4: // GASTOS FIJOS (arriendo, servicios, etc.)
        result.parsed.categories = parseFixedExpenseCategories(original, lowerMessage);
        result.categoriesCreated = result.parsed.categories;
        break;
        
      case 5: // GASTOS VARIABLES (comida, entretenimiento, etc.)
        result.parsed.categories = parseVariableExpenseCategories(original, lowerMessage);
        result.categoriesCreated = result.parsed.categories;
        break;
        
      case 6: // SUBCATEGORÍAS (desglose)
        result.parsed.categories = parseSubcategories(original, lowerMessage);
        break;
        
      case 7: // META DE AHORRO
        result.parsed.goals = parseGoals(lowerMessage);
        break;
        
      case 8: // VALIDACIÓN FINAL
        result.parsed.text = original;
        break;
        
      default:
        result.parsed.text = original;
    }
    
    console.log(`✅ Budget Parsing Result:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error parsing budget response:`, error);
    result.parsed.text = original;
    return result;
  }
}

/**
 * 🎯 PARSER HÍBRIDO: Combina respuesta de IA + datos del usuario
 * - IA: determina tipo de pregunta y estructura
 * - Usuario: extrae datos reales y montos
 */
export function parseHybridBudgetResponse(
  questionNumber: number, 
  fincoResponse: string, 
  userMessage: string
): ParsedBudgetResponse {
  console.log(`🔄 Parser Híbrido - Pregunta ${questionNumber}`);
  console.log(`🤖 FINCO: ${fincoResponse.substring(0, 50)}...`);
  console.log(`👤 Usuario: ${userMessage.substring(0, 50)}...`);
  
  const result: ParsedBudgetResponse = {
    question: questionNumber,
    original: userMessage, // Mantener mensaje original del usuario
    parsed: {},
    timestamp: new Date().toISOString()
  };
  
  // Determinar tipo de pregunta basado en la respuesta de FINCO
  const lowerFincoResponse = fincoResponse.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  // Detectar tipo de pregunta por palabras clave de FINCO
  let questionType = 'unknown';
  
  if (lowerFincoResponse.includes('mes') && lowerFincoResponse.includes('año')) {
    questionType = 'period';
  } else if (lowerFincoResponse.includes('ingreso') && lowerFincoResponse.includes('mensual')) {
    questionType = 'income';
  } else if (lowerFincoResponse.includes('gastos fijos') || lowerFincoResponse.includes('fijo')) {
    questionType = 'fixed_expense';
  } else if (lowerFincoResponse.includes('gastos variables') || lowerFincoResponse.includes('variable')) {
    questionType = 'variable_expense';
  } else if (lowerFincoResponse.includes('desglosar') || lowerFincoResponse.includes('subcategoría')) {
    questionType = 'subcategories';
  } else if (lowerFincoResponse.includes('ahorrar') || lowerFincoResponse.includes('ahorro')) {
    questionType = 'savings';
  } else if (lowerFincoResponse.includes('ajustar') || lowerFincoResponse.includes('cambio')) {
    questionType = 'adjustments';
  } else if (lowerFincoResponse.includes('confirma') || lowerFincoResponse.includes('finalizar')) {
    questionType = 'confirmation';
  }
  
  console.log(`🎯 Tipo detectado: ${questionType}`);
  
  // Parsear datos reales del usuario según el tipo detectado
  switch (questionType) {
    case 'period':
      result.parsed.period = parsePeriod(lowerUserMessage);
      break;
      
    case 'income':
      result.parsed.categories = parseIncomeCategories(userMessage, lowerUserMessage);
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 'fixed_expense':
      result.parsed.categories = parseFixedExpenseCategories(userMessage, lowerUserMessage);
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 'variable_expense':
      result.parsed.categories = parseVariableExpenseCategories(userMessage, lowerUserMessage);
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 'subcategories':
      result.parsed.categories = parseSubcategories(userMessage, lowerUserMessage);
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 'savings':
      result.parsed.goals = parseGoals(lowerUserMessage);
      break;
      
    case 'adjustments':
      result.parsed.text = userMessage;
      break;
      
    case 'confirmation':
      result.parsed.text = userMessage;
      break;
      
    default:
      // Fallback: usar número de pregunta
      return parseBudgetResponse(questionNumber, userMessage);
  }
  
  console.log(`✅ Parser Híbrido completado:`, result.categoriesCreated?.length || 0, 'categorías');
  return result;
}

/**
 * 🎯 PARSER PARA RESPUESTAS ESTRUCTURADAS DE FINCO
 * Esta función parsea las respuestas de la IA, no las del usuario (estrategia correcta)
 */
export function parseBudgetResponseFromAI(questionNumber: number, fincoResponse: string): ParsedBudgetResponse {
  console.log(`🤖 Parseando respuesta de FINCO - Pregunta ${questionNumber}`);
  
  const result: ParsedBudgetResponse = {
    question: questionNumber,
    original: fincoResponse,
    parsed: {},
    timestamp: new Date().toISOString()
  };
  
  // La IA estructura sus respuestas de manera predecible
  // Buscar patrones específicos en la respuesta de FINCO
  const lowerResponse = fincoResponse.toLowerCase();
  
  switch (questionNumber) {
    case 1: // Período - FINCO pregunta por mes/año
      // FINCO pregunta: "¿Para qué mes y año quieres crear tu presupuesto?"
      // Extraer período por defecto (mes actual)
      const now = new Date();
      result.parsed.period = { 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      };
      break;
      
    case 2: // Confirmación período - FINCO pregunta ingresos
      // FINCO pregunta: "¿Cuál es tu ingreso total mensual?"
      // Crear categoría de ingresos genérica
      result.parsed.categories = [{
        name: 'Ingresos Mensuales',
        type: 'income',
        amount: 0,
        icon: 'DollarSign',
        description: 'Ingresos totales mensuales',
        isEssential: true
      }];
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 3: // FINCO pregunta gastos fijos
      // FINCO pregunta: "Lista tus gastos fijos mensuales CON MONTOS"
      result.parsed.categories = [{
        name: 'Gastos Fijos',
        type: 'fixed_expense', 
        amount: 0,
        icon: 'Home',
        description: 'Gastos fijos mensuales',
        isEssential: true
      }];
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 4: // FINCO pregunta gastos variables
      // FINCO pregunta: "Lista tus gastos variables CON MONTOS"
      result.parsed.categories = [{
        name: 'Gastos Variables',
        type: 'variable_expense',
        amount: 0, 
        icon: 'ShoppingCart',
        description: 'Gastos variables mensuales',
        isEssential: false
      }];
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 5: // FINCO pregunta subcategorías
      // FINCO pregunta: "¿Quieres desglosar alguna categoría?"
      result.parsed.categories = [{
        name: 'Subcategorías',
        type: 'variable_expense',
        amount: 0,
        icon: 'List', 
        description: 'Desglose detallado',
        isEssential: false
      }];
      result.categoriesCreated = result.parsed.categories;
      break;
      
    case 6: // FINCO pregunta ahorro
      // FINCO pregunta: "¿Cuánto quieres AHORRAR este mes?"
      result.parsed.goals = { savingsTarget: 0, emergencyFund: 0 };
      break;
      
    case 7: // FINCO pregunta ajustes
      // FINCO pregunta: "¿Hay algo que quieras AJUSTAR?"
      result.parsed.text = 'Ajustes finales';
      break;
      
    case 8: // FINCO confirma datos
      // FINCO pregunta: "¿Confirmas estos datos para crear tu presupuesto?"
      result.parsed.text = 'Confirmación final';
      break;
  }
  
  console.log(`✅ Respuesta de FINCO parseada:`, result.categoriesCreated?.length || 0, 'categorías');
  return result;
}

// Parsear período (mes/año)
function parsePeriod(message: string): BudgetPeriod {
  const currentDate = new Date();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  
  // Meses en español
  const months = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12,
    'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dic': 12
  };
  
  // Buscar mes mencionado
  for (const [monthName, monthNum] of Object.entries(months)) {
    if (message.includes(monthName)) {
      month = monthNum;
      break;
    }
  }
  
  // Buscar año (4 dígitos)
  const yearMatch = message.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  }
  
  // Palabras clave para períodos relativos
  if (message.includes('próximo') || message.includes('siguiente')) {
    if (month === 12) {
      month = 1;
      year++;
    } else {
      month++;
    }
  }
  
  return { month, year };
}

// Parsear categorías de ingresos - REESCRITO
function parseIncomeCategories(original: string, lowerMessage: string): BudgetCategory[] {
  console.log('🔍 parseIncomeCategories - Input:', original);
  
  // Primero intentar con el parser mejorado
  const categoriesWithAmounts = parseCategoriesWithAmounts(original, 'income');
  if (categoriesWithAmounts.length > 0) {
    console.log('✅ Parser mejorado encontró:', categoriesWithAmounts.length, 'categorías');
    return categoriesWithAmounts;
  }
  
  // Crear categorías por defecto basadas en palabras clave
  const categories: BudgetCategory[] = [];
  
  if (lowerMessage.includes('salario') || lowerMessage.includes('sueldo') || lowerMessage.includes('trabajo')) {
    categories.push({
      name: 'Salario Principal',
      type: 'income',
      amount: 0,
      icon: 'Briefcase',
      description: 'Ingresos por trabajo principal'
    });
  }
  
  if (lowerMessage.includes('renta') || lowerMessage.includes('arriendo') || lowerMessage.includes('alquiler')) {
    categories.push({
      name: 'Ingresos por Arriendos',
      type: 'income',
      amount: 0,
      icon: 'Building',
      description: 'Ingresos por propiedades'
    });
  }
  
  if (lowerMessage.includes('otros') || lowerMessage.includes('extra') || lowerMessage.includes('adicional')) {
    categories.push({
      name: 'Otros Ingresos',
      type: 'income',
      amount: 0,
      icon: 'PlusCircle',
      description: 'Ingresos adicionales'
    });
  }
  
  // Si no se detectó nada, crear una categoría genérica
  if (categories.length === 0) {
    categories.push({
      name: 'Ingresos Mensuales',
      type: 'income',
      amount: 0,
      icon: 'DollarSign',
      description: 'Ingresos totales mensuales'
    });
  }
  
  console.log('✅ Categorías de ingresos creadas:', categories.length);
  return categories;
}

// Parsear categorías de gastos fijos - REESCRITO
function parseFixedExpenseCategories(original: string, lowerMessage: string): BudgetCategory[] {
  console.log('🔍 parseFixedExpenseCategories - Input:', original);
  
  // Primero intentar con el parser mejorado
  const categoriesWithAmounts = parseCategoriesWithAmounts(original, 'fixed_expense');
  if (categoriesWithAmounts.length > 0) {
    console.log('✅ Parser mejorado encontró:', categoriesWithAmounts.length, 'categorías');
    return categoriesWithAmounts;
  }
  
  // Crear categorías por defecto basadas en palabras clave
  const categories: BudgetCategory[] = [];
  
  if (lowerMessage.includes('arriendo') || lowerMessage.includes('alquiler')) {
    categories.push({
      name: 'Arriendo/Alquiler',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Home',
      description: 'Pago mensual de vivienda',
      isEssential: true
    });
  }
  
  if (lowerMessage.includes('servicios') || lowerMessage.includes('luz') || lowerMessage.includes('agua')) {
    categories.push({
      name: 'Servicios Públicos',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Zap',
      description: 'Luz, agua, gas',
      isEssential: true
    });
  }
  
  if (lowerMessage.includes('administración') || lowerMessage.includes('admin')) {
    categories.push({
      name: 'Administración',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Building2',
      description: 'Cuota de administración',
      isEssential: true
    });
  }
  
  if (lowerMessage.includes('prepagada') || lowerMessage.includes('celular') || lowerMessage.includes('teléfono')) {
    categories.push({
      name: 'Telefonía',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Smartphone',
      description: 'Plan celular y telefonía',
      isEssential: true
    });
  }
  
  if (lowerMessage.includes('seguridad social') || lowerMessage.includes('salud')) {
    categories.push({
      name: 'Seguridad Social',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Shield',
      description: 'Aportes de salud y pensión',
      isEssential: true
    });
  }
  
  // Si no se detectó nada, crear categorías genéricas
  if (categories.length === 0) {
    categories.push({
      name: 'Gastos Fijos Mensuales',
      type: 'fixed_expense',
      amount: 0,
      icon: 'Home',
      description: 'Gastos fijos del mes',
      isEssential: true
    });
  }
  
  console.log('✅ Categorías de gastos fijos creadas:', categories.length);
  return categories;
}

// Parsear categorías de gastos variables - REESCRITO
function parseVariableExpenseCategories(original: string, lowerMessage: string): BudgetCategory[] {
  console.log('🔍 parseVariableExpenseCategories - Input:', original);
  
  // Primero intentar con el parser mejorado
  const categoriesWithAmounts = parseCategoriesWithAmounts(original, 'variable_expense');
  if (categoriesWithAmounts.length > 0) {
    console.log('✅ Parser mejorado encontró:', categoriesWithAmounts.length, 'categorías');
    return categoriesWithAmounts;
  }
  
  // Crear categorías por defecto basadas en palabras clave
  const categories: BudgetCategory[] = [];
  
  if (lowerMessage.includes('comida') || lowerMessage.includes('alimentación') || lowerMessage.includes('mercado')) {
    categories.push({
      name: 'Alimentación',
      type: 'variable_expense',
      amount: 0,
      icon: 'UtensilsCrossed',
      description: 'Gastos en comida y alimentación',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('transporte') || lowerMessage.includes('gasolina') || lowerMessage.includes('uber')) {
    categories.push({
      name: 'Transporte',
      type: 'variable_expense',
      amount: 0,
      icon: 'Car',
      description: 'Gastos de movilidad',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('entretenimiento') || lowerMessage.includes('diversión') || lowerMessage.includes('cine')) {
    categories.push({
      name: 'Entretenimiento',
      type: 'variable_expense',
      amount: 0,
      icon: 'Gamepad2',
      description: 'Gastos de diversión y entretenimiento',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('bienestar') || lowerMessage.includes('salud') || lowerMessage.includes('gimnasio')) {
    categories.push({
      name: 'Bienestar y Salud',
      type: 'variable_expense',
      amount: 0,
      icon: 'Heart',
      description: 'Gastos en salud y bienestar',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('suscripciones') || lowerMessage.includes('streaming') || lowerMessage.includes('netflix')) {
    categories.push({
      name: 'Suscripciones',
      type: 'variable_expense',
      amount: 0,
      icon: 'Tv',
      description: 'Servicios de streaming y suscripciones',
      isEssential: false
    });
  }
  
  // Si no se detectó nada, crear categoría genérica
  if (categories.length === 0) {
    categories.push({
      name: 'Gastos Variables',
      type: 'variable_expense',
      amount: 0,
      icon: 'ShoppingBag',
      description: 'Gastos variables del mes',
      isEssential: false
    });
  }
  
  console.log('✅ Categorías de gastos variables creadas:', categories.length);
  return categories;
}

// Parsear subcategorías
function parseSubcategories(original: string, lowerMessage: string): BudgetCategory[] {
  console.log('🔍 parseSubcategories - Input:', original);
  
  // Intentar con el parser mejorado primero
  const categoriesWithAmounts = parseCategoriesWithAmounts(original, 'variable_expense');
  if (categoriesWithAmounts.length > 0) {
    console.log('✅ Subcategorías parseadas:', categoriesWithAmounts.length);
    return categoriesWithAmounts;
  }
  
  // Si no encuentra nada, crear categorías basadas en palabras clave comunes
  const categories: BudgetCategory[] = [];
  
  // Detectar subcategorías de comida
  if (lowerMessage.includes('mercado')) {
    categories.push({
      name: 'Mercado',
      type: 'variable_expense',
      amount: extractFirstAmount(original) || 0,
      icon: 'ShoppingCart',
      description: 'Compras en supermercado',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('restaurante')) {
    categories.push({
      name: 'Restaurantes',
      type: 'variable_expense',
      amount: extractSecondAmount(original) || 0,
      icon: 'UtensilsCrossed',
      description: 'Comidas en restaurantes',
      isEssential: false
    });
  }
  
  if (lowerMessage.includes('rappi') || lowerMessage.includes('domicilio')) {
    categories.push({
      name: 'Domicilios',
      type: 'variable_expense',
      amount: extractThirdAmount(original) || 0,
      icon: 'Truck',
      description: 'Pedidos a domicilio',
      isEssential: false
    });
  }
  
  // Si no detectó nada específico, crear una categoría genérica
  if (categories.length === 0) {
    categories.push({
      name: 'Subcategorías',
      type: 'variable_expense',
      amount: 0,
      icon: 'List',
      description: 'Gastos detallados',
      isEssential: false
    });
  }
  
  console.log('✅ Subcategorías creadas:', categories.length);
  return categories;
}

// Funciones auxiliares para extraer montos por posición
function extractFirstAmount(message: string): number {
  const amounts = extractAmounts(message);
  return amounts[0] || 0;
}

function extractSecondAmount(message: string): number {
  const amounts = extractAmounts(message);
  return amounts[1] || 0;
}

function extractThirdAmount(message: string): number {
  const amounts = extractAmounts(message);
  return amounts[2] || 0;
}

// Parsear prioridades
function parsePriorities(message: string): string[] {
  const priorities: string[] = [];
  
  // Palabras clave de prioridad
  const priorityKeywords = {
    'esencial': 'high',
    'importante': 'high',
    'necesario': 'high',
    'obligatorio': 'high',
    'opcional': 'low',
    'deseable': 'medium',
    'puede esperar': 'low'
  };
  
  for (const [keyword, priority] of Object.entries(priorityKeywords)) {
    if (message.includes(keyword)) {
      priorities.push(priority);
    }
  }
  
  return priorities;
}

// Parsear metas financieras
function parseGoals(message: string): BudgetGoals {
  const savingsTarget = parseAmount(message);
  
  return {
    savingsTarget,
    emergencyFund: 0
  };
}

// Detectar tipos de ingresos
function detectIncomeTypes(message: string) {
  const types: Array<{name: string, icon: string, description?: string}> = [];
  
  if (message.includes('salario') || message.includes('sueldo') || message.includes('trabajo')) {
    types.push({ name: 'Salario Principal', icon: 'Briefcase', description: 'Ingreso principal del trabajo' });
  }
  
  if (message.includes('freelance') || message.includes('independiente') || message.includes('extra')) {
    types.push({ name: 'Trabajo Independiente', icon: 'PlusCircle', description: 'Ingresos por trabajo freelance' });
  }
  
  if (message.includes('inversión') || message.includes('dividendos') || message.includes('renta')) {
    types.push({ name: 'Ingresos Pasivos', icon: 'TrendingUp', description: 'Ingresos por inversiones' });
  }
  
  if (message.includes('arriendo') || message.includes('alquiler')) {
    types.push({ name: 'Arriendos', icon: 'Building', description: 'Ingresos por propiedades' });
  }
  
  return types;
}

// Detectar tipos de gastos
function detectExpenseTypes(message: string, type: 'fixed' | 'variable') {
  const types: Array<{name: string, icon: string, isEssential?: boolean, description?: string}> = [];
  const concepts = type === 'fixed' ? FINANCIAL_CONCEPTS.fixed_expenses : FINANCIAL_CONCEPTS.variable_expenses;
  
  // Buscar palabras clave y crear categorías dinámicamente
  for (const keyword of concepts.keywords) {
    if (message.includes(keyword)) {
      const categoryName = capitalizeCategoryName(keyword);
      const icon = CATEGORY_ICONS[keyword] || 'Circle';
      
      types.push({
        name: categoryName,
        icon,
        isEssential: type === 'fixed',
        description: `Gastos relacionados con ${keyword}`
      });
    }
  }
  
  return types;
}

// Capitalizar nombre de categoría
function capitalizeCategoryName(keyword: string): string {
  const specialNames: Record<string, string> = {
    'arriendo': 'Arriendo/Alquiler',
    'servicios': 'Servicios Públicos',
    'luz': 'Energía Eléctrica',
    'agua': 'Servicio de Agua',
    'gas': 'Gas Natural',
    'internet': 'Internet y Telefonía',
    'seguro': 'Seguros',
    'transporte': 'Transporte',
    'gasolina': 'Combustible',
    'comida': 'Alimentación',
    'entretenimiento': 'Entretenimiento',
    'médico': 'Gastos Médicos',
    'educación': 'Educación'
  };
  
  return specialNames[keyword] || keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

// Extraer montos del mensaje
function extractAmounts(message: string): number[] {
  const amounts: number[] = [];
  
  // Patrones para diferentes formatos de moneda
  const patterns = [
    /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(?:millones?|mill?|mm|m)\b/gi,
    /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(?:mil|k)\b/gi,
    /\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)\b/g
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const numStr = match[1].replace(/\./g, '').replace(',', '.');
      let amount = parseFloat(numStr);
      const matchedText = message.substring(match.index, match.index + match[0].length).toLowerCase();
      
      if (matchedText.includes('millon') || matchedText.includes('mm')) {
        amount *= 1000000;
      } else if (matchedText.includes('mil') && !matchedText.includes('millon')) {
        amount *= 1000;
      }
      
      if (amount > 0 && !amounts.includes(amount)) {
        amounts.push(amount);
      }
    }
  });
  
  return amounts.sort((a, b) => b - a); // Ordenar de mayor a menor
}

// Parsear un monto individual
function parseAmount(message: string): number {
  const amounts = extractAmounts(message);
  return amounts[0] || 0;
}

// Parsear categorías con formato "Concepto $monto"
function parseCategoriesWithAmounts(message: string, categoryType: 'income' | 'fixed_expense' | 'variable_expense'): BudgetCategory[] {
  const categories: BudgetCategory[] = [];
  
  // Patrones para detectar "concepto: monto" o "concepto $monto"
  const patterns = [
    /([^:$,\n]+?)[:]\s*\$?\s*([\d.,]+(?:\s*(?:millones?|mill?|mil|k|m))?)/gi,
    /([^:$,\n]+?)\s*\$\s*([\d.,]+(?:\s*(?:millones?|mill?|mil|k|m))?)/gi,
    /([^:$,\n]+?)\s+([\d.,]+(?:\s*(?:millones?|mill?|mil|k|m))?)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const conceptName = match[1].trim();
      const amountStr = match[2].trim();
      
      // Parsear el monto
      const amount = parseAmountFromString(amountStr);
      
      if (conceptName && amount > 0) {
        const icon = getCategoryIcon(conceptName.toLowerCase());
        
        categories.push({
          name: capitalizeCategoryName(conceptName.toLowerCase()),
          type: categoryType,
          amount,
          icon,
          description: `${conceptName} - ${categoryType === 'income' ? 'Ingreso' : 'Gasto'} mensual`,
          isEssential: categoryType === 'fixed_expense'
        });
      }
    }
  });
  
  return categories;
}

// Parsear monto de string con unidades
function parseAmountFromString(amountStr: string): number {
  const cleanStr = amountStr.toLowerCase().replace(/[^\d.,kmillón]/g, '');
  let amount = parseFloat(cleanStr.replace(/\./g, '').replace(',', '.'));
  
  if (amountStr.toLowerCase().includes('millón') || amountStr.toLowerCase().includes('mill')) {
    amount *= 1000000;
  } else if (amountStr.toLowerCase().includes('mil') && !amountStr.toLowerCase().includes('millón')) {
    amount *= 1000;
  } else if (amountStr.toLowerCase().includes('k')) {
    amount *= 1000;
  }
  
  return amount || 0;
}

// Obtener icono para categoría
function getCategoryIcon(keyword: string): string {
  return CATEGORY_ICONS[keyword] || 'Circle';
}

// Exportar funciones auxiliares para testing
export {
  extractAmounts,
  parseAmount,
  parsePeriod,
  detectIncomeTypes,
  detectExpenseTypes
}; 