"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createDeck } from "./actions";

type NewDeckButtonProps = {
  label?: string;
  variant?: "outline" | "default";
  size?: "sm" | "default" | "lg";
};

export function NewDeckButton({
  label = "New deck",
  variant = "outline",
  size = "sm",
}: NewDeckButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          createDeck({});
        });
      }}
    >
      {isPending ? "Creating…" : label}
    </Button>
  );
}
