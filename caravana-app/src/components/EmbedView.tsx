import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useEntities, type Filters } from '../hooks/useApi';
import 'leaflet/dist/leaflet.css';

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

function MapBoundsHandler({ selectedEntityId, entities, shouldFit, positions }: any) {
  const map = useMap();

  useEffect(() => {
    if (shouldFit && positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [shouldFit, positions, map]);

  useEffect(() => {
    if (selectedEntityId && entities) {
      const entity = entities.find((e: any) => e.id === selectedEntityId);
      if (entity) {
        map.setView([entity.lat, entity.lng], 15, { animate: true, duration: 1 });
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

export function EmbedView() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: '',
    category: '',
    municipality: '',
    region: '',
    status: 'active'
  });
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const [fitBounds, setFitBounds] = useState(false);
  const [assocCount, setAssocCount] = useState(0);
  const [municipCount, setMunicipCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { entities, loading } = useEntities(filters);

  const filteredEntities = useMemo(() => {
    return entities.filter(e => e.status === 'active');
  }, [entities]);

  const entityPositions = useMemo(() => {
    return filteredEntities.map(e => [e.lat, e.lng] as [number, number]);
  }, [filteredEntities]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    entities.forEach((e) => cats.add(e.category));
    return Array.from(cats).sort();
  }, [entities]);

  const municipalityNames = useMemo(() => [...new Set(entities.map((e) => e.municipality))].sort(), [entities]);

  const regions = ['Grande Vitória', 'Norte do ES', 'Sul do ES', 'Central', 'Serrana'];

  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  
  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntities, currentPage]);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Reset fitBounds após ser usado
  useEffect(() => {
    if (fitBounds) {
      const timer = setTimeout(() => {
        setFitBounds(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fitBounds]);

  // Animar contadores
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
    const timer = setTimeout(() => {
      animateCounter(setAssocCount, filteredEntities.length, 1500);
      const uniqueMunicipalities = new Set(filteredEntities.map(e => e.municipality));
      animateCounter(setMunicipCount, uniqueMunicipalities.size, 1500);
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredEntities]);

  const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const handleViewOnMap = (entityId: string) => {
    setSelectedEntityId(entityId);
    const mapElement = document.querySelector('.embed-map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShowAllOnMap = () => {
    setFitBounds(true);
    const mapElement = document.querySelector('.embed-map-wrapper');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      municipality: '',
      region: '',
      status: 'active'
    });
  };

  return (
    <div className="embed-view">
      {/* Hero Section com Mapa */}
      <section className="embed-hero">
        <div className="embed-hero-left">
          <h1 className="embed-hero-title">
            Mapa das<br />
            Entidades Culturais<br />
            do <span>Espírito Santo</span>
          </h1>
          <p className="embed-hero-description">
            Encontre, conheça e fortaleça as organizações culturais que transformam nosso estado todos os dias.
          </p>
          <div className="embed-stats-row">
            <div className="embed-stat-card">
              <div className="embed-stat-number">{assocCount}</div>
              <div className="embed-stat-label">Entidades<br />Cadastradas</div>
            </div>
            <div className="embed-stat-card">
              <div className="embed-stat-number">{municipCount}</div>
              <div className="embed-stat-label">Municípios<br />Alcançados</div>
            </div>
          </div>
          <div className="embed-explore-hint">
            <div className="embed-explore-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <p className="embed-explore-text">
              Explore o mapa ao lado ou filtre por tipo, categoria ou município para encontrar iniciativas perto de você.
            </p>
          </div>
        </div>

        {/* Mapa */}
        <div className="embed-map-wrapper">
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

          <MapContainer
            center={[-19.92, -40.31]}
            zoom={8}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url={mapView === 'satellite' ? satelliteUrl : streetUrl}
              attribution={mapView === 'satellite' ? '© Esri' : '© OpenStreetMap'}
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
                        <p><strong>Município:</strong> {entity.municipality}</p>
                        {entity.phone && <p><strong>Telefone:</strong> {entity.phone}</p>}
                        {entity.email && <p><strong>Email:</strong> {entity.email}</p>}
                        {entity.website && <p><strong>Website:</strong> <a href={entity.website} target="_blank" rel="noopener noreferrer">{entity.website}</a></p>}
                        {entity.description && <p className="description">{entity.description}</p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
            <MapBoundsHandler 
              selectedEntityId={selectedEntityId}
              entities={filteredEntities}
              shouldFit={fitBounds}
              positions={entityPositions}
            />
          </MapContainer>
        </div>
      </section>

      {/* Filtros */}
      <div className="embed-filter-section">
        <div className="embed-filter-bar">
          <div className="embed-search-input-wrapper">
            <input
              type="text"
              placeholder="🔍 Buscar entidade..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="embed-search-input"
            />
            <div className="embed-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, category: '' })}
            className="embed-filter-select"
          >
            <option value="">Todos os Tipos</option>
            <option value="radio_comunitaria">Rádio Comunitária</option>
            <option value="associacao_cultural">Associação Cultural</option>
            <option value="ponto_cultura">Ponto de Cultura</option>
            <option value="cineclube">Cineclube</option>
            <option value="artista_coletivo">Artista/Coletivo</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="embed-filter-select"
            disabled={!filters.type && categories.length === 0}
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.municipality}
            onChange={(e) => setFilters({ ...filters, municipality: e.target.value })}
            className="embed-filter-select"
          >
            <option value="">Todos os Municípios</option>
            {municipalityNames.map((mun) => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>

          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="embed-filter-select"
          >
            <option value="">Todas as Regiões</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>

          <button className="embed-btn-clear" onClick={handleClearFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Limpar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="embed-list">
        <h3>Entidades Culturais ({filteredEntities.length})</h3>
        {loading ? (
          <p className="embed-loading">Carregando...</p>
        ) : filteredEntities.length === 0 ? (
          <p className="embed-empty">Nenhuma entidade encontrada</p>
        ) : (
          <>
            <div className="embed-table-wrapper">
              <table className="embed-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Município</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntities.map((entity) => (
                    <tr key={entity.id}>
                      <td>
                        <strong>{entity.name}</strong>
                        {entity.description && (
                          <div className="entity-desc">{entity.description.substring(0, 80)}...</div>
                        )}
                      </td>
                      <td>
                        <span className={`entity-type type-${entity.type}`}>
                          {TYPE_CONFIG[entity.type]?.label || entity.type}
                        </span>
                      </td>
                      <td>{entity.municipality}</td>
                      <td>
                        <button 
                          className="btn-view-map"
                          onClick={() => handleViewOnMap(entity.id)}
                        >
                          📍 Ver no Mapa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="embed-pagination">
                <button
                  className="embed-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  ««
                </button>
                <button
                  className="embed-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  «
                </button>
                <span className="embed-page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="embed-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  »
                </button>
                <button
                  className="embed-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  »»
                </button>
              </div>
            )}

            <div className="embed-table-footer">
              Mostrando {paginatedEntities.length} de {filteredEntities.length} entidades
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="embed-footer">
        <p>Powered by <strong>Caravana da Cultura - ES</strong></p>
      </div>
    </div>
  );
}
