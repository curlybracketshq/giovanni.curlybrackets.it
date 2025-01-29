---
title: Xcode project version control using Git
layout: post
date: 2025-01-15 09:00:00 -0500
---

Until now I was updating code without keeping track of changes, so I added version control using Git.

## Git and Xcode

I added the GitHub [`.gitignore` template](https://github.com/github/gitignore/blob/ceea7cab/Global/Xcode.gitignore) for Xcode that is very simple.

I decided to add `.DS_Store` in the ignore list.

## Assets

I could probably use [Git LFS](https://git-lfs.com/) to track only references to asset files (images, sounds), but I decided to put everything under version control to keep things simple.

## Libraries and frameworks

I initially included in the repo the frameworks I've used: SDL2, SDL_mixer, SDL_image, instead of referencing them in some way. I later included their path in the `.gitignore` and rewrote the project history to exclude them from version control.

I think the best way to reference external libraries and to make the project platform independent would be to use and to add a reference to the frameworks in the `CMakeLists.txt`.

It might also be possible to build the macOS app without Xcode, directly from the command line, but I'm not sure how to do that and I decided to keep it as a TODO.
