'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { WorkType } from '@/lib/validations';
import { dateUtils } from '@/lib/date-utils';
import DataTable from './DataTable';
import { motion } from 'framer-motion';
import { buttonHover } from '@/lib/animations';

interface WorksTableProps {
  works: WorkType[];
  onEdit?: (work: WorkType) => void;
  onDelete?: (workId: string) => void;
  onView?: (work: WorkType) => void;
  showActions?: boolean;
}

export function WorksTable({ 
  works, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true 
}: WorksTableProps) {
  const columns = useMemo<ColumnDef<WorkType>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Título',
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div className="font-medium text-gray-900 truncate">
              {row.getValue('title')}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'genre',
        header: 'Género',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.getValue('genre')}
          </span>
        ),
      },
      {
        accessorKey: 'published',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.getValue('published')
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {row.getValue('published') ? 'Publicado' : 'Borrador'}
          </span>
        ),
      },
      {
        accessorKey: 'views',
        header: 'Vistas',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.getValue('views')?.toLocaleString() || '0'}
          </div>
        ),
      },
      {
        accessorKey: 'likes',
        header: 'Me gusta',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.getValue('likes')?.toLocaleString() || '0'}
          </div>
        ),
      },
      {
        accessorKey: 'reading_time',
        header: 'Tiempo de lectura',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {dateUtils.formatReadingTime(row.getValue('reading_time'))}
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha de creación',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {dateUtils.format(row.getValue('created_at'), 'DD/MM/YYYY')}
          </div>
        ),
      },
      {
        accessorKey: 'tags',
        header: 'Etiquetas',
        cell: ({ row }) => {
          const tags = row.getValue('tags') as string[];
          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {tags?.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {tags?.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{tags.length - 2} más
                </span>
              )}
            </div>
          );
        },
      },
      ...(showActions
        ? [
            {
              id: 'actions',
              header: 'Acciones',
              cell: ({ row }: { row: any }) => (
                <div className="flex items-center space-x-2">
                  {onView && (
                    <motion.button
                      variants={buttonHover}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => onView(row.original)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver
                    </motion.button>
                  )}
                  {onEdit && (
                    <motion.button
                      variants={buttonHover}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => onEdit(row.original)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Editar
                    </motion.button>
                  )}
                  {onDelete && (
                    <motion.button
                      variants={buttonHover}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => onDelete(row.original.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </motion.button>
                  )}
                </div>
              ),
            } as ColumnDef<WorkType>,
          ]
        : []),
    ],
    [onEdit, onDelete, onView, showActions]
  );

  return (
    <DataTable
      columns={columns}
      data={works}
      searchPlaceholder="Buscar obras..."
      enableSearch={true}
      enablePagination={true}
      enableSorting={true}
      pageSize={10}
    />
  );
}

export default WorksTable;
