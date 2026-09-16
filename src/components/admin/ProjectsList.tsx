import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, Filter, Trash2 } from 'lucide-react';
import type { Screen, Project, ProjectStatus } from '../../types';
import type { NavigateOpts } from '../../App';
import { PROJECT_STATUS_LABELS } from '../../types';
import { getAllProjects, deleteProject } from '../../services/adminService';

interface ProjectsListProps {
  onNavigate: (screen: Screen, opts?: NavigateOpts) => void;
}

type ProjectWithClient = Project & { client_name?: string; client_company?: string };

export default function ProjectsList({ onNavigate }: ProjectsListProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [filtered, setFiltered] = useState<ProjectWithClient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProjects()
      .then(data => { setProjects(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(p => {
        const matchSearch =
          p.name.toLowerCase().includes(q) ||
          (p.client_name || '').toLowerCase().includes(q) ||
          (p.client_company || '').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
    );
  }, [search, statusFilter, projects]);

  const allStatuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Projetos</h1>
          <p className="admin-page-subtitle">Todos os projetos recebidos.</p>
        </div>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-bar">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar por cliente, empresa, projeto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-select">
          <Filter size={15} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos os status</option>
            {allStatuses.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner" /><span>Carregando projetos…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <p>{search || statusFilter !== 'all' ? 'Nenhum projeto encontrado.' : 'Nenhum projeto cadastrado ainda.'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Atualizado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => (
                <tr
                  key={project.id}
                  className="admin-table-row clickable"
                  onClick={() => {
                    onNavigate('admin-project', { projectId: project.id });
                  }}
                >
                  <td><strong>{project.name}</strong></td>
                  <td>{project.client_name || '—'}</td>
                  <td>{project.client_company || '—'}</td>
                  <td>
                    <span className={'status-badge status-' + project.status}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </td>
                  <td>{new Date(project.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>{new Date(project.updated_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-row-action"
                        onClick={e => {
                          e.stopPropagation();
                          onNavigate('admin-project', { projectId: project.id });
                        }}
                      >
                        Abrir <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-row-action"
                        style={{ color: '#c92a2a', borderColor: '#ffc9c9' }}
                        title="Excluir projeto"
                        onClick={async e => {
                          e.stopPropagation();
                          if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
                            try {
                              await deleteProject(project.id);
                              setProjects(prev => prev.filter(p => p.id !== project.id));
                            } catch (err) {
                              alert('Erro ao excluir projeto.');
                            }
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-table-footer">
            {filtered.length} projeto{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
