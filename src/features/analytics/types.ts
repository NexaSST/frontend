import type { Scope } from '../shared.js';

export type Domain = 'people' | 'inspections' | 'training' | 'apr';
export type PeriodDays = 30 | 90 | 180 | 365;
export type GroupBy = 'course' | 'department' | 'jobFunction' | 'activity' | 'status';
export type Envelope<T> = { generatedAt: string; asOf: string; timezone: string; data: T };
export type Attention = { entityId: string; kind: string; severity: 'danger' | 'warning' | 'info'; title: string; detail: string; date: string | null };
export type AttentionPage = { page: number; total: number; totalPages: number; items: Attention[] };
export type BreakdownItem = { id: string; label: string; count?: number; applicable?: number; compliancePercent?: number | null; registeredAssets?: number };
export type BreakdownEnvelope = Envelope<{ items: BreakdownItem[] }> & { groupBy: GroupBy };
export type HistoryItem = { date: string; available: boolean; compliancePercent?: number | null; applicable?: number | null; draftAprs?: number | null; draftWorkPermits?: number | null; authorizedWorkPermits?: number | null };
export type HistoryEnvelope = Envelope<{ availableFrom: string | null; items: HistoryItem[] }>;
export type CycleEnvelope = Envelope<{ aprFinalization: { sampleSize: number; medianHours: number | null }; workPermitAuthorization: { sampleSize: number; medianHours: number | null } }>;

export interface Props {
  scope: Scope;
  domain: Domain;
  periodDays?: PeriodDays;
  groupBy?: GroupBy;
  onPeriodChange: (period: PeriodDays) => void;
  onGroupByChange?: (groupBy: GroupBy) => void;
  onOpenAttention?: (item: Attention) => void;
}

