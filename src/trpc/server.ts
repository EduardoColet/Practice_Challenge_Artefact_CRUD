import "server-only";

import { appRouter } from "~/server/root";
import { createTRPCContext } from "~/server/trpc";

export async function getServerCaller() {
  return appRouter.createCaller(await createTRPCContext());
}
