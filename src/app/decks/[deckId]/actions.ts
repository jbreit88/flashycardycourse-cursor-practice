"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  getDeckByIdAndOwnerId,
  updateDeckMutation,
  updateDeckUpdatedAtMutation,
} from "@/db/queries/decks";
import {
  createCardMutation,
  deleteCardMutation,
  getCardById,
  updateCardMutation,
} from "@/db/queries/cards";

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required").max(10000),
  back: z.string().min(1, "Back is required").max(10000),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCard(input: CreateCardInput) {
  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const deck = await getDeckByIdAndOwnerId(parsed.data.deckId, userId);
  if (!deck) {
    return { ok: false as const, error: "Deck not found" };
  }

  await createCardMutation(parsed.data.deckId, parsed.data.front, parsed.data.back);
  await updateDeckUpdatedAtMutation(parsed.data.deckId);

  return { ok: true as const };
}

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional().nullable(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(input: UpdateDeckInput) {
  const parsed = updateDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const deck = await getDeckByIdAndOwnerId(parsed.data.deckId, userId);
  if (!deck) {
    return { ok: false as const, error: "Deck not found" };
  }

  await updateDeckMutation(
    parsed.data.deckId,
    parsed.data.title,
    parsed.data.description
  );

  return { ok: true as const };
}

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  front: z.string().min(1, "Front is required").max(10000),
  back: z.string().min(1, "Back is required").max(10000),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCard(input: UpdateCardInput) {
  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const card = await getCardById(parsed.data.cardId);
  if (!card) {
    return { ok: false as const, error: "Card not found" };
  }

  const deck = await getDeckByIdAndOwnerId(card.deckId, userId);
  if (!deck) {
    return { ok: false as const, error: "Deck not found" };
  }

  await updateCardMutation(parsed.data.cardId, parsed.data.front, parsed.data.back);
  await updateDeckUpdatedAtMutation(card.deckId);

  return { ok: true as const };
}

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(input: DeleteCardInput) {
  const parsed = deleteCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const card = await getCardById(parsed.data.cardId);
  if (!card) {
    return { ok: false as const, error: "Card not found" };
  }

  const deck = await getDeckByIdAndOwnerId(card.deckId, userId);
  if (!deck) {
    return { ok: false as const, error: "Deck not found" };
  }

  await deleteCardMutation(parsed.data.cardId);
  await updateDeckUpdatedAtMutation(card.deckId);

  return { ok: true as const };
}
