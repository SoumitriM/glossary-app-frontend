# Glossary UI

React/Vite frontend for managing bilingual glossary entries.

## Requirements

- Node.js 20+
- npm
- Glossary backend running locally for development

## Setup

```bash
npm install
```

Local secrets belong in `.env`. Keep `.env` untracked and commit only safe examples such as `.env.example`.

## Development

```bash
npm run dev
```

In development, the API base URL is:

```text
http://localhost:3001/api/glossary
```

## Production Build

```bash
npm run build
```

Production builds use the relative API path:

```text
/api/glossary
```

This behavior is controlled in `src/config.js` with `import.meta.env.DEV`, so you do not need to switch URLs manually before pushing to git.

## Useful Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # create production build
npm run preview  # preview production build locally
npm run lint     # run ESLint
```

## Project Structure

```text
src/
  apiClient.js          shared API wrapper and auth handling
  config.js             API endpoint configuration
  Glossary.jsx          main glossary screen and data fetching
  Table.jsx             glossary table, sorting, selection, edit/delete/hide actions
  EditDialog.jsx        add/edit entry dialog
  MultiFieldEditor.jsx  language-specific word/variant editor
  AddVariantDialog.jsx  add/edit variant dialog
  Login.jsx             login/register screen
```

## Repo Hygiene

Do not commit:

- `.env` files
- `.vite`
- `dist`
- generated build backups
- archived experimental source copies under `src/archive`

If old generated or archive files are still tracked by git, untrack them with:

```bash
git rm --cached .env
git rm --cached -r old_dist_backup src/archive
```
