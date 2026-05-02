import { useState } from 'react';

interface HeaderProps {
  onCadastrar?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
  showLogout?: boolean;
}

export function Header({ onCadastrar, onAdmin, onLogout, showLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-section">
          <img
            src="/logo.png"
            alt="Caravana da Cultura"
            className="logo-img"
          />
          <div className="logo-text">
            <span className="logo-title">Caravana da Cultura</span>
            <span className="logo-subtitle">Espírito Santo</span>
          </div>
        </div>

        <nav className={mobileMenuOpen ? 'open' : ''}>
          {/* Botões dentro do menu mobile */}
          <div className="mobile-menu-actions">
            {onCadastrar && (
              <button 
                className="btn-primary mobile-menu-btn-action" 
                onClick={() => {
                  onCadastrar();
                  setMobileMenuOpen(false);
                }}
              >
                CADASTRE SUA ENTIDADE
              </button>
            )}
            {onAdmin && (
              <button 
                className="btn-secondary mobile-menu-btn-action" 
                onClick={() => {
                  onAdmin();
                  setMobileMenuOpen(false);
                }}
              >
                ⚙️ Painel Administrativo
              </button>
            )}
            {showLogout && onLogout && (
              <button 
                className="btn-danger mobile-menu-btn-action" 
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
              >
                🚪 Sair
              </button>
            )}
          </div>
        </nav>

        <div className="header-buttons">
          {onAdmin && (
            <button className="btn-admin" onClick={onAdmin} title="Painel Administrativo">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}
          <button className="btn-primary" onClick={onCadastrar}>CADASTRE SUA ENTIDADE</button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
