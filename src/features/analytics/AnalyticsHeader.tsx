import type { Props } from "./types.js";
import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { RefreshCw } from "lucide-react";
import { Button, Select } from "../../components/ui/index.js";
import type { PeriodDays } from "./types.js";
const copy = {
  people: {
    title: "Saúde da estrutura",
    description:
      "Composição da força de trabalho e cadastros que precisam de revisão.",
  },
  inspections: {
    title: "Pulso de ativos e inspeções",
    description:
      "Situação atual do inventário, execução no período e ativos que exigem atenção.",
  },
  training: {
    title: "Cobertura das obrigações",
    description:
      "Obrigações vigentes, conclusões aceitas e vencimentos que pedem intervenção.",
  },
  apr: {
    title: "Fluxo de APR e PT",
    description:
      "Documentos em curso, finalizações do período e impedimentos preventivos.",
  },
} as const;


type PanelProps = Pick<Props, "domain" | "periodDays" | "onPeriodChange"> & { model: Pick<ReturnType<typeof useModuleAnalytics>, "summary" | "series" | "attention" | "refresh"> };

export function AnalyticsHeader({model, domain, periodDays = 30, onPeriodChange}: PanelProps) {
  const { summary, series, attention, refresh } = model;
  return (
<header
        className={
          "module-analytics__context flex items-end justify-between gap-6 p-[1.25rem_1.4rem] border border-solid border-line rounded-panel bg-surface shadow-panel [&_h2]:m-0 [&_h2]:text-[1.35rem] [&_h2]:tracking-tight [&_p]:m-0 [&_p]:max-w-[68ch] [&_p]:mt-[.35rem] [&_p]:text-muted [&_p]:text-[.84rem] [&_p]:leading-normal max-[900px]:items-stretch max-[900px]:flex-col max-[520px]:p-4 max-[520px]:[&_p]:text-[.875rem]"
        }
      >
        <div>
          <h2 id={`${domain}-analytics-title`}>{copy[domain].title}</h2>
          <p>{copy[domain].description}</p>
        </div>
        <div
          className={
            "module-analytics__filters flex items-end gap-[.55rem] flex-[0_0_auto] [&_label]:grid [&_label]:gap-[.3rem] [&_label]:min-w-48 [&_label]:text-muted [&_label]:text-[.7rem] [&_label]:font-[760] max-[520px]:items-stretch max-[520px]:[&_label]:flex-1 max-[520px]:[&_label]:min-w-0 max-[520px]:[&_label]:text-[.875rem] max-[520px]:[&_.ui-button--icon]:w-11 max-[520px]:[&_.ui-button--icon]:h-11 max-[520px]:[&_.ui-button--icon]:min-w-11"
          }
        >
          <label>
            <span>Período de atividade</span>
            <Select
              value={String(periodDays)}
              onChange={(event) =>
                onPeriodChange(Number(event.target.value) as PeriodDays)
              }
            >
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 6 meses</option>
              <option value="365">Últimos 12 meses</option>
            </Select>
          </label>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Atualizar painel"
            loading={
              summary.isFetching || series.isFetching || attention.isFetching
            }
            onClick={refresh}
          >
            <RefreshCw size={17} />
          </Button>
        </div>
      </header>
  );
}
