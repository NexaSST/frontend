import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OperationalChart } from './OperationalChart.js';
vi.mock('./OperationalChartSurface.js', () => ({ default: () => <div /> }));

describe('OperationalChart data access', () => {
  it('preserves zero, unmeasured dates and exact values in the keyboard-accessible table', () => {
    render(<OperationalChart label="Compliance histórico" max={100}
      series={[{ key: 'value', label: 'Compliance (%)', type: 'line' }]}
      data={[{ label: '2026-10-01', value: null }, { label: '2026-10-02', value: 0 }, { label: '2026-10-03', value: 72.45 }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(screen.getByRole('button', { name: 'Tabela' })).toHaveAttribute('aria-pressed', 'true');
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]!).getByText('Sem medição')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('0')).toBeInTheDocument();
    expect(within(rows[3]!).getByText('72,45')).toBeInTheDocument();
  });
});
