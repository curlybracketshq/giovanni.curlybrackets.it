---
title: Refresh rate independent animations and game speed dependent updates
layout: post
---

After porting the game to iOS I had two issues:

1. The animations implementation relied on the fact that the `render` function was called a fixed number of times per second, that correspond to the screen refresh rate, based on the [`SDL_RENDERER_PRESENTVSYNC`](https://wiki.libsdl.org/SDL2/SDL_RendererFlags) renderer flag. The refresh rate is different between my 2014 MacBook Pro (60Hz) and iPhone (120Hz). So effectively the animations were playing twice as fast on iPhone and iPad.
2. I didn't account for the time that passed between `update` invocations in the game speed dependent game loop that I implemented.

## Animations

I fixed the animations implementation by keeping track of the time when the animation started playing and computing the correct frame according to the delta between animation start time and current time ([`SDL_GetTicks`](https://wiki.libsdl.org/SDL2/SDL_GetTicks)).

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

## Fox movement

I fixed the fox movement issue by updating the `update` implementation to take into account the time passed between invocations and by multipliying the position deltas (fox walking and sliding) by the `delta_time` value that I'm passing to each `update` function.

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
