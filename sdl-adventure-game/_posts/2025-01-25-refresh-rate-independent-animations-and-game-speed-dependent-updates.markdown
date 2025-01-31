---
title: Refresh Rate Independent Animations and Game-Speed-Dependent Updates
layout: post
---

After porting the game to iOS, I encountered two issues:

1. The animation implementation relied on the `render` function being called a fixed number of times per second, matching the screen refresh rate, due to the [`SDL_RENDERER_PRESENTVSYNC`](https://wiki.libsdl.org/SDL2/SDL_RendererFlags) renderer flag. The refresh rates differ between my 2014 MacBook Pro (60Hz) and iPhone (120Hz), causing animations to play twice as fast on an iPhone and iPad.
2. I did not account for the time elapsed between `update` invocations in the game-speed-dependent game loop I had implemented.

## Animations

I resolved the animation issue by tracking the time when the animation started and computing the correct frame according to the delta between the animation start time and the current time using [`SDL_GetTicks`](https://wiki.libsdl.org/SDL2/SDL_GetTicks).

```c
int delta = 0;
int clip_index = 0;
int ms_per_frame = 83; // at 12 FPS: 1 / 12 * 1000
if (animation->is_playing) {
  delta = SDL_GetTicks() - animation->start_time;
  clip_index = (delta / ms_per_frame) % animation->frames;
}
SDL_Rect *srcrect = &animation->sprite_clips[clip_index];
SDL_Rect dstrect = {position.x, position.y, clip->w, clip->h};

// Render to screen
SDL_RenderCopyEx(renderer, animation->image.texture, srcrect, &dstrect, 0,
                 NULL, animation->flip);
```

## Fox Movement

I resolved the fox movement issue by updating the `fox_update` implementation to consider the time elapsed between invocations and by multiplying the position deltas (fox walking and sliding) by the `delta_time` value passed to each `update` function.

Before:

```c
void fox_update(Fox *fox, float delta_time) {
  // ...

  switch (fox->state) {
    // ...
    case WALKING:
      // ...
      fox->current_position = (SDL_FPoint){
          .x = fox->current_position.x + fox->direction.x * vel,
          .y = fox->current_position.y + fox->direction.y * vel,
      };
      break;
  }

  // ...
}
```

After:

```c
void fox_update(Fox *fox, float delta_time) {
  // ...

  switch (fox->state) {
    // ...
    case WALKING:
      // ...
      fox->current_position = (SDL_FPoint){
          .x = fox->current_position.x + fox->direction.x * vel * delta_time,
          .y = fox->current_position.y + fox->direction.y * vel * delta_time,
      };
      break;
  }

  // ...
}
```
