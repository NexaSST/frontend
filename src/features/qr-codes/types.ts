import type { Scope } from '../shared.js';

export type QrResource = 'assets' | 'people' | 'confined-spaces';
export interface QrRecord {
  id: string;
  name: string;
  code: string;
  department: string;
  sector: string;
  location: string;
}
export interface QrSourceRow {
  id: string;
  code?: string | null;
  fullName?: string;
  name?: string;
  externalCode?: string | null;
  departmentName?: string | null;
  sectorName?: string | null;
  sector?: string | null;
  location?: string | null;
  locationText?: string | null;
  assetTypeId?: string;
}
export interface QrProps { scope: Scope; resource: QrResource }
