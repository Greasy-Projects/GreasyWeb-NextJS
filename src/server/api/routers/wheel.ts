import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isManager } from "~/utils/flow";
import { pusher } from "~/utils/pusher";

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
        minimumTipAmount: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.user.findFirst({
        where: { name: input.streamer || ctx.session.user.name },
        select: {
          minimumGiftSubs: input.minimumGiftSubs,
          minimumTipAmount: input.minimumTipAmount,
        },
      });
      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return data;
    }),

  updateMinimumGiftSubs: protectedProcedure
    .input(z.object({ streamer: z.string(), new: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (input.new === 0 || input.new > 20) return;

      const manager = await isManager(
        input.streamer,
        ctx.session.user.name || "",
      );
      if (!manager) return;
      const user = await ctx.prisma.user.findFirst({
        where: {
          name: input.streamer,
        },
        select: {
          id: true,
        },
      });

      await ctx.prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          minimumGiftSubs: input.new,
        },
        select: { minimumGiftSubs: true },
      });
    }),
  updateMinimumTipAmount: protectedProcedure
    .input(z.object({ streamer: z.string(), new: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (input.new === 0 || input.new > 100) return;

      const manager = await isManager(
        input.streamer,
        ctx.session.user.name || "",
      );
      if (!manager) return;
      const user = await ctx.prisma.user.findFirst({
        where: {
          name: input.streamer,
        },
        select: {
          id: true,
        },
      });

      await ctx.prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          minimumTipAmount: input.new,
        },
        select: { minimumTipAmount: true },
      });
    }),
  tipSpin: protectedProcedure
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          minimumTipAmount: true,
        },
      });
      if (input.amount < user?.minimumTipAmount) return;
      void pusher.trigger((ctx.session.user.name ?? "").toLowerCase(), "spin", {
        rand: Math.random(),
      });
    }),
});
