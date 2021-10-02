---
title: A minimal tool to create text adventures
layout: post
---

Yesterday I published the very first version of a minimal tool to create and
publish text adventures. It's called **gist-txt** and you can find the source
code at
[https://github.com/potomak/gist-txt](https://github.com/potomak/gist-txt).

The inspiration for this project came from two pieces of software:

1. Twine ([http://twinery.org/](http://twinery.org/)), an open-source tool for
   telling interactive, nonlinear stories
2. bl.ocks.org ([http://bl.ocks.org/](http://bl.ocks.org/)), a simple viewer for
   code examples hosted on GitHub Gist

Tool's features are very limited. What it does is basically reading GitHub
public gists and handle links to browse between files of the gist (*scenes* in
gist-txt's vocabulary). The cool part is that you can create your text adventure
simply by creating a new gist. This lets you easily share and track updates of
your work (gists are git repositories). Another cool part of this tool is that
the hosting is as simple as a specially crafted url: just share an URL in the
form `http://potomak.github.io/gist-txt/#<your-gist-id>` to let people play your
game.

I made simple example gist at
[https://gist.github.com/potomak/acebd8fe14942fab4e8e](https://gist.github.com/potomak/acebd8fe14942fab4e8e), 
this can be shared as a text adventure with the link
[http://potomak.github.io/gist-txt/#acebd8fe14942fab4e8e](http://potomak.github.io/gist-txt/#acebd8fe14942fab4e8e).

I'm going to use it to prototype text adventures, but I'd like to know what do
you think about it and I'm looking forward to see what people could achieve with
this minimal set of features.

**Update 03/16/2015:** I posted about tool's
[updates and new features]({% post_url
2015-03-16-update-about-gist-txt-a-text-adventure-engine %}) as of version
1.6.0.

*Originally published at
[http://ludumdare.com/compo/2015/03/05/a-minimal-tool-to-create-text-adventures/](http://ludumdare.com/compo/2015/03/05/a-minimal-tool-to-create-text-adventures/).*