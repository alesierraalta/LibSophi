'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GridStack, GridStackWidget } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { motion } from 'framer-motion';
import { WorkType } from '@/lib/validations';
import { dateUtils } from '@/lib/date-utils';
import { fadeInUp } from '@/lib/animations';

interface ProfileWorksGridProps {
  works: WorkType[];
  onWorkClick?: (work: WorkType) => void;
  onLayoutChange?: (layout: any[]) => void;
  editable?: boolean;
  savedLayout?: any[];
}

// Mock cover images based on genre
const getCoverImage = (work: WorkType) => {
  const imageMap: Record<string, string> = {
    'Novela': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop',
    'Poesía': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
    'Relato': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop',
    'Ensayo': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&h=360&fit=crop',
    'Crónica': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop',
    'Cuento': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&h=360&fit=crop',
    'Ficción Científica': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=640&h=360&fit=crop'
  };
  return imageMap[work.genre] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640&h=360&fit=crop';
};

export function ProfileWorksGrid({
  works,
  onWorkClick,
  onLayoutChange,
  editable = false,
  savedLayout = []
}: ProfileWorksGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridStackRef = useRef<GridStack | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!gridRef.current || works.length === 0) return;

    // Initialize GridStack
    gridStackRef.current = GridStack.init({
      cellHeight: 120,
      column: 12,
      margin: 12,
      minRow: 1,
      animate: true,
      resizable: {
        handles: 'se',
      },
      draggable: {
        handle: '.drag-handle',
        scroll: true,
      },
      staticGrid: !isEditMode,
      float: false,
      acceptWidgets: false,
    }, gridRef.current);

    // Handle layout changes
    gridStackRef.current.on('change', (event, items) => {
      if (items && onLayoutChange && isEditMode) {
        onLayoutChange(items);
      }
    });

    // Load works into grid
    loadWorksIntoGrid();

    return () => {
      if (gridStackRef.current) {
        gridStackRef.current.destroy(false);
      }
    };
  }, [works, isEditMode]);

  const loadWorksIntoGrid = () => {
    if (!gridStackRef.current) return;

    // Clear existing widgets
    gridStackRef.current.removeAll(false);

    works.forEach((work, index) => {
      // Check if we have saved layout for this work
      const savedItem = savedLayout.find(item => item.id === work.id);
      
      // Default position if no saved layout - responsive grid
      const defaultPos = {
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 4,
      };

      const position = savedItem || defaultPos;

      const widget = createWorkWidget(work);
      gridStackRef.current!.addWidget(widget, {
        ...position,
        id: work.id,
      });
    });
  };

  const createWorkWidget = (work: WorkType) => {
    const widget = document.createElement('div');
    widget.className = 'grid-stack-item-content';
    widget.setAttribute('data-work-id', work.id);

    const coverImage = getCoverImage(work);

    widget.innerHTML = `
      <div class="h-full bg-white border border-gray-200 rounded-lg overflow-hidden relative hover:shadow-lg transition-all duration-200 cursor-pointer">
        ${isEditMode ? `
          <div class="drag-handle absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-2 cursor-move rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
        ` : ''}
        
        <!-- Cover Image -->
        <div class="relative h-48 sm:h-56 lg:h-64 w-full">
          <img src="${coverImage}" alt="${work.title}" class="absolute inset-0 w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <!-- Content -->
        <div class="p-3">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="min-w-0 flex-1">
              <h3 class="text-base font-semibold text-gray-900 truncate leading-tight">
                ${work.title}
              </h3>
              <div class="text-sm text-gray-600 mt-1">
                ${work.genre} · ${work.views.toLocaleString()} lecturas
              </div>
            </div>
          </div>
          
          <p class="text-sm text-gray-700 line-clamp-2 mb-3">
            ${work.description}
          </p>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-3">
              <span class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                ${work.likes.toLocaleString()}
              </span>
              <span class="${work.published ? 'text-green-600' : 'text-yellow-600'}">
                ${work.published ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <span>${dateUtils.formatForPost(work.created_at)}</span>
          </div>
        </div>
      </div>
    `;

    // Add click handler
    widget.addEventListener('click', (e) => {
      // Don't trigger click when dragging
      if (isEditMode && (e.target as HTMLElement).closest('.drag-handle')) {
        return;
      }
      if (onWorkClick) {
        onWorkClick(work);
      }
    });

    return widget;
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // Reload grid to show/hide drag handles
    setTimeout(() => {
      if (gridStackRef.current) {
        loadWorksIntoGrid();
      }
    }, 100);
  };

  const saveLayout = () => {
    if (gridStackRef.current) {
      const layout = gridStackRef.current.save();
      if (onLayoutChange) {
        onLayoutChange(layout);
      }
      setIsEditMode(false);
      // Reload grid to hide drag handles
      setTimeout(() => {
        loadWorksIntoGrid();
      }, 100);
    }
  };

  const resetLayout = () => {
    if (gridStackRef.current) {
      loadWorksIntoGrid();
    }
  };

  // Fallback to regular grid if no GridStack
  if (!works.length) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center py-12 bg-white rounded-lg shadow-sm border"
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay publicaciones
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando tu primera obra literaria
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {editable && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-gray-900">Mis Publicaciones</h3>
            {isEditMode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Modo Edición - Arrastra para reorganizar
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <button
                  onClick={resetLayout}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Restablecer
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveLayout}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Guardar Layout
                </button>
              </>
            ) : (
              <button
                onClick={toggleEditMode}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Reorganizar</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Grid Container */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={`rounded-lg p-4 min-h-[400px] ${isEditMode ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'bg-gray-50'}`}
      >
        {isEditMode && (
          <div className="mb-4 text-center">
            <p className="text-sm text-blue-600 font-medium">
              🎯 Arrastra las publicaciones para reorganizarlas
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Usa el ícono circular en la esquina superior izquierda de cada tarjeta
            </p>
          </div>
        )}
        
        <div
          ref={gridRef}
          className="grid-stack"
          style={{ minHeight: '300px' }}
        />
      </motion.div>

      {/* Instructions */}
      {works.length > 0 && !isEditMode && editable && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ✨ Personaliza tu perfil con GridStack.js
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Haz clic en "Reorganizar" para activar el modo de edición y poder arrastrar tus publicaciones.
                  Tus visitantes verán las publicaciones en el orden que elijas. El layout se guarda automáticamente.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ProfileWorksGrid;
