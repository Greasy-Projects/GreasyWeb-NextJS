import { Input } from "postcss";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export default createTRPCRouter({
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
      console.log();
      return (await res.json()) as {
        success: boolean;
        speak_url: string;
      };
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
