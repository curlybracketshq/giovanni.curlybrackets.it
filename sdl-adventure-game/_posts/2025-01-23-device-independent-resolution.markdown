---
title: Device Independent Resolution
layout: post
date: 2025-01-23 15:00:00 -0500
---

Initially, I set a fixed window size of 800x600, but this caused issues as the iPhone screen is smaller and the iPad screen is larger. On the iPhone, most of the game screen was not visible, making it impossible to play:

![iPhone before window size fix]({{ '/sdl-adventure-game/assets/iphone-fixed-size.png' | relative_url }})

On the iPad, the game looked broken, occupying only a small portion of the screen:

![iPad before window size fix]({{ '/sdl-adventure-game/assets/ipad-fixed-size.png' | relative_url }})

I resolved this issue by calling `SDL_RenderSetLogicalSize` in the initialization function:

```c
SDL_RenderSetLogicalSize(renderer, WINDOW_WIDTH, WINDOW_HEIGHT);
```

Here's the result on the iPhone after implementing the solution:

![iPhone after window size fix]({{ '/sdl-adventure-game/assets/iphone-logical-size.png' | relative_url }})

And on the iPad after the fix:

![iPad after window size fix]({{ '/sdl-adventure-game/assets/ipad-logical-size.png' | relative_url }})
