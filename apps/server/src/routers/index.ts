import { publicProcedure, router } from "../lib/trpc";
import { characterRouter } from "./characters";
import { chatRouter } from "./chat";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  chat: chatRouter,
  characters: characterRouter,
});
export type AppRouter = typeof appRouter;
