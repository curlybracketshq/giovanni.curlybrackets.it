---
title: "iOS Build (Second Attempt: Success)"
layout: post
date: 2025-01-23 09:00:00 -0500
---

I added a new outro scene, and now the game is essentially complete.

## Checkpoint

Intro scene:

![Intro scene]({{ '/sdl-adventure-game/assets/alpha-intro-screen.png' | relative_url }})

Playground entrance scene:

![Playground entrance scene]({{ '/sdl-adventure-game/assets/alpha-playground-entrance-screen.png' | relative_url }})

Playground scene:

![Playground scene]({{ '/sdl-adventure-game/assets/alpha-playground-screen.png' | relative_url }})

## Building for iOS (iPad)

After encountering an error including SDL_image, I was finally able to build the project using Xcode 16 on a newer PC.

The SDL_image Xcode project does not support Xcode 12. When I attempted to open `SDL_image.xcodeproj` to change the configuration, I received the following error:

```
The file couldn’t be opened.
```

I tried downloading older versions of the library, but none of them worked, and I'm not sure why. The versions I tried were 2.8.4, 2.8.3, 2.6.3, and 2.0.5.

### Including SDL_image and SDL_mixer in the iOS Project

I followed the official guide to include SDL_image in the Xcode project as a subproject: [github.com/libsdl-org/SDL_image/blob/b56698cc/docs/INTRO-xcode.md](https://github.com/libsdl-org/SDL_image/blob/b56698cc/docs/INTRO-xcode.md). I used [SDL_image 2.8.4](https://github.com/libsdl-org/SDL_image/releases/tag/release-2.8.4).

I took a similar approach to include SDL_mixer, using [SDL_mixer 2.8.0](https://github.com/libsdl-org/SDL_mixer/releases/tag/release-2.8.0).

## Troubleshooting

### Linking SDL_mixer Returned an Error

It was not finding some header files from SDL. It turned out I needed to add the SDL "Public Headers" path to the first position in the SDL_mixer subproject "Header Search Paths" configuration.

### Asset File Names Must Be Unique

For instance, I had four different `background.png` files stored in four different directories. I had to rename the files to fix the error.

### Asset File References Don't Allow Directories

I initially stored asset files in directories, but iOS requires the references not to include directories. For example, `fox/walking.png` needed to be updated to `walking.png`.

### Window Size

I initially set a fixed window size of 800x600, but the iPhone screen is smaller and the iPad screen is larger. I resolved the issue by setting a logical size using `SDL_RenderSetLogicalSize`.

### Mouse Coordinates

After setting the logical size, the mouse coordinates were incorrect because `SDL_GetMouseState`, the function I was using to get the position of the mouse, returns the absolute mouse coordinates, bypassing the code to adjust mouse coordinates according to the render logical size. I fixed the issue by using the coordinates stored in the `SDL_MouseMotionEvent`: `event.motion.x` and `event.motion.y`.

### Animations and Movement Too Fast on iOS

The game loop speed is dependent on the device's speed, and I didn't account for this in the fox position updates while moving. I have decided to address this issue later.
