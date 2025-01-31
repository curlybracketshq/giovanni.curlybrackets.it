---
title: Chain of actions
layout: post
date: 2025-01-21 09:00:00 -0500
---

I need to execute a chain of actions in a sequence. For instance the fox should walk to the gate and then, in case the key is not in the inventory, start talking, to say something like: "The gate is closed. I need a key to open the gate". Or in case the key is already in the inventory, open the gate and proceed to the next scene.

The simplest way to implement these sequential actions is by passing function pointers, that are used as callbacks by functions such as `play_animation` or `fox_walk_to`.

For instance, in `fox.c`:

```c
static void (*on_end_walking)(void);

// ...

void fox_walk_to(Fox *fox, SDL_FPoint target_position, void (*on_end)(void)) {
  if (fox->state == TALKING) {
    return;
  }

  on_end_walking = on_end;

  // ...
}

// ...

void fox_update(Fox *fox, float delta_time) {
  float dx = fox->target_position.x - fox->current_position.x;
  float dy = fox->target_position.y - fox->current_position.y;

  switch (fox->state) {
  case WALKING:
    // Stop walking after reaching the target position
    if (fabsf(dx) <= 2 && fabsf(dy) <= 2) {
      stop_animation(fox->walking);
      fox->state = IDLE;
      fox->direction = (SDL_FPoint){0, 0};
      fox->current_position = fox->target_position;
      Mix_HaltChannel(fox->walking_sound_channel);
      if (on_end_walking != NULL) {
        on_end_walking();
      }
      return;
    }
    // ...
    break;

    // ...
  }

  // ...
}
```

This approach works as expected most of the times, but it isn't very scalable and it's a bit confusing when there are more than a couple of actions that need to take place, e.g. walk to gate, talk, play opening gate animation, go to next screen.

There is a known bug with this implementation: performing a new action, while a chain of actions is already in progress, stops the current chain of actions. This is due to the fact that there is a single callback function pointer that gets reset by executing the new action. For instance, in the playground entrance, if you click on the shovel to reveal the key, and, while the shovel animation is playing, click somewhere else on the screen to make the fox move, the next action in the chain of actions, revealing the key, that is stored in `static void (*on_animation_playback_end)(void)` in `image.c`, gets overwritten by the new `NULL` callback passed to the `play_animation` invocation to play the fox walking animation and the key is not revealed.
