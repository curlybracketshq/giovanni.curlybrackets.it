---
title: Animation library, scene library, and game library
layout: post
date: 2025-01-16 09:00:00 -0500
---

At this point, after repeating a lot of code, I would start to recognize some patterns emerge.

## Animation library

Until now an animation was a reference to an `SDL_Texture` with the animation sprite image and an array of `SDL_Rects` to store each frame coordinates in the sprite.

I consolidated all the metadata data of an animation into a new struct `animation_data` and defined a new type `AnimationData`.

I consolidated all animation rendering functions into a single `render_animation` function that takes in input an `SDL_Renderer*`, an `AnimationData*`, an `SDL_Point`, and renders a single frame of the animation on the screen.

I had an issue, due to my inexperience with C, with the memory management of new `AnimationData` values. When you create a new struct value in a function (in the stack), its memory gets deallocated after the function returns. In my case I was creating new `AnimationData` values in the `init` function and once I would try to reference them in the `render_animation` function I was getting an error. The solution was to allocate memory on the heap and return a pointer. I created a `make_animation_data` constructor function to encapsulate the logic that creates a new `AnimationData` value.

### `lldb` commands

I debugged the `AnimationData` memory issue a little bit and I found this list of `lldb` commands useful, especially `print`: [lldb.llvm.org/use/map.html](https://lldb.llvm.org/use/map.html#evaluating-expressions).

### `struct` and `typedef`

I'm still not sure why `struct animation_data` can't automatically define a new `animation_data` type without having to also add `typedef struct animation_data AnimationData`. In any case I decided to use the convention I've seen used in SDL that is prepending `typedef` on struct definitions like this:

```c
typedef struct foo {
  int bar;
} Foo;
```

## Scene library (function pointers, basic interface)

All the scenes must implement the same set of functions, so I decided to create new `Scene` struct that models a game scene.

All the fields in the struct are [function pointers](https://www.cs.yale.edu/homes/aspnes/pinewiki/C(2f)FunctionPointers.html), so the struct acts more or less as an interface.

Scene headers declare an external scene variable, for instance `intro.h` declares: `extern Scene intro_scene;`, then `intro.c` initializes the variable with the right functions.

One issue with this approach is that if I add a new function to the `Scene` struct the compiler doesn't throw an error if the scene instances don't initialize it.

## Game library

I extracted some of the logic from `main.c` into a new `game.c`/`game.h` library.

For now I just shuffled code around, so the actual utility of this refactoring is limited.

`game.h` defines most of the functions of a `Scene`. I think the game library could implement the `Scene` interface, but then `Scene` would become the wrong kind of abstraction.

I defined `set_active_scene`, that is a function to transition from the *current scene* to a *new scene*. An `on_scene_inactive` callback is executed on the current scene to perform some clean up (stop music, etc.). An `on_scene_active` callback is executed on the new scene to perform some initialization (start music, etc.).

## Checkpoint

At this stage, I had the two initial scenes (intro and playground entrance) with placeholder images:

![Intro]({{ '/sdl-adventure-game/assets/prototype-intro-screen.png' | relative_url }})

![Playground entrance]({{ '/sdl-adventure-game/assets/prototype-playground-entrance-screen.png' | relative_url }})
