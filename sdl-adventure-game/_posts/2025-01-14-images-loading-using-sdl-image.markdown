---
title: Images loading using SDL_image
layout: post
date: 2025-01-14 09:00:00 -0500
---

I initially implemented animations by following Lazy Foo' Productions [tutorial to animate sprites](https://lazyfoo.net/tutorials/SDL/14_animated_sprites_and_vsync/), but I was getting an error on the `#import <SDL2/SDL_image.h>` directive because SDL_image is an additional library that needs to be installed separately.

## What is SDL_image

SDL_image is a simple library to load images of various formats as SDL surfaces.

## How to install SDL_image

I followed yet another Lazy Foo' Productions tutorial to install the library: [lazyfoo.net/tutorials/SDL/06_extension_libraries_and_loading_other_image_formats/mac/xcode/](https://lazyfoo.net/tutorials/SDL/06_extension_libraries_and_loading_other_image_formats/mac/xcode/).

The basic steps are:

1. Download the library from GitHub. I downloaded and installed [SDL_image 2.8.4](https://github.com/libsdl-org/SDL_image/releases/tag/release-2.8.4).
2. Add the `SDL2_image.framework` to the project (under the "General" tab).
3. Change imports to `#import <SDL2_image/SDL_image.h>`.

### Alternative installation process for XCode

There is an alternative intallation process for XCode that includes SDL_image as an XCode project in the main project's workspace. There is a getting started guide at [github.com/libsdl-org/SDL_image/blob/0e9b6b67/docs/INTRO-xcode.md](https://github.com/libsdl-org/SDL_image/blob/0e9b6b67/docs/INTRO-xcode.md).

I didn't apply this alternative installation process until later when I was [building the iOS version of this project]({% post_url sdl-adventure-game/2025-01-23-ios-build-success %}).
