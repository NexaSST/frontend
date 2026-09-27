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
    <section className="monthly-report-header" aria-labelledby={titleId}>
      <div className="monthly-report-header__copy">
        <h3 id={titleId}>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="monthly-report-header__actions">
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
