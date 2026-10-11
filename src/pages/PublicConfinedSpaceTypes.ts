export interface PublicRescueScenario {
  name: string;
  response: string;
  techniques?: string;
  equipment?: string;
  team?: string;
  drills?: string;
  hazards?: string;
}
export interface PublicSpaceSnapshot {
  code: string;
  name: string;
  locationText?: string | null;
  classification?: string | null;
  accesses?: string[];
  rescuePlan?: { reviewDueOn?: string | null; scenarios?: PublicRescueScenario[] } | null;
}
export interface PublicConfinedSpace {
  kind: 'confined_space';
  company: string;
  branch: string;
  code: string;
  name: string;
  registrationStatus: 'active' | 'inactive';
  operationalRestriction: 'none' | 'maintenance' | 'interdicted';
  publication: { status: 'published'; snapshot: PublicSpaceSnapshot } | { status: 'not_published' | 'plan_unavailable' };
  notice: string;
}
