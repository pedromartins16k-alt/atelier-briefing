import { useState } from 'react';
import { AlertTriangle, Check, Copy, Download, FileText, Sparkles, ArrowLeft, LogOut } from 'lucide-react';
import type { BriefingData, Screen } from '../types';
import { analyzeBriefing } from '../utils/briefingIntelligence';
import { generateBriefingMarkdown } from '../utils/markdownExporter';
import { signOut } from '../services/authService';

type Props = {
  data: BriefingData;
  onBackToEdit: () => void;
  onNavigate?: (screen: Screen) => void;
};

export default function ProfessionalResult({ data, onBackToEdit, onNavigate }: Props) {
  const [copied, setCopied] = useState(false);
  const analysis = analyzeBriefing(data);
  const markdown = generateBriefingMarkdown(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safe = (data.companyName || "projeto").toLowerCase().replace(/\s+/g, "-"); link.download = "briefing-" + safe + ".md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="professional-result">
      <header className="result-top">
        <div>
          <span className="pill"><Sparkles size={14} /> DIAGNÓSTICO DO PROJETO</span>
          <h1>Briefing Estruturado & Requisitos</h1>
          <p>Documento pronto para a equipe de design e desenvolvimento iniciar o projeto com clareza total.</p>
        </div>
        <div className="result-actions">
          {onNavigate && (
            <button className="btn-secondary" onClick={() => onNavigate('client-home')}>
              Meu Painel
            </button>
          )}
          <button className="back-btn" onClick={onBackToEdit}>
            <ArrowLeft size={16} /> Ajustar respostas
          </button>
          <button className="btn-secondary" onClick={handleDownload}>
            <Download size={16} /> Baixar Markdown
          </button>
          <button className="primary" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado para a área de transferência!' : 'Copiar Briefing'}
          </button>
          {onNavigate && (
            <button
              className="btn-secondary signout-btn-secondary"
              title="Sair da conta"
              onClick={async () => {
                await signOut();
                onNavigate('home');
              }}
            >
              <LogOut size={16} /> Sair
            </button>
          )}
        </div>
      </header>

      {/* Pontos de Atenção & Diagnóstico */}
      {analysis.attentionPoints.length > 0 && (
        <section className="attention-box">
          <div className="attention-header">
            <AlertTriangle size={18} />
            <div>
              <h3>Pontos de Atenção & Diagnóstico Técnico</h3>
              <p>Identificamos dependências e riscos críticos que devem ser alinhados antes ou no início do projeto:</p>
            </div>
          </div>
          <div className="attention-grid">
            {analysis.attentionPoints.map((pt, idx) => (
              <div key={idx} className={"attention-card type-" + pt.type}>
                <span className="badge">{pt.type === 'risk' ? 'Risco' : pt.type === 'dependency' ? 'Dependência' : pt.type === 'opportunity' ? 'Oportunidade' : 'Alinhamento'}</span>
                <strong>{pt.title}</strong>
                <p>{pt.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resumo Executivo */}
      <section className="executive-card">
        <h3>Resumo Executivo do Projeto</h3>
        <p>{analysis.executiveSummary}</p>
      </section>

      {/* Sitemap Recomendado & CTA */}
      <div className="sitemap-cta-row">
        <div className="sitemap-card">
          <h4>Sitemap Inicial Sugerido ({analysis.suggestedSitemap.length} páginas)</h4>
          <ul>
            {analysis.suggestedSitemap.map((page, i) => (
              <li key={i}>
                <span className="num">0{i + 1}</span> {page}
              </li>
            ))}
          </ul>
        </div>
        <div className="cta-highlight-card">
          <h4>Ação Primordial do Usuário (CTA Principal)</h4>
          <p className="cta-text">
            {data.singlePrimaryAction || 'Apresentar credibilidade e conduzir ao canal de contato principal.'}
          </p>
          <span className="cta-note">
            Toda a hierarquia visual da Home e páginas de conversão deve conduzir a essa ação prioritária.
          </span>
        </div>
      </div>

      {/* Visualizador do Markdown Formatado */}
      <section className="markdown-preview-container">
        <div className="preview-bar">
          <span><FileText size={15} /> VISUALIZAÇÃO DO BRIEFING COMPLETO</span>
          <button onClick={handleCopy} className="text-copy-btn">
            {copied ? 'Copiado!' : 'Copiar texto completo'}
          </button>
        </div>
        <pre className="markdown-pre">{markdown}</pre>
      </section>
    </main>
  );
}


