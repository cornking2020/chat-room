import { streamChat } from "@/lib/chat-langchain";
import { TRPCError } from "@trpc/server";
import z from "zod/v4";
import prisma from "../../prisma";
import { publicProcedure, router } from "../lib/trpc";

export const chatRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.message.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1),
        senderName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.message.create({
        data: {
          content: input.content,
          senderName: input.senderName,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1),
        senderName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.message.update({
        where: { id: input.id },
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.message.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }
    }),

  destroy: publicProcedure.mutation(async () => {
    return await prisma.message.deleteMany();
  }),

  generate: publicProcedure
    .input(
      z.object({
        characterId: z.string(),
      })
    )
    .mutation(async function* ({ input }) {
      yield* streamChat(input.characterId);
    }),
});
