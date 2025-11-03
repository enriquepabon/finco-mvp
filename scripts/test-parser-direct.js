#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA: Parser Directo
 */

// Simular la función parseBudgetResponse
function testParser() {
  console.log('🧪 FINCO - Test Parser Directo\n');
  
  // Test cases que fallan en el sistema
  const testCases = [
    {
      question: 2,
      input: "salario, rentas, otros",
      expected: "Debería crear categorías de ingresos"
    },
    {
      question: 3,
      input: "arriendo, administración, prepagada, seguridad social, servicios publicos",
      expected: "Debería crear categorías de gastos fijos"
    },
    {
      question: 4,
      input: "comida, transporte, entretenimiento, bienestar, suscripciones",
      expected: "Debería crear categorías de gastos variables"
    },
    {
      question: 7,
      input: "si, comida. Restaurante: 1 millon, rappi: 500 mil y mercado: 1 millon",
      expected: "Debería crear subcategorías con montos"
    }
  ];
  
  console.log('🔍 PROBLEMA IDENTIFICADO:');
  console.log('El parser devuelve categories: [] para todos los casos');
  console.log('Esto significa que las funciones de parsing no extraen datos\n');
  
  testCases.forEach((test, index) => {
    console.log(`${index + 1}. 📝 Pregunta ${test.question}: "${test.input}"`);
    console.log(`   ❌ Resultado actual: { categories: [] }`);
    console.log(`   ✅ Resultado esperado: ${test.expected}\n`);
  });
  
  console.log('🔧 DIAGNÓSTICO:');
  console.log('1. ❌ parseCategoriesWithAmounts() existe pero no se usa');
  console.log('2. ❌ Las funciones originales no detectan patrones');
  console.log('3. ❌ extractAmounts() no encuentra montos sin formato específico');
  console.log('4. ❌ detectIncomeTypes() no reconoce "salario, rentas"');
  
  console.log('\n💡 SOLUCIÓN REQUERIDA:');
  console.log('• Forzar uso de parseCategoriesWithAmounts()');
  console.log('• Mejorar detectores de patrones');
  console.log('• Crear categorías por defecto si no se detectan');
  console.log('• Implementar fallback robusto');
  
  console.log('\n🎯 EJEMPLO DE PARSING CORRECTO:');
  console.log('Input: "Restaurante: 1 millon, rappi: 500 mil"');
  console.log('Output: [');
  console.log('  { name: "Restaurante", amount: 1000000, type: "variable_expense" },');
  console.log('  { name: "Rappi", amount: 500000, type: "variable_expense" }');
  console.log(']');
  
  console.log('\n🚨 ACCIÓN INMEDIATA REQUERIDA:');
  console.log('Reescribir las funciones de parsing para que funcionen correctamente');
}

testParser(); 