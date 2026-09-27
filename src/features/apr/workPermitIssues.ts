import type { WorkPermitForm } from "./workPermitSchema.js";

export interface PermitIssue { step: number; message: string }

export function workPermitIssues(values: WorkPermitForm): PermitIssue[] {
  const issues: PermitIssue[] = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9_/-]*$/.test(values.referenceCode.trim()))
    issues.push({ step: 1, message: "Informe uma referência válida." });
  if (values.title.trim().length < 2) issues.push({ step: 1, message: "Informe o título do trabalho." });
  if (values.workDescription.trim().length < 3) issues.push({ step: 1, message: "Descreva o trabalho a ser realizado." });
  if (values.startsAt && values.endsAt && new Date(values.endsAt) <= new Date(values.startsAt))
    issues.push({ step: 1, message: "O fim deve ser posterior ao início." });
  if (!values.participantIds.length) issues.push({ step: 3, message: "Selecione ao menos um participante para autorizar a PT." });
  return issues;
}
