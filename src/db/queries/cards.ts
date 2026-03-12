import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { cardsTable } from "@/db/schema";

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
