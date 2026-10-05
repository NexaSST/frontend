import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/index.js';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (!total) return null;
  return (
    <nav className={"pagination flex items-center justify-between gap-4 mt-[1.2rem] pt-4 border-t border-solid border-t-line text-muted text-[0.8rem] tabular-nums [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[0.7rem] max-[520px]:items-start max-[520px]:flex-col"} aria-label="Paginação">
      <span>{total} {total === 1 ? 'registro' : 'registros'}</span>
      <div>
        <Button variant="secondary" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior"><ChevronLeft size={18} /></Button>
        <span>Página {page} de {Math.max(totalPages, 1)}</span>
        <Button variant="secondary" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página"><ChevronRight size={18} /></Button>
      </div>
    </nav>
  );
}
