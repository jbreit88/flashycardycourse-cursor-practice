import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { decksTable } from "@/db/schema";

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
