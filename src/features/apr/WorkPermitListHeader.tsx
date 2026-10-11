export function WorkPermitListHeader({total}: {total: number}) {
  return (<>
        <header
          className={
            "pt-list-heading flex items-start justify-between gap-6 m-[0_0_1.25rem] [&_h2]:m-[.25rem_0_.3rem] [&_h2]:text-[1.35rem] [&_p]:max-w-[62ch] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-normal [&_>_span]:flex-[0_0_auto] [&_>_span]:p-[.45rem_.7rem] [&_>_span]:rounded-[999px] [&_>_span]:text-accent-strong [&_>_span]:bg-accent-soft [&_>_span]:text-[.75rem] [&_>_span]:font-extrabold max-[640px]:flex-col max-[640px]:gap-[.7rem]"
          }
        >
          <div>
            <h2>Permissões de Trabalho</h2>
            <p>
              Prepare, vincule uma APR quando houver, confirme participantes e
              autorize as PTs.
            </p>
          </div>
          <span>
            {total ?? 0} registro
            {total === 1 ? "" : "s"}
          </span>
        </header>
        <ol
          className={
            "pt-workflow-guide grid grid-cols-4 gap-[.7rem] m-[0_0_1.15rem] p-0 list-none [&_li]:flex [&_li]:gap-[.7rem] [&_li]:min-w-0 [&_li]:p-[.8rem] [&_li]:border [&_li]:border-solid [&_li]:border-line [&_li]:rounded-[.7rem] [&_li]:bg-[#f7faf7] [&_li_>_span]:flex-[0_0_auto] [&_li_>_span]:text-accent-strong [&_li_>_span]:text-[.75rem] [&_li_>_span]:font-[850] [&_li_>_div]:grid [&_li_>_div]:gap-[.2rem] [&_li_>_div]:min-w-0 [&_strong]:text-[.8rem] [&_small]:text-muted [&_small]:text-[.72rem] [&_small]:leading-[1.4] max-[720px]:grid-cols-[1fr] [@media(min-width:_521px)_and_(max-width:_1100px)]:grid-cols-2 max-[520px]:grid-cols-[1fr]"
          }
          aria-label="Etapas do fluxo de PT"
        >
          <li>
            <span>01</span>
            <div>
              <strong>Trabalho</strong>
              <small>Descreva o serviço e o período.</small>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>APR</strong>
              <small>Vincule uma análise finalizada, se houver.</small>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Participantes</strong>
              <small>Confirme a equipe de execução.</small>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <strong>Revisão</strong>
              <small>Confira e autorize a PT.</small>
            </div>
          </li>
        </ol>

  </>);
}
