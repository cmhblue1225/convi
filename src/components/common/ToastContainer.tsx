import React from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps } from './Toast';

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      style={{ maxWidth: '100vw', overflow: 'hidden' }}
    >
      <div className="w-full max-w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="transform ease-out duration-300 transition animate-slide-in-right w-full max-w-full"
          >
            <Toast
              {...toast}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default ToastContainer;