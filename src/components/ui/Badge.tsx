import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils.js";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
const statusLabels: Record<string, string> = {
  active: "Ativo", inactive: "Inativo", suspended: "Suspenso", expired: "Expirado", invited: "Convidado",
  accepted: "Aceito", archived: "Arquivado", draft: "Rascunho", published: "Publicado", finalized: "Finalizado",
  completed: "Concluído", cancelled: "Cancelado", available: "Disponível", future: "Futuro", pending: "Pendente",
  scheduled: "Agendado", failed: "Falhou", revoked: "Revogado", authorized: "Autorizado", closed: "Encerrado", in_progress: "Em andamento",
};
export function Badge({ tone = "neutral", className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx("ui-badge", `ui-badge--${tone}`, className)} {...props}>{children}</span>;
}

export function toneForStatus(status: string): BadgeTone {
  const value = status.toLowerCase();
  if (["active", "finalized", "completed", "accepted", "authorized"].includes(value)) return "success";
  if (["invited", "draft", "pending", "scheduled"].includes(value)) return "warning";
  if (["suspended", "expired", "failed", "revoked", "archived", "cancelled"].includes(value)) return "danger";
  return "neutral";
}

export function labelForStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  return statusLabels[normalized] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");
}
