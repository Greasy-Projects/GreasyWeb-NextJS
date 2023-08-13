import { Inter } from "next/font/google";
import { signIn } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const LoginPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <>
      <style jsx>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#20113f] to-[#12131c] py-14">
        <div className="container flex max-w-fit flex-col items-center justify-center px-4">
          <div className="twitchplays_card h-auto w-full rounded-xl bg-[#0d1117]/60 py-2 sm:py-4">
            <h1 className="xs:text-5xl w-full select-none bg-gradient-to-br from-[#7d2be1] to-[#9b30ff] bg-clip-text px-5 pb-4 text-center text-[clamp(3rem,19vw,4.5rem)] font-[900] uppercase leading-none text-transparent sm:px-5 sm:pb-5 sm:pt-0 sm:text-7xl">
              {title}
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
