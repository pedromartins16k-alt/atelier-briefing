import { Edit2, AlertCircle } from 'lucide-react';
import type { BriefingData } from '../types';
import { analyzeBriefing } from '../utils/briefingIntelligence';
import { FEATURE_ALIASES, hasSelectedFeature } from '../utils/featureMatchers';

type Props = {
  data: BriefingData;
  onGoToStep: (stepId: string) => void;
  activeStepIds?: string[];
  onSubmit: () => void;
  submitting: boolean;
  eyebrow?: string;
  submitLabel?: string;
};

export default function BriefingReview({
  data,
  onGoToStep,
  activeStepIds,
  onSubmit,
  submitting,
  eyebrow = 'REVISÃO GERAL',
  submitLabel = 'Concluir e Enviar Briefing'
}: Props) {
  const analysis = analyzeBriefing(data);
  const canEditStep = (stepId: string) => !activeStepIds || activeStepIds.includes(stepId);
  const isStepVisible = (stepId: string, hasData = false) => !activeStepIds || activeStepIds.includes(stepId) || hasData;

  const hasEcommerce = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.ecommerce);
  const hasBooking = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.booking);

  let sectionCounter = 0;
  const nextNumber = () => ++sectionCounter;

  return (
    <div className="review-flow">
      <div className="review-intro">
        <div className="eyebrow">{eyebrow}</div>
        <h1>Revise seu briefing</h1>
        <p>Confira as informações organizadas por categoria. Você pode clicar no botão de editar de qualquer seção caso queira ajustar algum ponto antes de enviar.</p>
      </div>

      <div className="review-sections-list">
        {/* 1. Negócio */}
        {isStepVisible('business', true) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Sobre o Negócio</h3>
              {canEditStep('business') && (
                <button type="button" onClick={() => onGoToStep('business')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div><span>Empresa:</span> <b>{data.companyName || '—'}</b></div>
              <div><span>Responsável:</span> <b>{data.responsibleName || '—'}</b></div>
              <div><span>Contato:</span> <b>{[data.contactEmail, data.contactWhatsapp].filter(Boolean).join(' / ') || '—'}</b></div>
              <div><span>Segmento:</span> <b>{data.businessSegment || '—'}</b></div>
              <div className="full"><span>O que a empresa faz:</span> <p>{data.businessDescription || '—'}</p></div>
              <div className="full"><span>Diferencial:</span> <p>{data.businessDifferentiator || '—'}</p></div>
            </div>
          </div>
        )}

        {/* 2. Objetivos */}
        {isStepVisible('goals', data.mainGoals.length > 0 || !!data.singlePrimaryAction) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Objetivos do Site</h3>
              {canEditStep('goals') && (
                <button type="button" onClick={() => onGoToStep('goals')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div className="full">
                <span>Objetivos selecionados:</span>
                <div className="pills-preview">
                  {data.mainGoals.length > 0
                    ? data.mainGoals.map(g => <span key={g} className="preview-tag">{g}</span>)
                    : <b>—</b>}
                </div>
              </div>
              <div className="full">
                <span>Ação principal (CTA primordial):</span>
                <b>{data.singlePrimaryAction || '—'}</b>
              </div>
            </div>
          </div>
        )}

        {/* 3. Público */}
        {isStepVisible('audience', !!data.targetAudience || !!data.audienceType) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Público-Alvo</h3>
              {canEditStep('audience') && (
                <button type="button" onClick={() => onGoToStep('audience')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div><span>Público:</span> <b>{data.targetAudience || '—'}</b></div>
              <div><span>Perfil:</span> <b>{data.audienceType === 'b2b' ? 'B2B' : data.audienceType === 'b2c' ? 'B2C' : data.audienceType === 'both' ? 'B2B e B2C' : '—'}</b></div>
              <div><span>Faixa etária:</span> <b>{data.ageRange || '—'}</b></div>
              <div><span>Região:</span> <b>{data.audienceLocation || data.serviceLocation || '—'}</b></div>
              {data.excludedAudience && (
                <div className="full"><span>Público que NÃO quer atrair:</span> <p>{data.excludedAudience}</p></div>
              )}
            </div>
          </div>
        )}

        {/* 4. Estrutura */}
        {isStepVisible('structure', data.selectedPages.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Estrutura e Páginas</h3>
              {canEditStep('structure') && (
                <button type="button" onClick={() => onGoToStep('structure')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div className="full">
                <span>Páginas desejadas:</span>
                <div className="pills-preview">
                  {data.selectedPages.map(p => <span key={p} className="preview-tag">{p}</span>)}
                </div>
              </div>
              {data.indispensablePageOrSection && (
                <div className="full"><span>Página ou seção indispensável:</span> <b>{data.indispensablePageOrSection}</b></div>
              )}
            </div>
          </div>
        )}

        {/* 5. Funcionalidades */}
        {isStepVisible('features', data.selectedFeatures.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Funcionalidades</h3>
              {canEditStep('features') && (
                <button type="button" onClick={() => onGoToStep('features')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div className="full">
                <span>Recursos selecionados:</span>
                <div className="pills-preview">
                  {data.selectedFeatures.map(f => <span key={f} className="preview-tag">{f}</span>)}
                </div>
              </div>
              {hasEcommerce && (
                <div className="full sub-note">
                  <span>E-commerce:</span> {data.featureConditionals.ecommerceProductsCount || 'Qtd não informada'} produtos | Gateway: {data.featureConditionals.ecommerceHasPaymentGateway || 'Não'}
                </div>
              )}
              {hasBooking && (
                <div className="full sub-note">
                  <span>Agendamento:</span> {data.featureConditionals.bookingServiceType || 'Serviço não especificado'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Visual */}
        {isStepVisible('identity', true) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Identidade e Visual</h3>
              {canEditStep('identity') && (
                <button type="button" onClick={() => onGoToStep('identity')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div className="full">
                <span>Percepção da marca:</span>
                <div className="pills-preview">
                  {data.brandPerceptions.map(b => <span key={b} className="preview-tag">{b}</span>)}
                </div>
              </div>
              <div><span>Cores da marca:</span> <b>{data.brandColors || 'A definir'}</b></div>
              <div><span>Cores a evitar:</span> <b>{data.colorsToAvoid || 'Nenhuma'}</b></div>
              <div><span>Status da Identidade:</span> <b>{data.identityStatus === 'complete' ? 'Completa' : data.identityStatus === 'logo_only' ? 'Apenas logo' : data.identityStatus === 'some_materials' ? 'Alguns materiais' : 'Ainda não possui'}</b></div>
            </div>
          </div>
        )}

        {/* 7. Referências */}
        {isStepVisible('references', data.references.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Referências ({data.references.length})</h3>
              {canEditStep('references') && (
                <button type="button" onClick={() => onGoToStep('references')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            {data.references.length === 0 ? (
              <p className="empty-text">Nenhuma referência adicionada.</p>
            ) : (
              <div className="items-list">
                {data.references.map((ref, idx) => (
                  <div key={ref.id || idx} className="item-row">
                    <b>{ref.url}</b>
                    <span>Motivos: {ref.reasons.join(', ') || 'Geral'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. Materiais */}
        {isStepVisible('materials', data.existingMaterials.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Conteúdo e Materiais</h3>
              {canEditStep('materials') && (
                <button type="button" onClick={() => onGoToStep('materials')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div className="full">
                <span>Materiais disponíveis:</span>
                <div className="pills-preview">
                  {data.existingMaterials.map(m => <span key={m} className="preview-tag">{m}</span>)}
                </div>
              </div>
              <div><span>Produção de materiais faltantes:</span> <b>{data.missingContentOwner === 'client' ? 'Cliente' : data.missingContentOwner === 'agency' ? 'Desenvolvedor/Agência' : data.missingContentOwner === 'contractor' ? 'Terceiro' : 'A definir'}</b></div>
            </div>
          </div>
        )}

        {/* 9. Conexões / Integrações */}
        {isStepVisible('integrations', data.integrations.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Integrações</h3>
              {canEditStep('integrations') && (
                <button type="button" onClick={() => onGoToStep('integrations')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="pills-preview">
              {data.integrations.map(i => <span key={i} className="preview-tag">{i}</span>)}
            </div>
          </div>
        )}

        {/* 10. Concorrentes */}
        {isStepVisible('competitors', data.competitors.length > 0) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Concorrentes ({data.competitors.length})</h3>
              {canEditStep('competitors') && (
                <button type="button" onClick={() => onGoToStep('competitors')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            {data.competitors.length === 0 ? (
              <p className="empty-text">Nenhum concorrente cadastrado.</p>
            ) : (
              <div className="items-list">
                {data.competitors.map((c, idx) => (
                  <div key={c.id || idx} className="item-row">
                    <b>{c.nameOrUrl}</b>
                    {c.likes && <span>Gosta: {c.likes}</span>}
                    {c.dislikes && <span>Não gosta: {c.dislikes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 11. Restrições */}
        {isStepVisible('restrictions', data.unwantedElements.length > 0 || !!data.dislikedStylesOrSites) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. O que NÃO quer</h3>
              {canEditStep('restrictions') && (
                <button type="button" onClick={() => onGoToStep('restrictions')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="pills-preview">
              {data.unwantedElements.length > 0
                ? data.unwantedElements.map(u => <span key={u} className="preview-tag-danger">{u}</span>)
                : <b>Nenhuma restrição assinalada</b>}
            </div>
            {data.dislikedStylesOrSites && (
              <p className="sub-note">Estilos rejeitados: {data.dislikedStylesOrSites}</p>
            )}
          </div>
        )}

        {/* 12. Prazo & Investimento */}
        {isStepVisible('timeline', !!data.targetLaunchDate || !!data.investmentRange) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Prazo e Investimento</h3>
              {canEditStep('timeline') && (
                <button type="button" onClick={() => onGoToStep('timeline')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <div className="review-data-grid">
              <div><span>Lançamento desejado:</span> <b>{data.targetLaunchDate || 'Sem urgência rigorosa'}</b></div>
              <div><span>Faixa de investimento:</span> <b>{data.investmentRange || 'A definir'}</b></div>
            </div>
          </div>
        )}

        {/* 13. Observações */}
        {isStepVisible('notes', !!data.finalObservations) && (
          <div className="review-card">
            <div className="card-top">
              <h3>{nextNumber()}. Observações Finais</h3>
              {canEditStep('notes') && (
                <button type="button" onClick={() => onGoToStep('notes')} className="edit-btn">
                  <Edit2 size={13} /> Editar
                </button>
              )}
            </div>
            <p>{data.finalObservations || 'Nenhuma observação adicional.'}</p>
          </div>
        )}
      </div>

      {/* Prévia dos pontos de atenção identificados */}
      {analysis.attentionPoints.length > 0 && (
        <div className="review-alert-preview">
          <AlertCircle size={18} />
          <div>
            <strong>O Atelier detectou {analysis.attentionPoints.length} ponto(s) de atenção técnico(s)</strong>
            <p>Esses pontos serão destacados no briefing final para que a equipe alinhe as soluções antes do início do desenvolvimento.</p>
          </div>
        </div>
      )}

      <div className="review-submit-bar">
        <button className="primary big-submit-btn" disabled={submitting} onClick={onSubmit}>
          {submitting ? 'Processando envio...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
