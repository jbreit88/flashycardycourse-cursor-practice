"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DASHBOARD_URL = "/dashboard";

export function AuthDialog() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button size="lg" onClick={() => setSignInOpen(true)}>
          Sign In
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSignUpOpen(true)}
        >
          Sign Up
        </Button>
      </div>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="max-w-[min(90vw,400px)] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Sign in</DialogTitle>
          </DialogHeader>
          <SignIn
            routing="hash"
            fallbackRedirectUrl={DASHBOARD_URL}
            signUpUrl="#"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
              },
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
        <DialogContent className="max-w-[min(90vw,400px)] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Sign up</DialogTitle>
          </DialogHeader>
          <SignUp
            routing="hash"
            fallbackRedirectUrl={DASHBOARD_URL}
            signInUrl="#"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
              },
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
