import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Suspense, useState, type ChangeEvent } from "react";
import "react-indiana-drag-scroll/dist/style.css";
import { LoaderPage } from "~/components/loading";
import { LoginPage } from "~/components/login";
import { ManagersComponent } from "~/components/managers";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const router = useRouter();
  const streamer = String(router.query.streamer);
  const { data: session, status } = useSession();
  const manualSpin = api.util.manualSpin.useMutation();
  const { data: managers, isLoading: isGettingManagers } =
    api.user.getManagers.useQuery({
      streamer: streamer,
    });

  if (status === "loading" || isGettingManagers) {
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
  } else if (session != undefined && managers !== undefined) {
    if (
      streamer.toLowerCase() !== session.user.name?.toLowerCase() &&
      !managers?.managers?.data?.some(
        (i) => i.user_name.toLowerCase() === session.user.name?.toLowerCase(),
      )
    )
      void router.replace(
        `/wheel/${session.user.name?.toLowerCase() ?? ""}/settings`,
      );

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
                fallback={<MinimumAmountFallback label="Minimum Gifted Subs" />}
              >
                <MinimumSetting
                  streamer={streamer}
                  settingType="minimumGiftSubs"
                  label="Minimum Gifted Subs"
                  limit={20}
                />
              </Suspense>
              <Suspense
                fallback={<MinimumAmountFallback label="Minimum Tip Amount" />}
              >
                <MinimumSetting
                  streamer={streamer}
                  settingType="minimumTipAmount"
                  label="Minimum Tip Amount"
                  limit={300}
                  floatValue
                />
              </Suspense>
            </div>
          </div>
        </main>
      </>
    );
  }
};

function MinimumSetting({
  streamer,
  settingType,
  label,
  limit,
  floatValue = false,
}: {
  streamer: string;
  settingType: "minimumGiftSubs" | "minimumTipAmount";
  label: string;
  limit: number;
  floatValue?: boolean;
}): JSX.Element {
  const [settings, queryFunction] = api.wheel.getSelect.useSuspenseQuery({
    streamer: streamer,
    [settingType]: true,
  });
  const updateMutation =
    settingType === "minimumGiftSubs"
      ? api.wheel.updateMinimumGiftSubs.useMutation()
      : api.wheel.updateMinimumTipAmount.useMutation();
  const [input, setInput] = useState<number | null>(null);

  const inputId = `${settingType}Input`;

  return (
    <div className="mx-3 flex flex-col flex-wrap content-center items-center">
      <strong>{label}</strong>
      <div className="flex w-full items-center justify-center">
        <input
          id={inputId}
          type="number"
          value={input !== null ? String(input) : ""}
          onInput={(d: ChangeEvent<HTMLInputElement>) => {
            const t = floatValue
              ? parseFloat(d.currentTarget.value)
              : parseInt(d.currentTarget.value);
            if (t > limit) {
              setInput(limit);
            } else if (t <= 0) {
              setInput(null);
            } else {
              setInput(t);
            }
          }}
          placeholder={String(settings[settingType])}
          className="code mx-2 w-fit max-w-[5rem] pl-1 sm:pl-2"
        />
        <button
          onClick={() => {
            if (
              input === settings[settingType] ||
              input === 0 ||
              input === null
            )
              return;
            void updateMutation
              .mutateAsync({
                streamer: streamer,
                new: input,
              })
              .then(() => {
                updateMutation.reset();
                void queryFunction.refetch().then(() => {
                  setInput(null);
                });
              });
          }}
          className={
            (input === settings[settingType] || input === 0 || input === null
              ? "cursor-not-allowed opacity-50"
              : "") + " green mr-2 !rounded-md text-base "
          }
        >
          UPDATE
        </button>
      </div>
    </div>
  );
}

function MinimumAmountFallback({ label }: { label: string }): JSX.Element {
  return (
    <div className="mx-3 flex flex-col flex-wrap content-center items-center">
      <strong>{label}</strong>
      <div className="flex w-full items-center justify-center">
        <div className="code mx-2 w-[5rem] text-center opacity-25">
          loading...
        </div>
        <button className="green mr-2 cursor-not-allowed !rounded-md text-base opacity-50">
          UPDATE
        </button>
      </div>
    </div>
  );
}

export default Home;
