import { DataTable, ListToolbar, PagedFooter, QueryState, usePagedRows } from "../shared.js";
import type { Props, Template } from "./types.js";
import { base } from "./api.js";
import { ChecklistCreateModal } from "./ChecklistCreateModal.js";

export function Templates({ scope, search, setSearch }: Omit<Props, "tab">) {
  const query = usePagedRows<Template>("inspection-templates", `${base(scope)}/inspection-templates`, search);
  return <div className="resource-layout">
    <section className="resource-main">
      <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })}
        onCreate={() => setSearch({ action: "new" })} createLabel="Novo checklist" />
      <QueryState loading={query.isLoading} error={query.isError}>
        <DataTable columns={["Checklist", "Versão", "Publicado em"]}
          rows={(query.data?.rows ?? []).map((row) => [
            <strong>{row.name}</strong>, `v${row.versionNo}`, new Date(row.publishedAt).toLocaleDateString("pt-BR"),
          ])} keyOf={(index) => query.data!.rows[index]!.id} />
        <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} />
      </QueryState>
    </section>
    {search.action === "new" && <ChecklistCreateModal scope={scope} onClose={() => setSearch({ action: undefined })} />}
  </div>;
}
