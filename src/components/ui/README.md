# Componentes de interface

Primitives visuais reutilizáveis do frontend. Importe sempre pelo barrel:

```tsx
import { Button, FormField, Input, Select } from "../components/ui/index.js";
```

## Componentes

- `Button`: variantes `primary`, `secondary`, `danger` e `ghost`; tamanhos `sm`, `md` e `icon`; suporta `loading`, ícones e largura total.
- `Input`, `Select` e `Textarea`: controles tipados, com foco, estado inválido e estado desabilitado padronizados.
- `Checkbox` e `CheckboxField`: controle e composição acessível para rótulo/descrição.
- `FormField`: rótulo, ajuda, obrigatoriedade e mensagem de erro.
- `Badge`: tons semânticos `neutral`, `success`, `warning`, `danger` e `info`.
- `PageTitle`, `ModuleTitle` e `SectionTitle`: hierarquia consistente de títulos e ações.
- `DropdownMenu` e `DropdownItem`: menu compacto para ações secundárias.

Tabelas, tabs, paginação, estados de consulta e painéis de edição continuam em `features/shared.tsx`, pois são composições de aplicação construídas sobre estas primitives.

## Exemplo

```tsx
<FormField label="Nome" error={errors.name?.message}>
  <Input {...register("name")} invalid={Boolean(errors.name)} />
</FormField>

<Button type="submit" loading={mutation.isPending}>
  Salvar
</Button>
```
