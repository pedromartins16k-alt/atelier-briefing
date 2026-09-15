import React from 'react';
import { LayoutDashboard, Users, FolderOpen, Sliders, LogOut } from 'lucide-react';
import type { Screen } from '../../types';
import type { NavigateOpts } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
  screen: Screen;
  onNavigate: (screen: Screen, opts?: NavigateOpts) => void;
}

const NAV_ITEMS: { id: Screen; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-clients', label: 'Clientes', icon: Users },
  { id: 'admin-projects', label: 'Projetos', icon: FolderOpen },
  { id: 'admin-config', label: 'Configurador', icon: Sliders }
];

export default function AdminLayout({ children, screen, onNavigate }: AdminLayoutProps) {
  const { profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch {}
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div
          className="admin-brand"
          onClick={() => onNavigate('admin-dashboard')}
        >
          <span>✦</span> atelier<span>.</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={'admin-nav-item' + (isActive ? ' is-active' : '')}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {profile?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-meta">
              <span className="admin-user-name">{profile?.name || 'Admin'}</span>
              <span className="admin-user-role">Administrador</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-nav-item admin-signout"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
