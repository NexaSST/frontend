import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, ConfirmDialog, Input, Select } from "../../components/ui/index.js";
import { DataTable, Field, FormModal, ListToolbar, PagedFooter, QueryState, useAllRows, usePagedRows } from "../shared.js";
import type { Props, Person, Named } from "./types.js";
import { root } from "./api.js";
export function People({ scope, search, setSearch }: Omit<Props, "tab">) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Person | null>(null);
  const [archiving, setArchiving] = useState<Person | null>(null);
  const endpoint = `${root(scope)}/people`;
  const query = usePagedRows<Person>("people", endpoint, search);
  const jobs = useAllRows<Named>(
    "job-options",
    `${root(scope)}/job-functions`,
  );
  const departments = useAllRows<Named>(
    "department-options",
    `${root(scope)}/departments`,
  );
  const suppliers = useAllRows<Named>(
    "supplier-options",
    `${root(scope)}/suppliers`,
  );
  const schema = z.object({
    fullName: z.string().trim().min(2),
    externalCode: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal("")),
    startsOn: z.string().min(1),
    employmentType: z.enum(["own", "outsourced"]),
    jobFunctionId: z.string().min(1),
    departmentId: z.string().min(1),
    supplierId: z.string().optional(),
    sectorId: z.string().optional(),
  }).superRefine((value, context) => { if (value.employmentType === "outsourced" && !value.supplierId) context.addIssue({ code: "custom", path: ["supplierId"], message: "Selecione a empresa prestadora" }); });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      externalCode: "",
      contactEmail: "",
      startsOn: new Date().toISOString().slice(0, 10),
      employmentType: "own",
      jobFunctionId: "",
      departmentId: "",
      supplierId: "",
      sectorId: "",
    },
  });
  const departmentId = form.watch("departmentId");
  const employmentType = form.watch("employmentType");
  const sectors = useAllRows<Named>("sector-options", `${root(scope)}/departments/${departmentId || "0"}/sectors`, Boolean(departmentId));
  const save = useMutation({
    mutationFn: async (v: z.infer<typeof schema>) => {
      const personPayload = { fullName: v.fullName, ...(v.externalCode ? { externalCode: v.externalCode } : {}), ...(v.contactEmail ? { contactEmail: v.contactEmail } : {}) };
      const assignmentPayload = { employmentType: v.employmentType, jobFunctionId: v.jobFunctionId, departmentId: v.departmentId,
        ...(v.supplierId ? { supplierId: v.supplierId } : {}), ...(v.sectorId ? { sectorId: v.sectorId } : {}) };
      if (editing) {
        await apiJson(`${endpoint}/${editing.id}`, { method: 'patch', json: personPayload });
        return apiJson(`${endpoint}/${editing.id}/current-assignment`, { method: 'patch', json: assignmentPayload });
      }
      return apiJson(endpoint, {
        method: "post",
        json: {
          ...personPayload,
          startsOn: v.startsOn,
          ...assignmentPayload,
        },
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["people"] });
      setEditing(null);
      setSearch({ action: undefined });
      form.reset();
      sileo.success({ title: editing ? "Colaborador atualizado" : "Colaborador cadastrado" });
    },
    onError: () =>
      sileo.error({ title: "Não foi possível cadastrar o colaborador" }),
  });
  const archive = useMutation({ mutationFn: (id: string) => apiJson(`${endpoint}/${id}`, { method: 'delete' }), onSuccess: async () => {
    await qc.invalidateQueries({ queryKey: ['people'] }); setArchiving(null); sileo.success({ title: 'Colaborador arquivado' }); },
    onError: (error: Error) => sileo.error({ title: 'Arquivamento bloqueado', description: error.message }) });
  const beginEdit = (person: Person) => { setEditing(person); form.reset({ fullName: person.fullName, externalCode: person.externalCode ?? '', contactEmail: person.contactEmail ?? '', startsOn: person.startsOn ?? new Date().toISOString().slice(0, 10),
    employmentType: person.employmentType ?? 'own', jobFunctionId: person.jobFunctionId ?? '', departmentId: person.departmentId ?? '', supplierId: person.supplierId ?? '', sectorId: person.sectorId ?? '' }); setSearch({ action: 'edit', id: person.id }); };
  return (
    <div className="resource-layout">
      <section className="resource-main">
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new" })}
          createLabel="Novo colaborador"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Colaborador", "Matrícula", "Cargo", "Departamento", "Vínculo"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.fullName}</strong>,
              r.externalCode ?? "—",
              r.jobName ?? "—",
              <span>{r.departmentName ?? "—"}{r.sectorName ? <small className="cell-detail">{r.sectorName}</small> : null}</span>,
              r.employmentType === "outsourced" ? `Terceirizado · ${r.supplierName ?? "—"}` : "Próprio",
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => <span className="row-inline-actions"><Button variant="ghost" size="sm" onClick={() => beginEdit(query.data!.rows[i]!)}>Editar</Button><Button variant="ghost" size="sm" className="danger" onClick={() => setArchiving(query.data!.rows[i]!)}>Arquivar</Button></span>}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {(search.action === "new" || search.action === "edit") && (
        <FormModal
          title={editing ? "Editar colaborador" : "Novo colaborador"}
          description="Cadastre a pessoa e seu primeiro vínculo nesta filial."
          onClose={() => { setEditing(null); setSearch({ action: undefined }); }}
        >
          <form
            className="form-stack"
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
          >
            <Field label="Nome completo">
              <Input {...form.register("fullName")} />
            </Field>
            <Field label="Matrícula (opcional)"><Input {...form.register("externalCode")} /></Field>
            <Field label="E-mail de contato (opcional)"><Input type="email" {...form.register("contactEmail")} /></Field>
            {!editing && <Field label="Início do vínculo">
              <Input type="date" {...form.register("startsOn")} />
            </Field>}
            <Field label="Tipo de vínculo">
              <Select {...form.register("employmentType")}><option value="own">Próprio</option><option value="outsourced">Terceirizado</option></Select>
            </Field>
            <Field label="Cargo">
              <Select {...form.register("jobFunctionId")}>
                <option value="">Selecione</option>
                {jobs.data?.rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Departamento">
              <Select {...form.register("departmentId")}>
                <option value="">Selecione</option>
                {departments.data?.rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            {employmentType === "outsourced" && <Field label="Empresa prestadora">
              <Select {...form.register("supplierId")}>
                <option value="">Selecione</option>
                {suppliers.data?.rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>}
            <Field label="Setor">
              <Select {...form.register("sectorId")} disabled={!departmentId}><option value="">Sem setor específico</option>{sectors.data?.rows.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}</Select>
            </Field>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : editing ? "Salvar alterações" : "Salvar colaborador"}
            </Button>
          </form>
        </FormModal>
      )}
      <ConfirmDialog open={Boolean(archiving)} title={`Arquivar ${archiving?.fullName ?? 'colaborador'}?`} description="O arquivamento só será permitido depois que o vínculo ativo for encerrado. Nenhum histórico será apagado." busy={archive.isPending} onCancel={() => setArchiving(null)} onConfirm={() => archiving && archive.mutate(archiving.id)} />
    </div>
  );
}
