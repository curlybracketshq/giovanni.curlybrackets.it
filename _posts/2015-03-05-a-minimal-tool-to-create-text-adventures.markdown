---
title: A Minimal Tool to Create Text Adventures
layout: post
---

Yesterday, I published the very first version of a minimal tool to create and publish text adventures. It's called **gist-txt**, and you can find the source code at [github.com/potomak/gist-txt](https://github.com/potomak/gist-txt).

The inspiration for this project came from two software projects:

1. Twine ([twinery.org](http://twinery.org/)), an open-source tool for telling interactive, nonlinear stories.
2. bl.ocks.org ([bl.ocks.org](http://bl.ocks.org/)), a simple viewer for code examples hosted on GitHub Gist.

The tool's features are very limited. It basically reads GitHub public gists and handles links to browse between files of the gist (*scenes* in gist-txt's vocabulary). The exciting part is that you can create your text adventure simply by creating a new gist, allowing you to easily share and track updates of your work (since gists are backed by Git repositories). Another appealing aspect of this tool is the simple hosting process: just share a URL in the form `http://potomak.github.io/gist-txt/#<your-gist-id>` to let people play your game.

I created a simple example gist at [gist.github.com/potomak/acebd8fe14942fab4e8e](https://gist.github.com/potomak/acebd8fe14942fab4e8e), which can be shared as a text adventure with the link [potomak.github.io/gist-txt/#acebd8fe14942fab4e8e](https://potomak.github.io/gist-txt/#acebd8fe14942fab4e8e).

**Update 03/16/2015:** I published a new post about some [new features]({% post_url 2015-03-16-update-about-gist-txt-a-text-adventure-engine %}).
