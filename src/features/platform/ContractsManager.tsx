import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson, apiPage } from "../../lib/api.js";
import { Button, DropdownItem, DropdownMenu, Input, Select, SectionTitle, Textarea } from "../../components/ui/index.js";
import { DataTable, Field, ListToolbar, PagedFooter, QueryState, StatusBadge } from "../shared.js";
import { commercialCatalogQuery } from "./CommercialCatalog.js";
import type { Branch, Entitlement } from "./types.js";
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export function ContractsManager({
  companyId,
  branches,
}: {
  companyId: string;
  branches: Branch[];
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const modules = useQuery({
    ...commercialCatalogQuery,
  });
  const contracts = useQuery({
    queryKey: ["company-contracts", companyId, page],
    queryFn: () =>
      apiPage<Entitlement>(`v1/platform/companies/${companyId}/modules`, {
        searchParams: { page, pageSize: 25 },
      }),
  });
  const schema = z.object({
    moduleCode: z.string().min(1),
    pricingTierId: z.string().optional(),
    branchId: z.string().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    reason: z.string().trim().min(3),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      moduleCode: "",
      pricingTierId: "",
      branchId: "",
      startsAt: "",
      endsAt: "",
      reason: "Liberação comercial inicial",
    },
  });
  const create = useMutation({
    mutationFn: (v: z.infer<typeof schema>) =>
      apiJson(`v1/platform/companies/${companyId}/modules`, {
        method: "post",
        json: {
          moduleCode: v.moduleCode,
          ...(v.pricingTierId ? { pricingTierId: v.pricingTierId } : {}),
          reason: v.reason,
          ...(v.branchId ? { branchId: v.branchId } : {}),
          ...(v.startsAt
            ? { startsAt: new Date(v.startsAt).toISOString() }
            : {}),
          ...(v.endsAt ? { endsAt: new Date(v.endsAt).toISOString() } : {}),
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["company-contracts"] });
      form.reset();
      sileo.success({ title: "Contrato de módulo criado" });
    },
    onError: () => sileo.error({ title: "Não foi possível criar o contrato" }),
  });
  const change = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "suspended" | "expired";
    }) =>
      apiJson(`v1/platform/companies/${companyId}/modules/${id}`, {
        method: "patch",
        json: { status, reason: `Alteração administrativa para ${status}` },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-contracts"] }),
  });
  const selectedModule = modules.data?.modules.find((item) => item.code === form.watch("moduleCode"));
  const visibleContracts = (contracts.data?.rows ?? []).filter((contract) => {
    const moduleName = modules.data?.modules.find((module) => module.code === contract.moduleCode)?.name ?? contract.moduleCode;
    const branchName = contract.branchId ? branches.find((branch) => branch.id === contract.branchId)?.name ?? contract.branchId : "Empresa";
    const query = q.trim().toLocaleLowerCase("pt-BR");
    return (!status || contract.status === status) && (!query || `${moduleName} ${branchName}`.toLocaleLowerCase("pt-BR").includes(query));
  });
  return (
    <section className="admin-section">
      <SectionTitle title="Contratos de módulos" description="Liberações podem valer para a empresa inteira ou somente para uma filial." />
      <div className="admin-grid">
        <form
          className="admin-form"
          onSubmit={form.handleSubmit((v) => create.mutate(v))}
        >
          <h3>Novo contrato</h3>
          <Field label="Módulo">
            <Select {...form.register("moduleCode", { onChange: () => form.setValue("pricingTierId", "") })}>
              <option value="">Selecione</option>
              {modules.data?.modules.filter((module) => module.commercialStatus === "available").map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Plano e faixa de uso">
            <Select {...form.register("pricingTierId")} disabled={!selectedModule?.pricingTiers.length}>
              <option value="">{selectedModule?.pricingTiers.length ? "Selecione a faixa" : "Sem faixa comercial"}</option>
              {selectedModule?.pricingTiers.filter((tier) => tier.status === "active").map((tier) => <option key={tier.id} value={tier.id}>{tier.name} · {money(tier.monthlyPriceCents)} · {tier.includedDescription}</option>)}
            </Select>
          </Field>
          <Field label="Escopo">
            <Select {...form.register("branchId")}>
              <option value="">Empresa inteira</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="form-row">
            <Field label="Início">
              <Input type="datetime-local" {...form.register("startsAt")} />
            </Field>
            <Field label="Fim">
              <Input type="datetime-local" {...form.register("endsAt")} />
            </Field>
          </div>
          <Field label="Justificativa">
            <Textarea {...form.register("reason")} />
          </Field>
          <Button type="submit" loading={create.isPending}>Criar contrato</Button>
        </form>
        <div className="admin-table">
          <ListToolbar value={q} onChange={setQ}>
            <Select aria-label="Filtrar contratos por situação" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todas as situações</option>
              <option value="active">Ativos</option>
              <option value="suspended">Suspensos</option>
              <option value="expired">Encerrados</option>
            </Select>
          </ListToolbar>
          <QueryState loading={contracts.isLoading} error={contracts.isError}>
            <DataTable
              columns={["Módulo", "Escopo", "Período", "Situação"]}
              rows={visibleContracts.map((r) => [
                <span><strong>{modules.data?.modules.find((m) => m.code === r.moduleCode)?.name ?? r.moduleCode}</strong>{r.pricingTierId && <small>{modules.data?.modules.flatMap((module) => module.pricingTiers).find((tier) => tier.id === r.pricingTierId)?.name ?? "Plano contratado"}{r.contractedMonthlyPriceCents !== null ? ` · ${money(r.contractedMonthlyPriceCents)}/mês` : ""}</small>}</span>,
                r.branchId
                  ? (branches.find((b) => b.id === r.branchId)?.name ??
                    r.branchId)
                  : "Empresa",
                `${new Date(r.startsAt).toLocaleDateString("pt-BR")} — ${r.endsAt ? new Date(r.endsAt).toLocaleDateString("pt-BR") : "sem término"}`,
                <StatusBadge value={r.status} />,
              ])}
              keyOf={(i) => visibleContracts[i]!.id}
              renderActions={(i) => {
                const row = visibleContracts[i]!;
                return <DropdownMenu label="Ações"><DropdownItem onClick={() => change.mutate({ id: row.id, status: row.status === "active" ? "suspended" : "active" })}>{row.status === "active" ? "Suspender contrato" : "Reativar contrato"}</DropdownItem>{row.status !== "expired" && <DropdownItem className="danger" onClick={() => change.mutate({ id: row.id, status: "expired" })}>Encerrar contrato</DropdownItem>}</DropdownMenu>;
              }}
            />
            <PagedFooter data={contracts.data} onPage={setPage} />
          </QueryState>
        </div>
      </div>
    </section>
  );
}
