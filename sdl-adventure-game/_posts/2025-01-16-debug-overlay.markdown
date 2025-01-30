---
title: Debug overlay
layout: post
date: 2025-01-16 15:00:00 -0500
---

I created a set of functions to easily draw shapes on screen for debugging purpose.

For instance I would like to see on the screen position and size of hotspots rectangles that are areas of the screen that react to mouse clicks, for instance the gate hotspot is the area that accepts mouse clicks to interact with the gate.

The debug overlay is enabled by pressing the `d` key. Example debug overlay in the playground entrance scene:

![Debug overlay]({{ '/sdl-adventure-game/assets/prototype-playground-entrance-debug-overlay.png' | relative_url }})

Debug functions are organized in a new `debug.h`/`debug.c` library. They include a `process_input` function to react to user events and a `render` function to render the debug overlay on screen. Both of these functions are always called during the game loop iterations, regardless of the current scene on screen.

I added four new fields to the `Scene` type: `SDL_Rect *hotspots` and `int hotspots_length`, and `SDL_Point *pois` and `int pois_length`. **Hotspots** are areas in the screen delimited by rectangles. **Point of interests** (POIs) are single points on the screen, used for instance to determine where the main actor should move to when it's interacting with a particular scene object.

The debug overlay `render` function collects hotspots and POIs from the current scene and renders them on the screen. In addition to the debug overlay toggle, the `process_input` function handles mouse events to draw new shapes on the screen and outputting the resulting geometry on the standard output.
