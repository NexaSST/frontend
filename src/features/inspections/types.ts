import { type ModuleSearch, type Scope } from "../shared.js";
export interface Category {
  id: string;
  name: string;
  rowVersion: string;
}
export interface AssetType {
  id: string;
  name: string;
  categoryId: string | null;
  inspectionIntervalDays: number | null;
  hasExpirationDate: boolean;
  defaultTemplateId: string | null;
  rowVersion: string;
}
export interface Asset {
  id: string;
  code: string;
  assetTypeId: string;
  sector: string | null;
  location: string | null;
  expiresOn: string | null;
  nextInspectionDueOn: string | null;
  rowVersion: string;
}
export interface Template {
  id: string;
  name: string;
  versionId: string;
  versionNo: number;
  publishedAt: string;
}
export interface Inspection {
  id: string;
  assetCode: string;
  assetTypeName: string;
  status: string;
  capturedAt: string | null;
  completedAt: string | null;
}
export interface MonthlyInspectionReport {
  generatedAt: string;
  month: string;
  company: { id: string; name: string };
  branch: { id: string; name: string; timezone: string };
  summary: { inspections: number; nonconformities: number; photos: number; geolocatedPhotos: number; flaggedPhotos: number };
  inspections: Array<Inspection & {
    inspectorName: string;
    answers: Array<{
      code: string; prompt: string; outcome: string | null; textValue: string | null; numberValue: number | null;
      dateValue: string | null; comment: string | null;
      evidence: null | { fileId: string; sha256: string; latitude: number | null; longitude: number | null; accuracyM: number | null;
        capturedAt: string | null; mocked: boolean | null; precisionAuthorization: string | null; verificationStatus: string | null; verificationReason: string | null };
    }>;
  }>;
}
export interface ActionPlan { id: string; inspectionId: string; title: string; assetCode: string; questionCode: string; comment: string | null;
  correctiveAction: string | null; responsiblePersonId: string | null; responsibleName: string | null; dueOn: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; completionNote: string | null; completedAt: string | null; rowVersion: string }
export type Props = {
  scope: Scope;
  tab: string;
  search: ModuleSearch;
  permissions: string[];
  setSearch: (patch: Partial<ModuleSearch>) => void;
};
