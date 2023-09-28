import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderPage } from "~/components/loading";
import { LoginPage } from "~/components/login";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

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
        <LoginPage title="GreasyGang" />
      </>
    );
  } else {
    router.push("/account");
    return (
      <>
        <LoaderPage />
      </>
    );
  }
}
