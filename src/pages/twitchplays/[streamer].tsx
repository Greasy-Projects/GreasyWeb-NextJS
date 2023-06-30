import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

interface Data {
  name: string;
  inputs: string[];
}
const Home: NextPage = () => {
  const router = useRouter();
  const streamer = router.query.streamer;
  const utils = api.useContext();

  const { data } = api.twitchplays.get.useQuery<Data[]>({
    streamer: String(streamer),
  });

  useEffect(() => {
    if (!data)
      setTimeout(() => {
        void utils.twitchplays.get.invalidate();
      }, 5000);
  }, [data, utils]);

  return (
    <>
      <Head>
        <title>TwitchPlays</title>
        <meta property="og:title" content="TwitchPlays" />
        <meta
          property="og:description"
          content="View the inputs of the current Twitch Plays game."
        />
        <meta name="theme-color" content="#794ec4" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

        .twitchplays_button {
          background: rgba(122, 70, 199, 0.08);
          border-radius: 10px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5.8px);
          -webkit-backdrop-filter: blur(5.8px);
          border: 1px solid rgba(122, 70, 199, 0.33);
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

        #inputs strong {
          font-size: 1.4rem;
          font-weight: bold;
          color: #cc7eff;
          text-transform: capitalize;
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
            <h1 className=" w-full select-none bg-gradient-to-br from-[#7d2be1] to-[#9b30ff] bg-clip-text px-5 py-2 pt-4 text-center text-[10vw] font-[900] uppercase leading-tight text-transparent sm:px-12 sm:py-8 md:text-7xl">
              twitch plays
            </h1>
            <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 sm:mb-4" />

            {data ? (
              <div
                className="mx-auto flex-wrap content-center items-center justify-center sm:flex sm:flex-col"
                id="inputs"
              >
                {data?.map((input: Data) => {
                  return (
                    <>
                      <ul key={input.name}>
                        <strong>{input.name}:</strong>
                        <br className="sm:hidden" />{" "}
                        {input.inputs.map((input) => {
                          return (
                            <>
                              <code>{input}</code>
                            </>
                          );
                        })}
                      </ul>
                    </>
                  );
                })}
              </div>
            ) : (
              <div
                className="mx-3 flex flex-col flex-wrap content-center items-center"
                id="inputs"
              >
                <div
                  id="code"
                  className="flex justify-center px-2 text-[clamp(0px,_4vw,_1.2rem)] sm:text-2xl"
                >
                  Not streaming Twitch Plays at the moment
                </div>
              </div>
            )}
            <hr className="b-2 my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 sm:my-4" />
            <div className="flex flex-row-reverse gap-3">
              <a
                className="twitchplays_button mr-3 flex h-10 w-10 items-center fill-[#c19dfb]"
                href="https://github.com/veryCrunchy/TwitchPlays"
                aria-label="Github"
              >
                <svg
                  className="relative mx-auto block h-3/5 w-3/5"
                  viewBox="0 0 98 96"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                  />
                </svg>
              </a>
              <a
                className="twitchplays_button flex h-10 w-10 items-center fill-[#c19dfb]"
                href="https://discord.gg/VmRjkGV"
                aria-label="Discord"
              >
                <svg
                  className="relative mx-auto block h-3/5 w-3/5"
                  viewBox="0 0 40 40"
                >
                  <path d="M33.2,8.3c-2.5-1.1-5.1-1.9-7.9-2.4c-0.3,0.6-0.7,1.4-1,2c-2.9-0.4-5.8-0.4-8.7,0c-0.3-0.6-0.7-1.4-1-2 c-2.8,0.5-5.4,1.3-7.9,2.4c-5,7.2-6.3,14.2-5.6,21.1c3.3,2.3,6.5,3.8,9.6,4.7c0.8-1,1.5-2.1,2.1-3.3c-1.1-0.4-2.2-0.9-3.2-1.5 c0.3-0.2,0.5-0.4,0.8-0.6c6.3,2.8,13,2.8,19.2,0c0.3,0.2,0.5,0.4,0.8,0.6c-1,0.6-2.1,1.1-3.2,1.5c0.6,1.1,1.3,2.2,2.1,3.3 c3.1-0.9,6.3-2.4,9.6-4.7C39.7,21.4,37.5,14.4,33.2,8.3z M13.7,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C17.1,23.4,15.6,25.1,13.7,25.1z M26.3,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C29.7,23.4,28.2,25.1,26.3,25.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
