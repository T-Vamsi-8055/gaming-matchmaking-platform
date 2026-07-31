import React, { useEffect } from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
