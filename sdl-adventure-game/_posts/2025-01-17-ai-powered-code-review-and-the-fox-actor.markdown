---
title: AI powered code review and The fox actor
layout: post
date: 2025-01-17 09:00:00 -0500
---

At this point I thought it would be useful to get a quick code review, in case I'm making some trivial mistakes, because I'm really new to C.

I found this [simple web app](https://github.com/domvwt/chatgpt-code-review) that takes in input a GitHub repo address, an OpenAI API key, and uses ChatGPT to review your code, but I didn't feel confident to share my OpenAI API key. As a workaround I could have created a new API key just for reviewing the code and then delete it, but another issue is that I didn't push the code to GitHub.

I ended up pasting single files directly into ChatGPT and I got some feedback, mainly validating that I wasn't doing anything trivially wrong.

## Vania Volpe

The main character of this game is a fox called *Vania*.

## The fox actor

I extracted some repeated functions to load media and render the fox actor into a new `fox.h`/`fox.c` library. The library also declares the `Fox` type that contains some metadata about the fox actor.

### Object-Oriented Programming With ANSI-C

Most of the functions in the *fox library* require a `Fox*` value in input, so I wanted to know if there is a way to define *instance methods* on structs.

I found this useful resource: [Object-Oriented Programming With ANSI-C](https://www.cs.rit.edu/~ats/books/ooc.pdf), but I didn't find an easy way to pass a reference to *self* to "struct methods". I guess at that point it would be just easier to rewrite the project in C++.

In order to keep things simple I just made sure that conventionally all functions that accept a `Fox*` value in input, declare it as their first parameter.

### Fox movement

The fox moves with constant speed from `current_position` to `target_position`.

Horizontal and vertical speed components are calculated when the `fox_walk_to` is invoked and stored in the `SDL_Point direction` field in the struct. At each `fox_update` function invocation, x and y speed increments are added to the fox current position.

### Fox orientation

Depending on the delta value on the horizontal axis, I changed the fox horizontal orientation to face east or west.

I changed the rendering function invoked in `render_animation` to copy the texture data to screen from `SDL_RenderCopyEx` to `SDL_RenderCopyEx` that accepts an additional `SDL_RendererFlip` parameter that I use to flip the texture, and added a new `SDL_RendererFlip flip` field in the `AnimationData` type.
