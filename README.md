# Task Manager

Task manager built with Next.js 15 (App Router) and tRPC. Data lives in memory
on the server, with no database. Restarting the server resets it back to the
sample tasks.

## Stack

- Next.js 15 + React 19
- tRPC v11 + React Query v5
- Zod (validation) and superjson (serializes Date)
- TypeScript

## Running

Requires Node 18.18+.

```bash
npm install
npm run dev
```

App at http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run typecheck`.

## Features

- List (`/`): server-rendered (SSR), with infinite scroll and inline delete with
  success/error feedback.
- Create (`/tasks/new`) and edit (`/tasks/[id]/edit`): same form, with required
  title validation. Editing a non-existent id returns 404.
- Error handling: creating without a title is blocked on both the client and the
  server; updating or deleting a non-existent task returns NOT_FOUND.

## Model

Field names follow the ones requested in the brief (in pt-br):

- `id`: uuid
- `titulo`: required
- `descricao`: optional
- `dataCriacao`: timestamp

## Structure

```
src/
  server/            tRPC backend
    db.ts            in-memory store
    trpc.ts          tRPC init
    routers/task.ts  CRUD
    root.ts          appRouter
  trpc/              client/server glue
    client.ts        typed hooks
    Provider.tsx     React Query + tRPC
    server.ts        caller used for SSR
  app/
    api/trpc/...      HTTP handler
    page.tsx          list (SSR)
    tasks/new         create
    tasks/[id]/edit   edit
  components/        TaskList and TaskForm
```

## Notes

- SSR: the list page calls the procedure directly on the server
  (`appRouter.createCaller`) and passes the result as `initialData`, so the HTML
  already ships with the tasks.
- The list is cursor-paginated, consumed by `useInfiniteQuery`.
- Sample data is fictitious.
