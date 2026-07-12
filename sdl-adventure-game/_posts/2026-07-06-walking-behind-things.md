---
layout: post
title: "A Y-Sorted Action Layer for Depth Occlusion"
---

{% include ai-disclaimer.html %}

Since [pathfinding gave the fox routed
walks]({% post_url /sdl-adventure-game/2026-07-04-walking-around-things %}),
one flatness kept bothering me: she is always *in front* of everything. Every
scene's render function ended with the same line — draw the background, draw
the objects, draw the fox last — so she floats over the acorn pile even when
she's clearly standing behind it. The world reads as a painted backdrop with a
sticker on top. This post is about the smallest change that makes it read as a
place instead: a y-sorted action layer, the first slice of a larger depth and
camera plan.

![Two screenshots of the same acorn pile: standing above it the pile overdraws the fox, walking below it the fox overdraws the pile.]({{ '/sdl-adventure-game/assets/depth-overlap-flip.png' | relative_url }})

## One spec, four slices

Depth is one of three features that turned out to share a single foundation.
The plan (drafted with Claude, like the
[pathfinding]({% post_url /sdl-adventure-game/2026-07-04-walking-around-things %}) and
[lip-sync]({% post_url /sdl-adventure-game/2026-07-05-the-fox-learns-to-talk %}) ones,
and committed as `DEPTH_AND_CAMERA.md`) covers a simulated z-axis, scenes
wider than the 800×600 window with a camera that follows the player, and
parallax planes — and all three reduce to being careful about one distinction:
*screen* coordinates versus *scene* coordinates.

The spec splits into four phases, each an independent PR that leaves the game
working, and deliberately front-loads the ones that need no new art. Phase 1
is this post: props the actor can stand behind *and* in front of. No camera,
no new sprites, no scene data migrations — every scene that doesn't opt in
renders exactly as before.

## The painter and the ground line

The trick is as old as 2D adventure games: sort everything standing on the
ground by *where it touches the ground*, and draw back-to-front. Whoever's
contact line is lower on the screen is nearer the viewer and gets drawn later.

The engine had neither of the two numbers this needs. For the actor, the
awkward truth is that `current_position` — the point all the
[walk data]({% post_url /sdl-adventure-game/2026-07-04-walking-around-things %}) is
authored against — is the sprite's *centre*, not her feet. I didn't want to
migrate every position in every scene to a feet convention, so the two
conventions now coexist behind one explicit helper:

```c
// Scene y of the actor's ground-contact point. current_position is the
// sprite *centre*; y-sorting and depth bands need the feet instead.
float actor_feet_y(const Actor *actor);
```

For props, there is a new type. A `Prop` doesn't own an image — it points into
the scene's existing
[image and animation tables]({% post_url /sdl-adventure-game/2025-01-15-images-and-sprites %}),
so loading and teardown don't change at all. What it adds is the ground line,
and a visibility flag the scene toggles:

```c
typedef struct prop {
  ImageData *image;         // exactly one of image / animation is non-NULL
  AnimationData *animation;
  SDL_Point pos;            // top-left, scene coordinates
  int baseline;             // scene y of the ground-contact line
  bool visible;             // scenes toggle this (e.g. a picked-up item)
} Prop;
```

The scene then replaces its hand-ordered "props, then the fox last" block with
one call:

```c
render_action_layer(renderer, props, LEN(props), (Actor *[]){fox}, 1);
```

which sorts visible props (by `baseline`) and actors (by `actor_feet_y`)
ascending and draws them in that order. It's a stable insertion sort over at
most sixteen entries — a dozen comparisons per frame, not a data structure.
Stability is doing quiet work there: on a tie, whoever was inserted first
draws first, so props deliberately go in before actors and an actor standing
*exactly* on a prop's ground line reads as in front of it. The sort itself
lives in its own function, `action_layer_order()`, purely so the unit tests
can assert draw orders — including that tie — without ever creating a
renderer.

![Diagram: two actors and a prop on a ground strip; the actor whose feet are above the prop's baseline is drawn first, the one below is drawn last.]({{ '/sdl-adventure-game/assets/depth-baseline-diagram.png' | relative_url }})

## A demo with zero new art

The playground already had the perfect test subjects. When the squirrel shakes
the acorns loose they land on the ground as a little pile, and the peg she
trades them for lies on the grass until the fox picks it up. Both used to be
lines in the render function's state-dependent `if` ladder; both are now
props whose `visible` flag mirrors the same conditions, one assignment per
frame:

```c
acorn_pile_prop->visible =
    have_acorns_fallen && !has_acorns && !has_peg_been_dropped;
```

Everything else — the acorns still in the tree, the peg on the squirrel's
branch, the carried items, the peg fixed into the slide — never overlaps the
fox on the ground, so those stay ordinary draws above the action layer. The
baselines aren't even authored numbers: each prop's ground line is its
sprite's bottom edge, computed from the image height once the scene becomes
active.

The screenshots at the top come from a scripted browser playthrough — dig up
the key, open the gate, shake the acorns down, then walk the fox to either
side of the pile — and the feet math and orderings are pinned by unit tests
alongside it: behind, between, in front, the prop-first tie rule, and that
invisible props stay out of the sort entirely.

## What this sets up

The next slices of the spec lean on this one. Depth bands (Phase 2) will
switch the actor between separately drawn sprite sets as her feet cross scene
thresholds — same feet helper, new art. The camera (Phase 3) makes the
scene/screen split real, with scenes wider than the window and input converted
centrally so scene code never sees camera math. And parallax planes (Phase 4)
add a cheaper walk-behind for things the fox never stands in front of: a
foreground strip that just draws after everything. For now, the acorn pile is
the one prop the action layer sorts against the fox.
