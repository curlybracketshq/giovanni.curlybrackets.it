---
title: A Terminal Music Player Based on afplay Written in Haskell
layout: post
---

A couple of weeks ago, a colleague shared the latest Radiohead album with me.

I could have simply double-clicked on a song to start iTunes, but that seemed *too easy* and iTunes was just *too bloated*. What I needed was a minimal audio player, even better: a terminal audio player.

With a quick search, I discovered `afplay`, a Darwin command-line utility to play audio files. `afplay` worked fine, but I also wanted to pause/resume, skip songs, and continue listening to songs sequentially without having to start a new command each time.

It was the perfect excuse to write some Haskell.

I began developing a terminal interface on top of `afplay`. After less than a week of late-night hacking, and thanks to [brick](https://hackage.haskell.org/package/brick), a library to write terminal applications, the first version of [haskell-player](http://hackage.haskell.org/package/haskell-player) was ready.

![haskell-player 0.1.3.2]({{ '/assets/posts/haskell-player-0.1.3.2.png' | relative_url }})

The current set of features is minimal, and the app only works on OS X because it requires `afplay` and `afinfo`. Nevertheless, I'm quite happy with the result.

Fork it at [github.com/potomak/haskell-player](http://github.com/potomak/haskell-player).
