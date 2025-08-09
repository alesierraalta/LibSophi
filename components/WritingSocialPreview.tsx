'use client'

import React from 'react'

interface WritingSocialPreviewProps {
  laptopScreenImage?: string;
  mobileScreenImage?: string;
  laptopDeviceImage?: string;
}

export default function WritingSocialPreview({ 
  laptopScreenImage, 
  mobileScreenImage,
  laptopDeviceImage,
}: WritingSocialPreviewProps = {}) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 py-0">
      {/* Devices Container */}
      <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[360px] md:min-h-[420px] pb-6 sm:pb-8 md:pb-10">
        
        {/* MacBook - Use provided device image if available, else render native mock */}
        <div className="relative z-10 -ml-6 sm:-ml-10 md:-ml-12 transform scale-95 sm:scale-110 md:scale-125">
          {laptopDeviceImage ? (
            <img
              src={laptopDeviceImage}
              alt="Palabreo MacBook Mock"
              className="w-[46rem] sm:w-[56rem] md:w-[64rem] h-auto object-contain"
            />
          ) : (
            <div className="bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-3xl p-6 shadow-2xl border border-gray-300/50">
              <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl p-2 shadow-inner">
                <div className="bg-black rounded-xl overflow-hidden h-[26rem] sm:h-[30rem] md:h-[34rem] w-[40rem] sm:w-[46rem] md:w-[52rem] relative border border-gray-800">
                  {laptopScreenImage ? (
                    <img src={laptopScreenImage} alt="Palabreo MacBook Screen" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="bg-gradient-to-b from-gray-50 to-white h-full rounded-xl overflow-hidden">
                      {/* ... existing native laptop UI ... */}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-3xl h-8 mt-2 shadow-inner border-t border-gray-300/50"></div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg"></div>
            </div>
          )}
        </div>

        {/* iPhone 15 Pro Max - If image provided, render image only (no native frame) */}
        <div className="absolute right-0 sm:right-0 md:right-2 top-1/2 -translate-y-1/2 transform scale-110 sm:scale-125 md:scale-150 z-20">
          {mobileScreenImage ? (
            <img
              src={mobileScreenImage}
              alt="Palabreo iPhone Mock"
              className="h-[42rem] sm:h-[50rem] md:h-[56rem] w-[22rem] sm:w-[26rem] md:w-[30rem] object-contain"
            />
          ) : (
            <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-1 shadow-2xl border border-gray-600/30">
              <div className="bg-black rounded-3xl p-1">
                {/* iPhone Screen - Much Wider for iPhone 15 Pro Max */}
                <div className="bg-black rounded-3xl overflow-hidden h-[32rem] sm:h-[36rem] md:h-[40rem] w-72 sm:w-80 md:w-88 relative">
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background Elements minimized */}
        <div className="absolute inset-0 -z-10 pointer-events-none"></div>
      </div>

      {/* Removed feature highlights to reduce vertical space */}
    </div>
  )
}