---
layout: post
title: "From Imperative Click Handlers to Declarative Hotspots"
redirect_from:
  - /sdl-adventure-game/2026/07/12/tables-not-branches.html
---

{% include ai-disclaimer.html %}

After a project health review, one refactoring stood out as worth doing right
away: every scene in the game handled clicks with the same hand-rolled
`if`-chain, and every scene wrote its interactions down *twice*. This post is
about replacing those chains with a table and a twenty-line dispatcher: instead
of *implementing* its click handling as control flow, each scene now *declares*
its interactions as data.

## The same shape, six times

A point-and-click scene is, at heart, a list of "tapping *this region* does
*that thing*". But in the code, each scene expressed that list as a chain of
conditionals in its mouse handler:

```c
if (SDL_PointInRect(&m_pos, &GATE_HOTSPOT)) {
  walk_actor_to(fox, &walk_grid, (SDL_FPoint){GATE_POI.x, GATE_POI.y},
                true, maybe_open_gate);
  break;
}
// If key has been revealed yet skip this case
if (!has_key_been_revealed && SDL_PointInRect(&m_pos, &SHOVEL_HOTSPOT)) {
  walk_actor_to(fox, &walk_grid, (SDL_FPoint){SHOVEL_POI.x, SHOVEL_POI.y},
                true, maybe_dig_out_key);
  break;
}
// If key hasn't been revealed yet, or if key has been picked up already,
// then skip this case
if (has_key_been_revealed && !has_key &&
    SDL_PointInRect(&m_pos, &KEY_HOTSPOT)) {
  ...
```

Six scenes across two adventures, each with three to seven of these branches,
all the same shape: *maybe a state check, a rect test, a walk with a callback,
break*. The comments over the state checks — "if key has been revealed yet
skip this case" — were doing the work the code should have been doing: naming
the rule.

And there was a second copy. The [debug
overlay]({% post_url /sdl-adventure-game/2025-01-16-debug-overlay %}) draws every
hotspot rect, so each scene also kept an `SDL_Rect` array of its hotspots —
listing the same regions the `if`-chain tested, with nothing tying the two
together. Add a hotspot to the chain and forget the array, and the overlay
shows the wrong regions.

## Move the behaviour into the table

The fix follows from the duplication: the rect table already exists — let it
carry the behaviour too. A hotspot is now a struct:

```c
typedef struct hotspot {
  SDL_Rect rect;
  bool (*enabled)(void); // NULL = always
  SDL_Point poi;         // where the actor walks before acting
  bool immediate;        // fire on the click itself, no walk
  void (*on_arrive)(void);
} Hotspot;
```

and a scene declares its interactions as data, in its `init`:

```c
hotspots[i++] = (Hotspot){
    .rect = GATE_HOTSPOT, .poi = GATE_POI, .on_arrive = maybe_open_gate};
hotspots[i++] = (Hotspot){.rect = SHOVEL_HOTSPOT,
                          .enabled = key_still_buried,
                          .poi = SHOVEL_POI,
                          .on_arrive = maybe_dig_out_key};
hotspots[i++] = (Hotspot){.rect = KEY_HOTSPOT,
                          .enabled = key_on_the_ground,
                          .poi = KEY_POI,
                          .on_arrive = add_key_to_inventory};
```

One dispatcher in the engine walks the table — first enabled hotspot
containing the click wins, the actor walks to its `poi` and the callback fires
on arrival (or immediately, for navigation arrows and buttons) — and the
scene's mouse handler shrinks to a single question:

```c
if (hotspots_handle_click(hotspots, LEN(hotspots), fox, &walk_grid, m_pos)) {
  break;
}
// Otherwise: walk to the clicked point.
```

Table order *is* priority, exactly like the old chain's top-to-bottom order,
so behaviour is unchanged by construction. The `poi` reuses the existing
[walk-then-act machinery]({% post_url /sdl-adventure-game/2026-07-04-pathfinding-around-obstacles-with-a-walk-grid-and-a-star %})
— an exact-goal walk with a completion callback — so the dispatcher didn't
need any new movement code.

My favourite part is what happened to the state checks. `!has_key_been_revealed`
inlined in a condition became a named predicate:

```c
static bool key_still_buried(void) { return !has_key_been_revealed; }
```

The comment that used to explain the check *is now its name*. The squirrel
scene reads `.enabled = squirrel_has_the_peg`; the pool reads
`.enabled = before_sunscreen`. The sunscreen bottle, which used to be one
branch with two behaviours tangled inside, became two table entries: one
gated on `before_sunscreen` that walks over and starts the minigame, one on
`after_sunscreen` that just has Gina say she's already done — the same
object meaning two things at different times, expressed as two lines.

## The overlay reflects hotspot state for free

Because the table now records *when* a hotspot is active, the debug overlay can
show it: enabled hotspots draw bright, gated-off ones dim. Here is the
playground entrance before and after digging up the key — the shovel and key
hotspots trade places, and you can see the scene's state without clicking
anything:

![The entrance scene's debug overlay before and after digging: the key hotspot is dim until the shovel reveals it, then the shovel dims and the key brightens.]({{ '/sdl-adventure-game/assets/hotspots-overlay-flip.png' | relative_url }})

That's the whole point of the single source of truth: the overlay stopped
drawing where hotspots *are* and started drawing what a click *would actually
do right now*. Before, that information existed only implicitly, scattered
through the `if`-chain.

## The line count went up

I wrote an acceptance criterion for this task: net lines of code in the
scenes should go down. It didn't — the diff added about thirty more lines
than it removed. The deleted lines were dense branches; the added ones are
named predicates, forward declarations, and one struct literal per hotspot.
Measuring simplicity in line count misses what changed: a scene's
interactions are now enumerable in one place, gating rules have names instead
of comments, and the compiler-checked table replaces a convention nobody was
checking. But the criterion was wrong and it's worth saying so plainly,
because "the diff is red" is such a tempting proxy for "the code got simpler".

Not everything was forced into the table. The playground keeps a prelude
before the dispatch — after enough trips down the slide, *any* click ends the
scene — and the pool keeps its fall-through where Gina refuses to leave the
shade before her sunscreen is on. Escape hatches like these are why the
dispatcher returns `false` instead of forcing every case through the table: a
table for the regular cases, plain code for the two that aren't.

Verification was the pleasant kind: the headless playthrough asserts the
whole of Gina's adventure dialogue in order, and it passed byte-identical.
The fox's chain — dig, key, gate, tree, squirrel, slide — I re-played in the
browser, watching the overlay's dim rects light up on cue as the story
unlocked them.
