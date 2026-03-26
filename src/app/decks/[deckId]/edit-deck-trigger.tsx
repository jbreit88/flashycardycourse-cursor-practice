"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditDeckDialog } from "./edit-deck-dialog";

type Deck = {
  id: number;
  title: string;
  description?: string | null;
};

type Props = {
  deck: Deck;
};

export function EditDeckTrigger({ deck }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Edit deck"
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <Pencil className="size-4" />
      </Button>
      <EditDeckDialog deck={deck} open={open} onOpenChange={setOpen} />
    </>
  );
}
