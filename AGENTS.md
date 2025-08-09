# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/com.courcelle.cryptoticker-dev.sdPlugin/` (plugin bundle).
- Core files: `manifest.json`, `index.html`, `js/ticker.js` (plugin logic), `js/pi.js` (property inspector), `css/`, `images/`.
- Dev preview: `dev/preview.html` and `dev/preview.js` served by the local preview server.
- Tests: `__tests__/` (e.g., `__tests__/ticker.test.js`).

## Build, Test, and Development Commands
- `npm test`: runs Jest unit tests.
- `npm run preview`: starts a local static server and opens `dev/preview.html` to iterate on UI/logic without installing the plugin in Stream Deck.
- No build step required for development; Stream Deck reads files directly from the `.sdPlugin` folder.

## Coding Style & Naming Conventions
- Indentation: 4 spaces. Quotes: double quotes in JavaScript and HTML.
- JavaScript: prefer small, focused modules; functions and variables in `lowerCamelCase`.
- Files: keep existing naming (e.g., `ticker.js`, `pi.js`); assets under `images/`, styles under `css/`.
- Keep code and DOM IDs readable and descriptive; avoid abbreviations.

## Testing Guidelines
- Framework: Jest (configured via `package.json`).
- Location: place tests in `__tests__/` using `*.test.js` naming.
- Scope: focus on deterministic logic (formatting, parsing, state machines). Avoid coupling tests to external services or Stream Deck runtime.
- Run: `npm test` locally before submitting.

## Commit & Pull Request Guidelines
- Commits: use clear, imperative messages (e.g., "Fix preview scaling"). Conventional Commits (e.g., `feat:`, `fix:`) are welcome but not required; keep history tidy.
- PRs: include a concise description, screenshots/GIFs for UI changes (Stream Deck key and PI), testing steps, and linked issues.
- Keep changes scoped; avoid unrelated refactors. Describe any behavior or config changes in the PR.

## Security & Configuration Tips
- Do not hardcode secrets or tokens; prefer Stream Deck settings saved via the property inspector.
- Network endpoints (e.g., ticker proxies) should be configurable where possible; document defaults in code comments.
- Log sparingly in production; guard debug logs with a flag (see `loggingEnabled`).
