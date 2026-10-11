import { Button, Input } from "../../components/ui/index.js";
import type { Props } from "./types.js";
import type { useMonthlyAprReport } from "./useMonthlyAprReport.js";

export function MonthlyAprReport({model, area}: Pick<Props, "area"> & { model: ReturnType<typeof useMonthlyAprReport> }) {
  const { reportMonth, setReportMonth, exporting, runExport } = model;
  const reportPanel = (
    <section
      className={
        "pt-report-panel flex items-end justify-between gap-6 p-6 border border-solid border-line rounded-panel bg-surface shadow-panel [&_h2]:m-[.3rem_0] [&_h2]:text-[1.35rem] [&_p]:max-w-[58ch] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-normal max-[1000px]:items-stretch max-[1000px]:flex-col"
      }
    >
      <div>
        <span
          className={
            "workspace-eyebrow text-accent-strong text-[0.7rem] font-[850] tracking-[0.075em] uppercase"
          }
        >
          Relatórios
        </span>
        <h2>Relatório mensal de {area === "apr" ? "APR" : "PT"}</h2>
        <p>
          {area === "apr"
            ? "Revisões de APR finalizadas no mês, com identificação e hash do documento."
            : "Permissões de Trabalho movimentadas no mês, com situação e período registrado."}
        </p>
      </div>
      <div
        className={
          "pt-report-actions flex items-center gap-[.55rem] flex-wrap [&_input]:w-44 max-[640px]:[&_input]:w-full max-[640px]:[&_.ui-button]:w-full"
        }
      >
        <Input
          aria-label="Mês do relatório"
          type="month"
          value={reportMonth}
          onChange={(event) => setReportMonth(event.target.value)}
        />
        <Button
          variant="secondary"
          disabled={exporting !== null}
          onClick={() => void runExport("pdf")}
        >
          {exporting === "pdf" ? "Gerando PDF…" : "Exportar PDF"}
        </Button>
        <Button
          disabled={exporting !== null}
          onClick={() => void runExport("xlsx")}
        >
          {exporting === "xlsx" ? "Gerando Excel…" : "Exportar Excel"}
        </Button>
      </div>
    </section>
  );
  return reportPanel;
}
