import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils.js";

const uiBadgeClasses = {
  "neutral": "text-[#41534c] bg-[#e7ebe8]",
  "success": "text-[#0b5b40] bg-[#dff1e9]",
  "warning": "text-[#795410] bg-[#f8edcf]",
  "danger": "text-[#8c2d26] bg-[#f8dfdd]",
  "info": "text-[#24536b] bg-[#dcecf3]",
};

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
const statusLabels: Record<string, string> = {
  active: "Ativo", inactive: "Inativo", suspended: "Suspenso", expired: "Expirado", invited: "Convidado",
  accepted: "Aceito", archived: "Arquivado", draft: "Rascunho", published: "Publicado", finalized: "Finalizado",
  completed: "Concluído", cancelled: "Cancelado", available: "Disponível", future: "Futuro", pending: "Pendente",
  scheduled: "Agendado", failed: "Falhou", revoked: "Revogado", authorized: "Autorizado", closed: "Encerrado", in_progress: "Em andamento",
};
export function Badge({ tone = "neutral", className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx("ui-badge inline-flex items-center min-h-[1.6rem] p-[0.25rem_0.5rem] rounded-[999px] text-[0.7rem] font-extrabold", uiBadgeClasses[tone], className)} {...props}>{children}</span>;
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
