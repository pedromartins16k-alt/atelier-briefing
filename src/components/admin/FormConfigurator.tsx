import React, { useEffect, useState, useCallback } from 'react';
import { Save, Plus, Trash2, RefreshCw, Palette, Tag, Settings2, CheckCircle2 } from 'lucide-react';
import type { FormConfig, ColorPalette, FormOptionConfig } from '../../types';
import { getFormConfig, saveFormConfig, DEFAULT_FORM_CONFIG } from '../../services/formConfigService';

type TabId = 'palettes' | 'options' | 'prices';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export default function FormConfigurator() {
  const [config, setConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>('palettes');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFormConfig().then(c => {
      setConfig(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFormConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const updatePalette = useCallback((id: string, patch: Partial<ColorPalette>) => {
    setConfig(prev => ({
      ...prev,
      palettes: prev.palettes.map(p => p.id === id ? { ...p, ...patch } : p)
    }));
  }, []);

  const updatePaletteColor = useCallback((paletteId: string, colorKey: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      palettes: prev.palettes.map(p =>
        p.id === paletteId ? { ...p, colors: { ...p.colors, [colorKey]: value } } : p
      )
    }));
  }, []);

  const addPalette = () => {
    const newPalette: ColorPalette = {
      id: `custom-${Date.now()}`,
      name: 'Nova Paleta',
      emoji: '🎨',
      enabled: true,
      colors: {
        primary: '#6B5E4E',
        secondary: '#9B8E7E',
        accent: '#C9A96E',
        background: '#FAFAF8',
        surface: '#F4F0EB',
        text: '#2C2520'
      }
    };
    setConfig(prev => ({ ...prev, palettes: [...prev.palettes, newPalette] }));
  };

  const deletePalette = (id: string) => {
    setConfig(prev => ({ ...prev, palettes: prev.palettes.filter(p => p.id !== id) }));
  };

  const updateOption = useCallback((
    field: 'featureOptions' | 'pageOptions',
    id: string,
    patch: Partial<FormOptionConfig>
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: (prev[field] as FormOptionConfig[]).map(o => o.id === id ? { ...o, ...patch } : o)
    }));
  }, []);

  const updateBasePrices = (key: keyof FormConfig['basePrices'], value: number) => {
    setConfig(prev => ({
      ...prev,
      basePrices: { ...prev.basePrices, [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="form-config-loading">
        <RefreshCw size={20} className="spin-icon" />
        <span>Carregando configurações…</span>
      </div>
    );
  }

  return (
    <div className="form-configurator">
      <div className="config-header">
        <div className="config-header-info">
          <h1>Configurador de Formulário</h1>
          <p>Gerencie paletas de cores, opções e preços exibidos no formulário do cliente.</p>
        </div>
        <button
          type="button"
          className={'config-save-btn ' + (saved ? 'is-saved' : '')}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{saving ? 'Salvando…' : saved ? 'Salvo!' : 'Salvar Configurações'}</span>
        </button>
      </div>

      {/* Abas */}
      <div className="config-tabs">
        <button type="button" className={'config-tab ' + (activeTab === 'palettes' ? 'is-active' : '')} onClick={() => setActiveTab('palettes')}>
          <Palette size={15} /> Paletas de Cores
        </button>
        <button type="button" className={'config-tab ' + (activeTab === 'options' ? 'is-active' : '')} onClick={() => setActiveTab('options')}>
          <Tag size={15} /> Opções & Módulos
        </button>
        <button type="button" className={'config-tab ' + (activeTab === 'prices' ? 'is-active' : '')} onClick={() => setActiveTab('prices')}>
          <Settings2 size={15} /> Preços Base
        </button>
      </div>

      {/* Aba: Paletas */}
      {activeTab === 'palettes' && (
        <div className="config-section">
          <div className="config-section-header">
            <span>{config.palettes.length} paleta(s) configurada(s)</span>
            <button type="button" className="config-add-btn" onClick={addPalette}>
              <Plus size={14} /> Nova paleta
            </button>
          </div>

          <div className="config-palettes-list">
            {config.palettes.map(palette => (
              <div key={palette.id} className={'config-palette-card ' + (palette.enabled ? '' : 'is-disabled')}>
                <div className="palette-card-head">
                  <div className="palette-card-swatches">
                    {Object.values(palette.colors).slice(0, 4).map((c, i) => (
                      <span key={i} style={{ background: c }} className="config-swatch" title={c} />
                    ))}
                  </div>
                  <div className="palette-card-meta">
                    <input
                      type="text"
                      value={palette.name}
                      className="palette-name-input"
                      onChange={e => updatePalette(palette.id, { name: e.target.value })}
                      placeholder="Nome da paleta"
                    />
                    <input
                      type="text"
                      value={palette.emoji || ''}
                      className="palette-emoji-input"
                      onChange={e => updatePalette(palette.id, { emoji: e.target.value })}
                      placeholder="Emoji"
                      maxLength={4}
                    />
                  </div>
                  <div className="palette-card-actions">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={palette.enabled}
                        onChange={e => updatePalette(palette.id, { enabled: e.target.checked })}
                      />
                      <span className="toggle-track" />
                    </label>
                    <button type="button" className="config-delete-btn" onClick={() => deletePalette(palette.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="palette-colors-grid">
                  {(Object.entries(palette.colors) as [string, string][]).map(([key, value]) => (
                    <label key={key} className="palette-color-field">
                      <input
                        type="color"
                        value={value}
                        onChange={e => updatePaletteColor(palette.id, key, e.target.value)}
                        className="palette-color-input"
                      />
                      <div className="palette-color-preview" style={{ background: value }} />
                      <div className="palette-color-info">
                        <span className="palette-color-key">{key}</span>
                        <span className="palette-color-hex">{value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba: Opções & Módulos */}
      {activeTab === 'options' && (
        <div className="config-section">
          <h3 className="config-sub-title">Funcionalidades</h3>
          <div className="config-options-table">
            <div className="config-options-header">
              <span>Opção</span>
              <span>Categoria</span>
              <span>Preço (R$)</span>
              <span>Label</span>
              <span>Ativo</span>
            </div>
            {config.featureOptions.map(opt => (
              <div key={opt.id} className={'config-option-row ' + (opt.enabled ? '' : 'is-disabled')}>
                <span className="option-label-text">{opt.label}</span>
                <input
                  type="text"
                  value={opt.category || ''}
                  className="option-field-sm"
                  onChange={e => updateOption('featureOptions', opt.id, { category: e.target.value })}
                />
                <input
                  type="number"
                  value={opt.price || 0}
                  min={0}
                  className="option-field-sm"
                  onChange={e => updateOption('featureOptions', opt.id, { price: Number(e.target.value) })}
                />
                <input
                  type="text"
                  value={opt.priceLabel || ''}
                  className="option-field-sm"
                  placeholder="ex: + R$ 850"
                  onChange={e => updateOption('featureOptions', opt.id, { priceLabel: e.target.value })}
                />
                <label className="toggle-switch sm">
                  <input
                    type="checkbox"
                    checked={opt.enabled}
                    onChange={e => updateOption('featureOptions', opt.id, { enabled: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
          </div>

          <h3 className="config-sub-title" style={{ marginTop: '32px' }}>Páginas</h3>
          <div className="config-options-table">
            <div className="config-options-header">
              <span>Página</span>
              <span>Categoria</span>
              <span>Preço (R$)</span>
              <span>Label</span>
              <span>Ativo</span>
            </div>
            {config.pageOptions.map(opt => (
              <div key={opt.id} className={'config-option-row ' + (opt.enabled ? '' : 'is-disabled')}>
                <span className="option-label-text">{opt.label}</span>
                <input
                  type="text"
                  value={opt.category || ''}
                  className="option-field-sm"
                  onChange={e => updateOption('pageOptions', opt.id, { category: e.target.value })}
                />
                <input
                  type="number"
                  value={opt.price || 0}
                  min={0}
                  className="option-field-sm"
                  onChange={e => updateOption('pageOptions', opt.id, { price: Number(e.target.value) })}
                />
                <input
                  type="text"
                  value={opt.priceLabel || ''}
                  className="option-field-sm"
                  placeholder="ex: + R$ 250"
                  onChange={e => updateOption('pageOptions', opt.id, { priceLabel: e.target.value })}
                />
                <label className="toggle-switch sm">
                  <input
                    type="checkbox"
                    checked={opt.enabled}
                    onChange={e => updateOption('pageOptions', opt.id, { enabled: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba: Preços Base */}
      {activeTab === 'prices' && (
        <div className="config-section">
          <p className="config-section-desc">Estes são os valores base usados no cálculo da estimativa exibida ao cliente.</p>
          <div className="config-prices-grid">
            {([
              { key: 'base', label: 'Projeto Base & Arquitetura', desc: 'Valor base de todo projeto' },
              { key: 'extraPagePrice', label: 'Página Adicional (por unidade)', desc: 'Valor por página além das incluídas' },
              { key: 'copywritingPrice', label: 'Redação & Curadoria de Conteúdo', desc: 'Quando agência produz o conteúdo' },
              { key: 'integrationPriceEach', label: 'Integração de Software (por unidade)', desc: 'Cada integração externa' },
            ] as { key: keyof FormConfig['basePrices']; label: string; desc: string }[]).map(item => (
              <div key={item.key} className="config-price-field">
                <div className="config-price-info">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </div>
                <div className="config-price-input-wrap">
                  <span className="price-prefix">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={config.basePrices[item.key]}
                    className="config-price-input"
                    onChange={e => updateBasePrices(item.key, Number(e.target.value))}
                  />
                </div>
                <span className="config-price-formatted">{formatCurrency(config.basePrices[item.key])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
