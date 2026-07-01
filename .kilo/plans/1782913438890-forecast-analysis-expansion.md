# Forecast Analysis Expansion

**File to modify:** `src/lib/lotto.ts`

## Goal

Expand the existing `forecast()` function to include 5 additional analyses, all triggered by the existing `F <number>` command, in a single well-structured block.

## Current Behavior

- `F 1` returns hot, cold, due numbers and a 6-number play pick for the current year.

## New Analyses

1. **Frequency Heatmap** — numbers appearing in last 30, 60, and 90 days
2. **Pair/Triple Co-occurrence** — most frequent pairs/triples in the same draw
3. **Sum & Spread Analysis** — sum of drawn numbers and max−min spread per draw
4. **Odd/Even & High/Low Balance** — odd/even split and high (50–99) vs low (1–49) ratio
5. **Repeat Rate** — carry-over frequency per number from the previous draw

## Constraints

- All 5 analyses display in a single `F 1` reply, sectioned with emoji headers matching existing style
- When a game has < 30 draws, show "insufficient data" placeholders for analyses that need more data
- Keep the existing 6-number **Play** pick unchanged (hot+due logic)
- No UI changes — pure logic expansion in `src/lib/lotto.ts`
- Maintain existing formatting style (emoji headers, `•` separators, padded numbers)

## Validation

- Run `npm run lint` after changes
- Test `F 1` in chat UI to verify output formatting and readability
