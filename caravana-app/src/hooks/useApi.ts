import { useState, useEffect } from 'react';

export interface Entity {
  id: string;
  name: string;
  type: string;
  category: string;
  municipality: string;
  region: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: string;
  description?: string;
  services?: string;
  foundedYear?: number;
  status: string;
}

export interface Municipality {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export interface Filters {
  search: string;
  category: string;
  municipality: string;
  region: string;
  type: string;
}

export interface Stats {
  entityCount: number;
  municipalityCount: number;
  byType: { type: string; _count: number }[];
  byRegion: { region: string; _count: number }[];
}

const API_BASE = 'http://94.141.97.178:3002/api';

export function useEntities(filters: Filters) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.municipality) params.append('municipality', filters.municipality);
        if (filters.region) params.append('region', filters.region);
        if (filters.type) params.append('type', filters.type);

        const res = await fetch(`${API_BASE}/entities?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          setEntities(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setEntities([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [filters.search, filters.category, filters.municipality, filters.region, filters.type, refreshKey]);

  return { entities, loading, error, refetch: () => setRefreshKey(k => k + 1) };
}

export function useMunicipalities() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/municipalities`)
      .then((res) => res.json())
      .then(setMunicipalities)
      .catch(console.error);
  }, []);

  return municipalities;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return stats;
}

export function useCreateEntity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: Omit<Entity, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/entities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export const ENTITY_TYPES = [
  { value: 'radio_comunitaria', label: 'Rádio Comunitária' },
  { value: 'associacao_cultural', label: 'Associação Cultural' },
  { value: 'ponto_cultura', label: 'Ponto de Cultura' },
  { value: 'cineclube', label: 'Cineclube' },
  { value: 'artista_coletivo', label: 'Artista/Coletivo' }
];

export const CATEGORIES: Record<string, string[]> = {
  radio_comunitaria: ['Educação', 'Entretenimento', 'Informação'],
  associacao_cultural: ['Música', 'Dança', 'Teatro', 'Artes Visuais', 'Artesanato', 'Patrimônio Cultural', 'Literatura', 'Capoeira'],
  ponto_cultura: ['Teatro', 'Dança', 'Música', 'Capoeira', 'Hip Hop', 'Cultura Popular', 'Patrimônio Cultural'],
  cineclube: ['Sessões Regulares', 'Festival', 'Ambulante'],
  artista_coletivo: ['Música', 'Dança', 'Teatro', 'Performance', 'Artes Visuais', 'Audiovisual', 'Hip Hop', 'Grafite']
};

export const REGIONS = [
  'Grande Vitória',
  'Norte do ES',
  'Sul do ES',
  'Central',
  'Serrana'
];

export function useScraperStatus() {
  const [status, setStatus] = useState<{ configured: boolean; hasApify: boolean; hasGemini: boolean; lastUpdated: string | null } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/scraper/status`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, hasApify: false, hasGemini: false, lastUpdated: null }));
  }, []);

  return status;
}

export function useScraperConfigure() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configure = async (apifyToken: string, geminiToken: string, geminiTokens?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apifyToken, geminiToken, geminiTokens })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to configure');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { configure, loading, error };
}

export function useScraperRun() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/run`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run scraper');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error };
}

export function useScraperRunAndImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAndImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/run-and-import`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run scraper');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runAndImport, loading, error };
}

export function useScraperRunGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGemini = async (maxMunicipalities: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/run-gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxMunicipalities })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run Gemini scraper');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runGemini, loading, error };
}

export function useScraperRunApify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runApify = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/run-apify`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run Apify scraper');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runApify, loading, error };
}

export function useScraperEnrich() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrich = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scraper/enrich`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to enrich entities');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { enrich, loading, error };
}

export function useImportEntities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importEntities = async (entities: Partial<Entity>[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/entities/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to import');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { importEntities, loading, error };
}

export function useExportEntities() {
  const exportEntities = async () => {
    const res = await fetch(`${API_BASE}/entities/export`);
    if (!res.ok) throw new Error('Failed to export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caravana_cultural_entities.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return { exportEntities };
}
