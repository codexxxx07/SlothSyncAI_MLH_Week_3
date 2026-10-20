import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx';
import Button, { IconButton } from './Button';

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

const Modal = ({ open, onClose, title, description, children, footer, size = 'md', busy = false }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll(FOCUSABLE) || []
      ).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    const timer = window.setTimeout(() => {
      const target =
        panelRef.current?.querySelector('[data-autofocus]') ||
        panelRef.current?.querySelector(FOCUSABLE);
      target?.focus();
    }, 20);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.clearTimeout(timer);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div className="animate-fade-in fixed inset-0 bg-[var(--c-overlay)]" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'card animate-pop relative w-full p-6',
          size === 'sm' ? 'max-w-[420px]' : size === 'lg' ? 'max-w-[640px]' : 'max-w-[520px]'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[17px] leading-snug font-semibold text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{description}</p>
            ) : null}
          </div>
          {onClose ? (
            <IconButton
              icon={X}
              label="Close dialog"
              size="sm"
              disabled={busy}
              onClick={onClose}
              className="-mt-1 -mr-1 shrink-0"
            />
          ) : null}
        </div>

        {children}

        {footer ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
  busy = false,
  children,
}) => (
  <Modal
    open={open}
    onClose={busy ? undefined : onCancel}
    title={title}
    size="sm"
    busy={busy}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={busy}
          data-autofocus
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    {typeof message === 'string' ? (
      <p className="text-sm leading-relaxed text-ink-2">{message}</p>
    ) : (
      message
    )}
    {children}
  </Modal>
);

export default Modal;
