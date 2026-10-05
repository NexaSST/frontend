import { Button } from "../../components/ui/index.js";
import { DataTable, EditorPanel, ListToolbar, PagedFooter, QueryState, StatusBadge } from "../shared.js";
import { AprWizard } from "./AprWizard.js";
import type { Props } from "./types.js";
import { useDocuments } from "./useDocuments.js";

export function Documents({ scope, search, setSearch, permissions }: Omit<Props, "tab" | "area">) {
  const data = useDocuments({ scope, search, setSearch, permissions });
  const { query, selected, detail, latestRevisionId, revision, downloadPdf, editing } = data;
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr]"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new", id: undefined })}
          createLabel="Nova APR"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Referência", "Título", "Situação"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.referenceCode}</strong>,
              r.title,
              <StatusBadge value={r.status} />,
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => (
              <Button
                type="button"
                variant="ghost" size="sm"
                onClick={() =>
                  setSearch({ id: query.data!.rows[i]!.id, action: undefined })
                }
              >
                {query.data!.rows[i]!.status === "draft"
                  ? "Editar"
                  : "Visualizar"}
              </Button>
            )}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {editing && <AprWizard data={data} canFinalize={permissions.includes("apr.finalize")} onClose={() => setSearch({ action: undefined, id: undefined })} />}
      {selected && detail.data?.status !== "draft" && (
        <EditorPanel
          title={detail.data?.title ?? "APR finalizada"}
          description="Documento finalizado e preservado por revisão."
          onClose={() => setSearch({ id: undefined })}
        >
          <dl className={"detail-list grid gap-[0.8rem] m-0 [&_div]:pb-[0.8rem] [&_div]:border-b [&_div]:border-solid [&_div]:border-b-line [&_dt]:text-muted [&_dt]:text-[0.75rem] [&_dt]:font-[750] [&_dd]:m-[0.3rem_0_0]"}>
            <div>
              <dt>Referência</dt>
              <dd>{detail.data?.referenceCode}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <StatusBadge value={detail.data?.status ?? "finalized"} />
              </dd>
            </div>
            <div>
              <dt>Revisões</dt>
              <dd>{detail.data?.revisions.length ?? 0}</dd>
            </div>
            {revision.data?.snapshot.activityName && <div><dt>Atividade</dt><dd>{revision.data.snapshot.activityName}</dd></div>}
            {revision.data?.snapshot.location && <div><dt>Local</dt><dd>{revision.data.snapshot.location}</dd></div>}
            {revision.data?.snapshot.executionOn && <div><dt>Data</dt><dd>{revision.data.snapshot.executionOn.slice(0, 10)}</dd></div>}
            {revision.data?.snapshot.analystName && <div><dt>Responsável</dt><dd>{revision.data.snapshot.analystName}</dd></div>}
          </dl>
          {latestRevisionId && <Button type="button" variant="secondary" disabled={downloadPdf.isPending}
            onClick={() => downloadPdf.mutate()}>{downloadPdf.isPending ? "Preparando PDF…" : "Abrir PDF da APR"}</Button>}
          {revision.data?.snapshot.answers?.length ? <section className={"grid gap-[.6rem] mt-4 [&_>_div]:grid [&_>_div]:gap-[.25rem] [&_>_div]:p-[.65rem_0] [&_>_div]:border-b [&_>_div]:border-solid [&_>_div]:border-b-line [&_p]:m-0 [&_p]:text-[.82rem] [&_p]:leading-[1.4] [&_small]:text-muted [&_small]:leading-[1.4]"}>
            <strong>Checklist registrado</strong>
            {revision.data.snapshot.answers.map((answer, index) => <div key={answer.code}>
              <p>{index + 1}. {answer.text}</p>
              <strong>{answer.answer === "yes" ? "Sim" : answer.answer === "no" ? "Não" : "N/A"}</strong>
              {answer.observation && <small>{answer.observation}</small>}
            </div>)}
          </section> : null}
        </EditorPanel>
      )}
    </div>
  );
}
