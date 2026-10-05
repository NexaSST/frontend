import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, Checkbox, CheckboxField, Input, Select } from "../../components/ui/index.js";
import { ArchiveButton, DataTable, FormModal, Field, ListToolbar, PagedFooter, QueryState, useAllRows, usePagedRows } from "../shared.js";
import type { Props, AssetType, Category, Template } from "./types.js";
import { base } from "./api.js";
import { ChecklistCreateModal, type CreatedChecklist } from "./ChecklistCreateModal.js";

const inspectionIntervals = [
  { label: "Diária", days: 1 },
  { label: "Semanal", days: 7 },
  { label: "Mensal", days: 30 },
  { label: "Bimestral", days: 60 },
  { label: "Trimestral", days: 90 },
  { label: "Semestral", days: 180 },
  { label: "Anual", days: 365 },
] as const;

export function Types({ scope, search, setSearch }: Omit<Props, "tab">) {
  const queryClient = useQueryClient();
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [createdChecklist, setCreatedChecklist] = useState<CreatedChecklist | null>(null);
  const endpoint = `${base(scope)}/asset-types`;
  const query = usePagedRows<AssetType>("asset-types", endpoint, search);
  const categories = useAllRows<Category>(
    "asset-category-options",
    `${base(scope)}/asset-categories`,
  );
  const templates = useAllRows<Template>(
    "inspection-template-options",
    `${base(scope)}/inspection-templates`,
  );
  const selected = query.data?.rows.find((row) => row.id === search.id);
  const schema = z.object({
    name: z.string().trim().min(2),
    categoryId: z.string().optional(),
    inspectionIntervalDays: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .or(z.literal("")),
    hasExpirationDate: z.boolean(),
    defaultTemplateId: z.string().optional(),
  });
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      categoryId: "",
      inspectionIntervalDays: "",
      hasExpirationDate: false,
      defaultTemplateId: "",
    },
  });
  useEffect(
    () =>
      form.reset({
        name: selected?.name ?? "",
        categoryId: selected?.categoryId ?? "",
        inspectionIntervalDays: selected?.inspectionIntervalDays?.toString() ?? "",
        hasExpirationDate: selected?.hasExpirationDate ?? false,
        defaultTemplateId: selected?.defaultTemplateId ?? "",
      }),
    [selected, form, search.action, scope.branchId, scope.companyId],
  );
  useEffect(() => setCreatedChecklist(null), [scope.branchId, scope.companyId]);
  const save = useMutation({
    mutationFn: (input: any) => {
      const payload = {
        name: input.name,
        ...(selected || input.categoryId
          ? { categoryId: input.categoryId || null }
          : {}),
        ...(selected || input.inspectionIntervalDays
          ? { inspectionIntervalDays: input.inspectionIntervalDays || null }
          : {}),
        hasExpirationDate: input.hasExpirationDate,
        ...(selected || input.defaultTemplateId
          ? { defaultTemplateId: input.defaultTemplateId || null }
          : {}),
        ...(selected ? { expectedRowVersion: selected.rowVersion } : {}),
      };
      return apiJson(selected ? `${endpoint}/${selected.id}` : endpoint, {
        method: selected ? "patch" : "post",
        json: payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["asset-types"] });
      setSearch({ id: undefined, action: undefined });
      sileo.success({ title: selected ? "Equipamento atualizado" : "Equipamento criado" });
    },
    onError: () => sileo.error({ title: "Não foi possível salvar o tipo" }),
  });
  const archive = useMutation({
    mutationFn: (row: AssetType) =>
      apiJson(`${endpoint}/${row.id}/archive`, {
        method: "post",
        json: { expectedRowVersion: row.rowVersion },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["asset-types"] }),
  });
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr]"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new", id: undefined })}
          createLabel="Novo equipamento"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Equipamento", "Categoria", "Periodicidade", "Validade"]}
            rows={(query.data?.rows ?? []).map((row) => [
              <strong>{row.name}</strong>,
              categories.data?.rows.find((c) => c.id === row.categoryId)
                ?.name ?? "—",
              row.inspectionIntervalDays
                ? `${row.inspectionIntervalDays} dias`
                : "Sem ciclo",
              row.hasExpirationDate ? "Controlada" : "Não",
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => {
              const row = query.data!.rows[i]!;
              return (
                <>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setSearch({ id: row.id, action: undefined })}
                  >
                    Editar
                  </Button>
                  <ArchiveButton
                    onConfirm={() => archive.mutate(row)}
                    busy={archive.isPending}
                  />
                </>
              );
            }}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {(search.action === "new" || selected) && !creatingChecklist && (
        <FormModal
          title={selected ? "Editar equipamento" : "Novo equipamento"}
          description="Defina categoria, periodicidade e checklist padrão."
          onClose={() => setSearch({ action: undefined, id: undefined })}
        >
          <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={form.handleSubmit((v) => save.mutate(v))}>
            <Field label="Nome">
              <Input {...form.register("name")} />
            </Field>
            <Field label="Categoria">
              <Select {...form.register("categoryId")}>
                <option value="">Sem categoria</option>
                {categories.data?.rows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Frequência de inspeção">
              <Select {...form.register("inspectionIntervalDays")}>
                <option value="">Sem ciclo</option>
                {inspectionIntervals.map(({ label, days }) => (
                  <option key={days} value={days}>{label} ({days} dias)</option>
                ))}
                {selected?.inspectionIntervalDays &&
                  !inspectionIntervals.some(({ days }) => days === selected.inspectionIntervalDays) && (
                    <option value={selected.inspectionIntervalDays}>
                      Personalizado ({selected.inspectionIntervalDays} dias)
                    </option>
                  )}
              </Select>
            </Field>
            <div className={"inspection-template-picker grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[0.65rem] [&_.ui-button]:whitespace-nowrap max-[560px]:grid-cols-[1fr]"}>
              <Field label="Checklist padrão">
                <Select {...form.register("defaultTemplateId")}>
                  <option value="">Sem checklist</option>
                  {templates.data?.rows.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  {createdChecklist && !templates.data?.rows.some((t) => t.id === createdChecklist.id) &&
                    <option value={createdChecklist.id}>{createdChecklist.name}</option>}
                </Select>
              </Field>
              <Button type="button" variant="secondary" onClick={() => setCreatingChecklist(true)}>Criar checklist</Button>
            </div>
            <CheckboxField label="Controlar data de validade"><Checkbox {...form.register("hasExpirationDate")} /></CheckboxField>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar tipo"}
            </Button>
          </form>
        </FormModal>
      )}
      {creatingChecklist && <ChecklistCreateModal scope={scope} onClose={() => setCreatingChecklist(false)}
        onCreated={(template) => {
          setCreatedChecklist(template);
          form.setValue("defaultTemplateId", template.id, { shouldDirty: true });
        }} />}
    </div>
  );
}
