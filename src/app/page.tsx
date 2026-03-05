import {
  SignInButton,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
          Flashy Cardy
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          You&apos;re personal flashcard platform
        </p>
        <SignedOut>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button size="lg">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
