import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/utils/api";

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

  get: publicProcedure.query(() => {
    return cache.get("twitchplays");
  }),
});
