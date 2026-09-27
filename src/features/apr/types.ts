import { type ModuleSearch, type Scope } from "../shared.js";
export type Props = {
  scope: Scope;
  tab: string;
  area: "apr" | "pt";
  search: ModuleSearch;
  permissions: string[];
  setSearch: (patch: Partial<ModuleSearch>) => void;
};
export type Named = { id: string; name: string };
export interface Template extends Named {
  versionId: string;
  versionNo: number;
  activityId?: string | null;
  nr?: string | null;
  questionCount?: number;
  definition?: { instructions: string; nr?: string; questions?: Array<{ code: string; text: string; required: boolean; allowNa: boolean }>;
    riskSummary?: string; controlSummary?: string };
}
export interface CatalogItem { code: string; nr: string; name: string; questionCount: number; imported: boolean; upToDate: boolean; versionNo: number }
export interface CatalogDetail extends Pick<CatalogItem, "code" | "nr" | "name" | "versionNo"> {
  instructions: string;
  riskSummary: string;
  controlSummary: string;
  questions: Array<{ code: string; text: string; required: boolean; allowNa: boolean }>;
}
export interface Person {
  id: string;
  fullName: string;
}
export interface AprRow {
  id: string;
  referenceCode: string;
  title: string;
  status: string;
}
export interface WorkPermitRow {
  id: string;
  referenceCode: string;
  title: string;
  workDescription: string;
  activityId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  version: number;
  wizardStep: number;
  trainingValidationRequired: boolean;
  authorizedAt: string | null;
  cancelledAt?: string | null;
  cancellationRequestedByName?: string | null;
  publicPath?: string | null;
}
export interface WorkPermitDetail extends WorkPermitRow {
  participants: Array<{ personId: string; fullName: string; roleLabel: string | null }>;
  aprs: Array<{ documentId: string; revisionId: string; revisionNo: number; referenceCode: string; title: string }>;
  confinedSpaceId: string | null;
  rescuePlanScenarioId: string | null;
  nr33Evidences: Array<{ personId: string; roleLabel: string; evidenceFileId: string; validUntil: string | null }>;
}
export interface AprMonthlyReport { month: string; company: { name: string }; branch: { name: string };
  summary: { aprRevisions: number; workPermits: number; authorizedPermits: number; cancelledPermits: number };
  aprs: Array<{ revisionId: string; referenceCode: string; title: string; revisionNo: number; sha256: string; finalizedAt: string | null }>;
  workPermits: Array<{ id: string; referenceCode: string; title: string; status: string; startsAt: string | null; endsAt: string | null;
    authorizedAt: string | null; cancelledAt: string | null; cancellationRequestedByName: string | null; publicPath: string }> }
export interface Risk {
  taskStep: string;
  hazard: string;
  consequence: string;
  severityCode: string;
  likelihoodCode: string;
  controls: Array<{ description: string }>;
}
export interface AprFormValues {
  referenceCode: string; title: string; templateVersionId: string; activityId: string;
  sector: string; location: string; executionOn: string; analystPersonId: string; teamText: string;
  answers: Array<{ code: string; answer: string; observation: string }>;
  risks: Risk[]; participantIds: string[];
}
export interface AprDetail extends AprRow {
  activityId: string | null;
  sector: string | null;
  location: string | null;
  executionOn?: string | null;
  analystPersonId?: string | null;
  teamText?: string | null;
  draft: {
    version: number;
    wizardStep?: number;
    templateVersionId: string;
    risks: Risk[];
    participants: Array<{ personId: string; roleLabel: string }>;
    teamText?: string;
    answers?: Array<{ code: string; answer: string; observation: string }>;
  };
  revisions: Array<{
    id: string;
    revisionNo: number;
    sha256: string;
    finalizedAt: string;
  }>;
}
export interface AprRevision {
  id: string;
  revisionNo: number;
  snapshot: {
    activityName?: string | null;
    location?: string | null;
    executionOn?: string | null;
    analystName?: string | null;
    answers?: Array<{ code: string; text: string; answer: string; observation: string }>;
  };
}
