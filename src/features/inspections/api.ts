import { type Scope } from "../shared.js";
export const base = ({ companyId, branchId }: Scope) =>
  `v1/companies/${companyId}/branches/${branchId}`;

