---
title: A terminal music player based on afplay written in Haskell
layout: post
---

A couple of weeks ago a colleague shared with me the latest album by Radiohead.

I could have simply double clicked on a song to start iTunes, but that was *too
easy* and iTunes seemed just *too bloated*. What I needed was a minimal audio
player, even better: a terminal audio player.

From a quick search I found out about `afplay`, a Darwin command line utility to
play audio files. `afplay` worked fine, but I wanted also to pause/resume, to
skip songs, and to continue listening to the song after the current one without
having to start a new command.

It was the perfect excuse to write some Haskell.

I started building a terminal interface on top of `afplay`. After less than a
week of late night hacking, and thanks to
[brick](https://hackage.haskell.org/package/brick), a library to write terminal
applications, the first version of
[haskell-player](http://hackage.haskell.org/package/haskell-player) was ready.

![haskell-player 0.1.3.2]({{ '/assets/posts/haskell-player-0.1.3.2.png' | relative_url }})

The current set of features is really minimal and the app works only on OS X,
because it requires `afplay` and `afinfo`, but I'm still pretty happy of the
result.

Fork it at
[github.com/potomak/haskell-player](http://github.com/potomak/haskell-player).
