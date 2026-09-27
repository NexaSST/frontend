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
    <nav className="pagination" aria-label="Paginação">
      <span>{total} {total === 1 ? 'registro' : 'registros'}</span>
      <div>
        <Button variant="secondary" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior"><ChevronLeft size={18} /></Button>
        <span>Página {page} de {Math.max(totalPages, 1)}</span>
        <Button variant="secondary" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página"><ChevronRight size={18} /></Button>
      </div>
    </nav>
  );
}
