import { useId } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button, Input } from "./ui/index.js";

interface Props {
  title: string;
  description: string;
  month: string;
  onMonthChange: (month: string) => void;
  exporting: "pdf" | "xlsx" | null;
  onExport: (format: "pdf" | "xlsx") => void;
}

export function MonthlyReportHeader({ title, description, month, onMonthChange, exporting, onExport }: Props) {
  const titleId = useId();
  return (
    <section className={"monthly-report-header flex items-center justify-between flex-wrap gap-[1.25rem_2rem] mb-6 pb-6 border-b border-solid border-b-line [&_h3]:m-[0_0_.35rem] [&_h3]:text-[1rem] [&_h3]:font-bold [&_h3]:leading-[1.4] [&_p]:max-w-[65ch] [&_p]:m-0 [&_p]:text-muted [&_p]:text-[.875rem] [&_p]:leading-normal max-[640px]:gap-4"} aria-labelledby={titleId}>
      <div className={"monthly-report-header__copy flex-[1_1_22rem] min-w-0 max-[640px]:basis-full"}>
        <h3 id={titleId}>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={"monthly-report-header__actions flex items-center flex-wrap gap-[.75rem] [&_input]:w-46 [&_input]:min-w-0 [&_input]:min-h-[2.8rem] [&_.ui-button]:whitespace-nowrap max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:w-full max-[640px]:[&_input]:col-span-full max-[640px]:[&_input]:w-full max-[640px]:[&_.ui-button]:w-full max-[640px]:[&_.ui-button]:px-[.65rem] max-[640px]:[&_.ui-button]:text-[.875rem] max-[360px]:grid-cols-[minmax(0,1fr)]"}>
        <Input type="month" aria-label="Mês do relatório" value={month} disabled={exporting !== null} onChange={(event) => onMonthChange(event.target.value)} />
        <Button leadingIcon={<FileSpreadsheet size={17} aria-hidden="true" />} loading={exporting === "xlsx"} disabled={!month || exporting !== null} onClick={() => onExport("xlsx")}>
          {exporting === "xlsx" ? "Gerando Excel…" : "Exportar Excel"}
        </Button>
        <Button variant="secondary" leadingIcon={<FileDown size={17} aria-hidden="true" />} loading={exporting === "pdf"} disabled={!month || exporting !== null} onClick={() => onExport("pdf")}>
          {exporting === "pdf" ? "Gerando PDF…" : "Exportar PDF"}
        </Button>
      </div>
    </section>
  );
}
