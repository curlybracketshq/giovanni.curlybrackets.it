---
title: Parsing Animation Metadata
layout: post
date: 2025-01-17 13:00:00 -0500
---

Animation metadata includes an `SDL_Rect` array used to identify frame coordinates in the sprite texture.

I decided to replace the manual definition of the array values with a file in the following format:

```
x1,y1,w1,h1
x2,y2,w2,h2
...
xn,yn,wn,hn
```

Where:

* `x`, `y`, `w`, and `h` are the input values of an `SDL_Rect`, known as the *source rectangle* in [`SDL_RenderCopy`](https://wiki.libsdl.org/SDL2/SDL_RenderCopy).
* Each row represents a single animation frame.

## Reading Files

I was able to read the contents of a file using the [`SDL_LoadFile`](https://wiki.libsdl.org/SDL2/SDL_LoadFile) function.

## Parsing the Animation File Content

Parsing the animation data was more challenging than expected.

There isn't a straightforward way to split a string in C. I found an approach using [`strtok`](https://en.cppreference.com/w/c/string/byte/strtok) on [Stack Overflow](https://stackoverflow.com/questions/9210528/split-string-with-delimiters-in-c), but I ended up implementing a simpler parsing algorithm that doesn't require splitting a string.

The simpler algorithm iterates over the characters in the file content, populating a smaller array with a fixed number of characters (max length of 6, supporting the representation of positive integers up to 99999) with digits until a `,` or `\n` character is encountered. It then creates the new `SDL_Rect` value when a `\n` character is encountered.
