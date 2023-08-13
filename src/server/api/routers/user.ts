import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
export type ServerData = {
  name: string;
  inputs: [string];
};

export default createTRPCRouter({
  getSelect: protectedProcedure
    .input(
      z.object({
        streamer: z.string().optional(),
        minimumGiftSubs: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          minimumGiftSubs: input.minimumGiftSubs,
        },
      });
      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return data;
    }),
  getMinimumGiftSubs: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {},
    });
    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }
    return data;
  }),
  updateMinimumGiftSubs: protectedProcedure
    .input(z.object({ new: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          minimumGiftSubs: input.new,
        },
        select: { minimumGiftSubs: true },
      });
    }),
});
