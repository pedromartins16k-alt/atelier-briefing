import React, { useState } from 'react';
import type { Screen } from '../../types';
import { resetPassword } from '../../services/authService';

interface ForgotScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function ForgotScreen({ onNavigate }: ForgotScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Informe seu e-mail para continuar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // Nunca revelar se o e-mail existe ou não
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand" onClick={() => onNavigate('home')}>
            <span>✦</span> atelier<span>.</span>
          </div>
          <div className="auth-header">
            <h1 className="auth-title">Verifique seu e-mail.</h1>
            <p className="auth-subtitle">
              Se esse endereço estiver cadastrado, você receberá um link
              para redefinir sua senha em breve.
            </p>
          </div>
          <button
            type="button"
            className="auth-submit-btn"
            onClick={() => onNavigate('login')}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" onClick={() => onNavigate('home')}>
          <span>✦</span> atelier<span>.</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Recuperar acesso.</h1>
          <p className="auth-subtitle">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>E-mail cadastrado</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@empresa.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate('login')}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}
