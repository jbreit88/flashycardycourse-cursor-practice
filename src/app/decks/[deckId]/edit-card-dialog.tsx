"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCard, type UpdateCardInput } from "./actions";

type Card = {
  id: number;
  front: string;
  back: string;
};

type Props = {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCardDialog({ card, open, onOpenChange }: Props) {
  const router = useRouter();
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setFront(card.front);
      setBack(card.back);
      setError(null);
    }
  }, [open, card.front, card.back]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const input: UpdateCardInput = {
      cardId: card.id,
      front: front.trim(),
      back: back.trim(),
    };
    const result = await updateCard(input);
    setPending(false);
    if (result.ok) {
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit card</DialogTitle>
          <DialogDescription>
            Update the front and back content of this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-card-front">Front</Label>
              <Input
                id="edit-card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or term"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-card-back">Back</Label>
              <Input
                id="edit-card-back"
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
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
