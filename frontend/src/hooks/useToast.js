import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  /**
   * Muestra una nueva notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Duración en ms (default: 4000)
   */
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random(); // ID único
    
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    // Retornar el ID por si se necesita eliminar manualmente
    return id;
  }, []);

  /**
   * Elimina una notificación específica
   * @param {number} id - ID de la notificación a eliminar
   */
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  /**
   * Elimina todas las notificaciones
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Atajos para tipos específicos
  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    // Atajos
    success,
    error,
    warning,
    info
  };
};

export default useToast;