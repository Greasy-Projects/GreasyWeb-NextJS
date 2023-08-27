import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderPage } from "~/components/loading";
import { LoginPage } from "~/components/login";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
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
