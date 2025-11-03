// Test del API de edición de perfil con casos de activos
const testCases = [
  'quiero actualizar mis activos, tengo un nuevo activo, carro de 100 millones',
  'sumarle 100 millones a mis activos actuales',
  'mis activos ahora son 500 millones'
];

console.log('🧪 Testing Profile Edit API - Casos de activos...\n');

async function testAPI(message, index) {
  console.log(`--- Test ${index + 1} ---`);
  console.log(`Input: "${message}"`);
  
  try {
    const response = await fetch('http://localhost:3000/api/profile-edit-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de prueba
      },
      body: JSON.stringify({
        message: message,
        chatHistory: []
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Status: ${response.status}`);
      console.log(`Response: ${data.message?.substring(0, 100)}...`);
      console.log(`Updated: ${data.profileUpdated ? 'Sí' : 'No'}`);
    } else {
      console.log(`❌ Status: ${response.status}`);
      console.log('Error:', await response.text());
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
  
  console.log('');
}

async function runTests() {
  for (let i = 0; i < testCases.length; i++) {
    await testAPI(testCases[i], i);
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('✅ API Test Complete!');
}

runTests().catch(console.error); 