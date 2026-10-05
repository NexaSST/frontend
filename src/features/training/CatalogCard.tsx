import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, ConfirmDialog, Input } from "../../components/ui/index.js";
import { DataTable, Field, FormModal, ListToolbar, PagedFooter, QueryState, usePagedRows, type ModuleSearch, type Scope } from "../shared.js";
import type { Named } from "./types.js";
import { root } from "./api.js";
export function CatalogCard({
  scope,
  resource,
  title,
  detail,
  search,
  setSearch,
}: {
  scope: Scope;
  resource: string;
  title: string;
  detail?: "supervisor" | "tax" | "cbo";
  search: ModuleSearch;
  setSearch: (patch: Partial<ModuleSearch>) => void;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Named | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [archiving, setArchiving] = useState<Named | null>(null);
  const endpoint = `${root(scope)}/${resource}`;
  const query = usePagedRows<Named>(`catalog-${resource}`, endpoint, search);
  const schema = z.object({
    name: z.string().trim().min(2),
    extra: z.string().optional(),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", extra: "" },
  });
  const save = useMutation({
    mutationFn: (v: z.infer<typeof schema>) =>
      apiJson(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "patch" : "post",
        json: {
          name: v.name,
          ...(detail === "supervisor" && v.extra ? { supervisorName: v.extra } : {}),
          ...(detail === "tax" && v.extra ? { taxIdentifier: v.extra } : {}),
          ...(detail === "cbo" && v.extra ? { cbo: v.extra } : {}),
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [`catalog-${resource}`] });
      setEditing(null);
      setFormOpen(false);
      form.reset();
      sileo.success({ title: editing ? `${title} atualizado` : `${title} salvo` });
    },
    onError: () =>
      sileo.error({ title: `Não foi possível salvar ${title.toLowerCase()}` }),
  });
  const archive = useMutation({
    mutationFn: (id: string) => apiJson(`${endpoint}/${id}`, { method: "delete" }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: [`catalog-${resource}`] }); setArchiving(null); sileo.success({ title: "Registro arquivado" }); },
    onError: (error: Error) => sileo.error({ title: "Não foi possível arquivar", description: error.message }),
  });
  const beginEdit = (row: Named) => { setEditing(row); form.reset({ name: row.name, extra: detail === "cbo" ? row.cbo ?? "" : detail === "tax" ? row.taxIdentifier ?? "" : "" }); setFormOpen(true); };
  const maskCbo = (value: string) => { const digits = value.replace(/\D/g, "").slice(0, 6); return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits; };
  return (
    <section className={"catalog-card min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-[1.1rem] [&_header]:flex [&_header]:justify-between [&_header_span]:text-muted [&_header_span]:tabular-nums"}>
      <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })} onCreate={() => { setEditing(null); form.reset(); setFormOpen(true); }} createLabel={title === 'Cargos' ? 'Novo cargo' : 'Nova empresa prestadora'} />
      <QueryState loading={query.isLoading} error={query.isError}>
        <DataTable columns={detail === 'cbo' ? ['Cargo', 'CBO'] : ['Empresa prestadora', 'Documento']} rows={(query.data?.rows ?? []).map((row) => [<strong>{row.name}</strong>, detail === 'cbo' ? row.cbo ?? '—' : row.taxIdentifier ?? '—'])} keyOf={(index) => query.data!.rows[index]!.id} renderActions={(index) => <span className={"row-inline-actions inline-flex gap-1"}><Button variant="ghost" size="sm" onClick={() => beginEdit(query.data!.rows[index]!)}>Editar</Button><Button variant="ghost" size="sm" className={"danger"} onClick={() => setArchiving(query.data!.rows[index]!)}>Arquivar</Button></span>} />
        <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} />
      </QueryState>
      {formOpen && <FormModal title={editing ? `Editar ${title.toLowerCase().replace(/s$/, '')}` : title === 'Cargos' ? 'Novo cargo' : 'Nova empresa prestadora'} description={detail === 'cbo' ? 'Identifique o cargo e, se aplicável, informe o código CBO.' : 'Cadastre a organização responsável pelos vínculos terceirizados.'} onClose={() => { setEditing(null); setFormOpen(false); form.reset(); }}>
        <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={form.handleSubmit((v) => save.mutate(v))}>
          <Field label={detail === 'cbo' ? 'Nome do cargo' : 'Nome da empresa'}><Input required placeholder="Nome" {...form.register("name")} /></Field>
          {detail && <Field label={detail === 'cbo' ? 'CBO (opcional)' : 'Documento (opcional)'}><Input placeholder={detail === 'cbo' ? '0000-00' : 'CNPJ ou documento equivalente'} {...form.register("extra", detail === "cbo" ? { onChange: (event) => form.setValue("extra", maskCbo(event.target.value)) } : undefined)} /></Field>}
          <div className={"flex justify-end gap-[0.6rem] pt-1"}><Button type="button" variant="secondary" onClick={() => { setEditing(null); setFormOpen(false); form.reset(); }}>Cancelar</Button><Button type="submit" loading={save.isPending}>{editing ? 'Salvar alterações' : 'Salvar cadastro'}</Button></div>
        </form>
      </FormModal>}
      <ConfirmDialog open={Boolean(archiving)} title={`Arquivar ${archiving?.name ?? "registro"}?`} description="O registro deixará de aparecer nas seleções. Se houver vínculos ativos, o arquivamento será bloqueado e nada será alterado." busy={archive.isPending} onCancel={() => setArchiving(null)} onConfirm={() => archiving && archive.mutate(archiving.id)} />
    </section>
  );
}
