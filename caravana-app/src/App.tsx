import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { AssociationsTable } from './components/AssociationsTable';
import { Footer } from './components/Footer';
import { EntityForm } from './components/EntityForm';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { EmbedView } from './components/EmbedView';
import { useEntities, useStats, type Filters } from './hooks/useApi';
import 'leaflet/dist/leaflet.css';
import './styles/App.css';

const ADMIN_PASSWORD = 'caravana2024';

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
  selectedEntityId?: string | null;
  entities?: any[];
}

function MapBoundsHandler({ positions, shouldFit, selectedEntityId, entities }: MapBoundsHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (shouldFit && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [shouldFit, positions, map]);

  useEffect(() => {
    if (selectedEntityId && entities) {
      const entity = entities.find((e: any) => e.id === selectedEntityId);
      if (entity) {
        map.setView([entity.lat, entity.lng], 15, {
          animate: true,
          duration: 1
        });
        
        // Abrir popup da entidade após o zoom
        setTimeout(() => {
          map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              const markerLatLng = layer.getLatLng();
              if (markerLatLng.lat === entity.lat && markerLatLng.lng === entity.lng) {
                layer.openPopup();
              }
            }
          });
        }, 500);
      }
    }
  }, [selectedEntityId, entities, map]);

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);

  return null;
}

function App() {
  // Verificar se é rota embed
  const isEmbedRoute = window.location.hash === '#/embed' || window.location.pathname === '/embed';
  
  if (isEmbedRoute) {
    return <EmbedView />;
  }

  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'login'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Usar localStorage para manter sessão permanente
    return localStorage.getItem('caravana_auth') === 'true';
  });
  const [activeSection, setActiveSection] = useState('INÍCIO');
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const [showForm, setShowForm] = useState(false);
  const [fitBounds, setFitBounds] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [assocCount, setAssocCount] = useState(0);
  const [municipCount, setMunicipCount] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    municipality: '',
    region: '',
    type: ''
  });

  // Reset fitBounds após ser usado
  useEffect(() => {
    if (fitBounds) {
      const timer = setTimeout(() => {
        setFitBounds(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fitBounds]);

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
    // Mostra apenas entidades ativas (aprovadas) no mapa público
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

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Limpar selectedEntityId após 2 segundos
  useEffect(() => {
    if (selectedEntityId) {
      const timer = setTimeout(() => {
        setSelectedEntityId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedEntityId]);

  const handleViewOnMap = (entityId?: string) => {
    setMapView('map');
    setActiveSection('MAPA');
    if (entityId) {
      setSelectedEntityId(entityId);
      // Scroll suave para o mapa
      setTimeout(() => {
        const mapElement = document.querySelector('.map-wrapper');
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
      localStorage.setItem('caravana_auth', 'true'); // Mudado para localStorage
      setCurrentPage('admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('caravana_auth'); // Mudado para localStorage
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
          onLogout={handleLogout}
          showLogout={true}
        />
        <button className="btn-logout btn-logout-desktop" onClick={handleLogout}>
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
                title="Visualização de mapa"
              >
                🗺️ Mapa
              </button>
              <button
                className={`map-control-btn ${mapView === 'satellite' ? 'active' : ''}`}
                onClick={() => setMapView('satellite')}
                title="Visualização de satélite"
              >
                🛰️ Satélite
              </button>
              <button
                className="map-control-btn"
                onClick={handleShowAllOnMap}
                title="Ajustar zoom para ver todas as entidades"
              >
                🎯 Ver Todas
              </button>
            </div>

            <div className={`map-legend ${legendExpanded ? 'expanded' : 'collapsed'}`}>
              <div 
                className="legend-toggle" 
                onClick={() => setLegendExpanded(!legendExpanded)}
                title={legendExpanded ? 'Ocultar legenda' : 'Mostrar legenda'}
              >
                {legendExpanded ? '✕' : '📍'}
              </div>
              <div className="legend-header">Tipos de Entidades</div>
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
              style={{ width: '100%', height: '100%', borderRadius: '14px' }}
              zoomControl={false}
            >
              <TileLayer
                url={mapView === 'satellite' ? satelliteUrl : streetUrl}
                attribution={mapView === 'satellite' ? '© Esri' : '© OpenStreetMap contributors'}
              />
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={50}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
              >
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
              </MarkerClusterGroup>
              <MapBoundsHandler 
                positions={entityPositions} 
                shouldFit={fitBounds}
                selectedEntityId={selectedEntityId}
                entities={filteredEntities}
              />
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
