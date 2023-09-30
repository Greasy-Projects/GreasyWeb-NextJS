import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { env } from "~/env.mjs";
// import { prisma } from "~/server/db";
import { pusher } from "~/utils/pusher";
// Notification request headers
const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase();
const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = "sha256=";

interface Condition {
  broadcaster_user_id: string;
}

interface Event {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  total: number;
}

interface Notification {
  challenge?: string;
  subscription: {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: Condition;
    transport: {
      method: string;
      callback: string;
    };
    created_at: string;
  };
  event?: Event;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    console.log(req.body);
    if (!validateNotification(req.body as Notification))
      return res.status(405).json({ message: "Method not allowed" });

    const message = getHmacMessage(req, JSON.stringify(req.body));
    console.log(message);
    const hmac = HMAC_PREFIX + getHmac(env.TWITCH_CLIENT_SECRET, message); // Signature to compare

    if (verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE] as string)) {
      // Get JSON object from body, so you can process the message.
      const hook = req.body as Notification;
      console.log(hook);
      if (
        MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE] &&
        hook.event
      ) {
        // TODO: Do something with the event's data.
        if (
        hook.subscription.type === "channel.subscription.gift" &&
          hook.event.total >= 3
        ) {
          // const streamer = await prisma.user.findFirst({
          //   where: {
          //     name: hook.event.broadcaster_user_name,
          //   },
          //   select: {
          //     ActiveWheel: true,
          //     Wheels: true,
          //   },
          // });
          // TODO: Get active wheel and pass data to pusher
          await pusher.trigger("greasymac", "spin", {
            rand: Math.random(),
            id: Math.floor(Math.random() * Date.now()).toString(18),
          });
        }
        console.log(`User Name: ${hook.event.user_name}`);
        console.log(`Total: ${hook.event.total}`);

        res.send(204);
      } else if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
        res.status(200).send(hook.challenge);
      } else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
        res.send(204);

        console.log(`${hook.subscription.type} notifications revoked!`);
        console.log(`reason: ${hook.subscription.status}`);
        console.log(
          `condition: ${JSON.stringify(hook.subscription.condition, null, 4)}`,
        );
      } else {
        res.send(204);
        console.log(
          `Unknown message type: ${req.headers[MESSAGE_TYPE] as string}`,
        );
      }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

// Build the message used to get the HMAC.
function getHmacMessage(request: NextApiRequest, body: string): string {
  return (
    (request.headers[TWITCH_MESSAGE_ID] as string) +
    (request.headers[TWITCH_MESSAGE_TIMESTAMP] as string) +
    body
  );
}

// Get the HMAC.
function getHmac(secret: string, message: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

// Verify whether our hash matches the hash that Twitch passed in the header.
function verifyMessage(hmac: string, verifySignature: string): boolean {
  console.log(
    crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature)),
  );
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(verifySignature),
  );
}
function validateCondition(condition: Condition): condition is Condition {
  return (
    typeof condition === "object" &&
    "broadcaster_user_id" in condition &&
    typeof condition.broadcaster_user_id === "string"
  );
}

function validateEvent(event: Event): event is Event {
  return (
    typeof event === "object" &&
    "user_id" in event &&
    typeof event.user_id === "string" &&
    "user_login" in event &&
    typeof event.user_login === "string" &&
    "user_name" in event &&
    typeof event.user_name === "string" &&
    "broadcaster_user_id" in event &&
    typeof event.broadcaster_user_id === "string" &&
    "broadcaster_user_login" in event &&
    typeof event.broadcaster_user_login === "string" &&
    "broadcaster_user_name" in event &&
    typeof event.broadcaster_user_name === "string" &&
    typeof event.total === "number"
  );
}

function validateNotification(
  notification: Notification,
): notification is Notification {
  return (
    typeof notification === "object" &&
    "subscription" in notification &&
    typeof notification.subscription === "object" &&
    "id" in notification.subscription &&
    typeof notification.subscription.id === "string" &&
    "status" in notification.subscription &&
    typeof notification.subscription.status === "string" &&
    "type" in notification.subscription &&
    typeof notification.subscription.type === "string" &&
    "version" in notification.subscription &&
    typeof notification.subscription.version === "string" &&
    "cost" in notification.subscription &&
    typeof notification.subscription.cost === "number" &&
    "condition" in notification.subscription &&
    validateCondition(notification.subscription.condition) &&
    "transport" in notification.subscription &&
    typeof notification.subscription.transport === "object" &&
    "method" in notification.subscription.transport &&
    typeof notification.subscription.transport.method === "string" &&
    "callback" in notification.subscription.transport &&
    typeof notification.subscription.transport.callback === "string" &&
    "created_at" in notification.subscription &&
    typeof notification.subscription.created_at === "string" &&
    (typeof notification.event === "undefined" ||
      (typeof notification.event === "object" &&
        validateEvent(notification.event)))
  );
}
