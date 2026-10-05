import type { ReactNode } from "react";

export function PageTitle({ title, description, meta }: { title: ReactNode; description?: ReactNode; meta?: ReactNode }) {
  return <section className={"page-heading flex items-start justify-between gap-8 mb-10 [&_p]:max-w-[68ch] [&_p]:mb-0 [&_p]:text-muted [&_p]:leading-[1.6] max-[800px]:flex-col"}><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{meta}</section>;
}

export function ModuleTitle({ title, description, meta }: { title: ReactNode; description?: ReactNode; meta?: ReactNode }) {
  return <section className={"module-heading flex items-start justify-between gap-8 mb-6 [&_h1]:mb-[0.45rem] [&_h1]:text-[2.25rem] [&_p]:mb-0 [&_p]:text-muted max-[520px]:items-start max-[520px]:flex-col"}><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{meta}</section>;
}

export function SectionTitle({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return <header className={"section-header [&_p]:max-w-[68ch] [&_p]:mb-0 [&_p]:text-muted [&_p]:leading-[1.6] flex items-start justify-between gap-4 mb-[1.4rem] max-[800px]:flex-col"}><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>;
}
