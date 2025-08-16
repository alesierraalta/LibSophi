import type { Metadata } from 'next'
import { Poppins, Rubik, Merriweather, Lora, Roboto_Slab, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import StructuredData from '../components/StructuredData'
import dynamic from 'next/dynamic'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const merriweather = Merriweather({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900'],
  preload: true,
  fallback: ['Georgia', 'serif'],
})

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  preload: true,
  fallback: ['Georgia', 'serif'],
})

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-robotoslab',
  weight: ['300', '400', '500', '700', '900'],
  preload: true,
  fallback: ['Georgia', 'serif'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  preload: true,
  fallback: ['Garamond', 'serif'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['300', '400', '500', '600', '700', '800'],
  preload: true,
  fallback: ['Consolas', 'monospace'],
})

/*
MARCO CRÍTICO OBLIGATORIO - RESUMEN EJECUTIVO

SUPUESTOS ANALIZADOS:
- Asumimos que los visitantes comprenden inmediatamente la fusión Wattpad/AO3/Substack/Medium
  RIESGO: Puede generar confusión inicial. MITIGACIÓN: Explicación clara en hero y "Cómo funciona"
- Asumimos que la paleta rojo/rosa no excluye segmentos masculinos o conservadores
  RIESGO: Posible sesgo de género percibido. MITIGACIÓN: Uso equilibrado con mucho blanco y tipografía neutra
- Asumimos que el registro directo es suficiente sin prueba social extensa
  RIESGO: Falta de confianza inicial. MITIGACIÓN: Contadores de métricas y testimonios

CONTRAARGUMENTOS PRINCIPALES:
- Coste de cambio desde plataformas establecidas es alto
- Saturación del mercado de plataformas de escritura
- Dudas sobre la viabilidad real de monetización para autores indie
- Complejidad de gestionar múltiples formatos (ficción + newsletters + artículos)

PRUEBAS DE RAZONAMIENTO:
- Claims sobre "biblioteca infinita" requieren validación con datos reales
- Métricas de satisfacción (98%) necesitan respaldo estadístico
- Promesas de monetización requieren casos de éxito demostrables
// TODO: Validar todas las métricas con datos reales antes del lanzamiento

PERSPECTIVAS ALTERNATIVAS:
- Autores: Enfoque en herramientas de escritura y audiencia
- Lectores: Enfoque en descubrimiento y experiencia de lectura
- Periodistas/Ensayistas: Enfoque en credibilidad y distribución profesional
- Educadores: Enfoque en herramientas pedagógicas y comunidad académica

PRIORIDAD DE VERDAD:
- Evitamos hipérboles como "revolución" o "único en el mercado"
- Marcamos claims pendientes de validación con TODOs
- Usamos lenguaje específico y medible donde sea posible
*/

export const metadata: Metadata = {
  title: 'Palabreo - Donde las palabras cobran vida en comunidad',
  description: 'Únete a la comunidad de escritores pioneros que están construyendo el futuro literario. Ficción, ensayos y newsletters en un hogar digital auténtico para escritores.',
  keywords: 'escritura, comunidad, ficción, ensayos, newsletters, escritores, colaboración, beta, startup literaria',
  authors: [{ name: 'Palabreo Team' }],
  creator: 'Palabreo',
  publisher: 'Palabreo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Palabreo - Donde las palabras cobran vida en comunidad',
    description: 'Únete a los escritores pioneros que están construyendo la comunidad literaria del futuro.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Palabreo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palabreo - Donde las palabras cobran vida en comunidad',
    description: 'Únete a los escritores pioneros que están construyendo la comunidad literaria del futuro.',
    creator: '@palabreo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token_here', // TODO: Add real verification token
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: '#DC2626',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const MobileFooter = dynamic(() => import('../components/MobileFooter'), { ssr: false })
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${poppins.variable} ${rubik.variable} ${merriweather.variable} ${lora.variable} ${robotoSlab.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-gray-900`}>
        {/* Supabase cookies will be managed via @supabase/ssr in server actions and route handlers */}
        <StructuredData />
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <div className="relative md:pb-0 pb-16">
          {children}
        </div>
        <MobileFooter />
      </body>
    </html>
  )
}