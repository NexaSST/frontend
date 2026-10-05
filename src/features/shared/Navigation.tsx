import { Check, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { Pagination } from "../../components/Pagination.js";
import { Button } from "../../components/ui/index.js";

export function ModuleTabs({
  tabs,
  current,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  current: string;
  onChange: (tab: string) => void;
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const centerActive = () => {
    const active = activeRef.current;
    const container = active?.parentElement;
    if (active && container)
      container.scrollLeft = Math.max(
        0,
        active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2,
      );
  };
  useLayoutEffect(() => {
    centerActive();
  }, [current, tabs]);
  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(centerActive);
    });
    const container = activeRef.current?.parentElement;
    const observer = container ? new ResizeObserver(centerActive) : null;
    if (container) observer?.observe(container);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      observer?.disconnect();
    };
  }, [current]);
  return (
    <nav
      className={
        "module-tabs flex gap-6 mb-5 overflow-x-auto border-b border-solid border-b-line scrollbar-thin mask-[linear-gradient(90deg,black_0,black_calc(100%-0.8rem),transparent_100%)] [&_button]:relative [&_button]:flex-[0_0_auto] [&_button]:min-h-12 [&_button]:p-[0.65rem_0] [&_button]:border-0 [&_button]:rounded-none [&_button]:text-muted [&_button]:bg-transparent [&_button]:text-[0.88rem] [&_button]:font-[750] [&_button]:cursor-pointer [&_button[aria-current='page']]:text-accent-strong [&_button[aria-current='page']]:shadow-none [&_button[aria-current='page']::after]:absolute [&_button[aria-current='page']::after]:right-0 [&_button[aria-current='page']::after]:-bottom-px [&_button[aria-current='page']::after]:left-0 [&_button[aria-current='page']::after]:h-0.5 [&_button[aria-current='page']::after]:rounded-[2px_2px_0_0] [&_button[aria-current='page']::after]:bg-accent [&_button[aria-current='page']::after]:[content:''] [&>button]:px-2! [&>button:hover]:bg-accent-soft! [&>button[aria-current=page]]:bg-accent-soft!"
      }
      aria-label="Seções do módulo"
    >
      {tabs.map((tab) => (
        <Button
          ref={current === tab.id ? activeRef : undefined}
          variant="ghost"
          size="sm"
          key={tab.id}
          aria-current={current === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}

export function WorkflowStepper({
  steps,
  current,
  onStep,
}: {
  steps: string[];
  current: number;
  onStep?: (step: number) => void;
}) {
  return (
    <div className={"mx-auto mb-6 w-full max-w-3xl"}>
      <ol
        className={"m-0 flex w-full list-none p-0"}
        aria-label="Etapas do cadastro"
      >
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = number < current;
          const active = number === current;
          return (
            <li
              key={`${number}-${label}`}
              className={"relative min-w-0 flex-1"}
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-5.5 right-[calc(-50%+1rem)] left-[calc(50%+1rem)] h-px ${complete ? "bg-accent" : "bg-line"}`}
                />
              )}
              <button
                type="button"
                disabled={number > current}
                aria-current={active ? "step" : undefined}
                aria-label={`Etapa ${number} de ${steps.length}: ${label}${complete ? ", concluída" : active ? ", atual" : ", futura"}`}
                onClick={() => number <= current && onStep?.(number)}
                className={`relative z-10 flex min-h-11 w-full min-w-0 flex-col items-center gap-1.5 bg-transparent px-0 py-1.5 text-center focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active || complete ? "text-accent-strong" : "text-muted"}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm font-extrabold tabular-nums ${active || complete ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}
                >
                  {complete ? <Check size={15} strokeWidth={2.5} /> : number}
                </span>
                <small
                  aria-hidden="true"
                  className={String.raw`hidden min-w-0 max-w-full text-xs leading-tight font-bold min-[480px]:block`}
                >
                  {label}
                </small>
              </button>
            </li>
          );
        })}
      </ol>
      <p
        className={String.raw`mt-2 text-center text-xs font-semibold text-accent-strong min-[480px]:hidden`}
      >
        Etapa {current} de {steps.length}: {steps[current - 1]}
      </p>
    </div>
  );
}

export function PagedFooter({
  data,
  onPage,
}: {
  data?: { page: number; totalPages: number; total: number };
  onPage: (page: number) => void;
}) {
  return data ? (
    <Pagination
      page={data.page}
      totalPages={data.totalPages}
      total={data.total}
      onPageChange={onPage}
    />
  ) : null;
}

export function EditorPanel({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside
      className={
        "editor-panel min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel sticky top-22 max-h-[calc(100vh-7rem)] p-5 overflow-y-auto [&_>_header]:flex [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:pb-4 [&_>_header_p]:mb-0 [&_>_header_p]:text-muted [&_>_header_p]:text-[0.85rem] [&_>_header_p]:leading-[1.55] max-[800px]:static max-[800px]:max-h-none max-[520px]:p-[0.85rem]"
      }
    >
      <header>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          aria-label="Fechar formulário"
        >
          <X size={18} />
        </Button>
      </header>
      {children}
    </aside>
  );
}
