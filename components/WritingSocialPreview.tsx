'use client'

import React from 'react'

interface WritingSocialPreviewProps {
  laptopScreenImage?: string;
  mobileScreenImage?: string;
}

export default function WritingSocialPreview({ 
  laptopScreenImage, 
  mobileScreenImage 
}: WritingSocialPreviewProps = {}) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Devices Container */}
      <div className="relative flex items-center justify-center min-h-[600px] sm:min-h-[700px] md:min-h-[800px]">
        
        {/* MacBook Pro - Native Design */}
        <div className="relative z-10 -ml-8 sm:-ml-12 md:-ml-16 transform scale-85 sm:scale-95 md:scale-105">
          {/* MacBook Base - Silver Aluminum */}
          <div className="bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-3xl p-6 shadow-2xl border border-gray-300/50">
            {/* Screen Bezel - Black */}
            <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl p-2 shadow-inner">
              {/* Screen - Retina Display */}
              <div className="bg-black rounded-xl overflow-hidden h-[26rem] sm:h-[30rem] md:h-[34rem] w-[40rem] sm:w-[46rem] md:w-[52rem] relative border border-gray-800">
                {laptopScreenImage ? (
                  /* Image Content */
                  <img 
                    src={laptopScreenImage} 
                    alt="Palabreo MacBook Screen" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  /* Native macOS Design */
                  <div className="bg-gradient-to-b from-gray-50 to-white h-full rounded-xl overflow-hidden">
                    {/* macOS Safari Browser */}
                    <div className="bg-gradient-to-b from-gray-100 to-gray-50 px-4 py-3 flex items-center space-x-3 border-b border-gray-200/50">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm hover:bg-yellow-600 transition-colors"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm hover:bg-green-600 transition-colors"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-600 shadow-inner border border-gray-200/50">
                        <span className="text-gray-400">🔒</span> palabreo.com
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                          <span className="text-gray-600 text-sm">←</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                          <span className="text-gray-600 text-sm">→</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Twitter/X Style Interface - Light Mode */}
                    <div className="h-full overflow-hidden bg-white">
                      {/* Twitter-like Header */}
                      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">P</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Palabreo</h1>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
                              Escribir
                            </button>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Twitter-like Layout */}
                      <div className="flex h-full">
                        {/* Left Sidebar - Twitter Style Light */}
                        <div className="w-64 bg-white border-r border-gray-200 p-4">
                          <nav className="space-y-2">
                            <a href="#" className="flex items-center space-x-3 px-3 py-3 rounded-full hover:bg-gray-100 text-gray-900">
                              <span className="text-xl">🏠</span>
                              <span className="text-xl font-semibold">Inicio</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-3 py-3 rounded-full hover:bg-gray-100 text-gray-600">
                              <span className="text-xl">🔍</span>
                              <span className="text-xl">Explorar</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-3 py-3 rounded-full hover:bg-gray-100 text-gray-600">
                              <span className="text-xl">📝</span>
                              <span className="text-xl">Mis Historias</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-3 py-3 rounded-full hover:bg-gray-100 text-gray-600">
                              <span className="text-xl">❤️</span>
                              <span className="text-xl">Me Gusta</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-3 py-3 rounded-full hover:bg-gray-100 text-gray-600">
                              <span className="text-xl">👤</span>
                              <span className="text-xl">Perfil</span>
                            </a>
                          </nav>
                        </div>

                        {/* Main Feed - Twitter Style Light */}
                        <div className="flex-1 border-r border-gray-200 bg-white">
                          <div className="p-4 space-y-4">
                            {/* Tweet-like Post */}
                            <div className="border-b border-gray-200 pb-4 hover:bg-gray-50 px-4 py-3 transition-colors">
                              <div className="flex space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  M
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-bold text-gray-900">María González</span>
                                    <span className="text-gray-500">@maria_poeta</span>
                                    <span className="text-gray-500">·</span>
                                    <span className="text-gray-500">2h</span>
                                  </div>
                                  <p className="text-gray-900 mb-3 leading-relaxed">
                                    Entre versos y silencios, encuentro mi verdad más pura. La poesía es mi hogar. 🌙✨
                                    <br/><br/>
                                    Nuevo poema disponible en mi colección "Susurros del Alma"
                                  </p>
                                  <div className="flex items-center justify-between text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                                      <span>💬</span><span>12</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                                      <span>🔄</span><span>5</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-red-600 transition-colors">
                                      <span>❤️</span><span>47</span>
                                    </button>
                                    <button className="hover:text-blue-600 transition-colors">
                                      <span>📤</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Newsletter-style Post */}
                            <div className="border-b border-gray-200 pb-4 hover:bg-gray-50 px-4 py-3 transition-colors">
                              <div className="flex space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  J
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-bold text-gray-900">Javier Ruiz</span>
                                    <span className="text-gray-500">@javi_tech</span>
                                    <span className="text-gray-500">·</span>
                                    <span className="text-gray-500">4h</span>
                                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">Newsletter</span>
                                  </div>
                                  <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight">
                                    El futuro de la narrativa digital
                                  </h3>
                                  <p className="text-gray-600 mb-3 leading-relaxed">
                                    Exploramos cómo la IA está transformando la manera en que contamos historias. 
                                    Un análisis profundo sobre las nuevas herramientas y plataformas...
                                  </p>
                                  <div className="bg-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                      <span>📖 8 min de lectura</span>
                                      <span>1,245 palabras</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                                      <span>💬</span><span>23</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                                      <span>🔄</span><span>8</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-red-600 transition-colors">
                                      <span>❤️</span><span>156</span>
                                    </button>
                                    <button className="hover:text-blue-600 transition-colors">
                                      <span>📤</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Sidebar - Trending Light */}
                        <div className="w-80 bg-gray-50 p-4">
                          <div className="bg-white rounded-2xl p-4 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Tendencias para ti</h3>
                            <div className="space-y-3">
                              <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                <p className="text-gray-500 text-sm">Tendencia en Escritura</p>
                                <p className="font-bold text-gray-900">#FicciónHistórica</p>
                                <p className="text-gray-500 text-sm">2,456 publicaciones</p>
                              </div>
                              <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                <p className="text-gray-500 text-sm">Tendencia en Literatura</p>
                                <p className="font-bold text-gray-900">#PoesíaUrbana</p>
                                <p className="text-gray-500 text-sm">1,892 publicaciones</p>
                              </div>
                              <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                <p className="text-gray-500 text-sm">Tendencia en Periodismo</p>
                                <p className="font-bold text-gray-900">#Newsletters</p>
                                <p className="text-gray-500 text-sm">1,234 publicaciones</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* MacBook Keyboard - Realistic */}
            <div className="bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-3xl h-8 mt-2 shadow-inner border-t border-gray-300/50"></div>
            {/* MacBook Base */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* iPhone 15 Pro Max - Native Design with Dynamic Island */}
        <div className="absolute right-2 sm:right-4 md:right-6 top-16 sm:top-20 md:top-24 transform scale-90 sm:scale-95 md:scale-105 z-20">
          {/* iPhone Frame - Titanium Space Black */}
          <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-1 shadow-2xl border border-gray-600/30">
            <div className="bg-black rounded-3xl p-1">
              {/* iPhone Screen - Much Wider for iPhone 15 Pro Max */}
              <div className="bg-black rounded-3xl overflow-hidden h-[32rem] sm:h-[36rem] md:h-[40rem] w-72 sm:w-80 md:w-88 relative">
                {mobileScreenImage ? (
                  /* Image Content */
                  <img 
                    src={mobileScreenImage} 
                    alt="Palabreo iPhone Screen" 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  /* Native iOS Design with Dynamic Island - Light Mode */
                  <div className="bg-white h-full rounded-3xl overflow-hidden relative">
                    {/* Dynamic Island - Smaller */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-black rounded-full px-4 py-1.5 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-xs font-medium">Palabreo</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* iOS Status Bar with Dynamic Island Space - Light */}
                    <div className="bg-white px-8 pt-12 pb-3 flex justify-between items-center">
                      <span className="text-base font-medium text-black">9:41</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                        </div>
                        <div className="w-7 h-4 border border-black rounded-sm">
                          <div className="bg-green-500 h-full w-4/5 rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Instagram-style App Header - Light */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">P</span>
                          </div>
                          <h1 className="text-2xl font-bold text-gray-900">Palabreo</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="text-gray-900">
                            <span className="text-2xl">💌</span>
                          </button>
                          <button className="text-gray-900">
                            <span className="text-2xl">📤</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instagram/TikTok Style Feed - Light Mode */}
                    <div className="flex-1 bg-white overflow-y-auto">
                      <div className="space-y-0">
                        {/* Story-style Post */}
                        <div className="bg-white px-4 py-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-purple-400">
                              M
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">maria_poeta</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500 text-sm">2h</span>
                              </div>
                              <span className="text-gray-600 text-sm">Poetisa • Madrid</span>
                            </div>
                            <button className="text-gray-900">
                              <span className="text-xl">⋯</span>
                            </button>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-900 leading-relaxed">
                              Entre versos y silencios, encuentro mi verdad más pura. La poesía es mi hogar. 🌙✨
                            </p>
                            <div className="mt-2">
                              <span className="text-blue-600">#PoesíaUrbana</span> <span className="text-blue-600">#Versos</span> <span className="text-blue-600">#Literatura</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-6">
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">🤍</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">💬</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">📤</span>
                              </button>
                            </div>
                            <button className="text-gray-900">
                              <span className="text-2xl">🔖</span>
                            </button>
                          </div>
                          
                          <div className="text-gray-900 text-sm">
                            <span className="font-semibold">47 me gusta</span>
                          </div>
                          
                          <div className="mt-2 text-gray-600 text-sm">
                            Ver los 12 comentarios
                          </div>
                        </div>

                        {/* Newsletter-style Post */}
                        <div className="bg-white px-4 py-4 border-t border-gray-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              J
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">javi_tech</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500 text-sm">4h</span>
                              </div>
                              <span className="text-gray-600 text-sm">Tech Writer • Newsletter</span>
                            </div>
                            <button className="text-gray-900">
                              <span className="text-xl">⋯</span>
                            </button>
                          </div>
                          
                          <div className="mb-3">
                            <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                              El futuro de la narrativa digital
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-3">
                              Exploramos cómo la IA está transformando la manera en que contamos historias. Un análisis profundo sobre las nuevas herramientas...
                            </p>
                            
                            <div className="bg-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>📖 8 min lectura</span>
                                <span>1,245 palabras</span>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <span className="text-blue-600">#TechWriting</span> <span className="text-blue-600">#IA</span> <span className="text-blue-600">#Narrativa</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-6">
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">🤍</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">💬</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-900">
                                <span className="text-2xl">📤</span>
                              </button>
                            </div>
                            <button className="text-gray-900">
                              <span className="text-2xl">🔖</span>
                            </button>
                          </div>
                          
                          <div className="text-gray-900 text-sm">
                            <span className="font-semibold">156 me gusta</span>
                          </div>
                          
                          <div className="mt-2 text-gray-600 text-sm">
                            Ver los 23 comentarios
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instagram-style Tab Bar - Light */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
                      <div className="flex justify-around items-center">
                        <button className="flex flex-col items-center py-2">
                          <span className="text-gray-900 text-2xl">🏠</span>
                        </button>
                        <button className="flex flex-col items-center py-2">
                          <span className="text-gray-500 text-2xl">🔍</span>
                        </button>
                        <button className="flex flex-col items-center py-2">
                          <span className="text-gray-500 text-2xl">➕</span>
                        </button>
                        <button className="flex flex-col items-center py-2">
                          <span className="text-gray-500 text-2xl">❤️</span>
                        </button>
                        <button className="flex flex-col items-center py-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border border-gray-300"></div>
                        </button>
                      </div>
                      {/* iOS Home Indicator - Light */}
                      <div className="flex justify-center mt-3 mb-1">
                        <div className="w-36 h-1 bg-black rounded-full opacity-40"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements - More Elegant */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-48 h-48 bg-primary/8 rounded-full blur-3xl animate-pulse-gentle"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/6 rounded-full blur-3xl animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Feature Highlights - Ultra Compact */}
      <div className="mt-6 sm:mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 text-center">
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📝</div>
          <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Formato Tweet</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Pensamientos rápidos y reflexiones instantáneas</p>
        </div>
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📖</div>
          <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Artículos Largos</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Ensayos y análisis profundos con formato completo</p>
        </div>
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔄</div>
          <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Repost & Cita</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Comparte y comenta contenido de otros</p>
        </div>
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔍</div>
          <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Descubre</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Encuentra nuevos escritores y contenido</p>
        </div>
      </div>
    </div>
  )
}