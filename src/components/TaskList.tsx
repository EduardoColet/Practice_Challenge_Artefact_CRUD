"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC, type RouterOutputs } from "~/trpc/client";

type TaskListPage = RouterOutputs["task"]["list"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function TaskList({
  pageSize,
  initialData,
}: {
  pageSize: number;
  initialData: TaskListPage;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: pageSize },
      {
        initialData: { pages: [initialData], pageParams: [null] },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
  );

  const deleteMutation = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.task.list.pathFilter());
      },
    }),
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section>
      {deleteMutation.isSuccess && (
        <div className="alert alert-success">Task deleted.</div>
      )}
      {deleteMutation.isError && (
        <div className="alert alert-error">
          Failed to delete: {deleteMutation.error.message}
        </div>
      )}
      {isError && (
        <div className="alert alert-error">
          Failed to load tasks: {error.message}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="muted" style={{ marginTop: 24 }}>
          No tasks yet. Create the first one!
        </p>
      )}

      {tasks.map((task) => {
        const isDeleting =
          deleteMutation.isPending && deleteMutation.variables?.id === task.id;

        return (
          <article className="card" key={task.id}>
            <div className="row">
              <h3>{task.titulo}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/tasks/${task.id}/edit`}>
                  <button className="btn-ghost">Edit</button>
                </Link>
                <button
                  className="btn-danger"
                  disabled={isDeleting}
                  onClick={() => deleteMutation.mutate({ id: task.id })}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            {task.descricao && <p>{task.descricao}</p>}
            <p className="muted">
              Created on {dateFormatter.format(task.dataCriacao)}
            </p>
          </article>
        );
      })}

      <div ref={sentinelRef} />
      {isFetchingNextPage && <p className="spinner">Loading more...</p>}
      {!hasNextPage && tasks.length > 0 && (
        <p className="spinner">End of list.</p>
      )}
    </section>
  );
}
