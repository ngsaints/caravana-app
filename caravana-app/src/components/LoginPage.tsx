import { useState } from 'react';

interface LoginPageProps {
  onLogin: (password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      window.location.hash = '#/admin';
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="Caravana da Cultura" className="login-logo" />
          <h1>Painel Administrativo</h1>
          <p>Digite a senha para acessar</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary login-btn">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <a href="#/">← Voltar ao mapa</a>
        </div>
      </div>
    </div>
  );
}
