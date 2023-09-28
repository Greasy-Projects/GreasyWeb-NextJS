import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
export type ServerData = {
  name: string;
  inputs: [string];
};

export default createTRPCRouter({
  getManagers: protectedProcedure
    .input(z.object({ streamer: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.user.findFirst({
        where: {
          name: input.streamer || ctx.session.user.name,
        },
        select: {
          managers: true,
        },
      });
      return (
        (data as unknown as {
          managers: {
            data: [
              {
                user_id: string;
                user_name: string;
                created_at: string;
              },
            ];
          };
        }) || null
      );
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
  setSEJWT: protectedProcedure
    .input(z.object({ new: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          SEJWT: input.new,
        },
        select: { name: true },
      });
    }),
  getSEJWT: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        SEJWT: true,
      },
    });
    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }
    return (data?.SEJWT as string) || null;
  }),
});
