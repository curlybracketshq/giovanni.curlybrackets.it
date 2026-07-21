---
layout: post
title: "Declarative scenes: a data-driven approach to scene assets"
date: 2026-07-20
---

{% include ai-disclaimer.html %}

This post describes a change to how scenes in the game declare and use their
assets. The work was specified in `SCENES.md` and tracked in issue #129, and it
landed in five separate pull requests. The goal was to reduce the amount of
per-scene framework code by moving it into the engine, so that a scene declares
data plus a small number of behavior functions and the framework owns loading,
updating, rendering, freeing, and input dispatch.

## Background

The game is built from scenes. Each scene implements a callback struct defined
in `scene.h`: `init`, `load_media`, `process_input`, `update`, `render`,
`deinit`, `on_scene_active`, and `on_scene_inactive`. A `Game` runs the current
`Adventure`, which is an ordered table of scenes.

Before this change, a scene contained two kinds of code:

1. A description of the scene: which objects exist, where they are, which
   interactions they support, and how state changes.
2. Framework plumbing: creating animation objects, loading their textures,
   drawing each object, playing sounds, running the music lifecycle, and
   handling pointer input.

The second kind was close to identical across scenes. The change moves it into
the engine.

## The asset manifest and the generator

Each adventure has a manifest, `assets/index.json`, that lists its assets:
images, animations, audio, and voice lines. Each entry carries attributes such
as its directory, frame count, playback style, and whether it is localized.

A build-time generator, `tools/gen_asset_decls.py`, reads the manifest and emits
a C header (`build/gen/<adventure>_assets.h`) of initializer and index macros.
Scenes reference these generated macros instead of repeating filenames and
counts. This project extended the generator so that it emits not only asset
table initializers but also bindings: handles, index constants, and helper
functions. A reference to an asset that does not exist in the manifest is a
build error, because the corresponding macro or function is not generated.

## Implementation

The change landed as five increments. Each is independent and was shipped on its
own.

### 1. Declarative animations

Previously a scene created animation objects in `init` (`make_animation_data`)
and loaded their textures in `load_media` (`load_animation`). Now a scene lists
`SceneAnimSpec` entries, using generated `<PREFIX>_<DIR>_ANIM_<NAME>_SPEC`
macros. The framework creates the animations into the scene's storage before
`init` runs (so `init` can reference them) and loads their textures during the
media pass. The scene no longer writes the create/load loops. Ticking and
freeing were already handled by the framework.

### 2. Static sprite list

Previously a scene drew each static image or animation by hand in `render`. Now
a scene declares a `SceneSprite` table. Each entry is an image or animation, a
position, and an optional visibility predicate. The framework draws the table
each frame before calling the scene's `render`. The scene's `render` is reduced
to the dynamic layer: the actor, tweened objects, and overlays.

### 3. Interaction animations on hotspots

Some tappable objects show a small looping animation to indicate that they are
interactive. Previously this was declared in three places: the animation table,
a `Hotspot.active_anim` pointer, and a gated call in `render`. The `Hotspot`
struct gained an `anim_at` field (draw position) and an `anim_visible` field
(a draw gate that is independent of the hotspot's enabled state). The framework
draws each hotspot's animation. The tappable region and its animation are now
declared together on the hotspot.

### 4. Action API

This part covers sound and music, and is backed by the generator.

- **Music.** A scene sets a declarative `.music` field on its `Scene` struct,
  using a generated `Asset` initializer. The framework loads the stream during
  the media pass, plays it on scene entry, halts it on exit, and frees it on
  teardown. Scenes no longer call the SDL_mixer music functions.

- **Sound effects.** An audio entry is marked with `"sfx": true` in the
  manifest. The generator collects all such entries into a per-adventure sound
  bank stored on the `Adventure` struct, which the framework loads once. The
  generator emits a `play_<name>()` helper for each effect over `sfx_play(index)`,
  where the index is a compile-checked constant. Scenes call `play_<name>()` and
  hold no sound-effect chunks. Because the bank is per-adventure, an effect
  shared by several scenes is loaded a single time.

- **Dialogue.** Each spoken line is a per-line chunk in a `<scene>/dialog`
  directory. The generator emits a `say_<name>()` helper for each line over
  `scene_say(index)`, which speaks the line through the scene's actor. The line's
  text is read from a text sidecar next to the audio file. Dialogue audio is
  optional: a line with no recorded audio loads as text only, using a subtitle
  with a duration estimated from the text. Both adventures use this API. One
  adventure previously used a single shared placeholder audio file for all of a
  scene's lines; this was replaced with uniquely named per-line assets.

### 5. Input default

The pointer input handling for the walking scenes was identical: a drag test on
the actor, a hit test against the hotspot table, and otherwise a walk toward the
click. This became a framework default, `scene_default_process_input`, which the
engine runs when a scene supplies no `process_input` of its own. It reads the
scene's new `.actor` field, its walk grid, and its hotspot table. Scenes that
need special input handling, such as an input lock during an animation or a
scene-transition check, still provide their own `process_input`.

## Result

After the change, a walking scene is expressed as data tables plus behavior
functions. A representative scene declares its assets, its placements, its
hotspots, and its actor, and supplies handlers only for the interactions that
are specific to it:

```c
Scene vine_scene = {
    .init = init,
    .load_media = load_media,
    .actor = &gina,          // framework default input handler
    .update = update,
    .render = render,
    .deinit = deinit,
    .on_scene_active = on_scene_active,
    .on_scene_inactive = on_scene_inactive,
    .hotspots = hotspots,
    .hotspots_length = LEN(hotspots),
    .sprites = sprites,
    .sprites_length = LEN(sprites),
    .images = images,
    .images_length = LEN(images),
    .animations = animations,
    .animations_length = LEN(animations),
    .anim_specs = anim_specs,
    .anim_specs_length = LEN(anim_specs),
    .chunks = chunks,
    .chunks_length = LEN(chunks),
    .walk_grid = &walk_grid,
    .walk_mask_dir = "vine",
};

static void pick_grapes(void) {
    if (gina_state.has_grapes) { say_already_grapes(); return; }
    if (gina_state.has_basket) { set_active_scene(GRAPES_MINIGAME); return; }
    say_nothing_to_pick();
}
```

The animation create/load loops, the render calls for static objects, the music
lifecycle, the sound-effect chunk tables and `Mix_*` calls, and the duplicated
input handler are no longer written per scene. The generator emits the asset
tables, index constants, animation specs, music asset initializers, the
sound-effect bank with its `play_<name>()` helpers, and the dialogue
`say_<name>()` helpers, all from the manifest.

## Escape hatch

A scene can still supply any of `update`, `render`, and `process_input`. These
run alongside the declared data, not instead of it: the framework draws the
declared sprite list and then calls the scene's `render` for dynamic drawing,
and it runs the default input handler only when the scene provides no
`process_input`. Scene logic that does not fit the declarative model, such as a
custom animation arc or a state machine, stays as hand-written code.

## Status

All five increments are merged. One adventure keeps an inline, non-declarative
scene as a reference for comparison. Two follow-ups remain: a code-clarity
cleanup of some repeated-tap dialogue switches, and English text for the
dialogue lines, which are currently authored in the source language only.
