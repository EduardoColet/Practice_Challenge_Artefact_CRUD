import { notFound } from "next/navigation";
import { getServerCaller } from "~/trpc/server";
import { TaskForm } from "~/components/TaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caller = await getServerCaller();

  try {
    const task = await caller.task.byId({ id });
    return (
      <TaskForm
        initial={{
          id: task.id,
          titulo: task.titulo,
          descricao: task.descricao,
        }}
      />
    );
  } catch {
    notFound();
  }
}
