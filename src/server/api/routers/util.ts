import { Input } from "postcss";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { pusher } from "~/utils/pusher";

export default createTRPCRouter({
  //TODO: secure with ctx
  manualSpin: protectedProcedure
    .input(
      z.object({
        streamer: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      void pusher.trigger("greasymac", "spin", { rand: Math.random() });
    }),
  tts: publicProcedure
    .input(
      z.object({
        text: z.string(),
        voice: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const res = await fetch("https://streamlabs.com/polly/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.text,
          voice: input.voice,
        }),
      });
      if (!res.ok) {
        console.log(await res.json());
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong TTS",
        });
      } else {
        return (await res.json()) as {
          success: boolean;
          speak_url: string;
        };
      }
    }),
  pfp: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const res = ctx.prisma.user.findFirst({
        where: {
          name: input.name,
        },
        select: {
          image: true,
        },
      });
      return res;
    }),
});
