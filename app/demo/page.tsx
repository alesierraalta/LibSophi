'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { dateUtils } from '@/lib/date-utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useWorksStore } from '@/lib/stores/works-store';
import { useGlobalHotkeys, hotkeyManager, HOTKEY_SCOPES } from '@/lib/hotkeys';
import { validateData, createWorkSchema, WorkType } from '@/lib/validations';
import DataTable from '@/components/DataTable';
import WorksTable from '@/components/WorksTable';
import { AnalyticsChart, ViewsChart, GenreChart } from '@/components/Charts/AnalyticsChart';
import { DragDropList, TaskList, FileUploadDropZone } from '@/components/DragAndDrop/DragDropList';
import AnimatedWrapper from '@/components/AnimatedWrapper';
import HotkeyHelp from '@/components/HotkeyHelp';

// Mock data for demonstrations
const mockWorks: WorkType[] = [
  {
    id: '1',
    title: 'El Jardín de los Senderos que se Bifurcan',
    description: 'Una historia sobre realidades paralelas y decisiones infinitas.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-1',
    genre: 'Ficción Científica',
    tags: ['ciencia ficción', 'filosofía', 'tiempo'],
    published: true,
    reading_time: 15,
    views: 1250,
    likes: 89,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Reflexiones sobre la Escritura Moderna',
    description: 'Un ensayo sobre las tendencias actuales en literatura.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author_id: 'user-2',
    genre: 'Ensayo',
    tags: ['literatura', 'crítica', 'modernidad'],
    published: false,
    reading_time: 8,
    views: 340,
    likes: 23,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-05'),
  },
];

const mockChartData = {
  views: {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Vistas',
      data: [120, 190, 300, 500, 200, 300, 450],
    }]
  },
  genres: {
    labels: ['Ficción', 'Ensayo', 'Poesía', 'Drama', 'Biografía'],
    datasets: [{
      label: 'Obras por género',
      data: [12, 8, 5, 3, 2],
    }]
  }
};

const mockTasks = [
  {
    id: '1',
    title: 'Revisar capítulo 3',
    description: 'Corregir errores de gramática y estilo',
    status: 'pending' as const,
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Escribir sinopsis',
    description: 'Crear resumen ejecutivo de la obra',
    status: 'in-progress' as const,
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Diseñar portada',
    description: 'Crear diseño visual para la publicación',
    status: 'completed' as const,
    priority: 'low' as const,
  },
];

export default function DemoPage() {
  const [showHotkeyHelp, setShowHotkeyHelp] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null);
  const [tasks, setTasks] = useState(mockTasks);
  const [dragItems, setDragItems] = useState([
    { id: '1', content: <div className="p-2">Elemento arrastrable 1</div> },
    { id: '2', content: <div className="p-2">Elemento arrastrable 2</div> },
    { id: '3', content: <div className="p-2">Elemento arrastrable 3</div> },
  ]);

  // Zustand stores
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();
  const { works, setWorks } = useWorksStore();

  // Set mock data
  useEffect(() => {
    setWorks(mockWorks);
  }, [setWorks]);

  // Global hotkeys
  useGlobalHotkeys({
    onSearch: () => addNotification({
      type: 'info',
      title: 'Búsqueda',
      message: 'Función de búsqueda activada con Ctrl+K'
    }),
    onHelp: () => setShowHotkeyHelp(true),
  });

  // Demo functions
  const handleWorkEdit = (work: WorkType) => {
    setSelectedWork(work);
    addNotification({
      type: 'info',
      title: 'Editar obra',
      message: `Editando: ${work.title}`
    });
  };

  const handleWorkDelete = (workId: string) => {
    const work = works.find(w => w.id === workId);
    addNotification({
      type: 'warning',
      title: 'Eliminar obra',
      message: `¿Confirmar eliminación de "${work?.title}"?`
    });
  };

  const handleTaskReorder = (newTasks: typeof tasks) => {
    setTasks(newTasks);
    addNotification({
      type: 'success',
      title: 'Tareas reordenadas',
      message: 'El orden de las tareas ha sido actualizado'
    });
  };

  const handleFileUpload = (files: File[]) => {
    addNotification({
      type: 'success',
      title: 'Archivos subidos',
      message: `${files.length} archivo(s) procesado(s) correctamente`
    });
  };

  const handleValidationDemo = () => {
    const testData = {
      title: 'Mi nueva obra',
      description: 'Una descripción corta', // This will fail validation
      content: 'Contenido muy corto', // This will fail validation
      author_id: 'user-123',
      genre: 'Ficción',
      tags: ['demo'],
      published: false,
      reading_time: 5,
    };

    const result = validateData(createWorkSchema, testData);
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Validación exitosa',
        message: 'Los datos son válidos'
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Error de validación',
        message: result.errors?.join(', ') || 'Error desconocido'
      });
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedWrapper variant="fadeInUp" className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo de Librerías Implementadas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demostración de todas las librerías implementadas: Zod, Day.js, TanStack Table, 
            Auth.js, Framer Motion, Fontsource, Chart.js, Zustand, FormKit Drag-and-Drop y Hotkeys.js
          </p>
        </AnimatedWrapper>

        {/* Quick Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Fecha Actual</h3>
            <p className="text-2xl font-bold text-gray-900">
              {dateUtils.format(new Date(), 'DD/MM/YYYY')}
            </p>
            <p className="text-sm text-gray-500">
              {dateUtils.format(new Date(), 'dddd')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Hora Relativa</h3>
            <p className="text-2xl font-bold text-gray-900">
              {dateUtils.fromNow(new Date(Date.now() - 2 * 60 * 60 * 1000))}
            </p>
            <p className="text-sm text-gray-500">Ejemplo con Day.js</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Obras Totales</h3>
            <p className="text-2xl font-bold text-gray-900">{works.length}</p>
            <p className="text-sm text-gray-500">Gestionadas con Zustand</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Estado Auth</h3>
            <p className="text-2xl font-bold text-gray-900">
              {isAuthenticated ? 'Conectado' : 'Desconectado'}
            </p>
            <p className="text-sm text-gray-500">Auth.js + Zustand</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
          <button
            onClick={handleValidationDemo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Probar Validación Zod
          </button>
          <button
            onClick={() => setShowHotkeyHelp(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Ver Atajos (?)
          </button>
          <button
            onClick={() => hotkeyManager.setScope(HOTKEY_SCOPES.EDITOR)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Modo Editor
          </button>
          <button
            onClick={() => hotkeyManager.setScope(HOTKEY_SCOPES.GLOBAL)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Modo Global
          </button>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={staggerItem} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Gráficas con Chart.js</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViewsChart data={mockChartData.views} />
            <GenreChart data={mockChartData.genres} />
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div variants={staggerItem} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tabla con TanStack Table</h2>
          <WorksTable
            works={works}
            onEdit={handleWorkEdit}
            onDelete={handleWorkDelete}
            onView={(work) => addNotification({
              type: 'info',
              title: 'Ver obra',
              message: `Viendo: ${work.title}`
            })}
          />
        </motion.div>

        {/* Drag and Drop Section */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Arrastrar y Soltar</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Lista Simple</h3>
              <DragDropList
                items={dragItems}
                onReorder={setDragItems}
                className="space-y-2"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Lista de Tareas</h3>
              <TaskList
                tasks={tasks}
                onReorder={handleTaskReorder}
                onStatusChange={(taskId, status) => {
                  setTasks(tasks.map(task => 
                    task.id === taskId ? { ...task, status } : task
                  ));
                }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Subida de Archivos</h2>
            <FileUploadDropZone
              onFilesUpload={handleFileUpload}
              acceptedTypes={['image/*', '.pdf', '.txt', '.doc', '.docx']}
              maxFiles={3}
              maxSize={5}
            />
          </div>
        </motion.div>

        {/* Animation Examples */}
        <motion.div variants={staggerItem} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Animaciones con Framer Motion</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatedWrapper variant="fadeInUp" delay={0.1}>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-900">Fade In Up</h3>
                <p className="text-gray-600 mt-2">Animación de entrada desde abajo</p>
              </div>
            </AnimatedWrapper>
            <AnimatedWrapper variant="fadeInUp" delay={0.2}>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-900">Con Delay</h3>
                <p className="text-gray-600 mt-2">Animación con retraso de 0.2s</p>
              </div>
            </AnimatedWrapper>
            <AnimatedWrapper variant="fadeInUp" delay={0.3}>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-900">Secuencial</h3>
                <p className="text-gray-600 mt-2">Animación con retraso de 0.3s</p>
              </div>
            </AnimatedWrapper>
          </div>
        </motion.div>

        {/* Typography Examples */}
        <motion.div variants={staggerItem} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tipografías con Fontsource</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <div>
              <h3 className="font-inter font-bold text-xl text-gray-900">Inter Font (Headings)</h3>
              <p className="font-inter text-gray-600">
                Esta es la fuente Inter utilizada para encabezados y texto principal.
                Es una fuente moderna y legible, perfecta para interfaces digitales.
              </p>
            </div>
            <div>
              <h3 className="font-roboto font-bold text-xl text-gray-900">Roboto Font (Subheadings)</h3>
              <p className="font-roboto text-gray-600">
                Esta es la fuente Roboto utilizada para subtítulos y texto secundario.
                Ofrece excelente legibilidad y un diseño limpio.
              </p>
            </div>
            <div>
              <h3 className="font-mono font-bold text-xl text-gray-900">Monospace Font (Code)</h3>
              <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                const example = "Fuente monoespaciada para código";
              </code>
            </div>
          </div>
        </motion.div>

        {/* Hotkey Help Instructions */}
        <motion.div variants={staggerItem} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">💡 Prueba los Atajos de Teclado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Ctrl+K / Cmd+K:</strong> Activar búsqueda
            </div>
            <div>
              <strong>?:</strong> Mostrar ayuda de atajos
            </div>
            <div>
              <strong>Ctrl+N / Cmd+N:</strong> Nueva obra
            </div>
            <div>
              <strong>Esc:</strong> Cerrar modales
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hotkey Help Modal */}
      <HotkeyHelp
        isOpen={showHotkeyHelp}
        onClose={() => setShowHotkeyHelp(false)}
      />
    </motion.div>
  );
}
