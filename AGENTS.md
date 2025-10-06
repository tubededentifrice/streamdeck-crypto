# Repository Guidelines
This project is a Stream Deck plugin; The docs for the SDK are located at https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/ (and it's sub pages).

## Project Structure & Module Organization
- Source: `com.courcelle.cryptoticker-dev.sdPlugin/` (plugin bundle). TypeScript sources live alongside compiled JavaScript and bundled runtime assets inside `js/`.
- Core files: `manifest.json`, `index.html`, modular plugin logic under `js/` (`ticker.ts` orchestrator plus `canvas-renderer.ts`, `settings-manager.ts`, `alert-manager.ts`, `formatters.ts`, `ticker-state.ts`), `js/pi.ts` (property inspector, with entrypoint  `index_pi.html`), `css/`, `images/`.
- Dev preview: `dev/preview.html` and `dev/preview.js` served by the local preview server.
- Tests: `__tests__/` (e.g., `__tests__/ticker.test.js`).
- Bundled runtime outputs: `js/plugin.bundle.js`, `js/pi.bundle.js`, `js/preview.bundle.js`.

## Build, Test, and Development Commands
- `npm test`: runs Jest unit tests.
- `npm run build`: transpile TypeScript sources and emit bundled runtime assets.
- `npm run build:watch`: keep the TypeScript compiler and bundler hot so other tooling rebuilds automatically.
- `npm run bundle`: rebuild only the bundled assets (skips TypeScript compilation).
- `npm run preview`: runs the TypeScript compiler in watch mode alongside the preview server (`npm run preview:serve` runs the server only).
- `npm run lint`: check TypeScript sources (and tests) for issues; run after any code change.
- `npm run lint:fix`: auto-fix lint issues when possible; run if `npm run lint` reports violations.
- `npm run format`: format sources with Prettier; run before committing changes that touch code or markup.
- `npm run watch`: concurrently compile TypeScript changes and restart the dev plugin via `streamdeck restart`.
- `npm test` automatically triggers the build to ensure generated JavaScript is in sync.

## Coding Style & Naming Conventions
- Formatting is enforced by Prettier: 2-space indentation, single quotes for JavaScript, double quotes remain acceptable in HTML where appropriate.
- JavaScript: prefer small, focused modules; functions and variables in `lowerCamelCase`.
- Files: keep existing naming (e.g., `ticker.js`, `pi.js`); assets under `images/`, styles under `css/`.
- Keep code and DOM IDs readable and descriptive; avoid abbreviations.
- Ensure concise comments are added (favor conciseness over grammar) whenever what/why/intent isn't trivially self-explanatory.

## Testing Guidelines
- Framework: Jest (configured via `package.json`).
- Location: place tests in `__tests__/` using `*.test.js` naming.
- Scope: focus on deterministic logic (formatting, parsing, state machines). Avoid coupling tests to external services or Stream Deck runtime.
- Module coverage: dedicated specs exist for canvas rendering helpers, formatters, settings manager, alert manager, and ticker state.
- Always run `npm run lint` and `npm test` when relevant changes have been made, before returning.
- Iterate on fixes until both commands succeed so the codebase stays lint- and test-clean.

## Commit & Pull Request Guidelines
- Commits: use clear, imperative messages (e.g., "Fix preview scaling"). Conventional Commits (e.g., `feat:`, `fix:`) are welcome but not required; keep history tidy.
- PRs: include a concise description, screenshots/GIFs for UI changes (Stream Deck key and PI), testing steps, and linked issues.
- Keep changes scoped; avoid unrelated refactors. Describe any behavior or config changes in the PR.

## Security & Configuration Tips
- Do not hardcode secrets or tokens; prefer Stream Deck settings saved via the property inspector.
- Network endpoints (e.g., ticker proxies) should be configurable where possible; document defaults in code comments.
- Log sparingly in production; guard debug logs with a flag (see `loggingEnabled`).
