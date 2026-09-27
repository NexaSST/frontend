import type { ReactNode } from "react";

export function PageTitle({ title, description, meta }: { title: ReactNode; description?: ReactNode; meta?: ReactNode }) {
  return <section className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{meta}</section>;
}

export function ModuleTitle({ title, description, meta }: { title: ReactNode; description?: ReactNode; meta?: ReactNode }) {
  return <section className="module-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{meta}</section>;
}

export function SectionTitle({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return <header className="section-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>;
}
