---
title: AI-Powered Code Review and The Fox Actor
layout: post
date: 2025-01-17 09:00:00 -0500
---

I thought it would be useful to get a quick code review to catch any trivial mistakes, as I'm new to C programming.

I found this [simple web app](https://github.com/domvwt/chatgpt-code-review) that reviews your code. It takes a GitHub repo address and an OpenAI API key, then uses ChatGPT for the review. However, I was hesitant to share my OpenAI API key. As a workaround, I could have created a new API key for the review and deleted it afterward, but another issue was that I hadn't pushed the code to GitHub.

Instead, I ended up pasting individual files directly into ChatGPT and received some feedback, mainly confirming that I wasn't making any trivial mistakes.

## Vania Volpe

The main character of this game is a fox named *Vania*.

![Fox actor]({{ '/sdl-adventure-game/assets/fox-actor.gif' | relative_url }})

Note: the animation above shows the initial name *Veronica Volpe*. I changed it to Vania because it should be easier for younger kids to pronounce.

## The Fox Actor

I extracted some repeated functions to load media and render the fox actor into a new `fox.h`/`fox.c` library. The library also declares the `Fox` type, which contains some metadata about the fox actor.

### Object-Oriented Programming with ANSI-C

Most functions in the *fox library* require a `Fox*` pointer as input, so I wanted to know if there is a way to define *instance methods* on structs.

I found this useful resource: [Object-Oriented Programming with ANSI-C](https://www.cs.rit.edu/~ats/books/ooc.pdf). However, I didn't find an easy way to pass a reference to *self* to struct methods. I guess it might be easier to rewrite the project in C++.

To keep things simple, I ensured that all functions requiring a `Fox*` pointer accept it as their first parameter by convention.

### Fox Movement

The fox moves at a constant speed from `current_position` to `target_position`.

Horizontal and vertical speed components are calculated when `fox_walk_to` is invoked and stored in the `SDL_Point direction` field in the struct. At each `fox_update` function invocation, x and y speed increments are added to the fox's current position.

![Fox walking animation]({{ '/sdl-adventure-game/assets/fox-walking-animation.gif' | relative_url }})

### Fox Orientation

Depending on the delta value on the horizontal axis, I changed the fox's horizontal orientation to face east or west.

I modified the rendering function invoked in `render_animation` to copy the texture data to the screen using [`SDL_RenderCopyEx`](https://wiki.libsdl.org/SDL2/SDL_RenderCopyEx), which accepts an additional `SDL_RendererFlip` parameter for flipping the texture. I also added a new `SDL_RendererFlip flip` field in the `AnimationData` type.
