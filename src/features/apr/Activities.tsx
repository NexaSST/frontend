import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { Button, Input } from "../../components/ui/index.js";
import { DataTable, FormModal, Field, ListToolbar, PagedFooter, QueryState, usePagedRows } from "../shared.js";
import type { Props, Named } from "./types.js";
import { root } from "./api.js";
export function Activities({ scope, search, setSearch }: Omit<Props, "tab">) {
  const qc = useQueryClient();
  const endpoint = `${root(scope)}/apr-activities`;
  const query = usePagedRows<Named>("apr-activities", endpoint, search);
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
  const save = useMutation({
    mutationFn: (v: { name: string }) =>
      apiJson(endpoint, { method: "post", json: v }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apr-activities"] });
      setSearch({ action: undefined });
      form.reset();
      sileo.success({ title: "Atividade criada" });
    },
    onError: () => sileo.error({ title: "Não foi possível criar a atividade" }),
  });
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr]"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new" })}
          createLabel="Nova atividade"
          hideEmptyFilters
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Atividade"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.name}</strong>,
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {search.action === "new" && (
        <FormModal
          title="Nova atividade"
          description="Atividades podem ser associadas aos documentos APR."
          onClose={() => setSearch({ action: undefined })}
        >
          <form
            className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"}
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
          >
            <Field label="Nome">
              <Input {...form.register("name", { required: true })} />
            </Field>
            <Button type="submit" disabled={save.isPending}>
              Salvar atividade
            </Button>
          </form>
        </FormModal>
      )}
    </div>
  );
}

