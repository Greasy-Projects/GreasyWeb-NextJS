import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { Inter } from "next/font/google";
import { useRef, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

const Home: NextPage = () => {
  interface Data {
    name: string;
    inputs: string[];
  }

  const { data, refetch, remove } = api.twitchplays.get.useQuery<Data[]>();
  const inputsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setInterval(() => {
      refetch()
        .then((res) => {
          if (res.status == "error") remove();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }, 10000); // Fetch every 10 seconds (10000 milliseconds)
  }, [refetch, remove]);

  if (!data)
    return (
      <>
        {" "}
        <Head>
          <title>TwitchPlays</title>
          <meta
            property="og:title"
            content="Not streaming TwitchPlays at the moment."
          />
          <meta name="theme-color" content="#794ec4" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
      </>
    );
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
        #_app {
          background: transparent !important;
        }

        .twitchplays_card_overlay {
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          -webkit-backdrop-filter: blur(17.1px);
          border: 2px solid rgba(193, 157, 251, 0.6);
        }

        html {
          font-family: ${inter.style.fontFamily};
        }

        #inputs ul {
          list-style-type: disc;
          padding-left: 20px;
        }

        #inputs strong {
          font-size: 1.4rem;
          font-weight: bold;
          color: #cc7eff;
          text-transform: capitalize;
        }

        #inputs code {
          background: rgba(122, 70, 199, 0.2);
          border: 2px solid rgba(193, 157, 251, 0.4);
          border-radius: 4px;
          color: #c19dfb;
          font-size: 1.1rem;
          font-weight: bold;
          list-style: none;
          display: inline-block;
          word-break: break-all;
        }
      `}</style>
      <main className="flex min-h-screen justify-center">
        <div className="container flex max-w-fit flex-col">
          <div
            className={
              "twitchplays_card_overlay h-auto w-screen rounded-xl bg-[#0d1117]/90 py-2"
            }
          >
            <div ref={inputsRef} className="mx-auto flex flex-col " id="inputs">
              {data?.map((input: Data, index) => {
                return (
                  <ul
                    key={index}
                    className="my-[0.12rem] flex flex-row flex-wrap gap-1 whitespace-nowrap uppercase leading-none"
                  >
                    <strong>{input.name}:</strong>
                    <br className="sm:hidden" />{" "}
                    {input.inputs.map((input) => {
                      return (
                        <>
                          <code className="px-1 py-1">{input}</code>
                        </>
                      );
                    })}
                  </ul>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
