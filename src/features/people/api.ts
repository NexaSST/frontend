import type { Scope } from '../shared.js';

export const root = ({ companyId, branchId }: Scope) => `v1/companies/${companyId}/branches/${branchId}`;
