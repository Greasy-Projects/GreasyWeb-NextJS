import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { cache } from "~/utils/api";
import crypto from "crypto";
export type ServerData = {
  name: string;
  inputs: [string];
};
const dataSchema = z.object({
  name: z.string(),
  inputs: z.string().array(),
});
export const twitchplays = createTRPCRouter({
  set: publicProcedure
    .input(z.object({ data: z.array(dataSchema) }))
    .mutation(({ input }) => {
      console.log(input.data);
      return "received cruncher";
    }),

  get: publicProcedure
    .input(
      z.object({
        streamer: z.string(),
      })
    )
    .query(({ input }) => {
      return cache.get(`twitchplays:${input.streamer}`) || null;
    }),
  getToken: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        TPToken: true,
      },
    });
    return data?.TPToken || null;
  }),
  resetToken: protectedProcedure.mutation(async ({ ctx }) => {
    const hash = crypto.createHash("sha256");
    hash.update(ctx.session.user.id);
    hash.update(String(Date.now()));
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        TPToken: hash.digest("hex"),
      },
      select: {
        id: true,
      },
    });
  }),
});
