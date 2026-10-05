

export function ModuleTodo({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section
      className={
        "todo-surface grid grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] gap-8 p-8 border border-dashed border-[#aebbb4] rounded-panel bg-[#f8f8f3] [&_p]:text-muted [&_p]:leading-[1.6] [&_li]:text-muted [&_li]:leading-[1.6] [&_ul]:m-0 [&_ul]:pl-[1.2rem] max-[800px]:grid-cols-[1fr]"
      }
    >
      <div>
        <h2>{title}</h2>
        <p>
          Este painel depende de endpoints agregados. As listagens operacionais
          abaixo continuam disponíveis sem calcular métricas incompletas no
          navegador.
        </p>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function GuidedOverview({
  title,
  description,
  steps,
  metrics,
  onStep,
}: {
  title: string;
  description: string;
  steps: Array<{ title: string; description: string; tab?: string }>;
  metrics: string[];
  onStep?: (tab: string) => void;
}) {
  return (
    <div className={"guided-overview grid gap-4"}>
      <section
        className={
          "guided-intro flex items-start justify-between gap-8 p-6 border border-solid border-line rounded-panel bg-surface shadow-panel [&_h2]:mt-[0.35rem] [&_h2]:text-[1.45rem] [&_p]:max-w-[68ch] [&_p]:mb-0 [&_p]:text-muted [&_p]:leading-[1.6] max-[800px]:gap-4"
        }
      >
        <div>
          <span
            className={
              "workspace-eyebrow text-accent-strong text-[0.7rem] font-[850] tracking-[0.075em] uppercase"
            }
          >
            Comece por aqui
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span
          className={
            "guided-step-count flex-[0_0_auto] p-[0.4rem_0.65rem] rounded-[999px] text-accent-strong bg-accent-soft text-[0.75rem] font-extrabold"
          }
        >
          {steps.length} etapas
        </span>
      </section>
      <ol
        className={
          "journey-grid grid items-stretch grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3 m-0 p-0 list-none [counter-reset:journey] [&_li]:flex [&_li]:min-w-0"
        }
      >
        {steps.map((step, index) => (
          <li key={step.title}>
            <button
              className={
                "journey-step grid [align-content:start] gap-2 w-full h-full min-h-36 p-4 border border-solid border-line rounded-control text-ink bg-surface text-left cursor-pointer [transition:border-color_150ms_ease,background_150ms_ease,transform_150ms_ease] [&:hover:not(:disabled)]:border-[#aac7ba] [&:hover:not(:disabled)]:bg-[#f3f8f5] [&:hover:not(:disabled)]:transform-[translateY(-1px)] disabled:cursor-default [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:w-8 [&_>_span]:h-8 [&_>_span]:rounded-compact [&_>_span]:text-accent-strong [&_>_span]:bg-accent-soft [&_>_span]:text-[0.8rem] [&_>_span]:font-[850] [&_p]:m-0 [&_p]:text-muted [&_p]:text-[0.82rem] [&_p]:leading-[1.45]"
              }
              type="button"
              disabled={!step.tab || !onStep}
              onClick={() => step.tab && onStep?.(step.tab)}
            >
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </button>
          </li>
        ))}
      </ol>
      <ModuleTodo title="Painel gerencial — TODO da API" items={metrics} />
    </div>
  );
}
