import { Check, Edit2, AlertCircle } from 'lucide-react';
import type { BriefingData } from '../types';
import { analyzeBriefing } from '../utils/briefingIntelligence';

type Props = {
  data: BriefingData;
  onGoToStep: (stepNumber: number) => void;
  onSubmit: () => void;
  submitting: boolean;
};

export default function BriefingReview({ data, onGoToStep, onSubmit, submitting }: Props) {
  const analysis = analyzeBriefing(data);

  return (
    <div className="review-flow">
      <div className="review-intro">
        <div className="eyebrow">14 / REVISÃO</div>
        <h1>Revise seu briefing</h1>
        <p>Confira as informações organizadas por categoria. Você pode clicar no botão de editar de qualquer seção caso queira ajustar algum ponto antes de enviar.</p>
      </div>

      <div className="review-sections-list">
        {/* 1. Negócio */}
        <div className="review-card">
          <div className="card-top">
            <h3>1. Sobre o Negócio</h3>
            <button type="button" onClick={() => onGoToStep(0)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="review-data-grid">
            <div><span>Empresa:</span> <b>{data.companyName || '—'}</b></div>
            <div><span>Responsável:</span> <b>{data.responsibleName || '—'}</b></div>
            <div><span>Contato:</span> <b>{data.contactEmail} / {data.contactWhatsapp}</b></div>
            <div><span>Segmento:</span> <b>{data.businessSegment || '—'}</b></div>
            <div className="full"><span>O que a empresa faz:</span> <p>{data.businessDescription || '—'}</p></div>
            <div className="full"><span>Diferencial:</span> <p>{data.businessDifferentiator || '—'}</p></div>
          </div>
        </div>

        {/* 2. Objetivos */}
        <div className="review-card">
          <div className="card-top">
            <h3>2. Objetivos do Site</h3>
            <button type="button" onClick={() => onGoToStep(1)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="review-data-grid">
            <div className="full">
              <span>Objetivos selecionados:</span>
              <div className="pills-preview">
                {data.mainGoals.map(g => <span key={g} className="preview-tag">{g}</span>)}
              </div>
            </div>
            <div className="full">
              <span>Ação principal (CTA primordial):</span>
              <b>{data.singlePrimaryAction || '—'}</b>
            </div>
          </div>
        </div>

        {/* 3. Público */}
        <div className="review-card">
          <div className="card-top">
            <h3>3. Público-Alvo</h3>
            <button type="button" onClick={() => onGoToStep(2)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="review-data-grid">
            <div><span>Público:</span> <b>{data.targetAudience || '—'}</b></div>
            <div><span>Perfil:</span> <b>{data.audienceType === 'b2b' ? 'B2B' : data.audienceType === 'b2c' ? 'B2C' : data.audienceType === 'both' ? 'B2B e B2C' : '—'}</b></div>
            <div><span>Faixa etária:</span> <b>{data.ageRange || '—'}</b></div>
            <div><span>Região:</span> <b>{data.audienceLocation || '—'}</b></div>
            {data.excludedAudience && (
              <div className="full"><span>Público que NÃO quer atrair:</span> <p>{data.excludedAudience}</p></div>
            )}
          </div>
        </div>

        {/* 4. Estrutura */}
        <div className="review-card">
          <div className="card-top">
            <h3>4. Estrutura e Páginas</h3>
            <button type="button" onClick={() => onGoToStep(3)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
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

        {/* 5. Funcionalidades */}
        <div className="review-card">
          <div className="card-top">
            <h3>5. Funcionalidades</h3>
            <button type="button" onClick={() => onGoToStep(4)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="review-data-grid">
            <div className="full">
              <span>Recursos selecionados:</span>
              <div className="pills-preview">
                {data.selectedFeatures.map(f => <span key={f} className="preview-tag">{f}</span>)}
              </div>
            </div>
            {data.selectedFeatures.includes('Comprar produtos') && (
              <div className="full sub-note">
                <span>E-commerce:</span> {data.featureConditionals.ecommerceProductsCount || 'Qtd não informada'} produtos | Gateway: {data.featureConditionals.ecommerceHasPaymentGateway || 'Não'}
              </div>
            )}
            {data.selectedFeatures.includes('Agendar horário') && (
              <div className="full sub-note">
                <span>Agendamento:</span> {data.featureConditionals.bookingServiceType || 'Serviço não especificado'}
              </div>
            )}
          </div>
        </div>

        {/* 6. Visual */}
        <div className="review-card">
          <div className="card-top">
            <h3>6. Identidade e Visual</h3>
            <button type="button" onClick={() => onGoToStep(5)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
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

        {/* 7. Referências */}
        <div className="review-card">
          <div className="card-top">
            <h3>7. Referências ({data.references.length})</h3>
            <button type="button" onClick={() => onGoToStep(6)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
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

        {/* 8. Materiais */}
        <div className="review-card">
          <div className="card-top">
            <h3>8. Conteúdo e Materiais</h3>
            <button type="button" onClick={() => onGoToStep(7)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
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

        {/* 9. Conexões / Integrações */}
        <div className="review-card">
          <div className="card-top">
            <h3>9. Integrações</h3>
            <button type="button" onClick={() => onGoToStep(8)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="pills-preview">
            {data.integrations.map(i => <span key={i} className="preview-tag">{i}</span>)}
          </div>
        </div>

        {/* 10. Concorrentes */}
        <div className="review-card">
          <div className="card-top">
            <h3>10. Concorrentes ({data.competitors.length})</h3>
            <button type="button" onClick={() => onGoToStep(9)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
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

        {/* 11. Restrições */}
        <div className="review-card">
          <div className="card-top">
            <h3>11. O que NÃO quer</h3>
            <button type="button" onClick={() => onGoToStep(10)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="pills-preview">
            {data.unwantedElements.map(u => <span key={u} className="preview-tag-danger">{u}</span>)}
          </div>
          {data.dislikedStylesOrSites && (
            <p className="sub-note">Estilos rejeitados: {data.dislikedStylesOrSites}</p>
          )}
        </div>

        {/* 12. Prazo & Investimento */}
        <div className="review-card">
          <div className="card-top">
            <h3>12. Prazo e Investimento</h3>
            <button type="button" onClick={() => onGoToStep(11)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <div className="review-data-grid">
            <div><span>Lançamento desejado:</span> <b>{data.targetLaunchDate || 'Sem urgência rigorosa'}</b></div>
            <div><span>Faixa de investimento:</span> <b>{data.investmentRange || 'A definir'}</b></div>
          </div>
        </div>

        {/* 13. Observações */}
        <div className="review-card">
          <div className="card-top">
            <h3>13. Observações Finais</h3>
            <button type="button" onClick={() => onGoToStep(12)} className="edit-btn">
              <Edit2 size={13} /> Editar
            </button>
          </div>
          <p>{data.finalObservations || 'Nenhuma observação adicional.'}</p>
        </div>
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
          {submitting ? 'Processando envio...' : 'Concluir e Enviar Briefing'}
        </button>
      </div>
    </div>
  );
}
