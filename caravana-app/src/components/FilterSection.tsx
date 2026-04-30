import type { Filters } from '../types';

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: string[];
  municipalities: string[];
  regions: string[];
  types: string[];
}

export function FilterSection({
  filters,
  onFilterChange,
  categories,
  municipalities,
  regions,
  types
}: FilterSectionProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFilterChange({ search: '', category: '', municipality: '', region: '', type: '' });
  };

  const typeLabels: Record<string, string> = {
    radio_comunitaria: 'Rádio Comunitária',
    associacao_cultural: 'Associação Cultural',
    ponto_cultura: 'Ponto de Cultura',
    cineclube: 'Cineclube',
    artista_coletivo: 'Artista/Coletivo'
  };

  return (
    <section className="filter-section">
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
          <div className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>{typeLabels[t] || t}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.municipality}
          onChange={(e) => handleChange('municipality', e.target.value)}
        >
          <option value="">Todos os municípios</option>
          {municipalities.map((mun) => (
            <option key={mun} value={mun}>{mun}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.region}
          onChange={(e) => handleChange('region', e.target.value)}
        >
          <option value="">Todas as regiões</option>
          {regions.map((reg) => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>

        <button className="btn-clear" onClick={handleClear}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Limpar filtros
        </button>
      </div>
    </section>
  );
}
