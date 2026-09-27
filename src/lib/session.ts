import { queryOptions } from '@tanstack/react-query';
import { apiJson } from './api.js';

export interface PlatformSession {
  kind: 'platform';
  email: string;
  platformAccountId: string;
  context: {
    type: 'platform';
    canManageCompanies: boolean;
    canManageBranches: boolean;
    canManageEntitlements: boolean;
    canSelectCompanyAndBranch: boolean;
    operationalAccessMode: 'administrative';
  };
}

export interface ModuleContext { code: string; name: string; permissions: string[] }
export interface BranchContext {
  id: string;
  name: string;
  code: string;
  timezone: string | null;
  foundationPermissions: string[];
  modules: ModuleContext[];
}
export interface CompanySession {
  kind: 'company';
  email: string;
  companyId: string;
  accountId: string;
  identity: { id: string; email: string; name: string };
  context: {
    type: 'company';
    company: { id: string; name: string; timezone: string | null };
    roles: Array<{ code: string; name: string; branchId: string | null }>;
    branches: BranchContext[];
  };
}

export type Session = PlatformSession | CompanySession;

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: () => apiJson<Session>('v1/auth/me'),
  staleTime: 60_000,
  retry: false,
});
