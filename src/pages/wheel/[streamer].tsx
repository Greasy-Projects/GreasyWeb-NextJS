import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { useEffect } from "react";
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

const data: WheelData[] = [
  { option: "drink water", style: { backgroundColor: "#2fff40" } },
  { option: "5 pushups", style: { backgroundColor: "#fc0817" } },
  { option: "take off shoes", style: { backgroundColor: "#2ceefd" } },
  { option: "nothing", style: { backgroundColor: "#fc00c4" } },
  {
    option: "drip inspection",
    style: { backgroundColor: "#fbff44" },
  },
  { option: "stay quiet", style: { backgroundColor: "#9600b4" } },
  { option: "face cam", style: { backgroundColor: "#fc8926" } },
  {
    option: "enter nearest store",
    style: { backgroundColor: "#2cffa4" },
  },
  { option: "stop moving", style: { backgroundColor: "#144ff9" } },
  { option: "stranger drip rate", style: { backgroundColor: "#f800f9" } },
  { option: "honk horn", style: { backgroundColor: "#0b6c2f" } },
  { option: "AHHHH", style: { backgroundColor: "#fc7569" } },
  { option: "scammed", style: { backgroundColor: "#c199f3" } },
  { option: "say hi to stranger", style: { backgroundColor: "#ffffff" } },
  { option: "put shoes back on", style: { backgroundColor: "#fc6668" } },
];
const Home: NextPage = () => {
  const router = useRouter();
  const streamer = router.query.streamer;
  const pfp = api.util.pfp.useQuery({ name: String(streamer) }).data?.image;
  //   const utils = api.useContext();
  const [mustSpin, setMustSpin] = useState(false);
  const [tts, setTtsUrl] = useState<string>("");
  const [prizeNumber, setPrizeNumber] = useState(0);
  const getTTS = api.util.tts.useMutation();

  const handleTTS = async (num: number) => {
    const res = await getTTS.mutateAsync({
      text: data[num]?.option || "",
      voice: "Brian",
    });
    setTtsUrl(res.speak_url);
  };

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      void handleTTS(newPrizeNumber).then(() => {
        const audioElement = document.querySelectorAll("audio");
        if (audioElement[0]) {
          audioElement[0].volume = 0.7;
          void audioElement[0]?.play();
        }

        setMustSpin(true);
      });

      // setTtsUrl(res.speak_url);
      // `${data[newPrizeNumber]?.option || ""}`
    }
  };

  //   const { data } = api.twitchplays.get.useQuery<Data[]>({
  //     streamer: String(streamer || "greasymac"),
  //   });

  return (
    <>
      <div className="flex h-screen place-items-center items-center justify-center">
        <div className="">
          <Image
            alt="pfp"
            width={52}
            height={52}
            className="absolute bottom-0 left-0 right-0 top-0 z-50 m-auto rounded-full border-2 border-[#1d0000]"
            src={pfp ?? ""}
            onClick={handleSpinClick}
          />
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
            className="absolute z-30 h-[auto] w-[10rem] translate-x-[19rem] translate-y-[-9.2rem] -rotate-[25deg] "
            src="/mac-pointer-arm.png"
          />
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={() => {
              setMustSpin(false);
              const audioElement = document.querySelectorAll("audio");
              setTimeout(() => {
                void audioElement[1]?.play();
              }, 200);
            }}
            spinDuration={0.35}
            radiusLineColor="#1d0000"
            outerBorderColor="#1d0000"
            innerBorderColor="#1d0000"
            radiusLineWidth={2}
            outerBorderWidth={2}
            innerBorderWidth={2}
            fontSize={17}
            pointerProps={{
              style: {
                // opacity: 0,
              },
            }}
          />
          <audio className="hidden" src="/drumroll.mp3" />
          <audio className="hidden" src={tts} />
        </div>
      </div>
    </>
  );
};

export default Home;
