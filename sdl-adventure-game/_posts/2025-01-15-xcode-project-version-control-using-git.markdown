---
title: Xcode Project Version Control Using Git
layout: post
date: 2025-01-15 09:00:00 -0500
---

Until now, I was updating code without keeping track of changes, so I added version control using Git.

## Git and Xcode

I added the GitHub [`.gitignore` template](https://github.com/github/gitignore/blob/ceea7cab/Global/Xcode.gitignore) for Xcode, which is very straightforward.

I decided to add `.DS_Store` to the ignore list.

## Assets

I could use [Git LFS](https://git-lfs.com/) to track only references to asset files (images, sounds), but I decided to put everything under version control to keep things simple.

## Libraries and Frameworks

Initially, I included the frameworks I've used — SDL2, SDL_mixer, SDL_image — directly in the repository instead of referencing them. Later, I added their paths to the `.gitignore` and rewrote the project history to exclude them from version control.

I believe the best way to reference external libraries and make the project platform-independent is to use and add references to the frameworks in the `CMakeLists.txt`.

It might also be possible to build the macOS app without Xcode, directly from the command line, but I'm unsure how to do that. I've decided to keep it as a to-do task.
