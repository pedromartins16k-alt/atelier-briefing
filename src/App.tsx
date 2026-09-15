import { useState, useEffect, useCallback } from 'react';
import type { Screen, BriefingData } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import ForgotScreen from './components/auth/ForgotScreen';
import ClientHome from './components/client/ClientHome';
import BriefingFlow from './components/BriefingFlow';
import ProfessionalResult from './components/ProfessionalResult';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientsList from './components/admin/ClientsList';
import ClientProfile from './components/admin/ClientProfile';
import ProjectsList from './components/admin/ProjectsList';
import ProjectDetail from './components/admin/ProjectDetail';
import FormConfigurator from './components/admin/FormConfigurator';
import { getClientBriefing } from './services/briefingService';
import { INITIAL_BRIEFING } from './data/briefingConfig';

function screenToPath(screen: Screen, clientId?: string, projectId?: string): string {
  switch (screen) {
    case 'home': return '/';
    case 'login': return '/login';
    case 'register': return '/register';
    case 'forgot': return '/forgot';
    case 'client-home': return '/briefing';
    case 'flow': return '/briefing/preencher';
    case 'success': return '/briefing/concluido';
    case 'admin-dashboard': return '/admin';
    case 'admin-clients': return '/admin/clientes';
    case 'admin-client': return clientId ? `/admin/clientes/${clientId}` : '/admin/clientes';
    case 'admin-projects': return '/admin/projetos';
    case 'admin-project': return projectId ? `/admin/projetos/${projectId}` : '/admin/projetos';
    case 'admin-config': return '/admin/configurador';
    default: return '/';
  }
}

function pathToScreen(path: string): { screen: Screen; id?: string } {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/') return { screen: 'home' };
  if (clean === '/login') return { screen: 'login' };
  if (clean === '/register') return { screen: 'register' };
  if (clean === '/forgot') return { screen: 'forgot' };
  if (clean === '/briefing') return { screen: 'client-home' };
  if (clean === '/briefing/preencher') return { screen: 'flow' };
  if (clean === '/briefing/concluido') return { screen: 'success' };
  if (clean === '/admin') return { screen: 'admin-dashboard' };
  if (clean === '/admin/clientes') return { screen: 'admin-clients' };
  if (clean.startsWith('/admin/clientes/')) return { screen: 'admin-client', id: clean.split('/')[3] };
  if (clean === '/admin/projetos') return { screen: 'admin-projects' };
  if (clean.startsWith('/admin/projetos/')) return { screen: 'admin-project', id: clean.split('/')[3] };
  if (clean === '/admin/configurador') return { screen: 'admin-config' };
  return { screen: 'home' };
}

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>(() => pathToScreen(window.location.pathname).screen);
  const [selectedClientId, setSelectedClientId] = useState<string>(() => pathToScreen(window.location.pathname).id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => pathToScreen(window.location.pathname).id || '');
  const [clientBriefingData, setClientBriefingData] = useState<BriefingData | null>(null);

  // Navegação consistente sincronizando URL
  const navigate = useCallback((target: Screen, updateHistory = true) => {
    setScreen(target);
    if (updateHistory) {
      const path = screenToPath(target, selectedClientId, selectedProjectId);
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedClientId, selectedProjectId]);

  // Listener para popstate (botões voltar/avançar do navegador)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = pathToScreen(window.location.pathname);
      if (parsed.id) {
        if (parsed.screen === 'admin-client') setSelectedClientId(parsed.id);
        if (parsed.screen === 'admin-project') setSelectedProjectId(parsed.id);
      }
      setScreen(parsed.screen);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Proteção de rotas & Redirecionamentos automáticos baseados em sessão e role
  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname;
    const isAuthRoute = ['/login', '/register', '/forgot'].includes(currentPath) || ['login', 'register', 'forgot'].includes(screen);
    const isAdminRoute = currentPath.startsWith('/admin') || screen.startsWith('admin-');
    const isClientRoute = currentPath.startsWith('/briefing') || ['client-home', 'flow', 'success'].includes(screen);

    // 1. Não autenticado tentando acessar rotas protegidas -> redireciona para login
    if (!user) {
      if (isAdminRoute || isClientRoute) {
        navigate('login');
      }
      return;
    }

    // 2. Usuário autenticado em tela de login/cadastro -> redirecionar imediatamente
    if (isAuthRoute) {
      if (profile?.role === 'admin') {
        navigate('admin-dashboard');
      } else {
        navigate('client-home');
      }
      return;
    }

    // 3. Role = client tentando acessar /admin -> bloqueia e vai para /briefing
    if (profile?.role === 'client' && isAdminRoute) {
      navigate('client-home');
      return;
    }

    // 4. Role = admin tentando acessar /briefing como cliente -> redireciona para o painel admin
    if (profile?.role === 'admin' && (isClientRoute && (currentPath === '/briefing' || screen === 'client-home'))) {
      navigate('admin-dashboard');
      return;
    }
  }, [user, profile, loading, screen, navigate]);

  // Carregar dados de briefing do cliente quando em modo 'success' / visualização
  useEffect(() => {
    if (screen === 'success' && profile && !clientBriefingData) {
      getClientBriefing(profile.id).then(res => {
        if (res?.briefing?.responses) {
          setClientBriefingData(res.briefing.responses);
        }
      }).catch(() => {});
    }
  }, [screen, profile, clientBriefingData]);

  if (loading) {
    return (
      <div className="global-loading-screen">
        <div className="loading-spinner" />
        <span>Carregando Atelier…</span>
      </div>
    );
  }

  // --- Rotas Públicas & Auth ---
  if (screen === 'home') {
    return (
      <Home
        onStart={() => {
          if (!user) {
            navigate('login');
          } else if (profile?.role === 'admin') {
            navigate('admin-dashboard');
          } else {
            navigate('client-home');
          }
        }}
        onNavigate={navigate}
      />
    );
  }

  if (screen === 'login') {
    return <LoginScreen onNavigate={navigate} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onNavigate={navigate} />;
  }

  if (screen === 'forgot') {
    return <ForgotScreen onNavigate={navigate} />;
  }

  // --- Rotas do Cliente ---
  if (screen === 'client-home') {
    return <ClientHome onNavigate={navigate} />;
  }

  if (screen === 'flow') {
    return (
      <BriefingFlow
        onNavigate={navigate}
        setProjectId={id => setSelectedProjectId(id)}
      />
    );
  }

  if (screen === 'success') {
    return (
      <ProfessionalResult
        data={clientBriefingData || INITIAL_BRIEFING}
        onBackToEdit={() => navigate('flow')}
      />
    );
  }

  // --- Rotas do Administrador ---
  if (profile?.role === 'admin' && screen.startsWith('admin-')) {
    return (
      <AdminLayout screen={screen} onNavigate={navigate}>
        {screen === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={navigate}
            setSelectedProjectId={setSelectedProjectId}
            setSelectedClientId={setSelectedClientId}
          />
        )}
        {screen === 'admin-clients' && (
          <ClientsList
            onNavigate={navigate}
            setSelectedClientId={setSelectedClientId}
          />
        )}
        {screen === 'admin-client' && (
          <ClientProfile
            clientId={selectedClientId}
            onNavigate={navigate}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}
        {screen === 'admin-projects' && (
          <ProjectsList
            onNavigate={navigate}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}
        {screen === 'admin-project' && (
          <ProjectDetail
            projectId={selectedProjectId}
            onNavigate={navigate}
          />
        )}
        {screen === 'admin-config' && (
          <FormConfigurator />
        )}
      </AdminLayout>
    );
  }

  // Fallback seguro
  return (
    <Home
      onStart={() => navigate('login')}
      onNavigate={navigate}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
