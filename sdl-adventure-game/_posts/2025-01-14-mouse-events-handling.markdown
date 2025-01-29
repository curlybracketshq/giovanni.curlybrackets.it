---
title: Mouse events handling
layout: post
date: 2025-01-14 16:00:00 -0500
---

At each iteration of the game loop the function `process_input` handles events.

`process_input` is basically a while loop that iterates through all the events in the queue:

```c
void process_input(void) {
  SDL_Event event;
  while (SDL_PollEvent(&event)) {
    switch (event.type) {
    case SDL_QUIT:
      game_is_running = false;
      break;
    case SDL_KEYDOWN:
      switch (event.key.keysym.sym) {
      // Exit the game
      case SDLK_ESCAPE:
        game_is_running = false;
        break;
      }
    }
  }
}
```

## Mouse events

In order to handle mouse events I needed to add some more cases for handling the mouse event types and to keep track of the mouse state, such as position and button pressed state. In my case I just wanted to handle mouse motion in order to test that everything worked as expected:

```c
// Mouse position
SDL_Point m_position;

void process_input(void) {
  SDL_Event event;
  while (SDL_PollEvent(&event)) {
    switch (event.type) {
    // ...
    case SDL_MOUSEMOTION:
      // Get mouse position
      SDL_GetMouseState(&m_position.x, &m_position.y);
      break;
    }
  }
}
```

## `SDL_GetMouseState` Vs `SDL_MouseMotionEvent`

This approach worked fine on macOS, with a fixed window size, but it didn't work as expected in conjunction with `SDL_RenderSetLogicalSize`.

I added a call to `SDL_RenderSetLogicalSize` when I built the project for iOS in order to fix a rendering issue. After that change the mouse coordinates were wrong because `SDL_GetMouseState` returns the absolute mouse position as opposed to the relative mouse position that is computed taking the render logical size into account.

The mouse coordinates adjustment is only applied to the position stored in the `SDL_MouseMotionEvent`. I fixed the issue by using the coordinates stored in `event->motion`:

```c
// Get mouse position
m_position.x = event->motion.x;
m_position.y = event->motion.y;
```

## Checkpoint

At this point I had a basic game loop, an animated sprite, music and sound effects playing, and a rectangle that followed the mouse position:

![Example]({{ '/sdl-adventure-game/assets/example.gif' | relative_url }})
