'use client';

import React, { useState, useEffect, useRef } from 'react';
import { dragAndDrop } from '@formkit/drag-and-drop';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface DragDropItem {
  id: string;
  content: React.ReactNode;
  data?: any;
}

interface DragDropListProps {
  items: DragDropItem[];
  onReorder?: (newItems: DragDropItem[]) => void;
  className?: string;
  itemClassName?: string;
  dragHandleClassName?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  showDragHandle?: boolean;
}

export function DragDropList({
  items,
  onReorder,
  className = '',
  itemClassName = '',
  dragHandleClassName = '',
  orientation = 'vertical',
  disabled = false,
  showDragHandle = true,
}: DragDropListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragDropInstance = useRef<any>(null);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    // Initialize FormKit drag and drop
    dragDropInstance.current = dragAndDrop({
      parent: containerRef.current,
      getValues: () => orderedItems.map(item => item.id),
      setValues: (values: string[]) => {
        const newItems = values.map(id => orderedItems.find(item => item.id === id)!).filter(Boolean);
        setOrderedItems(newItems);
        onReorder?.(newItems);
      },
      config: {
        dragHandle: showDragHandle ? '.drag-handle' : undefined,
        dropZoneClass: 'drop-zone-active',
        draggingClass: 'dragging',
        dragPlaceholderClass: 'drag-placeholder',
      },
    });

    return () => {
      if (dragDropInstance.current) {
        dragDropInstance.current.destroy?.();
      }
    };
  }, [orderedItems, onReorder, disabled, showDragHandle]);

  const containerClasses = `
    ${orientation === 'vertical' ? 'space-y-2' : 'flex space-x-2'}
    ${className}
  `;

  const itemClasses = `
    bg-white border border-gray-200 rounded-lg shadow-sm
    transition-all duration-200 ease-in-out
    hover:shadow-md hover:border-gray-300
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move'}
    ${itemClassName}
  `;

  const dragHandleClasses = `
    drag-handle flex items-center justify-center
    w-6 h-6 text-gray-400 hover:text-gray-600
    cursor-grab active:cursor-grabbing
    ${dragHandleClassName}
  `;

  return (
    <motion.div
      ref={containerRef}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={containerClasses}
    >
      <AnimatePresence>
        {orderedItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            data-value={item.id}
            className={itemClasses}
          >
            <div className="flex items-center p-4">
              {showDragHandle && !disabled && (
                <div className={dragHandleClasses}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="9" cy="5" r="1" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="15" cy="19" r="1" />
                  </svg>
                </div>
              )}
              <div className={showDragHandle && !disabled ? 'ml-3 flex-1' : 'flex-1'}>
                {item.content}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Specialized components for common use cases
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status?: 'pending' | 'completed' | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
}

interface TaskListProps {
  tasks: TaskItem[];
  onReorder?: (tasks: TaskItem[]) => void;
  onStatusChange?: (taskId: string, status: TaskItem['status']) => void;
  className?: string;
}

export function TaskList({ tasks, onReorder, onStatusChange, className }: TaskListProps) {
  const items: DragDropItem[] = tasks.map(task => ({
    id: task.id,
    data: task,
    content: (
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {task.priority && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          )}
          <select
            value={task.status || 'pending'}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as TaskItem['status'])}
            className="text-xs border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="pending">Pendiente</option>
            <option value="in-progress">En progreso</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>
    ),
  }));

  return (
    <DragDropList
      items={items}
      onReorder={(newItems) => {
        const newTasks = newItems.map(item => item.data as TaskItem);
        onReorder?.(newTasks);
      }}
      className={className}
    />
  );
}

// File upload drag and drop component
interface FileUploadProps {
  onFilesUpload?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUploadDropZone({
  onFilesUpload,
  acceptedTypes = ['image/*', 'application/pdf', '.txt', '.doc', '.docx'],
  maxFiles = 5,
  maxSize = 10,
  className = '',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) return false;
      
      // Check file type
      if (acceptedTypes.length > 0) {
        return acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });
      }
      
      return true;
    });

    const newFiles = [...uploadedFiles, ...validFiles].slice(0, maxFiles);
    setUploadedFiles(newFiles);
    onFilesUpload?.(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUpload?.(newFiles);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        variants={staggerItem}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-red-400 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Arrastra archivos aquí
            </p>
            <p className="text-sm text-gray-500">
              o haz clic para seleccionar archivos
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Máximo {maxFiles} archivos, {maxSize}MB cada uno
          </p>
        </div>
      </motion.div>

      {uploadedFiles.length > 0 && (
        <motion.div variants={staggerContainer} className="space-y-2">
          <h4 className="font-medium text-gray-900">Archivos subidos:</h4>
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Eliminar
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default DragDropList;
