import React, { useState, useEffect } from 'react';
import { X, Tag, Check, AlertCircle } from 'lucide-react';
import type { DynamicCategory } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  category: DynamicCategory | null; // null se criando nova
  existingCategories: DynamicCategory[];
  onSave: (category: DynamicCategory) => void;
  onClose: () => void;
}

const COMMON_EMOJIS = ['💬', '🛍️', '📅', '🔒', '📝', '⚡', '📈', '🎨', '🚀', '⭐', '💼', '🌐'];

export default function CategoryModal({
  isOpen,
  category,
  existingCategories,
  onSave,
  onClose
}: CategoryModalProps) {
  const isEditing = !!category;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [order, setOrder] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.id);
      setDescription(category.description || '');
      setIcon(category.icon || '📁');
      setOrder(category.order || 1);
      setEnabled(category.enabled ?? true);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('📁');
      setOrder(existingCategories.length + 1);
      setEnabled(true);
    }
    setError('');
  }, [category, existingCategories.length, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      // Gera slug limpo automaticamente se não estiver editando
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }
    const cleanSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');
    if (!cleanSlug) {
      setError('Identificador / slug inválido.');
      return;
    }

    // Checar duplicidade de slug apenas para novas ou se alterou
    const isDuplicate = existingCategories.some(c => c.id === cleanSlug && (!isEditing || c.id !== category.id));
    if (isDuplicate) {
      setError('Já existe uma categoria com este identificador/slug.');
      return;
    }

    onSave({
      id: cleanSlug,
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '📁',
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
            <Tag size={18} />
          </div>
          <div className="config-modal-title-group">
            <h3>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <p>Configure a categorização de funcionalidades exibida no briefing.</p>
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
            <label>Nome da Categoria *</label>
            <input
              type="text"
              placeholder="Ex: Comunicação, Marketing, E-commerce..."
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="config-input"
              autoFocus
            />
          </div>

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>Identificador interno (slug) *</label>
              <input
                type="text"
                placeholder="ex: comunicacao"
                value={slug}
                disabled={isEditing}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                className="config-input"
              />
              <small className="config-field-hint">
                {isEditing ? 'O slug não pode ser alterado para preservar referências.' : 'Chave única usada no sistema.'}
              </small>
            </div>

            <div className="config-form-group">
              <label>Ordem de exibição</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
                className="config-input"
              />
            </div>
          </div>

          <div className="config-form-group">
            <label>Ícone ou Emoji</label>
            <div className="config-emoji-picker-row">
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="config-input icon-input"
                maxLength={4}
              />
              <div className="config-quick-emojis">
                {COMMON_EMOJIS.map(em => (
                  <button
                    key={em}
                    type="button"
                    className={'quick-emoji-btn ' + (icon === em ? 'is-selected' : '')}
                    onClick={() => setIcon(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="config-form-group">
            <label>Descrição (opcional)</label>
            <textarea
              rows={2}
              placeholder="Breve explicação sobre os recursos desta categoria..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="config-textarea"
            />
          </div>

          <div className="config-form-group toggle-row">
            <div>
              <strong>Categoria Ativa</strong>
              <small>Categorias inativas não aparecem como opções para novos briefings.</small>
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

          <div className="config-modal-footer">
            <button type="button" className="config-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="config-save-btn">
              <Check size={16} />
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Categoria'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
