import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { AssociationsTable } from './components/AssociationsTable';
import { Footer } from './components/Footer';
import { EntityForm } from './components/EntityForm';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { useEntities, useStats, type Filters } from './hooks/useApi';
import 'leaflet/dist/leaflet.css';
import './styles/App.css';

const ADMIN_PASSWORD = 'caravana2024';

const esBoundary: [number, number][] = [
  [-18.2, -41.2], [-18.5, -40.8], [-18.8, -40.5], [-19.1, -40.2],
  [-19.4, -39.9], [-19.7, -39.7], [-20.0, -39.6], [-20.3, -39.7],
  [-20.6, -39.9], [-20.9, -40.1], [-21.1, -40.5], [-21.3, -40.8],
  [-21.4, -41.1], [-21.2, -41.4], [-20.9, -41.6], [-20.5, -41.7],
  [-20.1, -41.5], [-19.7, -41.3], [-19.3, -41.1], [-18.9, -41.0],
  [-18.5, -41.1]
];

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  radio_comunitaria: { color: '#E74C3C', label: 'Rádio Comunitária' },
  associacao_cultural: { color: '#5A3D8A', label: 'Associação Cultural' },
  ponto_cultura: { color: '#27AE60', label: 'Ponto de Cultura' },
  cineclube: { color: '#F39C12', label: 'Cineclube' },
  artista_coletivo: { color: '#3498DB', label: 'Artista/Coletivo' }
};

const createMarkerIcon = (type: string) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.associacao_cultural;
  return L.divIcon({
    className: 'custom-marker',
    html: `<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${config.color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
  });
};

interface MapBoundsHandlerProps {
  positions: [number, number][];
  shouldFit: boolean;
}

function MapBoundsHandler({ positions, shouldFit }: MapBoundsHandlerProps) {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (shouldFit && positions.length > 0 && !hasFitRef.current) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      hasFitRef.current = true;
    }
  }, [shouldFit, positions, map]);

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);

  return null;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'login'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('caravana_auth') === 'true';
  });
  const [activeSection, setActiveSection] = useState('INÍCIO');
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const [showForm, setShowForm] = useState(false);
  const [fitBounds, setFitBounds] = useState(false);
  const [assocCount, setAssocCount] = useState(0);
  const [municipCount, setMunicipCount] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    municipality: '',
    region: '',
    type: ''
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        if (isAuthenticated) {
          setCurrentPage('admin');
        } else {
          setCurrentPage('login');
        }
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const { entities, loading } = useEntities(filters);
  const stats = useStats();

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => e.status === 'active');
  }, [entities]);

  const entityPositions = useMemo(() => {
    return filteredEntities.map((e) => [e.lat, e.lng] as [number, number]);
  }, [filteredEntities]);

  const municipalityNames = useMemo(() => [...new Set(entities.map((e) => e.municipality))], [entities]);

  const animateCounter = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    target: number,
    duration: number
  ) => {
    const startTime = performance.now();
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setter(current);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  };

  useEffect(() => {
    if (stats) {
      const timer = setTimeout(() => {
        animateCounter(setAssocCount, stats.entityCount, 1500);
        animateCounter(setMunicipCount, stats.municipalityCount, 1500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  const handleViewOnMap = (entityId?: string) => {
    setMapView('map');
    setActiveSection('MAPA');
    if (entityId) {
      const entity = filteredEntities.find((e) => e.id === entityId);
      if (entity) {
        setFitBounds(true);
      }
    }
  };

  const handleEntityCreated = () => {
    setShowForm(false);
    window.location.reload();
  };

  const handleShowAllOnMap = () => {
    setFitBounds(true);
    setActiveSection('MAPA');
  };

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('caravana_auth', 'true');
      setCurrentPage('admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('caravana_auth');
    window.location.hash = '';
    setCurrentPage('home');
  };

  const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const categories = useMemo(() => {
    const cats = new Set<string>();
    filteredEntities.forEach((e) => cats.add(e.category));
    return Array.from(cats).sort();
  }, [filteredEntities]);

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentPage === 'admin') {
    return (
      <div className="app">
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onCadastrar={() => setShowForm(true)}
          onAdmin={() => {}}
        />
        <button className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
        <AdminPanel onBack={handleLogout} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCadastrar={() => setShowForm(true)}
        onAdmin={() => {
          window.location.hash = '#/admin';
        }}
      />

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            <EntityForm onSuccess={handleEntityCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-left">
            <h1 className="hero-title animate-in">
              Mapa das<br />
              Entidades Culturais<br />
              do <span>Espírito Santo</span>
            </h1>
            <p className="hero-description animate-in delay-1">
              Encontre, conheça e fortaleça as organizações culturais que transformam nosso estado todos os dias.
            </p>
            <div className="stats-row animate-in delay-2">
              <div className="stat-card">
                <div className="stat-number">{assocCount}</div>
                <div className="stat-label">Entidades<br />Cadastradas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{municipCount}</div>
                <div className="stat-label">Municípios<br />Alcançados</div>
              </div>
            </div>
            <div className="explore-hint animate-in delay-3">
              <div className="explore-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <p className="explore-text">
                Explore o mapa ao lado ou filtre por tipo, categoria ou município para encontrar iniciativas perto de você.
              </p>
            </div>
          </div>
          <div className="map-wrapper animate-in delay-2">
            <div className="map-controls">
              <button
                className={`map-control-btn ${mapView === 'map' ? 'active' : ''}`}
                onClick={() => setMapView('map')}
              >
                Mapa
              </button>
              <button
                className={`map-control-btn ${mapView === 'satellite' ? 'active' : ''}`}
                onClick={() => setMapView('satellite')}
              >
                Satélite
              </button>
              <button
                className="map-control-btn"
                onClick={handleShowAllOnMap}
                title="Ver todas no mapa"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3l6 6-9 9-6-6 9-9z"></path>
                  <path d="M9 21l-6-6 9-9 6 6-9 9z"></path>
                </svg>
              </button>
            </div>

            <div className="map-legend">
              {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                <div key={type} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: config.color }}></span>
                  <span className="legend-label">{config.label}</span>
                </div>
              ))}
            </div>

            <MapContainer
              center={[-19.92, -40.31]}
              zoom={8}
              style={{ width: '100%', height: '520px', borderRadius: '14px' }}
              zoomControl={true}
            >
              <TileLayer
                url={mapView === 'satellite' ? satelliteUrl : streetUrl}
                attribution={mapView === 'satellite' ? '© Esri' : '© OpenStreetMap contributors'}
              />
              <Polygon
                positions={esBoundary}
                color="#1A7A63"
                weight={2}
                fillColor="#2A9D7B"
                fillOpacity={0.15}
                smoothFactor={1}
              />
              {filteredEntities.map((entity) => (
                <Marker
                  key={entity.id}
                  position={[entity.lat, entity.lng]}
                  icon={createMarkerIcon(entity.type)}
                >
                  <Popup className="entity-popup">
                    <div className="popup-content">
                      <h3>{entity.name}</h3>
                      <span className={`entity-badge type-${entity.type}`}>
                        {TYPE_CONFIG[entity.type]?.label || entity.type}
                      </span>
                      <div className="popup-details">
                        <p><strong>Categoria:</strong> {entity.category}</p>
                        <p><strong>Município:</strong> {entity.municipality} - {entity.region}</p>
                        {entity.address && <p><strong>Endereço:</strong> {entity.address}</p>}
                        {entity.phone && <p><strong>Telefone:</strong> {entity.phone}</p>}
                        {entity.email && <p><strong>Email:</strong> {entity.email}</p>}
                        {entity.website && <p><strong>Website:</strong> <a href={entity.website} target="_blank" rel="noopener noreferrer">{entity.website}</a></p>}
                        {entity.socialMedia && <p><strong>Redes:</strong> {entity.socialMedia}</p>}
                        {entity.services && <p><strong>Serviços:</strong> {entity.services}</p>}
                        {entity.description && <p className="description">{entity.description}</p>}
                        {entity.foundedYear && <p><strong>Fundação:</strong> {entity.foundedYear}</p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapBoundsHandler positions={entityPositions} shouldFit={fitBounds} />
            </MapContainer>
          </div>
        </section>

        <FilterSection
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          municipalities={municipalityNames}
          regions={['Grande Vitória', 'Norte do ES', 'Sul do ES', 'Central', 'Serrana']}
          types={Object.keys(TYPE_CONFIG)}
        />

        <AssociationsTable
          associations={filteredEntities}
          onViewOnMap={(entity) => handleViewOnMap(entity.id)}
          loading={loading}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
