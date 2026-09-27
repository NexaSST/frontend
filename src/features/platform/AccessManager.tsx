import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson, apiPage } from "../../lib/api.js";
import { Button, DropdownItem, DropdownMenu, Input, Select, SectionTitle } from "../../components/ui/index.js";
import { DataTable, Field, ListToolbar, PagedFooter, QueryState, StatusBadge } from "../shared.js";
import type { Branch, Account, AccessAction } from "./types.js";
import { roleLabels, roleCodes, scopeLabel } from "./accessRoles.js";
import { RoleActionPanel } from "./RoleActionPanel.js";
export function AccessManager({
  companyId,
  branches,
}: {
  companyId: string;
  branches: Branch[];
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [token, setToken] = useState<string>();
  const [accessAction, setAccessAction] = useState<AccessAction>();
  const accounts = useQuery({
    queryKey: ["company-accounts", companyId, page, q],
    queryFn: () =>
      apiPage<Account>(`v1/companies/${companyId}/accounts`, {
        searchParams: { page, pageSize: 25, ...(q ? { search: q } : {}) },
      }),
  });
  const schema = z.object({
    fullName: z.string().trim().min(2),
    email: z.string().email(),
    roleCode: z.enum(roleCodes),
    branchId: z.string().optional(),
  }).superRefine((value, context) => {
    if (value.roleCode === "branch_admin" && !value.branchId) context.addIssue({ code: "custom", path: ["branchId"], message: "Selecione a filial do administrador." });
    if (value.roleCode === "company_admin" && value.branchId) context.addIssue({ code: "custom", path: ["branchId"], message: "Administrador da empresa usa escopo corporativo." });
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      roleCode: "viewer",
      branchId: "",
    },
  });
  const invite = useMutation({
    mutationFn: (v: z.infer<typeof schema>) =>
      apiJson<{ token: string }>(`v1/companies/${companyId}/invitations`, {
        method: "post",
        json: {
          fullName: v.fullName,
          email: v.email,
          roleCode: v.roleCode,
          ...(v.branchId ? { branchId: v.branchId } : {}),
        },
      }),
    onSuccess: async (result) => {
      setToken(result.token);
      form.reset();
      await qc.invalidateQueries({ queryKey: ["company-accounts"] });
      sileo.success({ title: "Convite criado" });
    },
    onError: () => sileo.error({ title: "Não foi possível criar o convite" }),
  });
  const addRole = useMutation({
    mutationFn: ({
      accountId,
      roleCode,
      branchId,
    }: {
      accountId: string;
      roleCode: string;
      branchId?: string;
    }) =>
      apiJson(`v1/companies/${companyId}/accounts/${accountId}/roles`, {
        method: "post",
        json: { roleCode, ...(branchId ? { branchId } : {}) },
      }),
    onSuccess: async () => { setAccessAction(undefined); await qc.invalidateQueries({ queryKey: ["company-accounts"] }); sileo.success({ title: "Função adicionada" }); },
    onError: () => sileo.error({ title: "Não foi possível adicionar a função" }),
  });
  const updateRole = useMutation({
    mutationFn: ({ accountId, grantId, roleCode, branchId }: { accountId: string; grantId: string; roleCode: string; branchId?: string }) =>
      apiJson(`v1/companies/${companyId}/accounts/${accountId}/roles/${grantId}`, { method: "patch", json: { roleCode, ...(branchId ? { branchId } : {}) } }),
    onSuccess: async () => { setAccessAction(undefined); await qc.invalidateQueries({ queryKey: ["company-accounts"] }); sileo.success({ title: "Função e escopo atualizados" }); },
    onError: () => sileo.error({ title: "Não foi possível alterar a função" }),
  });
  const revokeRole = useMutation({
    mutationFn: ({
      accountId,
      grantId,
    }: {
      accountId: string;
      grantId: string;
    }) =>
      apiJson(
        `v1/companies/${companyId}/accounts/${accountId}/roles/${grantId}`,
        { method: "delete" },
      ),
    onSuccess: async () => { setAccessAction(undefined); await qc.invalidateQueries({ queryKey: ["company-accounts"] }); sileo.success({ title: "Função revogada" }); },
    onError: () => sileo.error({ title: "Não foi possível revogar a função" }),
  });
  const reissue = useMutation({
    mutationFn: (accountId: string) =>
      apiJson<{ token: string }>(
        `v1/companies/${companyId}/accounts/${accountId}/invitation`,
        { method: "post" },
      ),
    onSuccess: (result) => setToken(result.token),
  });
  return (
    <section className="admin-section">
      <SectionTitle title="Convites e funções" description="A função define o que cada pessoa pode fazer. O escopo define se o acesso vale para a empresa inteira ou somente para uma filial." />
      {token && (
        <div className="token-callout">
          <div>
            <strong>Link de ativação exibido uma única vez</strong>
            <code>{`${window.location.origin}/activate?token=${encodeURIComponent(token)}`}</code>
          </div>
          <Button
            type="button"
            variant="ghost" size="sm"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/activate?token=${encodeURIComponent(token)}`)}
          >
            Copiar link
          </Button>
        </div>
      )}
      <div className="admin-grid">
        <form
          className="admin-form"
          onSubmit={form.handleSubmit((v) => invite.mutate(v))}
        >
          <h3>Novo convite</h3>
          <Field label="Nome">
            <Input {...form.register("fullName")} />
          </Field>
          <Field label="E-mail">
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Função">
            <Select {...form.register("roleCode", { onChange: (event) => { if (event.target.value === "company_admin") form.setValue("branchId", ""); } })}>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Escopo de acesso" error={form.formState.errors.branchId?.message}>
            <Select {...form.register("branchId")}>
              <option value="">Empresa inteira — todas as filiais</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  Somente filial: {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" loading={invite.isPending}>Enviar convite</Button>
        </form>
        <div className="admin-table">
          <ListToolbar
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
          />
          <QueryState loading={accounts.isLoading} error={accounts.isError}>
            <DataTable
              columns={["Conta", "Situação", "Funções"]}
              rows={(accounts.data?.rows ?? []).map((a) => [
                <span>
                  <strong>{a.fullName}</strong>
                  <small>{a.email}</small>
                </span>,
                <StatusBadge value={a.status} />,
                <div className="role-stack">
                  {a.roles.map((role) => (
                    <span key={role.id}>
                      {roleLabels[role.roleCode] ?? role.roleCode}
                      <small>{scopeLabel(role.branchId, branches)}</small>
                    </span>
                  ))}
                </div>,
              ])}
              keyOf={(i) => accounts.data!.rows[i]!.id}
              renderActions={(i) => {
                const account = accounts.data!.rows[i]!;
                return (
                  <DropdownMenu label="Ações">
                    <DropdownItem onClick={() => setAccessAction({ account, mode: "edit", grantId: account.roles[0]?.id })}>Alterar função ou escopo</DropdownItem>
                    <DropdownItem onClick={() => setAccessAction({ account, mode: "add" })}>Adicionar outra função</DropdownItem>
                    {account.status === "invited" && <DropdownItem onClick={() => reissue.mutate(account.id)}>Reemitir convite</DropdownItem>}
                  </DropdownMenu>
                );
              }}
            />
            {accessAction && <RoleActionPanel key={`${accessAction.account.id}:${accessAction.mode}:${accessAction.grantId ?? "new"}`} action={accessAction} branches={branches} busy={addRole.isPending || updateRole.isPending || revokeRole.isPending} onClose={() => setAccessAction(undefined)} onSave={(input) => input.grantId ? updateRole.mutate({ ...input, grantId: input.grantId }) : addRole.mutate(input)} onRevoke={(input) => revokeRole.mutate(input)} />}
            <PagedFooter data={accounts.data} onPage={setPage} />
          </QueryState>
        </div>
      </div>
    </section>
  );
}
