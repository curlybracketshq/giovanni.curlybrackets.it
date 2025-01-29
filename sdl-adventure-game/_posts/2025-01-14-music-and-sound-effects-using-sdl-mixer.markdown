---
title: Music and sound effects using SDL_mixer
layout: post
date: 2025-01-14 12:00:00 -0500
---

SDL_mixer is a simple multi-channel audio mixer. I'm using it to play sound effects and music in the game.

## How to install SDL_mixer

I've taken almost the [same approach I took for installing `SDL_image`]({% post_url sdl-adventure-game/2025-01-14-loading-images-using-sdl-image %}):

1. Download the library from GitHub. I downloaded and installed [SDL_mixer 2.8.0](https://github.com/libsdl-org/SDL_mixer/releases/tag/release-2.8.0).
2. Add the `SDL2_mixer.framework` to the project (under the "General" tab).
3. Change imports to `#import <SDL2_mixer/SDL_mixer.h>`.

## Setup and usage

I followed the [sound effects and music Lazy Foo' Productions tutorial](https://lazyfoo.net/tutorials/SDL/21_sound_effects_and_music/) to setup and test the library.

Basic steps:

1. Initialize the library with a call to `Mix_OpenAudio` and
2. Load an audio file as a chunk or as music with a call to `Mix_LoadWAV` or  `Mix_LoadMUS` respectively
3. Play a chunk or music by calling `Mix_PlayChannel` or `Mix_PlayingMusic` respectively
