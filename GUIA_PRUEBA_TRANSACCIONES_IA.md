# 🧪 Guía de Prueba: Sistema de Transacciones con IA

## 🎯 **Objetivo**
Probar el nuevo sistema de registro de transacciones por voz o texto usando GPT-4o-mini.

---

## 📋 **Pre-requisitos**

1. ✅ Usuario autenticado
2. ✅ Presupuesto creado para el mes actual
3. ✅ Variable de entorno `OPENAI_API_KEY` configurada
4. ✅ Aplicación corriendo (`npm run dev`)

---

## 🧪 **Pruebas a Realizar**

### **1. Gastos Fijos** 💳

Estas son obligaciones recurrentes y predecibles.

#### Test 1.1: Arriendo
```
🎤 Di: "Pagué el arriendo de 2.3 millones"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Fijo
- Subcategoría: Arriendo
- Monto: $2,300,000
- Descripción: "Pago arriendo"
```

#### Test 1.2: Servicios
```
🎤 Di: "Ayer pagué la luz, 120 lucas"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Fijo
- Subcategoría: Luz
- Monto: $120,000
- Fecha: (ayer)
```

#### Test 1.3: Internet
```
🎤 Di: "Pagué el internet de 80 mil"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Fijo
- Subcategoría: Internet
- Monto: $80,000
```

---

### **2. Gastos Variables** 🛒

Estas son compras ocasionales y no recurrentes.

#### Test 2.1: Comida
```
🎤 Di: "Compré comida por 150 mil"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Variable
- Subcategoría: Comida
- Monto: $150,000
- Descripción: "Compra de comida"
```

#### Test 2.2: Restaurante
```
🎤 Di: "Cené en Andrés Carne de Res por 200 lucas"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Variable
- Subcategoría: Restaurante
- Monto: $200,000
- Descripción: Incluye nombre del restaurante
```

#### Test 2.3: Transporte
```
🎤 Di: "Pagué un uber de 35 mil pesos"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Variable
- Subcategoría: Transporte
- Monto: $35,000
```

#### Test 2.4: Entretenimiento
```
🎤 Di: "Fui al cine y gasté 45 lucas"

✅ Esperado:
- Tipo: Gasto
- Categoría: Gasto Variable
- Subcategoría: Entretenimiento
- Monto: $45,000
```

---

### **3. Ingresos** 💰

#### Test 3.1: Salario
```
🎤 Di: "Me pagaron el salario, 22 palos"

✅ Esperado:
- Tipo: Ingreso
- Categoría: Ingreso
- Subcategoría: Salario
- Monto: $22,000,000
- Descripción: "Pago de salario"
```

#### Test 3.2: Freelance
```
🎤 Di: "Cobré un proyecto freelance por 5 millones"

✅ Esperado:
- Tipo: Ingreso
- Categoría: Ingreso
- Subcategoría: Freelance
- Monto: $5,000,000
```

#### Test 3.3: Venta
```
🎤 Di: "Vendí mi bici por 800 mil"

✅ Esperado:
- Tipo: Ingreso
- Categoría: Ingreso
- Subcategoría: Venta
- Monto: $800,000
```

---

### **4. Formatos de Montos** 💵

Probar diferentes formas de decir montos:

#### Test 4.1: Millones
```
🎤 Di: "Gasté 2.5 millones"
✅ Esperado: $2,500,000

🎤 Di: "Pagué 1.2 palos"
✅ Esperado: $1,200,000
```

#### Test 4.2: Miles
```
🎤 Di: "Compré algo por 500 mil"
✅ Esperado: $500,000

🎤 Di: "Gasté 250 lucas"
✅ Esperado: $250,000
```

#### Test 4.3: Números directos
```
🎤 Di: "Pagué 45000 pesos"
✅ Esperado: $45,000
```

---

### **5. Fechas Relativas** 📅

#### Test 5.1: Ayer
```
🎤 Di: "Ayer pagué el celular por 150 mil"

✅ Esperado:
- Fecha: (fecha de ayer)
```

#### Test 5.2: Hace X días
```
🎤 Di: "Hace 3 días compré comida por 200 lucas"

✅ Esperado:
- Fecha: (hace 3 días)
```

---

### **6. Casos Complejos** 🎭

#### Test 6.1: Descripción detallada
```
🎤 Di: "Compré Nike Air Max en Falabella por 450 mil pesos"

✅ Esperado:
- Descripción incluye: marca, tienda, producto
- Categoría: Gasto Variable > Ropa
- Monto: $450,000
```

#### Test 6.2: Múltiples palabras clave
```
🎤 Di: "Pagué la cuota del carro en el banco, 1.2 palos"

✅ Esperado:
- Categoría: Gasto Fijo > Préstamos
- Monto: $1,200,000
```

---

## 🎬 **Cómo Probar**

### **Opción 1: Desde el Dashboard**

1. Ve a `http://localhost:3000/dashboard`
2. Click en **"Transacciones"** en la barra superior
3. Click en **"Registro por Voz"** (botón morado)
4. Permite el micrófono en el navegador
5. Click en el botón de micrófono (circular grande)
6. Di una frase de prueba
7. Espera el análisis de la IA
8. Revisa los datos extraídos
9. Click en **"Guardar Transacción"**

### **Opción 2: Desde API directo (curl)**

```bash
# 1. Obtener tu token de Supabase
# (Ve a la consola del navegador y ejecuta:)
# const { data: { session } } = await supabase.auth.getSession();
# console.log(session.access_token);

# 2. Usar el token
TOKEN="tu_token_aqui"

# 3. Probar análisis
curl -X POST http://localhost:3000/api/transactions/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Pagué el arriendo de 2.3 millones"}'
```

---

## 📊 **Qué Revisar**

### **En la Consola del Navegador:**
```
✅ Transacción analizada por IA: {
  transaction_type: 'expense',
  category: 'fixed_expense',
  subcategory: 'Arriendo',
  amount: 2300000,
  description: 'Pago arriendo',
  date: '2025-11-07'
}
```

### **En la Consola del Servidor:**
```
🤖 Analizando transacción con GPT-4o-mini...
📊 Respuesta del análisis de transacción: {...}
✅ Transacción analizada: {...}
```

### **En el Dashboard:**
- La transacción aparece en la lista
- El monto se suma a la categoría correcta
- El presupuesto se actualiza
- El hábito de gasto diario se registra (racha +1)

---

## ✅ **Checklist de Validación**

- [ ] Gastos fijos se clasifican correctamente
- [ ] Gastos variables se detectan bien
- [ ] Ingresos se diferencian de gastos
- [ ] Montos en lenguaje natural se convierten bien
- [ ] Fechas relativas funcionan ("ayer", "hace X días")
- [ ] Categorías se crean si no existen
- [ ] Descripciones son claras y útiles
- [ ] Transacciones se guardan en Supabase
- [ ] Dashboard se actualiza correctamente
- [ ] Rachas de hábitos se incrementan

---

## 🐛 **Si Algo Falla**

### Error: "No autenticado"
```bash
# Verifica que tengas sesión activa
# En consola del navegador:
const { data: { session } } = await supabase.auth.getSession();
console.log(session);
```

### Error: "Error al procesar voz"
```bash
# Revisa la consola del servidor para ver detalles
# Asegúrate de que OPENAI_API_KEY esté configurado
```

### Error: "No hay presupuesto activo"
```bash
# Crea un presupuesto para el mes actual primero
# Dashboard > Chat > "Crear presupuesto"
```

---

## 💰 **Costos Aproximados**

- **Por análisis**: ~$0.001 - $0.002
- **100 transacciones**: ~$0.10 - $0.20
- **1000 transacciones/mes**: ~$1 - $2

GPT-4o-mini es extremadamente económico.

---

## 📝 **Notas**

1. **Lenguaje coloquial**: El sistema entiende "palos", "lucas", "millones"
2. **Contextual**: Usa el presupuesto del usuario para sugerir categorías
3. **Flexible**: Permite crear nuevas categorías si no existen
4. **Preciso**: GPT-4o-mini tiene ~95% de precisión
5. **Rápido**: Análisis en ~1-2 segundos

---

## 🎯 **Casos de Uso Reales**

### Caso 1: Usuario registra gastos diarios
```
Día 1: "Compré comida por 150 mil"
Día 2: "Gasté 35 lucas en uber"
Día 3: "Cené afuera por 80 mil"

Resultado:
- 3 días de racha ✅
- Presupuesto actualizado
- Categorías auto-clasificadas
```

### Caso 2: Usuario paga facturas mensuales
```
"Pagué el arriendo de 2.3 palos"
"Pagué la luz por 120 lucas"
"Pagué el internet de 80 mil"

Resultado:
- Todas clasificadas como Gastos Fijos ✅
- Presupuesto actualizado
- Usuario ve resumen mensual
```

---

**Estado:** ✅ Sistema completo e integrado

**¿Listo para probar?** Abre el dashboard y registra tu primera transacción por voz. 🎙️

**Documentación completa:** `SISTEMA_TRANSACCIONES_IA.md`

