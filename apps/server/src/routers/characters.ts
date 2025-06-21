import { TRPCError } from "@trpc/server";
import z from "zod/v4";
import prisma from "../../prisma";
import { publicProcedure, router } from "../lib/trpc";

export const characterRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.character.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        systemPrompt: z.string().min(1),
        ollamaUrl: z.string().min(1),
        ollamaApiKey: z.string().min(1).nullable(),
        ollamaModel: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.character.create({
        data: {
          name: input.name,
          systemPrompt: input.systemPrompt,
          ollamaUrl: input.ollamaUrl,
          ollamaApiKey: input.ollamaApiKey,
          ollamaModel: input.ollamaModel,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        systemPrompt: z.string().min(1),
        ollamaUrl: z.string().min(1),
        ollamaApiKey: z.string().min(1).nullable(),
        ollamaModel: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.character.update({
        where: { id: input.id },
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.character.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Character not found",
        });
      }
    }),
});
