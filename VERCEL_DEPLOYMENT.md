# 🚀 Guía de Deployment - Palabreo en Vercel

## 📋 Tabla de Contenidos
1. [Variables de Entorno Requeridas](#variables-de-entorno-requeridas)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Deployment en Vercel](#deployment-en-vercel)
4. [Configuración Post-Deployment](#configuración-post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🔑 Variables de Entorno Requeridas

### **Supabase - Variables Principales**
```bash
# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave anónima pública (safe para el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave de servicio (SOLO para servidor - SECRETA)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **OAuth Providers (Opcional)**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=ghp_tu-github-client-secret
```

### **Next.js - Variables del Sistema**
```bash
# URL de producción (requerido para OAuth callbacks)
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-nextauth-secret-super-seguro-de-32-caracteres

# Entorno
NODE_ENV=production
```

---

## 🏗️ Configuración de Supabase

### **1. Obtener las Keys de Supabase**

#### **Paso 1: Acceder al Dashboard**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión y selecciona tu proyecto
3. Ve a **Settings** → **API**

#### **Paso 2: Copiar las Keys**
```bash
# Project URL (siempre visible)
URL: https://jerdailysdccuxejsdsb.supabase.co

# anon/public key (safe para cliente)
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...

# service_role key (SECRETA - solo servidor)
SERVICE_ROLE: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

### **2. Configurar Authentication**

#### **En Supabase Dashboard:**
1. Ve a **Authentication** → **Settings**
2. Configura **Site URL**: `https://tu-app.vercel.app`
3. Agrega **Redirect URLs**:
   ```
   https://tu-app.vercel.app/auth/callback
   https://tu-app.vercel.app/login
   https://tu-app.vercel.app/main
   ```

#### **Configurar OAuth Providers:**

**Google OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea credenciales OAuth 2.0
3. Agrega URIs autorizados:
   ```
   https://jerdailysdccuxejsdsb.supabase.co/auth/v1/callback
   ```

**GitHub OAuth:**
1. Ve a GitHub Settings → Developer settings → OAuth Apps
2. Crea nueva OAuth App
3. Callback URL: `https://jerdailysdccuxejsdsb.supabase.co/auth/v1/callback`

---

## 🚀 Deployment en Vercel

### **Método 1: Vercel CLI (Recomendado)**

#### **Instalación:**
```bash
npm i -g vercel
vercel login
```

#### **Deployment:**
```bash
# En el directorio del proyecto
vercel

# Seguir el asistente:
# ✓ Set up and deploy "~/librospage"? [Y/n] y
# ✓ Which scope? → Tu cuenta
# ✓ Link to existing project? [y/N] n
# ✓ What's your project's name? → palabreo
# ✓ In which directory is your code located? → ./
```

#### **Configurar Variables de Entorno:**
```bash
# Agregar variables una por una
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY

# O usar archivo .env
vercel env pull .env.local
```

### **Método 2: Vercel Dashboard**

#### **Paso 1: Conectar Repositorio**
1. Ve a [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Importa tu repositorio de GitHub
4. Framework: **Next.js** (auto-detectado)
5. Root Directory: `./`

#### **Paso 2: Configurar Variables de Entorno**
En **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `tu-secret-de-32-chars` | Production, Preview |

#### **Paso 3: Deploy**
```bash
# Click "Deploy" - Vercel hará el build automáticamente
```

---

## ⚙️ Configuración Post-Deployment

### **1. Verificar URLs en Supabase**
Después del deployment, actualiza en Supabase:

```bash
# Site URL
https://tu-app-final.vercel.app

# Redirect URLs
https://tu-app-final.vercel.app/auth/callback
https://tu-app-final.vercel.app/login  
https://tu-app-final.vercel.app/main
```

### **2. Actualizar OAuth Providers**
Actualiza las URLs de callback en:
- **Google Cloud Console**: Authorized redirect URIs
- **GitHub OAuth App**: Authorization callback URL

### **3. Configurar Dominios Personalizados (Opcional)**
```bash
# En Vercel Dashboard → Settings → Domains
# Agregar: palabreo.com
# Configurar DNS según instrucciones de Vercel
```

---

## 🔒 Configuración de Seguridad

### **Row Level Security (RLS)**
Verifica que todas las tablas tengan RLS habilitado:

```sql
-- Verificar RLS en todas las tablas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Habilitar RLS si no está activado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
-- ... etc para todas las tablas
```

### **Variables de Entorno Seguras**
- ✅ **NUNCA** pongas `SERVICE_ROLE_KEY` en variables que empiecen con `NEXT_PUBLIC_`
- ✅ **SIEMPRE** usa `SERVICE_ROLE_KEY` solo en servidor (API routes, middleware)
- ✅ **ROTACIÓN**: Cambia las keys periódicamente en producción

---

## 🐛 Troubleshooting

### **Errores Comunes**

#### **Error: "Invalid JWT"**
```bash
# Causa: Key incorrecta o expirada
# Solución: Verificar y actualizar las keys en Vercel
vercel env ls
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### **Error: "Auth callback failed"**
```bash
# Causa: URL de callback incorrecta
# Solución: Verificar URLs en Supabase Dashboard
Site URL: https://tu-app.vercel.app
Redirect URLs: https://tu-app.vercel.app/auth/callback
```

#### **Error: "CORS policy blocked"**
```bash
# Causa: Dominio no autorizado
# Solución: Agregar dominio en Supabase → Settings → API
Allowed origins: https://tu-app.vercel.app
```

### **Comandos de Verificación**

#### **Verificar Variables de Entorno:**
```bash
vercel env ls
```

#### **Ver Logs de Deployment:**
```bash
vercel logs tu-app.vercel.app
```

#### **Verificar Build:**
```bash
vercel build
```

### **Testing en Producción**

#### **Checklist de Funcionalidades:**
- [ ] Landing page carga correctamente
- [ ] Registro de usuario funciona
- [ ] Login con email/password funciona  
- [ ] Login con Google/GitHub funciona
- [ ] Redirecciones automáticas funcionan
- [ ] Páginas protegidas requieren autenticación
- [ ] Logout funciona correctamente
- [ ] Base de datos guarda datos correctamente

---

## 📞 Soporte

### **Recursos Útiles**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### **Comandos de Emergencia**
```bash
# Rollback a versión anterior
vercel rollback

# Redeployar forzado
vercel --force

# Ver logs en tiempo real
vercel logs --follow
```

---

## 🎉 ¡Deployment Completado!

Tu aplicación **Palabreo** debería estar funcionando correctamente en:
- **URL de Producción**: `https://tu-app.vercel.app`
- **Dashboard de Vercel**: `https://vercel.com/dashboard`
- **Dashboard de Supabase**: `https://supabase.com/dashboard`

**¡Felicitaciones! 🚀 Tu aplicación está en producción.**
