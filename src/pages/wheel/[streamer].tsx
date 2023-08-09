import type { NextPage, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";
import { useEffect } from "react";
import Pusher from "pusher-js";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((i) => i.Wheel),
  { ssr: false }
);

import { useState } from "react";
interface ImageProps {
  uri: string;
  offsetX?: number; // Optional
  offsetY?: number; // Optional
  sizeMultiplier?: number; // Optional
  landscape?: boolean; // Optional
}
interface StyleType {
  backgroundColor?: string; // Optional
  textColor?: string; // Optional
  fontFamily?: string; // Optional
  fontSize?: number; // Optional
  fontWeight?: number | string; // Optional
  fontStyle?: string; // Optional
}
interface WheelData {
  option: string;
  image?: ImageProps;
  style?: StyleType; // Optional
  optionSize?: number; // Optional
}

// const data: WheelData[] = [
//   { option: "drink water", style: { backgroundColor: "#2fff40" } },
//   { option: "5 pushups", style: { backgroundColor: "#fc0817" } },
//   { option: "take off shoes", style: { backgroundColor: "#2ceefd" } },
//   { option: "nothing", style: { backgroundColor: "#fc00c4" } },
//   {
//     option: "drip inspection",
//     style: { backgroundColor: "#fbff44" },
//   },
//   { option: "stay quiet", style: { backgroundColor: "#9600b4" } },
//   { option: "face cam", style: { backgroundColor: "#fc8926" } },
//   {
//     option: "enter nearest store",
//     style: { backgroundColor: "#2cffa4" },
//   },
//   { option: "stop moving", style: { backgroundColor: "#144ff9" } },
//   { option: "stranger drip rate", style: { backgroundColor: "#f800f9" } },
//   { option: "honk horn", style: { backgroundColor: "#a5d2ff" } },
//   { option: "AHHHH", style: { backgroundColor: "#fc7569" } },
//   { option: "scammed", style: { backgroundColor: "#c199f3" } },
//   { option: "say hi to stranger", style: { backgroundColor: "#ffffff" } },
//   { option: "put shoes back on", style: { backgroundColor: "#fc6668" } },
// ];

const data: WheelData[] = [
  {
    option: "pretend it's my birthday next meal",
  },
  { option: "Dance in Public" },
  { option: "Be a statue for 1 minute" },
  { option: "Fist bump a stranger" },
  { option: "Do 50 jumping jacks" },
  { option: "Give someone a high five" },
  { option: "30 second plank" },
  { option: "Party Hips" },
  { option: "iSpy" },
  { option: "5 Pushups" },
  {
    option: "Face Cam only for 5 mins",
  },
  {
    option: "Enter the Nearest Establishment",
  },
  { option: "Scammed Unfortunately" },
  { option: "Say Hello to a Stranger" },
  { option: "Compliment a Stranger" },
  { option: "Play Mermaid Party" },
  { option: "Cartwheel" },
  {
    option: "Consistent Awkward Laugh (10 mins)",
  },
  { option: "Clap" },
  { option: "Touch Grass" },
  { option: "Start Sprinting" },
];

interface WheelOption {
  option: string | undefined;
  style?: {
    backgroundColor?: string;
    fontSize?: number;
    // Add other style properties as needed
  };
}

function getSize(textLength: number) {
  if (textLength < 15) {
    return 15;
  }
  if (textLength < 30) {
    return 13;
  }
  if (textLength < 40) {
    return 10;
  }
  return 8;
}
function assignColors(): WheelOption[] {
  const result: WheelOption[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data.length % 2 === 0) {
      const colors: string[] = ["#9e74ff", "#74ffd4"];

      result.push({
        option: data[i]?.option,
        style: {
          backgroundColor: colors[i % 2],
          fontSize: getSize(data[i]?.option.length ?? 0),
        },
      });
    } else {
      const colors: string[] = ["#9e74ff", "#ff7380", "#74ffd4"];

      result.push({
        option: data[i]?.option,
        style: {
          backgroundColor: colors[i % 3],
          fontSize: getSize(data[i]?.option.length ?? 0),
        },
      });
    }
  }

  return result;
}

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  // const pfp = api.util.pfp.useQuery({
  //   name: String(context.query.streamer),
  // }).data;
  // console.log(pfp);
  return {
    props: {
      SOKETI_KEY: env.SOKETI_APP_KEY,
      SOKETI_URL: env.SOKETI_URL,
    },
  };
};
const Home: NextPage<{
  SOKETI_KEY: string;
  SOKETI_URL: string;
}> = ({ SOKETI_KEY, SOKETI_URL }) => {
  const router = useRouter();
  //   const utils = api.useContext();
  const streamer = router.query.streamer;
  const [mustSpin, setMustSpin] = useState(false);
  const [shown, show] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const _getTTS = api.util.tts.useMutation();

  useEffect(() => {
    const pusher = new Pusher(SOKETI_KEY, {
      wsHost: SOKETI_URL,
      wsPort: 443,
      forceTLS: true,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
    });
    const channel = pusher.subscribe(String(streamer));

    channel.bind("spin", (d: { rand: number }) => {
      const newPrizeNumber = Math.floor(d.rand * data.length);
      setPrizeNumber(newPrizeNumber);
      handleSpin();
    });
  });

  const getTTS = async () => {
    const res = await _getTTS.mutateAsync({
      text:
        data[prizeNumber]?.option ??
        "Hi, brian here. I think I fucked up.... something went wrong.",
      voice: "Brian",
    });
    return res.speak_url;
  };

  const handleSpin = () => {
    if (!mustSpin) {
      show(true);
      const audioElement = document.querySelectorAll("audio");

      setTimeout(() => {
        if (audioElement[0]) {
          audioElement[0].volume = 0.4;
          void audioElement[0]?.play();
        }
        setMustSpin(true);
      }, 500);
    }
  };

  return (
    <main className="m-0 flex h-screen place-content-end items-end justify-end">
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className="">
        {/* <Image
          alt="pfp"
          width={52}
          height={52}
          className=" z-40 m-auto rounded-full border-2 border-[#1d0000]"
          src={
            "https://static-cdn.jtvnw.net/jtv_user_pictures/af2f55e2-0e1b-4b1d-8d6d-e3c5b5eeba6e-profile_image-150x150.png"
          }
          onClick={handleSpin}
        /> */}

        <div
          className={`transition-opacity ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          {streamer == "greasymac" && (
            <>
              <Image
                alt="pointer"
                width={100}
                height={100}
                className="absolute h-[auto] w-[10rem] translate-x-[19rem] translate-y-[-9.2rem] -rotate-[25deg]"
                src="/mac-pointer.png"
              />
              <Image
                alt="pointer-arm"
                width={100}
                height={100}
                className="absolute z-30 h-[auto] w-[10rem] translate-x-[19rem] translate-y-[-9.2rem] -rotate-[25deg]"
                src="/mac-pointer-arm.png"
                onClick={handleSpin}
              />
            </>
          )}
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={assignColors()}
            onStopSpinning={() => {
              setMustSpin(false);

              void getTTS().then((tts: string) => {
                const audioElement = document.querySelectorAll("audio");
                if (audioElement[1]) {
                  audioElement[1].src = tts;
                }
                void audioElement[1]?.play();
                setTimeout(() => {
                  show(false);
                }, 10000);
              });
            }}
            textDistance={58}
            spinDuration={0.35}
            radiusLineColor="#1d0000"
            outerBorderColor="#1d0000"
            innerBorderColor="#1d0000"
            radiusLineWidth={2}
            outerBorderWidth={2}
            innerBorderWidth={2}
            fontSize={17}
            pointerProps={
              streamer === "greasymac"
                ? {
                    style: {
                      opacity: 0,
                    },
                  }
                : {}
            }
          />
        </div>
        <audio className="hidden" src="/drumroll.mp3" />
        <audio className="hidden" src="" />
      </div>
    </main>
  );
};

export default Home;
