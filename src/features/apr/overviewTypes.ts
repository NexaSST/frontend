export type PeriodDays = 30 | 90 | 180 | 365;
export type Flow = 'apr' | 'pt';
export type Activity = { start: string; label: string; aprRevisionsFinalized: number; workPermitsAuthorized: number };
export type Dashboard = { asOf: string; generatedAt: string; modules: { apr?: { draftAprs: number; finalizedAprs: number; draftWorkPermits: number; authorizedWorkPermits: number; aprRevisionsFinalized: number; workPermitsAuthorized: number; workPermitsWithTrainingGaps: number } }; activity: Activity[] };
export type PriorityPage = { items: { kind: string; title: string; detail: string; entityId: string }[]; total: number };

