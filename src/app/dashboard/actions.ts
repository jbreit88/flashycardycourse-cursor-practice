"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createDeckMutation, deleteDeckMutation } from "@/db/queries/decks";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const title = parsed.data.title?.trim() || "Untitled deck";
  const deck = await createDeckMutation(userId, title);
  redirect(`/decks/${deck.id}`);
}

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  const parsed = deleteDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid deck" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const deleted = await deleteDeckMutation(parsed.data.deckId, userId);
  if (!deleted) {
    return { ok: false as const, error: "Deck not found" };
  }

  return { ok: true as const };
}
