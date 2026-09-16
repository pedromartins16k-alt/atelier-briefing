import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  warningDetails?: string;
  confirmLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  warningDetails,
  confirmLabel = 'Excluir definitivamente',
  isDangerous = true,
  onConfirm,
  onClose
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="config-modal-overlay" role="dialog" aria-modal="true">
      <div className="config-modal-card confirm-modal">
        <div className="config-modal-header">
          <div className="confirm-modal-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="config-modal-title-group">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
          <button type="button" className="config-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {warningDetails && (
          <div className="confirm-warning-box">
            <span>{warningDetails}</span>
          </div>
        )}

        <div className="config-modal-footer">
          <button type="button" className="config-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={isDangerous ? 'config-btn-danger' : 'config-save-btn'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
