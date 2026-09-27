import type { Branch } from './types.js';

export const roleLabels: Record<string, string> = {
  company_admin: "Administrador da empresa",
  branch_admin: "Administrador da filial",
  supervisor: "Supervisor",
  manager: "Gestor",
  operator: "Operador",
  viewer: "Consulta",
};
export const roleCodes = ["company_admin", "branch_admin", "supervisor", "manager", "operator", "viewer"] as const;
export function scopeLabel(branchId: string | null, branches: Branch[]): string {
  if (!branchId) return "Empresa inteira";
  return `Somente filial: ${branches.find((branch) => branch.id === branchId)?.name ?? branchId}`;
}

