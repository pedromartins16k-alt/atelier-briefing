import React, { useEffect, useState } from 'react';
import { ArrowRight, FileText, Clock, LogOut } from 'lucide-react';
import type { Screen, Project } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getClientBriefing } from '../../services/briefingService';
import { signOut } from '../../services/authService';

interface ClientHomeProps {
  onNavigate: (screen: Screen) => void;
}

export default function ClientHome({ onNavigate }: ClientHomeProps) {
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [hasBriefing, setHasBriefing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getClientBriefing(profile.id)
      .then(result => {
        if (result) {
          setProject(result.project);
          setHasBriefing(!!result.briefing?.submitted_at);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile]);

  const firstName = profile?.name?.split(' ')[0] || 'Olá';

  return (
    <div className="client-home-page">
      <header className="client-home-header">
        <button className="brand" onClick={() => onNavigate('home')}>
          <span>✦</span> atelier<span>.</span>
        </button>

        <div className="client-header-actions">
          <div className="client-user-badge">
            <div className="client-user-avatar">
              {profile?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <span className="client-user-name">{profile?.name || 'Cliente'}</span>
          </div>

          <button
            type="button"
            className="client-signout-btn"
            title="Sair da conta"
            onClick={async () => {
              await signOut();
              onNavigate('home');
            }}
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="client-home-main">
        <div className="client-welcome">
          <div className="client-eyebrow">Bem-vindo de volta</div>
          <h1 className="client-greeting">Olá, {firstName}.</h1>
          <p className="client-subtitle">Vamos entender o seu projeto.</p>
        </div>

        {loading ? (
          <div className="client-loading">
            <div className="loading-spinner" />
            <span>Carregando seu projeto…</span>
          </div>
        ) : (
          <div className="client-action-area">
            {!project && !hasBriefing && (
              <div className="client-action-card new-briefing">
                <div className="action-icon">
                  <FileText size={28} />
                </div>
                <div className="action-content">
                  <h2>Comece seu briefing</h2>
                  <p>
                    Vamos fazer algumas perguntas para entender exatamente o que você
                    espera do seu novo site. Leva cerca de 10 a 15 minutos.
                  </p>
                </div>
                <button
                  className="primary action-btn"
                  onClick={() => onNavigate('flow')}
                >
                  Começar briefing <ArrowRight size={16} />
                </button>
              </div>
            )}

            {project && !hasBriefing && (
              <div className="client-action-card draft-briefing">
                <div className="action-icon">
                  <Clock size={28} />
                </div>
                <div className="action-content">
                  <h2>Briefing em andamento</h2>
                  <p>
                    Você começou mas ainda não enviou seu briefing. Continue de onde parou.
                  </p>
                </div>
                <button
                  className="primary action-btn"
                  onClick={() => onNavigate('flow')}
                >
                  Continuar briefing <ArrowRight size={16} />
                </button>
              </div>
            )}

            {project && hasBriefing && (
              <div className="client-action-card submitted-briefing">
                <div className="action-icon submitted">
                  <span>✓</span>
                </div>
                <div className="action-content">
                  <h2>Briefing enviado</h2>
                  <p>
                    Suas informações foram recebidas e estão sendo analisadas.
                    Status atual do projeto:
                    <strong> {PROJECT_STATUS_LABELS[project.status]}</strong>
                  </p>
                </div>
                <button
                  className="primary action-btn"
                  onClick={() => onNavigate('success')}
                >
                  Ver meu briefing <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className="client-info-note">
              <p>
                Após o envio, sua equipe do Atelier analisará as informações e
                entrará em contato para dar os próximos passos.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
