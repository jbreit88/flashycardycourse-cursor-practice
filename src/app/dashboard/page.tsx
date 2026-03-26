import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FREE_PLAN_DECK_LIMIT } from "@/lib/deck-limits";
import { getDecksByOwnerId } from "@/db/queries/decks";
import { getCardCountsByDeckIds } from "@/db/queries/cards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { EditDeckTrigger } from "@/app/decks/[deckId]/edit-deck-trigger";
import { formatDateMedium } from "@/lib/format-date";
import { DeleteDeckButton } from "./delete-deck-button";
import { NewDeckButton } from "./new-deck-button";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksByOwnerId(userId);
  const isPro = has({ plan: "pro" });
  const canCreateMoreDecks =
    has({ feature: "unlimited_decks" }) ||
    isPro ||
    decks.length < FREE_PLAN_DECK_LIMIT;
  const deckIds = decks.map((d) => d.id);
  const cardCountByDeck = await getCardCountsByDeckIds(deckIds);

  const totalCards = Object.values(cardCountByDeck).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            {isPro && (
              <Badge variant="secondary" className="font-medium">
                Pro
              </Badge>
            )}
          </div>
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
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Your decks
            </h2>
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <NewDeckButton canCreateDeck={canCreateMoreDecks} />
              {!canCreateMoreDecks && (
                <p className="text-muted-foreground text-xs">
                  Free plan: {FREE_PLAN_DECK_LIMIT} deck limit.{" "}
                  <Link
                    href="/pricing"
                    className="text-primary font-medium underline underline-offset-2"
                  >
                    Upgrade to Pro
                  </Link>{" "}
                  for unlimited decks.
                </p>
              )}
            </div>
          </div>

          {decks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <CardDescription>
                  No decks yet. Create one to start adding flashcards.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-center">
                <NewDeckButton
                  label="Create your first deck"
                  variant="default"
                  size="default"
                  canCreateDeck={canCreateMoreDecks}
                />
              </CardFooter>
            </Card>
          ) : (
            <ul className="space-y-2">
              {decks.map((deck) => {
                const count = cardCountByDeck[deck.id] ?? 0;
                return (
                  <li key={deck.id}>
                    <Card className="flex flex-row items-stretch gap-1 transition-colors hover:bg-accent/50">
                      <Link
                        href={`/decks/${deck.id}`}
                        className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {deck.title}
                          </span>
                          <span className="text-muted-foreground shrink-0 text-sm">
                            {count} card{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <CardDescription className="mt-0.5 text-xs">
                          Updated {formatDateMedium(deck.updatedAt)}
                        </CardDescription>
                      </Link>
                      <div className="flex shrink-0 items-center gap-0.5 pr-2">
                        <EditDeckTrigger deck={deck} />
                        <DeleteDeckButton
                          deckId={deck.id}
                          deckTitle={deck.title}
                          cardCount={count}
                        />
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
