---
title: How to make games with gist-txt
layout: post
---

**Disclaimer:** content of this post is not original, most of it is taken from
Anna Anthropy's ["How to make games with
Twine"](http://www.auntiepixelante.com/twine/)

## What is gist-txt?

**[gist-txt](https://github.com/potomak/gist-txt)** is a web app that lets you
host interactive stories.

## Why is gist-txt so wonderful?

1. It's free
1. You don't need to know how to program
1. You don't need to install any program to use it
1. Finished stories can be shared with a simple link

## The basics

Every story is a [Gist](https://gist.github.com/).

The first scene in your story is called `index.markdown`.

Other scenes can be named whatever you like, but the name of the first scene
**has to be `index.markdown`**.

![First scene]({{ '/assets/posts/first-scene.png' | relative_url }})

A **scene** is the equivalent of a page in a *Choose Your Own Adventure* book,
but it can be as long or short as you like. Click on the text area to write in
it.

![First scene]({{ '/assets/posts/first-scene-2.png' | relative_url }})

Radical! Now let's create a link to another scene. The player can go to that
scene by clicking on the link, like HTML pages hyperlink. Here's what a link
looks like:

![Link]({{ '/assets/posts/link.png' | relative_url }})

The text inside the square brackets is what the player sees. The text inside the
round brackets is the name of the scene she goes to when she clicks on it. Now
if you were using Twine you would see an exclamation point in the corner of the
scene saying that the scene pointed by the link is missing, but since you're
using gist-txt there's no such thing!

Add a new file in the gist with the name you gave to the scene linked
(`passage.markdown`)

![Add file]({{ '/assets/posts/add-file.png' | relative_url }})

and write text of the scene in it.

![Second scene]({{ '/assets/posts/second-scene.png' | relative_url }})

If you go back to the first scene, add a new link to another scene, now you've
got a branching story! Now the player has a choice!

Or at least she will when you publish the story. Click "Create public Gist"

![Create public Gist]({{ '/assets/posts/create-gist.png' | relative_url }})

and copy the id of the gist.

![Copy Gist id]({{ '/assets/posts/copy-id.png' | relative_url }})

Now open `http://potomak.github.io/gist-txt/#<gist-id>` in a new tab to share
the story.

![Publish]({{ '/assets/posts/publish.png' | relative_url }})
