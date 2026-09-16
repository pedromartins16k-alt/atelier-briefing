import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertCircle, Sparkles, LogOut
} from 'lucide-react';
import type {
  BriefingData,
  ReferenceItem,
  CompetitorItem,
  Screen,
  FormConfig,
  DynamicFeature,
  DynamicCategory,
  QuestionOption,
  DynamicStep
} from '../types';
import {
  INITIAL_BRIEFING,
  STEPS as FALLBACK_STEPS,
  GOALS_OPTIONS as FALLBACK_GOALS,
  STRUCTURE_PAGES_OPTIONS as FALLBACK_PAGES,
  FEATURES_OPTIONS as FALLBACK_FEATURES,
  REFERENCE_REASONS as FALLBACK_REASONS,
  MATERIALS_OPTIONS as FALLBACK_MATERIALS,
  INTEGRATIONS_OPTIONS as FALLBACK_INTEGRATIONS,
  UNWANTED_OPTIONS as FALLBACK_UNWANTED,
  INVESTMENT_RANGES as FALLBACK_INVESTMENT
} from '../data/briefingConfig';
import BriefingReview from './BriefingReview';
import ProfessionalResult from './ProfessionalResult';
import ComputerPreview from './preview/ComputerPreview';
import CostNotepad from './preview/CostNotepad';
import { useAuth } from '../context/AuthContext';
import {
  saveDraftLocally, loadDraftLocally, clearDraftLocally,
  loadDraftProjectId, saveDraftProjectId,
  ensureProject, saveBriefingDraft, submitBriefingToSupabase
} from '../services/briefingService';
import { signOut } from '../services/authService';
import { getSupabase } from '../services/supabase';
import { getFormConfig, getFormConfigSync } from '../services/formConfigService';
import IdentityStep from './IdentityStep';

interface BriefingFlowProps {
  onNavigate: (screen: Screen) => void;
  setProjectId: (id: string) => void;
  previewModeConfig?: FormConfig;
}

export default function BriefingFlow({ onNavigate, setProjectId, previewModeConfig }: BriefingFlowProps) {
  const { profile } = useAuth();

  // Configuração dinâmica do CMS
  const [config, setConfig] = useState<FormConfig>(() => previewModeConfig || getFormConfigSync());

  useEffect(() => {
    if (previewModeConfig) {
      setConfig(previewModeConfig);
      return;
    }
    getFormConfig().then(setConfig).catch(() => {});
  }, [previewModeConfig]);

  const [data, setData] = useState<BriefingData>(() => {
    if (previewModeConfig) {
      return {
        ...INITIAL_BRIEFING,
        responsibleName: profile?.name || 'Cliente Demonstração',
        companyName: profile?.company || 'Atelier Preview'
      };
    }
    const draft = loadDraftLocally();
    if (draft) return { ...INITIAL_BRIEFING, ...draft };
    return {
      ...INITIAL_BRIEFING,
      responsibleName: profile?.name || '',
      companyName: profile?.company || ''
    };
  });

  const [screen, setScreen] = useState<'flow' | 'success'>('flow');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [projectId, setLocalProjectId] = useState<string | null>(null);

  // Etapas ativas vindas do CMS
  const activeSteps = useMemo(() => {
    if (config.steps && config.steps.length > 0) {
      return config.steps
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);
    }
    return FALLBACK_STEPS.map(s => ({
      id: s.id,
      stepNumber: s.stepNumber,
      label: s.label,
      title: s.title,
      subtitle: s.subtitle,
      eyebrow: s.tag,
      order: s.stepNumber,
      enabled: true
    })) as DynamicStep[];
  }, [config.steps]);

  // Garantir índice válido se etapas mudarem
  const safeIndex = Math.min(currentStepIndex, Math.max(0, activeSteps.length - 1));
  const currentStep = activeSteps[safeIndex] || activeSteps[0];

  // Auto-save local (desativado se em modo preview)
  useEffect(() => {
    if (previewModeConfig) return;
    saveDraftLocally(data);
    setSavedFeedback(true);
    const t = setTimeout(() => setSavedFeedback(false), 1400);
    return () => clearTimeout(t);
  }, [data, previewModeConfig]);

  // Garantir projeto no Supabase ao carregar (desativado se em modo preview)
  useEffect(() => {
    if (previewModeConfig) return;
    async function initProject() {
      try {
        const sb = getSupabase();
        let uid = profile?.id;
        if (!uid) {
          const { data: sess } = await sb.auth.getSession();
          uid = sess?.session?.user?.id;
        }
        if (!uid) return;

        const savedProjectId = loadDraftProjectId();
        const id = await ensureProject(uid, savedProjectId, data.companyName);
        setLocalProjectId(id);
        setProjectId(id);

        // Se o projeto já tiver respostas salvas no Supabase, carregar para edição
        const { data: savedBriefing } = await sb
          .from('project_briefings')
          .select('responses')
          .eq('project_id', id)
          .maybeSingle();

        if (savedBriefing?.responses && typeof savedBriefing.responses === 'object') {
          setData(prev => ({
            ...INITIAL_BRIEFING,
            ...savedBriefing.responses,
            ...prev
          }));
        } else {
          saveBriefingDraft(id, data).catch(() => {});
        }
      } catch (e) {
        console.error('Erro ao inicializar projeto no Supabase:', e);
      }
    }
    initProject();
  }, [profile, setProjectId, previewModeConfig]);

  // Salvar rascunho remoto com debounce (desativado em preview)
  useEffect(() => {
    if (previewModeConfig || !projectId) return;
    const t = setTimeout(() => {
      saveBriefingDraft(projectId, data).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [data, projectId, previewModeConfig]);

  const update = useCallback((patch: Partial<BriefingData>) => {
    setData(prev => ({ ...prev, ...patch }));
    setValidationError('');
  }, []);

  const handleNext = () => {
    if (currentStep?.id === 'business') {
      if (!data.companyName.trim() || !data.responsibleName.trim() || !data.contactEmail.trim()) {
        setValidationError('Por favor, informe pelo menos o nome da empresa, seu nome e um e-mail para contato.');
        return;
      }
    }
    setValidationError('');
    if (safeIndex < activeSteps.length - 1) {
      setCurrentStepIndex(safeIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (safeIndex > 0) {
      setCurrentStepIndex(safeIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleArrayItem = (key: keyof BriefingData, item: string) => {
    const list = (data[key] as string[]) || [];
    if (list.includes(item)) {
      update({ [key]: list.filter(x => x !== item) } as Partial<BriefingData>);
    } else {
      update({ [key]: [...list, item] } as Partial<BriefingData>);
    }
  };

  // Toggle para funcionalidades dinâmicas suportando ID ou label
  const toggleFeatureSelection = (feat: DynamicFeature) => {
    const list = data.selectedFeatures || [];
    const isSelected = list.includes(feat.id) || list.includes(feat.label) || (feat.name && list.includes(feat.name));
    if (isSelected) {
      update({
        selectedFeatures: list.filter(x => x !== feat.id && x !== feat.label && x !== feat.name)
      });
    } else {
      update({
        selectedFeatures: [...list, feat.label || feat.id]
      });
    }
  };

  const isFeatureSelected = (feat: DynamicFeature) => {
    const list = data.selectedFeatures || [];
    return list.includes(feat.id) || list.includes(feat.label) || (feat.name && list.includes(feat.name));
  };

  // Verificador de regras condicionais ativas
  const hasConditionalRule = (ruleId: string) => {
    const selected = data.selectedFeatures || [];
    const activeFeats = (config.features || []).filter(f => f.enabled);

    const matchesConfigRule = activeFeats.some(f =>
      f.conditionalRuleId === ruleId &&
      (selected.includes(f.id) || selected.includes(f.label) || selected.includes(f.name))
    );

    if (matchesConfigRule) return true;

    // Fallback de compatibilidade com seleções legadas
    if (ruleId === 'ecommerce') return selected.includes('Comprar produtos') || (data.mainGoals || []).includes('Vender produtos');
    if (ruleId === 'booking') return selected.includes('Agendar horário') || (data.mainGoals || []).includes('Receber agendamentos');
    if (ruleId === 'login') return selected.includes('Fazer login');
    return false;
  };

  const addReference = () => {
    const newRef: ReferenceItem = { id: crypto.randomUUID(), url: '', reasons: [], notes: '' };
    update({ references: [...data.references, newRef] });
  };
  const updateReference = (id: string, patch: Partial<ReferenceItem>) => {
    update({ references: data.references.map(r => r.id === id ? { ...r, ...patch } : r) });
  };
  const removeReference = (id: string) => {
    update({ references: data.references.filter(r => r.id !== id) });
  };

  const addCompetitor = () => {
    const newComp: CompetitorItem = { id: crypto.randomUUID(), nameOrUrl: '', likes: '', dislikes: '' };
    update({ competitors: [...data.competitors, newComp] });
  };
  const updateCompetitor = (id: string, patch: Partial<CompetitorItem>) => {
    update({ competitors: data.competitors.map(c => c.id === id ? { ...c, ...patch } : c) });
  };
  const removeCompetitor = (id: string) => {
    update({ competitors: data.competitors.filter(c => c.id !== id) });
  };

  const handleSubmitFinal = async () => {
    if (previewModeConfig) {
      setScreen('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      let pid = projectId;
      if (!pid) {
        const sb = getSupabase();
        let uid = profile?.id;
        if (!uid) {
          const { data: sess } = await sb.auth.getSession();
          uid = sess?.session?.user?.id;
        }
        if (uid) {
          const savedProjectId = loadDraftProjectId();
          pid = await ensureProject(uid, savedProjectId, data.companyName);
          setLocalProjectId(pid);
          setProjectId(pid);
        }
      }
      if (pid) {
        await submitBriefingToSupabase(pid, data);
      }
      clearDraftLocally();
      setScreen('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro ao submeter briefing final:', err);
      clearDraftLocally();
      setScreen('success');
    } finally {
      setSubmitting(false);
    }
  };

  // Resolução de opções dinâmicas para cada tipo de pergunta
  const dynamicGoalOptions = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'goals')?.questions?.find(x => x.id === 'mainGoals');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_GOALS;
  }, [config.steps]);

  const dynamicPageOptions = useMemo(() => {
    if (config.pageOptions?.length) {
      return config.pageOptions.filter(p => p.enabled).sort((a, b) => a.order - b.order);
    }
    return FALLBACK_PAGES.map((label, idx) => ({ id: label, label, order: idx + 1, enabled: true })) as QuestionOption[];
  }, [config.pageOptions]);

  const dynamicMaterials = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'materials')?.questions?.find(x => x.id === 'existingMaterials');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_MATERIALS;
  }, [config.steps]);

  const dynamicIntegrations = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'integrations')?.questions?.find(x => x.id === 'integrations');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_INTEGRATIONS;
  }, [config.steps]);

  const dynamicUnwanted = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'restrictions')?.questions?.find(x => x.id === 'unwantedElements');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_UNWANTED;
  }, [config.steps]);

  const dynamicInvestmentRanges = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'timeline')?.questions?.find(x => x.id === 'investmentRange');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_INVESTMENT;
  }, [config.steps]);

  const dynamicReferenceReasons = useMemo(() => {
    const q = config.steps?.find(s => s.id === 'references')?.questions?.find(x => x.id === 'references');
    if (q?.options?.length) {
      return q.options.filter(o => o.enabled).map(o => o.label || o.id);
    }
    return FALLBACK_REASONS;
  }, [config.steps]);

  // Categorias e funcionalidades dinâmicas ativas
  const activeCategories = useMemo(() => {
    return (config.categories || []).filter(c => c.enabled).sort((a, b) => a.order - b.order);
  }, [config.categories]);

  const activeFeatures = useMemo(() => {
    const catMap = new Map((config.categories || []).map(c => [c.id, c]));
    return (config.features || [])
      .filter(f => f.enabled && (!f.categoryId || catMap.get(f.categoryId)?.enabled !== false))
      .sort((a, b) => a.order - b.order);
  }, [config.features, config.categories]);

  if (screen === 'success') {
    return (
      <ProfessionalResult
        data={data}
        onBackToEdit={() => {
          setScreen('flow');
          setCurrentStepIndex(activeSteps.length - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case 'business':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '01 / CONTEXTO DA EMPRESA'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="field-grid two">
              <label className="field-label">
                <span>Nome da empresa ou marca *</span>
                <input type="text" placeholder="Ex: Atelier Criativo" value={data.companyName} onChange={e => update({ companyName: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Seu nome completo *</span>
                <input type="text" placeholder="Ex: Pedro Martins" value={data.responsibleName} onChange={e => update({ responsibleName: e.target.value })} />
              </label>
              <label className="field-label">
                <span>E-mail de contato *</span>
                <input type="email" placeholder="seuemail@empresa.com" value={data.contactEmail} onChange={e => update({ contactEmail: e.target.value })} />
              </label>
              <label className="field-label">
                <span>WhatsApp ou telefone</span>
                <input type="tel" placeholder="(11) 99999-9999" value={data.contactWhatsapp} onChange={e => update({ contactWhatsapp: e.target.value })} />
              </label>
            </div>

            <div className="field-grid two">
              <label className="field-label">
                <span>Segmento ou ramo de atuação</span>
                <input type="text" placeholder="Ex: Arquitetura, Advocacia, Gastronomia..." value={data.businessSegment} onChange={e => update({ businessSegment: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Onde a empresa atende?</span>
                <input type="text" placeholder="Ex: São Paulo e região / Todo o Brasil / Internacional" value={data.serviceLocation} onChange={e => update({ serviceLocation: e.target.value })} />
              </label>
            </div>

            <label className="field-label">
              <span>O que a empresa faz? (Em poucas palavras)</span>
              <textarea rows={3} placeholder="Conte o que sua empresa faz e por que ela existe..." value={data.businessDescription} onChange={e => update({ businessDescription: e.target.value })} />
            </label>

            <label className="field-label">
              <span>Quais são os principais produtos ou serviços oferecidos?</span>
              <textarea rows={3} placeholder="Liste ou descreva as soluções que você oferece aos seus clientes..." value={data.productsAndServices} onChange={e => update({ productsAndServices: e.target.value })} />
            </label>

            <div className="field-grid two">
              <label className="field-label">
                <span>Qual é o principal diferencial da sua empresa?</span>
                <input type="text" placeholder="O que faz um cliente escolher você e não o concorrente?" value={data.businessDifferentiator} onChange={e => update({ businessDifferentiator: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Há quanto tempo a empresa existe?</span>
                <input type="text" placeholder="Ex: Em fase de lançamento / 3 anos / Mais de 10 anos" value={data.businessAge} onChange={e => update({ businessAge: e.target.value })} />
              </label>
            </div>

            <label className="field-label">
              <span>Existe alguma informação importante que devemos conhecer sobre o negócio?</span>
              <textarea rows={2} placeholder="Algum detalhe relevante sobre seu momento atual, história ou expansão..." value={data.importantBusinessNotes} onChange={e => update({ importantBusinessNotes: e.target.value })} />
            </label>
          </div>
        );

      case 'goals':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '02 / PROPÓSITO'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="selection-cards-grid">
              {dynamicGoalOptions.map(goal => {
                const selected = data.mainGoals.includes(goal);
                return (
                  <button type="button" key={goal} className={'card-choice ' + (selected ? 'is-selected' : '')} onClick={() => toggleArrayItem('mainGoals', goal)}>
                    <span className="check-bullet">{selected && <Check size={14} />}</span>
                    <strong>{goal}</strong>
                  </button>
                );
              })}
            </div>

            <div className="highlight-question-box">
              <div className="box-icon"><Sparkles size={18} /></div>
              <div>
                <strong>Pergunta-chave para a conversão:</strong>
                <p>Se uma pessoa visitar o site e fizer <b>apenas uma coisa</b>, o que você gostaria que ela fizesse?</p>
                <input type="text" className="full-input-contrast" placeholder="Ex: Clicar no WhatsApp para pedir orçamento / Agendar uma reunião" value={data.singlePrimaryAction} onChange={e => update({ singlePrimaryAction: e.target.value })} />
                <span className="sub-helper">Essa resposta será tratada como a Ação Principal (CTA primordial) do projeto.</span>
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '03 / AUDIÊNCIA'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="field-grid two">
              <label className="field-label">
                <span>Descrição do público principal</span>
                <input type="text" placeholder="Ex: Empreendedores, famílias em busca de imóvel, médicos..." value={data.targetAudience} onChange={e => update({ targetAudience: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Perfil de atendimento</span>
                <select value={data.audienceType} onChange={e => update({ audienceType: e.target.value as any })}>
                  <option value="">Selecione o perfil</option>
                  <option value="b2c">B2C — Consumidor final (Pessoa Física)</option>
                  <option value="b2b">B2B — Empresas (Pessoa Jurídica)</option>
                  <option value="both">Ambos (Pessoas Físicas e Empresas)</option>
                </select>
              </label>
            </div>

            <div className="field-grid two">
              <label className="field-label">
                <span>Faixa etária aproximada</span>
                <input type="text" placeholder="Ex: 25 a 45 anos / Todas as idades" value={data.ageRange} onChange={e => update({ ageRange: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Nível de poder aquisitivo (quando relevante)</span>
                <input type="text" placeholder="Ex: Médio / Alto padrão / Acessível" value={data.purchasingPower} onChange={e => update({ purchasingPower: e.target.value })} />
              </label>
            </div>

            <label className="field-label">
              <span>Características e hábitos importantes desse público</span>
              <textarea rows={2} placeholder="Ex: Acessam principalmente pelo celular, valorizam agilidade, buscam exclusividade..." value={data.audienceTraits} onChange={e => update({ audienceTraits: e.target.value })} />
            </label>

            <div className="restriction-input-box">
              <label className="field-label">
                <span>Existe algum público que você NÃO quer atrair?</span>
                <input type="text" placeholder="Ex: Pessoas fora do perfil de ticket ou sem interesse no serviço..." value={data.excludedAudience} onChange={e => update({ excludedAudience: e.target.value })} />
              </label>
            </div>
          </div>
        );

      case 'structure':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '04 / ARQUITETURA'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="pills-grid-large">
              {dynamicPageOptions.map(page => {
                const selected = data.selectedPages.includes(page.label || page.id);
                return (
                  <button
                    type="button"
                    key={page.id}
                    className={'pill-toggle-btn ' + (selected ? 'is-active' : '')}
                    onClick={() => toggleArrayItem('selectedPages', page.label || page.id)}
                  >
                    {selected && <Check size={14} />}
                    <span>{page.label || page.id}</span>
                    {page.price && page.price > 0 ? (
                      <small className="pill-price-tag">+{page.priceLabel || `R$ ${page.price}`}</small>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="box-note-indispensable">
              <label className="field-label">
                <span>Existe alguma página ou seção que você considera indispensável?</span>
                <textarea rows={2} placeholder="Ex: Uma seção destacando os depoimentos de clientes e certificações internacionais..." value={data.indispensablePageOrSection} onChange={e => update({ indispensablePageOrSection: e.target.value })} />
              </label>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '05 / RECURSOS & INTERAÇÕES'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            {/* Categorias Dinâmicas com Funcionalidades */}
            <div className="features-dynamic-grouped-container">
              {activeCategories.map(cat => {
                const catFeatures = activeFeatures.filter(f => f.categoryId === cat.id);
                if (catFeatures.length === 0) return null;

                return (
                  <div key={cat.id} className="category-features-section">
                    <div className="cat-section-header">
                      <span className="cat-section-icon">{cat.icon || '📁'}</span>
                      <span className="cat-section-name">{cat.name}</span>
                      {cat.description && <small className="cat-section-desc">— {cat.description}</small>}
                    </div>

                    <div className="selection-cards-grid">
                      {catFeatures.map(feat => {
                        const selected = isFeatureSelected(feat);
                        return (
                          <button
                            type="button"
                            key={feat.id}
                            className={'card-choice ' + (selected ? 'is-selected' : '')}
                            onClick={() => toggleFeatureSelection(feat)}
                          >
                            <span className="check-bullet">{selected && <Check size={14} />}</span>
                            <div className="feat-choice-body">
                              <div className="feat-title-line">
                                <span className="feat-icon">{feat.icon || '✨'}</span>
                                <strong>{feat.label || feat.name}</strong>
                              </div>
                              {feat.description && (
                                <p className="feat-desc">{feat.description}</p>
                              )}
                              <span className={'feat-price-pill ' + (feat.price === 0 ? 'is-free' : '')}>
                                {feat.priceLabel || (feat.price === 0 ? 'Incluso' : `+ R$ ${feat.price}`)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Condicional E-commerce */}
            {hasConditionalRule('ecommerce') && (
              <div className="conditional-group">
                <div className="conditional-title"><Sparkles size={16} /> Detalhes sobre Venda Online / Loja</div>
                <div className="field-grid two">
                  <label className="field-label">
                    <span>Quantos produtos aproximadamente terá a loja?</span>
                    <input type="text" placeholder="Ex: Até 10 itens / 50 a 100 itens / Mais de 200" value={data.featureConditionals.ecommerceProductsCount || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, ecommerceProductsCount: e.target.value } })} />
                  </label>
                  <label className="field-label">
                    <span>Já possui sistema ou gateway de pagamento?</span>
                    <input type="text" placeholder="Ex: Sim (Stripe, Mercado Pago) / Ainda não tenho" value={data.featureConditionals.ecommerceHasPaymentGateway || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, ecommerceHasPaymentGateway: e.target.value } })} />
                  </label>
                </div>
                <div className="field-grid two">
                  <label className="field-label">
                    <span>Já vende pela internet atualmente?</span>
                    <select value={data.featureConditionals.ecommerceCurrentlySellsOnline || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, ecommerceCurrentlySellsOnline: e.target.value } })}>
                      <option value="">Selecione uma opção</option>
                      <option value="Sim">Sim, já possuo vendas online ativas</option>
                      <option value="Não">Não, este será o primeiro canal digital</option>
                    </select>
                  </label>
                  <label className="field-label">
                    <span>Plataforma que já utiliza (se houver)</span>
                    <input type="text" placeholder="Ex: Shopify, WooCommerce, Nuvemshop ou nenhuma" value={data.featureConditionals.ecommerceCurrentPlatform || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, ecommerceCurrentPlatform: e.target.value } })} />
                  </label>
                </div>
              </div>
            )}

            {/* Condicional Agendamento */}
            {hasConditionalRule('booking') && (
              <div className="conditional-group">
                <div className="conditional-title"><Sparkles size={16} /> Detalhes sobre Agendamentos</div>
                <div className="field-grid two">
                  <label className="field-label">
                    <span>Qual tipo de serviço será agendado?</span>
                    <input type="text" placeholder="Ex: Consulta, reunião de consultoria, avaliação..." value={data.featureConditionals.bookingServiceType || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, bookingServiceType: e.target.value } })} />
                  </label>
                  <label className="field-label">
                    <span>Quantos profissionais estarão na agenda?</span>
                    <input type="text" placeholder="Ex: 1 profissional / Equipe de 5" value={data.featureConditionals.bookingProfessionalsCount || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, bookingProfessionalsCount: e.target.value } })} />
                  </label>
                </div>
                <div className="field-grid two">
                  <label className="field-label">
                    <span>O agendamento precisa mostrar horários disponíveis?</span>
                    <select value={data.featureConditionals.bookingShowAvailableSlots || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, bookingShowAvailableSlots: e.target.value } })}>
                      <option value="">Selecione</option>
                      <option value="Sim">Sim, exibir calendário em tempo real</option>
                      <option value="Apenas solicitação">Não, apenas solicitação de data/horário</option>
                    </select>
                  </label>
                  <label className="field-label">
                    <span>Já utiliza alguma ferramenta de agendamento?</span>
                    <input type="text" placeholder="Ex: Calendly, Google Calendar, ferramenta própria..." value={data.featureConditionals.bookingCurrentTool || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, bookingCurrentTool: e.target.value } })} />
                  </label>
                </div>
              </div>
            )}

            {/* Condicional Login */}
            {hasConditionalRule('login') && (
              <div className="conditional-group">
                <div className="conditional-title"><Sparkles size={16} /> Área de Membros ou Acesso Restrito</div>
                <label className="field-label">
                  <span>Qual será a finalidade do login dos clientes?</span>
                  <input type="text" placeholder="Ex: Acesso a relatórios de clientes, materiais exclusivos, área de membros..." value={data.featureConditionals.loginPurpose || ''} onChange={e => update({ featureConditionals: { ...data.featureConditionals, loginPurpose: e.target.value } })} />
                </label>
              </div>
            )}
          </div>
        );

      case 'identity':
        return (
          <IdentityStep
            data={data}
            update={update}
            toggleArrayItem={toggleArrayItem}
            stepTitle={currentStep.title}
          />
        );

      case 'references':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '07 / BENCHMARK'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="references-manager">
              {data.references.map((ref, index) => (
                <div key={ref.id} className="reference-card">
                  <div className="ref-head">
                    <span>REFERÊNCIA 0{index + 1}</span>
                    <button type="button" className="del-btn" onClick={() => removeReference(ref.id)}>
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                  <label className="field-label">
                    <span>Link do site (URL)</span>
                    <input type="url" placeholder="https://exemplo.com" value={ref.url} onChange={e => updateReference(ref.id, { url: e.target.value })} />
                  </label>
                  <div className="ref-reasons">
                    <span>O que você gostou nesse site?</span>
                    <div className="pills-reasons">
                      {dynamicReferenceReasons.map(reason => {
                        const isChosen = ref.reasons.includes(reason);
                        return (
                          <button type="button" key={reason} className={'mini-pill ' + (isChosen ? 'active' : '')} onClick={() => {
                            const newReasons = isChosen ? ref.reasons.filter(r => r !== reason) : [...ref.reasons, reason];
                            updateReference(ref.id, { reasons: newReasons });
                          }}>
                            {isChosen && <Check size={12} />} {reason}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="field-label" style={{ marginTop: '12px' }}>
                    <span>Observações sobre essa referência (opcional)</span>
                    <input type="text" placeholder="Ex: Gostei do formato como a galeria abre os projetos na tela..." value={ref.notes} onChange={e => updateReference(ref.id, { notes: e.target.value })} />
                  </label>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addReference}>
                <Plus size={16} /> Adicionar site de referência
              </button>
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '08 / MATERIAIS & ATIVOS'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="selection-cards-grid">
              {dynamicMaterials.map(mat => {
                const selected = data.existingMaterials.includes(mat);
                return (
                  <button type="button" key={mat} className={'card-choice ' + (selected ? 'is-selected' : '')} onClick={() => toggleArrayItem('existingMaterials', mat)}>
                    <span className="check-bullet">{selected && <Check size={14} />}</span>
                    <strong>{mat}</strong>
                  </button>
                );
              })}
            </div>

            <div className="content-owner-box">
              <span>Quem ficará responsável por produzir o material ou redação que estiver faltando?</span>
              <div className="radio-pills">
                {[
                  { id: 'client', label: 'Nossa empresa fornecerá todo o conteúdo' },
                  { id: 'agency', label: 'Gostaria que o estúdio/desenvolvedor cuidasse' },
                  { id: 'contractor', label: 'Contrataremos um profissional externo' },
                  { id: 'undecided', label: 'Ainda não definimos essa etapa' }
                ].map(opt => (
                  <button type="button" key={opt.id} className={'pill-radio ' + (data.missingContentOwner === opt.id ? 'is-active' : '')} onClick={() => update({ missingContentOwner: opt.id as any })}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '09 / CONEXÕES'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="selection-cards-grid">
              {dynamicIntegrations.map(item => {
                const selected = data.integrations.includes(item);
                return (
                  <button type="button" key={item} className={'card-choice ' + (selected ? 'is-selected' : '')} onClick={() => toggleArrayItem('integrations', item)}>
                    <span className="check-bullet">{selected && <Check size={14} />}</span>
                    <strong>{item}</strong>
                  </button>
                );
              })}
            </div>

            <label className="field-label" style={{ marginTop: '22px' }}>
              <span>Deseja especificar nomes de softwares ou detalhes de integrações?</span>
              <textarea rows={2} placeholder="Ex: Usamos o RD Station para marketing e o Pipedrive como CRM..." value={data.integrationDetails} onChange={e => update({ integrationDetails: e.target.value })} />
            </label>
          </div>
        );

      case 'competitors':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '10 / BENCHMARKING'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="references-manager">
              {data.competitors.map((comp, index) => (
                <div key={comp.id} className="reference-card">
                  <div className="ref-head">
                    <span>CONCORRENTE 0{index + 1}</span>
                    <button type="button" className="del-btn" onClick={() => removeCompetitor(comp.id)}>
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                  <label className="field-label">
                    <span>Nome ou site do concorrente</span>
                    <input type="text" placeholder="Ex: Empresa X (www.empresax.com)" value={comp.nameOrUrl} onChange={e => updateCompetitor(comp.id, { nameOrUrl: e.target.value })} />
                  </label>
                  <div className="field-grid two">
                    <label className="field-label">
                      <span>O que você GOSTA no site dele?</span>
                      <input type="text" placeholder="Ex: Apresentação clara dos planos..." value={comp.likes} onChange={e => updateCompetitor(comp.id, { likes: e.target.value })} />
                    </label>
                    <label className="field-label">
                      <span>O que você NÃO GOSTA / quer fazer melhor?</span>
                      <input type="text" placeholder="Ex: É muito confuso para entrar em contato..." value={comp.dislikes} onChange={e => updateCompetitor(comp.id, { dislikes: e.target.value })} />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addCompetitor}>
                <Plus size={16} /> Adicionar concorrente
              </button>
            </div>
          </div>
        );

      case 'restrictions':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '11 / LINHAS VERMELHAS'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="selection-cards-grid">
              {dynamicUnwanted.map(item => {
                const selected = data.unwantedElements.includes(item);
                return (
                  <button type="button" key={item} className={'card-choice danger-mode ' + (selected ? 'is-selected' : '')} onClick={() => toggleArrayItem('unwantedElements', item)}>
                    <span className="check-bullet">{selected && <Check size={14} />}</span>
                    <strong>{item}</strong>
                  </button>
                );
              })}
            </div>

            <label className="field-label" style={{ marginTop: '22px' }}>
              <span>Existe algum estilo visual ou exemplo de site que você rejeita?</span>
              <textarea rows={2} placeholder="Ex: Sites muito escuros, botões piscantes ou tipografias difíceis de ler..." value={data.dislikedStylesOrSites} onChange={e => update({ dislikedStylesOrSites: e.target.value })} />
            </label>
          </div>
        );

      case 'timeline':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '12 / PLANEJAMENTO'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <div className="field-grid two">
              <label className="field-label">
                <span>Existe alguma data importante para o lançamento?</span>
                <input type="text" placeholder="Ex: Até o final do mês que vem / Sem data limite" value={data.targetLaunchDate} onChange={e => update({ targetLaunchDate: e.target.value })} />
              </label>
              <label className="field-label">
                <span>Faixa de investimento estimada para o projeto</span>
                <select value={data.investmentRange} onChange={e => update({ investmentRange: e.target.value })}>
                  <option value="">Selecione uma faixa estimada</option>
                  {dynamicInvestmentRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="step-body">
            <div className="eyebrow">{currentStep.eyebrow || '13 / VISÃO ABERTA'}</div>
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>

            <label className="field-label">
              <textarea rows={5} placeholder="Fique à vontade para escrever sobre qualquer detalhe, ideia, sensação ou prioridade adicional..." value={data.finalObservations} onChange={e => update({ finalObservations: e.target.value })} />
            </label>
          </div>
        );

      case 'review':
        return (
          <BriefingReview
            data={data}
            onGoToStep={idx => {
              setCurrentStepIndex(idx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmit={handleSubmitFinal}
            submitting={submitting}
          />
        );

      default:
        return null;
    }
  };

  const ui = config.uiSettings;

  return (
    <main className="briefing-app">
      <header className="flow-topbar">
        <button className="brand flow-brand" onClick={() => onNavigate('client-home')}>
          <span>✦</span> atelier<span>.</span>
        </button>

        <div className="flow-progress">
          <span className="step-count">
            {String(safeIndex + 1).padStart(2, '0')} / {String(activeSteps.length).padStart(2, '0')}
          </span>
          <div className="progress-bar-rail">
            <div className="progress-bar-fill" style={{ width: ((safeIndex + 1) / activeSteps.length) * 100 + '%' }} />
          </div>
          <strong className="step-label-name">{currentStep?.label}</strong>
        </div>

        <div className="flow-topbar-right">
          <span className="auto-save-indicator">
            {previewModeConfig
              ? 'Modo de visualização ativa'
              : (savedFeedback ? 'Salvo automaticamente' : (ui?.autoSaveText || 'Auto-salvamento ativo'))}
          </span>
          {!previewModeConfig && (
            <button
              type="button"
              className="flow-signout-btn"
              title="Sair da conta"
              onClick={async () => {
                await signOut();
                onNavigate('home');
              }}
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          )}
        </div>
      </header>

      <nav className="stepper-nav" aria-label="Navegação entre etapas">
        {activeSteps.map((s, i) => {
          const isDone = i < safeIndex;
          const isCurrent = i === safeIndex;
          return (
            <button
              key={s.id}
              type="button"
              className={'step-btn ' + (isCurrent ? 'is-current' : isDone ? 'is-done' : '')}
              onClick={() => { setCurrentStepIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span className="step-number">{isDone ? <Check size={12} /> : String(i + 1).padStart(2, '0')}</span>
              <span className="step-text">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`flow-workspace ${currentStep?.id !== 'review' ? 'has-preview-sidebar' : ''}`}>
        <div className="flow-form-column">
          <div className="flow-container">
            {renderStepContent()}

            {validationError && (
              <div className="validation-alert" role="alert">
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {currentStep?.id !== 'review' && (
              <footer className="flow-actions-footer">
                <button
                  type="button"
                  className="btn-back"
                  disabled={safeIndex === 0}
                  onClick={handlePrev}
                >
                  <ArrowLeft size={16} /> {ui?.prevButtonLabel || 'Voltar'}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleNext}
                >
                  {ui?.nextButtonLabel || 'Continuar'} <ArrowRight size={16} />
                </button>
              </footer>
            )}
          </div>
        </div>

        {currentStep?.id !== 'review' && (
          <aside className="flow-preview-column">
            <div className="preview-sticky-container">
              <ComputerPreview data={data} />
              <CostNotepad data={data} />
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
