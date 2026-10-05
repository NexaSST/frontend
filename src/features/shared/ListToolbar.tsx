import { Check, Download, ListFilter, Plus, Search } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button, Input } from "../../components/ui/index.js";

export function ListToolbar({
  value,
  onChange,
  onCreate,
  createLabel = "Novo cadastro",
  actions,
  children,
  hideEmptyFilters = false,
  hideExport = false,
  activeFilterCount = 0,
}: {
  value: string;
  onChange: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
  hideEmptyFilters?: boolean;
  hideExport?: boolean;
  activeFilterCount?: number;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const filterPanelId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [canExport, setCanExport] = useState(false);

  useLayoutEffect(() => {
    setCanExport(
      Boolean(
        toolbarRef.current?.parentElement?.querySelector(
          "table.data-table tbody tr",
        ),
      ),
    );
  });

  const exportCsv = () => {
    const table =
      toolbarRef.current?.parentElement?.querySelector<HTMLTableElement>(
        "table.data-table",
      );
    if (!table) return;
    const lines = Array.from(table.rows).map((row) => {
      const cells = Array.from(row.cells).filter(
        (cell) =>
          !cell.classList.contains("row-actions") &&
          !cell.classList.contains("actions-column"),
      );
      return cells
        .map(
          (cell) =>
            `"${(cell.textContent ?? "").replace(/\s+/g, " ").trim().replaceAll('"', '""')}"`,
        )
        .join(";");
    });
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `nexasst-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(href);
    setExported(true);
    window.setTimeout(() => setExported(false), 1800);
  };

  return (
    <div
      ref={toolbarRef}
      className={
        "list-toolbar relative flex items-center justify-between gap-4 mb-4 [&_.search-field]:w-[clamp(15rem,28vw,24rem)] [&_.search-field]:min-h-[2.65rem] [&_.search-field]:p-[0_0.8rem] [&_.search-field]:border-control-border [&_.search-field:focus-within]:border-accent [&_.search-field:focus-within]:[outline:3px_solid_var(--color-control-focus)] [&_.search-field_.ui-control]:min-h-[2.55rem] [&_.search-field_.ui-control]:p-0 [&_.search-field_.ui-control]:border-0 [&_.search-field_.ui-control]:[outline:0] [&_.search-field_.ui-control]:shadow-none max-[520px]:items-start max-[520px]:flex-col max-[520px]:[&_.search-field]:w-full max-[520px]:[&_.search-field]:min-w-0"
      }
    >
      <div
        className={
          "list-toolbar__left flex min-w-0 items-center gap-[0.55rem] max-[520px]:w-full max-[520px]:grid max-[520px]:grid-cols-[minmax(0,1fr)_auto]"
        }
      >
        <label
          className={
            "search-field flex items-center gap-2 min-w-52 p-[0.55rem_0.7rem] border border-solid border-line rounded-control bg-white [&_input]:w-full [&_input]:border-0 [&_input]:[outline:0] [&_input]:bg-transparent max-[800px]:w-full"
          }
        >
          <Search size={18} aria-hidden="true" />
          <span
            className={
              "sr-only absolute w-px h-px p-0 -m-px overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap border-0"
            }
          >
            Buscar
          </span>
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Buscar nesta lista"
          />
        </label>
        {(children || !hideEmptyFilters) && (
          <Button
            variant="secondary"
            size="sm"
            className={
              "filter-button aria-expanded:border-control-border aria-expanded:text-accent-strong aria-expanded:bg-accent-soft"
            }
            leadingIcon={<ListFilter size={16} aria-hidden="true" />}
            aria-expanded={children ? filtersOpen : undefined}
            aria-controls={children ? filterPanelId : undefined}
            disabled={!children}
            title={
              children
                ? "Mostrar filtros"
                : "Esta lista ainda não possui filtros adicionais"
            }
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {activeFilterCount ? `Filtros (${activeFilterCount})` : "Filtros"}
          </Button>
        )}
        {children && filtersOpen && (
          <div
            id={filterPanelId}
            className={
              "list-toolbar__filters absolute z-8 top-[calc(100%+0.45rem)] left-[min(24.55rem,calc(28vw+15.55rem))] grid min-w-56 gap-[0.65rem] p-[0.65rem] border border-solid border-line rounded-control bg-surface shadow-[0_0.75rem_2rem_-1rem_rgb(19_33_29/35%)] max-[520px]:right-0 max-[520px]:left-0"
            }
          >
            {children}
          </div>
        )}
      </div>
      {(actions || !hideExport || onCreate) && (
        <div
          className={
            "toolbar-actions flex items-center justify-end gap-[0.35rem] flex-[0_0_auto] max-[520px]:w-full max-[520px]:justify-between max-[520px]:[&:has(>_:only-child)]:justify-end"
          }
        >
          {actions}
          {!hideExport && (
            <Button
              variant="secondary"
              size="sm"
              className={"export-button min-w-[7.6rem]"}
              leadingIcon={
                exported ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Download size={16} aria-hidden="true" />
                )
              }
              disabled={!canExport}
              onClick={exportCsv}
            >
              {exported ? "Exportado" : "Exportar CSV"}
            </Button>
          )}
          {onCreate && (
            <Button
              size="sm"
              leadingIcon={<Plus size={16} aria-hidden="true" />}
              onClick={onCreate}
            >
              {createLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
