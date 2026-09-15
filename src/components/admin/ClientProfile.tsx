import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Screen, UserProfile, Project } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../types';
import { getClientById, getProjectsByClient } from '../../services/adminService';

interface ClientProfileProps {
  clientId: string;
  onNavigate: (screen: Screen) => void;
  setSelectedProjectId: (id: string) => void;
}

export default function ClientProfile({ clientId, onNavigate, setSelectedProjectId }: ClientProfileProps) {
  const [client, setClient] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getClientById(clientId), getProjectsByClient(clientId)])
      .then(([c, p]) => { setClient(c); setProjects(p); })
      .catch(() => setError('Não foi possível carregar o perfil do cliente.'))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading"><div className="loading-spinner" /><span>Carregando…</span></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error || 'Cliente não encontrado.'}</div>
      </div>
    );
  }

  const fields = [
    { label: 'Nome', value: client.name },
    { label: 'Empresa', value: client.company },
    { label: 'Segmento', value: client.segment },
    { label: 'Telefone', value: client.phone },
    { label: 'Localização', value: client.location },
    { label: 'Site atual', value: client.website },
    { label: 'Instagram', value: client.instagram },
    { label: 'Cadastro', value: new Date(client.created_at).toLocaleDateString('pt-BR') }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => onNavigate('admin-clients')}
        >
          <ArrowLeft size={16} /> Clientes
        </button>
      </div>

      <div className="admin-profile-header">
        <div className="admin-profile-avatar">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="admin-page-title">{client.name}</h1>
          {client.company && <p className="admin-page-subtitle">{client.company}</p>}
        </div>
      </div>

      <div className="admin-grid-two">
        <div className="admin-card">
          <h2 className="admin-card-title">Dados do cliente</h2>
          <dl className="profile-fields">
            {fields.map(f => f.value ? (
              <div key={f.label} className="profile-field-row">
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ) : null)}
          </dl>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Projetos</h2>
          {projects.length === 0 ? (
            <div className="admin-empty-state small">
              <p>Nenhum projeto associado a este cliente.</p>
            </div>
          ) : (
            <div className="profile-projects-list">
              {projects.map(project => (
                <div key={project.id} className="profile-project-row">
                  <div className="profile-project-info">
                    <span className="profile-project-name">{project.name}</span>
                    <span className={'status-badge status-' + project.status}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    <span className="profile-project-date">
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="admin-row-action"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      onNavigate('admin-project');
                    }}
                  >
                    Abrir <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
