import { useState } from "react";
import { Button } from "../../components/ui/index.js";
import { WorkflowModal, WorkflowStepper } from "../shared.js";
import { workPermitIssues } from "./workPermitIssues.js";
import { PermitAprStep, PermitPeopleStep, PermitReviewStep, PermitWorkStep } from "./WorkPermitWizardSteps.js";
import type { useWorkPermitEditor } from "./useWorkPermitEditor.js";

type Editor = ReturnType<typeof useWorkPermitEditor>;
const steps = ["Trabalho", "APR", "Participantes", "Revisão"];

export function WorkPermitWizard({ editor, onClose, canAuthorize }: {
  editor: Editor; onClose: () => void; canAuthorize: boolean;
}) {
  const { form, detail, step, setStep, save, authorize } = editor;
  const [message, setMessage] = useState("");
  const values = form.watch();
  const issues = workPermitIssues(values);
  const busy = save.isPending || authorize.isPending;
  const persist = async (target: number, close = false) => {
    const current = form.getValues();
    if (!/^[A-Za-z0-9][A-Za-z0-9_/-]*$/.test(current.referenceCode.trim()) ||
      current.title.trim().length < 2 || current.workDescription.trim().length < 3) {
      setMessage("Informe referência, título e descrição antes de salvar o rascunho.");
      setStep(1);
      return;
    }
    if (current.startsAt && current.endsAt && new Date(current.endsAt) <= new Date(current.startsAt)) {
      setMessage("O fim previsto deve ser posterior ao início.");
      setStep(1);
      return;
    }
    try {
      setMessage("");
      await save.mutateAsync({ values: current, nextStep: target });
      setStep(target);
      if (close) onClose();
    } catch { setMessage("Não foi possível salvar a PT. Confira os dados e tente novamente."); }
  };
  const close = () => {
    if (form.formState.isDirty && detail.data?.status === "draft") void persist(step, true);
    else onClose();
  };
  const finish = () => {
    if (issues.length) { setMessage("Resolva as pendências para autorizar."); return; }
    if (form.formState.isDirty) { setMessage("Salve as alterações antes de autorizar."); return; }
    authorize.mutate();
  };
  return <WorkflowModal title={detail.data ? "Editar PT" : "Nova Permissão de Trabalho"}
    description="Prepare o trabalho, vincule uma APR se houver, confirme a equipe e revise antes da autorização."
    focusKey={step} onClose={close}
    footer={<div className={"flex w-full flex-wrap items-center justify-between gap-3"}>
      <div>{step > 1 && <Button type="button" variant="ghost" disabled={busy} onClick={() => void persist(step - 1)}>Voltar</Button>}</div>
      <div className={"flex flex-wrap items-center gap-2"}>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void persist(step, true)}>{save.isPending ? "Salvando…" : "Salvar rascunho"}</Button>
        {step < 4 ? <Button type="button" disabled={busy} onClick={() => void persist(step + 1)}>Continuar</Button>
          : canAuthorize ? <Button type="button" disabled={busy || issues.length > 0 || form.formState.isDirty || !detail.data} onClick={finish}>{authorize.isPending ? "Autorizando…" : "Autorizar PT"}</Button> : null}
      </div>
    </div>}>
    <div className={"space-y-6"}><WorkflowStepper steps={steps} current={step} onStep={(target) => void persist(target)} />
      {message && <p role="alert" className={"rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"}>{message}</p>}
      {step === 1 && <PermitWorkStep editor={editor} />}
      {step === 2 && <PermitAprStep editor={editor} />}
      {step === 3 && <PermitPeopleStep editor={editor} />}
      {step === 4 && <PermitReviewStep editor={editor} issues={issues} onGoTo={(target) => void persist(target)} />}
    </div>
  </WorkflowModal>;
}
