'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function ToastItem({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className="flex items-center gap-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl p-4 shadow-lg min-w-[300px] max-w-[500px]"
    >
      <div className={`flex-shrink-0 w-8 h-8 ${colors[type]} rounded-full flex items-center justify-center text-white font-bold`}>
        {icons[type]}
      </div>
      <p className="flex-1 text-[#FFF1F2] text-sm">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-[#FFF1F2]/60 hover:text-[#FFF1F2] transition-colors"
      >
        ✕
      </button>
    </motion.div>
  );
}

let toastCounter = 0;
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

export function toast(message: string, type: ToastType = 'info') {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, message, type };
  
  currentToasts = [...currentToasts, newToast];
  toastListeners.forEach(listener => listener(currentToasts));
  
  return id;
}

toast.success = (message: string) => toast(message, 'success');
toast.error = (message: string) => toast(message, 'error');
toast.warning = (message: string) => toast(message, 'warning');
toast.info = (message: string) => toast(message, 'info');

function removeToast(id: string) {
  currentToasts = currentToasts.filter(t => t.id !== id);
  toastListeners.forEach(listener => listener(currentToasts));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== setToasts);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
