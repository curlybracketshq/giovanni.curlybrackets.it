---
title: "iOS build (First Attempt: Failure)"
layout: post
date: 2025-01-21 13:00:00 -0500
---

I attempted to build the project for iOS because I wanted to play the game on iPad and also because I wanted to see how portable the project really was.

## Build for iOS (iPad)

I initially just tried to update the Xcode project that I was using to build the macOS executable to target iOS, but the build phase failed because the SDL2 frameworks I'm linking against are compiled for a different architecture.

I created a new project and followed the guide at [wiki.libsdl.org/SDL2/README/ios](https://wiki.libsdl.org/SDL2/README/ios). I'm using [SDL2 2.30.11](https://github.com/libsdl-org/SDL/releases/tag/release-2.30.11).

After creating the new project I:

1. deleted the redundant template files,
2. added the SDL2 Xcode project: `Xcode/SDL/SDL.xcodeproj`,
3. removed the "Main storyboard file base name" setting,
4. added the path to the SDL "Public Headers" folder in the "Header Search Paths" configuration
5. added the `SDL2.framework`, changed the option to "Embed & Sign" the framework
6. copied `SDL_uikit_main.c` in the project

### Property 'preferredFrameRateRange' not found

When I tried to build the project I got an build error on `src/video/uikit/SDL_uikitviewcontroller.m`:

```
Property 'preferredFrameRateRange' not found on object of type 'CADisplayLink *'
```

Initially it was a bit hard to find the source of the error. After seraching for a bit, I found it in the build logs, under the "Report Navigator" tab in the left side panel:

![Report Navigator in the left side panel]({{ '/sdl-adventure-game/assets/report-navigator.png' | relative_url }})

I fixed the error by using a deprecated property: [`preferredFramesPerSecond`](https://developer.apple.com/documentation/quartzcore/cadisplaylink/preferredframespersecond). The change to use `preferredFrameRateRange` has been [introduced recently](https://github.com/libsdl-org/SDL/commit/e305da0b), about 3 days before, but it's suspect because the code should have been ignored in case I was targeting an API version that didn't support the property.

### Undefined symbol: _SDL_main

I got another build error:

```
Undefined symbol: _SDL_main
```

This was a relatively easy fix, but it took me more than expected to figure out.

The new `main` definition in `SDL_uikit_main.c` calls `SDL_UIKitRunApp` with `SDL_main` as an argument:

```
int main(int argc, char *argv[]) {
  return SDL_UIKitRunApp(argc, argv, SDL_main);
}
```

That symbol was missing from my project because I needed to define a new `SDL_main` function.
