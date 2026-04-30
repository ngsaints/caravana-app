export function Footer() {
  return (
    <>
      <section className="footer-info">
        <div className="footer-info-inner">
          <div className="footer-info-item">
            <div className="footer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="footer-info-text">
              <h3>Fortalecendo<br />Redes Culturais</h3>
              <p>Conecte-se, colabore e transforme realidades.</p>
            </div>
          </div>

          <div className="footer-info-item">
            <div className="footer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
            </div>
            <div className="footer-info-text">
              <h3>Mapa Vivo<br />da Cultura</h3>
              <p>Um panorama das iniciativas culturais capixabas.</p>
            </div>
          </div>

          <div className="footer-info-item">
            <div className="footer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="footer-info-text">
              <h3>Juntos Somos<br />Mais Fortes</h3>
              <p>Valorize a cultura local. Valorize o que é nosso.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2024 Caravana da Cultura – Espírito Santo</p>
          <div className="footer-links">
            <a href="#">Política de Privacidade</a>
            <div className="footer-divider"></div>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </>
  );
}