'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, X } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel?: () => void
}

let openConfirmDialogFn: ((props: ConfirmDialogProps) => void) | null = null

export const openConfirmDialog = (props: ConfirmDialogProps) => {
  if (openConfirmDialogFn) {
    openConfirmDialogFn(props)
  }
}

export function ConfirmDialog() {
  const [dialogProps, setDialogProps] = React.useState<ConfirmDialogProps | null>(null)

  React.useEffect(() => {
    openConfirmDialogFn = (props: ConfirmDialogProps) => {
      setDialogProps(props)
    }
    return () => {
      openConfirmDialogFn = null
    }
  }, [])

  const handleConfirm = () => {
    if (dialogProps?.onConfirm) {
      dialogProps.onConfirm()
    }
    handleClose()
  }

  const handleCancel = () => {
    if (dialogProps?.onCancel) {
      dialogProps.onCancel()
    }
    handleClose()
  }

  const handleClose = () => {
    setDialogProps(null)
  }

  const isOpen = !!dialogProps
  const variant = dialogProps?.variant || 'default'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {variant === 'danger' ? (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          ) : (
            <Info className="h-6 w-6 text-blue-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {dialogProps?.title}
          </h3>
        </div>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          {dialogProps?.message}
        </p>
        
        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {dialogProps?.cancelText || 'Cancelar'}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {dialogProps?.confirmText || 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  )
}