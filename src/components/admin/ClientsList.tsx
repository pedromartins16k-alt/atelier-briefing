import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, User } from 'lucide-react';
import type { Screen, UserProfile } from '../../types';
import type { NavigateOpts } from '../../App';
import { getAllClients } from '../../services/adminService';

interface ClientsListProps {
  onNavigate: (screen: Screen, opts?: NavigateOpts) => void;
}

export default function ClientsList({ onNavigate }: ClientsListProps) {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClients()
      .then(data => { setClients(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.segment || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    );
  }, [search, clients]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clientes</h1>
          <p className="admin-page-subtitle">Todos os clientes cadastrados na plataforma.</p>
        </div>
      </div>

      <div className="admin-search-bar">
        <Search size={16} />
        <input
          type="search"
          placeholder="Buscar por nome, empresa, segmento…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner" />
          <span>Carregando clientes…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <User size={32} />
          <p>{search ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Segmento</th>
                <th>Localização</th>
                <th>Cadastro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr
                  key={client.id}
                  className="admin-table-row clickable"
                  onClick={() => {
                    onNavigate('admin-client', { clientId: client.id });
                  }}
                >
                  <td>
                    <div className="client-name-cell">
                      <div className="client-avatar-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{client.name}</span>
                    </div>
                  </td>
                  <td>{client.company || '—'}</td>
                  <td>{client.segment || '—'}</td>
                  <td>{client.location || '—'}</td>
                  <td>{new Date(client.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-row-action"
                      onClick={e => {
                        e.stopPropagation();
                        onNavigate('admin-client', { clientId: client.id });
                      }}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-table-footer">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
