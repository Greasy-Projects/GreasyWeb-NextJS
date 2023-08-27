import { type NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { api } from "~/utils/api";
import { LoaderPage } from "~/components/loading";
import { LoginPage } from "~/components/login";
import { useSession, signIn } from "next-auth/react";
import { type ChangeEvent, useState, Suspense } from "react";
import CachedIcon from "@mui/icons-material/Cached";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";

const Home: NextPage = () => {
  const router = useRouter();
  const streamer = String(router.query.streamer);
  const { data: session, status } = useSession();
  const manualSpin = api.util.manualSpin.useMutation();
  const { data: managers } = api.util.getManagers.useQuery({
    streamer: streamer,
  });
  console.log(status);
  if (status === "loading") {
    return (
      <>
        <LoaderPage />
      </>
    );
  }
  if (status == "unauthenticated") {
    return (
      <>
        <LoginPage title="sub wheel" />
      </>
    );
  } else if (session != undefined) {
    if (
      streamer.toLowerCase() !== session.user.name?.toLowerCase() &&
      !managers?.managers?.data?.some(
        (i) => i.user_name.toLowerCase() === session.user.name?.toLowerCase(),
      )
    )
      return "not allowed";

    return (
      <>
        <Head>
          <title>Configure Wheel</title>
          <meta property="og:title" content="Configure Wheel" />
          <meta name="theme-color" content="#794ec4" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <style jsx global>{`
          .twitchplays_card {
            background: rgba(122, 61, 212, 0.06);
            border-radius: 16px;
            box-shadow: 0 4px 30px 10px rgba(0, 0, 0, 0.045);
            border: 1px solid rgba(122, 61, 212, 0.33);
          }

          #inputs h3 {
            font-size: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
          }

          #inputs ul {
            list-style-type: disc;
            padding-left: 20px;
            margin-bottom: 2px;
          }

          strong {
            font-size: 1.4rem;
            font-weight: bold;
            color: #cc7eff;
            text-transform: capitalize;
          }

          @media (max-width: 640px) {
            strong {
              font-size: clamp(1rem, 4.5vw, 1.4rem);
            }
          }

          #inputs code {
            background: rgba(122, 70, 199, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(193, 157, 251, 0.3);
            padding: 1.5px 4px;
            border-radius: 4px;
            color: #c19dfb;
            font-size: 1.1rem;
            margin-right: 0.3rem;
            margin-bottom: 0.3rem;
            list-style: none;
            display: inline-block;
            word-break: break-all;
          }
        `}</style>
        <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#20113f] to-[#12131c] py-14">
          <div className="container flex max-w-fit flex-col items-center justify-center px-4">
            <div
              className={
                (streamer.toLowerCase() !== session.user.name?.toLowerCase()
                  ? "opacity-40"
                  : "opacity-90") +
                " green card te self-start !rounded-b-none !border-purple-500/50 "
              }
            >
              <h1 className="strong !text-sm !uppercase">{streamer}</h1>
            </div>
            <div className="twitchplays_card flex h-auto w-full flex-col rounded-xl !rounded-tl-none bg-[#0d1117]/60 py-2 ">
              <button
                onClick={() => {
                  manualSpin.mutate({
                    streamer: String(streamer),
                  });
                }}
                className={
                  "green mx-5 items-center px-2 text-lg font-bold uppercase"
                }
              >
                manual spin
              </button>
              <Suspense>
                <ManagersComponent
                  streamer={streamer}
                  user={session.user.name || ""}
                />
              </Suspense>
              <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25" />
              <Suspense
                fallback={
                  <div className="mx-3 flex flex-col flex-wrap content-center items-center">
                    <strong>Minimum Subs</strong>
                    <div className="flex w-full items-center justify-center">
                      <div className="code mx-2 w-[5rem] text-center opacity-25">
                        loading...
                      </div>

                      <button
                        className={
                          "green mr-2 cursor-not-allowed !rounded-md text-base opacity-50 "
                        }
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                }
              >
                <MinimumGiftSubs streamer={streamer} />
              </Suspense>
            </div>
          </div>
        </main>
      </>
    );
  }
};

function ManagersComponent({
  streamer,
  user,
}: {
  streamer: string;
  user: string;
}): JSX.Element {
  const setManagersMutation = api.util.setManagers.useMutation();
  const [managers, managersQuery] = api.util.getManagers.useSuspenseQuery({
    streamer: streamer,
  });
  if (!managers.managers.data) return <></>;
  streamer = streamer.toLowerCase();
  user = user.toLowerCase();
  return (
    <>
      <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25" />

      <div className="mx-3 flex flex-col items-center">
        <strong>Managers</strong>
        <div className="flex w-full items-center justify-center overflow-hidden">
          <style jsx>{`
            ::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <ScrollContainer className="scroll-container code relative flex w-52 space-x-2 !overflow-x-scroll p-1">
            {managers?.managers?.data.map((d, i) => {
              return (
                <code
                  key={i}
                  className={"green code flex-shrink-0 px-1 py-0 text-base"}
                >
                  {d.user_name}
                </code>
              );
            })}
          </ScrollContainer>
          <button
            onClick={() => {
              if (streamer !== user) return;
              void managersQuery.remove();
              void setManagersMutation.mutateAsync().then((d) => {
                if (d === "signin") return signIn("twitch");
                void managersQuery.refetch();
              });
            }}
            title="Refresh Managers"
            className={(streamer !== user ? "hidden" : "") + " green ml-2 p-1"}
          >
            <CachedIcon />
          </button>
        </div>
      </div>
    </>
  );
}

function MinimumGiftSubs({ streamer }: { streamer: string }): JSX.Element {
  const MinimumGiftSubsMutation = api.wheel.updateMinimumGiftSubs.useMutation();
  const [settings, MinimumGiftSubsQuery] = api.wheel.getSelect.useSuspenseQuery(
    {
      streamer: streamer,
      minimumGiftSubs: true,
    },
  );
  const [input, setInput] = useState<number | null>(
    settings?.minimumGiftSubs as number,
  );
  return (
    <div className="mx-3 flex flex-col flex-wrap content-center items-center">
      <strong>Minimum Subs</strong>
      <div className="flex w-full items-center justify-center">
        {MinimumGiftSubsQuery.isLoading ? (
          <div className="code mx-2 w-[5rem] text-center opacity-25">
            loading...
          </div>
        ) : (
          <input
            id="MinimumGiftSubs"
            type="number"
            onInput={(d: ChangeEvent<HTMLInputElement>) => {
              const t = Number(d.currentTarget.value);
              d.target.value = parseInt(d.currentTarget.value).toString();
              if (t > 10) d.target.value = "10";
              if (t <= 0) {
                setInput(null);
                d.target.value = "null";
              } else setInput(parseInt(d.target.value));
            }}
            placeholder={String(settings?.minimumGiftSubs)}
            className="code mx-2 w-fit max-w-[5rem] pl-1 sm:pl-2"
          />
        )}
        <button
          onClick={() => {
            if (
              input == settings?.minimumGiftSubs ||
              input == 0 ||
              input === null
            )
              return;
            void MinimumGiftSubsMutation.mutateAsync({
              streamer: streamer,
              new: input,
            }).then(() => {
              MinimumGiftSubsMutation.reset();
              void MinimumGiftSubsQuery.refetch().then(() => {
                const input = document.getElementById(
                  "MinimumGiftSubs",
                ) as HTMLInputElement | null;
                if (input != null && input.value) input.value = "null";
              });
            });
          }}
          className={
            (input == settings?.minimumGiftSubs || input === 0 || input === null
              ? "cursor-not-allowed opacity-50"
              : "") +
            (input === 0 ? " red" : " green") +
            " mr-2 !rounded-md text-base "
          }
        >
          UPDATE
        </button>
      </div>
    </div>
  );
}

export default Home;

