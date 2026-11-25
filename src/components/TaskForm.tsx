"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

interface TaskFormProps {
  initial?: { id: string; titulo: string; descricao?: string };
}

export function TaskForm({ initial }: TaskFormProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.titulo ?? "");
  const [description, setDescription] = useState(initial?.descricao ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSuccess = () => {
    void queryClient.invalidateQueries(trpc.task.list.pathFilter());
    router.push("/");
    router.refresh();
  };

  const createMutation = useMutation(trpc.task.create.mutationOptions({ onSuccess }));
  const updateMutation = useMutation(trpc.task.update.mutationOptions({ onSuccess }));
  const mutation = isEdit ? updateMutation : createMutation;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    if (isEdit && initial) {
      updateMutation.mutate({
        id: initial.id,
        titulo: title,
        descricao: description,
      });
    } else {
      createMutation.mutate({ titulo: title, descricao: description });
    }
  };

  return (
    <>
      <div className="row">
        <h1>{isEdit ? "Edit task" : "New task"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Review the case"
        />
        {validationError && <p className="field-error">{validationError}</p>}

        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task details..."
        />

        {mutation.isError && (
          <div className="alert alert-error">{mutation.error.message}</div>
        )}

        <div className="toolbar">
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create task"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => router.push("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
