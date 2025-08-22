import hotkeys from 'hotkeys-js';
import React from 'react';

// Global hotkey configurations
export const HOTKEY_SCOPES = {
  GLOBAL: 'global',
  EDITOR: 'editor',
  MODAL: 'modal',
  TABLE: 'table',
} as const;

export type HotkeyScope = typeof HOTKEY_SCOPES[keyof typeof HOTKEY_SCOPES];

// Common hotkey combinations
export const HOTKEYS = {
  // Navigation
  SEARCH: 'ctrl+k,cmd+k',
  HOME: 'g h',
  PROFILE: 'g p',
  WORKS: 'g w',
  FAVORITES: 'g f',
  NOTIFICATIONS: 'g n',
  
  // Actions
  NEW_WORK: 'ctrl+n,cmd+n',
  SAVE: 'ctrl+s,cmd+s',
  PUBLISH: 'ctrl+shift+p,cmd+shift+p',
  DELETE: 'del',
  EDIT: 'e',
  
  // Editor
  BOLD: 'ctrl+b,cmd+b',
  ITALIC: 'ctrl+i,cmd+i',
  UNDERLINE: 'ctrl+u,cmd+u',
  UNDO: 'ctrl+z,cmd+z',
  REDO: 'ctrl+y,cmd+y,ctrl+shift+z,cmd+shift+z',
  
  // UI
  TOGGLE_SIDEBAR: 'ctrl+\\,cmd+\\',
  CLOSE_MODAL: 'esc',
  CONFIRM: 'enter',
  CANCEL: 'esc',
  
  // Table navigation
  NEXT_ROW: 'j',
  PREV_ROW: 'k',
  FIRST_ROW: 'g g',
  LAST_ROW: 'G',
  
  // General
  HELP: '?',
  REFRESH: 'ctrl+r,cmd+r',
} as const;

// Hotkey manager class
class HotkeyManager {
  private registeredKeys = new Set<string>();
  private scopeStack: HotkeyScope[] = [HOTKEY_SCOPES.GLOBAL];

  constructor() {
    // Set default scope
    hotkeys.setScope(HOTKEY_SCOPES.GLOBAL);
    
    // Disable hotkeys on form elements by default
    hotkeys.filter = (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      // Allow hotkeys in contenteditable elements only for editor shortcuts
      if (target.isContentEditable && this.getCurrentScope() !== HOTKEY_SCOPES.EDITOR) {
        return false;
      }
      
      // Disable hotkeys in form inputs (except in editor scope)
      if (['input', 'textarea', 'select'].includes(tagName) && 
          this.getCurrentScope() !== HOTKEY_SCOPES.EDITOR) {
        return false;
      }
      
      return true;
    };
  }

  // Register a hotkey
  register(
    keys: string,
    callback: (event: KeyboardEvent, handler: any) => void,
    options: {
      scope?: HotkeyScope;
      description?: string;
      element?: HTMLElement;
      preventDefault?: boolean;
    } = {}
  ) {
    const {
      scope = HOTKEY_SCOPES.GLOBAL,
      description = '',
      element,
      preventDefault = true
    } = options;

    const wrappedCallback = (event: KeyboardEvent, handler: any) => {
      if (preventDefault) {
        event.preventDefault();
      }
      callback(event, handler);
    };

    if (element) {
      // Register hotkey on specific element
      hotkeys(keys, { element, scope }, wrappedCallback);
    } else {
      // Register global hotkey
      hotkeys(keys, { scope }, wrappedCallback);
    }

    this.registeredKeys.add(`${keys}:${scope}`);
    
    // Store description for help system
    if (description) {
      this.setDescription(keys, description, scope);
    }

    return () => this.unregister(keys, scope);
  }

  // Unregister a hotkey
  unregister(keys: string, scope: HotkeyScope = HOTKEY_SCOPES.GLOBAL) {
    hotkeys.unbind(keys, scope);
    this.registeredKeys.delete(`${keys}:${scope}`);
  }

  // Set hotkey description for help system
  private setDescription(keys: string, description: string, scope: HotkeyScope) {
    if (typeof window === 'undefined') return;
    
    if (!window.hotkeyDescriptions) {
      window.hotkeyDescriptions = {
        global: {},
        table: {},
        editor: {},
        modal: {}
      };
    }
    if (!window.hotkeyDescriptions[scope]) {
      window.hotkeyDescriptions[scope] = {};
    }
    window.hotkeyDescriptions[scope][keys] = description;
  }

  // Get all registered hotkeys with descriptions
  getHotkeys(scope?: HotkeyScope) {
    if (typeof window === 'undefined' || !window.hotkeyDescriptions) return {};
    
    if (scope) {
      return window.hotkeyDescriptions[scope] || {};
    }
    
    return window.hotkeyDescriptions;
  }

  // Scope management
  pushScope(scope: HotkeyScope) {
    this.scopeStack.push(scope);
    hotkeys.setScope(scope);
  }

  popScope() {
    if (this.scopeStack.length > 1) {
      this.scopeStack.pop();
      const currentScope = this.scopeStack[this.scopeStack.length - 1];
      hotkeys.setScope(currentScope);
    }
  }

  getCurrentScope(): HotkeyScope {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  setScope(scope: HotkeyScope) {
    this.scopeStack = [HOTKEY_SCOPES.GLOBAL];
    if (scope !== HOTKEY_SCOPES.GLOBAL) {
      this.scopeStack.push(scope);
    }
    hotkeys.setScope(scope);
  }

  // Utility methods
  isPressed(keys: string): boolean {
    return hotkeys.isPressed(keys);
  }

  // Clean up all hotkeys
  destroy() {
    Array.from(this.registeredKeys).forEach(keyScope => {
      const [keys, scope] = keyScope.split(':');
      this.unregister(keys, scope as HotkeyScope);
    });
    this.registeredKeys.clear();
  }
}

// Global hotkey manager instance
export const hotkeyManager = new HotkeyManager();

// React hook for using hotkeys
export function useHotkeys(
  keys: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    scope?: HotkeyScope;
    description?: string;
    enabled?: boolean;
    element?: HTMLElement;
    preventDefault?: boolean;
    deps?: React.DependencyList;
  } = {}
) {
  const {
    scope = HOTKEY_SCOPES.GLOBAL,
    description,
    enabled = true,
    element,
    preventDefault = true,
    deps = []
  } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const unregister = hotkeyManager.register(
      keys,
      (event) => callback(event),
      { scope, description, element, preventDefault }
    );

    return unregister;
  }, [keys, enabled, scope, ...deps]);
}

// Predefined hotkey hooks for common actions
export function useGlobalHotkeys(callbacks: {
  onSearch?: () => void;
  onNewWork?: () => void;
  onToggleSidebar?: () => void;
  onHelp?: () => void;
}) {
  const { onSearch, onNewWork, onToggleSidebar, onHelp } = callbacks;

  useHotkeys(HOTKEYS.SEARCH, () => onSearch?.(), {
    description: 'Abrir búsqueda',
    enabled: !!onSearch
  });

  useHotkeys(HOTKEYS.NEW_WORK, () => onNewWork?.(), {
    description: 'Crear nueva obra',
    enabled: !!onNewWork
  });

  useHotkeys(HOTKEYS.TOGGLE_SIDEBAR, () => onToggleSidebar?.(), {
    description: 'Mostrar/ocultar barra lateral',
    enabled: !!onToggleSidebar
  });

  useHotkeys(HOTKEYS.HELP, () => onHelp?.(), {
    description: 'Mostrar ayuda de atajos',
    enabled: !!onHelp
  });
}

export function useEditorHotkeys(callbacks: {
  onSave?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}) {
  const { onSave, onBold, onItalic, onUnderline, onUndo, onRedo } = callbacks;

  useHotkeys(HOTKEYS.SAVE, () => onSave?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Guardar',
    enabled: !!onSave
  });

  useHotkeys(HOTKEYS.BOLD, () => onBold?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Negrita',
    enabled: !!onBold
  });

  useHotkeys(HOTKEYS.ITALIC, () => onItalic?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Cursiva',
    enabled: !!onItalic
  });

  useHotkeys(HOTKEYS.UNDERLINE, () => onUnderline?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Subrayado',
    enabled: !!onUnderline
  });

  useHotkeys(HOTKEYS.UNDO, () => onUndo?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Deshacer',
    enabled: !!onUndo
  });

  useHotkeys(HOTKEYS.REDO, () => onRedo?.(), {
    scope: HOTKEY_SCOPES.EDITOR,
    description: 'Rehacer',
    enabled: !!onRedo
  });
}

export function useModalHotkeys(callbacks: {
  onClose?: () => void;
  onConfirm?: () => void;
}) {
  const { onClose, onConfirm } = callbacks;

  useHotkeys(HOTKEYS.CLOSE_MODAL, () => onClose?.(), {
    scope: HOTKEY_SCOPES.MODAL,
    description: 'Cerrar modal',
    enabled: !!onClose
  });

  useHotkeys(HOTKEYS.CONFIRM, () => onConfirm?.(), {
    scope: HOTKEY_SCOPES.MODAL,
    description: 'Confirmar',
    enabled: !!onConfirm
  });
}

export function useTableHotkeys(callbacks: {
  onNextRow?: () => void;
  onPrevRow?: () => void;
  onFirstRow?: () => void;
  onLastRow?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { onNextRow, onPrevRow, onFirstRow, onLastRow, onEdit, onDelete } = callbacks;

  useHotkeys(HOTKEYS.NEXT_ROW, () => onNextRow?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Siguiente fila',
    enabled: !!onNextRow
  });

  useHotkeys(HOTKEYS.PREV_ROW, () => onPrevRow?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Fila anterior',
    enabled: !!onPrevRow
  });

  useHotkeys(HOTKEYS.FIRST_ROW, () => onFirstRow?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Primera fila',
    enabled: !!onFirstRow
  });

  useHotkeys(HOTKEYS.LAST_ROW, () => onLastRow?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Última fila',
    enabled: !!onLastRow
  });

  useHotkeys(HOTKEYS.EDIT, () => onEdit?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Editar',
    enabled: !!onEdit
  });

  useHotkeys(HOTKEYS.DELETE, () => onDelete?.(), {
    scope: HOTKEY_SCOPES.TABLE,
    description: 'Eliminar',
    enabled: !!onDelete
  });
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    hotkeyDescriptions?: Record<HotkeyScope, Record<string, string>>;
  }
}

export default hotkeyManager;
