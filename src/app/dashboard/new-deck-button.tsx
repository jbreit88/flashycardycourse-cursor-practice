"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createDeck } from "./actions";

type NewDeckButtonProps = {
  label?: string;
  variant?: "outline" | "default";
  size?: "sm" | "default" | "lg";
  /** When false, the button is disabled (e.g. free plan at 3 decks). */
  canCreateDeck?: boolean;
};

export function NewDeckButton({
  label = "New deck",
  variant = "outline",
  size = "sm",
  canCreateDeck = true,
}: NewDeckButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-stretch gap-1">
      <Button
        size={size}
        variant={variant}
        disabled={isPending || !canCreateDeck}
        onClick={() => {
          setActionError(null);
          startTransition(() => {
            void createDeck({}).then((result) => {
              if (result && "ok" in result && result.ok === false) {
                setActionError(result.error);
              }
            });
          });
        }}
      >
        {isPending ? "Creating…" : label}
      </Button>
      {actionError ? (
        <p className="text-destructive max-w-xs text-xs">{actionError}</p>
      ) : null}
    </div>
  );
}
