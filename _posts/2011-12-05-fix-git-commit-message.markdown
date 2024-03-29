---
title: Fix git commit message
layout: post
---

[stackoverflow]: http://stackoverflow.com/questions/179123/how-do-i-edit-an-incorrect-commit-message-in-git "How do I edit an incorrect commit message in git?"
[bookgit]: http://book.git-scm.com/4_undoing_in_git_-_reset,_checkout_and_revert.html "Git Community Book - Undoing in Git - Reset, Checkout and Revert"

I often forget to reference issues or documentation in commit messages.

To fix the latest commit message run

    $ git commit --amend

edit and save the buffer. Done.

Want to edit an old commit message?

If you find a mistake in an older commit you can use git rebase interactive
mode, with `git rebase -i`, and mark the change that requires correction for
edit.

Resources:

* [Stackoverflow - How do I edit an incorrect commit message in git?][stackoverflow]
* [Git Community Book - Undoing in Git - Reset, Checkout and Revert][bookgit]
