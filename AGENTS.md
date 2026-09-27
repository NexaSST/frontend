# Frontend feature structure

- Keep `.ts` and `.tsx` files under `src/features` at or below 250 lines.
- Feature entry files (such as `AprModule.tsx`) should compose or route feature screens. Put forms, lists, dialogs, hooks, validation, and data transforms in focused files alongside the feature.
- Put domain types in the feature's `types.ts` or a focused `*Types.ts`; use `src/types` only when a contract is genuinely shared across features. Keep API path builders and network helpers outside UI components.
- Preserve behavior and accessibility when splitting files. Run typecheck, lint, tests, and a production build after a broad refactor.
- `src/features/confined-spaces` is exempt from this size rule until that feature needs restructuring.
