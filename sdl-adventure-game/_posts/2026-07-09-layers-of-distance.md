---
layout: post
title: "Layers of Distance"
---

The fox can walk
[behind things]({% post_url /sdl-adventure-game/2026-07-06-walking-behind-things %}),
be [far away]({% post_url /sdl-adventure-game/2026-07-07-the-fox-in-the-distance %}),
and roam a scene
[wider than the window]({% post_url /sdl-adventure-game/2026-07-08-wider-than-the-window %}).
This post is the last piece of that plan — parallax planes — and the one where
all of it finally shows up in the same picture. A scene's background stops
being one flat image and becomes *layers*, each scrolling at its own speed, so
distance reads the way it does when you look out a train window: the near
things race by, the far things barely move.

![The demo field at two ends: the sky is fixed, the hills have barely moved, the ground and foreground bushes have scrolled fully past.](/sdl-adventure-game/assets/parallax-two-ends.png)

## One number does the whole trick

A plane is almost nothing: an image, a position, and a **parallax factor**.

```c
typedef struct plane {
  ImageData image;
  float parallax;   // 0 = fixed, 1 = scene-locked, > 1 = foreground
  SDL_Point origin; // top-left in scene coordinates
} Plane;
```

Every plane draws at `origin - camera.pos * parallax`, and that single
multiplication is the entire effect. A plane with `parallax = 0` ignores the
camera completely — the sky, infinitely far away, never moves. A plane with
`parallax = 1` tracks the camera one-to-one — it *is* the scene, the ground the
fox stands on. In between, `parallax = 0.4` gives you hills that drift lazily
behind the action. And greater than 1 slides *faster* than the scene: a
foreground layer, nearer to the camera than the fox, that whips past as she
walks.

![Diagram of the four layers, back to front, with their parallax factors: sky 0, hills 0.4, ground 1, bushes 1.15.](/sdl-adventure-game/assets/parallax-layers-diagram.png)

The [scene struct]({% post_url /sdl-adventure-game/2026-06-24-an-engine-for-multiple-adventures %})
carries two ordered tables — `bg_planes` drawn behind the action, `fg_planes`
in front — and the scene declares them and nothing else. The engine loads,
draws, and frees them, exactly like it already did for
[scene images](/sdl-adventure-game/2025/01/15/images-and-sprites.html).

## The foreground plane is a free walk-behind

The first depth post gave the fox
[y-sorted props]({% post_url /sdl-adventure-game/2026-07-06-walking-behind-things %}) so
she could stand in front of *and* behind an object. A foreground plane is the
cheaper cousin: a `parallax > 1` strip in front of the action layer occludes
the actor with no prop, no baseline, no sorting. In the demo it's a row of
bushes along the bottom of the screen — walk the fox low and she's hidden
behind them up to the ears; there's no case where she needs to stand in front
of them, so a plane is all it takes. Props are for the things she must be able
to pass on *either* side; planes handle the pure foreground.

## Drawing in the right order

The render loop is a small dance, because the planes and the action layer live
in different coordinate frames. The action layer draws through the
[camera offset]({% post_url /sdl-adventure-game/2026-07-08-wider-than-the-window %}) set
up in the last phase; each plane draws through *its own* offset instead. So a
frame goes:

```
background planes   (each at origin - camera * parallax)
action layer        (through the shared camera offset)
foreground planes   (each at its own parallax offset)
debug overlay       (over everything, camera offset)
hub button          (screen space, no offset)
```

Getting that order and those offsets right is the whole engine change; the
plane math itself is one line.

## Where the spec and I disagreed

The plan came with a **coverage rule**: a plane must be big enough to fill the
window across the camera's whole travel, or you'd see the empty clear-colour
at the edges. The formula even doubles as the spec you hand an artist —
`image width ≥ WINDOW + parallax × (scene − WINDOW)` — so a `p = 0.4` hill
layer over a 1600-px scene needs to be 1120 px wide, and a `p = 1` ground
layer the full 1600.

I wired it up as a load-time check and it immediately, correctly, complained —
about the foreground bushes. And that's when the rule and reality parted ways.
The foreground *is* a partial strip: a bush row 140 px tall over a 600 px
window. It's *supposed* to leave most of the view uncovered — that's what makes
it a foreground and not a backdrop. So the coverage check now runs on
background planes only, where a gap really would expose the clear colour;
foreground planes are decorative overlays and exempt by nature. The spec
described foreground planes as "a fence, a bush row" in the same breath as the
coverage rule, so this is less a disagreement than a corner the plan hadn't
quite reconciled with itself.

## The whole plan, in one field

The [demo field]({% post_url /sdl-adventure-game/2026-07-07-the-fox-in-the-distance %})
that has grown alongside these four posts is now the proof that they compose.
Its single flat background is gone, replaced by four planes — fixed sky,
drifting hills, scene-locked ground, foreground bushes. Walk the fox across it
and every feature is on screen at once: she's
[y-sorted]({% post_url /sdl-adventure-game/2026-07-06-walking-behind-things %}) against
the depth-band bushes, she
[shrinks to a far sprite]({% post_url /sdl-adventure-game/2026-07-07-the-fox-in-the-distance %})
when she climbs toward the horizon, the
[camera follows]({% post_url /sdl-adventure-game/2026-07-08-wider-than-the-window %}) her
across the 1600-px world, and the four layers slide past at four different
speeds behind and in front of her. The suite is at 103 checks; the two real
adventures declare no planes and are untouched.

That closes the depth plan — four independent PRs, each leaving the game
playable, no scaling anywhere, and a fox who now lives in a world with a
front, a back, and a horizon. What it's waiting on now is not code but
drawings: a real, hand-authored wide location for Vania or Gina to make all of
this carry a scene that's actually part of the story. The engine is ready for
her; someone just has to paint the place.
