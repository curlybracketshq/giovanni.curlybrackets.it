---
title: "Testing the Game in a Terminal"
layout: post
---

{% include ai-disclaimer.html %}

A while back I gave the game a [terminal front end]({% post_url sdl-adventure-game/2026-03-25-terminal-build-using-libcaca %}):
a `terminal` build that renders the whole thing as coloured ASCII art with
libcaca and needs no display server at all. It was a fun way to play over SSH —
but the more interesting thing it unlocked was hiding in plain sight. If the game
can run with no window, no GPU, and no sound card, then it can run *in CI*. That
makes it testable. So I finally built the test.

## The part I'd been putting off

There's a "Future" section at the bottom of my terminal plan that I'd never come
back to: a headless test target. The terminal build already does the hard part —
before `SDL_Init` it sets `SDL_VIDEODRIVER=offscreen` and creates a **software**
renderer, so every frame is drawn into an ordinary RGBA buffer instead of onto a
screen ([the original change](https://github.com/potomak/VaniaVolpe/commit/c3eefe2)).
Nothing about the game logic depends on it. So a test is just: script some
clicks, run the loop, and check the game did what it should.

I already had a version of this for the web build — a small Puppeteer script that
loads the WebAssembly page, clicks its way through Gina's whole adventure, and
asserts that the right lines of dialogue show up in the console. What I was
missing was the same idea *natively*, with no browser in the loop.

## `make test`

The new target builds a `vaniavolpe_test` binary: the terminal build minus
libcaca, using the offscreen video driver, a software renderer, and the `dummy`
audio driver. Instead of reading events from a terminal, it pushes a scripted
list of mouse clicks straight onto SDL's event queue — the game's
`process_input` can't tell them apart from a real click, so every scene, minigame
and state transition runs exactly as it does for a player.

Then it checks the game *did the adventure*. Rather than compare screenshots, it
reads the dialogue the game logs — "Ho preso gli occhialini!", "Cestino pieno d'uva!",
"Ecco il tuo salvagente!" — and asserts those lines appear in order, from the hub
all the way to the dive. If one is missing, it reports which and exits non-zero.
It also reads one frame back with `SDL_RenderReadPixels` and checks it isn't a
single flat colour, a cheap way to catch the classic "black screen / missing
texture" regression without pinning down exact pixels.

## Capturing the game's dialogue output

That part took two goes. In the first version the game printed its dialogue with
`printf`, so the harness just redirected its own stdout to a file with `freopen`,
ran the playthrough, and read the file back to check the lines. It worked, but it
always felt like a hack — shuffling a temp file around, and relying on the game
scattering `printf`s to stdout.

So I did the cleaner thing: moved all the game's dialogue and messages onto
`SDL_Log` (which is where the engine's own diagnostics already went), and gave
the harness an `SDL_LogSetOutputFunction` sink — a small callback SDL hands every
log line, which the harness appends to an in-memory buffer and tees to stderr.
Now the assertions read that buffer directly: no temp file, no `freopen`, no
stdout juggling, all in-process. It was a nice two-for-one — the game logs
consistently everywhere (terminal, `logcat`, the browser console), and the test
gets a clean stream to match against for free.

That's it: `make test && ./vaniavolpe_test`, twelve green checks, exit 0. A
GitHub Actions job runs it on every push and pull request, so a broken
playthrough now fails CI the same way a broken build does.

## Why not golden screenshots

The obvious version of a "snapshot test" is to hash the rendered frame and diff
it against a saved reference. I decided against making that the core of it. Exact
pixel hashes are miserable in CI — they wobble between SDL versions and CPUs, and
every tiny art tweak turns the whole suite red for no real reason. Asserting on
the dialogue the game *produces* is far more stable, and it's testing the thing I
actually care about: can the hen get through her adventure.

One honest limitation: the playthrough runs at real wall-clock speed, because the
animation and talk-duration code reads `SDL_GetTicks()` directly, so walks and
spoken lines take as long as they take — the whole run is about three-quarters of
a minute. A faster, perfectly deterministic version would need a clock I can
fast-forward, which means threading a time source through the engine. That's a
bigger change than it's worth right now; the timed smoke test is robust enough to
be useful today.

It's a nice payoff for a front end I mostly built as a novelty. The terminal
renderer turned out to be the cheapest possible test harness — a whole game loop
that runs anywhere, watched not by a person squinting at ASCII art but by a
machine reading the lines it prints.
