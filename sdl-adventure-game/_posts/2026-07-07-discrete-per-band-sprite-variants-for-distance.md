---
layout: post
title: "Discrete Per-Band Sprite Variants for Distance"
redirect_from:
  - /sdl-adventure-game/2026/07/07/the-fox-in-the-distance.html
---

{% include ai-disclaimer.html %}

The fox can be drawn [behind scene
props]({% post_url /sdl-adventure-game/2026-07-06-a-y-sorted-action-layer-for-depth-occlusion %}) now, but
she's exactly the same size at the back of the playground as at the front.
Depth cues come in pairs — occlusion says *behind*, size says *far* — and the
game only had one of them. This post is the second slice of the depth plan
(`DEPTH_AND_CAMERA.md`): the fox reads as nearer or farther by switching
between separately drawn sprite sets as she moves up and down the scene.

![Two screenshots of the demo field: high on the lawn the fox renders from a smaller sprite set, low on the lawn from the full-size one, in front of a bush.]({{ '/sdl-adventure-game/assets/depth-variants-near-far.png' | relative_url }})

## Why not just scale the sprite

The classic answer is render-time scaling — SCUMM games computed a scale
factor from the actor's y and drew the one sprite set smaller toward the
horizon. Smooth, and free for the artist. We ruled it out anyway: scaled
sprites lose the hand-drawn crispness this game's art depends on, and edges
fringe under interpolation. The art in VaniaVolpe is drawn at exact sizes and
should stay exactly as drawn.

So the spec chose the discrete version: a scene divides its floor into 1–3
horizontal **bands**, and the actor carries a full sprite set — a **variant**
— per band, each authored at the right size. The engine's job collapses to
"pick the set by where her feet are," which is trivial; the honest costs are
that art effort multiplies per variant, and that there's a visible pop at the
band boundary. The first cost is deferred with placeholders (more below); the
second is managed by putting boundaries where players cross quickly, and it
shrinks further once walk-behind planes can hide them.

## Variants in the actor

An `ActorSpec` now carries a list of sprite sets instead of one:

```c
typedef struct actor_variant_spec {
  const ActorAnimSpec *anims;
  int anims_length;
  float speed_scale; // 1.0 = spec velocity; far variants use < 1.0
} ActorVariantSpec;
```

The [generic
actor]({% post_url /sdl-adventure-game/2026-06-24-an-engine-for-multiple-adventures %})'s
animation table becomes two-dimensional — `animations[variant][state]` — and
every lookup goes through the active variant. The fox and the hen wrap their
existing tables in a one-element variants array, which is the whole migration:
one variant, `speed_scale = 1.0`, zero behaviour change. A validation pass
insists every variant provides the same set of states as variant 0, checked
loudly before any file loads, so a missing far-walking sheet fails the game's
startup instead of crashing mid-stride.

`speed_scale` is the second half of the illusion. A far fox drawn at 60% size
that still covers 200 pixels per second looks like she's skating; scaling the
walk speed with the sprite keeps her apparent speed natural.

## Switching variants without a visible pop

All the care in this phase is concentrated in one function:

```c
void actor_set_variant(Actor *actor, int variant);
```

The naive version — stop the old walking animation, start the new one — pops
twice: the walk cycle restarts from frame zero, and stopping an animation
fires its [end
callback]({% post_url /sdl-adventure-game/2026-07-01-moving-animation-timing-from-render-to-update %}),
which for a walk means "arrive," from the wrong place. Instead the new
variant's current-state animation *inherits* the old one's start time, frame
and facing, and the old one is silenced directly without going through the
callback machinery. Mid-stride stays mid-stride; the only thing that changes
on screen is the artwork. A unit test pins exactly this: switch during a walk
and assert the timing, frame and facing survive while nothing else fires.

## Bands belong to scenes

Where the switches happen is deliberately *not* actor data. Different scenes
have different floors — a shallow poolside strip, a deep playground lawn — so
each scene declares its own band table and maps its own geometry onto the
actor's variants:

{% raw %}
```c
typedef struct depth_band { int y_top; int variant; } DepthBand;

static const DepthBand BANDS[] = {{0, 1}, {520, 0}};
```
{% endraw %}

Opting in is one line in the scene's update, feeding
[`actor_feet_y`]({% post_url /sdl-adventure-game/2026-07-06-a-y-sorted-action-layer-for-depth-occlusion %})
into the band lookup:

```c
actor_set_variant(fox, depth_variant_for(BANDS, LEN(BANDS),
                                         actor_feet_y(fox)));
```

Scenes that never call it stay on variant 0 forever — which is every shipped
scene today, because the far-art doesn't exist yet.

![Diagram: a scene floor split by a horizontal boundary at y 520; feet above it select the far variant at 0.6 speed, feet below it the near variant at full speed.]({{ '/sdl-adventure-game/assets/depth-bands-diagram.png' | relative_url }})

## Placeholders until the art exists

That "doesn't exist yet" is the same problem the `en_US` locale had — the
system is ready before the assets are — and it gets the same answer: generated
placeholders, replaced file-for-file later. A new script,
`tools/gen_depth_variants.py`, crops each frame of a variant-0 sheet by its
`.anim`, downscales it nearest-neighbour (no interpolation fringing), and
repacks the usual vertical strip with a matching `.anim`, ready to slot into a
variant spec.

And because a feature like this deserves somewhere to be *seen*, the repo
gained a third adventure: a one-scene developer demo ("Demo: Depth & Props"
on the menu) that is also the reference implementation to copy from. A field,
two bushes, a two-variant fox — the bushes are Phase 1 props, two bands split
the lawn where its tone changes, and the far set is a committed output of the
generator. Click around it and both features are on screen at once; that's
where the screenshots at the top come from. The real adventures are untouched
until their far art is drawn (the whole suite, now at 83 checks, plays
through Gina's story with the extra menu button present to prove it).

Next on this thread is the biggest slice: scenes wider than the window, with
a camera that follows the fox and the scene/screen coordinate split made
real. After that, parallax. The engine can now render the fox at a smaller size
when she's far up the scene; there's a demo field to see it.
