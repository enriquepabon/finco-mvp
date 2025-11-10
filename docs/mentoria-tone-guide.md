# Guía de Tono MentorIA - Documentación Técnica

## 📋 Resumen de Cambios

Este documento describe los cambios realizados en la Fase 4 del proyecto de transformación de FINCO a MentorIA, específicamente en la actualización de prompts de IA y personalidad del agente.

**Fecha de implementación**: Noviembre 2025  
**Estado**: ✅ Completado  
**Responsable**: Equipo de Desarrollo

---

## 🎯 Objetivos Cumplidos

### 1. Creación de Reglas de Tono (MENTORIA_TONE_RULES)
**Ubicación**: `/src/lib/gemini/specialized-prompts.ts`

Se creó una constante exportable `MENTORIA_TONE_RULES` que contiene:
- Identidad y voz de MentorIA
- Dimensiones de personalidad (Humor 2/10, Formalidad 5/10, Respeto 9/10, Entusiasmo 6/10)
- Reglas de oro (simplicidad, empatía, acción clara, celebrar pequeño, contexto)
- Lista de prohibiciones (jerga, juicio, promesas irreales, paternalismo)
- Límites de longitud de mensajes (280 caracteres máximo)
- Reglas de uso de emojis
- Reglas especiales para IA conversacional

---

## 🔄 Prompts Actualizados

### 2.1 getProfileEditPrompt()
**Cambios**:
- ✅ Integra `MENTORIA_TONE_RULES` completo
- ✅ Lenguaje simplificado: "ingresos" vs "monthly_income", "gastos" vs "monthly_expenses"
- ✅ Límite de 150 caracteres en respuestas
- ✅ Tono cálido y directo
- ✅ Sin consejos financieros innecesarios

**Ejemplo de output**:
```
Antes: "Con gusto actualizo tu ingreso mensual a COP 3.000.000"
Ahora: "¡Entendido! Actualizo tus ingresos a $3.000.000"
```

### 2.2 getBudgetEditPrompt()
**Cambios**:
- ✅ Lenguaje simple: "gastos" no "egresos", "dinero que entra" no "flujo"
- ✅ Límite de 150 caracteres
- ✅ Directo y práctico
- ✅ Pregunta una cosa a la vez

### 2.3 getExpenseRegistrationPrompt()
**Cambios**:
- ✅ Límite de 100 caracteres (más corto para rapidez)
- ✅ Lenguaje simple y directo
- ✅ NO da consejos, solo registra

### 2.4 getGoalsPrompt()
**Cambios**:
- ✅ Límite de 200 caracteres
- ✅ Motivador pero realista
- ✅ Explica "por qué" la meta es buena (contexto)
- ✅ Celebra metas bien definidas

### 2.5 getInvestmentPrompt()
**Cambios**:
- ✅ Límite de 250 caracteres
- ✅ Conceptos simples: CDT, fondos, acciones
- ✅ NO promete rendimientos
- ✅ Admite cuando no sabe algo

### 2.6 getGeneralFinancePrompt()
**Cambios**:
- ✅ Límite de 250 caracteres
- ✅ Lenguaje del día a día, sin tecnicismos
- ✅ Explica el "por qué" de las recomendaciones
- ✅ Honesto cuando no tiene información

### 2.7 getBudgetConversationalPrompt()
**Status**: ✅ Ya estaba actualizado previamente
- Usa flujo conversacional de 4 pasos
- Mensajes personalizados con nombre del usuario
- Referencias a "MentorIA" en lugar de "FINCO"

---

## 💬 Mensajes de Error Humanizados

### 3. Expansión de MENTORIA_COPY.errors
**Ubicación**: `/src/lib/constants/mentoria-brand.ts`

Se expandieron los mensajes de error de 4 a 20+ categorías:

#### Errores Generales
```typescript
generic: 'Hmm, algo salió mal. ¿Intentamos de nuevo?'
serverError: 'Tuve un problema técnico. Inténtalo de nuevo en un momento.'
unknown: 'No estoy seguro de qué pasó. ¿Probamos otra vez?'
```

#### Errores de Red
```typescript
network: 'Parece que hay un problema de conexión. Revisa tu internet y vuelve a intentar.'
timeout: 'Esto está tomando más tiempo del esperado. ¿Intentamos otra vez?'
offline: 'No tienes conexión a internet. Revisa tu red y vuelve cuando estés en línea.'
```

#### Errores de Autenticación
```typescript
auth: 'Necesito que inicies sesión de nuevo para continuar.'
sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo, por favor.'
unauthorized: 'No tienes permiso para hacer esto. ¿Iniciaste sesión?'
```

#### Errores de Validación
```typescript
invalidInput: 'No entendí eso. ¿Puedes darme más detalles?'
requiredField: 'Necesito que completes este campo para continuar.'
invalidFormat: 'Este formato no está bien. ¿Puedes intentar de otra forma?'
```

#### Errores de Voz
```typescript
voiceError: 'No escuché bien. ¿Puedes repetir?'
voiceNetwork: 'Hubo un problema con el micrófono. Verifica los permisos e inténtalo de nuevo.'
```

#### Errores de Archivo
```typescript
uploadFailed: 'No pude procesar ese archivo. ¿Intentamos con otro formato?'
fileTooLarge: 'Ese archivo es muy grande. Intenta con uno más pequeño.'
invalidFileType: 'No puedo leer ese tipo de archivo. Intenta con PDF, imagen o texto.'
```

### 3.1 Implementación en Componentes
**Archivo**: `/src/components/chat/MultimodalChatInterface.tsx`

**Cambios aplicados**:
```typescript
// Antes
setError('Error al procesar los datos. Por favor, intenta de nuevo.');

// Ahora
setError(MENTORIA_COPY.errors.saveFailed);
```

```typescript
// Antes
throw new Error('Token de autenticación no válido');

// Ahora
throw new Error(MENTORIA_COPY.errors.auth);
```

```typescript
// Antes
throw new Error(`Error ${response.status}: ${errorData.error || 'Error del servidor'}`);

// Ahora
throw new Error(errorData.error || MENTORIA_COPY.errors.serverError);
```

---

## 📊 Principios de Diseño Aplicados

### 4.1 Simplicidad Radical
- ✅ "Gastos" en lugar de "Egresos"
- ✅ "Dinero que entra" en lugar de "Flujo de efectivo"
- ✅ "Meta" en lugar de "Objetivo financiero"

### 4.2 Empatía Primero
- ✅ "Este mes fue complicado, ¿verdad?" vs "Fallaste en tu presupuesto"
- ✅ "No entendí eso" vs "Error de entrada inválida"

### 4.3 Contexto Siempre
- ✅ "Sugiero 10% porque funciona para 7 de 10 personas como tú"
- ✅ Explicaciones del "por qué" en recomendaciones

### 4.4 Límites de Caracteres
| Tipo de Prompt | Límite |
|---|---|
| Expense Registration | 100 caracteres |
| Profile Edit | 150 caracteres |
| Budget Edit | 150 caracteres |
| Goals | 200 caracteres |
| Investment | 250 caracteres |
| General Finance | 250 caracteres |
| Budget Conversational | 100-200 palabras por paso |

---

## 🧪 Testing y Validación

### 5.1 Pruebas Realizadas
- ✅ Prompts funcionan correctamente con OpenAI GPT
- ✅ Límites de caracteres se respetan en respuestas
- ✅ Lenguaje simplificado se aplica consistentemente
- ✅ Mensajes de error son empáticos y accionables
- ✅ No hay errores de linting en archivos modificados

### 5.2 Archivos Impactados
1. `/src/lib/gemini/specialized-prompts.ts` - Prompts actualizados
2. `/src/lib/constants/mentoria-brand.ts` - Mensajes de error expandidos
3. `/src/components/chat/MultimodalChatInterface.tsx` - Implementación de errores humanizados

---

## 📚 Referencias

### Documentos Base
- `MentorIA_Guia_Voz_Tono.md` - Guía de voz y tono oficial
- `MentorIA_Estrategia_Marca_Completa.docx` - Estrategia de marca
- `MentorIA_Value_Proposition_Canvas.md` - Canvas de propuesta de valor

### Código Relacionado
- `MENTORIA_TONE_RULES` en `/src/lib/gemini/specialized-prompts.ts`
- `MENTORIA_COPY` en `/src/lib/constants/mentoria-brand.ts`
- `MENTORIA_PERSONALITY` en `/src/lib/constants/mentoria-brand.ts`

---

## ✅ Checklist Final

- [x] 4.1 Crear constante MENTORIA_TONE_RULES
- [x] 4.2 Actualizar función getOnboardingContext() (getBudgetConversationalPrompt)
- [x] 4.3 Actualizar getBudgetConversationalPrompt() (ya actualizado)
- [x] 4.4 Cambiar presentación del agente de FINCO a MentorIA
- [x] 4.5 Simplificar lenguaje en todos los prompts
- [x] 4.6 Agregar contexto a recomendaciones
- [x] 4.7 Actualizar mensajes de error para ser más humanos
- [x] 4.8 Limitar respuestas a máximo 280 caracteres
- [x] 4.9 Probar prompts con OpenAI
- [x] 4.10 Documentar cambios de tono

---

## 🚀 Próximos Pasos

### Fase 5: Sistema de Micro-hábitos y Rachas
- Migración de base de datos para tabla `user_habits`
- Implementación de tracking de hábitos
- Sistema de rachas consecutivas
- Nudges comportamentales

### Fase 6: Sistema de Gamificación
- Tabla de badges y criterios
- Celebraciones animadas
- Sección "Mis Logros"

### Mantenimiento Continuo
- Monitorear calidad de respuestas de la IA
- Ajustar temperatura de OpenAI si es necesario
- Recopilar feedback de usuarios sobre el tono
- Iterar basado en datos reales

---

## 📝 Notas Técnicas

### Implementación de MENTORIA_TONE_RULES
```typescript
export const MENTORIA_TONE_RULES = `
## TU IDENTIDAD
Tu nombre es MentorIA. Eres un mentor financiero personal con IA.

## TU VOZ EN UNA LÍNEA
"Como el amigo experto que te explica finanzas sin hacerte sentir mal por no saber"

## DIMENSIONES DE PERSONALIDAD
- **Humor**: 2/10 - Ingenioso ocasional, nunca burlón
- **Formalidad**: 5/10 - Profesional accesible
- **Respeto**: 9/10 - Siempre empático, nunca condescendiente
- **Entusiasmo**: 6/10 - Motivador realista
...
`;
```

### Uso en Prompts
Todos los prompts especializados ahora comienzan con:
```typescript
return `${MENTORIA_TONE_RULES}

## TU ROL ACTUAL
[Descripción del rol específico]

## MENSAJE DEL USUARIO
"${message}"

## INSTRUCCIONES
[Instrucciones específicas del prompt]
`;
```

---

**Documento generado**: Noviembre 2025  
**Última actualización**: Fase 4 completada  
**Mantenedor**: Equipo de Producto MentorIA

