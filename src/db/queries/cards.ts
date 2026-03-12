import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cardsTable } from "@/db/schema";

/**
 * Insert a card into a deck. Only call after verifying deck ownership.
 */
export async function createCardMutation(deckId: number, front: string, back: string) {
  const [row] = await db
    .insert(cardsTable)
    .values({ deckId, front, back })
    .returning();
  return row;
}

/**
 * Get a single card by ID. Only use after verifying deck ownership (e.g. via deck).
 */
export async function getCardById(cardId: number) {
  const [row] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  return row ?? null;
}

/**
 * Update a card's front and back. Only call after verifying deck ownership.
 */
export async function updateCardMutation(
  cardId: number,
  front: string,
  back: string
) {
  const [row] = await db
    .update(cardsTable)
    .set({ front, back, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  return row;
}

/**
 * Delete a card by ID. Only call after verifying deck ownership (e.g. via card's deck).
 */
export async function deleteCardMutation(cardId: number) {
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
}

/**
 * Get all cards for a deck. Only call after verifying deck ownership.
 */
export async function getCardsByDeckId(deckId: number) {
  return db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.createdAt));
}

/**
 * Get card counts per deck for the given deck IDs.
 * Returns a map of deckId -> count.
 */
export async function getCardCountsByDeckIds(
  deckIds: number[]
): Promise<Record<number, number>> {
  if (deckIds.length === 0) return {};

  const rows = await db
    .select({ deckId: cardsTable.deckId })
    .from(cardsTable)
    .where(inArray(cardsTable.deckId, deckIds));

  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.deckId] = (counts[row.deckId] ?? 0) + 1;
  }
  return counts;
}
