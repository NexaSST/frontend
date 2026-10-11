import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfinedSpaceProfile } from './PublicConfinedSpacePage.js';
import type { PublicConfinedSpace } from './PublicConfinedSpaceTypes.js';

afterEach(cleanup);
const space: PublicConfinedSpace = {
  kind: 'confined_space', company: 'Empresa', branch: 'Matriz', code: 'EC-014', name: 'Reservatório de água',
  registrationStatus: 'active', operationalRestriction: 'none', notice: 'Esta consulta não autoriza entrada em espaço confinado.',
  publication: { status: 'published', snapshot: { code: 'EC-014', name: 'Reservatório de água', locationText: 'Unidade industrial, setor norte', classification: 'Espaço confinado', accesses: ['Escotilha superior'],
    rescuePlan: { reviewDueOn: '2026-12-01', scenarios: [{ name: 'Retirada pela escotilha', response: 'Acionar a equipe e seguir o procedimento aprovado.', equipment: 'Tripé e sistema de içamento', team: 'Equipe de resgate designada' }] } } },
};
describe('public confined-space consultation', () => {
  it('shows rescue instructions, identification and published data without requiring interaction', () => {
    render(<ConfinedSpaceProfile space={space} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(space.name);
    expect(screen.getByRole('heading', { name: 'Plano de resgate' })).toBeInTheDocument();
    expect(screen.getByText('Acionar a equipe e seguir o procedimento aprovado.')).toBeVisible();
    expect(screen.getByText('Tripé e sistema de içamento')).toBeVisible();
    expect(screen.getByText('Escotilha superior')).toBeVisible();
    expect(screen.getByText(space.notice)).toBeVisible();
    expect(screen.queryByText('Entrada autorizada')).not.toBeInTheDocument();
  });
  it('highlights interdiction even when the record and plan are active', () => {
    render(<ConfinedSpaceProfile space={{ ...space, operationalRestriction: 'interdicted' }} />);
    expect(screen.getByText('Espaço interditado')).toBeVisible();
    expect(screen.queryByText('Sem restrição cadastral')).not.toBeInTheDocument();
  });
  it('does not invent access details or rescue procedures when the publication is unavailable', () => {
    render(<ConfinedSpaceProfile space={{ ...space, publication: { status: 'plan_unavailable' } }} />);
    expect(screen.getByText('Plano de resgate não disponível nesta consulta')).toBeVisible();
    expect(screen.queryByText('Retirada pela escotilha')).not.toBeInTheDocument();
    expect(screen.queryByText('Escotilha superior')).not.toBeInTheDocument();
    expect(screen.getByText('Os acessos não estão disponíveis neste recorte público.')).toBeVisible();
  });
  it('makes an inactive registration explicit', () => {
    render(<ConfinedSpaceProfile space={{ ...space, registrationStatus: 'inactive' }} />);
    expect(screen.getByText('Cadastro inativo')).toBeVisible();
    expect(screen.queryByText('Sem restrição cadastral')).not.toBeInTheDocument();
  });
});
