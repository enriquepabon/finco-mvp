// Script para probar el parser de respuestas del onboarding
// Ejecutar con: node scripts/test-parser.js

const { 
  parseColombianCurrency, 
  parseAge, 
  parseCivilStatus, 
  parseChildrenCount, 
  parseFullName,
  parseOnboardingResponse 
} = require('../lib/parsers/onboarding-parser');

console.log('🧪 Probando el parser de onboarding...\n');

// Pruebas de moneda colombiana
console.log('💰 Pruebas de moneda:');
const currencyTests = [
  '10 millones',
  '10.000.000',
  '$10,000,000 COP',
  '20 mill',
  '5.5 millones de pesos',
  '1000000',
  '22',
  '22 millones de pesos colombianos'
];

currencyTests.forEach(test => {
  const result = parseColombianCurrency(test);
  console.log(`  "${test}" → ${result ? result.toLocaleString() : 'null'}`);
});

console.log('\n🎂 Pruebas de edad:');
const ageTests = ['32 años', '28', 'tengo 45 años', 'soy de 25'];
ageTests.forEach(test => {
  const result = parseAge(test);
  console.log(`  "${test}" → ${result}`);
});

console.log('\n💍 Pruebas de estado civil:');
const civilTests = ['soltero', 'casada', 'union libre', 'divorciado', 'viuda'];
civilTests.forEach(test => {
  const result = parseCivilStatus(test);
  console.log(`  "${test}" → ${result}`);
});

console.log('\n👶 Pruebas de hijos:');
const childrenTests = ['no tengo hijos', '2 hijos', 'ninguno', 'tengo 3', 'cero'];
childrenTests.forEach(test => {
  const result = parseChildrenCount(test);
  console.log(`  "${test}" → ${result}`);
});

console.log('\n👤 Pruebas de nombres:');
const nameTests = ['juan perez', 'MARIA GARCIA', 'carlos alberto rodriguez'];
nameTests.forEach(test => {
  const result = parseFullName(test);
  console.log(`  "${test}" → ${result}`);
});

console.log('\n🎯 Pruebas completas por pregunta:');
const fullTests = [
  { question: 1, response: 'enrique pabon' },
  { question: 2, response: '32 años' },
  { question: 3, response: 'union libre' },
  { question: 4, response: 'no tengo hijos' },
  { question: 5, response: '22 millones de pesos' },
  { question: 6, response: '18 millones' },
  { question: 7, response: 'casa: 400 millones, carro: 100 millones' },
  { question: 8, response: 'tarjeta de credito: 20 millones' },
  { question: 9, response: '50 millones entre ahorros e inversiones' }
];

fullTests.forEach(test => {
  const result = parseOnboardingResponse(test.question, test.response);
  console.log(`  P${test.question}: "${test.response}" →`, result);
});

console.log('\n✅ Pruebas completadas!'); 