import React, { useEffect, useState } from 'react';
import { ArrowRight, Users, FolderOpen, FileText, TrendingUp } from 'lucide-react';
import type { Screen, Project } from '../../types';
import type { NavigateOpts } from '../../App';
import { PROJECT_STATUS_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getAllProjects } from '../../services/adminService';

interface AdminDashboardProps {
  onNavigate: (screen: Screen, opts?: NavigateOpts) => void;
}

interface Stats {
  totalClients: number;
  totalProjects: number;
  briefingsReceived: number;
  inAnalysis: number;
  inDevelopment: number;
  completed: number;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProjects, setRecentProjects] = useState<(Project & { client_name?: string; client_company?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllProjects()])
      .then(([s, p]) => {
        setStats(s);
        setRecentProjects(p.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = profile?.name?.split(' ')[0] || 'Admin';

  const STAT_CARDS = stats ? [
    { label: 'Clientes', value: stats.totalClients, icon: Users, color: 'stat-blue' },
    { label: 'Projetos', value: stats.totalProjects, icon: FolderOpen, color: 'stat-green' },
    { label: 'Briefings recebidos', value: stats.briefingsReceived, icon: FileText, color: 'stat-yellow' },
    { label: 'Em análise', value: stats.inAnalysis, icon: TrendingUp, color: 'stat-purple' },
    { label: 'Em desenvolvimento', value: stats.inDevelopment, icon: TrendingUp, color: 'stat-orange' },
    { label: 'Concluídos', value: stats.completed, icon: TrendingUp, color: 'stat-gray' }
  ] : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Olá, {firstName}</h1>
          <p className="admin-page-subtitle">Visão geral dos seus projetos.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner" />
          <span>Carregando dados…</span>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {STAT_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={'stat-card ' + card.color}>
                  <div className="stat-icon">
                    <Icon size={20} />
                  </div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              );
            })}
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Projetos recentes</h2>
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => onNavigate('admin-projects')}
              >
                Ver todos <ArrowRight size={14} />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="admin-empty-state">
                <p>Você ainda não recebeu nenhum briefing.</p>
                <span>Quando um cliente enviar o briefing, ele aparecerá aqui.</span>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Empresa</th>
                      <th>Projeto</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map(project => (
                      <tr key={project.id}>
                        <td>{project.client_name || '—'}</td>
                        <td>{project.client_company || '—'}</td>
                        <td>{project.name}</td>
                        <td>
                          <span className={'status-badge status-' + project.status}>
                            {PROJECT_STATUS_LABELS[project.status]}
                          </span>
                        </td>
                        <td>{new Date(project.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-row-action"
                            onClick={() => {
                              onNavigate('admin-project', { projectId: project.id, clientId: project.client_id });
                            }}
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
