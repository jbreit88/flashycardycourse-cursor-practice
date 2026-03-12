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
import { updateDeck, type UpdateDeckInput } from "./actions";

type Deck = {
  id: number;
  title: string;
  description?: string | null;
};

type Props = {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditDeckDialog({ deck, open, onOpenChange }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(deck.title);
      setDescription(deck.description ?? "");
      setError(null);
    }
  }, [open, deck.title, deck.description]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const input: UpdateDeckInput = {
      deckId: deck.id,
      title: title.trim(),
      description: description.trim() || null,
    };
    const result = await updateDeck(input);
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
          <DialogTitle>Edit deck</DialogTitle>
          <DialogDescription>
            Change the deck title and description. This won&apos;t affect the cards inside.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-deck-title">Title</Label>
              <Input
                id="edit-deck-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck name"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-deck-description">Description</Label>
              <textarea
                id="edit-deck-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this deck covers (optional)"
                disabled={pending}
                rows={3}
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
