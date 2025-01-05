---
title: Contributing to Python - Newcomer feedback
layout: post
---

I started contributing to Python more or less four weeks ago. The initial impression has been great. The [documentation](https://devguide.python.org/) is rich and it's generally easy to get started.

## The process

The bug tracker (bugs.python.org) is generally easy to navigate and it has a lot of features, but it feels a little bit outdated. The only two things that I didn't like about it are:

1. It's hard to read on mobile devices
2. From time to time Gmail marks notification emails as spam

I was lucky I started contributing after the migration of Python to GitHub. The process of creating a new PR, signing the CLA, getting feedback, etc. is effortless. Bots and CI tools help keeping process clean and up to the standards.

The main entry point for newcomers to get things to do is the "Easy issues" list. My suggestion is to look for tasks that meet these requirements:

1. Don't have any patch attached to them
2. Have less than five comments
3. Have a clear explanation and acceptance criteria
4. Are recent

For now the only two tasks I've been able to merge into master are documentation updates.

I had a patch accepted for updating a test case, but a core dev closed it after a couple of weeks. My PR had started a discussion between core devs that ended up closing the task as it wasn't relevant.

It's been harder for me to get feedback on old tasks. I published two more patches associated to two old "easy" tasks. These PRs are still waiting for a review after more than two weeks.

## Alternative approaches

I tried a couple of alternative approaches.

I looked for TODOs in the source code. This approach hasn't been very successful. Most of the TODOs that I found are not clear and they don't reference any task.

I tried to contribute to satellite projects, such as `bedevere` and `the-knights-who-say-ni`. In both cases the process was a little bit easier than with `CPython`. That's because they're smaller projects and they're completely managed using GitHub. I published three PRs in total and I'm still waiting feedback on them.

## Improvements

Some ideas that could improve this process.

### Maintainers

It should be clearer who is the main maintainer of a feature or a module in the source code. This could help unblocking contributions and speeding up the feedback loop.

In general, knowing the maintainer of part of the source code would make it easier to get more context about it.

### Projects

It would be helpful to work on small projects with an increasing level of difficulty. Core devs should create these projects and help newcomers by mentoring them in case of need.

### Push model

Core devs could _leave_ tasks for newcomers. An automatic process assigns _leftover tasks_ to the next available newcomer.

The number of tasks assignable to a dev is proportional to the dev's level. The dev level is proportional to the number of tasks closed/resolved.

### Contributor career

There could be a path for contributors to become core developers and mentors. Having a clear set of goals would help measuring the progress toward the next level.
