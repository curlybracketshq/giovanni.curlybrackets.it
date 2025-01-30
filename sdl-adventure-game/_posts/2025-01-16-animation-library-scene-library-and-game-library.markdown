---
title: Animation Library, Scene Library, and Game Library
layout: post
date: 2025-01-16 09:00:00 -0500
---

After repeating a lot of code, I began to recognize some emerging patterns.

## Animation Library

Previously, an animation was a reference to an `SDL_Texture` containing an animation sprite image data and an array of `SDL_Rects` to store each frame's coordinates in the sprite.

I consolidated all the metadata of an animation into a new struct called `animation_data` and defined a new type `AnimationData`.

I combined all animation rendering functions into a single `render_animation` function, which accepts an `SDL_Renderer*`, an `AnimationData*`, and an `SDL_Point`, rendering a single frame of the animation on the screen.

Due to my inexperience with C, I faced an issue with the memory management of new `AnimationData` values. When you create a new struct value in a function (on the stack), its memory gets deallocated after the function returns. In my case, I was creating new `AnimationData` values in the `init` function and encountered errors when trying to reference them in the `render_animation` function. The solution was to allocate memory on the heap and return a pointer. I created a `make_animation_data` constructor function to encapsulate the logic for creating a new `AnimationData` value.

### `lldb` Commands

I debugged the `AnimationData` memory issue a bit and found this list of `lldb` commands useful, especially `print`: [lldb.llvm.org/use/map.html](https://lldb.llvm.org/use/map.html#evaluating-expressions).

### `struct` and `typedef`

I'm still unsure why `struct animation_data` can't automatically define a new `animation_data` type without also adding `typedef struct animation_data AnimationData`. In any case, I decided to use the convention I've seen used in SDL, which is prepending `typedef` on struct definitions like this:

```c
typedef struct foo {
  int bar;
} Foo;
```

## Scene Library (Function Pointers, Basic Interface)

All scenes must implement the same set of functions, so I decided to create a new `Scene` struct that models a game scene.

All the fields in the struct are [function pointers](https://www.cs.yale.edu/homes/aspnes/pinewiki/C(2f)FunctionPointers.html), so the struct acts as an interface.

Scene headers declare an external scene variable; for instance, `intro.h` declares: `extern Scene intro_scene;`, then `intro.c` initializes the variable with the correct functions.

One issue with this approach is that if I add a new function to the `Scene` struct, the compiler doesn't throw an error if the scene instances don't initialize it.

## Game Library

I extracted some logic from `main.c` into a new `game.c`/`game.h` library.

For now, I just rearranged the code, so the actual utility of this refactoring is limited.

`game.h` defines most of the functions of a `Scene`. I think the game library could implement the `Scene` interface, but then `Scene` would become the wrong kind of abstraction.

I defined `set_active_scene`, a function to transition from the *current scene* to a *new scene*. An `on_scene_inactive` callback is executed on the current scene to perform some cleanup (stop music, etc.). An `on_scene_active` callback is executed on the new scene to perform some initialization (start music, etc.).

## Checkpoint

At this stage, I had the two initial scenes (intro and playground entrance) with placeholder images:

![Intro]({{ '/sdl-adventure-game/assets/prototype-intro-screen.png' | relative_url }})

![Playground Entrance]({{ '/sdl-adventure-game/assets/prototype-playground-entrance-screen.png' | relative_url }})
