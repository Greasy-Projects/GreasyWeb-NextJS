import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { env } from "~/env.mjs";
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
  followed_at: string;
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
  event: Event;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.method);

  if (req.method === "POST") {
    const message = getHmacMessage(req, JSON.stringify(req.body));
    const hmac = HMAC_PREFIX + getHmac(env.TWITCH_CLIENT_SECRET, message); // Signature to compare

    if (verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE] as string)) {
      console.log("signatures match");

      // Get JSON object from body, so you can process the message.
      const hook = req.body as Notification;
      if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
        // TODO: Do something with the event's data.

        console.log(`Event type: ${hook.subscription.type}`);
        console.log(`User ID: ${hook.event.user_id}`);
        console.log(`User Login: ${hook.event.user_login}`);
        console.log(`User Name: ${hook.event.user_name}`);
        console.log(`Followed At: ${hook.event.followed_at}`);
        // ... more properties if needed

        res.send(204);
      } else if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
        console.log("yes", hook.challenge);
        res.status(200).send(hook.challenge);
      } else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
        res.send(204);

        console.log(`${hook.subscription.type} notifications revoked!`);
        console.log(`reason: ${hook.subscription.status}`);
        console.log(
          `condition: ${JSON.stringify(hook.subscription.condition, null, 4)}`
        );
      } else {
        res.send(204);
        console.log(
          `Unknown message type: ${req.headers[MESSAGE_TYPE] as string}`
        );
      }
    } else {
      res.send(403);
    }
  } else {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendData = (data: string) => {
      res.write(`data: ${data}\n\n`);
    };

    // Simulate sending an event every 3 seconds
    const interval = setInterval(() => {
      const eventData = {
        event: "custom-event",
        data: "Hello, client!",
      };
      sendData(JSON.stringify(eventData));
    }, 3000);

    // Clean up on client disconnect
    res.on("close", () => {
      clearInterval(interval);
      res.end();
    });
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
    crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature))
  );
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(verifySignature)
  );
}
