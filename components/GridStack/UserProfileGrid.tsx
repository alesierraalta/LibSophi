'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GridStack, GridStackWidget } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkType } from '@/lib/validations';
import { dateUtils } from '@/lib/date-utils';
import { fadeInUp, cardHover } from '@/lib/animations';

interface UserProfileGridProps {
  works: WorkType[];
  onWorkClick?: (work: WorkType) => void;
  onLayoutChange?: (layout: GridStackWidget[]) => void;
  editable?: boolean;
  className?: string;
}

interface GridWorkItem extends WorkType {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function UserProfileGrid({
  works,
  onWorkClick,
  onLayoutChange,
  editable = false,
  className = '',
}: UserProfileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridStackRef = useRef<GridStack | null>(null);
  const [gridWorks, setGridWorks] = useState<GridWorkItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize grid works with default positions
  useEffect(() => {
    const initialGridWorks: GridWorkItem[] = works.map((work, index) => ({
      ...work,
      x: (index % 3) * 4, // 3 columns layout
      y: Math.floor(index / 3) * 3,
      w: 4, // Width in grid units
      h: 3, // Height in grid units
    }));
    setGridWorks(initialGridWorks);
  }, [works]);

  // Initialize GridStack
  useEffect(() => {
    if (!gridRef.current || isInitialized) return;

    gridStackRef.current = GridStack.init({
      cellHeight: 80,
      column: 12,
      margin: 10,
      minRow: 1,
      animate: true,
      resizable: {
        handles: 'se, sw, ne, nw',
      },
      draggable: {
        handle: '.drag-handle',
      },
      acceptWidgets: true,
      removable: false,
      float: false,
      staticGrid: !editable,
    }, gridRef.current);

    // Handle layout changes
    gridStackRef.current.on('change', (event, items) => {
      if (items && onLayoutChange) {
        onLayoutChange(items);
      }
    });

    setIsInitialized(true);

    return () => {
      if (gridStackRef.current) {
        gridStackRef.current.destroy(false);
        gridStackRef.current = null;
      }
    };
  }, [editable, onLayoutChange, isInitialized]);

  // Update grid when works change
  useEffect(() => {
    if (!gridStackRef.current || !isInitialized) return;

    // Clear existing widgets
    gridStackRef.current.removeAll(false);

    // Add new widgets
    gridWorks.forEach((work) => {
      const widgetEl = createWorkWidget(work);
      gridStackRef.current!.addWidget(widgetEl, {
        x: work.x,
        y: work.y,
        w: work.w,
        h: work.h,
        id: work.id,
      });
    });
  }, [gridWorks, isInitialized]);

  const createWorkWidget = (work: GridWorkItem): HTMLElement => {
    const widget = document.createElement('div');
    widget.className = 'grid-stack-item-content bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden';
    widget.setAttribute('data-work-id', work.id);
    
    // Add click handler
    widget.addEventListener('click', () => {
      if (onWorkClick) {
        onWorkClick(work);
      }
    });

    widget.innerHTML = `
      <div class="h-full flex flex-col">
        ${editable ? `
          <div class="drag-handle bg-gray-100 p-2 cursor-move border-b flex items-center justify-center">
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
        
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">${work.title}</h3>
            <p class="text-xs text-gray-600 line-clamp-3 mb-3">${work.description}</p>
          </div>
          
          <div class="mt-auto space-y-2">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${work.genre}</span>
              <span>${work.published ? 'Publicado' : 'Borrador'}</span>
            </div>
            
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
              <span>${dateUtils.formatForPost(work.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return widget;
  };

  const toggleEditMode = () => {
    if (gridStackRef.current) {
      const isStatic = gridStackRef.current.opts.staticGrid;
      gridStackRef.current.setStatic(!isStatic);
    }
  };

  const resetLayout = () => {
    if (gridStackRef.current) {
      // Reset to default positions
      const resetWorks = gridWorks.map((work, index) => ({
        ...work,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 3,
        w: 4,
        h: 3,
      }));
      setGridWorks(resetWorks);
    }
  };

  const saveLayout = () => {
    if (gridStackRef.current) {
      const layout = gridStackRef.current.save();
      console.log('Layout saved:', layout);
      // Here you would typically save to backend
      if (onLayoutChange) {
        onLayoutChange(layout);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {editable && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-gray-900">Organizar Publicaciones</h3>
            <span className="text-sm text-gray-500">
              Arrastra las publicaciones para reorganizarlas
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetLayout}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Restablecer
            </button>
            <button
              onClick={saveLayout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Guardar Layout
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid Container */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-gray-50 p-4 rounded-lg min-h-[400px]"
      >
        <div
          ref={gridRef}
          className="grid-stack"
          style={{ minHeight: '400px' }}
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
        </motion.div>
      )}

      {/* Stats */}
      {works.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-900">{works.length}</div>
            <div className="text-sm text-gray-500">Obras Totales</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {works.filter(w => w.published).length}
            </div>
            <div className="text-sm text-gray-500">Publicadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {works.reduce((acc, w) => acc + w.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Vistas Totales</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {works.reduce((acc, w) => acc + w.likes, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Me Gusta</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default UserProfileGrid;
