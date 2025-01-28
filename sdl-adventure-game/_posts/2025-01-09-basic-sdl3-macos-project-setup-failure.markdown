---
title: "Basic SDL3 macOS project setup (1st attempt: failure)"
layout: post
date: 2025-01-09 12:00:00 -0500
---

Notes from my first failed attempt to setup a macOS project using SDL.

## Installation

I initially followed the installation directions that I found in the SDL3 wiki, but the wiki page doesn't exist anymore and it's been deleted by: [github.com/libsdl-org/sdlwiki/commit/e7f66042](https://github.com/libsdl-org/sdlwiki/commit/e7f66042).

I installed [SDL 3.1.8](https://github.com/libsdl-org/SDL/releases/tag/preview-3.1.8) by copying `SDL3.xcframework` and `shared` in `/Library/Frameworks`.

## Build

I created a new `CMakeLists.txt` file following the example in the CMake documentation: [wiki.libsdl.org/SDL3/README/cmake#including-sdl-in-your-project](https://wiki.libsdl.org/SDL3/README/cmake#including-sdl-in-your-project).

I was able to run CMake and to generate a `Makefile`, but when I ran `make` I got this error:

```
ld: can't map file, errno=22 file '/Library/Frameworks/SDL3.xcframework/macos-arm64_x86_64/SDL3.framework'
```

At this point I found another guide to build a project on macOS: [wiki.libsdl.org/SDL3/README/macos](https://wiki.libsdl.org/SDL3/README/macos), but I was wondering if there was a way to build the macOS app without creating an XCode project.

Another issue I was facing is that the version of CMake I was using (3.19.4) was too old and it didn't support *xcframeworks*. Related issue: [github.com/libsdl-org/SDL/issues/9479](https://github.com/libsdl-org/SDL/issues/9479).

I can't easily install a more recent version of XCode because it requires a more recent version of OSX.

I can't download an older version of SDL3, specifically `SDL3-3.1.2.dmg`, because it's missing from the releases in GitHub.

I tried to download the SDL3 source code and build from there, but I was getting another error about the version of CMake version I was using:

```
CMake 3.24 or higher is required.  You are running version 3.19.4
```

The requirement to run CMake >= 3.24 has been added about 6 months ago: [github.com/libsdl-org/SDL/commit/37881b31](https://github.com/libsdl-org/SDL/commit/37881b31).
