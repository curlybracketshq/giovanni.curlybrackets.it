---
title: Basic Game Loop
layout: post
---

There are different ways to implement a game loop. For this project, I decided to use the *game speed dependent on variable FPS* approach, which I found implemented in [github.com/gustavopezzi/sdl-gameloop](https://github.com/gustavopezzi/sdl-gameloop). This implementation works well and doesn't utilize 100% of the CPU.

The basic structure of an SDL2 game loop looks like this:

```c
int main(int argc, char** argv) {
  // Initialization
  // ...
  bool game_is_running = true;

  // Game loop
  while (game_is_running) {
    // Poll events
    process_events();
    // Update game state
    update();
    // Render frame
    render();
  }

  // Deinitialization
  // ...

  return 0;
}
```

Another valuable resource on implementing a game loop using SDL2 is [www.studyplan.dev/sdl2-minesweeper/sdl2-application-loop](https://www.studyplan.dev/sdl2-minesweeper/sdl2-application-loop).

Suggested readings about game loops:

* [deWiTTERS Game Loop](https://dewitters.com/dewitters-gameloop/)
* [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)

CannonBall is a real-world example of a game implemented using SDL2: [github.com/djyt/cannonball](https://github.com/djyt/cannonball). Its game loop is implemented in [`main.cpp`](https://github.com/djyt/cannonball/blob/27493ebf62be3498dff93ed6a45e8e2db819bae1/src/main/main.cpp).

## SDL3

In SDL3, there is a more efficient way to handle game loops. You need to define `SDL_MAIN_USE_CALLBACKS`, import `SDL_main.h`, and implement four callbacks:

* `SDL_AppInit` - To initialize the application
* `SDL_AppIterate` - To update the game state and render
* `SDL_AppEvent` - To handle events
* `SDL_AppQuit` - To clean up resources before quitting

For more information on using main callbacks in SDL3, visit: [wiki.libsdl.org/SDL3/README/main-functions](https://wiki.libsdl.org/SDL3/README/main-functions#how-to-use-main-callbacks-in-sdl3).

## `SDL_main.h`

In general, it's useful to import `SDL_main.h`, even with SDL2, to allow SDL to abstract away platform-specific entry point details.
