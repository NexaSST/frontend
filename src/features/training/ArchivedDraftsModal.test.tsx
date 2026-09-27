import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ArchivedDraftsModal } from './ArchivedDraftsModal.js';

describe('ArchivedDraftsModal', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  });
  it('mostra as turmas arquivadas e permite escolher uma para retomar', async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    const draft = { id: '42', courseId: '7', title: 'Turma de integração', trainingOn: '2026-09-10',
      modality: 'initial', instructorName: null, status: 'archived' as const, draft: { step: 2, participants: [] } };
    render(<ArchivedDraftsModal drafts={[draft]} courses={[]} loading={false} error={false} restoringId={null}
      onClose={vi.fn()} onRetry={vi.fn()} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: /Turma de integração/ }));
    expect(onRestore).toHaveBeenCalledWith(draft);
  });

  it('explica quando não há rascunhos arquivados', () => {
    render(<ArchivedDraftsModal drafts={[]} courses={[]} loading={false} error={false} restoringId={null}
      onClose={vi.fn()} onRetry={vi.fn()} onRestore={vi.fn()} />);
    expect(screen.getByText('Nenhum rascunho arquivado')).toBeInTheDocument();
  });
});
