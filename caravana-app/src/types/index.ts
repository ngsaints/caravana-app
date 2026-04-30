export interface Municipality {
  id?: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Association {
  id: string | number;
  name: string;
  municipality: string;
  category: string;
  region: string;
  contact?: string;
  lat: number;
  lng: number;
}

export type MapView = 'map' | 'satellite';

export interface Filters {
  search: string;
  category: string;
  municipality: string;
  region: string;
  type: string;
  status?: string;
}
