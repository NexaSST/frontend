import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataTable, ListToolbar } from './shared.js';

describe('shared list pattern', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps filters behind the filter control', () => {
    render(<ListToolbar value="" onChange={() => undefined}><button type="button">Status ativo</button></ListToolbar>);
    expect(screen.queryByRole('button', { name: 'Status ativo' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(screen.getByRole('button', { name: 'Status ativo' })).toBeVisible();
  });

  it('exports visible table columns without the action column', () => {
    const createObjectURL = vi.fn(() => 'blob:csv');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<section>
      <ListToolbar value="" onChange={() => undefined} />
      <DataTable columns={['Nome', 'Status']} rows={[[<strong key="name">Ana</strong>, 'Ativa']]} keyOf={() => '1'} renderActions={() => <button type="button">Editar</button>} />
    </section>);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
    expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeVisible();
  });
});
