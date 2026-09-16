import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ListPlus } from 'lucide-react';
import type { QuestionOption } from '../../types';

interface OptionModalProps {
  isOpen: boolean;
  option: QuestionOption | null; // null para nova
  title: string;
  hasPrice?: boolean;
  onSave: (option: QuestionOption) => void;
  onClose: () => void;
}

export default function OptionModal({
  isOpen,
  option,
  title,
  hasPrice = false,
  onSave,
  onClose
}: OptionModalProps) {
  const isEditing = !!option;

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState('Incluso');
  const [order, setOrder] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (option) {
      setLabel(option.label || option.id);
      setDescription(option.description || '');
      setPrice(option.price ?? 0);
      setPriceLabel(option.priceLabel || (option.price ? `+ R$ ${option.price}` : 'Incluso'));
      setOrder(option.order || 1);
      setEnabled(option.enabled ?? true);
    } else {
      setLabel('');
      setDescription('');
      setPrice(0);
      setPriceLabel('Incluso');
      setOrder(1);
      setEnabled(true);
    }
    setError('');
  }, [option, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (val: number) => {
    const num = Math.max(0, val);
    setPrice(num);
    setPriceLabel(num === 0 ? 'Incluso' : `+ R$ ${num.toLocaleString('pt-BR')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('O texto da opção é obrigatório.');
      return;
    }

    onSave({
      id: option?.id || label.trim(),
      label: label.trim(),
      description: description.trim(),
      price: hasPrice ? price : undefined,
      priceLabel: hasPrice ? priceLabel.trim() : undefined,
      order: Number(order) || 1,
      enabled
    });
    onClose();
  };

  return (
    <div className="config-modal-overlay" role="dialog" aria-modal="true">
      <div className="config-modal-card">
        <div className="config-modal-header">
          <div className="config-modal-icon-badge">
            <ListPlus size={18} />
          </div>
          <div className="config-modal-title-group">
            <h3>{isEditing ? `Editar: ${title}` : `Nova Opção: ${title}`}</h3>
            <p>Gerencie opções de resposta dinâmicas exibidas no briefing.</p>
          </div>
          <button type="button" className="config-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="config-modal-form">
          {error && (
            <div className="config-modal-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="config-form-group">
            <label>Rótulo da Opção *</label>
            <input
              type="text"
              placeholder="Ex: Landing Page, Consultoria, etc..."
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="config-input"
              autoFocus
            />
          </div>

          <div className="config-form-group">
            <label>Descrição ou Subtítulo (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Foco em conversão e captação rápida..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="config-input"
            />
          </div>

          {hasPrice && (
            <div className="config-form-row two-cols">
              <div className="config-form-group">
                <label>Preço Adicional (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={price}
                  onChange={e => handlePriceChange(Number(e.target.value))}
                  className="config-input"
                />
              </div>
              <div className="config-form-group">
                <label>Label de Preço</label>
                <input
                  type="text"
                  placeholder="ex: + R$ 250, Incluso"
                  value={priceLabel}
                  onChange={e => setPriceLabel(e.target.value)}
                  className="config-input"
                />
              </div>
            </div>
          )}

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>Ordem</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
                className="config-input"
              />
            </div>

            <div className="config-form-group toggle-row" style={{ marginTop: '24px' }}>
              <div>
                <strong>Opção Ativa</strong>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e => setEnabled(e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>
          </div>

          <div className="config-modal-footer">
            <button type="button" className="config-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="config-save-btn">
              <Check size={16} />
              <span>{isEditing ? 'Salvar Opção' : 'Adicionar Opção'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
