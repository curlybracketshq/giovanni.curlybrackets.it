---
title: Chain of Actions
layout: post
date: 2025-01-21 09:00:00 -0500
---

I need to execute a series of actions in sequence. For instance, the fox should walk to the gate, and if the key is not in the inventory, it should say, "The gate is closed. I need a key to open the gate." If the key is already in the inventory, the gate should open, and the fox should proceed to the next scene.

The simplest way to implement these sequential actions is by passing function pointers, which serve as callbacks for functions such as `play_animation` or `fox_walk_to`.

In `fox.c`, for example:

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

This approach generally works as expected, but it lacks scalability and becomes confusing with more than a few actions in sequence, such as walking to a gate, talking, playing the gate opening animation, and moving to the next screen.

A known issue with this implementation is that initiating a new action while a sequence is already in progress halts the current sequence. This occurs because there is a single callback function pointer that gets reset when initiating a new action. For instance, at the playground entrance, if you click on the shovel to reveal the key and, while the shovel animation is playing, click elsewhere to make the fox move, the next action in the sequence — revealing the key — gets overwritten. The value of `static void (*on_animation_playback_end)(void)` in `image.c` is updated to the new `NULL` callback passed to the `play_animation` invocation, which plays the fox walking animation, preventing the key from being revealed.
