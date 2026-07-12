---
layout: post
title: "Pathfinding Around Obstacles with a Walk Grid and A*"
---

The oldest documented limitation in VaniaVolpe was that the fox walks in a
straight line. Click across the playground and she marches right through the
sandbox, the slide, whatever the scene says is not ground. It had its own
design note (`MOVEMENT.md`) written mostly so the problem wouldn't be
forgotten, and the note ended with "keep the engine simple until this becomes
a felt gameplay problem." It became one. This is the story of the fix: a
walkability bitmap, A*, and a handful of places where the routing deliberately
allows illegal points.

![The straight line cuts through the slide; the routed path goes around it.](/sdl-adventure-game/assets/movement-before-after.png)

## Moving the endpoint doesn't move the path

Each scene already declared its legal ground as a few rectangles, plus at most
one non-walkable rectangle carved out of them. A click outside the walkable
area got snapped to the nearest legal point, and the fox walked straight
there. Two flavors of "smarter snapping" kept coming up — snap the click, or
stop the walk where the segment first crosses the obstacle border — and both
fail the same way: they adjust an *endpoint*, but the offending part is the
middle of the path. A perfectly legal destination whose straight line merely
clips the sandbox stays a wall-clip no matter where you move the ends.

The snapping code also turned out to hide a genuine bug. After pushing a point
out of the non-walkable rect, it clamped the result back into the winning
walkable rect — which can land it right back *inside* the obstacle. Walkable
`{300,300,300,100}`, blocked `{250,250,200,200}`, click `(320,380)`: pushed
left to `x = 249`, clamped back to `x = 300`, inside the blocked rect again.
The shipped scenes happened not to trigger it. That kind of "happened not to"
is exactly what I wanted to stop relying on.

## A grid instead of a graph

I had Claude draft the implementation plan, and its first proposal was the
classic one for rectangular obstacles: a corner visibility graph — nodes at
the obstacle's corners, edges where the connecting segment stays legal,
Dijkstra over a dozen nodes. Exact and small. But reading the draft I noticed
where all the subtlety had pooled: filtering inflated corners, testing a
segment against a *non-convex union* of rectangles, and a separately
hand-verified fix for the snapping bug above. Three clever pieces, each easy
to get subtly wrong.

So I asked for something dumber: a bitmap. One cell per 10×10 logical pixels,
so the whole 800×600 screen is an 80×60 grid — 4,800 bytes per scene. Every
hard sub-problem collapses into cell logic. Is this point legal? One array
lookup. Nearest legal point to a click? Breadth-first search from the clicked
cell — which cannot reproduce the clamp-back bug, because it returns a
walkable cell by construction instead of trusting edge arithmetic. Routing?
A* over the cells. Unreachable goal? A* already knows the reachable cell
closest to it, so "walk as near as you can" falls out for free instead of a
straight line through a wall. And someday the grid can be filled from a
hand-painted mask instead of rectangles, which is how walkable areas probably
should be authored anyway.

The price is that raw grid paths are staircases, so a smoothing pass is not
optional. I'll take one mandatory, mechanical pass over three clever pieces.

## Rasterising rectangles

Scenes still declare rectangles — they're the authoring format, and they're
already there:

```c
typedef struct walk_area {
  const SDL_Rect *walkables; // union of legal ground
  int walkables_length;
  const SDL_Rect *blocked;   // exclusion zones carved out of the union
  int blocked_length;
} WalkArea;
```

At scene init the engine rasterises them once: a cell is walkable iff its
*centre* is inside some walkable rect and inside no blocked rect. Centre
sampling matters more than it looks: two of the playground's walkable rects
overlap by a single pixel column, and requiring whole cells to be legal would
have split the ground into two islands. The rects also stopped masquerading as
hotspots — they used to sit in the scene's `hotspots[]` array purely so the
debug overlay would draw them. Now the overlay shades non-walkable cells
directly (that's the red grid texture in the screenshots), clearly distinct
from clickable regions.

## Routing on the grid

A* is the by-the-book version: 8-connected, costs 10 straight and 14
diagonal, octile heuristic, and a diagonal step is allowed only when both
adjacent orthogonal cells are walkable, so paths never cut a blocked corner.
It runs once per click over static arrays — no allocation, and at 4,800 cells
the worst case is beneath noticing.

Then the smoothing. The raw path from one side of the playground to the other
is 56 cell centres describing a polite staircase around the slide. A greedy
line-of-sight pass — from each point, jump to the furthest path point whose
connecting segment samples clean every 5 px — collapses those 56 points into
3 waypoints:

![The raw 56-point cell path and the 3-waypoint smoothed path it becomes.](/sdl-adventure-game/assets/movement-smoothing.png)

The [generic actor]({% post_url /sdl-adventure-game/2026-06-24-an-engine-for-multiple-adventures %})
grew a matching queue: `actor_walk_path()` accepts up to eight
points and the old `actor_walk_to()` is just the one-point case. Between
segments the walk animation and the footstep loop keep running, so a routed
walk reads as one continuous motion with a couple of turns in it.

## Intentional exceptions: illegal starts and goals

The pleasant surprise was how few special cases the scenes needed — and how
honest the two real ones are.

First: some destinations are illegal on purpose. The shovel the fox digs with
stands *inside* the sandbox, and its point of interest has always been on
non-walkable ground. So a hotspot walk routes along legal ground to the
nearest legal point and then takes one exempt final hop to the exact target:

```c
walk_actor_to(fox, &walk_grid, SHOVEL_POI, /* exact_goal */ true,
              maybe_dig_out_key);
```

Second: some *starts* are illegal too. Sliding down the slide dumps the fox
inside the blocked rectangle around the structure; the router snaps the start
the same way and she walks back out legally.

And while rewriting `actor_walk_to` I found a bug in the
[walk-then-do callbacks](/sdl-adventure-game/2025/01/21/chain-of-actions.html):
start a walk toward the slide, then tap the fox herself, and the pending
"use the slide" callback survived the interruption
and fired on the next frame — from wherever she stood. With the slide already
fixed, she'd teleport to the top and ride down from across the playground.
This game is built for a two-year-old, and tap-spamming is the two-year-old
input method, so this was less theoretical than it sounds. Interrupted walks
now cancel completely, and a regression test taps the fox mid-walk to prove
it.

## Walkable areas that change

One more case surfaced in Gina's adventure: her walkable area depends on game
state. Before the sunscreen she won't leave the umbrella's shadow; after it,
the whole poolside opens up. The fix stays declarative — two `WalkArea`s, one
live grid, rebuilt from whichever area matches the state. The subtle part is
*when*: on scene entry, obviously, but also right after the dive that restarts
her story, because that reset happens without leaving the scene, and the grid
would otherwise still say "poolside" while the state says "no sunscreen." As a
side effect she can now wander around under the umbrella while she waits,
instead of standing frozen until you find the lotion.

All of it is covered by geometry unit tests that run inside `make test`,
next to the
[scripted playthrough]({% post_url /sdl-adventure-game/2026-07-02-testing-the-game-in-a-terminal %}).
My favourite is the pair that
states the whole feature: the straight left-to-right segment across the
sandbox *fails* the line-of-sight check — proof the old behaviour clipped the
wall — and the routed path passes it, waypoint by waypoint.

Next on this thread: painting walkable masks in-game instead of typing
rectangles (the grid is already a bitmap; it may as well be drawn), and
scene-sized grids once scrolling scenes and a camera arrive. For now, routed
walks avoid obstacles instead of clipping through them.
