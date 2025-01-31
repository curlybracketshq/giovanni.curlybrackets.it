---
title: "iOS build (Second attempt: success)"
layout: post
date: 2025-01-23 09:00:00 -0500
---

I added a new scene for the outro and now the game is basically complete.

## Checkpoint

This is what the game looks like on macOS.

Intro scene:

![Intro scene]({{ '/sdl-adventure-game/assets/alpha-intro-screen.png' | relative_url }})

Playground entrance scene:

![Playground entrance scene]({{ '/sdl-adventure-game/assets/alpha-playground-entrance-screen.png' | relative_url }})

Playground scene:

![Playground scene]({{ '/sdl-adventure-game/assets/alpha-playground-screen.png' | relative_url }})

## Build for iOS (iPad)

After getting an error including SDL_image, I was finally able to build the project using Xcode 16 on a different (more recent) PC.

The SDL_image Xcode project doesn't support Xcode 12. When I tried to open `SDL_image.xcodeproj` to change the configuration I got this error:

```
The file couldn’t be opened
```

I tried to download older versions of the library, but none of them worked, not sure why. These are the versions I tried: 2.8.4, 2.8.3, 2.6.3, 2.0.5.

### Include SDL_image and SDL_mixer in the iOS project

I've followed the official guide to include SDL_image in the Xcode project as a subproject: [github.com/libsdl-org/SDL_image/blob/b56698cc/docs/INTRO-xcode.md](https://github.com/libsdl-org/SDL_image/blob/b56698cc/docs/INTRO-xcode.md). I've used [SDL_image 2.8.4](https://github.com/libsdl-org/SDL_image/releases/tag/release-2.8.4).

I took a similar approach to include SDL_mixer. I've used [SDL_mixer 2.8.0](https://github.com/libsdl-org/SDL_mixer/releases/tag/release-2.8.0).

## Troubleshooting

### Linking SDL_mixer returned an error

It was not finding some header files from SDL. Turns out I needed to add the SDL "Public Headers" path in the first position in the SDL_mixer subproject "Header search paths" configuration.

### Asset files names must be unique

For instance I had 4 different `background.png` files stored under 4 different directories. I had to rename the files to fix the error.

### Asset file references don't allow directories

I stored asset files in directories, but iOS requires the references to not include directories. Example: `fox/walking.png` needs to be updated to `walking.png`.

### Window size

I set a fixed window size of 800x600, but the iPhone screen is smaller and the iPad screen is bigger. I fixed the issue by setting a logical size using `SDL_RenderSetLogicalSize`.

### Mouse coordinates

After setting the logical size, the mouse coordinates were wrong because `SDL_GetMouseState`, the function I was using to get the position of the mouse, returns the absolute mouse coordinates, bypassing the code to adjust mouse coordinates according to the render logical size. I fixed the issue by using the coordinates stored in the `SDL_MouseMotionEvent`: `event.motion.x` and `event.motion.y`.

### Animations and movement is too fast on iOS

The game loop speed is dependent on the device speed and I didn't account for that in the fox position updates while moving. I decided to fix this issue later.
