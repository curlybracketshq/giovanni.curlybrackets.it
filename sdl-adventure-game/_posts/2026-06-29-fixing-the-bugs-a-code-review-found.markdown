---
title: "Fixing the Bugs a Code Review Found"
layout: post
---

{% include ai-disclaimer.html %}

With [the engine split into adventures]({% post_url sdl-adventure-game/2026-06-24-an-engine-for-multiple-adventures %})
and Gina the hen now living alongside the fox, the codebase had grown enough that
I wanted a second pair of eyes on it. So I ran the engine through another round of
the [AI-assisted code review]({% post_url sdl-adventure-game/2025-01-17-ai-powered-code-review-and-the-fox-actor %})
I've leaned on before — this time file by file, all the way through `main.c`,
`game.c`, `asset.c`, `actor.c`, `image.c`, `sound.c`, and `scene.c`.

## Triaging the review before fixing anything

The review came back long, so before changing anything I triaged it into the
backlog. That step matters more than it sounds: a review mixes real crashes with
style opinions, and some of its suggestions were already handled — the audio chunk
size was fine, a couple of the "this will clobber" worries turned out to be safe
because the calls happen to run in sequence. Sorting the genuine bugs from the
nice-to-haves left a short, honest list of things actually worth fixing. Then I
picked the top of it.

## A global walk-end callback, shared by every actor

The clearest bug was a single line:

```c
static void (*on_end_walking)(void);
```

That's the "what to do when the character finishes walking" callback — and it was
a *global*. With one actor on screen it works. With two, the second
`actor_walk_to` overwrites the first's callback, and when the fox arrives it runs
the hen's callback instead of its own. It's the classic C single-global-callback
trap, and it had quietly survived the whole move to a generic actor. The fix is to
put the callback on the `Actor` itself, and to clear it *before* firing it, so a
callback that kicks off a new walk doesn't get immediately overwritten.

## Mix_HaltChannel(-1) halts every channel

The next one is the kind of bug that only shows up with a toddler holding the
device. When an actor stops walking, the engine halts its footstep sound:

```c
Mix_HaltChannel(actor->move_sound_channel);
```

But that channel defaults to `-1`, and it stays `-1` if the sound never started —
for instance when every mixer channel is already busy because someone is
spam-tapping the screen. And `Mix_HaltChannel(-1)` doesn't mean "halt nothing", it
means **halt every channel**: the music, the dialogue, all of it. So in exactly
the moment a two-year-old is mashing the screen, the voice line cuts out. Guarding
the call with `channel >= 0` keeps a stray stop from taking down the whole mixer.

## Smaller bugs: NaN heading, 32-bit overflow, NULL guards

A few more, each small on its own:

- Tapping *directly on the character* asked it to walk a distance of zero, and
  normalising a zero-length vector gave it a `NaN` heading. Computing the distance
  first and simply "arriving" when there's nowhere to go avoids the not-a-number.
- Talking duration is measured from the actual length of the voice clip — which is
  the right idea for a game with no on-screen text — but the arithmetic was done in
  32 bits, so any narration past about 89 seconds would overflow and wrap. A clip
  that long isn't in the game today, but a future story scene would have hit it.
  Sixty-four-bit math, done.
- `actor_talk(actor, NULL)` walked straight into a NULL dereference, and freeing an
  actor freed its sound chunk without stopping the channel still playing it. Both
  are one-line guards; both are the sort of thing that never happens until it does,
  on the audio thread, in the browser.

## The coordinate fix I reverted

The headline item from the review was a real one: mouse coordinates come in as
*window* pixels, but every hotspot in the game is defined in the *logical* 800×600
space the renderer scales from. On a resized or high-DPI window the two don't
match, so clicks land in the wrong place. The textbook fix is to convert each
event once, centrally, with `SDL_RenderWindowToLogical`.

I wrote it, and it broke the web build.

It turns out that on the browser, Emscripten's SDL already hands you mouse
coordinates *in logical space* — which is exactly why the game has always worked
online without any conversion. Converting again scaled them a second time, and on
a high-DPI canvas that put every tap in the wrong spot. So the "obvious" fix is
really two different fixes: convert on the native desktop, where events are in
window pixels, and leave the browser alone. That needs testing on a real resized
window and an actual iPad — neither of which my headless smoke test can stand in
for — so I backed it out and wrote down what I'd learned in the backlog rather than
ship a fix I couldn't verify. Knowing *why* a change is wrong is worth a commit on
its own.

## Where it stands

Everything that did land is small, contained, and checked: the desktop, terminal,
and web builds are green, and the full headless playthrough still walks Gina from
the shade to the pool without missing a beat. The rest of the review — a
caller-owned asset path, a hardened sprite-sheet parser, the coordinate fix done
properly — is queued up and waiting. You can still play the current build at
[potomak.github.io/VaniaVolpe](https://potomak.github.io/VaniaVolpe/).
