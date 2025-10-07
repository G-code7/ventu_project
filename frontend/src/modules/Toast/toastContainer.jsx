// 📁 UBICACIÓN: frontend/src/components/Toast/ToastContainer.jsx
// Este componente muestra todas las notificaciones activas

import React from 'react';
import Toast from './toast';

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;