import { StructuredData, FormEntry } from '../../src/components/ui/DynamicFormComponent';

// Tipos para categorías de presupuesto con soporte para subcategorías
export interface BudgetCategory {
  name: string;
  type: 'income' | 'fixed_expense' | 'variable_expense';
  amount: number;
  icon: string;
  description: string;
  isEssential: boolean;
  subcategories?: BudgetSubcategory[]; // Nueva propiedad para subcategorías
}

// Nueva interfaz para subcategorías
export interface BudgetSubcategory {
  name: string;
  amount: number;
  description: string;
  icon?: string;
}

// Estructura de resultado del parser mejorado
export interface ParsedBudgetData {
  categories: BudgetCategory[];
  subcategories: { [categoryName: string]: BudgetSubcategory[] };
}

// Mapeo de iconos por categoría
const CATEGORY_ICONS: Record<string, string> = {
  // Ingresos
  'salario': 'Briefcase',
  'sueldo': 'Briefcase', 
  'trabajo': 'Briefcase',
  'rentas': 'Home',
  'arriendos': 'Home',
  'alquiler_ingreso': 'Home',
  'freelance': 'Laptop',
  'independiente': 'Laptop',
  'negocio': 'Store',
  'empresa': 'Building2',
  'inversiones': 'TrendingUp',
  'dividendos': 'PieChart',
  
  // Gastos Fijos
  'arriendo': 'Home',
  'alquiler': 'Home',
  'vivienda': 'Home',
  'servicios': 'Zap',
  'luz': 'Lightbulb',
  'agua': 'Droplets',
  'gas': 'Flame',
  'internet': 'Wifi',
  'telefono': 'Phone',
  'celular': 'Smartphone',
  'seguro': 'Shield',
  'credito': 'CreditCard',
  'prestamo': 'Banknote',
  'gimnasio': 'Dumbbell',
  'suscripciones': 'Play',
  
  // Gastos Variables
  'comida': 'UtensilsCrossed',
  'alimentacion': 'UtensilsCrossed',
  'mercado': 'ShoppingCart',
  'supermercado': 'ShoppingCart',
  'restaurante': 'UtensilsCrossed',
  'restaurantes': 'UtensilsCrossed',
  'transporte': 'Car',
  'gasolina': 'Fuel',
  'combustible': 'Fuel',
  'taxi': 'Car',
  'uber': 'Car',
  'entretenimiento': 'Gamepad2',
  'cine': 'Film',
  'salidas': 'PartyPopper',
  'ropa': 'Shirt',
  'vestimenta': 'Shirt',
  'salud': 'Heart',
  'medicina': 'Pill',
  'doctor': 'Stethoscope',
  'educacion': 'GraduationCap',
  'cursos': 'BookOpen',
  'libros': 'Book',
  'viajes': 'Plane',
  'vacaciones': 'Palmtree',
  'compras': 'ShoppingBag',
  'varios': 'MoreHorizontal',
  'otros': 'MoreHorizontal'
};

// Obtener icono basado en el nombre de la categoría
function getCategoryIcon(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Buscar coincidencia exacta
  if (CATEGORY_ICONS[lowerName]) {
    return CATEGORY_ICONS[lowerName];
  }
  
  // Buscar coincidencia parcial
  for (const [keyword, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerName.includes(keyword) || keyword.includes(lowerName)) {
      return icon;
    }
  }
  
  // Icono por defecto
  return 'Circle';
}

// Obtener color basado en el tipo de categoría
function getCategoryColor(type: string): string {
  switch (type) {
    case 'income':
      return '#10B981'; // Verde para ingresos
    case 'fixed_expense':
      return '#DC2626'; // Rojo para gastos fijos
    case 'variable_expense':
      return '#7C2D12'; // Marrón para gastos variables
    default:
      return '#6B7280'; // Gris por defecto
  }
}

/**
 * 🎯 PARSER ESTRUCTURADO MEJORADO - GLASSMORPHISM COMPATIBLE
 * Convierte datos estructurados del formulario a categorías y subcategorías reales
 */
export function parseStructuredData(data: StructuredData): ParsedBudgetData {
  console.log('🔄 Parser Estructurado - Tipo:', data.type);
  console.log('📊 Entradas recibidas:', data.entries.length);
  console.log('📝 Estructura de entrada:', data.entries[0]);
  
  const categories: BudgetCategory[] = [];
  const subcategories: { [categoryName: string]: BudgetSubcategory[] } = {};
  
  // Agrupar entradas por categoría principal
  const groupedEntries: { [categoryName: string]: FormEntry[] } = {};
  
  data.entries.forEach(entry => {
    const categoryName = entry.category || entry.type;
    if (categoryName) {
      const categoryKey = String(categoryName);
      if (!groupedEntries[categoryKey]) {
        groupedEntries[categoryKey] = [];
      }
      groupedEntries[categoryKey].push(entry);
    }
  });
  
  // Procesar cada grupo de categorías
  Object.entries(groupedEntries).forEach(([categoryName, entries]) => {
    console.log(`📊 Procesando categoría: ${categoryName} con ${entries.length} entradas`);
    
    // Si hay múltiples entradas o alguna tiene subcategoría, crear estructura de subcategorías
    const hasSubcategories = entries.length > 1 || entries.some(e => e.subcategory);
    
    if (hasSubcategories) {
      // Crear categoría principal (suma de todas las subcategorías)
      const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      
      categories.push({
        name: categoryName,
        type: getTypeForCategory(data.type),
        amount: totalAmount,
        icon: getCategoryIcon(categoryName),
        description: `${categoryName} - ${getDescriptionForType(data.type)}`,
        isEssential: getEssentialForType(data.type)
      });
      
      // Crear subcategorías
      const categorySubcategories: BudgetSubcategory[] = [];
      entries.forEach(entry => {
        if (Number(entry.amount) > 0) {
          const subcategoryName = String(entry.subcategory || 'Principal');
          categorySubcategories.push({
            name: subcategoryName,
            amount: Number(entry.amount),
            description: `${subcategoryName} - ${categoryName}`,
            icon: getCategoryIcon(subcategoryName)
          });
        }
      });
      
      if (categorySubcategories.length > 0) {
        subcategories[categoryName] = categorySubcategories;
      }
      
    } else {
      // Categoría simple sin subcategorías
      const entry = entries[0];
      if (Number(entry.amount) > 0) {
        categories.push({
          name: categoryName,
          type: getTypeForCategory(data.type),
          amount: Number(entry.amount),
          icon: getCategoryIcon(categoryName),
          description: `${categoryName} - ${getDescriptionForType(data.type)}`,
          isEssential: getEssentialForType(data.type)
        });
      }
    }
  });
  
  console.log('✅ Parser Estructurado completado:');
  console.log(`📊 ${categories.length} categorías principales`);
  console.log(`🔗 ${Object.keys(subcategories).length} categorías con subcategorías`);
  
  return { categories, subcategories };
}

// Funciones auxiliares para mapear tipos
function getTypeForCategory(dataType: string): 'income' | 'fixed_expense' | 'variable_expense' {
  switch (dataType) {
    case 'income':
    case 'savings': // Los ahorros se pueden tratar como ingresos especiales
      return 'income';
    case 'fixed_expenses':
      return 'fixed_expense';
    case 'variable_expenses':
    case 'subcategories':
      return 'variable_expense';
    default:
      return 'variable_expense';
  }
}

function getDescriptionForType(dataType: string): string {
  switch (dataType) {
    case 'income': return 'Ingreso mensual';
    case 'fixed_expenses': return 'Gasto fijo mensual';
    case 'variable_expenses': return 'Gasto variable mensual';
    case 'savings': return 'Meta de ahorro';
    default: return 'Categoría financiera';
  }
}

function getEssentialForType(dataType: string): boolean {
  return dataType === 'income' || dataType === 'fixed_expenses' || dataType === 'savings';
}

/**
 * 🎯 VALIDADOR DE DATOS ESTRUCTURADOS
 * Verifica que los datos estén completos y sean válidos
 */
export function validateStructuredData(data: StructuredData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.type) {
    errors.push('Tipo de datos no especificado');
  }
  
  if (!data.entries || data.entries.length === 0) {
    errors.push('No se proporcionaron entradas de datos');
  }
  
  // Validaciones específicas por tipo - CORREGIDAS para nuevo formato
  switch (data.type) {
    case 'income':
    case 'variable_expenses':
    case 'savings':
      data.entries.forEach((entry, index) => {
        // Buscar category (nuevo formato) o type (formato anterior) 
        const categoryValue = entry.category || entry.type;
        if (!categoryValue || String(categoryValue).trim() === '') {
          errors.push(`Entrada ${index + 1}: Categoría requerida`);
        }
        if (!entry.amount || Number(entry.amount) <= 0) {
          errors.push(`Entrada ${index + 1}: Monto debe ser mayor a 0`);
        }
      });
      break;
      
    case 'fixed_expenses':
    case 'subcategories':
      data.entries.forEach((entry, index) => {
        if (!entry.category || String(entry.category).trim() === '') {
          errors.push(`Entrada ${index + 1}: Categoría requerida`);
        }
        if (!entry.amount || Number(entry.amount) <= 0) {
          errors.push(`Entrada ${index + 1}: Monto debe ser mayor a 0`);
        }
      });
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 🎯 RESUMEN DE DATOS ESTRUCTURADOS
 * Genera un resumen legible de los datos para mostrar al usuario
 */
export function summarizeStructuredData(data: StructuredData): string {
  const validEntries = data.entries.filter(entry => 
    Object.values(entry).some(value => 
      typeof value === 'number' ? value > 0 : String(value).trim() !== ''
    )
  );
  
  if (validEntries.length === 0) {
    return 'No se han completado datos aún.';
  }
  
  const total = validEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });
  
  let summary = `${validEntries.length} elementos completados\n`;
  summary += `Total: ${formatter.format(total)}\n\n`;
  
  validEntries.forEach((entry, index) => {
    const name = entry.subcategory ? 
      `${entry.category} - ${entry.subcategory}` : 
      (entry.type || entry.category);
    summary += `${index + 1}. ${name}: ${formatter.format(Number(entry.amount))}\n`;
  });
  
  return summary;
} 