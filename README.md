# InkFusion Landing Page

Landing page para InkFusion, la startup literaria que fusiona lo mejor de Wattpad, AO3, Substack y Medium en una sola plataforma.

## 🚀 Instalación y configuración

### Requisitos previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]
cd inkfusion-landing

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Build y exportación estática

```bash
# Generar build de producción
npm run build

# Exportar como sitio estático
npm run export
```

Los archivos estáticos se generarán en la carpeta `out/` y estarán listos para desplegar en:
- Netlify
- Vercel
- GitHub Pages
- Cualquier hosting de archivos estáticos

## 🎨 Características técnicas

- **Framework**: Next.js 14+ con App Router
- **Estilos**: Tailwind CSS
- **Tipografía**: Google Fonts (Inter)
- **Renderizado**: SSG (Static Site Generation)
- **Accesibilidad**: WCAG AA compliant
- **SEO**: Metadatos optimizados
- **Performance**: Optimizado para Lighthouse ≥90

## 🎯 Paleta de colores

- **Primario**: #FF3366 (rojo cereza)
- **Secundario**: #FF99AA (rosa)
- **Pastel**: #FFE6E6 (rosa pastel)
- **Blanco**: #FFFFFF

## 📊 Analítica y métricas

La landing incluye data-attributes preparados para tracking:
- `cta_register_click_*`: Clics en botones de registro
- `cta_login_click_*`: Clics en botones de login

### Eventos disponibles:
- `cta_register_click_header`
- `cta_register_click_hero`
- `cta_register_click_final`
- `cta_login_click_header`
- `cta_login_click_hero`
- `cta_login_click_final`

## 🔧 Estructura del proyecto

```
├── app/
│   ├── layout.tsx          # Layout principal con metadatos
│   ├── page.tsx            # Página principal de la landing
│   └── globals.css         # Estilos globales y Tailwind
├── components/
│   ├── Button.tsx          # Componente de botón reutilizable
│   └── Section.tsx         # Componente de sección reutilizable
├── public/
│   └── favicon.ico         # Favicon (placeholder)
├── next.config.ts          # Configuración de Next.js
├── tailwind.config.ts      # Configuración de Tailwind
└── postcss.config.js       # Configuración de PostCSS
```

## 📝 Marco crítico implementado

El proyecto incluye un marco crítico obligatorio documentado en comentarios:

1. **Supuestos analizados**: Identificación de asunciones sobre el comportamiento del usuario
2. **Contraargumentos**: Consideración de objeciones potenciales
3. **Prueba de razonamiento**: Validación de claims y beneficios
4. **Perspectivas alternativas**: Consideración de diferentes segmentos de usuarios
5. **Prioridad de verdad**: Evitar hipérboles y marcar claims pendientes de validación

## ⚠️ TODOs antes del lanzamiento

- [ ] Validar métricas de prueba social con datos reales
- [ ] Reemplazar testimonios placeholder con testimonios reales
- [ ] Actualizar información legal en footer
- [ ] Reemplazar favicon placeholder con diseño real
- [ ] Configurar analítica real (Google Analytics, etc.)
- [ ] Validar contraste de colores en todos los dispositivos
- [ ] Pruebas de usabilidad con usuarios reales

## 🚀 Despliegue

### Despliegue Automático con GitHub Actions + Vercel

Este proyecto incluye CI/CD completo con GitHub Actions:

```bash
# 1. Crear repositorio en GitHub
git init
git add .
git commit -m "🎉 Initial commit: InkFusion landing page"
git remote add origin https://github.com/tu-usuario/inkfusion-landing.git
git push -u origin main

# 2. Conectar proyecto en Vercel (detecta automáticamente Next.js)
# 3. Configurar secrets en GitHub (ver DEPLOYMENT.md)
```

**Características del CI/CD:**
- ✅ Testing automático (lint, types, build)
- 🔍 Lighthouse CI (performance ≥90)
- 🔒 Security audits
- 🚀 Deploy automático a producción
- 📝 Preview deployments en PRs

### Despliegue Manual

#### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configuración automática detectada
3. Deploy automático en cada push

#### Netlify
1. Ejecutar `npm run build`
2. Subir carpeta `out/` a Netlify
3. Configurar dominio personalizado

#### GitHub Pages
1. Ejecutar `npm run build`
2. Subir contenido de `out/` a rama `gh-pages`
3. Configurar GitHub Pages en settings del repositorio

📚 **Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa de despliegue**

## 📱 Responsive Design

La landing está optimizada para:
- **Mobile**: 360px+
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## ♿ Accesibilidad

- Navegación por teclado completa
- Screen reader compatible
- Contraste WCAG AA
- Semántica HTML correcta
- ARIA labels y roles apropiados
- Skip links implementados

## 🔍 SEO

- Metadatos Open Graph
- Twitter Cards
- Structured data ready
- Semantic HTML
- Performance optimizado
- Mobile-first indexing ready