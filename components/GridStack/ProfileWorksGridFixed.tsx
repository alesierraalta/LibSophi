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
    if (!gridRef.current) return;

    // Initialize GridStack
    gridStackRef.current = GridStack.init({
      cellHeight: 100,
      column: 12,
      margin: 8,
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
  }, [works]);

  useEffect(() => {
    if (gridStackRef.current) {
      gridStackRef.current.setStatic(!isEditMode);
    }
  }, [isEditMode]);

  const loadWorksIntoGrid = () => {
    if (!gridStackRef.current) return;

    // Clear existing widgets
    gridStackRef.current.removeAll(false);

    works.forEach((work, index) => {
      // Check if we have saved layout for this work
      const savedItem = savedLayout.find(item => item.id === work.id);
      
      // Default position if no saved layout
      const defaultPos = {
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 3,
        w: 4,
        h: 3,
      };

      const position = savedItem || defaultPos;

      const widget = createWorkWidget(work, position);
      gridStackRef.current!.addWidget(widget);
    });
  };

  const createWorkWidget = (work: WorkType, position?: { x: number; y: number; w: number; h: number }) => {
    const widget = document.createElement('div');
    widget.className = 'grid-stack-item';
    widget.setAttribute('data-work-id', work.id);
    
    // Set position attributes if provided
    if (position) {
      widget.setAttribute('gs-x', position.x.toString());
      widget.setAttribute('gs-y', position.y.toString());
      widget.setAttribute('gs-w', position.w.toString());
      widget.setAttribute('gs-h', position.h.toString());
      widget.setAttribute('gs-id', work.id);
    }

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    const statusColor = work.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    const statusText = work.published ? 'Publicado' : 'Borrador';

    // Create cover image URL (using placeholder for now)
    const coverImage = `https://images.unsplash.com/photo-${work.id === '1' ? '1544620347-c4fd4a3d5957' : work.id === '2' ? '1506905925346-21bda4d32df4' : '1558618666-fcd25c85cd64'}?w=640&h=360&fit=crop`;

    content.innerHTML = `
      <div class="h-full bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
        ${isEditMode ? `
          <div class="drag-handle bg-gray-100 p-2 cursor-move border-b flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="relative h-32 w-full">
          <img src="${coverImage}" alt="${work.title}" class="absolute inset-0 w-full h-full object-cover"/>
          <div class="absolute top-2 right-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
              ${statusText}
            </span>
          </div>
        </div>
        
        <div class="p-4 flex flex-col flex-1">
          <!-- Header -->
          <div class="flex-shrink-0 mb-2">
            <h3 class="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
              ${work.title}
            </h3>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">${work.genre}</span>
              <span class="text-xs text-gray-400">${dateUtils.formatReadingTime(work.reading_time)}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 mb-2">
            <p class="text-xs text-gray-600 leading-relaxed line-clamp-3">
              ${work.description}
            </p>
          </div>

          <!-- Footer Stats -->
          <div class="flex-shrink-0 pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center space-x-3">
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  ${work.views.toLocaleString()}
                </span>
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  ${work.likes.toLocaleString()}
                </span>
              </div>
              <span class="text-xs">${dateUtils.formatForPost(work.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append content to widget
    widget.appendChild(content);

    // Add click handler
    content.addEventListener('click', (e) => {
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
  };

  const saveLayout = () => {
    if (gridStackRef.current) {
      const layout = gridStackRef.current.save();
      if (onLayoutChange && Array.isArray(layout)) {
        onLayoutChange(layout);
      }
      setIsEditMode(false);
    }
  };

  const resetLayout = () => {
    if (gridStackRef.current) {
      loadWorksIntoGrid();
    }
  };

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
                Modo Edición
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
                  Guardar
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
        className={`rounded-lg ${isEditMode ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'bg-gray-50'} p-4 min-h-[400px]`}
      >
        {isEditMode && (
          <div className="mb-4 text-center">
            <p className="text-sm text-blue-600 font-medium">
              🎯 Arrastra las publicaciones para reorganizarlas
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Usa el ícono de puntos para arrastrar cada tarjeta
            </p>
          </div>
        )}
        
        <div
          ref={gridRef}
          className="grid-stack"
          style={{ minHeight: '300px' }}
        />
      </motion.div>

      {/* Empty State */}
      {works.length === 0 && (
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
          <div className="mt-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
              Crear Nueva Obra
            </button>
          </div>
        </motion.div>
      )}

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
                Personaliza tu perfil
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Haz clic en "Reorganizar" para poder arrastrar y reordenar tus publicaciones como más te guste.
                  Tus visitantes verán las publicaciones en el orden que elijas.
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
