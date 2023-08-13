import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { Inter } from "next/font/google";
import { signIn, signOut, useSession } from "next-auth/react";
import { Suspense, useState } from "react";
import { LoaderPage } from "~/components/loading";
const inter = Inter({ subsets: ["latin"] });

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <>
        <LoaderPage />
      </>
    );
  }
  if (status !== "unauthenticated" && session) {
    return (
      <>
        <Head>
          <title>Manage Account</title>
          <meta property="og:title" content="Manage Account" />
          <meta property="og:description" content="Manage your account." />
          <meta name="theme-color" content="#794ec4" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <style jsx global>{`
          html {
            font-family: ${inter.style.fontFamily};
          }

          .twitchplays_card {
            background: rgba(122, 61, 212, 0.06);
            border-radius: 16px;
            box-shadow: 0 4px 30px 10px rgba(0, 0, 0, 0.045);
            border: 1px solid rgba(122, 61, 212, 0.33);
          }

          .red_button {
            background: rgba(222, 70, 199, 0.08);
            border-radius: 0.6rem;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5.8px);
            -webkit-backdrop-filter: blur(5.8px);
            border: 1px solid rgba(222, 70, 199, 0.33);
            color: #f2659b;
          }
          .green_button {
            background: rgba(98, 238, 199, 0.08);
            border-radius: 0.6rem;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5.8px);
            -webkit-backdrop-filter: blur(5.8px);
            border: 1px solid rgba(98, 238, 173, 0.33);
            color: rgba(98, 238, 173);
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

          #code {
            background: rgba(122, 70, 199, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(193, 157, 251, 0.3);
            border-radius: 4px;
            color: #c19dfb;
            overflow: hidden;
            white-space: nowrap;
          }
        `}</style>
        <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#20113f] to-[#12131c] py-14">
          <div className="container flex max-w-fit flex-col items-center justify-center px-4">
            <div className="twitchplays_card h-auto w-full rounded-xl bg-[#0d1117]/60 py-2 sm:py-4">
              <h1 className="xs:text-5xl w-full select-none bg-gradient-to-br from-[#7d2be1] to-[#9b30ff] bg-clip-text px-5 py-2 pt-4 text-center text-[10vw] font-[900] uppercase leading-tight text-transparent sm:px-12 sm:py-8 sm:text-7xl">
                Account
              </h1>
              <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 sm:mb-4" />
              {/* <Suspense>
                <ManagersComponent />
              </Suspense>
              <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 sm:my-4" /> */}
              <Suspense>
                <TPTokenComponent />
              </Suspense>
              <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 sm:my-4" />
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => {
                    void signOut();
                  }}
                  className="red_button ml-4 flex items-center px-2 py-2 font-bold uppercase"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>Account Center</title>
        <meta property="og:title" content="Account Center" />
        <meta property="og:description" content="Manage your account." />
        <meta name="theme-color" content="#794ec4" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#20113f] to-[#12131c] py-14">
        <div className="container flex max-w-fit flex-col items-center justify-center px-4">
          <div className="twitchplays_card h-auto w-full rounded-xl bg-[#0d1117]/60 py-2 sm:py-4">
            <h1 className="xs:text-5xl w-full select-none bg-gradient-to-br from-[#7d2be1] to-[#9b30ff] bg-clip-text px-5 pb-3 pt-4 text-center text-[10vw] font-[900] uppercase leading-tight text-transparent sm:px-12 sm:pb-5 sm:text-7xl">
              Account
            </h1>
            <hr className="mb-4 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25" />

            <div
              className="mx-3 flex flex-col flex-wrap content-center items-center"
              id="inputs"
            >
              <button
                onClick={() => {
                  void signIn("twitch");
                }}
                className="text-md group relative flex w-full justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 font-medium tracking-tighter text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

function TPTokenComponent() {
  const { data: TPToken, isLoading } = api.twitchplays.getToken.useQuery();
  // TwitchPlays Token
  const utils = api.useContext();
  const [TPTokenCopied, setTPTokenCopied] = useState(true);
  const [TPTokenCopiedHidden, setTPTokenCopiedHidden] = useState(false);
  const [TPTokenResetConfirm, setTPTokenResetConfirm] = useState(false);
  const TPTokenMutation = api.twitchplays.resetToken.useMutation();
  if (isLoading) return <></>;
  return (
    <div
      className="mx-3 flex flex-col flex-wrap content-center items-center"
      id="inputs"
    >
      <strong>TwitchPlays Token</strong>

      <div className="inline-flex">
        {TPToken && (
          <div
            id="code"
            className="flex cursor-pointer justify-center px-2 text-lg sm:text-2xl"
          >
            <span
              className={
                (TPTokenCopiedHidden
                  ? "hidden"
                  : TPTokenCopied
                  ? "opacity-50"
                  : "opacity-100") +
                " absolute align-middle text-purple-300  transition-opacity"
              }
            >
              {TPTokenCopied ? "click to copy" : "copied!"}
            </span>
            <span
              onClick={() => {
                if (TPToken) {
                  void navigator.clipboard.writeText(TPToken);
                  setTPTokenCopied(false);
                  setTimeout(() => setTPTokenCopied(true), 5000);
                }
              }}
              className={
                (TPTokenCopiedHidden ? "text-transparent" : "") +
                " select-none text-[clamp(0.1rem,_3.5vw,_1.2rem)] blur-sm"
              }
            >
              5eed18200857a70d1fb267d6b0959
            </span>
          </div>
        )}
        <button
          onClick={() => {
            console.log(TPTokenResetConfirm);
            if (
              TPToken &&
              !TPTokenResetConfirm &&
              !TPTokenCopiedHidden &&
              !TPTokenMutation.isSuccess
            ) {
              setTPTokenResetConfirm(true);
              setTimeout(() => setTPTokenResetConfirm(false), 5000);
            } else if (
              (TPTokenResetConfirm &&
                !TPTokenCopiedHidden &&
                !TPTokenMutation.isSuccess) ||
              !TPToken
            ) {
              setTPTokenCopiedHidden(true);
              void TPTokenMutation.mutateAsync().then(
                () =>
                  void utils.twitchplays.getToken.invalidate().then(() => {
                    setTPTokenCopiedHidden(false);
                    setTimeout(() => {
                      TPTokenMutation.reset();
                    }, 10000);
                  })
              );
            }
          }}
          className={
            (TPToken ? "red_button" : "green_button") +
            " ml-2 items-center px-2 text-xs font-bold uppercase sm:text-lg"
          }
        >
          {TPToken
            ? TPTokenCopiedHidden
              ? "wait"
              : TPTokenMutation.isSuccess
              ? "done!"
              : TPTokenResetConfirm
              ? "sure?"
              : "reset"
            : "generate"}
        </button>
      </div>
    </div>
  );
}

export default Home;
