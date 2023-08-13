import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { pusher } from "~/utils/pusher";
import { env } from "~/env.mjs";
import { deleteUserProviderAccount, hasExpired, isManager } from "~/utils/flow";

export default createTRPCRouter({
  // isManager: protectedProcedure
  //   .input(
  //     z.object({
  //       streamer: z.string(),
  //       potentialManager: z.string().optional(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const data = await ctx.prisma.user.findFirst({
  //       where: { name: input.streamer },
  //       select: { managers: true },
  //     });
  //     const managers =
  //       (data as unknown as {
  //         managers: {
  //           data: [
  //             {
  //               user_id: string;
  //               user_name: string;
  //               created_at: string;
  //             }
  //           ];
  //         };
  //       }) || null;

  //     if (
  //       input.streamer.toLowerCase() ===
  //         input.potentialManager?.toLowerCase() ||
  //       ctx.session.user.name?.toLowerCase() ||
  //       managers?.managers.data.some(
  //         (i) =>
  //           i.user_name.toLowerCase() ===
  //             input.potentialManager?.toLowerCase() ||
  //           ctx.session.user.name?.toLowerCase()
  //       )
  //     )
  //       return true;
  //     return false;
  //   }),
  setManagers: protectedProcedure.mutation(async ({ ctx }) => {
    const account = await ctx.prisma.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "twitch",
      },
      select: {
        id: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
        scope: true,
      },
    });
    if (
      !account?.scope?.includes("channel:read:editors") ||
      hasExpired(account?.expires_at || 0)
    ) {
      await deleteUserProviderAccount(account?.id || "");
      return "signin";
    }
    if (
      account?.providerAccountId === undefined ||
      account?.access_token === null ||
      account?.refresh_token === null ||
      account?.expires_at === null
    )
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to fetch data from Twitch API",
      });

    const res = await fetch(
      `https://api.twitch.tv/helix/channels/editors?${new URLSearchParams({
        broadcaster_id: account.providerAccountId,
      }).toString()}`,
      {
        headers: {
          "Client-Id": env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${account?.access_token}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Failed to fetch data from Twitch API",
      });
    }
    const data = (await res.json()) as {
      data: [
        {
          user_id: string;
          user_name: string;
          created_at: string;
        }
      ];
    };
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        managers: data,
      },
    });
  }),
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
              }
            ];
          };
        }) || null
      );
    }),
  //TODO: secure with ctx
  manualSpin: protectedProcedure
    .input(
      z.object({
        streamer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await isManager(input.streamer, ctx.session.user.name))) return;
      void pusher.trigger(input.streamer.toLowerCase(), "spin", {
        rand: Math.random(),
      });
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

