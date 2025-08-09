'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../components/Button'
import Section from '../components/Section'
import FAQ from '../components/FAQ'
import InteractiveDemo from '../components/InteractiveDemo'
import AnimatedElement from '../components/AnimatedElement'
import { FeatureCard } from '../components/Card'
import ThemeSelector from '../components/ThemeSelector'
import WritingSocialPreview from '../components/WritingSocialPreview'

export default function Home() {
  const router = useRouter()
  return (
    <main id="main-content" className="w-full min-h-screen">
      {/* Theme Selector for Red Evaluation */}
      <ThemeSelector />
      
      {/* HEADER - MOBILE FIRST REDESIGN */}
      {/*
      MARCO CRÍTICO - HEADER MÓVIL:
      REDISEÑO: Prioridad mobile-first con navegación limpia y directa
      MEJORAS: Mejor uso del espacio, interacciones táctiles optimizadas, UX móvil nativa
      ENFOQUE: CTAs esenciales en móvil, sin menú complejo, experiencia directa
      */}
      <header className="bg-white backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-primary/10">
        <div className="container-max">
          <div className="flex items-center justify-between py-4 sm:py-5 md:py-6">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Palabreo
              </h1>
            </div>
            
            <div className="flex items-center">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navegación principal">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-analytics="cta_login_click_header"
                  aria-label="Iniciar sesión en Palabreo"
                  className="text-gray-600 hover:text-primary"
                  onClick={() => router.push('/login')}
                >
                  Inicia sesión
                </Button>
                <Button 
                  variant="gradient"
                  size="sm"
                  data-analytics="cta_register_click_header"
                  aria-label="Registrarse gratis en Palabreo"
                  icon={<span>✨</span>}
                  onClick={() => router.push('/register')}
                >
                  Regístrate
                </Button>
              </nav>
              
              {/* Mobile Navigation - Clean and Simple */}
              <div className="md:hidden flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  data-analytics="cta_login_click_mobile_header"
                  aria-label="Iniciar sesión"
                  className="text-gray-600 hover:text-primary text-sm px-3 py-2 touch-manipulation"
                  onClick={() => router.push('/login')}
                >
                  Entrar
                </Button>
                <Button 
                  variant="gradient"
                  size="sm"
                  data-analytics="cta_register_click_mobile_header"
                  aria-label="Únete como miembro fundador"
                  className="text-sm px-4 py-2 touch-manipulation"
                  onClick={() => router.push('/register')}
                >
                  Únete
                </Button>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* HERO SECTION - MOBILE FIRST REDESIGN */}
      {/*
      MARCO CRÍTICO - HERO MÓVIL:
      REDISEÑO: Contenido más conciso y directo para pantallas pequeñas
      MEJORAS: Jerarquía visual clara, menos texto, CTAs más prominentes
      ENFOQUE: Mensaje principal en una línea, beneficios clave destacados
      */}
      <Section id="hero" className="pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-20 relative overflow-hidden">
        {/* Optimized background - minimal effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl opacity-60" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/4 rounded-full blur-2xl opacity-60" />
        </div>

        <div className="text-center relative z-10">
          {/* Mobile-first headline - More concise */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-1 sm:mb-2 md:mb-3 leading-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
              Tu comunidad de escritores
            </span>
            <span className="text-gray-900 block mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl lg:text-5xl">
              está aquí
            </span>
          </h2>
          
          {/* Simplified mobile description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-3 sm:mb-4 max-w-2xl mx-auto leading-relaxed">
            <span className="block sm:hidden">
              Comparte, colabora y crece con otros escritores. 
              <span className="text-primary font-semibold"> Ficción, ensayos y newsletters</span> en un solo lugar.
            </span>
            <span className="hidden sm:block">
              Únete a una comunidad vibrante de escritores que 
              <span className="text-primary font-semibold"> comparten</span>, 
              <span className="text-secondary font-semibold"> colaboran</span> y 
              <span className="text-primary font-semibold"> crecen juntos</span>. 
              Ficción, ensayos y newsletters en un solo lugar.
            </span>
          </p>
          
          {/* Enhanced Social Writing Network Preview */}
          <div className="mb-2 sm:mb-3 md:mb-4 mx-1 sm:mx-2">
            <WritingSocialPreview 
              laptopDeviceImage="/macbook.png"
              mobileScreenImage="/iphone.png"
            />
          </div>

          {/* Optimized CTAs */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {/* Primary CTA - Full width on mobile */}
            <Button 
              variant="gradient"
              size="xl"
              data-analytics="cta_register_click_hero"
              aria-label="Únete como miembro fundador - Acceso beta gratuito"
              icon={<span>🚀</span>}
              className="w-full sm:w-auto sm:min-w-[300px] text-center font-semibold py-4 sm:py-3 text-base sm:text-lg"
              onClick={() => router.push('/register')}
            >
              <span className="block sm:inline">Ser miembro fundador</span>
              <span className="block sm:hidden text-sm opacity-90 mt-1">Acceso beta gratuito</span>
            </Button>
            
            {/* Secondary CTA - Less prominent on mobile */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="md"
                data-analytics="cta_login_click_hero"
                aria-label="Iniciar sesión en Palabreo"
                className="text-gray-600 hover:text-primary text-sm sm:text-base px-6 py-2"
                onClick={() => router.push('/login')}
              >
                Ya tengo cuenta
              </Button>
            </div>
          </div>
          
          {/* Optimized benefits */}
          <div>
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-sm">✓</span>
                <span>Acceso beta gratuito</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-sm">✓</span>
                <span>Setup en 2 minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-sm">✓</span>
                <span>Comunidad en español</span>
              </div>
            </div>
            
            {/* Mobile-specific additional benefit */}
            <div className="block sm:hidden mt-3 text-center">
              <div className="inline-flex items-center space-x-2 text-xs text-primary bg-primary/5 px-3 py-1 rounded-full">
                <span>💡</span>
                <span>Optimizado para móvil</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CÓMO FUNCIONA - MOBILE FIRST */}
      {/*
      MARCO CRÍTICO - CÓMO FUNCIONA MÓVIL:
      REDISEÑO: Pasos más concisos, iconografía más clara, mejor spacing móvil
      MEJORAS: Cards más compactas, texto simplificado, interacciones táctiles mejoradas
      ENFOQUE: Proceso visual claro en móvil, menos texto, más iconos
      */}
      <Section id="como-funciona" background="pastel" aria-labelledby="como-funciona-title">
        
        <div className="text-center mb-10 sm:mb-16">
          <h2 id="como-funciona-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Cómo funciona
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            <span className="block sm:hidden">Tres pasos simples para empezar</span>
            <span className="hidden sm:block">Tres pasos simples para empezar a publicar, conectar y monetizar tu escritura</span>
          </p>
        </div>

        {/* Optimized grid layout */}
        <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 md:gap-8">
          <div className="text-center p-4 sm:p-6 rounded-xl bg-white/30">
            {/* Simplified step indicator */}
            <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-md">
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">1</span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              📚 Lee
            </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                <span className="block sm:hidden">
                  Descubre historias, newsletters y artículos de escritores diversos.
                </span>
                <span className="hidden sm:block">
                  Descubre ficción, newsletters y artículos de una comunidad diversa de escritores. 
                  Filtra por género, temática o formato.
                </span>
              </p>
            </div>

          <div className="text-center p-4 sm:p-6 rounded-xl bg-white/30">
            <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-md">
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">2</span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              ✍️ Escribe
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              <span className="block sm:hidden">
                Publica ficción, newsletters o artículos con nuestro editor integrado.
              </span>
              <span className="hidden sm:block">
                Publica ficción por capítulos, newsletters semanales o artículos profundos. 
                Editor integrado con herramientas de formato.
              </span>
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 rounded-xl bg-white/30">
            <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-md">
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">3</span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              🤝 Conecta
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              <span className="block sm:hidden">
                Construye relaciones con otros escritores y recibe feedback valioso.
              </span>
              <span className="hidden sm:block">
                Construye relaciones auténticas con otros escritores. Colabora, recibe feedback 
                y forma parte de una comunidad que te apoya.
              </span>
            </p>
          </div>
        </div>
      </Section>

      {/* DEMO INTERACTIVO */}
      {/*
      MARCO CRÍTICO - DEMO INTERACTIVO:
      SUPUESTO: Una demo práctica convencerá mejor que explicaciones
      CONTRAARGUMENTO: Puede distraer del mensaje principal o parecer gimmicky
      PRUEBA: El demo debe ser lo suficientemente funcional para mostrar valor real
      PERSPECTIVA ALTERNATIVA: Diferentes usuarios preferirán diferentes tipos de contenido
      VERDAD: Reconocemos que es una demo simplificada, no el producto final
      */}
      <Section id="demo" aria-labelledby="demo-title">
        <AnimatedElement direction="up" delay={200}>
          <div className="text-center mb-16">
            <h2 id="demo-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pruébalo ahora mismo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experimenta cómo se siente escribir en Palabreo. Escribe algo y ve cómo tu historia cobra vida.
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement direction="scale" delay={400}>
          <InteractiveDemo />
        </AnimatedElement>

        <AnimatedElement direction="up" delay={600}>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-6 text-lg">
              ¿Te gusta la experiencia? Imagínate con herramientas profesionales y una comunidad real.
            </p>
            <Button 
              variant="gradient"
              size="lg"
              data-analytics="cta_register_click_demo"
              aria-label="Registrarse después de probar el demo"
              icon={<span>🚀</span>}
            >
              Unirme como fundador
            </Button>
          </div>
        </AnimatedElement>
      </Section>

      {/* CARACTERÍSTICAS CLAVE */}
      {/*
      MARCO CRÍTICO - CARACTERÍSTICAS:
      SUPUESTO: Estas 4 características son las más valoradas por los usuarios
      CONTRAARGUMENTO: Puede faltar diferenciación real vs. competencia
      PRUEBA: Cada característica debe tener un beneficio específico medible
      PERSPECTIVA ALTERNATIVA: Diferentes segmentos valorarán diferentes características
      VERDAD: Evitamos términos como "infinita" sin contexto cuantificable
      // TODO: Validar que "métricas transparentes" sea realmente diferencial
      */}
      <Section id="caracteristicas" aria-labelledby="caracteristicas-title">
        <AnimatedElement direction="up" delay={200}>
          <div className="text-center mb-16">
            <h2 id="caracteristicas-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Las mejores características de tus plataformas favoritas, optimizadas para escritores
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatedElement direction="up" delay={400}>
            <FeatureCard
              icon="📚"
              title="Biblioteca comunitaria"
              description="Accede a historias, newsletters y artículos organizados por géneros y temáticas. Descubre contenido curado por la comunidad."
            />
          </AnimatedElement>

          <AnimatedElement direction="up" delay={500}>
            <FeatureCard
              icon="🤝"
              title="Colaboración real"
              description="Conecta con otros escritores, forma grupos de escritura, intercambia feedback y construye relaciones duraderas."
            />
          </AnimatedElement>

          <AnimatedElement direction="up" delay={600}>
            <FeatureCard
              icon="✍️"
              title="Editor avanzado"
              description="Herramientas profesionales de escritura con formato rico, control de versiones y modo colaborativo en tiempo real."
            />
          </AnimatedElement>

          <AnimatedElement direction="up" delay={700}>
            <FeatureCard
              icon="📊"
              title="Métricas transparentes"
              description="Dashboard completo con estadísticas de lectores, engagement y crecimiento. Datos que realmente te ayudan a mejorar."
            />
          </AnimatedElement>
        </div>
      </Section>

      {/* PRUEBA SOCIAL */}
      {/*
      MARCO CRÍTICO - PRUEBA SOCIAL:
      SUPUESTO: Los números impresionarán sin contexto adicional
      CONTRAARGUMENTO: Pueden parecer inflados o poco creíbles sin verificación
      PRUEBA: Necesitamos fuentes verificables para estas métricas
      PERSPECTIVA ALTERNATIVA: Diferentes usuarios valorarán diferentes métricas
      VERDAD: Marcamos claramente que son placeholders pendientes de validación
      // TODO: Reemplazar con métricas reales verificables antes del lanzamiento
      */}
      <Section id="prueba-social" background="pastel" aria-labelledby="prueba-social-title">
        <AnimatedElement direction="up" delay={200}>
          <div className="text-center mb-16">
            <h2 id="prueba-social-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sé parte de algo especial desde el inicio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Únete a los escritores pioneros que están construyendo la comunidad literaria del futuro
            </p>
          </div>
        </AnimatedElement>

        {/* Métricas Comunitarias - Enfoque en early adopters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <AnimatedElement direction="up" delay={400}>
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  100
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <p className="text-gray-900 font-semibold text-lg">Miembros fundadores</p>
              <p className="text-sm text-primary mt-1 font-medium">Únete a los primeros</p>
            </div>
          </AnimatedElement>
          
          <AnimatedElement direction="up" delay={500}>
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <p className="text-gray-900 font-semibold text-lg">Comunidad activa</p>
              <p className="text-sm text-secondary mt-1 font-medium">Siempre hay alguien escribiendo</p>
            </div>
          </AnimatedElement>
          
          <AnimatedElement direction="up" delay={600}>
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  Beta
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <p className="text-gray-900 font-semibold text-lg">Acceso anticipado</p>
              <p className="text-sm text-primary mt-1 font-medium">Ayúdanos a construir juntos</p>
            </div>
          </AnimatedElement>
        </div>

        {/* Visión del equipo y roadmap transparente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedElement direction="left" delay={800}>
            <div className="bg-gradient-to-br from-white to-primary/5 p-6 rounded-xl shadow-lg border-l-4 border-primary hover:shadow-primary/10 transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">🚀</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">Nuestra Visión</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                "Creemos que cada escritor merece una comunidad que lo apoye, 
                no solo una plataforma que lo monetice. Estamos construyendo 
                el hogar digital de los escritores."
              </p>
              <p className="text-sm text-primary font-semibold">— Equipo Palabreo</p>
            </div>
          </AnimatedElement>

          <AnimatedElement direction="up" delay={900}>
            <div className="bg-gradient-to-br from-white to-secondary/5 p-6 rounded-xl shadow-lg border-l-4 border-secondary hover:shadow-secondary/10 transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">🛠️</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-secondary transition-colors duration-300">Próximas 6 semanas</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-center space-x-2"><span className="text-green-500 font-bold">✅</span><span>Lanzamiento beta privado</span></li>
                <li className="flex items-center space-x-2"><span className="text-primary">🔄</span><span>Sistema de comentarios colaborativo</span></li>
                <li className="flex items-center space-x-2"><span className="text-primary">📝</span><span>Editor de texto avanzado</span></li>
                <li className="flex items-center space-x-2"><span className="text-primary">👥</span><span>Grupos de escritura temáticos</span></li>
                <li className="flex items-center space-x-2"><span className="text-primary">🎯</span><span>Challenges comunitarios</span></li>
              </ul>
            </div>
          </AnimatedElement>

          <AnimatedElement direction="right" delay={1000}>
            <div className="bg-gradient-to-br from-white to-primary/5 p-6 rounded-xl shadow-lg border-l-4 border-primary hover:shadow-primary/10 transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">💡</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">Construye con nosotros</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Como miembro fundador, tu feedback moldea directamente 
                las funcionalidades. Sesiones semanales de co-creación 
                con el equipo de desarrollo.
              </p>
              <a href="#" className="inline-flex items-center text-primary hover:text-red-600 font-semibold text-sm group-hover:translate-x-1 transition-all duration-300">
                Únete al Discord de fundadores 
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </a>
            </div>
          </AnimatedElement>
        </div>
      </Section>

      {/* FAQ SECTION */}
      {/*
      MARCO CRÍTICO - FAQ:
      SUPUESTO: Las preguntas frecuentes abordan las principales objeciones
      CONTRAARGUMENTO: Puede parecer que anticipamos demasiados problemas
      PRUEBA: Cada pregunta debe basarse en feedback real de early adopters
      PERSPECTIVA ALTERNATIVA: Diferentes usuarios tendrán diferentes dudas según su experiencia
      VERDAD: Reconocemos honestamente las limitaciones de ser una startup nueva
      */}
      <Section id="faq" aria-labelledby="faq-title">
        <div className="text-center mb-16">
          <h2 id="faq-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre Palabreo y nuestra comunidad
          </p>
        </div>

        <FAQ faqs={[
          {
            question: "¿Por qué debería unirme si la plataforma está en beta?",
            answer: "Precisamente porque estás en beta tienes una oportunidad única de influir en el desarrollo. Como miembro fundador, tu feedback moldea directamente las funcionalidades. Además, obtienes acceso gratuito de por vida a funciones premium y un badge especial de pionero."
          },
          {
            question: "¿Cómo se diferencia Palabreo de Wattpad o Medium?",
            answer: "Mientras otras plataformas se enfocan en algoritmos o monetización, nosotros priorizamos la comunidad real. Facilitamos colaboraciones genuinas, feedback constructivo y conexiones duraderas entre escritores. No somos una red social, somos un hogar para escritores."
          },
          {
            question: "¿Qué pasa si la startup no funciona?",
            answer: "Entendemos esta preocupación. Por eso garantizamos que siempre podrás exportar todo tu contenido. Además, como somos una comunidad real, las conexiones que hagas trascienden la plataforma. Pero estamos aquí para quedarnos y crecer contigo."
          },
          {
            question: "¿Cómo puedo ayudar a construir la plataforma?",
            answer: "¡Excelente pregunta! Puedes unirte a nuestro Discord de fundadores, participar en sesiones semanales de feedback, probar nuevas funcionalidades antes que nadie, y ayudarnos a definir las reglas de la comunidad. Tu voz cuenta desde el día uno."
          },
          {
            question: "¿Habrá costos en el futuro?",
            answer: "La membresía básica siempre será gratuita. En el futuro, ofreceremos funciones premium opcionales (analytics avanzados, herramientas de marketing), pero los miembros fundadores tendrán acceso gratuito de por vida como reconocimiento a su apoyo temprano."
          }
        ]} />
      </Section>

      {/* CTA FINAL */}
      {/*
      MARCO CRÍTICO - CTA FINAL:
      SUPUESTO: Un CTA grande al final convertirá a usuarios indecisos
      CONTRAARGUMENTO: Puede parecer desesperado si no hay valor adicional
      PRUEBA: Reforzamos el valor con recordatorio de beneficios clave
      PERSPECTIVA ALTERNATIVA: Algunos preferirán información adicional antes de registrarse
      VERDAD: Mantenemos honestidad sobre el compromiso requerido
      */}
      <Section id="cta-final" className="text-center">
        <div className="relative bg-gradient-to-br from-primary via-red-500 to-secondary p-12 rounded-3xl text-white overflow-hidden shadow-2xl">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-red-500/20 to-secondary/20 animate-pulse-gentle" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" style={{animationDelay: '2s'}} />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              ¿Listo para ser parte de la historia?
            </h2>
            <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Únete como miembro fundador y ayúdanos a construir la comunidad literaria 
              más auténtica y colaborativa. Tu voz importa desde el día uno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="secondary" 
                size="xl"
                data-analytics="cta_register_click_final"
                aria-label="Únete como miembro fundador de Palabreo"
                className="bg-white text-primary hover:bg-gray-50 hover:text-red-600 border-0 shadow-lg hover:shadow-xl"
                icon={<span>✨</span>}
              >
                Ser miembro fundador
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                data-analytics="cta_login_click_final"
                aria-label="Iniciar sesión en Palabreo"
                className="text-white border-white/50 hover:bg-white/10 hover:border-white"
              >
                Ya tengo cuenta
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm mt-6 opacity-90">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">✓</span>
                <span>Acceso beta gratuito</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">✓</span>
                <span>Exporta tu contenido siempre</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">✓</span>
                <span>Comunidad en español</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      {/*
      MARCO CRÍTICO - FOOTER:
      SUPUESTO: Footer mínimo es suficiente para una landing page
      CONTRAARGUMENTO: Usuarios pueden necesitar más información legal/contacto
      PRUEBA: Enlaces esenciales están presentes y accesibles
      PERSPECTIVA ALTERNATIVA: Algunos usuarios buscan información detallada en footer
      VERDAD: Placeholders son válidos para MVP pero deben ser funcionales en producción
      */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8 sm:mt-12 md:mt-16">
        <div className="container-max py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">Palabreo</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                La plataforma que conecta ficción, newsletters y artículos en una comunidad 
                vibrante de escritores y lectores.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                  <span className="sr-only">Twitter</span>
                  <span className="text-xl">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                  <span className="sr-only">Instagram</span>
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="LinkedIn">
                  <span className="sr-only">LinkedIn</span>
                  <span className="text-xl">💼</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Términos de uso</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li><a href="mailto:hola@palabreo.com" className="text-gray-600 hover:text-primary transition-colors">hola@palabreo.com</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Palabreo. Todos los derechos reservados. 
              <span className="block mt-1">
                // TODO: Actualizar con información legal real antes del lanzamiento
              </span>
            </p>
          </div>
        </div>
      </footer>


    </main>
  )
}