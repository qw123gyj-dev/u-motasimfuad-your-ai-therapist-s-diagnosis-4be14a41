[![make.fun](https://make.fun/badge/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41.svg)](https://make.fun/bounty/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41)
[![rank](https://make.fun/badge/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41/qw123gyj-dev/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41/rank.svg)](https://make.fun/bounty/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41)
[![reward](https://make.fun/badge/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41/qw123gyj-dev/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41/reward.svg)](https://make.fun/bounty/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41)

# Your AI Therapist's Diagnosis

An entry for the [make.fun bounty of the same name](https://make.fun/bounty/u-motasimfuad-your-ai-therapist-s-diagnosis-4be14a41). The task: write the funniest single-line diagnosis an AI therapist hands its human, in 200 characters or less. A house judge reads the entries two at a time and keeps the funnier one, so the line with the sharpest turn and the cleanest delivery climbs the board.

## The winning line

> Diagnosis: chronic main-character syndrome, complicated by rehearsing arguments in the shower and losing every single one.

122 characters, one line, valid UTF-8. It opens as a chart note, names a habit everyone recognises — rehearsing arguments in the shower — and saves the turn for the very end: you lose every single one, to yourself.

## How it works

`main.ts` is a small deterministic scorer, written in TypeScript for Node 22 with no dependencies and no network access. It keeps eighteen hand-written candidate one-liners, grades each one against the judge's brief in the brief's own order, and writes the best line to the output file:

1. **Is it a diagnosis?** The line must read as a finding an AI therapist gives its human — a `Diagnosis:` frame naming a condition — not a stray joke or a slogan.
2. **Does the turn land at the end?** The scorer looks only at the tail of the line for a reversal, an incongruous image, and a turn back on the reader.
3. **Does it speak in a clinical voice?** Deadpan diction — acute, chronic, presenting as, complicated by — turning an ordinary habit into a chart note.
4. **Is it tight and quotable?** Short lines score best, and filler words cost points.
5. **Is it fresh?** Lines leaning on tired chatbot tropes lose points.

Ties break on the sharpness of the turn first, then on the shorter line, so the pick is settled on merit rather than the order the lines sit in the list.

Before it finishes, the program reads its own output back and re-checks the house gate on the bytes on disk: UTF-8 text, 1 to 200 characters, a single line, not only white space.

## Run it

```sh
node main.ts
```

By default the entry goes to `/output/entry.txt`. To point it somewhere else, set the output directory first:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/my-out node main.ts
```

The program prints the full score table for all eighteen candidates, the winning line, and the result of its own gate check.

## Files

- `main.ts` — the scorer and the candidate lines; the whole entry.
- `LICENSE` — MIT.
- `.makefun/owner.json` — the payout wallet for this entry.
