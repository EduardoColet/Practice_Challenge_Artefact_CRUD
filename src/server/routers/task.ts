import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { tasks, type Task } from "../db";

const taskInput = z.object({
  titulo: z
    .string({ error: "Title is required." })
    .trim()
    .min(1, "Title is required."),
  descricao: z.string().trim().optional(),
});

function getTaskOrThrow(id: string): Task {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
  }
  return task;
}

export const taskRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(({ input }) => {
      const sorted = [...tasks].sort(
        (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime(),
      );

      const start = input.cursor
        ? sorted.findIndex((t) => t.id === input.cursor) + 1
        : 0;

      const items = sorted.slice(start, start + input.limit);
      const hasMore = start + input.limit < sorted.length;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getTaskOrThrow(input.id)),

  create: publicProcedure.input(taskInput).mutation(({ input }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao || undefined,
      dataCriacao: new Date(),
    };
    tasks.push(task);
    return task;
  }),

  update: publicProcedure
    .input(taskInput.extend({ id: z.string() }))
    .mutation(({ input }) => {
      const task = getTaskOrThrow(input.id);
      task.titulo = input.titulo;
      task.descricao = input.descricao || undefined;
      return task;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = tasks.findIndex((t) => t.id === input.id);
      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
      }
      const [removed] = tasks.splice(index, 1);
      return removed;
    }),
});
