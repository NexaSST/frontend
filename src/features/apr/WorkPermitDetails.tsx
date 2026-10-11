import { FormModal, StatusBadge } from "../shared.js";
import type { WorkPermitDetail } from "./types.js";

export function WorkPermitDetails({permit, endpoint, onClose}: {permit: WorkPermitDetail; endpoint: string; onClose: () => void}) {
  return (
        <FormModal
          title={permit?.title ?? "Permissão de Trabalho"}
          description="PT autorizada e preservada com os vínculos e a validação vigentes no momento da autorização."
          className={
            "w-[min(62rem,calc(100vw-2rem))] max-[800px]:w-[calc(100vw-1rem)]"
          }
          onClose={onClose}
        >
          <dl
            className={
              "detail-list grid gap-[0.8rem] m-0 [&_div]:pb-[0.8rem] [&_div]:border-b [&_div]:border-solid [&_div]:border-b-line [&_dt]:text-muted [&_dt]:text-[0.75rem] [&_dt]:font-[750] [&_dd]:m-[0.3rem_0_0]"
            }
          >
            <div>
              <dt>Referência</dt>
              <dd>{permit?.referenceCode}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <StatusBadge value={permit?.status ?? "authorized"} />
              </dd>
            </div>
            <div>
              <dt>Trabalho</dt>
              <dd>{permit?.workDescription}</dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>
                {permit?.startsAt
                  ? new Date(permit.startsAt).toLocaleString("pt-BR")
                  : "Não informado"}{" "}
                —{" "}
                {permit?.endsAt
                  ? new Date(permit.endsAt).toLocaleString("pt-BR")
                  : "Sem término informado"}
              </dd>
            </div>
            <div>
              <dt>APRs vinculadas</dt>
              <dd>{permit?.aprs.length ?? 0}</dd>
            </div>
            <div>
              <dt>Participantes</dt>
              <dd>{permit?.participants.length ?? 0}</dd>
            </div>
            <div>
              <dt>Validação preventiva</dt>
              <dd>
                {permit?.trainingValidationRequired
                  ? "Treinamentos verificados"
                  : "Não exigida — Treinamentos não contratado"}
              </dd>
            </div>
            <div>
              <dt>QR público</dt>
              <dd>
                <a
                  href={`/${endpoint}/${permit?.id}/qr.svg`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir QR imprimível
                </a>
              </dd>
            </div>
            {permit?.cancelledAt && (
              <div>
                <dt>Cancelamento</dt>
                <dd>
                  {new Date(permit.cancelledAt).toLocaleString("pt-BR")} ·{" "}
                  {permit.cancellationRequestedByName}
                </dd>
              </div>
            )}
          </dl>
        </FormModal>
  );
}
