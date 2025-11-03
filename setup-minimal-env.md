# Configuración mínima para probar FINCO

## Variables de entorno necesarias en .env.local:

```bash
# Google Gemini API (OBLIGATORIO para el chat)
GOOGLE_GEMINI_API_KEY=tu_api_key_aqui

# Supabase (OBLIGATORIO para autenticación y base de datos)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Pasos rápidos:

1. **Google Gemini API**: 
   - Ve a https://makersuite.google.com/app/apikey
   - Crea un API key
   - Pégalo en GOOGLE_GEMINI_API_KEY

2. **Supabase**:
   - Ve a https://supabase.com
   - Crea un proyecto nuevo
   - En Settings > API, copia las credenciales

3. **Reinicia el servidor**: `npm run dev`

## Prueba rápida:
Una vez configurado, el chat debería responder sin timeout. 