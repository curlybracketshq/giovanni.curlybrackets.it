---
title: "Basic SDL2 macOS project setup (2nd attempt: success)"
layout: post
---

After the first failed attempt to setup a macOS project using SDL, I decided to try an older version of SDL.

## Using SDL2

It was relatively easy to build and run a macOS XCode project using SDL2, by following the Lazy Foo tutorial: [lazyfoo.net/tutorials/SDL/01_hello_SDL/mac/xcode/](https://lazyfoo.net/tutorials/SDL/01_hello_SDL/mac/xcode/index.php)

The steps are:

1. Create a new macOS app with interface: XIB and language: Objective-C
2. Delete the template project files (`AppDelegate.m`, `AppDelegate.h`, `main.m`)
3. Add the example `main.c` updating the include directive from `#include <SDL/SDL.h>` to `#include <SDL2/SDL.h>`
4. Add the `SDL2.framework` in the project ("General" tab)

I'm using [SDL2 version 2.30.11](https://github.com/libsdl-org/SDL/releases/tag/release-2.30.11).

## Game loop and CPU usage

When I checked the resources usage of the example program it was using 99% of the CPU.

I think the "issue" is that there's effectively a busy loop to keep the window open, but I didn't find any practical alternative implementation of the game loop. Some implementations put a delay call (`SDL_Delay`) between game loop iterations, but I decided not to change the game loop.

I tried to update the example to use [`SDL_WaitEvent`](https://wiki.libsdl.org/SDL2/SDL_WaitEvent) instead of [`SDS_PollEvent`](https://wiki.libsdl.org/SDL2/SDL_PollEvent). The main difference is that `SDL_WaitEvent` blocks waiting for an event to trigger. In any case this change didn't make any sense because event handling shouldn't block the game loop.
