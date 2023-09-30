import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoginPage } from "~/components/login";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";

interface StreamElementsWebsocketWidgetSchema {
  _id: string;
  activityId: string;

  channel: string;

  type: "cheer" | "follow" | "host" | "raid" | "subscriber" | "tip";

  provider: "twitch" | "youtube" | "facebook";
  flagged: boolean;
  data: {
    tipId?: string;

    username: string;

    providerId?: string;

    displayName: string;

    amount: number;

    streak?: number;

    tier?: "1000" | "2000" | "3000" | "prime";

    currency?: string;

    message: string;
    quantity?: number;

    items: unknown[];

    avatar: string;
  };

  createdAt: string;

  updatedAt: string;
}

interface ServerToClientEvents {
  noArg: () => void;
  authenticated: (data: { channelId: string }) => void;
  event: (data: StreamElementsWebsocketWidgetSchema) => void;
  unauthorized: (err: Error) => void;
}

interface ClientToServerEvents {
  authenticate: (arg: { method: "jwt"; token: string }) => void;
}

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const tipSpin = api.wheel.tipSpin.useMutation();
  const getSEJWT = api.user.getSEJWT.useQuery();
  const SEJWT = getSEJWT.data;
  const [connected, setConnected] = useState(false);
  const [authorized, setAuthorized] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [username, setUsername] = useState("");

  let inactivityTimer = setTimeout(() => {
    // Set the page to be invisible after 10 seconds of inactivity
    setPageVisible(false);
  }, 10000);
  useEffect(() => {
    const handleInteraction = () => {
      clearTimeout(inactivityTimer);
      setPageVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      inactivityTimer = setTimeout(() => {
        setPageVisible(false);
      }, 10000);
    };

    document.addEventListener("mousemove", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("mousemove", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (SEJWT == undefined) return;
    const jwt = String(SEJWT);
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      "https://realtime.streamelements.com",
      {
        transports: ["websocket"],
      },
    );
    socket.on("unauthorized", onUnauthorized);
    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);
    socket.on("authenticated", onAuthenticated);

    socket.on("event", (data) => {
      if (data.provider !== "twitch" || data.type !== "tip") return;
      tipSpin.mutate({ amount: data.data.amount, id: data.activityId });
      console.log("event", data);
    });

    function onConnect() {
      // setConnected(true);
      console.log("Successfully connected to the websocket");
      socket.emit("authenticate", { method: "jwt", token: jwt });
    }

    function onDisconnect() {
      setConnected(false);
      console.log("Disconnected from websocket");
    }

    async function onAuthenticated(data: { channelId: string }) {
      setConnected(true);
      setAuthorized(true);

      console.log(data);
      const { channelId } = data;
      const url = "https://api.streamelements.com/kappa/v2/channels/me";
      const options = {
        method: "GET",
        headers: {
          Accept: "application/json; charset=utf-8",
          Authorization: `Bearer ${jwt}`,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = (await response.json()) as unknown as { username: string };
        console.log(data);
        setUsername(data.username);
      } catch (error) {
        console.error(error);
      }
      console.log(`Successfully connected to channel ${channelId}`);
    }
    function onUnauthorized(err: Error) {
      setAuthorized(false);
      console.error(err);
    }

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SEJWT]);
  if (status === "loading") {
    return <></>;
  }
  if (status == "unauthenticated") {
    return (
      <>
        <LoginPage title="SE tipping integration" />
      </>
    );
  } else if (session != undefined) {
    return (
      <>
        <main
          className={`flex min-h-screen justify-center !bg-transparent pt-3 transition-opacity ${
            pageVisible ? "" : "opacity-0"
          }`}
        >
          <section className="flex-col bg-transparent !shadow-none">
            <div className="container mx-auto mb-1 !bg-transparent !shadow-none">
              {!authorized && (
                <span className={"red card !bg-transparent !shadow-none"}>
                  unable to authenticate
                </span>
              )}
            </div>
            <div className="container mx-auto !bg-transparent">
              {authorized && (
                <span
                  className={
                    (connected ? "green" : "red") +
                    " card !bg-transparent !shadow-none"
                  }
                >
                  {username.length > 0 && `${username} ::`}{" "}
                  {!connected && "not"} connected
                </span>
              )}
            </div>
          </section>
        </main>
      </>
    );
  }
};

export default Home;
