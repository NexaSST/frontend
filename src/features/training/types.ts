import { type ModuleSearch, type Scope } from "../shared.js";

export interface Frequency { id: string; name: string; days: number | null }
export type Props = {
  scope: Scope;
  tab: string;
  search: ModuleSearch;
  permissions: string[];
  setSearch: (patch: Partial<ModuleSearch>) => void;
};
export type Named = { id: string; name: string; cbo?: string | null; taxIdentifier?: string | null };
export interface Person {
  id: string;
  fullName: string;
  publicPath: string;
  startsOn?: string;
  externalCode?: string | null;
  contactEmail?: string | null;
  assignmentId?: string;
  employmentType?: 'own' | 'outsourced';
  jobName?: string | null;
  departmentName?: string | null;
  sectorName?: string | null;
  supplierName?: string | null;
  jobFunctionId?: string;
  departmentId?: string;
  sectorId?: string | null;
  supplierId?: string | null;
}
export interface Course extends Named {
  code: string;
  description: string | null;
  workloadHours: number | null;
  validityDays: number | null;
  certificateRequired: boolean;
  type: string | null;
  frequencyId: string;
}
export interface Event {
  modality: string | null;
  id: string;
  courseId: string;
  title: string | null;
  trainingOn: string;
  instructorName: string | null;
  status?: 'draft' | 'completed' | 'archived';
  draft?: { step?: number; participants?: Array<{ personId: string }> };
}
export interface Obligation { personId: string; personName: string; courseId: string; courseCode: string; courseName: string; status: 'expired' | 'not_completed' | 'due_30' | 'attention_90' | 'up_to_date'; expiresOn: string | null; employmentType: string }
export interface TrainingReport { month: string; asOf: string; company: { name: string }; branch: { name: string };
  summary: { applicable: number; compliant: number; expired: number; missing: number; expiring: number; attention: number; compliancePercent: number | null };
  alerts: Array<{ kind: string; severity: string; personName: string; detail: string; date: string | null }>;
  completions: Array<{ id: string; personName: string; courseCode: string; courseName: string; trainingOn: string | null; expiresOn: string | null }> }
