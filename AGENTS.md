# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single frontend-only app: the **RaaS Admin Review Queue Mockup** (React 18 + TypeScript + Vite 4 + Tailwind). There is **no backend, database, or test suite** — all data is static mock data in `src/data/mockCases.ts` and all state changes are session-local. See `README.md` for feature/structure details.

- Run the app in dev mode with `npm run dev` (Vite serves at `http://localhost:5173`). This is the only runnable service; no other services need to be started to test end to end.
- `npm run build` (`tsc && vite build`) currently **fails at the `tsc` step** with `TS5096: Option 'allowImportingTsExtensions' can only be used when either 'noEmit' or 'emitDeclarationOnly' is set` because `tsconfig.json` sets `allowImportingTsExtensions` without `noEmit`. This is a pre-existing config gap unrelated to environment setup — the dev server does not run `tsc`, so `npm run dev` works fine.
- `npm run lint` (`eslint src --ext ts,tsx`) does **not** work out of the box: `eslint` is not in `devDependencies` and there is no eslint config in the repo. Treat lint as unavailable unless eslint + a config are intentionally added.
