# 🚀 Palabreo Performance Testing & Optimization

Este documento describe el sistema completo de testing de rendimiento y optimización para Palabreo.

## 📋 Resumen del Sistema

El sistema incluye:
- **Auditoría de Base de Datos**: Verificación de esquema y funcionalidades
- **Optimización Automática**: Scripts SQL para mejorar rendimiento
- **Tests de Rendimiento**: Suite completa de pruebas
- **Monitoreo Continuo**: Métricas y alertas

## 🛠️ Instalación de Herramientas

### Requisitos Básicos
```bash
# Instalar k6 (Load Testing)
# Windows (Chocolatey)
choco install k6

# macOS (Homebrew)
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Instalar Lighthouse CI
npm install -g @lhci/cli

# Instalar dependencias del proyecto
npm install
```

## 🔍 Auditoría de Base de Datos

### Ejecutar Auditoría Completa
```bash
npm run perf:audit
```

Esta auditoría verifica:
- ✅ Existencia de todas las tablas requeridas
- ✅ Columnas necesarias en cada tabla
- ✅ Índices para optimización
- ✅ Constraints de integridad
- ✅ Funcionalidades de la aplicación

### Resultados Esperados
```
📊 DATABASE AUDIT RESULTS
==================================================

📈 SUMMARY:
Total tables checked: 10
Existing tables: 10
Tables with issues: 0
Health score: 100%

✅ profiles: EXISTS
✅ works: EXISTS
✅ comments: EXISTS
✅ likes: EXISTS
✅ follows: EXISTS
✅ notifications: EXISTS
✅ bookmarks: EXISTS
✅ reading_progress: EXISTS
✅ genres: EXISTS
✅ tags: EXISTS
```

## 🚀 Optimización de Base de Datos

### Aplicar Optimizaciones
```bash
npm run perf:optimize
```

Este comando:
1. Crea índices optimizados para consultas frecuentes
2. Establece constraints de integridad
3. Configura full-text search
4. Optimiza estadísticas de tablas

### Índices Creados
- **Búsquedas**: `idx_works_search` (full-text)
- **Feed Social**: `idx_works_author_published_created`
- **Notificaciones**: `idx_notifications_unread_only`
- **Relaciones**: `idx_follows_*`, `idx_likes_*`
- **Performance**: Índices parciales y compuestos

## 🧪 Tests de Rendimiento

### Suite Completa
```bash
npm run perf:all
```

### Tests Individuales

#### Lighthouse (Core Web Vitals)
```bash
npm run perf:lighthouse
```
Mide:
- **LCP**: Largest Contentful Paint < 2.5s
- **FID**: First Input Delay < 100ms
- **CLS**: Cumulative Layout Shift < 0.1
- **Performance Score**: > 85%

#### Load Testing
```bash
npm run perf:load
```
Prueba:
- **Usuarios Concurrentes**: 10 → 100 usuarios
- **Tiempo de Respuesta**: p95 < 500ms
- **Tasa de Error**: < 1%
- **Throughput**: > 100 req/s

#### Tests Específicos
```bash
# Solo auditoría de BD
npm run perf:audit

# Solo tests de carga
bash scripts/run-performance-tests.sh load

# Solo Lighthouse
bash scripts/run-performance-tests.sh lighthouse
```

## 📊 Métricas y Objetivos

### Objetivos de Rendimiento

| Métrica | Objetivo | Actual |
|---------|----------|---------|
| **Tiempo de Carga Inicial** | < 2s | ⏱️ |
| **Navegación Entre Páginas** | < 500ms | ⏱️ |
| **Búsqueda de Obras** | < 300ms | ⏱️ |
| **Carga de Perfil** | < 1s | ⏱️ |
| **Notificaciones** | < 200ms | ⏱️ |

### Core Web Vitals

| Métrica | Objetivo | Descripción |
|---------|----------|-------------|
| **LCP** | < 2.5s | Tiempo hasta el contenido principal |
| **FID** | < 100ms | Tiempo de respuesta a interacción |
| **CLS** | < 0.1 | Estabilidad visual de la página |

### Capacidad del Sistema

| Aspecto | Objetivo |
|---------|----------|
| **Usuarios Concurrentes** | 1,000+ |
| **Requests por Segundo** | 10,000+ |
| **Uptime** | 99.9% |
| **Disponibilidad** | 24/7 |

## 📈 Interpretación de Resultados

### Lighthouse Scores
- **90-100**: Excelente ✅
- **70-89**: Bueno ⚠️
- **50-69**: Necesita mejora 🔧
- **0-49**: Pobre ❌

### Load Test Metrics
```javascript
// Métricas clave en k6
http_req_duration: ['p(95)<500']  // 95% requests < 500ms
http_req_rate: ['rate>100']       // > 100 requests/second
errors: ['rate<0.01']             // < 1% error rate
```

### Database Performance
```sql
-- Consultas lentas (> 100ms)
SELECT * FROM slow_queries LIMIT 10;

-- Uso de índices
SELECT schemaname, tablename, attname, n_distinct 
FROM pg_stats WHERE schemaname = 'public';
```

## 🔧 Optimizaciones Implementadas

### Frontend
- **Code Splitting**: Componentes lazy-loaded
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Tree shaking y minificación
- **Caching**: Estrategia de caché inteligente

### Backend
- **Database Indexes**: Índices optimizados para consultas frecuentes
- **Query Optimization**: Consultas eficientes con paginación
- **Connection Pooling**: Gestión eficiente de conexiones
- **Caching Layer**: Redis para datos frecuentes

### Base de Datos
```sql
-- Índices principales creados
CREATE INDEX idx_works_author_published_created 
  ON works(author_id, published, created_at DESC) 
  WHERE published = true;

CREATE INDEX idx_notifications_unread_only 
  ON notifications(user_id, created_at DESC) 
  WHERE read = false;
```

## 📊 Monitoreo Continuo

### Métricas en Tiempo Real
- **Response Times**: Percentiles p50, p95, p99
- **Error Rates**: Por endpoint y tipo
- **Database Performance**: Query times, connection usage
- **User Experience**: Core Web Vitals en producción

### Alertas Configuradas
- Tiempo de respuesta > 1s (p95)
- Error rate > 1%
- Database connection pool > 80%
- Core Web Vitals por debajo de objetivos

## 🚨 Troubleshooting

### Problemas Comunes

#### "k6 not found"
```bash
# Instalar k6 según tu sistema operativo
# Ver sección "Instalación de Herramientas"
```

#### "Lighthouse tests failing"
```bash
# Verificar que el servidor esté corriendo
npm run build
npm start

# En otra terminal
npm run perf:lighthouse
```

#### "Database connection errors"
```bash
# Verificar variables de entorno
echo $DATABASE_URL
echo $SUPABASE_URL

# Verificar conexión a Supabase
npm run perf:audit
```

#### "Performance tests timing out"
```bash
# Aumentar timeouts en configuración
# Verificar recursos del sistema
# Ejecutar tests individuales
```

### Debug Mode
```bash
# Ejecutar con más información
DEBUG=* npm run perf:test

# Ver logs detallados de k6
k6 run --verbose tests/performance/load-test.js
```

## 📋 Checklist de Optimización

### Pre-Deploy
- [ ] Ejecutar `npm run perf:audit`
- [ ] Aplicar `npm run perf:optimize`
- [ ] Verificar `npm run perf:lighthouse`
- [ ] Validar `npm run perf:load`
- [ ] Revisar métricas de Core Web Vitals

### Post-Deploy
- [ ] Monitorear métricas en producción
- [ ] Verificar alertas configuradas
- [ ] Ejecutar tests de regresión
- [ ] Documentar cambios de performance

### Mantenimiento Regular
- [ ] Tests de performance semanales
- [ ] Auditoría de BD mensual
- [ ] Revisión de métricas continua
- [ ] Optimización basada en datos

## 📚 Recursos Adicionales

### Documentación
- [DATABASE_AUDIT_PLAN.md](./DATABASE_AUDIT_PLAN.md) - Plan detallado de auditoría
- [k6 Documentation](https://k6.io/docs/) - Load testing
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Performance testing
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance) - Frontend optimization

### Herramientas de Monitoreo
- **Vercel Analytics**: Frontend metrics
- **Supabase Dashboard**: Database metrics  
- **Sentry**: Error tracking
- **Custom Dashboard**: Métricas personalizadas

---

## 🎯 Próximos Pasos

1. **Implementar Caching**: Redis/Memory cache
2. **CDN Setup**: Optimización de assets estáticos
3. **Real User Monitoring**: Métricas de usuarios reales
4. **Automated Scaling**: Escalado automático basado en carga
5. **Performance Budget**: Límites automáticos de performance

---

*Para soporte técnico o preguntas sobre performance, consulta el equipo de desarrollo.*

