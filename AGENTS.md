# Repository Guidelines
This project is a Stream Deck plugin; The docs for the SDK are located at https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/ (and it's sub pages).

## Project Structure & Module Organization
- Source: `com.courcelle.cryptoticker-dev.sdPlugin/` (plugin bundle).
- Core files: `manifest.json`, `index.html`, modular plugin logic under `js/` (`ticker.js` orchestrator plus `canvas-renderer.js`, `settings-manager.js`, `alert-manager.js`, `formatters.js`, `ticker-state.js`), `js/pi.js` (property inspector), `css/`, `images/`.
- Dev preview: `dev/preview.html` and `dev/preview.js` served by the local preview server.
- Tests: `__tests__/` (e.g., `__tests__/ticker.test.js`).

## Build, Test, and Development Commands
- `npm test`: runs Jest unit tests.
- `npm run preview`: starts a local static server and opens `dev/preview.html` to iterate on UI/logic without installing the plugin in Stream Deck.
- `npm run lint`: check JavaScript sources for issues; run after any code change.
- `npm run lint:fix`: auto-fix lint issues when possible; run if `npm run lint` reports violations.
- `npm run format`: format sources with Prettier; run before committing changes that touch code or markup.
- No build step required for development; Stream Deck reads files directly from the `.sdPlugin` folder.

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
