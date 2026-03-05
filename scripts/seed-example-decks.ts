/**
 * Seed script: adds two example decks with cards for user_3AXIQGurKDR90JUwr9wKJnPedEW
 * Run from project root: npx tsx scripts/seed-example-decks.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local before any db access
config({ path: resolve(process.cwd(), ".env.local") });

const USER_ID = "user_3AXIQGurKDR90JUwr9wKJnPedEW";

const SPANISH_DECK = {
  ownerId: USER_ID,
  title: "Learn Spanish from English",
};

const SPANISH_CARDS = [
  { front: "Hello", back: "Hola" },
  { front: "Goodbye", back: "Adiós" },
  { front: "Please", back: "Por favor" },
  { front: "Thank you", back: "Gracias" },
  { front: "Yes", back: "Sí" },
  { front: "No", back: "No" },
  { front: "Water", back: "Agua" },
  { front: "Food", back: "Comida" },
  { front: "House", back: "Casa" },
  { front: "Book", back: "Libro" },
  { front: "Friend", back: "Amigo / Amiga" },
  { front: "Family", back: "Familia" },
  { front: "Time", back: "Tiempo" },
  { front: "Day", back: "Día" },
  { front: "Night", back: "Noche" },
];

const BRITISH_HISTORY_DECK = {
  ownerId: USER_ID,
  title: "British History",
};

const BRITISH_HISTORY_CARDS = [
  {
    front: "In what year did the Battle of Hastings take place?",
    back: "1066. William the Conqueror defeated King Harold II.",
  },
  {
    front: "Which king had six wives?",
    back: "Henry VIII (1491–1547). Catherine of Aragon, Anne Boleyn, Jane Seymour, Anne of Cleves, Catherine Howard, Catherine Parr.",
  },
  {
    front: "When was the Magna Carta signed?",
    back: "1215. King John signed it at Runnymede, limiting the king’s power.",
  },
  {
    front: "What was the period of civil wars in England (1642–1651) called?",
    back: "The English Civil War(s). Fought between Parliamentarians and Royalists.",
  },
  {
    front: "Who led the Parliamentarian forces in the English Civil War?",
    back: "Oliver Cromwell. He later became Lord Protector of the Commonwealth.",
  },
  {
    front: "In what year did the Great Fire of London occur?",
    back: "1666. It destroyed much of the medieval City of London.",
  },
  {
    front: "When did the Acts of Union unite England and Scotland?",
    back: "1707. The Kingdom of Great Britain was formed.",
  },
  {
    front: "Which British queen reigned for over 63 years in the 19th century?",
    back: "Queen Victoria (1837–1901). The Victorian era is named after her.",
  },
  {
    front: "In what year did Britain join the European Economic Community?",
    back: "1973. The UK left the EU in 2020 (Brexit).",
  },
  {
    front: "Who was the British Prime Minister during most of World War II?",
    back: "Winston Churchill (1940–1945 and 1951–1955).",
  },
  {
    front: "When did the Romans first invade Britain?",
    back: "43 AD under Emperor Claudius. Earlier contact included Caesar’s expeditions in 55 and 54 BC.",
  },
  {
    front: "What was the name of the period when the monarchy was abolished in England?",
    back: "The Interregnum (1649–1660). England was a republic, the Commonwealth.",
  },
  {
    front: "Which treaty in 1707 created the Kingdom of Great Britain?",
    back: "The Acts of Union 1707 united the Kingdom of England and the Kingdom of Scotland.",
  },
  {
    front: "When did women over 30 gain the right to vote in the UK?",
    back: "1918. Women over 21 gained equal voting rights in 1928.",
  },
  {
    front: "Who was the first female Prime Minister of the United Kingdom?",
    back: "Margaret Thatcher (1979–1990). She was leader of the Conservative Party.",
  },
];

async function seed() {
  const { db } = await import("../src/db");
  const { decksTable, cardsTable } = await import("../src/db/schema");

  console.log("Seeding example decks for user", USER_ID, "...");

  const [spanishDeck] = await db
    .insert(decksTable)
    .values(SPANISH_DECK)
    .returning({ id: decksTable.id });

  if (!spanishDeck) throw new Error("Failed to create Spanish deck");
  const spanishDeckId = spanishDeck.id;

  await db.insert(cardsTable).values(
    SPANISH_CARDS.map((c) => ({
      deckId: spanishDeckId,
      front: c.front,
      back: c.back,
    }))
  );
  console.log(`  Created deck "Learn Spanish from English" with ${SPANISH_CARDS.length} cards.`);

  const [historyDeck] = await db
    .insert(decksTable)
    .values(BRITISH_HISTORY_DECK)
    .returning({ id: decksTable.id });

  if (!historyDeck) throw new Error("Failed to create British History deck");
  const historyDeckId = historyDeck.id;

  await db.insert(cardsTable).values(
    BRITISH_HISTORY_CARDS.map((c) => ({
      deckId: historyDeckId,
      front: c.front,
      back: c.back,
    }))
  );
  console.log(`  Created deck "British History" with ${BRITISH_HISTORY_CARDS.length} cards.`);

  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
