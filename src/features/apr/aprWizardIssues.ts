import type { AprFormValues, Template } from "./types.js";

export interface WizardIssue { step: number; message: string }

export function aprWizardIssues(values: AprFormValues, template?: Template): WizardIssue[] {
  const issues: WizardIssue[] = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9_/-]*$/.test(values.referenceCode.trim())) issues.push({ step: 1, message: "Informe uma referência válida." });
  if (!values.title.trim()) issues.push({ step: 1, message: "Informe o título da APR." });
  if (!values.templateVersionId) issues.push({ step: 1, message: "Selecione um template." });
  if (!values.location.trim()) issues.push({ step: 1, message: "Informe a localização." });
  if (!values.executionOn) issues.push({ step: 1, message: "Informe a data da atividade." });
  if (!values.analystPersonId) issues.push({ step: 1, message: "Selecione o responsável pela análise." });
  if (values.templateVersionId && template?.versionId !== values.templateVersionId)
    issues.push({ step: 3, message: "Não foi possível carregar as perguntas do template. Volte à etapa e tente novamente." });
  if (!values.risks.length) issues.push({ step: 2, message: "Adicione uma etapa com risco." });
  values.risks.forEach((risk, index) => {
    if (!risk.taskStep.trim() || !risk.hazard.trim() || !risk.controls.length || risk.controls.some((control) => !control.description.trim()))
      issues.push({ step: 2, message: `Complete etapa, perigo e controles do risco ${index + 1}.` });
  });
  for (const question of template?.definition?.questions ?? []) {
    const answer = values.answers.find((item) => item.code === question.code);
    if (question.required && !answer?.answer) issues.push({ step: 3, message: `Responda: ${question.text}` });
    if (answer?.answer === "na" && !question.allowNa) issues.push({ step: 3, message: `N/A não é permitido em: ${question.text}` });
    if ((answer?.answer === "na" || answer?.answer === "no") && !answer.observation?.trim())
      issues.push({ step: 3, message: `Adicione a observação em: ${question.text}` });
  }
  if (!values.participantIds.length) issues.push({ step: 4, message: "Selecione ao menos um participante." });
  if (values.analystPersonId && !values.participantIds.includes(values.analystPersonId))
    issues.push({ step: 4, message: "Inclua o responsável pela análise entre os participantes." });
  return issues;
}
