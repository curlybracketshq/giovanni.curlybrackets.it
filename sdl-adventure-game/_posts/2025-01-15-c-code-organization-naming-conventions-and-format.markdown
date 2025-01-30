---
title: C Code Organization, Naming Conventions, and Formatting
layout: post
date: 2025-01-15 12:00:00 -0500
---

## Game Scene

A game scene is a collection of functions and state that models a single scene in the game. For instance, [in the game there will be four scenes]({% post_url sdl-adventure-game/2025-01-09-intro %}):

1. **Intro** - Title screen and main menu
2. **Playground Entrance** - The fox needs to find a way to enter the playground
3. **Playground** - The fox must fix the slide with help from her friend, the squirrel
4. **Outro**

Each scene must implement these functions:

1. `init` - Initializes scene state
2. `load_media` - Loads media such as images, sprites, and sounds
3. Game loop
   1. `process_input` - Event handling
   2. `update` - Updates the scene state
   3. `render` - Renders scene graphical objects
4. `deinit` - Destroys objects allocated in memory

## C Code Organization

So far, I was declaring and implementing all scene functions in `main.c`.

I decided to organize the functions of each scene into its own file: `intro.c`, `playground_entrance.c`, etc., but I wasn't too sure about how to do this in C.

C doesn't have namespaces; as a workaround, I initially used a prefix for the functions in each scene. For example, `intro_init` for the `init` function of the *intro* scene, and so on.

I wasn't sure if I could just `#include` a `.c` file directly, but I've read that's an anti-pattern. Instead, I created a `.c` file and a corresponding `.h` file with the function declarations.

There is no explicit concept of *public* and *private* visibility in C. However, the way I interpreted it was by declaring only functions in the `.h` file that would be visible outside the scene file scope. In the `.c` file, I implemented the functions declared in the header file and, if necessary, *static* functions that would only be accessible within the scene file scope.

By default, Xcode [wrapped the `.h` file content in a `#ifndef` directive](https://github.com/mcinglis/c-style?tab=readme-ov-file#provide-include-guards-for-all-headers-to-prevent-double-inclusion) to ensure the same file isn't imported twice. However, that's optional, and if I import the same file twice, I should get an error. Note: [Rob Pike is against this style](https://www.lysator.liu.se/c/pikestyle.html).

## C Naming Conventions

I found a couple of useful resources about naming conventions in C:

* C Coding Standard: [users.ece.cmu.edu/~eno/coding/CCodingStandard.html](https://users.ece.cmu.edu/~eno/coding/CCodingStandard.html)
* C Style Guidelines: [www.cs.umd.edu/~nelson/classes/resources/cstyleguide/](https://www.cs.umd.edu/~nelson/classes/resources/cstyleguide/)

In the project, I'm using a couple of conventions:

1. `typedef` types use CamelCase
2. Variable names use snake_case

## C Code Formatting

I'm manually using `clang-format` to format C code. Example: `clang-format -i image.c`.

I [tried to create a macOS automation](http://39.100.226.244/2024/07/12/using-clang-format-in-xcode/) and set a keyboard shortcut, but it didn't work as expected.

I'm using this CLI command to format all files in the project:

```sh
find sdlexample -name '*.c' -o -name '*.h' | xargs -I {} clang-format -i {}
```

## `clang-format` Style for Struct Initialization

I didn't like the default format used by `clang-format` for struct initialization. I would prefer each field to be on a new line. There is [a configuration](https://clang.llvm.org/docs/ClangFormatStyleOptions.html) to change the default behavior, but I ultimately just stuck with the default for simplicity.

I also tried to install a more recent version of `clang-format`, but it failed because I don't have a recent enough version of Xcode command-line tools:

```
You should download the Command Line Tools for Xcode 13.2.1
```

I have Xcode 12, and I can't install a newer version because it isn't supported by the operating system (OSX 11.7).
