---
title: "An Engine for Multiple Adventures"
layout: post
date: 2026-06-24 09:00:00 -0500
---

The game is in good shape now — it runs on the desktop, on iOS, in a terminal,
and in the browser. So I started thinking about what comes next: more adventures.
But first the code had to stop being *one* adventure with the engine baked in.

## One hardcoded adventure

The building blocks were already generic — a scene framework, an animation
engine, audio — but the adventure itself was hardcoded. A `GameScene` enum listed
the five scenes (intro, playground entrance, playground, outro, example), a
`switch` mapped each value to its `Scene`, and the init/load/free loops ran over
that fixed list. The player was a `Fox` struct with fox-specific animation fields,
and even the puzzle inventory — `has_key`, `has_peg`, `has_acorns` — lived right
on it.

To add a second adventure I'd have had to fork all of that. So I didn't write a
second adventure yet; I made the engine able to hold one.

## An adventure registry

The first change was to make the engine run *an* adventure rather than *the*
adventure. I added a small `Adventure` descriptor — an ordered table of scenes, an
entry scene, and where its assets live — and the engine now drives whichever
adventure is current. `scene_instance()` and `set_active_scene()` take plain
indices into the current adventure's table; the hardcoded enum and `switch` are
gone, and the engine no longer includes a single scene's header.

The existing game became the first content module, registering itself with the
engine. Same scenes, same flow, no gameplay change.

## A generic actor

The fox got the same treatment. Instead of a bespoke `Fox` with
`walking` / `talking` / `sitting` / `waving` fields, there's now a generic
`Actor`: a small state machine driven by an `ActorSpec`, which is just data
describing a character's animations, walking speed, footstep sound, and asset
folder. The fox is one spec. The next protagonist I have in mind — **Gina
Gallina**, a chicken — will be another spec, not another copy of the movement
code. The inventory moved off the actor and into the scenes that use it, so the
engine carries nothing adventure-specific.

I kept the name *actor* on purpose; it's the word I reached for
[when I first pulled the fox out into its own thing]({% post_url sdl-adventure-game/2025-01-17-ai-powered-code-review-and-the-fox-actor %}),
and it's the right one for something positioned, animated, and scripted.

## A home per adventure

Finally, some structure. Each adventure now lives in its own directory:
`src/adventures/vania_fox_the_slide/` holds its scenes, its actor spec, and an
`assets/` subtree with the sprites, sounds, and `.anim` files. Only the shared
engine stays under `src/`. Adding an adventure is, by construction, adding a
directory.

None of this changed how the slide puzzle plays — that was the whole point of
doing it as a refactor. But the engine is finally an engine. Next up: a small hub
to choose an adventure, and then Gina's story.
