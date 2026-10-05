import { frequencyLabel } from './config.js';
import type { Frequency } from './types.js';
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, ConfirmDialog, Input, Select, Textarea } from "../../components/ui/index.js";
import { DataTable, Field, FormModal, ListToolbar, PagedFooter, QueryState, useAllRows, usePagedRows } from "../shared.js";
import type { Props, Course } from "./types.js";
import { root } from "./api.js";
import { trainingTypes } from "./config.js";
export function Courses({ scope, search, setSearch }: Omit<Props, "tab">) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Course | null>(null);
  const [archiving, setArchiving] = useState<Course | null>(null);
  const endpoint = `${root(scope)}/training-courses`;
  const query = usePagedRows<Course>("training-courses", endpoint, search);
  const frequencies = useAllRows<Frequency>("frequency-options", `${root(scope)}/training-frequencies`);
  const schema = z.object({
    name: z.string().trim().min(2),
    description: z.string().optional(),
    workloadHours: z.coerce.number().positive().optional().or(z.literal("")),
    type: z.string().min(1),
    frequencyId: z.string().min(1),
  });
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      workloadHours: "",
      type: "",
      frequencyId: "",
    },
  });
  const save = useMutation({
    mutationFn: (v: any) =>
      apiJson(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "patch" : "post",
        json: {
          name: v.name,
          ...(v.description ? { description: v.description } : {}),
          ...(v.workloadHours ? { workloadHours: v.workloadHours } : {}),
          type: v.type, frequencyId: v.frequencyId,
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["training-courses"] });
      setEditing(null);
      setSearch({ action: undefined });
      form.reset();
      sileo.success({ title: editing ? "Curso atualizado" : "Curso criado" });
    },
    onError: () => sileo.error({ title: "Não foi possível criar o curso" }),
  });
  const archive = useMutation({ mutationFn: (id: string) => apiJson(`${endpoint}/${id}`, { method: "delete" }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["training-courses"] }); setArchiving(null); sileo.success({ title: "Curso arquivado" }); },
    onError: (error: Error) => sileo.error({ title: "Não foi possível arquivar", description: error.message }) });
  const beginEdit = (course: Course) => { setEditing(course); form.reset({ name: course.name, description: course.description ?? "", workloadHours: course.workloadHours ?? "", type: course.type ?? "", frequencyId: course.frequencyId }); setSearch({ action: "edit", id: course.id }); };
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr] [&_.table-scroll]:relative [&_.workflow-stepper_small]:max-w-full [&_.workflow-stepper_small]:whitespace-normal [&_.workflow-stepper_small]:text-center [&_.workflow-stepper_small]:wrap-anywhere [&_.form-stack_input[type='checkbox']]:flex-[0_0_1.15rem] [&_.form-stack_input[type='checkbox']]:w-[1.15rem] [&_.form-stack_input[type='checkbox']]:h-[1.15rem] [&_.form-stack_input[type='checkbox']]:min-h-0 [&_.form-stack_input[type='checkbox']]:p-0 [&_.form-stack_input[type='checkbox']]:m-0 [&_.form-stack_input[type='checkbox']]:accent-accent [&_.training-checkbox]:flex [&_.training-checkbox]:items-center [&_.training-checkbox]:gap-[.65rem] [&_.training-checkbox]:min-h-11 [&_.training-checkbox]:cursor-pointer"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => { setEditing(null); form.reset(); setSearch({ action: "new", id: undefined }); }}
          createLabel="Novo curso"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["ID", "Curso", "Tipo", "Carga", "Frequência"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.code}</strong>,
              r.name,
              trainingTypes[r.type ?? ""] ?? "Não informado",
              r.workloadHours ? `${r.workloadHours} h` : "—",
              frequencies.data?.rows.find((f) => f.id === r.frequencyId) ? frequencyLabel(frequencies.data.rows.find((f) => f.id === r.frequencyId)!) : r.validityDays ? `${r.validityDays} dias` : "Sem frequência",
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => <span className={"row-inline-actions inline-flex gap-1"}><Button variant="ghost" size="sm" onClick={() => beginEdit(query.data!.rows[i]!)}>Editar</Button><Button variant="ghost" size="sm" className={"danger"} onClick={() => setArchiving(query.data!.rows[i]!)}>Arquivar</Button></span>}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {(search.action === "new" || search.action === "edit") && (
        <FormModal
          title={editing ? "Editar curso" : "Novo curso"}
          description="Defina o curso usado em turmas, matrizes e comprovações."
          onClose={() => { setEditing(null); setSearch({ action: undefined }); }}
        >
          <form
            className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"}
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
          >
            <Field label="Nome">
              <Input {...form.register("name")} />
            </Field>
            <Field label="Descrição">
              <Textarea {...form.register("description")} />
            </Field>
            <Field label="Carga horária">
              <Input
                type="number"
                step="0.5"
                {...form.register("workloadHours")}
              />
            </Field>
            <Field label="Tipo"><Select aria-label="Tipo do curso" required {...form.register("type")}><option value="">Selecione o tipo</option>{Object.entries(trainingTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
            <Field label="Frequência"><Select aria-label="Frequência do curso" required disabled={frequencies.isLoading || frequencies.isError} {...form.register("frequencyId")}><option value="">Selecione a frequência</option>{frequencies.data?.rows.map((frequency) => <option key={frequency.id} value={frequency.id}>{frequencyLabel(frequency)}</option>)}</Select></Field>
            {frequencies.isError && <p role="alert">Não foi possível carregar as frequências. Atualize a página para tentar novamente.</p>}
            <Button type="submit" disabled={save.isPending}>
              {editing ? "Salvar alterações" : "Salvar curso"}
            </Button>
          </form>
        </FormModal>
      )}
      <ConfirmDialog open={Boolean(archiving)} title={`Arquivar ${archiving?.name ?? "curso"}?`} description="O curso sairá das seleções. Se estiver em uma matriz publicada, a operação será bloqueada." busy={archive.isPending} onCancel={() => setArchiving(null)} onConfirm={() => archiving && archive.mutate(archiving.id)} />
    </div>
  );
}
