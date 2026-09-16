import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Copy, Download, Check, ChevronDown, ChevronUp,
  Plus, Trash2, Clock, AlertTriangle, Info, Zap, Link
} from 'lucide-react';
import type { Screen, Project, ProjectBriefing, InternalNote, ProjectHistoryEvent, ProjectStatus, BriefingData } from '../../types';
import type { NavigateOpts } from '../../App';
import { PROJECT_STATUS_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getProjectById, getBriefingByProject, getNotesByProject,
  addNote, updateNote, deleteNote, getHistoryByProject,
  updateProjectStatus, addHistoryEvent, deleteProject
} from '../../services/adminService';
import { generateMarkdown } from '../../utils/markdownExporter';

interface ProjectDetailProps {
  projectId: string;
  onNavigate: (screen: Screen, opts?: NavigateOpts) => void;
}

type Tab = 'briefing' | 'diagnosis' | 'original' | 'references' | 'features' | 'notes' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'original', label: 'Respostas originais' },
  { id: 'references', label: 'Referências' },
  { id: 'features', label: 'Funcionalidades' },
  { id: 'notes', label: 'Notas internas' },
  { id: 'history', label: 'Histórico' }
];

const STATUS_OPTIONS: ProjectStatus[] = [
  'briefing_received', 'in_analysis', 'waiting_client',
  'approved', 'in_development', 'in_review', 'completed'
];

export default function ProjectDetail({ projectId, onNavigate }: ProjectDetailProps) {
  const { profile } = useAuth();
  const [project, setProject] = useState<(Project & { client_name?: string; client_company?: string; user_profiles?: any }) | null>(null);
  const [briefing, setBriefing] = useState<ProjectBriefing | null>(null);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [history, setHistory] = useState<ProjectHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('briefing');
  const [copied, setCopied] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setProject(null);
      return;
    }

    setLoading(true);
    setLoadError(false);

    getProjectById(projectId)
      .then(async p => {
        if (!p) {
          setProject(null);
          return;
        }
        setProject(p as any);

        const [b, n, h] = await Promise.all([
          getBriefingByProject(projectId).catch(() => null),
          getNotesByProject(projectId).catch(() => []),
          getHistoryByProject(projectId).catch(() => [])
        ]);
        setBriefing(b);
        setNotes(n || []);
        setHistory(h || []);
      })
      .catch(err => {
        console.error('Erro ao carregar projeto:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCopy = async () => {
    if (!briefing) return;
    const md = generateMarkdown(briefing.responses);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!briefing) return;
    const md = generateMarkdown(briefing.responses);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'briefing-' + (project?.client_company || 'projeto') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    setStatusChanging(true);
    try {
      await updateProjectStatus(projectId, newStatus);
      await addHistoryEvent(projectId, 'status_changed', 'Status alterado para: ' + PROJECT_STATUS_LABELS[newStatus]);
      setProject(prev => prev ? { ...prev, status: newStatus } : prev);
      setHistory(prev => [{
        id: crypto.randomUUID(),
        project_id: projectId,
        event_type: 'status_changed',
        description: 'Status alterado para: ' + PROJECT_STATUS_LABELS[newStatus],
        created_at: new Date().toISOString()
      }, ...prev]);
    } catch {} finally {
      setStatusChanging(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !profile) return;
    setSavingNote(true);
    try {
      const note = await addNote(projectId, profile.id, newNote.trim());
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch {} finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch {}
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner" />
          <span>Carregando projeto…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <button type="button" className="admin-back-btn" onClick={() => onNavigate('admin-projects')}>
            <ArrowLeft size={16} /> Projetos
          </button>
        </div>
        <div className="admin-error">Não foi possível carregar o projeto.</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <button type="button" className="admin-back-btn" onClick={() => onNavigate('admin-projects')}>
            <ArrowLeft size={16} /> Projetos
          </button>
        </div>
        <div className="admin-error">Projeto não encontrado.</div>
      </div>
    );
  }

  const responses = briefing?.responses as BriefingData | undefined;

  return (
    <div className="admin-page project-detail-page">
      {/* Cabeçalho do projeto */}
      <div className="admin-page-header">
        <button type="button" className="admin-back-btn" onClick={() => onNavigate('admin-projects')}>
          <ArrowLeft size={16} /> Projetos
        </button>
      </div>

      <div className="project-detail-header">
        <div className="project-detail-meta">
          {project.client_company && (
            <div className="project-company-label">{project.client_company}</div>
          )}
          <h1 className="project-detail-title">{project.name}</h1>
          <div className="project-detail-info">
            <span>Cliente: <strong>{project.client_name || '—'}</strong></span>
            {briefing?.submitted_at && (
              <span>Enviado em: <strong>{new Date(briefing.submitted_at).toLocaleDateString('pt-BR')}</strong></span>
            )}
            <span>Atualizado: <strong>{new Date(project.updated_at).toLocaleDateString('pt-BR')}</strong></span>
          </div>
        </div>

        <div className="project-detail-actions">
          <div className="status-selector">
            <select
              value={project.status}
              onChange={e => handleStatusChange(e.target.value as ProjectStatus)}
              disabled={statusChanging}
              className={'status-badge-select status-' + project.status}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {briefing && (
            <div className="project-export-actions">
              <button type="button" className="btn-secondary" onClick={handleCopy}>
                {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
              </button>
              <button type="button" className="btn-secondary" onClick={handleDownload}>
                <Download size={15} /> Markdown
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn-secondary"
            style={{ color: '#c92a2a', borderColor: '#ffc9c9' }}
            title="Excluir este projeto"
            onClick={async () => {
              if (window.confirm(`Tem certeza que deseja excluir permanentemente o projeto "${project.name}"?`)) {
                try {
                  await deleteProject(projectId);
                  onNavigate('admin-projects');
                } catch (err) {
                  alert('Erro ao excluir projeto.');
                }
              }
            }}
          >
            <Trash2 size={15} /> Excluir
          </button>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="project-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={'project-tab' + (activeTab === tab.id ? ' is-active' : '')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'notes' && notes.length > 0 && (
              <span className="tab-badge">{notes.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      <div className="project-tab-content">

        {/* Tab: Briefing estruturado */}
        {activeTab === 'briefing' && (
          <div className="briefing-structured">
            {!briefing ? (
              <div className="admin-empty-state">
                <p>O cliente ainda não enviou o briefing.</p>
              </div>
            ) : (
              <>
                {briefing.executive_summary && (
                  <div className="admin-card">
                    <h2 className="admin-card-title">Resumo Executivo</h2>
                    <p className="executive-summary-text">{briefing.executive_summary}</p>
                  </div>
                )}

                {briefing.primary_cta && (
                  <div className="admin-card cta-card">
                    <h2 className="admin-card-title">Ação Primordial do Usuário (CTA)</h2>
                    <div className="cta-display">{briefing.primary_cta}</div>
                  </div>
                )}

                <div className="admin-grid-two">
                  <div className="admin-card">
                    <h2 className="admin-card-title">Dados do Cliente</h2>
                    <dl className="profile-fields">
                      <div className="profile-field-row">
                        <dt>Nome</dt>
                        <dd>{responses?.responsibleName || project.client_name || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Empresa</dt>
                        <dd>{responses?.companyName || project.client_company || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>E-mail</dt>
                        <dd>{responses?.contactEmail || (project as any).client_email || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>WhatsApp</dt>
                        <dd>{responses?.contactWhatsapp || project.user_profiles?.phone || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Segmento</dt>
                        <dd>{responses?.businessSegment || project.user_profiles?.segment || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Localização</dt>
                        <dd>{responses?.serviceLocation || project.user_profiles?.location || 'Não informado'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="admin-card">
                    <h2 className="admin-card-title">Estrutura & Planejamento</h2>
                    <dl className="profile-fields">
                      <div className="profile-field-row">
                        <dt>Tipo de projeto</dt>
                        <dd>{project.type || (responses?.selectedPages?.length ? 'Website Personalizado' : 'Não informado')}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Qtd. de páginas</dt>
                        <dd>{responses?.selectedPages?.length ? `${responses.selectedPages.length} página(s)` : 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Páginas escolhidas</dt>
                        <dd>{responses?.selectedPages?.join(', ') || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Faixa de investimento</dt>
                        <dd>{responses?.investmentRange || 'Não informado'}</dd>
                      </div>
                      <div className="profile-field-row">
                        <dt>Prazo desejado</dt>
                        <dd>{responses?.targetLaunchDate || 'Não informado'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {briefing.sitemap && briefing.sitemap.length > 0 && (
                  <div className="admin-card">
                    <h2 className="admin-card-title">Sitemap Inicial Sugerido</h2>
                    <div className="sitemap-list">
                      {briefing.sitemap.map((page, i) => (
                        <div key={i} className="sitemap-item">
                          <span className="sitemap-num">{String(i + 1).padStart(2, '0')}</span>
                          <span>{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Diagnóstico */}
        {activeTab === 'diagnosis' && (
          <div className="diagnosis-tab">
            {!briefing?.diagnosis || briefing.diagnosis.length === 0 ? (
              <div className="admin-empty-state">
                <p>Nenhum ponto de diagnóstico identificado.</p>
              </div>
            ) : (
              <div className="diagnosis-list">
                {briefing.diagnosis.map((point, i) => (
                  <div key={i} className={'diagnosis-item diag-' + point.type}>
                    <div className="diag-icon">
                      {point.type === 'risk' && <AlertTriangle size={16} />}
                      {point.type === 'dependency' && <Link size={16} />}
                      {point.type === 'opportunity' && <Zap size={16} />}
                      {point.type === 'clarification' && <Info size={16} />}
                    </div>
                    <div className="diag-content">
                      <div className="diag-type">{point.type.toUpperCase()}</div>
                      <div className="diag-title">{point.title}</div>
                      <div className="diag-desc">{point.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Respostas originais */}
        {activeTab === 'original' && (
          <div className="original-responses">
            {!responses ? (
              <div className="admin-empty-state"><p>Nenhuma resposta disponível.</p></div>
            ) : (
              <div className="responses-grid">
                <ResponseSection title="Dados do Cliente" items={[
                  { label: 'Nome', value: responses.responsibleName || project.client_name },
                  { label: 'Empresa', value: responses.companyName || project.client_company },
                  { label: 'E-mail', value: responses.contactEmail || (project as any).client_email },
                  { label: 'WhatsApp', value: responses.contactWhatsapp || project.user_profiles?.phone },
                  { label: 'Segmento', value: responses.businessSegment || project.user_profiles?.segment },
                  { label: 'Localização', value: responses.serviceLocation || project.user_profiles?.location },
                  { label: 'Descrição do negócio', value: responses.businessDescription },
                  { label: 'Produtos e serviços', value: responses.productsAndServices },
                  { label: 'Diferencial competitivo', value: responses.businessDifferentiator },
                  { label: 'Tempo de mercado', value: responses.businessAge }
                ]} />

                <ResponseSection title="Objetivos" items={[
                  { label: 'Objetivos principais', value: responses.mainGoals?.join(', ') },
                  { label: 'Ação principal do visitante (CTA)', value: responses.singlePrimaryAction }
                ]} />

                <ResponseSection title="Estrutura do Site" items={[
                  { label: 'Tipo de projeto', value: project.type || (responses.selectedPages?.length ? 'Website Personalizado' : '') },
                  { label: 'Páginas selecionadas', value: responses.selectedPages?.join(', ') },
                  { label: 'Quantidade de páginas', value: responses.selectedPages?.length ? `${responses.selectedPages.length} página(s)` : '' },
                  { label: 'Seção ou página indispensável', value: responses.indispensablePageOrSection }
                ]} />

                <ResponseSection title="Design e Identidade Visual" items={[
                  { label: 'Modelo / Paleta escolhida', value: responses.selectedPaletteId },
                  { label: 'Estilo visual', value: responses.visualStyle },
                  { label: 'Sensação desejada (Percepções)', value: responses.brandPerceptions?.join(', ') },
                  { label: 'Cores da marca', value: responses.brandColors },
                  { label: 'Cores a evitar', value: responses.colorsToAvoid },
                  { label: 'Status da identidade visual', value: responses.identityStatus }
                ]} />

                <ResponseSection title="Recursos Solicitados" items={[
                  { label: 'Recursos e funcionalidades', value: responses.selectedFeatures?.join(', ') }
                ]} />

                <ResponseSection title="Estratégia e Público" items={[
                  { label: 'Público principal', value: responses.targetAudience },
                  { label: 'Tipo de público', value: responses.audienceType ? responses.audienceType.toUpperCase() : '' },
                  { label: 'Faixa etária', value: responses.ageRange },
                  { label: 'Poder aquisitivo', value: responses.purchasingPower },
                  { label: 'Características do público', value: responses.audienceTraits },
                  { label: 'Público que NÃO quer atrair', value: responses.excludedAudience }
                ]} />

                <ResponseSection title="Investimento e Prazos" items={[
                  { label: 'Investimento estimado / Faixa', value: responses.investmentRange },
                  { label: 'Data de lançamento pretendida', value: responses.targetLaunchDate }
                ]} />

                <ResponseSection title="Revisão e Observações Finais" items={[
                  { label: 'Resumo executivo', value: briefing?.executive_summary },
                  { label: 'Observações adicionais', value: responses.finalObservations }
                ]} />
              </div>
            )}
          </div>
        )}

        {/* Tab: Referências */}
        {activeTab === 'references' && (
          <div className="references-tab">
            {!responses?.references || responses.references.length === 0 ? (
              <div className="admin-empty-state"><p>Nenhuma referência informada pelo cliente.</p></div>
            ) : (
              <div className="admin-references-grid">
                {responses.references.map((ref, i) => (
                  <div key={ref.id || i} className="admin-ref-card">
                    <div className="admin-ref-header">
                      <span className="admin-ref-num">Referência {String(i + 1).padStart(2, '0')}</span>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="admin-ref-link">
                        Visitar <Link size={13} />
                      </a>
                    </div>
                    <div className="admin-ref-url">{ref.url}</div>
                    {ref.reasons?.length > 0 && (
                      <div className="admin-ref-reasons">
                        <span>O que gostou:</span>
                        <div className="admin-ref-pills">
                          {ref.reasons.map(r => <span key={r} className="admin-ref-pill">{r}</span>)}
                        </div>
                      </div>
                    )}
                    {ref.notes && <p className="admin-ref-notes">{ref.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Funcionalidades */}
        {activeTab === 'features' && (
          <div className="features-tab">
            {!responses ? (
              <div className="admin-empty-state"><p>Nenhuma resposta disponível.</p></div>
            ) : (
              <div className="admin-grid-two">
                <div className="admin-card">
                  <h2 className="admin-card-title">Funcionalidades solicitadas</h2>
                  <div className="feature-list">
                    {responses.selectedFeatures?.map(f => (
                      <div key={f} className="feature-item">
                        <Check size={14} /> <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-card">
                  <h2 className="admin-card-title">Integrações</h2>
                  <div className="feature-list">
                    {responses.integrations?.map(i => (
                      <div key={i} className="feature-item">
                        <Check size={14} /> <span>{i}</span>
                      </div>
                    ))}
                  </div>
                  {responses.integrationDetails && (
                    <p className="feature-details">{responses.integrationDetails}</p>
                  )}
                </div>
                {responses.competitors && responses.competitors.length > 0 && (
                  <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
                    <h2 className="admin-card-title">Concorrentes</h2>
                    {responses.competitors.map((c, i) => (
                      <div key={c.id || i} className="competitor-row">
                        <strong>{c.nameOrUrl}</strong>
                        {c.likes && <p>✓ {c.likes}</p>}
                        {c.dislikes && <p>✗ {c.dislikes}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="admin-card">
                  <h2 className="admin-card-title">Materiais disponíveis</h2>
                  <div className="feature-list">
                    {responses.existingMaterials?.map(m => (
                      <div key={m} className="feature-item"><Check size={14} /> <span>{m}</span></div>
                    ))}
                  </div>
                </div>
                <div className="admin-card">
                  <h2 className="admin-card-title">Restrições / Linhas vermelhas</h2>
                  <div className="feature-list restriction-list">
                    {responses.unwantedElements?.map(u => (
                      <div key={u} className="feature-item restrict"><span>✗</span> <span>{u}</span></div>
                    ))}
                  </div>
                  {responses.dislikedStylesOrSites && (
                    <p className="feature-details">{responses.dislikedStylesOrSites}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Notas internas */}
        {activeTab === 'notes' && (
          <div className="notes-tab">
            <div className="admin-card">
              <h2 className="admin-card-title">Adicionar nota</h2>
              <textarea
                className="notes-textarea"
                rows={4}
                placeholder="Dúvidas, decisões de reunião, pendências, próximos passos…"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              <button
                type="button"
                className="primary"
                onClick={handleAddNote}
                disabled={savingNote || !newNote.trim()}
              >
                <Plus size={16} /> {savingNote ? 'Salvando…' : 'Adicionar nota'}
              </button>
            </div>

            <div className="notes-list">
              {notes.length === 0 ? (
                <div className="admin-empty-state small">
                  <p>Nenhuma nota ainda. Adicione observações internas acima.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="note-header">
                      <span className="note-date">
                        {new Date(note.created_at).toLocaleString('pt-BR')}
                      </span>
                      <button
                        type="button"
                        className="note-delete"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="note-content">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === 'history' && (
          <div className="history-tab">
            {history.length === 0 ? (
              <div className="admin-empty-state">
                <p>Nenhum evento registrado ainda.</p>
              </div>
            ) : (
              <div className="history-timeline">
                {history.map(event => (
                  <div key={event.id} className="history-event">
                    <div className="history-dot" />
                    <div className="history-content">
                      <span className="history-date">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </span>
                      <p className="history-desc">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseSection({ title, items }: { title: string; items: { label: string; value?: string | number | null }[] }) {
  return (
    <div className="admin-card">
      <h2 className="admin-card-title">{title}</h2>
      <dl className="profile-fields">
        {items.map(item => {
          const hasValue = item.value !== undefined && item.value !== null && String(item.value).trim() !== '';
          const displayVal = hasValue ? String(item.value) : 'Não informado';
          return (
            <div key={item.label} className="profile-field-row">
              <dt>{item.label}</dt>
              <dd style={!hasValue ? { color: '#888', fontStyle: 'italic' } : undefined}>
                {displayVal}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
