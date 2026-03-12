import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDecksByOwnerId } from "@/db/queries/decks";
import { getCardCountsByDeckIds } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksByOwnerId(userId);
  const deckIds = decks.map((d) => d.id);
  const cardCountByDeck = await getCardCountsByDeckIds(deckIds);

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
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Total decks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{decks.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Total cards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalCards}</p>
            </CardContent>
          </Card>
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
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <CardDescription>
                  No decks yet. Create one to start adding flashcards.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild>
                  <Link href="/dashboard/decks/new">Create your first deck</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <ul className="space-y-2">
              {decks.map((deck) => (
                <li key={deck.id}>
                  <Link href={`/dashboard/decks/${deck.id}`} className="block">
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{deck.title}</span>
                          <span className="text-muted-foreground text-sm">
                            {cardCountByDeck[deck.id] ?? 0} card
                            {(cardCountByDeck[deck.id] ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <CardDescription className="mt-0.5 text-xs">
                          Updated{" "}
                          {new Date(deck.updatedAt).toLocaleDateString(
                            undefined,
                            { dateStyle: "medium" }
                          )}
                        </CardDescription>
                      </CardContent>
                    </Card>
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
