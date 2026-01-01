import React from 'react';

interface ModalProps {
  title: React.ReactNode;
  showCloseButton?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  title,
  showCloseButton = true,
  onClose,
  children,
  maxWidth = '500px',
}: ModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div
        className="modal animate-scale-in"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="m-0 text-xl font-semibold text-primary-900">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="bg-none border-0 text-2xl cursor-pointer p-1 text-muted hover:text-primary transition-all"
              aria-label="Κλείσιμο"
            >
              ×
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
