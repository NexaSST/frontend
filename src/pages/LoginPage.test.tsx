import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LoginPage } from './LoginPage.js';
vi.mock('@tanstack/react-query', async (importOriginal) => ({ ...await importOriginal<typeof import('@tanstack/react-query')>(), useQueryClient: () => ({}) }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn(), useSearch: () => ({}), Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock('../lib/api.js', () => ({ apiJson: vi.fn().mockResolvedValue({ configured: false }) }));
afterEach(cleanup);
test('login comum não divulga Master e alterna a senha sem apagar o valor', async () => {
  render(<LoginPage />);
  expect(screen.queryByText('Master')).not.toBeInTheDocument();
  const input = screen.getByPlaceholderText('Sua senha');
  await userEvent.type(input, 'senha-exemplo');
  expect(input).toHaveAttribute('type', 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveValue('senha-exemplo');
  await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
  expect(input).toHaveAttribute('type', 'password');
});
test('acesso interno não oferece recuperação de empresa nem Microsoft', () => {
  render(<LoginPage kind="platform" />);
  expect(screen.queryByText('Esqueceu sua senha?')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Microsoft/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument();
});
