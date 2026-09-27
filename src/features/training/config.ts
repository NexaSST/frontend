import type { Frequency } from "./types.js";

export const trainingTypes: Record<string, string> = { internal: "Interno", qualification_training: "Capacitação", retraining: "Recapacitação", qualification: "Qualificação", legal: "Legal", procedure: "Procedimento", other: "Outros" };
export const modalities: Record<string, string> = { initial: "Inicial", periodic: "Periódico", occasional: "Eventual" };
export const eventSteps = ['Treinamento', 'Participantes', 'Evidências', 'Revisão'];
export function expirationDate(date: string, days: number | null | undefined) {
  if (days == null) return "Sem vencimento";
  if (!date) return "Selecione a data";
  const result = new Date(`${date}T12:00:00Z`); result.setUTCDate(result.getUTCDate() + days);
  return Number.isNaN(result.getTime()) ? "Data inválida" : result.toISOString().slice(0, 10).split("-").reverse().join("/");
}
export const frequencyLabel = (frequency: Frequency) => frequency.days === null ? frequency.name : `${frequency.name} · ${frequency.days} dias`;
