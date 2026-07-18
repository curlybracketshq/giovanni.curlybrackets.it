---
layout: post
title: "One Manifest per Adventure"
---

{% include ai-disclaimer.html %}

Every scene in the game used to declare its assets twice. The C file listed
them the way the engine loads them — filenames, directories, frame counts,
loop styles, hard-coded in static tables. And the art pipeline listed them
again in a JSON file, the way an artist needs them — what still has to be
drawn, at what size, with how many frames. Two lists describing the same
things, kept in sync by hand.

That's the kind of duplication that doesn't hurt until it does. Change a
placeholder animation from three frames to four and you have to remember to
touch the `.anim` file, the scene's table, and the manifest. Miss one and
nothing complains: the game plays the wrong frame count, or the artist is
asked to draw the wrong number of frames, and you find out later.

This week the two lists became one. Each adventure now has a single asset
manifest, `assets/index.json`, and everything reads it: the art to-do page,
the cost estimator, and — this is the new part — the compiled game itself.

## No JSON in C

The game is C99 and I didn't want a JSON parser in it, least of all one that
runs at boot to discover things that are fixed at compile time. The trick is
the same one the test harness already uses for its playthrough scripts: a
small Python script runs during the build, reads the manifest, and writes a
C header of macros. Scenes include the header and declare their tables from
it. At runtime there is no JSON anywhere — just the same static tables as
before, now written by the generator instead of by hand.

A scene table that used to look like this:

```c
static ImageData images[2] = {
    {NULL, "background.png", "pool", 0, 0},
    {NULL, "water.png", "pool", 0, 0},
};
static const ImageData *background = &images[0];
```

now looks like this:

```c
static ImageData images[GINA_POOL_IMAGES_COUNT] = GINA_POOL_IMAGES_INIT;
static const ImageData *background = &images[GINA_POOL_IMAGE_BACKGROUND];
```

The filenames, the array sizes, the indices, and the animation frame counts
all come from the manifest. There is exactly one place left where "the
sunscreen boil has three frames" is written down.

## The build as the referee

Because the generator runs on every build, it's also a good place to check
things. It fails the build if the manifest's frame count disagrees with the
committed `.anim` file, or if an asset the game will load is missing from
the tree. The drift that used to surface as a subtle runtime glitch is now
a compile error with a filename in it.

The manifest needed two small flags to cover everything honestly. Some
assets are runtime-only — placeholder wiggle animations, sound effects —
that the game loads but no artist will ever be asked to draw; they're
marked `"task": false` and stay off the to-do page. A few are the
opposite — finished stills that the game currently shows as a wiggling
placeholder instead — and they're marked `"runtime": false` so the game
ignores them while the artist still sees them. Everything else is both an
authoring task and a runtime asset, which is the common case.

The pool scene is migrated as the proof; the other scenes are a mechanical
follow-up. It's a small refactor, but it changes who owns the truth: not
the scene, not the pipeline, but one file both of them read.
