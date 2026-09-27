import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PublicTrainingSection } from './PublicTrainingSection.js';

const assignment = { branchId: '1', branch: 'Matriz', jobFunction: 'Técnico', department: 'Operação', sector: null, status: 'active', startsOn: '2020-01-01' };
const matrix = { branchId: '1', name: 'Matriz SST', version: 1, effectiveFrom: '2020-01-01' };
const course = { branchId: '1', courseCode: 'NR-01', courseName: 'Segurança', status: 'up_to_date', expiresOn: null };
afterEach(cleanup);

describe('public training matrix', () => {
  it('keeps missing requirements visible in the matrix summary across pages', () => {
    const trainings = Array.from({ length: 6 }, (_, index) => ({ ...course, courseCode: `CUR-${index}`, courseName: `Curso ${index}`, status: index === 5 ? 'not_completed' : 'up_to_date' }));
    render(<PublicTrainingSection assignment={assignment} trainings={trainings} matrix={matrix} multipleBranches={false} />);
    expect(screen.getByText('Há exigências não atendidas')).toBeInTheDocument();
    expect(screen.getByText(/treinamento ainda não realizado: Curso 5/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Curso 5')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.queryByText('De acordo com a matriz')).not.toBeInTheDocument();
  });
  it('recognizes still-valid courses approaching expiration', () => {
    render(<PublicTrainingSection assignment={assignment} trainings={[{ ...course, status: 'due_30' }]} matrix={matrix} multipleBranches={false} />);
    expect(screen.getByText('De acordo com a matriz')).toBeInTheDocument();
    expect(screen.getByText(/próximo do vencimento/)).toBeInTheDocument();
  });
  it('does not infer compliance when no matrix is available', () => {
    render(<PublicTrainingSection assignment={assignment} trainings={[]} multipleBranches={false} />);
    expect(screen.getByText('Nenhuma matriz publicada está disponível nesta consulta.')).toBeInTheDocument();
    expect(screen.queryByText('De acordo com a matriz')).not.toBeInTheDocument();
  });
});
