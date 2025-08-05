# 🚀 Guía de Despliegue - InkFusion Landing

Esta guía te ayudará a desplegar la landing page de InkFusion en GitHub y Vercel con CI/CD automático.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de GitHub
- Cuenta de Vercel
- Git configurado

## 🔧 Configuración Inicial

### 1. Preparar el Repositorio Local

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "🎉 Initial commit: InkFusion landing page with animations and red accents"
```

### 2. Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. Nombre sugerido: `inkfusion-landing`
3. Descripción: "Landing page for InkFusion - Literary community platform"
4. Mantén el repositorio público o privado según prefieras

### 3. Conectar con GitHub

```bash
# Agregar origin remoto (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/inkfusion-landing.git

# Subir código
git branch -M main
git push -u origin main
```

## ⚡ Configuración de Vercel

### 1. Conectar Proyecto

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configuración de Build

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `out`
- **Install Command**: `npm install`

### 3. Variables de Entorno (Opcional)

Si necesitas variables de entorno:
```bash
# En el dashboard de Vercel, agrega:
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

## 🔄 GitHub Actions - CI/CD

### 1. Configurar Secrets

En tu repositorio de GitHub, ve a Settings > Secrets and variables > Actions y agrega:

```
VERCEL_TOKEN=tu-token-de-vercel
VERCEL_ORG_ID=tu-org-id
VERCEL_PROJECT_ID=tu-project-id
```

Para obtener estos valores:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y obtener información del proyecto
vercel login
vercel link
cat .vercel/project.json
```

### 2. Flujo de Trabajo

El workflow incluye:

- ✅ **Testing**: Linting, type checking, build
- 🔍 **Lighthouse**: Auditoría de performance (score ≥90)
- 🔒 **Security**: Audit de dependencias
- 🚀 **Deploy**: Automático a Vercel en main branch
- 📝 **Preview**: Deploy de preview en PRs

## 📊 Monitoreo y Métricas

### Lighthouse CI
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

### Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Servir build localmente
npm run serve

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Lighthouse local
npm run lighthouse

# Limpiar archivos de build
npm run clean
```

## 🌐 Dominios Personalizados

### En Vercel:
1. Ve a tu proyecto > Settings > Domains
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones

### Ejemplo de configuración DNS:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

## 🔧 Troubleshooting

### Build Fallido
```bash
# Verificar dependencias
npm install

# Limpiar y rebuildar
npm run clean
npm run build
```

### Problemas de Performance
```bash
# Analizar bundle
npm run analyze

# Verificar Lighthouse local
npm run lighthouse
```

### Problemas de GitHub Actions
1. Verifica que los secrets estén configurados
2. Revisa los logs en la pestaña Actions
3. Asegúrate de que el token de Vercel tenga permisos

## 📈 Próximos Pasos

1. **Configurar Analytics**: Google Analytics, Vercel Analytics
2. **Monitoring**: Sentry para error tracking
3. **Performance**: Implementar Web Vitals tracking
4. **SEO**: Configurar Google Search Console
5. **Dominio**: Configurar dominio personalizado

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de GitHub Actions
2. Verifica la configuración de Vercel
3. Asegúrate de que todas las dependencias estén instaladas
4. Comprueba que los secrets de GitHub estén configurados correctamente

---

## 📝 Checklist de Despliegue

- [ ] Repositorio creado en GitHub
- [ ] Código subido a main branch
- [ ] Proyecto conectado en Vercel
- [ ] Secrets configurados en GitHub
- [ ] Build exitoso en Vercel
- [ ] GitHub Actions funcionando
- [ ] Lighthouse CI pasando
- [ ] Dominio personalizado configurado (opcional)
- [ ] Analytics configurado (opcional)

¡Tu landing page de InkFusion está lista para el mundo! 🎉