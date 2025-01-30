---
title: Parsing animation metadata
layout: post
date: 2025-01-17 13:00:00 -0500
---

Animation metadata include an `SDL_Rect` array used to identify frames coordinates in the sprite texture.

I decided to replace the manual definition of the array values with a file with the format:

```
x1,y1,w1,h1
x2,y2,w2,h2
...
xn,yn,wn,hn
```

Where:

* `x`, `y`, `w`, `h` are the input values of a `SDL_Rect`, called the *source rectangle* in [`SDL_RenderCopy`](https://wiki.libsdl.org/SDL2/SDL_RenderCopy)
* Each row is a single animation frame

## Reading files

I was able to read the content of a file using the [`SDL_LoadFile`](https://wiki.libsdl.org/SDL2/SDL_LoadFile) function.

## Parsing the animation file content

Parsing the animation data was more challenging than expected.

There isn't a straightforward way to split a string in C. I found this approach using [`strtok`](https://en.cppreference.com/w/c/string/byte/strtok): [stackoverflow.com/questions/9210528/split-string-with-delimiters-in-c](https://stackoverflow.com/questions/9210528/split-string-with-delimiters-in-c), but I ended up implementing a simpler parsing algorithm that doesn't require splitting a string.

The simpler algorithm iterates over the characters in the file content and populates a smaller array with a fixed number of characters (max length 6, supporting the representation of positive integers up to 99999) with digits until a `,` or `\n` character is encountered, and then creates the new `SDL_Rect` value when a `\n` character is encountered.
