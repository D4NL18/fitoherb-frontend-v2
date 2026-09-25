export type SavedLocationType = 'BASE' | 'FAVORITE';

export interface SavedLocation {
  id?: string;
  title: string;
  type: SavedLocationType;
  latitude: number;
  longitude: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  fullAddress?: string;
  notes?: string;
  createdAt?: string;
}

export interface SavedLocationReq {
  title: string;
  type: SavedLocationType;
  latitude: number;
  longitude: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  fullAddress?: string;
  notes?: string;
}
