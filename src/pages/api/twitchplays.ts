import type { NextApiRequest, NextApiResponse } from "next";
import { cache } from "~/utils/api";
import { prisma } from "~/server/db";

interface Data {
  name: string;
  inputs: string[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = req.headers.authorization;
    const {
      query: { s: streamer },
    } = req;
    if (!streamer || !token)
      return res.status(400).json({ message: "Bad Request" });

    const data: Data[] = req.body as Data[];

    if (!isValidData(data))
      return res.status(400).json({ message: "Invalid JSON data" });

    const user = await prisma.user.findUnique({
      where: {
        TPToken: token,
      },
      select: {
        name: true,
      },
    });

    if (!user || user?.name?.toLowerCase() !== String(streamer))
      return res.status(401).json({ message: "Unauthorized" });

    cache.set(`twitchplays:${String(streamer)}`, req.body, 80);
    res
      .status(200)
      .json({ message: "TwitchPlays inputs successfully received" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

function isValidData(data: unknown): data is Data[] {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const item of data) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("name" in item) ||
      !("inputs" in item)
    ) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof item.name !== "string" || !Array.isArray(item.inputs)) {
      return false;
    }
  }

  return true;
}
