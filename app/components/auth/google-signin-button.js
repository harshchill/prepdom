"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

export default function GoogleSignInButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/user/dashboard";

      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Unable to continue with Google sign-in. Please retry.");
        return;
      }

      router.push(result?.url || "/user/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unexpected error while contacting Google OAuth.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="h-4 w-4" />
        )}
        {isLoading ? "Connecting..." : "Continue with Google"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-center text-xs font-medium text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
