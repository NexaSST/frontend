import { useState } from "react";
import { Button } from "../../components/ui/index.js";
import { DataTable, ListToolbar, PagedFooter, QueryState, StatusBadge } from "../shared.js";
import type { Props } from "./types.js";
import { useWorkPermitEditor } from "./useWorkPermitEditor.js";
import { WorkPermitWizard } from "./WorkPermitWizard.js";
import { useMonthlyAprReport } from "./useMonthlyAprReport.js";
import { MonthlyAprReport } from "./MonthlyAprReport.js";
import { WorkPermitListHeader } from "./WorkPermitListHeader.js";
import { WorkPermitDetails } from "./WorkPermitDetails.js";

export function WorkPermits({
  scope,
  search,
  setSearch,
  permissions,
  reportsOnly,
  area,
}: Omit<Props, "tab"> & { reportsOnly: boolean }) {
  const report = useMonthlyAprReport({ scope, area });
  const [statusFilter, setStatusFilter] = useState("all");
  const editor = useWorkPermitEditor({
    scope,
    search,
    setSearch,
    statusFilter,
  });
  const { endpoint, query, detail, editing } = editor;
  const canCreate = permissions.includes("apr.manage");
  const emptyList = query.isSuccess && query.data.total === 0;
  const firstUse = emptyList && statusFilter === "all" && !search.q.trim();
  const createPermit = () => setSearch({ action: "new", id: undefined });
  if (reportsOnly)
    return (
      <div className={"pt-report-view w-full"}>
        <MonthlyAprReport model={report} area={area} />
        <p
          className={"pt-report-note p-[.8rem_.2rem] text-muted text-[.84rem]"}
        >
          A exportação usa os dados do mês selecionado e inclui somente{" "}
          {area === "apr" ? "revisões de APR" : "Permissões de Trabalho"}.
        </p>
      </div>
    );
  return (
    <div
      className={
        "resource-layout grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr] pt-resource-layout block w-full [&_.resource-main]:w-full"
      }
    >
      <section
        className={
          "resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"
        }
      >
        <WorkPermitListHeader total={query.data?.total ?? 0} />
        <div
          className={
            "pt-status-filter flex gap-[.35rem] mb-4 overflow-x-auto scrollbar-thin [&_button]:flex-[0_0_auto] [&_button]:p-[.5rem_.75rem] [&_button]:border [&_button]:border-solid [&_button]:border-transparent [&_button]:rounded-[.6rem] [&_button]:text-muted [&_button]:bg-transparent [&_button]:font-[inherit] [&_button]:text-[.78rem] [&_button]:font-[750] [&_button]:cursor-pointer [&_button:hover]:bg-accent-soft [&_button[aria-pressed='true']]:border-[#b9d3c7] [&_button[aria-pressed='true']]:text-accent-strong [&_button[aria-pressed='true']]:bg-accent-soft"
          }
          aria-label="Filtrar permissões por situação"
        >
          {(
            [
              ["all", "Todas"],
              ["draft", "Rascunhos"],
              ["authorized", "Autorizadas"],
              ["expired", "Vencidas"],
              ["closed", "Encerradas"],
              ["cancelled", "Canceladas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={statusFilter === value}
              onClick={() => {
                setStatusFilter(value);
                setSearch({ page: 1, id: undefined, action: undefined });
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={canCreate && !firstUse ? createPermit : undefined}
          createLabel="Nova PT"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          {emptyList ? (
            <div
              className={
                "pt-list-empty grid justify-items-center gap-3 p-[2.5rem_1rem] text-center [&_strong]:text-ink [&_strong]:text-[1.1rem] [&_p]:max-w-[55ch] [&_p]:text-muted [&_p]:leading-normal max-[520px]:[&_.ui-button]:w-full"
              }
            >
              <strong>
                {firstUse
                  ? "Comece pela primeira Permissão de Trabalho"
                  : "Nenhuma PT encontrada"}
              </strong>
              <p>
                {firstUse
                  ? "Descreva o trabalho, confirme a equipe e revise os requisitos antes de autorizar a execução."
                  : "Ajuste a busca ou a situação selecionada para encontrar suas permissões."}
              </p>
              {firstUse && canCreate ? (
                <Button onClick={createPermit}>Criar primeira PT</Button>
              ) : (
                !firstUse && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearch({ q: "", page: 1 });
                    }}
                  >
                    Limpar filtros
                  </Button>
                )
              )}
            </div>
          ) : (
            <>
              <DataTable
                columns={[
                  "Referência",
                  "Permissão de Trabalho",
                  "Período",
                  "Situação",
                ]}
                rows={(query.data?.rows ?? []).map((row) => [
                  <strong>{row.referenceCode}</strong>,
                  row.title,
                  row.startsAt
                    ? `${new Date(row.startsAt).toLocaleDateString("pt-BR")} ${row.endsAt ? `— ${new Date(row.endsAt).toLocaleDateString("pt-BR")}` : ""}`
                    : "Não informado",
                  <StatusBadge value={row.status} />,
                ])}
                keyOf={(index) => query.data!.rows[index]!.id}
                empty={
                  statusFilter === "all"
                    ? "Cadastre a primeira PT para começar."
                    : "Nenhuma PT encontrada nesta situação."
                }
                renderActions={(index) => (
                  <span className={"row-inline-actions inline-flex gap-1"}>
                    {query.data!.rows[index]!.status !== "draft" && (
                      <a
                        className={
                          "ui-button inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] [&:active:not(:disabled)]:transform-[translateY(1px)] disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger border border-solid border-transparent text-accent-strong bg-transparent [&:hover:not(:disabled)]:bg-[#e9efeb] min-h-[2.4rem] p-[0.5rem_0.7rem] text-[0.8rem]"
                        }
                        href={`/${endpoint}/${query.data!.rows[index]!.id}/qr.svg`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        QR
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSearch({
                          id: query.data!.rows[index]!.id,
                          action: undefined,
                        })
                      }
                    >
                      {query.data!.rows[index]!.status === "draft"
                        ? "Editar"
                        : "Visualizar"}
                    </Button>
                  </span>
                )}
              />
              <PagedFooter
                data={query.data}
                onPage={(page) => setSearch({ page })}
              />
            </>
          )}
        </QueryState>
      </section>
      {editing && (
        <WorkPermitWizard
          editor={editor}
          canAuthorize={permissions.includes("apr.finalize")}
          onClose={() => setSearch({ action: undefined, id: undefined })}
        />
      )}
      {search.id && detail.data && detail.data.status !== "draft" && (
        <WorkPermitDetails permit={detail.data} endpoint={endpoint} onClose={() => setSearch({id: undefined})} />
      )}
    </div>
  );
}
