import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.ownerId, userId))
    .orderBy(desc(decksTable.createdAt));

  const deckIds = decks.map((d) => d.id);
  const cardCountByDeck: Record<number, number> = {};

  if (deckIds.length > 0) {
    const cards = await db
      .select({ deckId: cardsTable.deckId })
      .from(cardsTable)
      .where(inArray(cardsTable.deckId, deckIds));
    for (const c of cards) {
      cardCountByDeck[c.deckId] = (cardCountByDeck[c.deckId] ?? 0) + 1;
    }
  }

  const totalCards = Object.values(cardCountByDeck).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Your flashcard overview
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
            style={{ borderColor: "var(--border)", background: "var(--muted)" }}
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total decks
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {decks.length}
            </p>
          </div>
          <div
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
            style={{ borderColor: "var(--border)", background: "var(--muted)" }}
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total cards
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {totalCards}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Your decks
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/decks/new">New deck</Link>
            </Button>
          </div>

          {decks.length === 0 ? (
            <div
              className="rounded-xl border border-dashed p-8 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No decks yet. Create one to start adding flashcards.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/decks/new">Create your first deck</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {decks.map((deck) => (
                <li key={deck.id}>
                  <Link
                    href={`/dashboard/decks/${deck.id}`}
                    className="block rounded-lg border px-4 py-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {deck.title}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {cardCountByDeck[deck.id] ?? 0} card
                        {(cardCountByDeck[deck.id] ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Created{" "}
                      {new Date(deck.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
