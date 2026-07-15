---
layout: post
title: "Drag and Drop for the Player Character"
---

{% include ai-disclaimer.html %}

During play-testing, my daughter kept trying to pick the player character up
with her finger and carry it around. The game had no such feature, so nothing
happened. This post covers the spec that turned that gesture into one —
press and drag picks the character up, release drops it, it falls to the
ground, and normal play resumes — and the implementation details worth
keeping track of.

![Three frames of a drag in the pool scene: held over the water, falling after release, standing on the ground.]({{ '/sdl-adventure-game/assets/drag-and-drop-sequence.png' | relative_url }})

## Three optional states

The actor state machine gains `DRAGGED`, `FALLING` and `LANDING`, next to the
existing `IDLE` / `WALKING` / `TALKING`. Each state can have its own sprite
sheet (dangling legs, flapping wings, a touchdown squat), but all three are
optional: a missing sheet falls back to the idle sheet through the render
fallback that already existed. That made the feature shippable before any of
its art exists — the three sheets are tracked as tasks in the adventure's
asset manifest and will slot in without code changes.

The fall itself is one line of math: a constant `FALL_SPEED` (420 px/s), no
gravity integration. For this game's tone that is also the more fitting look
— a hen flutters down rather than plummeting — and the future flapping
animation justifies the terminal-velocity-from-frame-one motion.

## Landing without a z axis

The open design question was where a dropped character lands. The drag moves
the sprite anywhere on screen, including "in the air", and the scene has no
z axis to say how high that is.

The answer: the game already has a ground model. Every walkable scene has a
[walk grid]({% post_url 2026-07-04-pathfinding-around-obstacles-with-a-walk-grid-and-a-star %})
— a coarse boolean raster of where the character may stand. A drag position
can be read as "in the air over column x", and the drop becomes a straight
scan down that grid column:

```c
// The centre of the first walkable cell at or below the drop point, in the
// drop point's grid column; nothing below falls back to the nearest
// walkable point overall.
static SDL_FPoint drop_target(const WalkGrid *grid, SDL_FPoint from) {
  int cx = (int)from.x / WALK_CELL_SIZE;
  for (int cy = start; cy < grid->h; cy++) {
    if (grid->cells[cy][cx]) {
      return (SDL_FPoint){from.x, cy * WALK_CELL_SIZE + WALK_CELL_SIZE / 2.0F};
    }
  }
  return walk_grid_nearest(grid, ...);
}
```

If the nearest ground is at or above the drop point (dropped below the
floor, or off the scene), the character is placed there directly instead of
"falling" upward. Fall height, if a later polish pass wants to scale the
landing reaction by it, is the same subtraction.

Two properties fall out of this for free:

- **Puzzle rules hold themselves.** The scan runs on the scene's *live*
  grid. In the pool scene the walkable area is a function of game state —
  only the umbrella's shadow is walkable before the sunscreen is applied —
  so a pre-sunscreen drop anywhere on screen lands back in the shade, and
  since the water is never walkable, no drop can end in the pool. The drag
  toy and the puzzle logic share one source of truth, with zero
  drag-specific rules.
- **No new coordinate system.** One detail differs from the spec text,
  which said "feet": the walk grid is authored against the sprite *centre*,
  so the landing target is computed in centre coordinates like every walk
  target. Same subtraction, same fall height, one convention instead of two.

## The playthrough caught a spec bug

The spec said a press on the character is consumed by the drag system, on
the theory that tapping the character was already a no-op. The headless
playthrough — which replays the whole adventure and asserts every line of
dialogue — went red the moment that was implemented, and it was right to:
in the pool scene the character starts *standing on* the sunscreen bottle's
hotspot. The test taps the bottle; the drag system swallowed the press; the
minigame never opened. A real regression, and exactly what a small player
would hit.

The fix inverts the priority. A press on the character arms the drag but
still **falls through** to the scene, so plain taps behave exactly as before
— [hotspots]({% post_url 2026-07-12-from-imperative-click-handlers-to-declarative-hotspots %})
keep working even with the character in front of them. Only when the
pointer travels past a small threshold (8 px) does the drag *steal* the
character, cancelling whatever walk the press just started — grabbing
already cancels walks, so this needed no extra machinery. One loose end from
the fall-through: if the press hits a navigation hotspot and switches
scenes, the release never arrives in the old scene. The armed press is
disarmed by checking the button mask that SDL carries on every motion
event.

Two smaller decisions from the same family:

- Grabbing is refused only while `TALKING` (matching walks). In particular a
  character can be **caught mid-fall**, which costs nothing to allow and is
  clearly the better toy.
- Walks and dialogue are refused while dragged or falling, so an airborne
  character can't start walking or deliver a line from mid-air.

## Verification

Eighteen new headless checks drive synthesized mouse events through
`walk_actor_drag_event`: the tap fall-through, the threshold grab, pointer
following, the descent speed, the column landing, the under-ground snap-up,
a mid-walk grab dropping the walk's callback, the mid-fall catch, the
`TALKING` refusal, the landing beat, and the shade invariant. The full
scripted playthrough passes byte-identical, and a Playwright run in the
browser confirmed the sequence in the screenshots above — including tapping
the bottle through the character, which is the case the spec got wrong.

Of the liveliness spec this came from, one part remains: idle fidgets — a
short peck or blink after a few seconds without input. Like the drag sheets,
it is art-gated; the engine side is small.
