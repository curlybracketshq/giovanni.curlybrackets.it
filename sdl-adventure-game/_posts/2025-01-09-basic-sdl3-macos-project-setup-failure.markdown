---
title: "Basic SDL3 macOS Project Setup (First Attempt: Failure)"
layout: post
date: 2025-01-09 12:00:00 -0500
---

Here are the notes from my initial, unsuccessful attempt to set up a macOS project using SDL.

## Installation

I initially followed the installation directions from the SDL3 wiki. However, the wiki page no longer exists, as it was deleted: [github.com/libsdl-org/sdlwiki/commit/e7f66042](https://github.com/libsdl-org/sdlwiki/commit/e7f66042).

I installed [SDL 3.1.8](https://github.com/libsdl-org/SDL/releases/tag/preview-3.1.8) by copying the `SDL3.xcframework` and `shared` directory into `/Library/Frameworks`.

## Build

I created a `CMakeLists.txt` file following the example from the CMake documentation: [wiki.libsdl.org/SDL3/README/cmake#including-sdl-in-your-project](https://wiki.libsdl.org/SDL3/README/cmake#including-sdl-in-your-project).

I successfully ran CMake to generate a `Makefile`, but encountered this error when running `make`:

```
ld: can't map file, errno=22 file '/Library/Frameworks/SDL3.xcframework/macos-arm64_x86_64/SDL3.framework'
```

I found another guide on building a project on macOS: [wiki.libsdl.org/SDL3/README/macos](https://wiki.libsdl.org/SDL3/README/macos). However, I wondered if there was a way to build the macOS app without creating an Xcode project.

Another issue was that the version of CMake I was using (3.19.4) did not support *xcframeworks*. Related issue: [github.com/libsdl-org/SDL/issues/9479](https://github.com/libsdl-org/SDL/issues/9479).

I am unable to easily install a more recent version of Xcode because it requires a newer version of macOS.

I also cannot download an older version of SDL3, specifically `SDL3-3.1.2.dmg`, as it is missing from the releases on GitHub.

I attempted to download the SDL3 source code and build from that, but encountered another error regarding the version of CMake:

```
CMake 3.24 or higher is required.  You are running version 3.19.4
```

The requirement to use CMake version 3.24 or higher was added approximately six months ago: [github.com/libsdl-org/SDL/commit/37881b31](https://github.com/libsdl-org/SDL/commit/37881b31).
