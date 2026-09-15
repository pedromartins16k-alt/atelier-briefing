import React, { useState } from 'react';
import type { Screen } from '../../types';
import { signUp } from '../../services/authService';

interface RegisterScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Preencha todos os campos para criar sua conta.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem. Verifique e tente novamente.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signUp(name.trim(), email.trim(), password);
      // Se Supabase requer confirmação de e-mail
      if (result.user && !result.session) {
        setSuccess(true);
      }
      // Se não requer confirmação, AuthContext redireciona automaticamente
    } catch (err: any) {
      if (err?.message?.includes('already registered') || err?.message?.includes('already been registered')) {
        setError('Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.');
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand" onClick={() => onNavigate('home')}>
            <span>✦</span> atelier<span>.</span>
          </div>
          <div className="auth-header">
            <h1 className="auth-title">Verifique seu e-mail.</h1>
            <p className="auth-subtitle">
              Enviamos um link de confirmação para <strong>{email}</strong>.
              Acesse seu e-mail e clique no link para ativar sua conta.
            </p>
          </div>
          <button
            type="button"
            className="auth-submit-btn"
            onClick={() => onNavigate('login')}
          >
            Ir para o login
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
          <h1 className="auth-title">Criar conta.</h1>
          <p className="auth-subtitle">Preencha seus dados para começar.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Seu nome completo</span>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ex: Pedro Martins"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

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
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

          <label className="auth-field">
            <span>Confirmar senha</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              disabled={loading}
            />
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate('login')}
          >
            Já tenho conta. Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
