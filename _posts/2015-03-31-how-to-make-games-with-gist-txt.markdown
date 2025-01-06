---
title: How to Make Games with gist-txt
layout: post
---

**Disclaimer:** The content of this post is not original. Most of it is from Anna Anthropy's ["How to Make Games with Twine"](http://www.auntiepixelante.com/twine/).

## What is gist-txt?

**[gist-txt](https://github.com/potomak/gist-txt)** is a web app that allows you to host interactive stories.

## Why is gist-txt so wonderful?

1. It's free.
2. You don't need to know how to program.
3. You don't need to install any software to use it.
4. Finished stories can be shared with a simple link.

## The Basics

Every story is a [Gist](https://gist.github.com/).

The first scene in your story is named `index.markdown`.

Other scenes can be named anything you like, but the name of the first scene **must be `index.markdown`**.

![First scene]({{ '/assets/posts/first-scene.png' | relative_url }})

A **scene** is equivalent to a page in a *Choose Your Own Adventure* book and can be as long or short as you prefer. Click on the text area to write in it.

![First scene]({{ '/assets/posts/first-scene-2.png' | relative_url }})

Great! Now, let's create a link to another scene. The player can access that scene by clicking on the link, similar to hyperlinks in HTML pages. Here's what a link looks like:

![Link]({{ '/assets/posts/link.png' | relative_url }})

The text inside the square brackets is what the player sees. The text inside the parentheses is the name of the scene they go to when they click on it. If you were using Twine, you would see an exclamation point in the corner of the scene indicating that the linked scene is missing. However, since you're using gist-txt, there's no such alert!

Add a new file in the Gist with the name you assigned to the linked scene (`passage.markdown`).

![Add file]({{ '/assets/posts/add-file.png' | relative_url }})

Then, write the text of the scene in it.

![Second scene]({{ '/assets/posts/second-scene.png' | relative_url }})

If you return to the first scene and add a new link to another scene, you've now created a branching story! Now the player has a choice.

Or at least they will once you publish the story. Click "Create public Gist".

![Create public Gist]({{ '/assets/posts/create-gist.png' | relative_url }})

Copy the ID of the Gist.

![Copy Gist ID]({{ '/assets/posts/copy-id.png' | relative_url }})

Now, open `http://potomak.github.io/gist-txt/#<gist-id>` in a new tab to share the story.

![Publish]({{ '/assets/posts/publish.png' | relative_url }})
