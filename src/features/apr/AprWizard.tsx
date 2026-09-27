import { useState } from "react";
import { Button } from "../../components/ui/index.js";
import { WorkflowModal, WorkflowStepper } from "../shared.js";
import { aprWizardIssues } from "./aprWizardIssues.js";
import { AprContextStep, AprParticipantsStep, AprQuestionsStep, AprReviewStep, AprRisksStep } from "./AprWizardSteps.js";
import type { useDocuments } from "./useDocuments.js";

const steps = ["Dados", "Riscos", "Perguntas", "Participantes", "Revisão"];
type Context = ReturnType<typeof useDocuments>;

export function AprWizard({ data, onClose, canFinalize }: { data: Context; onClose: () => void; canFinalize: boolean }) {
  const { form, detail, templateDetail, step, setStep, save, finalize } = data;
  const [message, setMessage] = useState("");
  const busy = save.isPending || finalize.isPending;
  const values = form.watch();
  const issues = aprWizardIssues(values, templateDetail.data);
  const persist = async (nextStep: number, close = false) => {
    if (!form.getValues("templateVersionId") || !/^[A-Za-z0-9][A-Za-z0-9_/-]*$/.test(form.getValues("referenceCode").trim()) || !form.getValues("title").trim()) {
      setMessage("Informe referência, título e template antes de salvar o rascunho.");
      setStep(1);
      return;
    }
    try {
      setMessage("");
      await save.mutateAsync({ values: form.getValues(), nextStep });
      setStep(nextStep);
      if (close) onClose();
    } catch { setMessage("Não foi possível salvar o rascunho. Confira os dados e tente novamente."); }
  };
  const advance = () => {
    if (step === 3 && templateDetail.isLoading) { setMessage("Aguarde o carregamento das perguntas."); return; }
    void persist(step + 1);
  };
  const close = () => {
    if (form.formState.isDirty && detail.data?.status === "draft") void persist(step, true);
    else onClose();
  };
  const finish = () => {
    if (issues.length) { setMessage("Resolva as pendências para finalizar."); return; }
    if (form.formState.isDirty) { setMessage("Salve as alterações antes de finalizar."); return; }
    finalize.mutate();
  };
  return <WorkflowModal title={detail.data ? "Editar APR" : "Nova APR"}
    description="Preencha as etapas, salve o rascunho e finalize após a revisão."
    focusKey={step} onClose={close}
    footer={<div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div>{step > 1 && <Button type="button" variant="ghost" onClick={() => void persist(step - 1)} disabled={busy}>Voltar</Button>}</div>
      <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="secondary" disabled={busy} onClick={() => void persist(step, true)}>{save.isPending ? "Salvando…" : "Salvar rascunho"}</Button>
        {step < 5 ? <Button type="button" disabled={busy} onClick={advance}>Continuar</Button> : canFinalize ? <Button type="button" disabled={busy || issues.length > 0 || form.formState.isDirty} onClick={finish}>{finalize.isPending ? "Finalizando…" : "Finalizar APR"}</Button> : null}</div>
    </div>}>
    <div className="space-y-6"><WorkflowStepper steps={steps} current={step} onStep={(target) => void persist(target)} />
      {message && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">{message}</p>}
      {step === 1 && <AprContextStep data={data} />}
      {step === 2 && <AprRisksStep data={data} />}
      {step === 3 && <AprQuestionsStep data={data} />}
      {step === 4 && <AprParticipantsStep data={data} />}
      {step === 5 && <AprReviewStep data={data} issues={issues} onGoTo={(target) => void persist(target)} />}
    </div>
  </WorkflowModal>;
}
