import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { DynamicFeature, DynamicCategory } from '../../types';

interface FeatureModalProps {
  isOpen: boolean;
  feature: DynamicFeature | null; // null se criando nova
  categories: DynamicCategory[];
  existingFeatures: DynamicFeature[];
  onSave: (feature: DynamicFeature) => void;
  onClose: () => void;
}

const COMMON_FEATURE_EMOJIS = ['âœ‰ï¸', 'ðŸ’¬', 'ðŸ›ï¸', 'ðŸ“…', 'ðŸ”’', 'ðŸ–¼ï¸', 'ðŸ“°', 'â­', 'ðŸ§®', 'ðŸ“¬', 'ðŸš€', 'âš¡', 'ðŸ“Š', 'ðŸ”—'];

export default function FeatureModal({
  isOpen,
  feature,
  categories,
  existingFeatures,
  onSave,
  onClose
}: FeatureModalProps) {
  const isEditing = !!feature;

  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState('Incluso');
  const [icon, setIcon] = useState('âœ¨');
  const [order, setOrder] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [conditionalRuleId, setConditionalRuleId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (feature) {
      setName(feature.name);
      setLabel(feature.label || feature.name);
      setSlug(feature.id);
      setDescription(feature.description || '');
      setCategoryId(feature.categoryId || (categories[0]?.id || ''));
      setPrice(feature.price ?? 0);
      setPriceLabel(feature.priceLabel || (feature.price > 0 ? `+ R$ ${feature.price}` : 'Incluso'));
      setIcon(feature.icon || 'âœ¨');
      setOrder(feature.order || 1);
      setEnabled(feature.enabled ?? true);
      setConditionalRuleId(feature.conditionalRuleId || '');
    } else {
      setName('');
      setLabel('');
      setSlug('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPrice(0);
      setPriceLabel('Incluso');
      setIcon('âœ¨');
      setOrder(existingFeatures.length + 1);
      setEnabled(true);
      setConditionalRuleId('');
    }
    setError('');
  }, [feature, categories, existingFeatures.length, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setLabel(val);
      const clean = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(clean);
    }
  };

  const handlePriceChange = (val: number) => {
    const num = Math.max(0, val);
    setPrice(num);
    if (num === 0) {
      setPriceLabel('Incluso');
    } else {
      setPriceLabel(`+ R$ ${num.toLocaleString('pt-BR')}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da funcionalidade Ã© obrigatÃ³rio.');
      return;
    }
    if (!label.trim()) {
      setError('O label exibido ao cliente Ã© obrigatÃ³rio.');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria vÃ¡lida para a funcionalidade.');
      return;
    }

    const cleanSlug = slug.trim() || name.trim();
    if (!cleanSlug) {
      setError('Identificador interno/slug invÃ¡lido.');
      return;
    }

    // Checar duplicidade de slug/id
    const isDuplicate = existingFeatures.some(f => f.id === cleanSlug && (!isEditing || f.id !== feature.id));
    if (isDuplicate) {
      setError('JÃ¡ existe uma funcionalidade com este identificador/slug.');
      return;
    }

    onSave({
      id: cleanSlug,
      name: name.trim(),
      label: label.trim(),
      description: description.trim(),
      categoryId,
      price: Number(price) || 0,
      priceLabel: priceLabel.trim() || (price === 0 ? 'Incluso' : `+ R$ ${price}`),
      icon: icon.trim() || 'âœ¨',
      order: Number(order) || 1,
      enabled,
      conditionalRuleId: conditionalRuleId || undefined
    });
    onClose();
  };

  return (
    <div className="config-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="config-modal-card">
        <div className="config-modal-header">
          <div className="config-modal-icon-badge">
            <Sparkles size={18} />
          </div>
          <div className="config-modal-title-group">
            <h3>{isEditing ? 'Editar Funcionalidade' : 'Nova Funcionalidade'}</h3>
            <p>Configure regras, precificaÃ§Ã£o e exibiÃ§Ã£o da funcionalidade no briefing.</p>
          </div>
          <button type="button" className="config-modal-close" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        <form id="feature-modal-form" onSubmit={handleSubmit} className="config-modal-form">
          {error && (
            <div className="config-modal-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>Nome Interno *</label>
              <input
                type="text"
                placeholder="Ex: Loja & E-commerce"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="config-input"
                autoFocus
              />
            </div>

            <div className="config-form-group">
              <label>Label exibida ao cliente *</label>
              <input
                type="text"
                placeholder="Ex: Loja & E-commerce"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="config-input"
              />
            </div>
          </div>

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>Categoria *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="config-select"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name} {!c.enabled ? '(Inativa)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="config-form-group">
              <label>Identificador Interno (slug) *</label>
              <input
                type="text"
                placeholder="ex: ecommerce"
                value={slug}
                disabled={isEditing}
                onChange={e => setSlug(e.target.value)}
                className="config-input"
              />
            </div>
          </div>

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>PreÃ§o Adicional (R$)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={e => handlePriceChange(Number(e.target.value))}
                className="config-input"
              />
              <small className="config-field-hint">Defina 0 para funcionalidade inclusa no projeto.</small>
            </div>

            <div className="config-form-group">
              <label>Label de PreÃ§o</label>
              <input
                type="text"
                placeholder="ex: Incluso, + R$ 1.800"
                value={priceLabel}
                onChange={e => setPriceLabel(e.target.value)}
                className="config-input"
              />
            </div>
          </div>

          <div className="config-form-row two-cols">
            <div className="config-form-group">
              <label>Ãcone ou Emoji</label>
              <div className="config-emoji-picker-row">
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="config-input icon-input"
                  maxLength={4}
                />
                <div className="config-quick-emojis">
                  {COMMON_FEATURE_EMOJIS.map(em => (
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
              <label>Ordem de ExibiÃ§Ã£o</label>
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
            <label>Regra / Bloco Condicional Vinculado</label>
            <select
              value={conditionalRuleId}
              onChange={e => setConditionalRuleId(e.target.value)}
              className="config-select"
            >
              <option value="">Nenhum bloco adicional (apenas seleÃ§Ã£o simples)</option>
              <option value="ecommerce">E-commerce (quantidade de produtos, gateways, plataforma atual)</option>
              <option value="booking">Agendamento (tipo de serviÃ§o, profissionais, agenda online)</option>
              <option value="login">Ãrea do Cliente (finalidade do acesso, portal exclusivo)</option>
            </select>
            <small className="config-field-hint">
              Quando selecionada pelo cliente, aciona a exibiÃ§Ã£o do bloco de perguntas correspondente.
            </small>
          </div>

          <div className="config-form-group">
            <label>DescriÃ§Ã£o detalhada (opcional)</label>
            <textarea
              rows={2}
              placeholder="Explique o que este mÃ³dulo contempla..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="config-textarea"
            />
          </div>

          <div className="config-form-group toggle-row">
            <div>
              <strong>Funcionalidade Ativa</strong>
              <small>Quando inativa, nÃ£o aparece para novos clientes e nÃ£o entra no orÃ§amento.</small>
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
        </form>

        <div className="config-modal-footer">
          <button type="button" className="config-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="feature-modal-form" className="config-save-btn">
            <Check size={16} />
            <span>{isEditing ? 'Salvar Funcionalidade' : 'Criar Funcionalidade'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

