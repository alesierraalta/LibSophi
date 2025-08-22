'use client'

import React, { useState } from 'react'

export default function InteractiveDemo() {
  const [content, setContent] = useState(`Érase una vez en un pequeño pueblo llamado Esperanza...

En las montañas de los Andes, donde las nubes besan los picos nevados, vivía una joven llamada Luna que tenía el don de escuchar los susurros del viento. Cada mañana, al despertar, el aire le traía historias de lugares lejanos y secretos antiguos.

Un día, el viento le susurró sobre un misterioso libro perdido en la biblioteca del pueblo, un libro que podía cambiar el destino de quien lo leyera. Luna sabía que tenía que encontrarlo...

✨ Continúa la historia o escribe la tuya propia:
• ¿Qué secretos esconde el libro misterioso?
• ¿Cómo cambiaría la vida de Luna?
• ¿Qué otros poderes ocultos tiene?

¡Tu creatividad puede llevar esta historia a lugares increíbles!`)

  const [title, setTitle] = useState('Los Susurros del Viento')
  const [genre, setGenre] = useState('Fantasía')
  const [author, setAuthor] = useState('Tu Nombre')
  const [tags, setTags] = useState(['fantasía', 'aventura', 'misterio'])
  const wordCount = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)
  const characterCount = content.length

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto mx-1 sm:mx-2 md:mx-auto transform hover:scale-[1.02] transition-all duration-300">
      <div className="bg-gradient-to-r from-primary via-red-500 to-secondary p-4 md:p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm md:text-base font-bold">PB</span>
            </div>
            <div>
              <span className="font-semibold text-base md:text-lg block">Editor Palabreo Pro</span>
              <span className="text-xs md:text-sm opacity-80">Versión completa simulada</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm md:text-base font-semibold">Demo Interactivo</div>
            <div className="text-xs opacity-80">Prueba todas las funciones</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
        {/* Editor Panel */}
        <div className="p-4 sm:p-6 md:p-8 border-r border-gray-200 lg:border-r lg:border-b-0 border-b lg:border-b-0 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-6">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                📖 Título de tu historia
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base touch-manipulation shadow-sm hover:shadow-md transition-shadow"
                placeholder="Escribe el título..."
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                ✍️ Tu nombre de autor
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base touch-manipulation shadow-sm hover:shadow-md transition-shadow"
                placeholder="Tu nombre..."
              />
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              🎭 Género literario
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base touch-manipulation shadow-sm hover:shadow-md transition-shadow"
            >
              <option value="Fantasía">🧙‍♀️ Fantasía</option>
              <option value="Romance">💕 Romance</option>
              <option value="Misterio">🔍 Misterio</option>
              <option value="Ciencia Ficción">🚀 Ciencia Ficción</option>
              <option value="Drama">🎭 Drama</option>
              <option value="Aventura">⚔️ Aventura</option>
              <option value="Terror">👻 Terror</option>
              <option value="Histórico">🏛️ Histórico</option>
            </select>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              📝 Escribe tu historia
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 sm:h-48 md:h-56 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm md:text-base touch-manipulation shadow-sm hover:shadow-md transition-all font-serif leading-relaxed"
              placeholder="Empieza a escribir tu historia aquí... Deja volar tu imaginación..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg md:text-xl font-bold text-primary">{wordCount}</div>
              <div className="text-xs md:text-sm text-gray-500">Palabras</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg md:text-xl font-bold text-secondary">{characterCount}</div>
              <div className="text-xs md:text-sm text-gray-500">Caracteres</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg md:text-xl font-bold text-primary">~{readingTime}</div>
              <div className="text-xs md:text-sm text-gray-500">Min lectura</div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg h-full border border-gray-100">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">{title}</h3>
                  <p className="text-sm md:text-base text-gray-600">por <span className="font-semibold text-primary">{author}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-full shadow-sm">
                    {genre}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    📝 Borrador
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-1">
                  <span>📖</span>
                  <span>{wordCount} palabras</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span>{readingTime} min lectura</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📝</span>
                  <span>Borrador</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🕐</span>
                  <span>Guardado hace unos minutos</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose prose-sm max-w-none overflow-y-auto max-h-40 sm:max-h-48 md:max-h-56 mb-6">
              <div className="font-serif text-gray-800 leading-relaxed">
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 md:mb-4 text-sm md:text-base leading-relaxed">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-6">


                {/* Publishing Options */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚙️</span>
                    Opciones de publicación
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked />
                      <span className="text-sm text-gray-700">Permitir comentarios</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked />
                      <span className="text-sm text-gray-700">Notificar a seguidores</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                      <span className="text-sm text-gray-700">Programar publicación</span>
                    </label>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all touch-manipulation text-sm border border-blue-200 hover:border-blue-300">
                    <span>👁️</span>
                    <span>Vista previa</span>
                  </button>
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-all touch-manipulation text-sm border border-green-200 hover:border-green-300">
                    <span>📤</span>
                    <span>Compartir borrador</span>
                  </button>
                  <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all touch-manipulation text-sm border border-purple-200 hover:border-purple-300">
                    <span>🔗</span>
                    <span>Copiar enlace</span>
                  </button>
                </div>
                
                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold touch-manipulation border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                    <span className="text-lg">💾</span>
                    <span>Guardar borrador</span>
                  </button>
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-primary via-red-500 to-secondary text-white rounded-xl hover:from-red-600 hover:via-red-600 hover:to-red-700 transition-all text-sm font-semibold touch-manipulation shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                    <span className="text-lg">🚀</span>
                    <span>Publicar ahora</span>
                  </button>
                </div>

                {/* Publishing Tips */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-lg">💡</span>
                    <div>
                      <p className="text-xs text-yellow-800 font-medium mb-1">Tip para mejor alcance:</p>
                      <p className="text-xs text-yellow-700">Las historias publicadas entre 7-9 PM tienen 40% más engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 px-6 md:px-8 py-4 md:py-6">
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-700 mb-3 leading-relaxed">
            ✨ <strong>Esta es una simulación del flujo de escritura.</strong> En Palabreo real tendrás:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span className="text-lg">🛠️</span>
              <span>Editor avanzado con formato rico</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span className="text-lg">👥</span>
              <span>Comunidad real de lectores</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span className="text-lg">📊</span>
              <span>Estadísticas reales tras publicar</span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-primary font-medium">
            🚀 ¡Únete como miembro fundador y vive la experiencia completa!
          </p>
        </div>
      </div>
    </div>
  )
}