'use client'

import React, { useState } from 'react'

export default function InteractiveDemo() {
  const [content, setContent] = useState(`Érase una vez en un pequeño pueblo...

Escribe aquí tu historia y ve cómo se vería en InkFusion. 

✨ Prueba escribir algo sobre:
• Una aventura inesperada
• Un encuentro mágico  
• Un misterio por resolver

¡Tu creatividad no tiene límites!`)

  const [title, setTitle] = useState('Mi Primera Historia')
  const [genre, setGenre] = useState('Fantasía')

  const wordCount = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">IF</span>
            </div>
            <span className="font-medium">Editor InkFusion</span>
          </div>
          <div className="text-sm opacity-90">
            Demo interactivo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        {/* Editor Panel */}
        <div className="p-6 border-r border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de tu historia
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Escribe el título..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Fantasía">Fantasía</option>
              <option value="Romance">Romance</option>
              <option value="Misterio">Misterio</option>
              <option value="Ciencia Ficción">Ciencia Ficción</option>
              <option value="Drama">Drama</option>
              <option value="Aventura">Aventura</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escribe tu historia
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Empieza a escribir tu historia aquí..."
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>{wordCount} palabras</span>
            <span>~{readingTime} min de lectura</span>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-6 shadow-sm h-full">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {genre}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>📖 {wordCount} palabras</span>
                <span>⏱️ {readingTime} min</span>
                <span>👁️ 0 vistas</span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                    <span>❤️</span>
                    <span className="text-sm">0</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                    <span>💬</span>
                    <span className="text-sm">0</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                    <span>🔗</span>
                    <span className="text-sm">Compartir</span>
                  </button>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-6 py-4">
        <p className="text-sm text-gray-600 text-center">
          ✨ <strong>Esto es solo una demo.</strong> En InkFusion real tendrás herramientas avanzadas de formato, 
          colaboración en tiempo real, y feedback de la comunidad.
        </p>
      </div>
    </div>
  )
}