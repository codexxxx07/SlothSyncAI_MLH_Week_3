import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const TOAST_DURATION = 4600;

const TOAST_ICONS = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

const TOAST_TONES = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (kind, title, description) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, kind, title, description }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (title, description) => push('success', title, description),
      error: (title, description) => push('error', title, description),
      info: (title, description) => push('info', title, description),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-5 right-5 z-50 flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-3"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.kind] || Info;
          return (
            <div
              key={toast.id}
              className="toast animate-fade-in flex items-start gap-3 px-4 py-3"
              role={toast.kind === 'error' ? 'alert' : 'status'}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${TOAST_TONES[toast.kind]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed break-words text-ink-2">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="btn btn-ghost btn-sm icon-btn-sm -my-1 -mr-1 shrink-0"
                aria-label="Dismiss notification"
                title="Dismiss"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
