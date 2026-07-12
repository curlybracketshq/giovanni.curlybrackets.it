---
title: "One Script, Two Test Front Ends"
layout: post
---

{% include ai-disclaimer.html %}

In the [last post]({% post_url sdl-adventure-game/2026-07-02-testing-the-game-in-a-terminal %}) I
built a headless native test: run the game offscreen, script some clicks, and
assert the right dialogue comes out. But I already had a *second* playthrough
test — a Puppeteer script that drives the WebAssembly build in a real browser.
Two tests, same adventure, and — this is the bad part — two copies of the entire
playthrough: the same click coordinates, the same waits, the same list of
expected lines, written out once in C and once in JavaScript.

That's a trap. The moment I nudge a hotspot or reword a line, one copy goes stale
and the tests quietly disagree about what the game does. So before wiring the
browser test into CI, I made the two share a single source of truth.

## The playthrough is data, not code

The insight is that a playthrough isn't really code — it's a list of instructions.
"Click here, wait a beat, hold and scrub over there, take a screenshot, expect
these words." So I moved all of that into one JSON file:

```json
{
  "steps": [
    { "action": "click", "x": 0.5, "y": 0.497, "wait_ms": 1500 },
    { "action": "screenshot", "name": "01-pool" },
    { "action": "brush", "x0": 0.36, "x1": 0.64, "y0": 0.31, "y1": 0.69,
      "rows": 8, "wait_ms": 1500 },
    ...
  ],
  "expect": [
    "Ho preso gli occhialini",
    "Ecco il tuo salvagente",
    ...
  ]
}
```

Coordinates are fractions of the screen, so they mean the same thing at 800×600
native and on a scaled browser canvas. There are only four verbs — `click`,
`brush` (the hold-and-scrub sunscreen minigame), `wait`, and `screenshot` — and
each side has a tiny interpreter that walks the list and does the obvious thing.

## Getting JSON into C

The browser runner just `require`s the JSON — done. C is the awkward one: it has
no JSON parser, and I wasn't about to add a dependency for a test fixture. So a
small Python script reads the JSON at build time and emits a C header:

```c
static const ScriptStep GINA_STEPS[] = {
    {.action = SCRIPT_CLICK, .x = 0.5, .y = 0.497, .wait_ms = 1500},
    {.action = SCRIPT_SCREENSHOT, .name = "01-pool"},
    ...
};
```

The Makefile runs the generator before building the test, so the header is always
in sync with the JSON — there's no committed copy to drift. The native play-test
collapsed to almost nothing: run the generated steps, then check the generated
list of expected lines. The whole choreography — which used to be forty-odd lines
of hand-written C — now lives in the JSON and nowhere else.

## Screenshots that pull double duty

The browser test earns its keep by taking a screenshot at each `screenshot` step
and uploading them from CI, so I can *look* at what the game rendered on a real
canvas — the hub, the sunscreen close-up, the tree, the dive. That's the kind of
check a log-line assertion can't give you.

The neat part is that the native test reads those same `screenshot` steps too.
It can't save a browser PNG, but it can do the cheap analog: read the frame back
with `SDL_RenderReadPixels` and assert it isn't a single flat colour — a guard
against the classic "black screen / missing texture" regression. So one entry in
the JSON means "save a picture" in the browser and "prove the frame isn't blank"
natively, and the native test went from one such check to six for free.

## Two front ends, one truth

Now both run in CI on every push: the native playthrough gates on the dialogue,
the browser playthrough gates on the dialogue *and* leaves a trail of
screenshots. When I want to change the adventure's flow, I edit one JSON file and
both front ends follow. Adding the second adventure's playthrough will be a new
`.json` and nothing else.

It's a small thing, but it's the sort of small thing that decides whether a test
suite is an asset or a liability a year from now. Duplicated test fixtures rot;
a single description that two runners obey does not.
