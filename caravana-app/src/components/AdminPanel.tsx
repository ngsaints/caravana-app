import { useState, useMemo } from 'react';
import { useEntities, useStats, ENTITY_TYPES, CATEGORIES, useMunicipalities, useCreateEntity, useScraperStatus, useExportEntities, useScraperConfigure, useScraperRunApify, useScraperRunGemini, useScraperEnrich, type Entity } from '../hooks/useApi';

interface AdminPanelProps {
  onBack: () => void;
}

const ITEMS_PER_PAGE = 10;

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { entities, loading, error, refetch } = useEntities({
    search: '',
    category: '',
    municipality: '',
    region: '',
    type: ''
  });
  const stats = useStats();
  const municipalities = useMunicipalities();
  const { create, loading: creating } = useCreateEntity();
const scraperStatus = useScraperStatus();
  const { exportEntities } = useExportEntities();
  const { configure: configureScraper, loading: configuringScraper } = useScraperConfigure();
  const { runApify, loading: runningApify } = useScraperRunApify();
  const { runGemini, loading: runningGemini } = useScraperRunGemini();
  const { enrich, loading: enriching } = useScraperEnrich();

  const [showScraperConfig, setShowScraperConfig] = useState(false);
  const [scraperToken, setScraperToken] = useState('');
  const [geminiTokens, setGeminiTokens] = useState<string[]>(['']);
  const [scraperMessage, setScraperMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [geminiMaxMun, setGeminiMaxMun] = useState(5);

  const addGeminiToken = () => {
    setGeminiTokens([...geminiTokens, '']);
  };

  const removeGeminiToken = (index: number) => {
    if (geminiTokens.length > 1) {
      setGeminiTokens(geminiTokens.filter((_, i) => i !== index));
    }
  };

  const updateGeminiToken = (index: number, value: string) => {
    const newTokens = [...geminiTokens];
    newTokens[index] = value;
    setGeminiTokens(newTokens);
  };

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    municipality: '',
    region: '',
    lat: -19.92,
    lng: -40.31,
    address: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: '',
    description: '',
    services: '',
    foundedYear: ''
  });

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;
    const query = searchQuery.toLowerCase();
    return entities.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.municipality.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      e.type.toLowerCase().includes(query)
    );
  }, [entities, searchQuery]);

  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntities, currentPage]);

  const handleSelectAll = () => {
    if (selectedEntities.size === paginatedEntities.length) {
      setSelectedEntities(new Set());
    } else {
      setSelectedEntities(new Set(paginatedEntities.map(e => e.id)));
    }
  };

  const handleSelectEntity = (id: string) => {
    const newSelected = new Set(selectedEntities);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntities(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedEntities.size === 0) return;
    if (!confirm(`Excluir ${selectedEntities.size} entidade(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedEntities).map(id =>
          fetch(`http://94.141.97.178:3002/api/entities/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedEntities(new Set());
      refetch();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleEdit = (entity: Entity) => {
    setSelectedEntities(new Set([entity.id]));
    setFormData({
      name: entity.name,
      type: entity.type,
      category: entity.category,
      municipality: entity.municipality,
      region: entity.region,
      lat: entity.lat,
      lng: entity.lng,
      address: entity.address || '',
      phone: entity.phone || '',
      email: entity.email || '',
      website: entity.website || '',
      socialMedia: entity.socialMedia || '',
      description: entity.description || '',
      services: entity.services || '',
      foundedYear: entity.foundedYear?.toString() || ''
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedEntities(new Set());
    setFormData({
      name: '',
      type: '',
      category: '',
      municipality: '',
      region: '',
      lat: -19.92,
      lng: -40.31,
      address: '',
      phone: '',
      email: '',
      website: '',
      socialMedia: '',
      description: '',
      services: '',
      foundedYear: ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedEntities(new Set());
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'municipality') {
      const mun = municipalities.find((m) => m.name === value);
      if (mun) {
        setFormData((prev) => ({ ...prev, municipality: value, region: mun.region, lat: mun.lat, lng: mun.lng }));
      }
    }
    if (key === 'type') {
      setFormData((prev) => ({ ...prev, category: '', [key]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({
        name: formData.name,
        type: formData.type,
        category: formData.category,
        municipality: formData.municipality,
        region: formData.region,
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        socialMedia: formData.socialMedia || undefined,
        description: formData.description || undefined,
        services: formData.services || undefined,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined
      });
      handleCancel();
      window.location.reload();
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://94.141.97.178:3002/api/entities/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>{selectedEntities.size === 1 ? 'Editar Entidade' : 'Nova Entidade'}</h1>
          <button className="btn-secondary" onClick={handleCancel}>Cancelar</button>
        </div>

        <form className="entity-form admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} required>
                <option value="">Selecione</option>
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} required disabled={!formData.type}>
                <option value="">Selecione</option>
                {formData.type && CATEGORIES[formData.type]?.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Município *</label>
              <select value={formData.municipality} onChange={(e) => handleChange('municipality', e.target.value)} required>
                <option value="">Selecione</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Região</label>
              <input type="text" value={formData.region} readOnly />
            </div>
            <div className="form-group">
              <label>Ano de Fundação</label>
              <input type="number" value={formData.foundedYear} onChange={(e) => handleChange('foundedYear', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Website</label>
              <input type="url" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Redes Sociais</label>
              <input type="text" value={formData.socialMedia} onChange={(e) => handleChange('socialMedia', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Endereço</label>
              <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Serviços/Atividades</label>
              <input type="text" value={formData.services} onChange={(e) => handleChange('services', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <button className="btn-secondary" onClick={onBack}>Voltar ao Mapa</button>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.entityCount}</div>
            <div className="stat-label">Total Entidades</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.municipalityCount}</div>
            <div className="stat-label">Municípios</div>
          </div>
          {stats.byType.slice(0, 3).map((item) => (
            <div key={item.type} className="stat-card">
              <div className="stat-number">{item._count}</div>
              <div className="stat-label">{ENTITY_TYPES.find(t => t.value === item.type)?.label.split(' ')[0] || item.type}</div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Pesquisar entidades..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn-primary" onClick={handleNew}>+ Nova</button>
          {selectedEntities.size > 0 && (
            <button className="btn-danger" onClick={handleDeleteSelected}>
              Excluir Selecionados ({selectedEntities.size})
            </button>
          )}
          <button className="btn-secondary" onClick={() => exportEntities()}>
            Exportar CSV
          </button>
          <button className="btn-secondary" onClick={() => setShowImportModal(true)}>
            Importar CSV
          </button>
          <button 
            className={`btn-secondary ${scraperStatus?.hasApify ? 'btn-success' : ''}`}
            onClick={() => setShowScraperConfig(!showScraperConfig)}
          >
            {scraperStatus?.hasApify ? '🔗 Apify OK' : '⚙️ Apify'}
          </button>
          <button
            className={`btn-secondary ${scraperStatus?.hasGemini ? 'btn-success' : ''}`}
            onClick={() => setShowScraperConfig(!showScraperConfig)}
          >
            {scraperStatus?.hasGemini ? '🤖 Gemini OK' : '🤖 Gemini'}
          </button>
          {scraperStatus?.configured && (
            <button
              className="btn-primary"
              onClick={async () => {
                if (confirm('Iniciar scraping com Apify? Isso pode levar vários minutos...')) {
                  try {
                    const result = await runApify();
                    alert(`Scraping concluído! Found: ${result.totalFound}, Imported: ${result.imported}, Skipped: ${result.skipped}`);
                    refetch();
                  } catch (err) {
                    alert('Erro ao executar scraper');
                  }
                }
              }}
              disabled={runningApify}
            >
              {runningApify ? '⏳ Executando...' : '🌐 Executar Apify Scraper'}
            </button>
          )}
          {scraperStatus?.configured && (
            <button
              className="btn-secondary"
              onClick={async () => {
                const munCount = prompt(`Quantos municípios buscar? (1-${geminiMaxMun})`, String(geminiMaxMun));
                if (!munCount) return;
                const count = parseInt(munCount) || geminiMaxMun;
                if (confirm(`Iniciar busca com Gemini em ${count} municípios? Isso pode levar vários minutos...`)) {
                  try {
                    const result = await runGemini(count);
                    alert(`Busca concluída! Found: ${result.totalFound}, Imported: ${result.imported}, Skipped: ${result.skipped}\n${result.message || ''}`);
                    refetch();
                  } catch (err) {
                    alert('Erro ao executar busca Gemini');
                  }
                }
              }}
              disabled={runningGemini}
            >
              {runningGemini ? '⏳ Executando...' : '🤖 Gemini Maps'}
            </button>
          )}
          {scraperStatus?.configured && (
            <button
              className="btn-secondary"
              onClick={async () => {
                if (confirm('Enriquecer entidades existentes com Gemini? Selecione primeiro as entidades na lista.')) {
                  try {
                    const result = await enrich();
                    alert(`Enriquecimento concluído! Updated: ${result.updated}`);
                    refetch();
                  } catch (err) {
                    alert('Erro ao enriquecer entidades');
                  }
                }
              }}
              disabled={enriching}
            >
              {enriching ? '⏳ Enriquecendo...' : '✨ Enrich with Gemini'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="table-loading">Carregando...</div>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : (
        <>
          <table className="associations-table admin-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={paginatedEntities.length > 0 && selectedEntities.size === paginatedEntities.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Município</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">
                    {searchQuery ? 'Nenhuma entidade encontrada' : 'Nenhuma entidade cadastrada'}
                  </td>
                </tr>
              ) : (
                paginatedEntities.map((entity) => (
                  <tr key={entity.id} className={selectedEntities.has(entity.id) ? 'selected' : ''}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedEntities.has(entity.id)}
                        onChange={() => handleSelectEntity(entity.id)}
                      />
                    </td>
                    <td>
                      <strong>{entity.name}</strong>
                    </td>
                    <td>
                      <span className={`entity-type type-${entity.type}`}>
                        {ENTITY_TYPES.find(t => t.value === entity.type)?.label || entity.type}
                      </span>
                    </td>
                    <td>{entity.municipality}</td>
                    <td>{entity.category}</td>
                    <td>
                      <span className={`status-badge ${entity.status}`}>{entity.status}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(entity)}>Editar</button>
                        {deleteConfirm === entity.id ? (
                          <div className="delete-confirm">
                            <span>Excluir?</span>
                            <button className="btn-delete" onClick={() => handleDelete(entity.id)}>Sim</button>
                            <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Não</button>
                          </div>
                        ) : (
                          <button className="btn-delete" onClick={() => setDeleteConfirm(entity.id)}>Excluir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                ««
              </button>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                «
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                »
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                »»
              </button>
            </div>
          )}

          <div className="table-footer">
            Mostrando {paginatedEntities.length} de {filteredEntities.length} entidades
          </div>

          {showScraperConfig && (
            <div className="scraper-config-modal">
              <div className="modal-content">
                <h3>🔗 Configurar Scraper</h3>
                
                <div style={{marginTop: '1rem'}}>
                  <label style={{fontWeight: 'bold'}}>API Keys Gemini</label>
                  <p style={{fontSize: '0.85rem', color: '#666'}}>
                    Adicione múltiplas chaves para fallback e balanceamento de carga
                  </p>
                  {geminiTokens.map((token, index) => (
                    <div key={index} style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center'}}>
                      <input
                        type="password"
                        placeholder={`Chave Gemini ${index + 1}...`}
                        value={token}
                        onChange={(e) => updateGeminiToken(index, e.target.value)}
                        style={{flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace'}}
                      />
                      {geminiTokens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGeminiToken(index)}
                          style={{padding: '0.5rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addGeminiToken}
                    style={{marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    + Adicionar outra chave Gemini
                  </button>
                </div>

                <div style={{marginTop: '1rem'}}>
                  <label style={{fontWeight: 'bold'}}>Token Apify (opcional)</label>
                  <p style={{fontSize: '0.85rem', color: '#666'}}>
                    Para usar Apify como fallback
                  </p>
                  <input
                    type="password"
                    placeholder="Cole seu APIFY_TOKEN aqui..."
                    value={scraperToken}
                    onChange={(e) => setScraperToken(e.target.value)}
                    style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginTop: '0.5rem'}}
                  />
                </div>

                <div style={{marginTop: '1rem'}}>
                  <label style={{fontWeight: 'bold'}}>Quantos municípios buscar por vez</label>
                  <p style={{fontSize: '0.85rem', color: '#666'}}>
                    Quanto menos municípios, menos quota gasta. Recomenda-se 3-5.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={geminiMaxMun}
                    onChange={(e) => setGeminiMaxMun(parseInt(e.target.value) || 5)}
                    style={{width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginTop: '0.5rem'}}
                  />
                </div>

                {scraperMessage && (
                  <p style={{color: scraperMessage.type === 'error' ? 'red' : 'green', marginTop: '0.5rem'}}>
                    {scraperMessage.text}
                  </p>
                )}
                <div className="modal-actions" style={{marginTop: '1rem'}}>
                  <button 
                    className="btn-primary"
                    onClick={async () => {
                      if (!geminiTokens.some(t => t.trim()) && !scraperToken.trim()) {
                        setScraperMessage({type: 'error', text: 'Pelo menos um token é necessário'});
                        return;
                      }
                      try {
                        const validTokens = geminiTokens.filter(t => t.trim());
                        await configureScraper(scraperToken, '', validTokens);
                        setScraperMessage({type: 'success', text: `Tokens salvos! (${validTokens.length} chaves Gemini)`});
                      } catch (err: any) {
                        setScraperMessage({type: 'error', text: err.message || 'Erro ao salvar'});
                      }
                    }}
                    disabled={configuringScraper}
                  >
                    {configuringScraper ? 'Salvando...' : 'Salvar Tokens'}
                  </button>
                  <button className="btn-secondary" onClick={() => { setShowScraperConfig(false); setScraperMessage(null); }}>Fechar</button>
                </div>
              </div>
            </div>
          )}

          {showImportModal && (
            <div className="scraper-config-modal">
              <div className="modal-content">
                <h3>Importar CSV</h3>
                <p>Selecione um arquivo CSV exportado para importar entidades.</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const text = ev.target?.result as string;
                      const lines = text.split('\n').slice(1);
                      const entities = lines.filter(l => l.trim()).map(line => {
                        const cols = line.split(',');
                        return {
                          name: cols[0]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
                          type: cols[1] || 'associacao_cultural',
                          category: cols[2] || 'Cultura',
                          municipality: cols[3] || '',
                          region: cols[4] || '',
                          address: cols[5]?.replace(/^"|"$/g, '') || '',
                          lat: parseFloat(cols[6]) || 0,
                          lng: parseFloat(cols[7]) || 0,
                          phone: cols[8] || '',
                          website: cols[9] || '',
                          email: cols[10] || '',
                          description: cols[11]?.replace(/^"|"$/g, '') || '',
                          services: cols[12]?.replace(/^"|"$/g, '') || '',
                          status: 'pending'
                        };
                      });
                      if (entities.length > 0) {
                        try {
                          const res = await fetch('http://94.141.97.178:3002/api/entities/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ entities })
                          });
                          const result = await res.json();
                          alert(`Importadas ${result.imported} de ${result.total} entidades`);
                          setShowImportModal(false);
                          refetch();
                        } catch (err) {
                          alert('Erro ao importar');
                        }
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowImportModal(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
