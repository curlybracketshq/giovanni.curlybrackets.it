---
title: Updating a GitHub Fork
layout: post
---

If you want to contribute a new feature to an open-source project hosted on GitHub, you can **fork** the repository, make your changes, test them, commit them, and finally open a *pull request*.

Over time, your local repository might become outdated. How can you update your fork with the latest version from the main repository?

1. Add a new `upstream` remote to track the main repository:

        $ git remote add upstream git://github.com/octocat/Spoon-Knife.git

2. Fetch updates from the upstream repository:

        $ git fetch upstream

3. Merge `upstream/master` into your current branch to apply the updates:

        $ git merge upstream/master

Resources:

* [GitHub Help - Fork a Repo](http://help.github.com/fork-a-repo/)
