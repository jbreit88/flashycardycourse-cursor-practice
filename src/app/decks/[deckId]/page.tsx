import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDeckByIdAndOwnerId } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { AddCardDialog } from "./add-card-dialog";
import { DeckCardItem } from "./deck-card-item";
import { DeleteDeckButton } from "@/app/dashboard/delete-deck-button";
import { EditDeckTrigger } from "./edit-deck-trigger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { formatDateMedium } from "@/lib/format-date";

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { deckId: deckIdParam } = await params;
  const deckId = parseInt(deckIdParam, 10);
  if (Number.isNaN(deckId)) {
    notFound();
  }

  const deck = await getDeckByIdAndOwnerId(deckId, userId);
  if (!deck) {
    notFound();
  }

  const cards = await getCardsByDeckId(deckId);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {deck.title}
                  </h1>
                  {deck.description ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {deck.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <EditDeckTrigger
                    deck={{ id: deck.id, title: deck.title, description: deck.description ?? undefined }}
                  />
                  <DeleteDeckButton
                    deckId={deck.id}
                    deckTitle={deck.title}
                    cardCount={cards.length}
                    redirectTo="/dashboard"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {cards.length} card{cards.length !== 1 ? "s" : ""} · Updated{" "}
            {formatDateMedium(deck.updatedAt)}
          </p>
          {cards.length > 0 ? (
            <Button asChild className="mt-3">
              <Link href={`/decks/${deckId}/study`}>Study deck</Link>
            </Button>
          ) : null}
        </header>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Cards
            </h2>
            <AddCardDialog deckId={deckId} />
          </div>

          {cards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <CardDescription>
                  No cards in this deck yet. Add cards to start studying.
                </CardDescription>
                <AddCardDialog deckId={deckId} />
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-2">
              {cards.map((card) => (
                <li key={card.id}>
                  <DeckCardItem card={card} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
