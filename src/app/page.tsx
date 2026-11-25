import Link from "next/link";
import { getServerCaller } from "~/trpc/server";
import { TaskList } from "~/components/TaskList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function HomePage() {
  const caller = await getServerCaller();
  const firstPage = await caller.task.list({ limit: PAGE_SIZE });

  return (
    <>
      <div className="row">
        <div>
          <h1>Tasks</h1>
          <p className="muted">Next.js 15 + tRPC, in-memory data</p>
        </div>
        <Link href="/tasks/new">
          <button>+ New task</button>
        </Link>
      </div>

      <TaskList pageSize={PAGE_SIZE} initialData={firstPage} />
    </>
  );
}
