import React, { useState } from 'react';
import type { Screen } from '../../types';
import { signIn } from '../../services/authService';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha para entrar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      // AuthContext detecta e redireciona automaticamente
    } catch {
      setError('Não foi possível entrar. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" onClick={() => onNavigate('home')}>
          <span>✦</span> atelier<span>.</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Vamos começar.</h1>
          <p className="auth-subtitle">Entre na sua conta para acessar seu projeto.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@empresa.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate('forgot')}
          >
            Esqueci minha senha
          </button>
          <span className="auth-link-sep">·</span>
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate('register')}
          >
            Primeiro acesso? Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
