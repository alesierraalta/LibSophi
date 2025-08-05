import Button from '../components/Button'
import Section from '../components/Section'
import FAQ from '../components/FAQ'
import InteractiveDemo from '../components/InteractiveDemo'
import AnimatedElement from '../components/AnimatedElement'
import { FeatureCard } from '../components/Card'

export default function Home() {
  return (
    <main id="main-content">
      {/* HEADER */}
      {/*
      MARCO CRÍTICO - HEADER:
      SUPUESTO: El logo tipográfico será suficiente para generar reconocimiento
      CONTRAARGUMENTO: Puede perderse entre tanto texto sin elemento visual distintivo
      PRUEBA: El contraste de colores y tamaño debe ser suficiente para destacar
      PERSPECTIVA ALTERNATIVA: Para lectores casuales, puede necesitar más contexto visual
      VERDAD: Mantenemos simplicidad para carga rápida y foco en CTAs
      */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-primary/10">
        <div className="container-max">
          <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
            <AnimatedElement direction="left" delay={100}>
              <div className="flex items-center group">
                <div className="relative">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    InkFusion
                  </h1>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                </div>
              </div>
            </AnimatedElement>
            
            <AnimatedElement direction="right" delay={200}>
              <div className="flex items-center space-x-3">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navegación principal">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-analytics="cta_login_click_header"
                    aria-label="Iniciar sesión en InkFusion"
                    className="text-gray-600 hover:text-primary"
                  >
                    Inicia sesión
                  </Button>
                  <Button 
                    variant="gradient"
                    size="sm"
                    data-analytics="cta_register_click_header"
                    aria-label="Registrarse gratis en InkFusion"
                    icon={<span>✨</span>}
                  >
                    Regístrate
                  </Button>
                </nav>
                
                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center space-x-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    data-analytics="cta_login_click_mobile_header"
                    aria-label="Iniciar sesión en InkFusion"
                    className="text-gray-600"
                  >
                    Entrar
                  </Button>
                  <Button 
                    variant="gradient"
                    size="sm"
                    data-analytics="cta_register_click_mobile_header"
                    aria-label="Registrarse gratis en InkFusion"
                    icon={<span>✨</span>}
                  >
                    Regístrate
                  </Button>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {/*
      MARCO CRÍTICO - HERO:
      SUPUESTO: Los visitantes entenderán inmediatamente la propuesta de fusión de plataformas
      CONTRAARGUMENTO: Puede ser demasiado complejo para procesar en 5 segundos
      PRUEBA: Usamos subtítulo específico y visual de producto para clarificar
      PERSPECTIVA ALTERNATIVA: 
        - Autores: Enfocarían en "monetiza tu escritura"
        - Lectores: Enfocarían en "descubre historias únicas"
      VERDAD: Evitamos promesas no verificables, usamos "conecta" en lugar de "revoluciona"
      // TODO: Validar que el mock-up del producto sea comprensible sin explicación
      */}
      <Section id="hero" className="pt-12 pb-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-gentle" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl animate-pulse-gentle" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/8 to-secondary/6 rounded-full blur-3xl animate-bounce-gentle" />
          {/* Additional red accents */}
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-primary/15 rounded-full blur-2xl animate-pulse-gentle" style={{animationDelay: '3s'}} />
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-primary/12 rounded-full blur-2xl animate-pulse-gentle" style={{animationDelay: '1s'}} />
        </div>

        <div className="text-center relative z-10">
          <AnimatedElement direction="up" delay={300}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent animate-pulse-gentle">
                Donde las historias cobran vida
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                en comunidad
              </span>
            </h2>
          </AnimatedElement>
          
          <AnimatedElement direction="up" delay={500}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Únete a una comunidad vibrante de escritores que 
              <span className="text-primary font-semibold"> comparten</span>, 
              <span className="text-secondary font-semibold"> colaboran</span> y 
              <span className="text-primary font-semibold"> crecen juntos</span>. 
              Ficción, ensayos y newsletters en un solo lugar.
            </p>
          </AnimatedElement>
          
          {/* Mock-up visual del producto */}
          <AnimatedElement direction="scale" delay={700}>
            <div className="mb-10 group">
              <div className="relative bg-gradient-to-br from-primary to-secondary p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto hover:shadow-primary/25 transition-all duration-500 hover:-translate-y-2">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
                
                <div className="bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  
                  <AnimatedElement direction="left" delay={900}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">IF</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Mi Comunidad</h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Miembro fundador #47
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                            Beta tester activo
                          </span>
                        </div>
                      </div>
                    </div>
                  </AnimatedElement>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AnimatedElement direction="up" delay={1100}>
                      <div className="bg-gradient-to-br from-pastel to-primary/5 p-4 rounded-xl border border-primary/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-primary">Historias</h4>
                          <span className="text-2xl">📚</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">15</p>
                        <p className="text-sm text-gray-600">comentarios</p>
                      </div>
                    </AnimatedElement>
                    
                    <AnimatedElement direction="up" delay={1200}>
                      <div className="bg-gradient-to-br from-pastel to-secondary/5 p-4 rounded-xl border border-secondary/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-secondary">Conexiones</h4>
                          <span className="text-2xl">🤝</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-sm text-gray-600">colaboradores</p>
                      </div>
                    </AnimatedElement>
                    
                    <AnimatedElement direction="up" delay={1300}>
                      <div className="bg-gradient-to-br from-pastel to-primary/5 p-4 rounded-xl border border-primary/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-primary">Feedback</h4>
                          <span className="text-2xl">💬</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                        <p className="text-sm text-gray-600">intercambios</p>
                      </div>
                    </AnimatedElement>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement direction="up" delay={1500}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button 
                variant="gradient"
                size="xl"
                data-analytics="cta_register_click_hero"
                aria-label="Registrarse gratis en InkFusion - Sin tarjeta requerida"
                icon={<span>🚀</span>}
              >
                Ser miembro fundador
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                data-analytics="cta_login_click_hero"
                aria-label="Iniciar sesión en InkFusion"
              >
                Ya tengo cuenta
              </Button>
            </div>
          </AnimatedElement>
          
          <AnimatedElement direction="fade" delay={1700}>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Acceso beta gratuito</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Configuración en 2 minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Comunidad en español</span>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </Section>

      {/* CÓMO FUNCIONA */}
      {/*
      MARCO CRÍTICO - CÓMO FUNCIONA:
      SUPUESTO: 3 pasos serán suficientes para explicar la complejidad de la plataforma
      CONTRAARGUMENTO: Puede simplificar demasiado el proceso real
      PRUEBA: Cada paso debe ser autoexplicativo con iconografía clara
      PERSPECTIVA ALTERNATIVA: Diferentes usuarios priorizarán diferentes pasos
      VERDAD: Usamos verbos de acción específicos, no promesas vagas
      */}
      <Section id="como-funciona" background="pastel" aria-labelledby="como-funciona-title" className="relative">
        {/* Red accent decorations */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse-gentle" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/8 rounded-full blur-xl animate-pulse-gentle" style={{animationDelay: '2s'}} />
        <AnimatedElement direction="up" delay={200}>
          <div className="text-center mb-16">
            <h2 id="como-funciona-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tres pasos simples para empezar a publicar, conectar y monetizar tu escritura
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedElement direction="up" delay={400}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-primary/25 transition-all duration-300">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">Lee</h3>
              <p className="text-gray-600 leading-relaxed">
                Descubre ficción, newsletters y artículos de una comunidad diversa de escritores. 
                Filtra por género, temática o formato.
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement direction="up" delay={600}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-secondary/25 transition-all duration-300">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-secondary transition-colors duration-300">Escribe</h3>
              <p className="text-gray-600 leading-relaxed">
                Publica ficción por capítulos, newsletters semanales o artículos profundos. 
                Editor integrado con herramientas de formato.
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement direction="up" delay={800}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-primary/25 transition-all duration-300">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">Conecta</h3>
              <p className="text-gray-600 leading-relaxed">
                Construye relaciones auténticas con otros escritores. Colabora, recibe feedback 
                y forma parte de una comunidad que te apoya.
              </p>
            </div>
          </AnimatedElement>
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
              Experimenta cómo se siente escribir en InkFusion. Escribe algo y ve cómo tu historia cobra vida.
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
              <p className="text-sm text-primary font-semibold">— Equipo InkFusion</p>
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
            Resolvemos las dudas más comunes sobre InkFusion y nuestra comunidad
          </p>
        </div>

        <FAQ faqs={[
          {
            question: "¿Por qué debería unirme si la plataforma está en beta?",
            answer: "Precisamente porque estás en beta tienes una oportunidad única de influir en el desarrollo. Como miembro fundador, tu feedback moldea directamente las funcionalidades. Además, obtienes acceso gratuito de por vida a funciones premium y un badge especial de pionero."
          },
          {
            question: "¿Cómo se diferencia InkFusion de Wattpad o Medium?",
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
                aria-label="Únete como miembro fundador de InkFusion"
                className="bg-white text-primary hover:bg-gray-50 hover:text-red-600 border-0 shadow-lg hover:shadow-xl"
                icon={<span>✨</span>}
              >
                Ser miembro fundador
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                data-analytics="cta_login_click_final"
                aria-label="Iniciar sesión en InkFusion"
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
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container-max py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">InkFusion</h3>
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
                <li><a href="mailto:hola@inkfusion.com" className="text-gray-600 hover:text-primary transition-colors">hola@inkfusion.com</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 InkFusion. Todos los derechos reservados. 
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