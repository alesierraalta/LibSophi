'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hotkeyManager, HOTKEY_SCOPES, HotkeyScope } from '@/lib/hotkeys';
import { modalOverlay, modalContent } from '@/lib/animations';

interface HotkeyHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeyHelp({ isOpen, onClose }: HotkeyHelpProps) {
  const [activeScope, setActiveScope] = useState<HotkeyScope>(HOTKEY_SCOPES.GLOBAL);
  
  const hotkeys = hotkeyManager.getHotkeys();
  const scopes = Object.keys(hotkeys) as HotkeyScope[];

  const getScopeLabel = (scope: HotkeyScope): string => {
    switch (scope) {
      case HOTKEY_SCOPES.GLOBAL:
        return 'Global';
      case HOTKEY_SCOPES.EDITOR:
        return 'Editor';
      case HOTKEY_SCOPES.MODAL:
        return 'Modal';
      case HOTKEY_SCOPES.TABLE:
        return 'Tabla';
      default:
        return scope;
    }
  };

  const formatHotkey = (keys: string): string => {
    return keys
      .split(',')[0] // Take first combination if multiple
      .replace('ctrl', '⌃')
      .replace('cmd', '⌘')
      .replace('shift', '⇧')
      .replace('alt', '⌥')
      .replace('meta', '⌘')
      .replace('+', ' + ')
      .toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Atajos de teclado
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[60vh]">
              {/* Sidebar */}
              <div className="w-1/4 border-r border-gray-200 bg-gray-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Contextos</h3>
                  <nav className="space-y-1">
                    {scopes.map((scope) => (
                      <button
                        key={scope}
                        onClick={() => setActiveScope(scope)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          activeScope === scope
                            ? 'bg-red-100 text-red-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {getScopeLabel(scope)}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getScopeLabel(activeScope)}
                  </h3>
                  
                  {hotkeys[activeScope] && Object.keys(hotkeys[activeScope]).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(hotkeys[activeScope]).map(([keys, description]) => (
                        <div
                          key={keys}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                        >
                          <span className="text-sm text-gray-900">{description}</span>
                          <div className="flex items-center space-x-1">
                            {formatHotkey(keys).split(' + ').map((key, index, array) => (
                              <React.Fragment key={index}>
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm">
                                  {key}
                                </kbd>
                                {index < array.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay atajos disponibles en este contexto.
                    </p>
                  )}
                </div>

                {/* Tips */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Consejos</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Los atajos globales funcionan en toda la aplicación</li>
                    <li>• Los atajos del editor solo funcionan cuando estás escribiendo</li>
                    <li>• Usa <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">?</kbd> para abrir esta ayuda</li>
                    <li>• Usa <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Esc</kbd> para cerrar modales</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HotkeyHelp;
