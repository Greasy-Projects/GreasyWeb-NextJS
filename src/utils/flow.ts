import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

export async function isManager(
  streamer: string,
  potentialManager: string | null | undefined
): Promise<boolean> {
  const data = await prisma.user.findFirst({
    where: { name: streamer },
    select: { managers: true },
  });
  const managers =
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
    }) || null;

  if (
    streamer.toLowerCase() === potentialManager?.toLowerCase() ||
    managers?.managers.data.some(
      (i) => i.user_name.toLowerCase() === potentialManager?.toLowerCase()
    )
  )
    return true;
  return false;
}

export async function deleteUserProviderAccount(id: string) {
  await prisma.account.delete({
    where: { id: id },
  });
}

export async function refreshUserBearer(
  refresh_token: string
): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token: refresh_token,
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  console.log(await res.json());
  if (!res.ok) {
    throw new Error("TODO: refreshUserBearer failed");
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    scope: string[];
    token_type: string;
  };
  console.log(data);

  if ("access_token" in data) {
    return data.access_token;
  } else {
    throw new Error("Access token not found in response.");
  }
}

export async function getUserBearer({
  access_token,
  refresh_token,
  expires_at,
}: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}): Promise<string> {
  if (hasExpired(expires_at))
    access_token = await refreshUserBearer(refresh_token);
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      code: access_token,
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      redirect_uri: env.NEXTAUTH_URL,
      grant_type: "authorization_code",
    }),
  });

  const data = (await res.json()) as { access_token: string };

  if ("access_token" in data) {
    return data.access_token;
  } else {
    throw new Error("Access token not found in response.");
  }
}
export async function getClientBearer(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?${new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }).toString()}`,
    { method: "POST" }
  );

  const data = (await res.json()) as { access_token: string };

  if ("access_token" in data) {
    return data.access_token;
  } else {
    throw new Error("Access token not found in response.");
  }
}

export function hasExpired(unixTimestamp: number): boolean {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  console.log(currentTimestamp, unixTimestamp);
  return unixTimestamp < currentTimestamp;
}
