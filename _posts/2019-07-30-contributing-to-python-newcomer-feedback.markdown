---
title: Contributing to Python - Newcomer Feedback
layout: post
---

I started contributing to Python about four weeks ago. My initial impression has been great. The [documentation](https://devguide.python.org/) is extensive, making it generally easy to get started.

## The Process

The bug tracker (bugs.python.org) is generally easy to navigate and has many features, but it feels somewhat outdated. The only two things I didn't like about it are:

1. It's hard to read on mobile devices.
2. Occasionally, Gmail marks notification emails as spam.

I was fortunate to begin contributing after Python's migration to GitHub. The process of creating a new PR, signing the CLA, and receiving feedback is straightforward. Bots and CI tools help keep the process clean and up to standards.

The main entry point for newcomers is the "Easy issues" list. I suggest looking for tasks that meet these requirements:

1. No patch is attached to them.
2. They have fewer than five comments.
3. They include a clear explanation and acceptance criteria.
4. They are recent.

So far, the only tasks I've merged into the master branch are documentation updates.

I had a patch accepted for updating a test case, but a core developer closed it after a couple of weeks. My PR initiated a discussion among core developers that resulted in closing the task as it wasn't relevant.

It's been more challenging for me to get feedback on older tasks. I published two additional patches for two old "easy" tasks. These PRs are still awaiting review after more than two weeks.

## Alternative Approaches

I tried a couple of alternative approaches.

I looked for TODOs in the source code, but this wasn't very successful. Most of the TODOs I found are unclear and don't reference any tasks.

I also tried contributing to satellite projects, such as `bedevere` and `the-knights-who-say-ni`. In both cases, the process was slightly easier than with `CPython` because they're smaller projects and are fully managed on GitHub. I published three PRs in total and am still waiting for feedback on them.

## Improvements

Here are some ideas for improving this process.

### Maintainers

It should be clearer who is the main maintainer of a feature or a module in the source code. This could help unblock contributions and accelerate the feedback loop.

Knowing the maintainer of a part of the source code would generally provide more context.

### Projects

It would be helpful to work on small projects with increasing levels of difficulty. Core developers should create these projects and offer mentorship to newcomers as needed.

### Push Model

Core developers could _leave_ tasks for newcomers. An automatic process could assign _leftover tasks_ to the next available newcomer.

The number of tasks assignable to a developer should be proportional to the developer's level. The level would correlate with the number of tasks closed/resolved.

### Contributor Career

There could be a clear path for contributors to become core developers and mentors. Having well-defined goals would help measure progress toward the next level.
