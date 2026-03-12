"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCard, type CreateCardInput } from "./actions";

type Props = {
  deckId: number;
};

export function AddCardDialog({ deckId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const input: CreateCardInput = { deckId, front: front.trim(), back: back.trim() };
    const result = await createCard(input);
    setPending(false);
    if (result.ok) {
      setFront("");
      setBack("");
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
          <DialogDescription>
            Add a new flashcard to this deck. Enter the front and back content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-card-front">Front</Label>
              <Input
                id="add-card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or term"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-card-back">Back</Label>
              <Input
                id="add-card-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or definition"
                disabled={pending}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
