import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import PaperReaderClient from "./paper-reader-client";

export default async function PaperReaderPage({ params }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/user/library");
  }

  const resolvedParams = await params;
  const paperId =
    typeof resolvedParams?.paperId === "string" ? resolvedParams.paperId.trim() : "";

  if (!paperId) {
    redirect("/user/library");
  }

  return <PaperReaderClient paperId={paperId} />;
}