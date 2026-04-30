import type { Entity } from '../hooks/useApi';

interface AssociationsTableProps {
  associations: Entity[];
  onViewOnMap: (entity: Entity) => void;
  loading?: boolean;
}

export function AssociationsTable({ associations, onViewOnMap, loading }: AssociationsTableProps) {
  const typeLabels: Record<string, string> = {
    radio_comunitaria: 'Rádio',
    associacao_cultural: 'Associação',
    ponto_cultura: 'Ponto de Cultura',
    cineclube: 'Cineclube',
    artista_coletivo: 'Artista/Coletivo'
  };

  if (loading) {
    return (
      <section className="associations-section">
        <h2 className="section-title">Entidades Culturais</h2>
        <div className="table-loading">Carregando...</div>
      </section>
    );
  }

  return (
    <section className="associations-section">
      <h2 className="section-title">Entidades Culturais ({associations.length})</h2>
      <div className="associations-table-wrapper">
        <table className="associations-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Município</th>
              <th>Categoria</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            {associations.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">Nenhuma entidade encontrada</td>
              </tr>
            ) : (
              associations.map((entity) => (
                <tr key={entity.id}>
                  <td>
                    <div className="entity-name-cell">
                      <strong>{entity.name}</strong>
                      {entity.description && (
                        <span className="entity-desc">{entity.description.substring(0, 60)}...</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`entity-type type-${entity.type}`}>
                      {typeLabels[entity.type] || entity.type}
                    </span>
                  </td>
                  <td>{entity.municipality}</td>
                  <td>{entity.category}</td>
                  <td>
                    <div className="contact-cell">
                      {entity.phone && <span className="contact-item">{entity.phone}</span>}
                      {entity.email && <span className="contact-item">{entity.email}</span>}
                      <button className="table-link" onClick={() => onViewOnMap(entity)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Ver no mapa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
