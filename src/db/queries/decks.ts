import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { decksTable } from "@/db/schema";

/**
 * Create a new deck for the given owner. Call only with authenticated user's ID.
 */
export async function createDeckMutation(
  ownerId: string,
  title: string,
  description?: string | null
) {
  const [row] = await db
    .insert(decksTable)
    .values({
      ownerId,
      title,
      ...(description !== undefined && { description: description ?? null }),
    })
    .returning();
  return row!;
}

/**
 * Get all decks owned by the given user, newest first.
 */
export async function getDecksByOwnerId(ownerId: string) {
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.ownerId, ownerId))
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Get a single deck by id, only if owned by the given user.
 * Returns undefined if not found or not owned.
 */
export async function getDeckByIdAndOwnerId(deckId: number, ownerId: string) {
  const rows = await db
    .select()
    .from(decksTable)
    .where(
      and(eq(decksTable.id, deckId), eq(decksTable.ownerId, ownerId))
    )
    .limit(1);
  return rows[0];
}

/**
 * Update a deck's updatedAt. Only call after verifying deck ownership.
 */
export async function updateDeckUpdatedAtMutation(deckId: number) {
  const [row] = await db
    .update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, deckId))
    .returning();
  return row;
}

/**
 * Update a deck's title and optional description. Only call after verifying deck ownership.
 */
export async function updateDeckMutation(
  deckId: number,
  title: string,
  description?: string | null
) {
  const [row] = await db
    .update(decksTable)
    .set({
      title,
      ...(description !== undefined && { description: description ?? null }),
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, deckId))
    .returning();
  return row;
}

/**
 * Delete a deck owned by the given user. Cards are removed by DB cascade (see schema).
 * Returns the deleted row, or null if no matching owned deck.
 */
export async function deleteDeckMutation(deckId: number, ownerId: string) {
  const [row] = await db
    .delete(decksTable)
    .where(
      and(eq(decksTable.id, deckId), eq(decksTable.ownerId, ownerId))
    )
    .returning();
  return row ?? null;
}
