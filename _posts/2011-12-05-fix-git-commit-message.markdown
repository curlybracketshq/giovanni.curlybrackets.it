---
title: Fix Git Commit Message
layout: post
---

[stackoverflow]: http://stackoverflow.com/questions/179123/how-do-i-edit-an-incorrect-commit-message-in-git "How do I edit an incorrect commit message in Git?"
[bookgit]: http://book.git-scm.com/4_undoing_in_git_-_reset,_checkout_and_revert.html "Git Community Book - Undoing in Git - Reset, Checkout and Revert"

I often forget to reference issues or documentation in commit messages.

To fix the latest commit message, run:

    $ git commit --amend

Edit and save the buffer. Done.

Need to edit an older commit message?

If you find a mistake in an older commit, you can use Git rebase interactive mode with `git rebase -i`, and mark the change that requires correction for editing.

Resources:

* [Stack Overflow - How do I edit an incorrect commit message in Git?][stackoverflow]
* [Git Community Book - Undoing in Git - Reset, Checkout and Revert][bookgit]
