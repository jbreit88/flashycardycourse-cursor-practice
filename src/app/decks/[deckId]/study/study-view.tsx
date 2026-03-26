"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  RotateCcw,
  Shuffle,
  X,
} from "lucide-react";

export type StudyCard = {
  id: number;
  front: string;
  back: string;
};

type StudyViewProps = {
  deckTitle: string;
  deckId: number;
  cards: StudyCard[];
};

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

/** Per card id (stable across reorder). Absent = not yet marked or skipped. */
type CardOutcome = "correct" | "incorrect" | "skipped";
type CardOutcomes = Record<number, CardOutcome>;

function SessionOutcomeIndicator({ outcome }: { outcome: CardOutcome }) {
  const label =
    outcome === "correct"
      ? "Marked correct"
      : outcome === "incorrect"
        ? "Marked incorrect"
        : "Passed without marking";

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      role="img"
      aria-label={label}
    >
      {outcome === "correct" ? (
        <Check
          className="size-6 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
          aria-hidden
        />
      ) : outcome === "incorrect" ? (
        <X className="size-6 text-destructive" strokeWidth={2.5} aria-hidden />
      ) : (
        <Circle
          className="size-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
    </span>
  );
}

function tallySession(orderedCards: StudyCard[], outcomes: CardOutcomes) {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  let pending = 0;
  for (const c of orderedCards) {
    const o = outcomes[c.id];
    if (o === "correct") correct++;
    else if (o === "incorrect") incorrect++;
    else if (o === "skipped") skipped++;
    else pending++;
  }
  const unmarked = skipped + pending;
  return { correct, incorrect, skipped, pending, unmarked };
}

export function StudyView({ deckTitle, deckId, cards }: StudyViewProps) {
  const [orderedCards, setOrderedCards] = useState<StudyCard[]>(() => [
    ...cards,
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardOutcomes, setCardOutcomes] = useState<CardOutcomes>({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const [endOfDeckDialogOpen, setEndOfDeckDialogOpen] = useState(false);

  const cardsSyncKey = useMemo(
    () => cards.map((c) => `${c.id}:${c.front}:${c.back}`).join("|"),
    [cards],
  );

  useEffect(() => {
    setOrderedCards([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardOutcomes({});
    setSessionComplete(false);
    setEndOfDeckDialogOpen(false);
    // cardsSyncKey captures content changes; cards is the latest list from the same render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when deck content identity changes
  }, [cardsSyncKey]);

  const card = orderedCards[currentIndex];
  const deckSize = orderedCards.length;
  const currentOutcome = card ? cardOutcomes[card.id] : undefined;
  const {
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
    unmarked: unmarkedCount,
  } = useMemo(
    () => tallySession(orderedCards, cardOutcomes),
    [orderedCards, cardOutcomes],
  );
  const percentCorrectRounded =
    deckSize > 0 ? Math.round((correctCount / deckSize) * 100) : null;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < deckSize - 1;
  const canGoNext =
    hasNext || (currentIndex === deckSize - 1 && currentOutcome === undefined);

  const shuffleDeck = useCallback(() => {
    setOrderedCards((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardOutcomes({});
    setSessionComplete(false);
    setEndOfDeckDialogOpen(false);
  }, []);

  const finishStudying = useCallback(() => {
    setEndOfDeckDialogOpen(false);
    setSessionComplete(true);
  }, []);

  const goPrevious = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < deckSize - 1) {
      const leaving = orderedCards[currentIndex];
      if (leaving) {
        setCardOutcomes((prev) => {
          const o = prev[leaving.id];
          if (o === "correct" || o === "incorrect") return prev;
          return { ...prev, [leaving.id]: "skipped" };
        });
      }
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      return;
    }
    if (currentIndex === deckSize - 1 && deckSize > 0) {
      const leaving = orderedCards[currentIndex];
      if (!leaving) return;
      const o = cardOutcomes[leaving.id];
      if (o === "correct" || o === "incorrect" || o === "skipped") return;
      setCardOutcomes((prev) => ({ ...prev, [leaving.id]: "skipped" }));
      setIsFlipped(false);
      setEndOfDeckDialogOpen(true);
    }
  }, [currentIndex, deckSize, orderedCards, cardOutcomes]);

  const flip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const markCorrect = useCallback(() => {
    if (!card) return;
    setCardOutcomes((prev) => ({ ...prev, [card.id]: "correct" }));
    if (currentIndex < deckSize - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setEndOfDeckDialogOpen(true);
    }
    setIsFlipped(false);
  }, [card, currentIndex, deckSize]);

  const markIncorrect = useCallback(() => {
    if (!card) return;
    setCardOutcomes((prev) => ({ ...prev, [card.id]: "incorrect" }));
    if (currentIndex < deckSize - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setEndOfDeckDialogOpen(true);
    }
    setIsFlipped(false);
  }, [card, currentIndex, deckSize]);

  const resetSessionStats = useCallback(() => {
    setCardOutcomes({});
    setEndOfDeckDialogOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionComplete || endOfDeckDialogOpen) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          flip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasPrevious) goPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (canGoNext) goNext();
          break;
        case "c":
        case "C":
          if (isFlipped) {
            e.preventDefault();
            markCorrect();
          }
          break;
        case "x":
        case "X":
          if (isFlipped) {
            e.preventDefault();
            markIncorrect();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    flip,
    goPrevious,
    goNext,
    hasPrevious,
    canGoNext,
    isFlipped,
    markCorrect,
    markIncorrect,
    sessionComplete,
    endOfDeckDialogOpen,
  ]);

  if (deckSize === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href={`/decks/${deckId}`}>← Back to deck</Link>
          </Button>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <CardDescription>
                No cards in this deck. Add cards to start studying.
              </CardDescription>
              <Button asChild>
                <Link href={`/decks/${deckId}`}>Back to deck</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 flex flex-col">
      <div className="mx-auto max-w-2xl w-full flex flex-col flex-1">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 mb-4 self-start"
        >
          <Link href={`/decks/${deckId}`}>← Back to {deckTitle}</Link>
        </Button>

        {sessionComplete ? (
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Session complete</CardTitle>
              <CardDescription>{deckTitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <dt className="text-emerald-700 dark:text-emerald-400">
                    Correct
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {correctCount}
                  </dd>
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <dt className="text-destructive">Incorrect</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-destructive">
                    {incorrectCount}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/40 px-4 py-3">
                  <dt className="text-muted-foreground">Skipped</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {unmarkedCount}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/40 px-4 py-3">
                  <dt className="text-muted-foreground">Percent correct</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {percentCorrectRounded !== null
                      ? `${percentCorrectRounded}%`
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Each card is tracked by id. Skipped (report) counts cards that
                were not correct or incorrect when you finished. While studying,
                Skipped counts cards you moved past with Next without marking;
                you can go back and mark them to update. Percent correct is
                correct divided by correct plus incorrect plus skipped (the
                whole deck).
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href={`/decks/${deckId}`}>Back to deck</Link>
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={shuffleDeck}
                aria-label="Shuffle deck and study again"
              >
                <Shuffle className="size-4 mr-2" />
                Shuffle & study again
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {deckSize}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Correct: {correctCount}
                  </span>
                  <span className="text-destructive">
                    Incorrect: {incorrectCount}
                  </span>
                  <span className="text-muted-foreground">
                    Skipped: {skippedCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetSessionStats}
                    disabled={Object.keys(cardOutcomes).length === 0}
                    aria-label="Clear all marks"
                  >
                    Reset marks
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={shuffleDeck}
                    aria-label="Shuffle deck"
                  >
                    <Shuffle className="size-4 mr-1" />
                    Shuffle
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={finishStudying}
                    aria-label="Finish studying and view session report"
                  >
                    Finish Studying
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Enter or Space: flip · ← →: previous/next
                  {isFlipped ? " · C: correct · X: incorrect" : ""}
                </p>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={currentIndex + 1}
                aria-valuemin={0}
                aria-valuemax={deckSize}
                aria-label={`Progress: ${currentIndex + 1} of ${deckSize} cards`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${((currentIndex + 1) / deckSize) * 100}%` }}
                />
              </div>
            </div>

            <Card
              className="flex-1 flex flex-col cursor-pointer select-none touch-manipulation min-h-[280px] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={flip}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  flip();
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  if (hasPrevious) goPrevious();
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  if (canGoNext) goNext();
                }
              }}
              role="button"
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <CardHeader className="flex-shrink-0 flex flex-row items-start justify-between gap-3">
                <CardDescription className="text-xs uppercase tracking-wider">
                  {isFlipped ? "Answer" : "Question"}
                </CardDescription>
                {currentOutcome ? (
                  <SessionOutcomeIndicator outcome={currentOutcome} />
                ) : null}
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center py-4">
                <p className="text-lg md:text-xl text-center whitespace-pre-wrap px-2">
                  {isFlipped ? card.back : card.front}
                </p>
              </CardContent>
              <CardFooter className="flex-shrink-0 flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      flip();
                    }}
                    aria-label="Flip card"
                  >
                    <RotateCcw className="size-4 mr-1" />
                    {isFlipped ? "Show question" : "Show answer"}
                  </Button>
                </div>
                {isFlipped && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        markCorrect();
                      }}
                      aria-label="Mark correct and go to next card"
                    >
                      Correct
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markIncorrect();
                      }}
                      aria-label="Mark incorrect and go to next card"
                    >
                      Incorrect
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            <div className="flex items-center justify-between gap-4 mt-6">
              <Button
                variant="outline"
                onClick={goPrevious}
                disabled={!hasPrevious}
                aria-label="Previous card"
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={goNext}
                disabled={!canGoNext}
                aria-label={
                  hasNext ? "Next card" : "Pass without marking and end round"
                }
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>

      {!sessionComplete ? (
        <Dialog
          open={endOfDeckDialogOpen}
          onOpenChange={setEndOfDeckDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>End of deck</DialogTitle>
              <DialogDescription>
                You&apos;ve reached the last card. Finish to see your session
                report, or review and change any answers first.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEndOfDeckDialogOpen(false)}
              >
                Review Cards
              </Button>
              <Button type="button" onClick={finishStudying}>
                Finish Studying
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
