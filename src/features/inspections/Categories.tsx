import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, Input } from "../../components/ui/index.js";
import { ArchiveButton, DataTable, FormModal, Field, ListToolbar, PagedFooter, QueryState, usePagedRows } from "../shared.js";
import type { Props, Category } from "./types.js";
import { base } from "./api.js";
export function Categories({ scope, search, setSearch }: Omit<Props, "tab">) {
  const queryClient = useQueryClient();
  const endpoint = `${base(scope)}/asset-categories`;
  const query = usePagedRows<Category>("asset-categories", endpoint, search);
  const selected = query.data?.rows.find((row) => row.id === search.id);
  const schema = z.object({
    name: z.string().trim().min(2, "Informe ao menos 2 caracteres."),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });
  useEffect(() => form.reset({ name: selected?.name ?? "" }), [selected, form]);
  const save = useMutation({
    mutationFn: (input: z.infer<typeof schema>) =>
      selected
        ? apiJson<Category>(`${endpoint}/${selected.id}`, {
            method: "patch",
            json: { ...input, expectedRowVersion: selected.rowVersion },
          })
        : apiJson<Category>(endpoint, { method: "post", json: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
      setSearch({ action: undefined, id: undefined });
      sileo.success({
        title: selected ? "Categoria atualizada" : "Categoria criada",
      });
    },
    onError: () =>
      sileo.error({ title: "Não foi possível salvar a categoria" }),
  });
  const archive = useMutation({
    mutationFn: (row: Category) =>
      apiJson(`${endpoint}/${row.id}/archive`, {
        method: "post",
        json: { expectedRowVersion: row.rowVersion },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["asset-categories"] }),
  });
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr]"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new", id: undefined })}
          createLabel="Nova categoria"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Categoria", "Versão"]}
            rows={(query.data?.rows ?? []).map((row) => [
              <strong>{row.name}</strong>,
              row.rowVersion,
            ])}
            keyOf={(index) => query.data!.rows[index]!.id}
            renderActions={(index) => {
              const row = query.data!.rows[index]!;
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
      {(search.action === "new" || selected) && (
        <FormModal
          title={selected ? "Editar categoria" : "Nova categoria"}
          description="Categorias agrupam tipos de ativos em toda a empresa."
          onClose={() => setSearch({ action: undefined, id: undefined })}
        >
          <form
            className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"}
            onSubmit={form.handleSubmit((value) => save.mutate(value))}
          >
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar categoria"}
            </Button>
          </form>
        </FormModal>
      )}
    </div>
  );
}
