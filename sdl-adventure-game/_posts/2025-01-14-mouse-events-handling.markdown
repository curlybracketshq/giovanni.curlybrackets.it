---
title: Mouse Events Handling
layout: post
date: 2025-01-14 16:00:00 -0500
---

During each iteration of the game loop, the function `process_input` handles events.

`process_input` is a while loop that iterates through all events in the queue:

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

## Mouse Events

To handle mouse events, I added additional cases for different mouse event types and tracked the mouse state, including position and button pressed state. Here, I aimed to handle mouse motion to verify functionality:

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

## `SDL_GetMouseState` vs. `SDL_MouseMotionEvent`

This approach worked well on macOS with a fixed window size, but it did not function as expected when used with `SDL_RenderSetLogicalSize`.

To resolve a rendering issue, I included a call to `SDL_RenderSetLogicalSize` in the iOS project build. After implementing this change, the mouse coordinates became incorrect because `SDL_GetMouseState` provides absolute mouse positions, not relative ones that consider the render logical size.

The adjustment for mouse coordinates is applied solely to the position stored in the `SDL_MouseMotionEvent`. I corrected the issue by using the coordinates contained in `event.motion`:

```c
// Get mouse position
m_position.x = event.motion.x;
m_position.y = event.motion.y;
```

## Checkpoint

At this stage, I had a basic game loop, an animated sprite, music and sound effects playing, and a rectangle that followed the mouse position:

![Example]({{ '/sdl-adventure-game/assets/example.gif' | relative_url }})
