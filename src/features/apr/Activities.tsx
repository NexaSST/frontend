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
    <div className="resource-layout">
      <section className="resource-main">
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
            className="form-stack"
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

