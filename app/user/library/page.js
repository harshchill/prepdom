import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import LibraryClient from "./library-client";

export default async function UserLibraryPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/user/library");
  }

  return <LibraryClient />;
}
