---
title: Music and Sound Effects Using SDL_mixer
layout: post
date: 2025-01-14 12:00:00 -0500
---

SDL_mixer is a simple multi-channel audio mixer that I am using to play sound effects and music in the game.

## How to Install SDL_mixer

I've taken an approach similar to the one used for installing [`SDL_image`]({% post_url sdl-adventure-game/2025-01-14-loading-images-using-sdl-image %}):

1. Download the library from GitHub. I downloaded and installed [SDL_mixer 2.8.0](https://github.com/libsdl-org/SDL_mixer/releases/tag/release-2.8.0).
2. Add the `SDL2_mixer.framework` to the project (under the "General" tab).
3. Change imports to `#import <SDL2_mixer/SDL_mixer.h>`.

## Setup and Usage

I followed the [Sound Effects and Music Lazy Foo' Productions tutorial](https://lazyfoo.net/tutorials/SDL/21_sound_effects_and_music/) to set up and test the library.

Basic steps:

1. Initialize the library with a call to `Mix_OpenAudio`.
2. Load an audio file as a chunk or as music with a call to `Mix_LoadWAV` or `Mix_LoadMUS`, respectively.
3. Play a chunk or music by calling `Mix_PlayChannel` or `Mix_PlayingMusic`, respectively.
