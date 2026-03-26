import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getDeckByIdAndOwnerId } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudyView } from "./study-view";

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function StudyPage({ params }: Props) {
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
    <StudyView
      deckTitle={deck.title}
      deckId={deck.id}
      cards={cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
    />
  );
}
