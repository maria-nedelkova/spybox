# Starter prompt: Spybox

A starter prompt for this pixel-art arcade pet project (working name:
Spybox — a Boxworld/Sokoban recreation), built the same way
[Marmor](https://github.com/maria-nedelkova/marmor) was — see that repo's
`docs/` folder for the reference architecture, design log, and hard-won
debugging lessons this prompt bakes in.

---

## The game

Recreate **Boxworld** (a.k.a. Sokoban) — the 1992 shareware classic:
reference at https://classicreload.com/boxworld-full-game.html.

**Core rules:**
- A grid-based level with a player, movable boxes, wall tiles, floor tiles,
  and marked goal tiles.
- The player moves one tile at a time (arrow keys / WASD — this is a
  keyboard game, not click-to-move like Marmor). There's no jump, dash, or
  diagonal movement.
- Moving into a box pushes it one tile in the same direction, **only if**
  the tile beyond the box is open (not a wall, not another box). You cannot
  pull a box, only push it, and you can't push two boxes at once.
- A level is won when every box sits on a goal tile.
- A level can become unwinnable (a box pushed into a corner or against a
  wall with no goal there is stuck forever) — the player needs a fast way
  out of that, not just a full restart every time (see Level flow below).

**Level flow (expected, players of this genre rely on it):**
- **Undo** (at least one step, ideally many) — this is a first-class
  feature in every real Sokoban implementation, not an afterthought.
- **Reset level** (instant, no confirmation needed — it's a puzzle, not a
  destructive action).
- A **move counter** and/or **push counter**, since minimizing pushes is
  part of the puzzle-solving appeal for this genre.
- Multiple levels in sequence, unlocked by completing the previous one (or
  all unlocked from the start — your call once we're building, but decide
  it explicitly rather than defaulting silently).

**Level data:** classic Sokoban levels are commonly authored as ASCII grids
(`#` wall, `.` floor, `$` box, `*` box-on-goal, `@` player, `+`
player-on-goal, space = void/unreachable). Author levels this way — it's a
well-established format, easy to hand-design, and easy to unit-test
(box/goal/wall counts, solvability isn't required to check but basic
well-formedness is).

**What's explicitly open for iteration, not to be decided up front:** the
visual theme/framing (Marmor became a "King vs. Pretender" duel partway
through — let that kind of framing emerge collaboratively rather than
locking in a mascot concept before there's a working game to hang it on),
exact level count and difficulty curve, and whether deadlock detection
(warning the player a level is now unsolvable, vs. just letting them
discover it) is worth building.

## Characters

A character-select screen at the start lets the player pick between two
**original** pixel-art characters, purely cosmetic (same Sokoban mechanics
either way, unless gameplay differences emerge later): a stealthy kid-agent
character and a fluffy dog companion. Concept vibe is "spy family," but the
designs must be original — not a recreation of any existing copyrighted
character (distinct palette, distinct signature features/markings from any
reference art used for inspiration). Don't reuse or closely trace specific
existing character designs, even for a free hobby project — this deploys
publicly on a custom domain the same way Marmor did.

## Art direction

**Full retro pixel-art**, sprites and UI alike — no smooth/vector chibi
art. Character sprites are hand-authored pixel-grid SVGs (same technique as
Marmor's marbles), matching the blocky 8bitcn UI chrome rather than
clashing with it (Marmor got flagged for a neon-marble/pixel-mascot style
mismatch — avoid repeating that here by keeping one aesthetic register
throughout).

## Stack (carried over from Marmor — it worked well)

- React 19 + TypeScript, [Bun](https://bun.sh) as runtime/bundler/dev
  server/test runner. No Vite/webpack.
- Tailwind CSS v4 + shadcn/[8bitcn](https://www.8bitcn.com) components for
  all UI chrome (buttons, dialogs, badges) — don't hand-roll buttons/modals
  when an 8bitcn primitive exists.
- All sound effects synthesized in real time with the Web Audio API — no
  audio files to author, license, or ship. (`src/audio/sound.ts` in Marmor
  is a good reference for the oscillator+envelope approach.)
- Pixel-art assets (sprites, cursor, favicon) as hand-authored SVGs using a
  crisp-edge pixel-grid approach (see `src/game/sprites/pixelRow.ts` and
  `src/cursor-arrow.svg` in Marmor) — not imported bitmap/PNG assets.
- One font throughout (pick one retro/pixel display font and use it for
  title, body, and UI chrome alike — don't mix a "gamey" display font with
  a plain system font for body text).

## Process conventions (the actual point of this prompt)

These aren't stylistic preferences — they're lessons paid for with real
debugging time on Marmor. Full writeups: `marmor/docs/LEARNINGS.md`.

1. **Set up `docs/` from day one**, not as an afterthought: `ARCHITECTURE.md`
   (code layers, and the "why" behind any non-obvious pattern),
   `DESIGN.md` (game-rule and UX decisions with reasoning), `DEPLOYMENT.md`
   (Vercel config once it exists), `LEARNINGS.md` (bugs and how the root
   cause was actually found). Update `LEARNINGS.md` the same session a
   nontrivial bug gets fixed, while the diagnosis is still fresh — not
   retroactively.
2. **For any "this feels wrong" complaint (slow, laggy, off), measure
   before guessing.** Add `performance.now()` instrumentation or an
   isolating A/B toggle and look at real numbers before changing code.
   Don't cycle through plausible-sounding fixes one at a time — that's what
   cost the most turns on Marmor's glide-animation bug.
3. **Default to plain React state for game logic and UI.** Only reach for
   an imperative `forwardRef` + `useImperativeHandle` pattern (direct DOM
   mutation, bypassing re-renders) for a visual that updates many times per
   second and is visually decoupled from the rest of the tree — e.g. if a
   box's push-slide animation ever needs per-frame position updates. If you
   do need it, animate `transform`, not `top`/`left` (compositor-only vs.
   layout-triggering). Don't reach for this pre-emptively — Boxworld's
   move-by-one-tile mechanic is much lower-frequency than Marmor's
   arbitrary-length glide, so plain state + a CSS transition may well be
   fine here. Profile before assuming otherwise.
4. **Revert every temporary debugging change in the same pass as the fix**
   — disabled CSS, extra logging, runtime flags, temporarily-changed
   constants for faster manual testing. Grep for `TEMP` markers before
   calling a fix done.
5. **Randomize repeatable end-state text** (level-complete messages,
   game-complete message) from a small pool rather than one fixed string —
   cheap to add, noticeably better for replay feel.
6. **Verify in-browser after each meaningful change** — typecheck and unit
   tests confirm correctness, not feel; actually play the level in a
   browser (or drive it via browser automation) before calling a change
   done, especially for anything animation- or input-feel related.
7. **Build iteratively, one change at a time**, reacting to how each one
   actually feels before moving to the next — that's how Marmor's design
   (spawn-blocking difficulty, the King/Pretender framing, the sound
   redesigns) actually converged on something good. Don't try to
   spec the whole game up front.

## Deployment

Same as Marmor: Bun build → static output → Vercel. Add `vercel.json`
(`installCommand: bun install`, `buildCommand: bun run build`,
`outputDirectory: dist`, `framework: null`) early so deploying is a
non-event once the game is playable, not a separate project at the end.
See `marmor/docs/DEPLOYMENT.md` for the full custom-domain flow if/when
that's wanted.
