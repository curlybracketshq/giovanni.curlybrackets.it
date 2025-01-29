---
title: Loading Images Using SDL_image
layout: post
date: 2025-01-14 09:00:00 -0500
---

I initially implemented animations by following Lazy Foo' Productions' [tutorial on animating sprites](https://lazyfoo.net/tutorials/SDL/14_animated_sprites_and_vsync/), but I encountered an error with the `#import <SDL2/SDL_image.h>` directive because SDL_image is an additional library that needs to be installed separately.

## What is SDL_image?

SDL_image is a simple library for loading images of various formats as SDL surfaces.

## How to Install SDL_image

I followed another Lazy Foo' Productions tutorial to install the library: [lazyfoo.net/tutorials/SDL/06_extension_libraries_and_loading_other_image_formats/mac/xcode/](https://lazyfoo.net/tutorials/SDL/06_extension_libraries_and_loading_other_image_formats/mac/xcode/).

The basic steps are:

1. Download the library from GitHub. I downloaded and installed [SDL_image 2.8.4](https://github.com/libsdl-org/SDL_image/releases/tag/release-2.8.4).
2. Add the `SDL2_image.framework` to the project (under the "General" tab).
3. Change imports to `#import <SDL2_image/SDL_image.h>`.

### Alternative Installation Process for Xcode

There is an alternative installation process for Xcode that includes SDL_image as an Xcode project in the main project's workspace. There is a getting started guide at [github.com/libsdl-org/SDL_image/blob/0e9b6b67/docs/INTRO-xcode.md](https://github.com/libsdl-org/SDL_image/blob/0e9b6b67/docs/INTRO-xcode.md).

I didn't use this alternative installation process until later when I built the iOS version of this project.
