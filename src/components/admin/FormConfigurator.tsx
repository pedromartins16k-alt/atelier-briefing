import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Save, Plus, Trash2, RefreshCw, Palette, Tag, Settings2, CheckCircle2,
  Layers, Type, Eye, Edit2, ArrowUp, ArrowDown, AlertTriangle, Sparkles, Check
} from 'lucide-react';
import type {
  FormConfig,
  ColorPalette,
  DynamicCategory,
  DynamicFeature,
  DynamicStep,
  QuestionOption
} from '../../types';
import {
  getFormConfig,
  saveFormConfig,
  DEFAULT_FORM_CONFIG
} from '../../services/formConfigService';
import CategoryModal from './CategoryModal';
import FeatureModal from './FeatureModal';
import OptionModal from './OptionModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import BriefingFlow from '../BriefingFlow';

type TabId = 'palettes' | 'features' | 'categories' | 'steps' | 'prices' | 'ui' | 'preview';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(val);
}

export default function FormConfigurator() {
  const [config, setConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>('features');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modais de Funcionalidade
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<DynamicFeature | null>(null);
  const [featureToDelete, setFeatureToDelete] = useState<DynamicFeature | null>(null);

  // Modais de Categoria
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DynamicCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<DynamicCategory | null>(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState<string | null>(null);

  // Modais de Opções do Briefing
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [optionContext, setOptionContext] = useState<{ stepId: string; questionId: string; title: string; hasPrice?: boolean } | null>(null);
  const [optionToDelete, setOptionToDelete] = useState<{ stepId: string; questionId: string; optionId: string; label: string } | null>(null);

  // Expansão de etapas no CMS de Briefing
  const [expandedStepId, setExpandedStepId] = useState<string | null>('goals');

  // Filtro de categoria na lista de funcionalidades
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    getFormConfig().then(c => {
      setConfig(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (overrideConfig?: FormConfig) => {
    const toSave = overrideConfig || config;
    setSaving(true);
    try {
      await saveFormConfig(toSave);
      setSaved(true);
      showToast('Configurações salvas com sucesso!');
      setTimeout(() => setSaved(false), 2500);
    } catch {
      showToast('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // PALETAS
  // ============================================================
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
      order: config.palettes.length + 1,
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
    showToast('Nova paleta adicionada.');
  };

  const deletePalette = (id: string) => {
    setConfig(prev => ({ ...prev, palettes: prev.palettes.filter(p => p.id !== id) }));
    showToast('Paleta excluída.');
  };

  // ============================================================
  // FUNCIONALIDADES (CRUD Completo)
  // ============================================================
  const handleSaveFeature = (feature: DynamicFeature) => {
    setConfig(prev => {
      const exists = prev.features.some(f => f.id === feature.id);
      let updated: DynamicFeature[];
      if (exists) {
        updated = prev.features.map(f => f.id === feature.id ? feature : f);
        showToast(`Funcionalidade "${feature.name}" atualizada.`);
      } else {
        updated = [...prev.features, feature];
        showToast(`Funcionalidade "${feature.name}" criada com sucesso.`);
      }
      return {
        ...prev,
        features: updated.sort((a, b) => a.order - b.order)
      };
    });
  };

  const handleDeleteFeatureConfirm = () => {
    if (!featureToDelete) return;
    const name = featureToDelete.name;
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureToDelete.id)
    }));
    setFeatureToDelete(null);
    showToast(`Funcionalidade "${name}" excluída.`);
  };

  const toggleFeatureActive = (id: string, active: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.map(f => f.id === id ? { ...f, enabled: active } : f)
    }));
  };

  const moveFeatureOrder = (index: number, direction: 'up' | 'down') => {
    const list = [...config.features];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    // Reajusta ordens numéricas
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setConfig(prev => ({ ...prev, features: reordered }));
  };

  // ============================================================
  // CATEGORIAS (CRUD Completo)
  // ============================================================
  const handleSaveCategory = (category: DynamicCategory) => {
    setConfig(prev => {
      const exists = prev.categories.some(c => c.id === category.id);
      let updated: DynamicCategory[];
      if (exists) {
        updated = prev.categories.map(c => c.id === category.id ? category : c);
        showToast(`Categoria "${category.name}" atualizada.`);
      } else {
        updated = [...prev.categories, category];
        showToast(`Categoria "${category.name}" criada com sucesso.`);
      }
      return {
        ...prev,
        categories: updated.sort((a, b) => a.order - b.order)
      };
    });
  };

  const handleRequestDeleteCategory = (cat: DynamicCategory) => {
    const linkedCount = config.features.filter(f => f.categoryId === cat.id).length;
    if (linkedCount > 0) {
      setCategoryDeleteError(
        `Não é possível excluir a categoria "${cat.name}" pois existem ${linkedCount} funcionalidade(s) vinculada(s) a ela. Reatribua ou exclua as funcionalidades primeiro.`
      );
      return;
    }
    setCategoryToDelete(cat);
  };

  const handleDeleteCategoryConfirm = () => {
    if (!categoryToDelete) return;
    const name = categoryToDelete.name;
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryToDelete.id)
    }));
    setCategoryToDelete(null);
    showToast(`Categoria "${name}" excluída.`);
  };

  const toggleCategoryActive = (id: string, active: boolean) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, enabled: active } : c)
    }));
  };

  const moveCategoryOrder = (index: number, direction: 'up' | 'down') => {
    const list = [...config.categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setConfig(prev => ({ ...prev, categories: reordered }));
  };

  // ============================================================
  // ETAPAS E CMS DO BRIEFING
  // ============================================================
  const updateStep = (id: string, patch: Partial<DynamicStep>) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, ...patch } : s)
    }));
  };

  const handleSaveOption = (option: QuestionOption) => {
    if (!optionContext) return;
    const { stepId, questionId } = optionContext;

    setConfig(prev => {
      // Caso especial: página inicial / pageOptions
      if (stepId === 'structure' && questionId === 'selectedPages') {
        const existingPages = prev.pageOptions || [];
        const exists = existingPages.some(p => p.id === option.id);
        const updatedPages = exists
          ? existingPages.map(p => p.id === option.id ? option : p)
          : [...existingPages, option];
        return {
          ...prev,
          pageOptions: updatedPages.sort((a, b) => a.order - b.order)
        };
      }

      // Atualiza na árvore de steps -> questions -> options
      const updatedSteps = prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const updatedQuestions = (s.questions || []).map(q => {
          if (q.id !== questionId) return q;
          const currentOptions = q.options || [];
          const exists = currentOptions.some(o => o.id === option.id);
          const nextOptions = exists
            ? currentOptions.map(o => o.id === option.id ? option : o)
            : [...currentOptions, option];
          return { ...q, options: nextOptions.sort((a, b) => a.order - b.order) };
        });
        return { ...s, questions: updatedQuestions };
      });

      return { ...prev, steps: updatedSteps };
    });

    showToast(`Opção "${option.label}" salva.`);
  };

  const handleDeleteOptionConfirm = () => {
    if (!optionToDelete) return;
    const { stepId, questionId, optionId, label } = optionToDelete;

    setConfig(prev => {
      if (stepId === 'structure' && questionId === 'selectedPages') {
        return {
          ...prev,
          pageOptions: (prev.pageOptions || []).filter(p => p.id !== optionId)
        };
      }

      const updatedSteps = prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const updatedQuestions = (s.questions || []).map(q => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: (q.options || []).filter(o => o.id !== optionId)
          };
        });
        return { ...s, questions: updatedQuestions };
      });
      return { ...prev, steps: updatedSteps };
    });

    setOptionToDelete(null);
    showToast(`Opção "${label}" excluída.`);
  };

  const toggleOptionActive = (stepId: string, questionId: string, optionId: string, active: boolean) => {
    setConfig(prev => {
      if (stepId === 'structure' && questionId === 'selectedPages') {
        return {
          ...prev,
          pageOptions: (prev.pageOptions || []).map(p => p.id === optionId ? { ...p, enabled: active } : p)
        };
      }
      const updatedSteps = prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const updatedQuestions = (s.questions || []).map(q => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: (q.options || []).map(o => o.id === optionId ? { ...o, enabled: active } : o)
          };
        });
        return { ...s, questions: updatedQuestions };
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  // ============================================================
  // PREÇOS BASE
  // ============================================================
  const updateBasePrices = (key: keyof FormConfig['basePrices'], value: number) => {
    setConfig(prev => ({
      ...prev,
      basePrices: { ...prev.basePrices, [key]: Math.max(0, value) }
    }));
  };

  // ============================================================
  // UI SETTINGS
  // ============================================================
  const updateUiSettings = (key: keyof FormConfig['uiSettings'], value: string) => {
    setConfig(prev => ({
      ...prev,
      uiSettings: { ...prev.uiSettings, [key]: value }
    }));
  };

  // Categorias mapeadas por ID para consulta rápida
  const categoriesMap = useMemo(() => {
    return new Map(config.categories.map(c => [c.id, c]));
  }, [config.categories]);

  // Funcionalidades filtradas
  const filteredFeatures = useMemo(() => {
    const list = [...config.features];
    if (featureCategoryFilter === 'all') return list;
    return list.filter(f => f.categoryId === featureCategoryFilter);
  }, [config.features, featureCategoryFilter]);

  if (loading) {
    return (
      <div className="form-config-loading">
        <RefreshCw size={24} className="spin-icon" />
        <span>Carregando configurações dinâmicas do Atelier…</span>
      </div>
    );
  }

  return (
    <div className="form-configurator">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="config-toast" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="config-header">
        <div className="config-header-info">
          <h1>CMS & Configurador de Briefing</h1>
          <p>Controle total sobre o briefing: funcionalidades, categorias, preços, etapas e textos em tempo real.</p>
        </div>
        <div className="config-header-actions">
          <button
            type="button"
            className={'config-save-btn ' + (saved ? 'is-saved' : '')}
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            <span>{saving ? 'Salvando…' : saved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="config-tabs">
        <button
          type="button"
          className={'config-tab ' + (activeTab === 'features' ? 'is-active' : '')}
          onClick={() => setActiveTab('features')}
        >
          <Sparkles size={15} /> Funcionalidades & Módulos
          <span className="tab-count-badge">{config.features.length}</span>
        </button>

        <button
          type="button"
          className={'config-tab ' + (activeTab === 'categories' ? 'is-active' : '')}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={15} /> Categorias
          <span className="tab-count-badge">{config.categories.length}</span>
        </button>

        <button
          type="button"
          className={'config-tab ' + (activeTab === 'steps' ? 'is-active' : '')}
          onClick={() => setActiveTab('steps')}
        >
          <Layers size={15} /> Estrutura & Perguntas
          <span className="tab-count-badge">{config.steps.length}</span>
        </button>

        <button
          type="button"
          className={'config-tab ' + (activeTab === 'palettes' ? 'is-active' : '')}
          onClick={() => setActiveTab('palettes')}
        >
          <Palette size={15} /> Paletas de Cores
          <span className="tab-count-badge">{config.palettes.length}</span>
        </button>

        <button
          type="button"
          className={'config-tab ' + (activeTab === 'prices' ? 'is-active' : '')}
          onClick={() => setActiveTab('prices')}
        >
          <Settings2 size={15} /> Preços Base
        </button>

        <button
          type="button"
          className={'config-tab ' + (activeTab === 'ui' ? 'is-active' : '')}
          onClick={() => setActiveTab('ui')}
        >
          <Type size={15} /> Textos & UI
        </button>

        <button
          type="button"
          className={'config-tab tab-preview ' + (activeTab === 'preview' ? 'is-active' : '')}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={15} /> Visualizar Briefing
        </button>
      </div>

      {/* ============================================================ */}
      {/* ABA: FUNCIONALIDADES & MÓDULOS */}
      {/* ============================================================ */}
      {activeTab === 'features' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Módulos e Recursos Interativos</h3>
              <span className="config-section-desc">
                Crie, edite e precifique funcionalidades. A ordem e ativação aqui configuradas serão refletidas diretamente no briefing do cliente.
              </span>
            </div>
            <button
              type="button"
              className="config-add-btn primary-action"
              onClick={() => {
                setSelectedFeature(null);
                setFeatureModalOpen(true);
              }}
            >
              <Plus size={15} /> + Nova Funcionalidade
            </button>
          </div>

          {/* Barra de Filtros */}
          <div className="config-filter-bar">
            <span className="filter-label">Filtrar por Categoria:</span>
            <div className="filter-pills">
              <button
                type="button"
                className={'filter-pill ' + (featureCategoryFilter === 'all' ? 'active' : '')}
                onClick={() => setFeatureCategoryFilter('all')}
              >
                Todas ({config.features.length})
              </button>
              {config.categories.map(c => {
                const count = config.features.filter(f => f.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={'filter-pill ' + (featureCategoryFilter === c.id ? 'active' : '')}
                    onClick={() => setFeatureCategoryFilter(c.id)}
                  >
                    {c.icon} {c.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabela Completa de Funcionalidades */}
          <div className="config-cms-table-wrapper">
            <table className="config-cms-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Ordem</th>
                  <th>Funcionalidade</th>
                  <th>Categoria</th>
                  <th style={{ textAlign: 'right' }}>Preço</th>
                  <th>Label Cliente</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.map((feat, idx) => {
                  const cat = categoriesMap.get(feat.categoryId);
                  const isCatDisabled = cat && !cat.enabled;
                  return (
                    <tr
                      key={feat.id}
                      className={!feat.enabled || isCatDisabled ? 'row-disabled' : ''}
                    >
                      <td className="col-order">
                        <div className="order-stepper">
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === 0}
                            onClick={() => moveFeatureOrder(idx, 'up')}
                            title="Mover para cima"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <span className="order-num">{feat.order}</span>
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === filteredFeatures.length - 1}
                            onClick={() => moveFeatureOrder(idx, 'down')}
                            title="Mover para baixo"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="col-name">
                        <div className="item-with-icon">
                          <span className="item-emoji">{feat.icon || '✨'}</span>
                          <div>
                            <strong>{feat.label || feat.name}</strong>
                            {feat.description && <small>{feat.description}</small>}
                            {feat.conditionalRuleId && (
                              <span className="conditional-tag">
                                ⚡ Bloco: {feat.conditionalRuleId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="col-category">
                        <span className={'category-badge ' + (isCatDisabled ? 'badge-disabled' : '')}>
                          {cat?.icon || '📁'} {cat?.name || feat.categoryId}
                          {isCatDisabled && ' (Cat. Inativa)'}
                        </span>
                      </td>

                      <td className="col-price" style={{ textAlign: 'right' }}>
                        <span className={feat.price === 0 ? 'price-included' : 'price-amount'}>
                          {feat.price === 0 ? 'Incluso' : formatCurrency(feat.price)}
                        </span>
                      </td>

                      <td className="col-label">
                        <code className="price-label-badge">{feat.priceLabel}</code>
                      </td>

                      <td className="col-status" style={{ textAlign: 'center' }}>
                        <label className="toggle-switch sm" title={feat.enabled ? 'Ativo' : 'Inativo'}>
                          <input
                            type="checkbox"
                            checked={feat.enabled}
                            onChange={e => toggleFeatureActive(feat.id, e.target.checked)}
                          />
                          <span className="toggle-track" />
                        </label>
                      </td>

                      <td className="col-actions" style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="action-btn edit-action"
                            title="Editar funcionalidade"
                            onClick={() => {
                              setSelectedFeature(feat);
                              setFeatureModalOpen(true);
                            }}
                          >
                            <Edit2 size={13} /> Editar
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-action"
                            title="Excluir funcionalidade"
                            onClick={() => setFeatureToDelete(feat)}
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA: CATEGORIAS */}
      {/* ============================================================ */}
      {activeTab === 'categories' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Categorias Dinâmicas</h3>
              <span className="config-section-desc">
                Crie e gerencie as categorias que agrupam as funcionalidades do briefing.
              </span>
            </div>
            <button
              type="button"
              className="config-add-btn primary-action"
              onClick={() => {
                setSelectedCategory(null);
                setCategoryModalOpen(true);
              }}
            >
              <Plus size={15} /> + Nova Categoria
            </button>
          </div>

          <div className="config-cms-table-wrapper">
            <table className="config-cms-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Ordem</th>
                  <th>Categoria</th>
                  <th>Slug / Identificador</th>
                  <th>Descrição</th>
                  <th style={{ textAlign: 'center' }}>Módulos Vinculados</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {config.categories.map((cat, idx) => {
                  const linkedCount = config.features.filter(f => f.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className={!cat.enabled ? 'row-disabled' : ''}>
                      <td className="col-order">
                        <div className="order-stepper">
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === 0}
                            onClick={() => moveCategoryOrder(idx, 'up')}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <span className="order-num">{cat.order}</span>
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === config.categories.length - 1}
                            onClick={() => moveCategoryOrder(idx, 'down')}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="col-name">
                        <div className="item-with-icon">
                          <span className="item-emoji">{cat.icon || '📁'}</span>
                          <strong>{cat.name}</strong>
                        </div>
                      </td>

                      <td>
                        <code>{cat.id}</code>
                      </td>

                      <td>
                        <span className="desc-text">{cat.description || '—'}</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="linked-count-badge">
                          {linkedCount} {linkedCount === 1 ? 'funcionalidade' : 'funcionalidades'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <label className="toggle-switch sm">
                          <input
                            type="checkbox"
                            checked={cat.enabled}
                            onChange={e => toggleCategoryActive(cat.id, e.target.checked)}
                          />
                          <span className="toggle-track" />
                        </label>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="action-btn edit-action"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                          >
                            <Edit2 size={13} /> Editar
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-action"
                            onClick={() => handleRequestDeleteCategory(cat)}
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA: ESTRUTURA DO BRIEFING & PERGUNTAS */}
      {/* ============================================================ */}
      {activeTab === 'steps' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Estrutura das Etapas & Opções de Resposta</h3>
              <span className="config-section-desc">
                Personalize os títulos, subtítulos, visibilidade de etapas e as opções de resposta selecionáveis (objetivos, páginas, materiais, etc.).
              </span>
            </div>
          </div>

          <div className="steps-accordion-list">
            {config.steps.map(step => {
              const isExpanded = expandedStepId === step.id;

              // Obtém perguntas ou opções associadas à etapa
              let optionsToManage: { title: string; questionId: string; options: QuestionOption[]; hasPrice?: boolean } | null = null;

              if (step.id === 'goals') {
                const q = step.questions?.find(x => x.id === 'mainGoals');
                if (q) optionsToManage = { title: 'Objetivos do Site', questionId: 'mainGoals', options: q.options || [] };
              } else if (step.id === 'structure') {
                optionsToManage = { title: 'Páginas do Site', questionId: 'selectedPages', options: config.pageOptions || [], hasPrice: true };
              } else if (step.id === 'identity') {
                const q = step.questions?.find(x => x.id === 'brandPerceptions');
                if (q) optionsToManage = { title: 'Percepções Visuais', questionId: 'brandPerceptions', options: q.options || [] };
              } else if (step.id === 'materials') {
                const q = step.questions?.find(x => x.id === 'existingMaterials');
                if (q) optionsToManage = { title: 'Materiais Disponíveis', questionId: 'existingMaterials', options: q.options || [] };
              } else if (step.id === 'integrations') {
                const q = step.questions?.find(x => x.id === 'integrations');
                if (q) optionsToManage = { title: 'Sistemas Integrados', questionId: 'integrations', options: q.options || [] };
              } else if (step.id === 'restrictions') {
                const q = step.questions?.find(x => x.id === 'unwantedElements');
                if (q) optionsToManage = { title: 'O que evitar (Linhas Vermelhas)', questionId: 'unwantedElements', options: q.options || [] };
              } else if (step.id === 'timeline') {
                const q = step.questions?.find(x => x.id === 'investmentRange');
                if (q) optionsToManage = { title: 'Faixas de Investimento', questionId: 'investmentRange', options: q.options || [] };
              }

              return (
                <div key={step.id} className={'step-accordion-card ' + (!step.enabled ? 'is-disabled' : '')}>
                  <div className="step-accordion-head" onClick={() => setExpandedStepId(isExpanded ? null : step.id)}>
                    <div className="step-head-left">
                      <span className="step-index-badge">{String(step.stepNumber).padStart(2, '0')}</span>
                      <div className="step-head-titles">
                        <strong>{step.label} — {step.title}</strong>
                        <small>{step.subtitle}</small>
                      </div>
                    </div>

                    <div className="step-head-actions" onClick={e => e.stopPropagation()}>
                      <label className="toggle-switch sm" title={step.enabled ? 'Etapa ativa' : 'Etapa inativa'}>
                        <input
                          type="checkbox"
                          checked={step.enabled}
                          onChange={e => updateStep(step.id, { enabled: e.target.checked })}
                        />
                        <span className="toggle-track" />
                      </label>
                      <button
                        type="button"
                        className="step-toggle-btn"
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      >
                        {isExpanded ? 'Recolher ▲' : 'Gerenciar ▼'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="step-accordion-body">
                      {/* Edição de Títulos da Etapa */}
                      <div className="step-edit-meta-grid">
                        <div className="config-form-group">
                          <label>Nome no Stepper (curto)</label>
                          <input
                            type="text"
                            value={step.label}
                            onChange={e => updateStep(step.id, { label: e.target.value })}
                            className="config-input"
                          />
                        </div>

                        <div className="config-form-group">
                          <label>Eyebrow / Tag superior</label>
                          <input
                            type="text"
                            value={step.eyebrow || ''}
                            onChange={e => updateStep(step.id, { eyebrow: e.target.value })}
                            className="config-input"
                          />
                        </div>

                        <div className="config-form-group full-col">
                          <label>Título da Página</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={e => updateStep(step.id, { title: e.target.value })}
                            className="config-input"
                          />
                        </div>

                        <div className="config-form-group full-col">
                          <label>Subtítulo / Instrução</label>
                          <textarea
                            rows={2}
                            value={step.subtitle}
                            onChange={e => updateStep(step.id, { subtitle: e.target.value })}
                            className="config-textarea"
                          />
                        </div>
                      </div>

                      {/* Gerenciador de Opções da Etapa (se houver) */}
                      {optionsToManage && (
                        <div className="step-options-manager">
                          <div className="step-options-header">
                            <div>
                              <h4>Opções Dinâmicas: {optionsToManage.title}</h4>
                              <small>Edite, adicione ou ative/desative as alternativas apresentadas ao cliente nesta etapa.</small>
                            </div>
                            <button
                              type="button"
                              className="config-add-btn sm"
                              onClick={() => {
                                setSelectedOption(null);
                                setOptionContext({
                                  stepId: step.id,
                                  questionId: optionsToManage!.questionId,
                                  title: optionsToManage!.title,
                                  hasPrice: optionsToManage!.hasPrice
                                });
                                setOptionModalOpen(true);
                              }}
                            >
                              <Plus size={13} /> Adicionar Opção
                            </button>
                          </div>

                          <div className="step-options-chips-list">
                            {optionsToManage.options.map(opt => (
                              <div
                                key={opt.id}
                                className={'option-chip ' + (!opt.enabled ? 'is-chip-disabled' : '')}
                              >
                                <span className="chip-label">{opt.label}</span>
                                {opt.price && opt.price > 0 && (
                                  <span className="chip-price">+{formatCurrency(opt.price)}</span>
                                )}
                                <div className="chip-actions">
                                  <label className="toggle-switch sm" title={opt.enabled ? 'Ativo' : 'Inativo'}>
                                    <input
                                      type="checkbox"
                                      checked={opt.enabled}
                                      onChange={e => toggleOptionActive(step.id, optionsToManage!.questionId, opt.id, e.target.checked)}
                                    />
                                    <span className="toggle-track" />
                                  </label>
                                  <button
                                    type="button"
                                    className="chip-btn"
                                    title="Editar"
                                    onClick={() => {
                                      setSelectedOption(opt);
                                      setOptionContext({
                                        stepId: step.id,
                                        questionId: optionsToManage!.questionId,
                                        title: optionsToManage!.title,
                                        hasPrice: optionsToManage!.hasPrice
                                      });
                                      setOptionModalOpen(true);
                                    }}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    className="chip-btn del"
                                    title="Excluir"
                                    onClick={() => setOptionToDelete({
                                      stepId: step.id,
                                      questionId: optionsToManage!.questionId,
                                      optionId: opt.id,
                                      label: opt.label
                                    })}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA: PALETAS DE CORES */}
      {/* ============================================================ */}
      {activeTab === 'palettes' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Paletas de Cores do Briefing</h3>
              <span className="config-section-desc">Gerencie as paletas de cores disponíveis para os clientes selecionarem na etapa de Identidade Visual.</span>
            </div>
            <button type="button" className="config-add-btn primary-action" onClick={addPalette}>
              <Plus size={14} /> Nova Paleta
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

      {/* ============================================================ */}
      {/* ABA: PREÇOS BASE */}
      {/* ============================================================ */}
      {activeTab === 'prices' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Preços Base & Arquitetura de Orçamento</h3>
              <span className="config-section-desc">Valores fundamentais utilizados pelo simulador em tempo real durante o preenchimento do cliente.</span>
            </div>
          </div>

          <div className="config-prices-grid">
            {([
              { key: 'base', label: 'Projeto Base & Arquitetura', desc: 'Valor inicial e estruturação de todo projeto' },
              { key: 'extraPagePrice', label: 'Página Adicional (por unidade)', desc: 'Valor por página adicional além das incluídas' },
              { key: 'copywritingPrice', label: 'Redação & Curadoria de Conteúdo', desc: 'Quando o estúdio fica responsável pela redação dos textos' },
              { key: 'integrationPriceEach', label: 'Integração de Software (por unidade)', desc: 'Valor unitário de integração com sistemas externos' },
              { key: 'identityFullPrice', label: 'Identidade Visual Completa', desc: 'Criação de branding do zero para clientes sem logo' },
              { key: 'identityExpandPrice', label: 'Expansão de Identidade Visual', desc: 'Desdobramento para clientes que possuem apenas o logo' }
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
                    value={config.basePrices[item.key] || 0}
                    className="config-price-input"
                    onChange={e => updateBasePrices(item.key, Number(e.target.value))}
                  />
                </div>
                <span className="config-price-formatted">{formatCurrency(config.basePrices[item.key] || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA: TEXTOS & UI */}
      {/* ============================================================ */}
      {activeTab === 'ui' && (
        <div className="config-section">
          <div className="config-section-header">
            <div>
              <h3>Textos da Interface & Botões</h3>
              <span className="config-section-desc">Personalize os rótulos de botões, mensagens de ajuda e avisos exibidos ao cliente.</span>
            </div>
          </div>

          <div className="config-ui-texts-grid">
            <div className="config-form-group">
              <label>Título do Briefing</label>
              <input
                type="text"
                value={config.uiSettings?.briefingTitle || ''}
                onChange={e => updateUiSettings('briefingTitle', e.target.value)}
                className="config-input"
              />
            </div>

            <div className="config-form-group">
              <label>Subtítulo do Briefing</label>
              <input
                type="text"
                value={config.uiSettings?.briefingSubtitle || ''}
                onChange={e => updateUiSettings('briefingSubtitle', e.target.value)}
                className="config-input"
              />
            </div>

            <div className="config-form-row two-cols">
              <div className="config-form-group">
                <label>Texto do Botão Avançar</label>
                <input
                  type="text"
                  value={config.uiSettings?.nextButtonLabel || ''}
                  onChange={e => updateUiSettings('nextButtonLabel', e.target.value)}
                  className="config-input"
                />
              </div>

              <div className="config-form-group">
                <label>Texto do Botão Voltar</label>
                <input
                  type="text"
                  value={config.uiSettings?.prevButtonLabel || ''}
                  onChange={e => updateUiSettings('prevButtonLabel', e.target.value)}
                  className="config-input"
                />
              </div>
            </div>

            <div className="config-form-row two-cols">
              <div className="config-form-group">
                <label>Texto do Botão Finalizar / Enviar</label>
                <input
                  type="text"
                  value={config.uiSettings?.finishButtonLabel || ''}
                  onChange={e => updateUiSettings('finishButtonLabel', e.target.value)}
                  className="config-input"
                />
              </div>

              <div className="config-form-group">
                <label>Texto de Indicador de Salvamento</label>
                <input
                  type="text"
                  value={config.uiSettings?.autoSaveText || ''}
                  onChange={e => updateUiSettings('autoSaveText', e.target.value)}
                  className="config-input"
                />
              </div>
            </div>

            <div className="config-form-group full-col">
              <label>Texto de Disclaimer / Estimativa no Rodapé</label>
              <textarea
                rows={2}
                value={config.uiSettings?.disclaimerText || ''}
                onChange={e => updateUiSettings('disclaimerText', e.target.value)}
                className="config-textarea"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA: VISUALIZAR BRIEFING (LIVE PREVIEW) */}
      {/* ============================================================ */}
      {activeTab === 'preview' && (
        <div className="config-section preview-section">
          <div className="config-preview-banner">
            <div className="banner-left">
              <Eye size={18} />
              <div>
                <strong>Visualização ao Vivo do Briefing</strong>
                <p>Este preview consome em tempo real todas as configurações ativas que você definiu nas abas anteriores.</p>
              </div>
            </div>
            <button
              type="button"
              className="config-save-btn"
              onClick={() => handleSave()}
            >
              <Save size={15} /> Salvar Configurações
            </button>
          </div>

          <div className="live-preview-container">
            <BriefingFlow
              onNavigate={() => {}}
              setProjectId={() => {}}
              previewModeConfig={config}
            />
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR FUNCIONALIDADE */}
      <FeatureModal
        isOpen={featureModalOpen}
        feature={selectedFeature}
        categories={config.categories}
        existingFeatures={config.features}
        onSave={handleSaveFeature}
        onClose={() => {
          setFeatureModalOpen(false);
          setSelectedFeature(null);
        }}
      />

      {/* MODAL: CRIAR / EDITAR CATEGORIA */}
      <CategoryModal
        isOpen={categoryModalOpen}
        category={selectedCategory}
        existingCategories={config.categories}
        onSave={handleSaveCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
      />

      {/* MODAL: CRIAR / EDITAR OPÇÃO DINÂMICA */}
      <OptionModal
        isOpen={optionModalOpen}
        option={selectedOption}
        title={optionContext?.title || 'Opção'}
        hasPrice={optionContext?.hasPrice}
        onSave={handleSaveOption}
        onClose={() => {
          setOptionModalOpen(false);
          setSelectedOption(null);
          setOptionContext(null);
        }}
      />

      {/* MODAL: CONFIRMAR EXCLUSÃO DE FUNCIONALIDADE */}
      <ConfirmDeleteModal
        isOpen={!!featureToDelete}
        title="Excluir Funcionalidade"
        message={`Tem certeza que deseja excluir a funcionalidade "${featureToDelete?.name}"?`}
        warningDetails="Esta funcionalidade será removida do formulário e não aparecerá para novos clientes."
        onConfirm={handleDeleteFeatureConfirm}
        onClose={() => setFeatureToDelete(null)}
      />

      {/* MODAL: CONFIRMAR EXCLUSÃO DE CATEGORIA */}
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"?`}
        warningDetails="Antes de excluir, certifique-se de que não há funcionalidades vinculadas."
        onConfirm={handleDeleteCategoryConfirm}
        onClose={() => setCategoryToDelete(null)}
      />

      {/* MODAL: ALERTA DE ERRO DE EXCLUSÃO DE CATEGORIA */}
      <ConfirmDeleteModal
        isOpen={!!categoryDeleteError}
        title="Operação Não Permitida"
        message={categoryDeleteError || ''}
        confirmLabel="Entendido"
        isDangerous={false}
        onConfirm={() => setCategoryDeleteError(null)}
        onClose={() => setCategoryDeleteError(null)}
      />

      {/* MODAL: CONFIRMAR EXCLUSÃO DE OPÇÃO */}
      <ConfirmDeleteModal
        isOpen={!!optionToDelete}
        title="Excluir Opção"
        message={`Deseja remover a opção "${optionToDelete?.label}" desta pergunta?`}
        onConfirm={handleDeleteOptionConfirm}
        onClose={() => setOptionToDelete(null)}
      />
    </div>
  );
}
