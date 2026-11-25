export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
}

const globalForDb = globalThis as unknown as { __tasks?: Task[] };

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function seed(): Task[] {
  const now = Date.now();
  const ago = (ms: number) => new Date(now - ms);

  return [
    {
      id: crypto.randomUUID(),
      titulo: "Sample task 1",
      descricao: "Description for sample task 1.",
      dataCriacao: ago(3 * HOUR),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Sample task 2",
      descricao: "Description for sample task 2.",
      dataCriacao: ago(2 * HOUR),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Sample task 3",
      dataCriacao: ago(30 * MINUTE),
    },
  ];
}

export const tasks: Task[] = (globalForDb.__tasks ??= seed());
