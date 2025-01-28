---
title: "Basic SDL2 macOS Project Setup (Second Attempt: Success)"
layout: post
---

After my [initial failed attempt]({% post_url sdl-adventure-game/2025-01-09-basic-sdl3-macos-project-setup-failure %}) to set up a macOS project using SDL, I decided to try an older version of SDL.

## Using SDL2

I followed Lazy Foo' Productions tutorial to set up a macOS Xcode project using SDL2: [Lazy Foo SDL Tutorial](https://lazyfoo.net/tutorials/SDL/01_hello_SDL/mac/xcode/index.php)

Here are the steps I followed:

1. Create a new macOS app with interface: XIB and language: Objective-C.
2. Delete the template project files (`AppDelegate.m`, `AppDelegate.h`, `main.m`).
3. Add the example `main.c`, updating the include directive from `#include <SDL/SDL.h>` to `#include <SDL2/SDL.h>`.
4. Add the `SDL2.framework` to the project (under the "General" tab).

I am using [SDL2 version 2.30.11](https://github.com/libsdl-org/SDL/releases/tag/release-2.30.11).

## Game Loop and CPU Usage

Upon checking the resource usage of the example program, it was utilizing 99% of the CPU.

I believe the issue lies in the busy loop that keeps the window open, but I didn't find any practical alternative implementations of the game loop. Some implementations include a delay call (`SDL_Delay`) between game loop iterations, but I chose not to modify the loop.

I attempted to update the example to use [`SDL_WaitEvent`](https://wiki.libsdl.org/SDL2/SDL_WaitEvent) instead of [`SDL_PollEvent`](https://wiki.libsdl.org/SDL2/SDL_PollEvent). The main difference is that `SDL_WaitEvent` blocks while waiting for an event to trigger. However, this change didn't make sense because event handling should not block the game loop.
