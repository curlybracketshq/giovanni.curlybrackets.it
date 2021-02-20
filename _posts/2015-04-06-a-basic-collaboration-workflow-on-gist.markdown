---
title: A basic collaboration workflow on Gist
layout: post
---

The main purpose of this post is to introduce a basic workflow to collaborate on
[Gist](https://gist.github.com/).

First of all gists are nothing more than git repositories hosted at
[https://gist.github.com](https://gist.github.com/). They are typically used to
share snippets of code, but can they can also be used to write [live code
examples](http://bl.ocks.org/), [posts](http://gist.io/), and
[text-adventures](https://github.com/potomak/gist-txt).

You can learn more about how to [create a
gist](https://help.github.com/articles/creating-gists/) and [about
gists](https://help.github.com/articles/about-gists/) on GitHub Help pages.

In this post I will focus on how to manage *forks* and *remotes* to easily
collaborate on a gist with your coworkers.

## Prerequisites

You need a basic knowledge of Git and to have it installed on your PC.

Follow this guide to set up Git:
[https://help.github.com/articles/set-up-git/](https://help.github.com/articles/set-up-git/).

Follow this guide to learn Git basics:
[http://git-scm.com/book/en/v2/Getting-Started-Git-Basics](http://git-scm.com/book/en/v2/Getting-Started-Git-Basics).

## Gists are git repositories

A gist can be cloned as any other git repository using its *clone URL*.

Try cloning the example gist at
[https://gist.github.com/potomak/49832b4426a5f093037d](https://gist.github.com/potomak/49832b4426a5f093037d)
by running

```bash
giovanni$ git clone git@gist.github.com:/49832b4426a5f093037d.git hello-world
```

Now you can work on the gist as you would usually do with any other git
repository. For instance you can update the `hello-world.txt` file, add it to
the staging area, and commit your changes.

```bash
giovanni$ cd hello-world
giovanni$ echo "Foo" >> hello-world.txt
giovanni$ git add hello-world.txt
giovanni$ git commit -m "Update file"
```

If you run `git log` you should see two commits:

1. the initial commit I made to create the gist
1. the second commit where I updated `hello-world.txt`

```bash
giovanni$ git log --pretty=format:"%h - %an, %ar: %s"
b24c6d3 - Giovanni Cappellotto, 5 minutes ago: Update file
0927aec - Giovanni Cappellotto, 41 minutes ago:
```

To write your changes into the hosted repository *push* your local `master`
branch to the default `origin` remote.

```bash
giovanni$ git push origin master
```

Note: after the push you can view the full [list of
commits](https://help.github.com/articles/forking-and-cloning-gists/#viewing-gist-commit-history)
also online at
[https://gist.github.com/potomak/49832b4426a5f093037d/revisions](https://gist.github.com/potomak/49832b4426a5f093037d/revisions).

## Forks and remotes

To collaborate on gists repositories your team mates can
[*fork*](https://help.github.com/articles/forking-and-cloning-gists/#forking-gists)
them.

As a different GitHub user you can fork the example gist, for instance
[https://gist.github.com/gmarenda/57c23d008b770b4904ba](https://gist.github.com/gmarenda/57c23d008b770b4904ba),
clone it, and update it, following the steps:

```bash
giorgia$ git clone git@gist.github.com:/57c23d008b770b4904ba.git hello-world
giorgia$ cd hello-world
giorgia$ echo " Bar" >> hello-world.txt
giorgia$ git add hello-world.txt
giorgia$ git commit -m "Update file from fork"
```

Doing so Giorgia updated `hello-world.txt` and committed her changes on her
local repository, associated with the remote fork.

After her changes, the log on Giorgia's local repository will look like this:

```bash
giorgia$ git log --pretty=format:"%h - %an, %ar: %s"
e5a386d - Giorgia, 47 seconds ago: Update file from fork
b24c6d3 - Giovanni Cappellotto, 48 minutes ago: Update file
0927aec - Giovanni Cappellotto, 84 minutes ago:
```

Now if she pushes her changes to the `origin` remote

```bash
giorgia$ git push origin master
```

I'll be able to add her `origin` remote as a new `gmarenda` remote on my
repository to merge her `master` branch with mine.

```bash
giovanni$ git remote add gmarenda git@gist.github.com:/57c23d008b770b4904ba.git
giovanni$ git fetch gmarenda
giovanni$ git merge gmarenda/master
```

In the local repo now there are

* my changes from some time ago
* Giorgia's new commit

Giorgia's
[commit](https://gist.github.com/gmarenda/57c23d008b770b4904ba/e5a386d7cf5c05fad31b0db406cd3b2af87ab91a)
has been merged from her `master` branch, that has been taken from the
`gmarenda` remote based on her fork of the original gist.

Now I can push my updated `master` branch to `origin` to persist changes on the
hosted repo.

```bash
giovanni$ git push origin master
```

## Conclusion

The process is a little more manual than the one people are used to with *pull
requests* from GitHub's web interface, but I find it interesting and useful to
use such a simple collaboration flow on Gist.
