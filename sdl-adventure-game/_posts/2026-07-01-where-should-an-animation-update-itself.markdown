---
title: "Where Should an Animation Update Itself?"
layout: post
---

Animations in VaniaVolpe are humble: a sprite sheet plus a little `.anim` file
listing each frame's rectangle, played at 12 FPS. For a long time the code that
advanced them lived in the wrong place — inside the *render* function — and pulling
it out turned into a small lesson about where responsibility belongs. I got it
wrong once before I got it right, and there was a third design I deliberately
walked past. This is that story.

## Timing in the wrong place

`render_animation()` did two jobs. It drew the current frame, and — from the time
elapsed since the animation started — it also computed *which* frame that was and,
for a one-shot animation, noticed when the animation had finished and fired its
end callback.

Both of those are the wrong job for a draw call. Because the frame was derived from
"now" each time you rendered, playback speed was quietly tied to how often you drew:
render twice in a frame and the fox talks twice as fast. Worse, the end callback
fired *from inside rendering* — and in this engine an end callback can do something
as drastic as switch to another scene. Advancing the gate animation to completion,
mid-draw, would tear down the scene you were in the middle of painting. It worked,
but only because nothing had leaned on the seam yet.

## First take: split update from render

The obvious fix is to separate the two responsibilities. I added
`animation_update(anim, now)` — it advances the current frame and, for a one-shot,
stops the animation and fires the callback. `render_animation()` became a pure blit:
draw whatever `current_frame` says, nothing more. Timing now happens in the update
phase of the loop, so speed no longer depends on the renderer and callbacks fire at
a sane moment.

Clean — except it left a smell. Something now had to *call* `animation_update` every
frame, and that something turned out to be each scene. The playground-entrance scene
suddenly had this at the top of its `update()`:

```c
animation_update(excavator, now);
animation_update(gate, now);
animation_update(shovel, now);
```

That bothered me. A scene that merely *draws* an animation shouldn't have to
remember to *drive* it every frame. Forget one line and the animation silently
freezes — and its end callback never fires, so the gate never opens and the game
soft-locks, with nothing to point at. The abstraction was leaking its bookkeeping
onto every caller.

## The shortcut I didn't take

The tempting fix is to make animations update themselves globally. Have
`make_animation_data()` quietly register every animation it creates in an
engine-owned list, and tick that whole list once per frame. Scenes would declare
nothing and call nothing; create an animation and it just animates.

I didn't do this, for two reasons. The small one is that it's global mutable state,
which I try to avoid. The bigger one is subtler: every scene in an adventure is
loaded up front, so *every* animation exists at all times, including ones belonging
to scenes that aren't on screen. A global tick would drive all of them — and a
one-shot in an off-screen scene could reach its end and fire its callback while a
completely different scene is showing. That's a real cross-scene footgun hiding
behind a convenient API. Convenient and wrong.

## Second take: let the framework own it

The right answer was already sitting in the codebase; I'd just failed to notice the
pattern I'd been following everywhere else. A scene doesn't manage its own
[hotspots, images, and sound effects]({% post_url sdl-adventure-game/2026-06-24-an-engine-for-multiple-adventures %})
imperatively — it *declares* them as data on the `Scene` struct, and the framework
loads and frees them for it. Animations were the one resource that had wandered off
and done everything by hand.

So I made animations a declared scene resource like the rest. The `Scene` struct
grew an `animations` array; the framework ticks the *active* scene's animations each
frame (`game_update` calls `update_scene_animations` before handing control to the
scene) and frees them on teardown (`free_scene_animations`, right next to the
existing `free_scene_images`). The scenes went back to declaring a list and nothing
more — the three `animation_update` lines vanished, and so did the matching
`free_animation` calls in their teardown.

Actors didn't need any of this. An actor is already a self-contained object that
ticks its own animations inside `actor_update`, and a scene drives it with a single
`actor_update` call, not one call per animation. It was only the loose scene props —
buttons, the gate, the shovel — that had been leaking, and now they don't.

## The lesson

The fix wasn't clever; it was consistent. The first version solved the real bug and
then invented a new chore for every caller. The global registry would have hidden
the chore but smuggled in a worse bug. The version that shipped just made animations
behave like every other thing a scene owns: declare it, and let the engine take care
of the rest — scoped to the scene that's actually on screen, with nothing to
remember. When a change feels like it needs a new rule for everyone to follow, that's
usually a sign the abstraction is pointed the wrong way.

You can play the current build here:
[potomak.github.io/VaniaVolpe](https://potomak.github.io/VaniaVolpe/).
