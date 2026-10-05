import { useState } from "react";
import { Button, Select } from "../../components/ui/index.js";
import { Field } from "../shared.js";
import type { Branch, AccessAction, AccessRoleCode } from "./types.js";
import { roleLabels, roleCodes, scopeLabel } from "./accessRoles.js";

export function RoleActionPanel({ action, branches, busy, onClose, onSave, onRevoke }: {
  action: AccessAction; branches: Branch[]; busy: boolean; onClose: () => void;
  onSave: (input: { accountId: string; grantId?: string; roleCode: string; branchId?: string }) => void;
  onRevoke: (input: { accountId: string; grantId: string }) => void;
}) {
  const initialGrant = action.account.roles.find((role) => role.id === action.grantId) ?? action.account.roles[0];
  const [grantId, setGrantId] = useState(initialGrant?.id ?? "");
  const [roleCode, setRoleCode] = useState<AccessRoleCode>((initialGrant?.roleCode as AccessRoleCode | undefined) ?? "viewer");
  const [branchId, setBranchId] = useState(initialGrant?.branchId ?? "");
  const editGrant = action.account.roles.find((role) => role.id === grantId);
  const requiresBranch = roleCode === "branch_admin";
  function selectGrant(nextId: string) {
    const next = action.account.roles.find((role) => role.id === nextId);
    setGrantId(nextId);
    if (next) { setRoleCode(next.roleCode as AccessRoleCode); setBranchId(next.branchId ?? ""); }
  }
  return <section className={"access-action-panel grid gap-4 mt-4 p-4 border-t border-solid border-t-line bg-[#f8f8f4] [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_h3]:m-[0_0_0.25rem] [&_p]:m-0 [&_p]:text-muted [&_p]:text-[0.82rem] [&_p]:leading-normal max-[520px]:[&_>_header]:items-start max-[520px]:[&_>_header]:flex-col"} aria-label={`${action.mode === "edit" ? "Alterar" : "Adicionar"} função de ${action.account.fullName}`}>
    <header><div><h3>{action.mode === "edit" ? "Alterar função ou escopo" : "Adicionar função"}</h3><p><strong>{action.account.fullName}</strong> · A função define o que a pessoa pode fazer; o escopo define onde o acesso vale.</p></div><Button variant="secondary" size="sm" onClick={onClose}>Fechar</Button></header>
    <div className={"access-action-fields grid grid-cols-3 gap-[0.65rem] max-[800px]:grid-cols-[1fr]"}>
      {action.mode === "edit" && action.account.roles.length > 1 && <Field label="Função atribuída"><Select value={grantId} onChange={(event) => selectGrant(event.target.value)}>{action.account.roles.map((role) => <option key={role.id} value={role.id}>{roleLabels[role.roleCode] ?? role.roleCode} · {scopeLabel(role.branchId, branches)}</option>)}</Select></Field>}
      <Field label={action.mode === "edit" ? "Nova função" : "Função"}><Select value={roleCode} onChange={(event) => { const next = event.target.value as AccessRoleCode; setRoleCode(next); if (next === "company_admin") setBranchId(""); }}>{roleCodes.map((code) => <option key={code} value={code}>{roleLabels[code]}</option>)}</Select></Field>
      <Field label="Escopo de acesso"><Select value={branchId} disabled={roleCode === "company_admin"} onChange={(event) => setBranchId(event.target.value)}><option value="">Empresa inteira — todas as filiais</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>Somente filial: {branch.name}</option>)}</Select></Field>
    </div>
    <div className={"access-action-buttons flex justify-end gap-2"}>
      {action.mode === "edit" && editGrant && <Button variant="danger" size="sm" loading={busy} onClick={() => onRevoke({ accountId: action.account.id, grantId: editGrant.id })}>Revogar função</Button>}
      <Button size="sm" loading={busy} disabled={requiresBranch && !branchId} onClick={() => onSave({ accountId: action.account.id, ...(action.mode === "edit" ? { grantId } : {}), roleCode, ...(branchId ? { branchId } : {}) })}>{action.mode === "edit" ? "Salvar alterações" : "Adicionar função"}</Button>
    </div>
  </section>;
}
