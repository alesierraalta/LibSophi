'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import ProfileWorksGrid from '@/components/GridStack/ProfileWorksGridFixed';
import { WorkType } from '@/lib/validations';

// Mock data for demonstration
const mockWorks: WorkType[] = [
  {
    id: '1',
    title: 'El Jardín de los Senderos que se Bifurcan',
    description: 'Una historia sobre realidades paralelas y decisiones infinitas que nos llevan por caminos inesperados.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Ficción Científica',
    tags: ['ciencia ficción', 'filosofía', 'tiempo'],
    published: true,
    reading_time: 15,
    views: 15,
    likes: 2,
    comments_count: 3,
    reposts_count: 1,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Reflexiones sobre la Escritura Moderna',
    description: 'Un ensayo profundo sobre las tendencias actuales en literatura y su impacto en la sociedad.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-2',
    genre: 'Ensayo',
    tags: ['literatura', 'crítica', 'modernidad'],
    published: false,
    reading_time: 8,
    views: 4,
    likes: 1,
    comments_count: 2,
    reposts_count: 0,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-05'),
  },
  {
    id: '3',
    title: 'Poemas de Medianoche',
    description: 'Una colección íntima de versos escritos en las horas más silenciosas de la noche.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Poesía',
    tags: ['poesía', 'noche', 'introspección'],
    published: true,
    reading_time: 12,
    views: 8,
    likes: 3,
    comments_count: 1,
    reposts_count: 2,
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-28'),
  },
  {
    id: '4',
    title: 'Crónicas de un Viajero',
    description: 'Relatos de aventuras y encuentros inesperados en tierras lejanas y culturas fascinantes.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Crónica',
    tags: ['viajes', 'aventura', 'culturas'],
    published: true,
    reading_time: 20,
    views: 12,
    likes: 5,
    comments_count: 4,
    reposts_count: 1,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: '5',
    title: 'El Arte de la Narrativa Digital',
    description: 'Explorando las nuevas formas de contar historias en la era digital y sus posibilidades infinitas.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Ensayo',
    tags: ['narrativa', 'digital', 'tecnología'],
    published: false,
    reading_time: 18,
    views: 3,
    likes: 0,
    comments_count: 0,
    reposts_count: 0,
    created_at: new Date('2024-02-08'),
    updated_at: new Date('2024-02-10'),
  },
  {
    id: '6',
    title: 'Susurros del Bosque',
    description: 'Un cuento mágico sobre una niña que puede escuchar los secretos que guardan los árboles milenarios.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Cuento',
    tags: ['fantasía', 'naturaleza', 'magia'],
    published: true,
    reading_time: 10,
    views: 5,
    likes: 1,
    comments_count: 1,
    reposts_count: 0,
    created_at: new Date('2024-02-12'),
    updated_at: new Date('2024-02-14'),
  },
];

export default function GridStackDemoPage() {
  const [savedLayout, setSavedLayout] = useState<any[]>([]);

  const handleWorkClick = (work: WorkType) => {
    alert(`Clicked on: ${work.title}\n\nDescription: ${work.description}\n\nGenre: ${work.genre}`);
  };

  const handleLayoutChange = (layout: any[]) => {
    console.log('Layout changed:', layout);
    setSavedLayout(layout);
    
    // Simulate saving to backend
    try {
      localStorage.setItem('gridstack-demo-layout', JSON.stringify(layout));
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  // Load saved layout on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('gridstack-demo-layout');
      if (saved) {
        setSavedLayout(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved layout:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GridStack.js Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Demostración de GridStack.js integrado con React. Arrastra y reorganiza las publicaciones 
              como más te guste. El layout se guarda automáticamente.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Instructions */}
          <motion.div
            variants={staggerItem}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ¿Cómo usar GridStack?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Haz clic en "Reorganizar" para activar el modo de edición</li>
                    <li>Arrastra las tarjetas usando el ícono de puntos que aparece al pasar el mouse</li>
                    <li>Redimensiona las tarjetas arrastrando desde la esquina inferior derecha</li>
                    <li>Haz clic en "Guardar" para guardar tu layout personalizado</li>
                    <li>El layout se guarda automáticamente en localStorage</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">{mockWorks.length}</div>
              <div className="text-sm text-gray-500">Obras Totales</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockWorks.filter(w => w.published).length}
              </div>
              <div className="text-sm text-gray-500">Publicadas</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockWorks.reduce((acc, w) => acc + w.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Vistas Totales</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockWorks.reduce((acc, w) => acc + w.likes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Me Gusta</div>
            </div>
          </motion.div>

          {/* GridStack Component */}
          <motion.div variants={staggerItem}>
            <ProfileWorksGrid
              works={mockWorks}
              onWorkClick={handleWorkClick}
              onLayoutChange={handleLayoutChange}
              editable={true}
              savedLayout={savedLayout}
            />
          </motion.div>

          {/* Features */}
          <motion.div variants={staggerItem} className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Características de GridStack.js
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Drag & Drop</h3>
                  <p className="text-sm text-gray-500">Arrastra elementos para reorganizarlos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m0 0V1m0 2h2m6 0h2m0 0V1m0 2v2a1 1 0 001 1h4v4m-1 0V6a1 1 0 00-1-1h-4m0 0H9m0 0V4a1 1 0 00-1-1H4v4m5 0v6m0 0v4a1 1 0 001 1h4m0 0v2m0-2h2m6 0h2m0 0v2m0-2v-2a1 1 0 00-1-1h-4m0 0H9m0 0v-4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Redimensionable</h3>
                  <p className="text-sm text-gray-500">Cambia el tamaño de los elementos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Responsive</h3>
                  <p className="text-sm text-gray-500">Se adapta a diferentes tamaños de pantalla</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Persistente</h3>
                  <p className="text-sm text-gray-500">Guarda el layout automáticamente</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Animaciones</h3>
                  <p className="text-sm text-gray-500">Transiciones suaves y elegantes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Personalizable</h3>
                  <p className="text-sm text-gray-500">Totalmente configurable y estilizable</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
