---
title: Device independent resolution
layout: post
date: 2025-01-23 15:00:00 -0500
---

I set a fixed window size of 800x600, but the iPhone screen is smaller and the iPad screen is larger. This made it impossible to play on iPhone because most of the screen was not visible:

![iPhone before window size fix]({{ '/sdl-adventure-game/assets/iphone-fixed-size.png' | relative_url }})

And ugly on iPad where the game took only a small portion of the screen:

![iPad before window size fix]({{ '/sdl-adventure-game/assets/ipad-fixed-size.png' | relative_url }})

I fixed the issue by calling `SDL_RenderSetLogicalSize` in the initialization function:

```c
SDL_RenderSetLogicalSize(renderer, WINDOW_WIDTH, WINDOW_HEIGHT);
```

iPhone after the workaround:

![iPhone after window size fix]({{ '/sdl-adventure-game/assets/iphone-logical-size.png' | relative_url }})

iPad after the workaround:

![iPad after window size fix]({{ '/sdl-adventure-game/assets/ipad-logical-size.png' | relative_url }})
