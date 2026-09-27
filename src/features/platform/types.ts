export interface Branch {
  id: string;
  name: string;
  code: string;
}
export interface Role {
  id: string;
  roleCode: string;
  branchId: string | null;
  grantedAt: string;
}
export interface Account {
  id: string;
  fullName: string;
  email: string;
  status: string;
  invitationExpiresAt: string | null;
  roles: Role[];
}
export interface Entitlement {
  id: string;
  companyId: string;
  branchId: string | null;
  moduleCode: string;
  pricingTierId: string | null;
  contractedMonthlyPriceCents: number | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
}

export type AccessAction = { account: Account; mode: "edit" | "add"; grantId?: string };
export type AccessRoleCode = "company_admin" | "branch_admin" | "supervisor" | "manager" | "operator" | "viewer";
