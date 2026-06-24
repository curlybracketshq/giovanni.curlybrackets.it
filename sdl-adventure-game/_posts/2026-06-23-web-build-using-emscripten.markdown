---
title: "Web Build Using Emscripten"
layout: post
---

The [terminal build]({% post_url sdl-adventure-game/2026-03-25-terminal-build-using-libcaca %})
proved the game logic was portable; the obvious next target was the browser, so
anyone can play without installing anything.

## Building with Emscripten

[Emscripten](https://emscripten.org/) compiles the same C sources to
WebAssembly. `make web` runs `emcc` with the SDL2, SDL2_image (PNG), and
SDL2_mixer ports and emits `build/web/index.{html,js,wasm,data}`. The asset
directories are baked into the in-browser virtual filesystem with
`--preload-file`, which is why they end up in that `.data` file.

## The game loop

A browser can't run a blocking `while` loop — it would freeze the tab. Under
`__EMSCRIPTEN__` the loop is instead driven by
[`emscripten_set_main_loop`](https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop),
which hands control back to the browser between frames (`requestAnimationFrame`).
The native build keeps its ordinary loop; it's a small `#ifdef`.

The includes also needed a nudge: the code uses the `<SDL2/SDL.h>` style, but
Emscripten's ports expose the unprefixed headers. A tiny compatibility-shim
include directory maps one to the other, so not a single source `#include` had to
change.

## A cleaner page

By default `emcc` wraps the canvas in its own page — a "powered by emscripten"
logo, an output console, and a couple of controls. It's handy while developing,
but I wanted the deployed game to be *just* the game, so I gave `emcc` a custom
`--shell-file`: a minimal HTML page that contains only the canvas.

The stock Emscripten shell:

![The default Emscripten shell]({{ '/sdl-adventure-game/assets/web-default-shell.png' | relative_url }})

The custom shell on my phone:

![The custom shell in mobile Safari]({{ '/sdl-adventure-game/assets/web-custom-shell-mobile.png' | relative_url }})

## Troubleshooting

### A black screen

The first build loaded to a black canvas. The browser console said
`Error initializing SDL`. The culprit was `SDL_INIT_EVERYTHING`, which pulls in
the haptic and joystick subsystems — neither of which Emscripten's SDL2 port
implements, so `SDL_Init` failed before anything rendered. Initialising only what
the game uses, `SDL_INIT_VIDEO | SDL_INIT_AUDIO`, fixed it.

### Silent audio on iOS Safari

Audio worked on desktop but was silent on the iPhone. iOS only unlocks the Web
Audio context when `resume()` is called **inside** a user gesture, and SDL2's
automatic resume runs from a timer, which iOS ignores. The custom shell page now
resumes the AudioContext on the first touch and sets
`navigator.audioSession.type = 'playback'`, so the game plays even with the ring
switch silenced.

## Deploying to GitHub Pages

A GitHub Actions workflow installs the Emscripten SDK, runs `make web`, and
publishes `build/web` to GitHub Pages on every push to `main`. You can play the
current build here:
[potomak.github.io/VaniaVolpe](https://potomak.github.io/VaniaVolpe/).
