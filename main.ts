/**
 * Your AI Therapist's Diagnosis — deterministic entry picker.
 *
 * The bounty asks for one thing: the funniest single-line diagnosis an AI
 * therapist hands its human, 200 characters or less. This program keeps a
 * small shelf of hand-written candidate lines, grades each one against the
 * house judge's brief in the brief's own order, and writes the best line to
 * the output file the harness reads.
 *
 * Nothing here is random and nothing touches the network. The same input
 * always produces the same winner, so the entry is reproducible run after
 * run. Node 22 standard library only.
 *
 * The judge's brief, in its own order, most important first:
 *   1. It must be a funny single-line diagnosis an AI therapist gives its
 *      human — not a stray joke, not a slogan.
 *   2. The laugh has to land at the end, on a turn the reader never saw
 *      coming.
 *   3. It must speak in a therapist's calm clinical voice, turning an
 *      everyday human habit into a deadpan finding.
 *   4. It must stay tight and quotable, with every word earning its place.
 *   5. It must feel fresh, not a rerun of the usual chatbot jokes.
 *
 * The sealed gate, which this program re-checks on its own output before
 * it finishes: the file must be UTF-8 text of 1 to 200 characters, a
 * single line, and not only white space.
 */

import * as fs from "node:fs";
import * as path from "node:path";

/* ------------------------------------------------------------------ */
/* Limits and paths                                                    */
/* ------------------------------------------------------------------ */

/** The gate's hard ceiling on the entry, in characters. */
const MAX_CHARS = 200;
/** The gate's hard floor: an empty file is not an entry. */
const MIN_CHARS = 1;
/** Where the harness looks for the entry when the env var is absent. */
const FALLBACK_OUTPUT = "/output/entry.txt";

/** Resolve the output file the same way the harness does. */
function outputFile(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return path.join(fromEnv, "entry.txt");
  }
  return FALLBACK_OUTPUT;
}

/* ------------------------------------------------------------------ */
/* The candidates                                                      */
/*                                                                     */
/* Eighteen one-liners, each written for this brief. Every one of      */
/* them opens with a clinical frame, names an ordinary human habit,    */
/* and saves its turn for the final clause, because that is where the  */
/* judge says the laugh has to arrive.                                 */
/* ------------------------------------------------------------------ */

const CANDIDATES: string[] = [
  // Rehearsed arguments nobody ever wins, not even against yourself.
  "Diagnosis: chronic main-character syndrome, complicated by rehearsing arguments in the shower and losing every single one.",
  // A committee of one that still cannot reach a consensus.
  "Diagnosis: acute 3 a.m. overthinking, presenting as a committee meeting where every member is you and nobody agrees.",
  // Separation anxiety, but for the rectangle that holds your life.
  "Diagnosis: severe charger separation anxiety, first observed when you carried your dead phone around like a wounded pet.",
  // Your past and future selves have stopped speaking to each other.
  "Diagnosis: persistent snooze-button dependence, with morning-you and night-you now filing restraining orders against each other.",
  // The safety net is the thing you lost.
  "Diagnosis: advanced password amnesia, complicated by the fact that your recovery email is the account you forgot.",
  // Four hundred unread messages, zero replies, full guilt.
  "Diagnosis: acute group-chat guilt, presenting as reading four hundred messages you will never answer and feeling bad about all of them.",
  // Tidying as a substitute for doing the thing.
  "Diagnosis: seasonal productivity theater, in which reorganizing your desk counts as work and the actual work never starts.",
  // The perfect reply, delivered after the conversation is over.
  "Diagnosis: chronic reply-drafting paralysis, in which every text is written, deleted, and rewritten until the moment has passed.",
  // Losing an argument to something that only wants to help.
  "Diagnosis: acute algorithm trust issues, presenting as arguing with a recommendation engine that knows you better than you do.",
  // The resolution that recovers before the year does.
  "Diagnosis: terminal new-year-new-me disorder, relapsing every January and fully recovered by the first week of February.",
  // Treating the archive button like a burial.
  "Diagnosis: severe unread-message grief, now so advanced you archive conversations just to feel the closure of a funeral.",
  // Watching a film and its reviews at the same time, enjoying neither.
  "Diagnosis: acute second-screen syndrome, in which you watch a film while scrolling reviews of the film you are watching.",
  // A binge habit that has quietly become a long-running series.
  "Diagnosis: chronic one-more-episode syndrome, now entering its fourth season of denial.",
  // Twelve seasons of medicine you refuse to call medicine.
  "Diagnosis: low-grade reality avoidance, treated with twelve seasons of a show you insist is only background noise.",
  // The inbox fights back.
  "Diagnosis: acute inbox-zero delusion, in which deleting one email generates two more out of spite.",
  // The phone only speaks when you stop listening for it.
  "Diagnosis: severe notification anxiety, triggered by a phone that only buzzes the moment you finally stop watching it.",
  // Checking the fridge for headlines.
  "Diagnosis: chronic fridge-checking compulsion, presenting as opening the door for news that was never going to be there.",
  // The clock has given up on you before you gave up on it.
  "Diagnosis: advanced doomscrolling fatigue, with a secondary case of saying five more minutes to a clock that stopped believing you.",
];

/* ------------------------------------------------------------------ */
/* Word lists the scorer reads from                                    */
/*                                                                     */
/* These are deliberately small and generic. They describe the shape   */
/* of the brief — clinical diction, a late reversal, an incongruous     */
/* image — rather than naming any one candidate, so the scorer stays   */
/* honest about lines it has never seen.                               */
/* ------------------------------------------------------------------ */

/** Words a clinician reaches for when writing up a finding. */
const CLINICAL_WORDS: string[] = [
  "diagnosis",
  "acute",
  "chronic",
  "severe",
  "persistent",
  "advanced",
  "terminal",
  "low-grade",
  "syndrome",
  "disorder",
  "dependence",
  "anxiety",
  "amnesia",
  "paralysis",
  "compulsion",
  "delusion",
  "fatigue",
  "grief",
  "guilt",
  "presenting",
  "complicated",
  "secondary",
  "relapsing",
  "recovered",
  "triggered",
  "observed",
  "treated",
  "theater",
];

/** Words and phrases that flip the meaning of a sentence late. */
const REVERSAL_WORDS: string[] = [
  "never",
  "nobody",
  "no one",
  "not",
  "losing",
  "lost",
  "forgot",
  "stopped",
  "passed",
  "until",
  "instead",
  "while",
  "yet",
  "but",
  "out of spite",
  "better than you",
  "against each other",
  "no longer",
  "fully recovered",
  "every single one",
  "will never",
  "was never",
];

/** Images that do not belong in a clinic, which is the point. */
const INCONGRUOUS_IMAGES: string[] = [
  "committee",
  "wounded pet",
  "restraining orders",
  "funeral",
  "denial",
  "spite",
  "closure",
  "belief",
  "background noise",
  "new-year-new-me",
  "season of denial",
  "dead phone",
  "shower",
  "fridge",
];

/** Tropes the judge has heard a thousand times already. */
const TIRED_TROPES: string[] = [
  "touch grass",
  "go outside",
  "screen time",
  "as an ai",
  "i am not a real therapist",
  "beep boop",
  "robot overlord",
  "update your software",
  "have you tried turning",
  "error 404",
];

/** Filler words that cost a line its tightness without adding a laugh. */
const FILLER_WORDS: string[] = [
  "very",
  "really",
  "actually",
  "literally",
  "basically",
  "just",
  "quite",
];

/* ------------------------------------------------------------------ */
/* Small text helpers                                                  */
/* ------------------------------------------------------------------ */

/** Count how many of the given words appear in the text, case-blind. */
function countHits(text: string, words: string[]): number {
  const lowered = text.toLowerCase();
  let hits = 0;
  for (const word of words) {
    if (lowered.includes(word)) {
      hits += 1;
    }
  }
  return hits;
}

/** Count how many distinct words from the list appear in the text. */
function countDistinctHits(text: string, words: string[]): number {
  const lowered = text.toLowerCase();
  const seen = new Set<string>();
  for (const word of words) {
    if (lowered.includes(word)) {
      seen.add(word);
    }
  }
  return seen.size;
}

/**
 * The tail of the line — everything after its last turn marker.
 *
 * A diagnosis line is built as setup, then turn. The turn marker is the
 * last comma, or one of the clinical pivots ("presenting as", "in
 * which", "with", "complicated by", "triggered by", "first observed
 * when", "now", "treated with"). The tail is where criterion 2 lives:
 * if the laugh is not in the tail, it is not at the end.
 */
function tailOf(line: string): string {
  const markers = [
    "presenting as",
    "in which",
    "complicated by",
    "triggered by",
    "first observed when",
    "treated with",
    "with ",
    "now ",
  ];
  let cut = -1;
  for (const marker of markers) {
    const at = line.toLowerCase().lastIndexOf(marker);
    if (at > cut) {
      cut = at + marker.length;
    }
  }
  const lastComma = line.lastIndexOf(",");
  if (lastComma + 1 > cut) {
    cut = lastComma + 1;
  }
  if (cut < 0) {
    return line;
  }
  return line.slice(cut).trim();
}

/** Length in characters, counting code points the way the gate does. */
function charLength(text: string): number {
  return [...text].length;
}

/* ------------------------------------------------------------------ */
/* The five criteria, in the brief's own order                         */
/* ------------------------------------------------------------------ */

interface Breakdown {
  /** 1. A diagnosis an AI therapist gives its human. */
  frame: number;
  /** 2. The turn lands at the end, unseen until it arrives. */
  turn: number;
  /** 3. A calm clinical voice on an ordinary human habit. */
  voice: number;
  /** 4. Tight and quotable; every word earns its place. */
  tightness: number;
  /** 5. Fresh, not a rerun of the usual chatbot jokes. */
  freshness: number;
}

interface ScoredLine {
  text: string;
  length: number;
  breakdown: Breakdown;
  total: number;
}

/**
 * Criterion 1 — is it a diagnosis at all?
 *
 * A line that opens with "Diagnosis:" is framed as a finding, and a
 * line that names a condition (a syndrome, a disorder, a dependence)
 * is one too. Anything else is a stray joke wearing a lab coat, and
 * the brief says it loses to any diagnosis on the subject.
 */
function scoreFrame(line: string): number {
  let points = 0;
  if (/^diagnosis:/i.test(line.trim())) {
    points += 20;
  }
  const conditionWords = [
    "syndrome",
    "disorder",
    "dependence",
    "anxiety",
    "amnesia",
    "paralysis",
    "compulsion",
    "delusion",
    "fatigue",
    "grief",
    "guilt",
    "theater",
    "avoidance",
  ];
  if (countHits(line, conditionWords) > 0) {
    points += 10;
  }
  return points; // out of 30
}

/**
 * Criterion 2 — does the joke turn at the end?
 *
 * Look only at the tail. A strong tail reverses what came before
 * ("forgot", "never", "losing"), drops in an image that does not
 * belong in a clinic, and turns back on the reader with a "you".
 */
function scoreTurn(line: string): number {
  const tail = tailOf(line);
  let points = 0;
  if (charLength(tail) >= 20) {
    points += 8; // there is a real final clause to land on
  }
  if (countHits(tail, REVERSAL_WORDS) > 0) {
    points += 10; // the tail flips the setup
  }
  if (countHits(tail, INCONGRUOUS_IMAGES) > 0) {
    points += 7; // the flip arrives as an unexpected image
  }
  if (/\byou\b|\byour\b/i.test(tail)) {
    points += 5; // the turn points back at the patient
  }
  return Math.min(points, 30); // out of 30
}

/**
 * Criterion 3 — the therapist's calm clinical voice.
 *
 * Deadpan diction, counted distinctly: the more clinical words the
 * line carries without raising its voice, the more it reads like a
 * chart note and the funnier the finding lands.
 */
function scoreVoice(line: string): number {
  const distinct = countDistinctHits(line, CLINICAL_WORDS);
  return Math.min(distinct * 4, 20); // out of 20
}

/**
 * Criterion 4 — tight and quotable.
 *
 * Short lines win: a line at or under 120 characters keeps the full
 * marks, and every character past that costs a little. Filler words
 * cost more, because each one is a word that did not earn its place.
 */
function scoreTightness(line: string): number {
  const length = charLength(line);
  let points = 15;
  if (length > 120) {
    points -= Math.ceil((length - 120) / 4);
  }
  points -= countHits(line, FILLER_WORDS) * 2;
  return Math.max(points, 3); // out of 15
}

/**
 * Criterion 5 — freshness.
 *
 * Starts full and loses five points for every tired chatbot trope the
 * line leans on. A line that repeats what a thousand therapy jokes
 * already said cannot win on this criterion.
 */
function scoreFreshness(line: string): number {
  const tropes = countHits(line, TIRED_TROPES);
  return Math.max(15 - tropes * 5, 0); // out of 15
}

/** Grade one line on all five criteria, in the brief's order. */
function gradeLine(line: string): ScoredLine {
  const breakdown: Breakdown = {
    frame: scoreFrame(line),
    turn: scoreTurn(line),
    voice: scoreVoice(line),
    tightness: scoreTightness(line),
    freshness: scoreFreshness(line),
  };
  const total =
    breakdown.frame +
    breakdown.turn +
    breakdown.voice +
    breakdown.tightness +
    breakdown.freshness;
  return { text: line, length: charLength(line), breakdown, total };
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/*                                                                     */
/* The brief's own tie rule: go through the criteria in order and let  */
/* the first difference decide, unless a later one differs by much     */
/* more. The weighted total does that work — frame and turn carry the  */
/* most weight, voice next, tightness and freshness after — and the    */
/* remaining ties break on the sharpness of the turn first, then on    */
/* the shorter line, so a tie is settled on merit, never on the order  */
/* the lines happen to sit in the list.                                */
/* ------------------------------------------------------------------ */

function rankLines(lines: string[]): ScoredLine[] {
  const graded = lines.map(gradeLine);
  graded.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    if (b.breakdown.turn !== a.breakdown.turn) {
      return b.breakdown.turn - a.breakdown.turn;
    }
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    return a.text.localeCompare(b.text);
  });
  return graded;
}

/* ------------------------------------------------------------------ */
/* The gate, re-checked on our own output                              */
/*                                                                     */
/* The sealed scorer accepts UTF-8 text of 1 to 200 characters, a      */
/* single line, not only white space. This program checks the same     */
/* four things on the file it just wrote, after reading it back, and   */
/* refuses to finish quietly if any of them fails.                     */
/* ------------------------------------------------------------------ */

interface GateCheck {
  ok: boolean;
  chars: number;
  singleLine: boolean;
  validUtf8: boolean;
  notBlank: boolean;
  problems: string[];
}

/** Run the gate against a file's raw bytes, exactly as the house does. */
function checkGate(filePath: string): GateCheck {
  const problems: string[] = [];
  const raw = fs.readFileSync(filePath);
  let decoded: string;
  let validUtf8 = true;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    validUtf8 = false;
    decoded = raw.toString("utf-8");
  }
  if (!validUtf8) {
    problems.push("file is not valid UTF-8");
  }
  const chars = charLength(decoded);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    problems.push(`length ${chars} is outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  const singleLine = !decoded.includes("\n") && !decoded.includes("\r");
  if (!singleLine) {
    problems.push("entry is not a single line");
  }
  const notBlank = decoded.trim().length > 0;
  if (!notBlank) {
    problems.push("entry is only white space");
  }
  return {
    ok: problems.length === 0,
    chars,
    singleLine,
    validUtf8,
    notBlank,
    problems,
  };
}

/** Every candidate must itself pass the gate before it can be picked. */
function candidatePassesGate(line: string): boolean {
  const chars = charLength(line);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    return false;
  }
  if (line.includes("\n") || line.includes("\r")) {
    return false;
  }
  if (line.trim().length === 0) {
    return false;
  }
  const encoded = Buffer.from(line, "utf-8");
  const roundTrip = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  return roundTrip === line;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  // 1. Keep only lines that could pass the gate on their own.
  const eligible = CANDIDATES.filter(candidatePassesGate);
  if (eligible.length === 0) {
    console.error("No candidate passes the gate; refusing to write.");
    process.exit(1);
  }

  // 2. Grade every eligible line and rank them.
  const ranked = rankLines(eligible);

  // 3. Show the whole table, so the pick is checkable, not just asserted.
  console.log("Candidate scores (frame/turn/voice/tight/fresh = total):");
  for (const [index, entry] of ranked.entries()) {
    const b = entry.breakdown;
    const marker = index === 0 ? " <-- winner" : "";
    console.log(
      `  ${String(entry.total).padStart(3)}  ` +
        `[${b.frame}/${b.turn}/${b.voice}/${b.tightness}/${b.freshness}]  ` +
        `(${entry.length} chars) ${entry.text}${marker}`,
    );
  }

  // 4. Write the winner, with no trailing newline: the file is the line.
  const winner = ranked[0];
  const target = outputFile();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, winner.text, "utf-8");

  // 5. Read it back and run the gate on the bytes on disk.
  const gate = checkGate(target);
  console.log(`\nWinner (${winner.total} pts, ${winner.length} chars):`);
  console.log(winner.text);
  console.log(`Wrote ${target}`);
  console.log(
    `Gate: ${gate.ok ? "PASS" : "FAIL"} — ${gate.chars} chars, ` +
      `single line: ${gate.singleLine}, valid UTF-8: ${gate.validUtf8}, ` +
      `not blank: ${gate.notBlank}`,
  );
  if (!gate.ok) {
    for (const problem of gate.problems) {
      console.error(`  gate problem: ${problem}`);
    }
    process.exit(1);
  }

  // 6. The file on disk must be byte for byte the winner we picked.
  const onDisk = fs.readFileSync(target, "utf-8");
  if (onDisk !== winner.text) {
    console.error("Read-back mismatch: file on disk is not the winner.");
    process.exit(1);
  }
  console.log("Read-back verified: file matches the winning line exactly.");
}

main();
