---
layout: post
title: "A Puzzle Dependency Chart for the Pool Adventure"
---

{% include ai-disclaimer.html %}

The pool adventure has had a fixed puzzle structure for months, but that
structure was never written down anywhere except the code. This post fixes
that with the tool adventure game designers actually use for the job: the
**puzzle dependency chart**, introduced by Ron Gilbert — he describes it in
[a post on Grumpy Gamer](https://grumpygamer.com/puzzle_dependency_charts/)
as "the single most important tool" behind Monkey Island's puzzle design.
There is a personal loop closing here: this whole project traces back to
[replaying The Secret of Monkey Island]({% post_url 2020-01-17-intro %}),
and this is the first time I'm using its designer's own planning tool on my
own game.

## What the chart is

A puzzle dependency chart is a graph, not a flowchart. Each node is a puzzle
or a required step; an arrow means "this must be solved before that unlocks".
It deliberately says nothing about the order the player will actually do
things in, and story beats stay out of it — only dependencies. Gilbert draws
them backwards, starting from the goal and asking "what does this need?",
and reads the finished shape as a diagnostic: long single-file chains mean
the design is too linear (his words: there is *nothing* worse), wide
unconnected fans mean the player is drowning in choices. Good designs
breathe — one puzzle opens a few, they reconverge at a bottleneck, the next
act opens up.

## The chart

Here is the real chart for the pool adventure, drawn from the shipped game
logic:

![The puzzle dependency chart for the pool adventure: the sunscreen unlocks two branches — collecting the goggles, and the four-step float recovery chain — which reconverge at diving into the pool.]({{ '/sdl-adventure-game/assets/gina-puzzle-dependency-chart.png' | relative_url }})

Seven nodes: put on the sunscreen (a minigame), collect the goggles, reach
for the float and watch the wind carry it into the tree, ask Carla the crow
for help and receive her basket, pick grapes with it (another minigame),
trade the grapes for the float, and — with goggles *and* float — dive into
the pool. The dive resets the state, so the adventure loops.

## The chart was already in the code

This chart wasn't designed on paper and then implemented; it was **read off
the code**, because the dependencies already exist as data. The game state
is five fields:

```c
bool has_sunscreen;     // applied in the sunscreen minigame
bool has_goggles;
FloatState float_state; // AT_POOL -> STUCK_IN_TREE -> RETRIEVED
bool has_basket;        // given by Carla
bool has_grapes;        // collected in the grapes minigame
```

and every arrow in the chart is one of the
[hotspot `enabled` predicates]({% post_url 2026-07-12-from-imperative-click-handlers-to-declarative-hotspots %})
or a check inside a callback. The goggles hotspot is enabled by
`has_sunscreen && !has_goggles` — that's the sunscreen→goggles arrow. Carla
hands the basket over only while `float_state == FLOAT_STUCK_IN_TREE` —
that's the gust→Carla arrow. The dive callback requires `has_goggles` and
`FLOAT_RETRIEVED` — the two arrows converging on the goal. Since the
hotspot refactoring made those predicates named, per-scene data, the chart
is close to being mechanically derivable from the tables.

## What the shape says

Reading the chart the way Gilbert reads his:

- **The sunscreen is a deliberate bottleneck.** Every arrow flows through
  it — an "act break" before the poolside opens up. That's intentional: the
  sun-safety ritual comes first, and it doubles as the tutorial.
- **There is exactly one parallel branch.** The goggles can be collected at
  any point relative to the float chain — before the gust, between any two
  of its steps, or last. That's the diamond shape Gilbert wants, once.
- **The float chain is the linear part.** Four nodes in single file:
  gust → Carla → grapes → trade. By Monkey Island standards that's the
  section the chart would send back for redesign. For this game's audience
  — a toddler playing five-minute sessions — a short guided chain is closer
  to a feature than a flaw, but the chart shows exactly where a future
  puzzle would attach: a second branch out of the sunscreen bottleneck that
  reconverges at the dive, or a second thing Carla wants.

One more thing the chart exposed, about testing rather than design: the
scripted playthrough that gates every commit walks exactly one topological
order of this graph (goggles before the float chain). The chart says other
orders are equally valid — goggles last, for instance — and none of them is
asserted automatically. A second script permutation would close that gap
cheaply.

The next adventure will get its chart before its code, drawn backwards from
the goal. For a seven-node game the chart mostly confirms what was already
in my head; the point of adopting the tool now is that the next design
should be bigger — and the chart is the cheapest place to find out it
breathes wrong.
