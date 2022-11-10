---
title: Update GitHub fork
layout: post
---

Let's say you want to contribute with a new feature to an open source project
hosted on GitHub.

You can **fork** the repo, edit, test, commit your changes, and finally open a
*pull request*.

After some time your local repo might become outdated. How can you update your
fork by getting the most recent version from the main repo?

1. Add a new `upstream` remote to track the main repo

        $ git remote add upstream git://github.com/octocat/Spoon-Knife.git

2. Fetch upstream in your local repo

        $ git fetch upstream

3. Merge `upstream/master` in your current branch to apply the updates

        $ git merge upstream/master

Resources:

* [GitHub Help - Fork a repo](http://help.github.com/fork-a-repo/)
