import ScrollContainer from "react-indiana-drag-scroll";
import { api } from "~/utils/api";
import CachedIcon from "@mui/icons-material/Cached";
import { signIn } from "next-auth/react";

export const ManagersComponent: React.FC<{
  streamer: string;
  user: string;
}> = ({ streamer, user }) => {
  const setManagersMutation = api.util.setManagers.useMutation();
  const [managers, managersQuery] = api.user.getManagers.useSuspenseQuery({
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
};
