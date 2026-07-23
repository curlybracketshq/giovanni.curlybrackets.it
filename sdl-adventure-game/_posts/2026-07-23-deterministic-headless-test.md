---
layout: post
title: Removing wall-clock flakiness from a scripted playthrough test
tags: [testing, determinism, c, sdl2, game-dev]
---

{% include ai-disclaimer.html %}

Vania Volpe is a small point-and-click adventure written in C99 and SDL2. Its
main gameplay gate in CI is a headless scripted playthrough: a test harness
brings the game up with SDL's offscreen video driver and a dummy audio driver,
replays a fixed sequence of taps and waits, and asserts that the expected
dialogue lines were spoken, in order. The script lives in a single JSON file
that both the native C test and a Puppeteer browser test consume.

This post describes a flaky failure in that test, its root cause, and the fix.

## The symptom

The native test intermittently failed one dialogue assertion —
`Il salvagente e' sull'albero` ("the float is on the tree") — roughly one run in
three, passing again on re-run with no code change. Because the failure was
nondeterministic, it could turn CI red on any pull request regardless of what
that pull request changed. It first appeared on a change whose diff only touched
rendering and therefore could not affect dialogue at all, which was the first
signal that the problem was in the harness, not the code under test.

## How the harness asserts dialogue

The playthrough is a list of steps. Each step performs an action (a tap) and
then runs the game loop for a fixed `wait_ms` so walks and spoken lines can
finish:

```c
case SCRIPT_CLICK:
  harness_click(s->x, s->y);
  harness_pump_for(s->wait_ms);
  break;
```

Everything the game logs at INFO — including each spoken line — is captured into
a buffer. At the end, the harness scans that buffer for each expected line in
order:

```c
int harness_check_lines_in_order(const char *const *expected, size_t count) {
  size_t offset = 0;
  for (size_t i = 0; i < count; i++) {
    const char *hit = strstr(log_buf + offset, expected[i]);
    if (hit == NULL) { /* MISS */ }
    else { offset = (hit - log_buf) + strlen(expected[i]); }
  }
}
```

A line only appears in the log if the game reached the state that speaks it
*within that step's `wait_ms`*. If it did not, the ordered scan comes up one line
short, and the run fails.

## Root cause: the simulation ran on the wall clock

The harness advanced the game using real elapsed time:

```c
void harness_step_frame(void) {
  process_input();
  Uint32 now = SDL_GetTicks();
  float delta_time = (now - last_frame_time) / 1000.0;
  last_frame_time = now;
  game_update(delta_time);
  /* render */
}

void harness_pump_for(Uint32 ms) {
  Uint32 until = SDL_GetTicks() + ms;
  while (game.is_running && SDL_GetTicks() < until) {
    harness_step_frame();
    SDL_Delay(8);
  }
}
```

`SDL_Delay(8)` is a *minimum* delay; under load the OS can return later, so the
number of frames and the exact simulated time per step vary between runs. The
engine compounded this: animations and dialogue were also timed against
`SDL_GetTicks()` directly — for example `game_update` advanced the current
scene's animations with `update_scene_animations(scene, SDL_GetTicks())`, and
the actor recorded `started_talking_at = SDL_GetTicks()`.

The failure has a specific mechanism. Dialogue is blocking: while an actor is
`TALKING`, a walk request is refused. If a previous line's talk duration
overran a step's window because that step ran slightly slower, the next tap's
walk never completed, so its arrival callback — the one that speaks the next
line — never fired. The line was missing from the log, and the ordered scan
failed. None of this is stable across machines, because the clock driving the
simulation *was* the machine's wall clock.

## The fix: a clock seam and a virtual clock

The engine now reads the current time through one function instead of calling
`SDL_GetTicks()` directly:

```c
// clock.h
Uint32 clock_now_ms(void);      // SDL_GetTicks() in real mode; the virtual counter in virtual mode
void clock_set_virtual(bool on);
void clock_advance(Uint32 ms);
bool clock_is_virtual(void);
```

```c
// clock.c
static bool virtual_mode = false;
static Uint32 virtual_now = 0;

Uint32 clock_now_ms(void) { return virtual_mode ? virtual_now : SDL_GetTicks(); }
void clock_set_virtual(bool on) { virtual_mode = on; virtual_now = 0; }
void clock_advance(Uint32 ms) { if (virtual_mode) virtual_now += ms; }
```

In production nothing changes: the clock stays in real mode, `clock_now_ms()` is
`SDL_GetTicks()`, and the normal game loop is untouched. Every engine site that
timed simulation state was routed through the seam: the actor's fidget schedule,
animation tick, and talk start/end; the animation `start_time`; the scene
animation tick in `game_update`; and the subtitle timer.

The harness switches to virtual mode once, before any actor or animation exists,
and then advances the clock a fixed amount per frame:

```c
#define HARNESS_STEP_MS 16

void harness_step_frame(void) {
  process_input();
  clock_advance(HARNESS_STEP_MS);
  game_update(HARNESS_STEP_MS / 1000.0F);
  /* render */
}

void harness_pump_for(Uint32 ms) {
  Uint32 elapsed = 0;
  while (game.is_running && elapsed < ms) {
    harness_step_frame();
    elapsed += HARNESS_STEP_MS;
  }
}
```

Two things matter here. First, `game_update` receives a fixed delta and the
animation and talk timers read the same virtual clock, so frame-delta motion and
clock-based timing advance in lockstep. Second, `harness_pump_for` runs a fixed
*number of frames* rather than for a wall-clock *duration*, so a step always
advances the simulation by the same amount however fast or slow the host is.
`SDL_Delay` is gone, which also makes the test run faster.

One consequence to handle: the clock is virtual for the whole test process, and
the pure unit tests run after the playthrough. A couple of them read the clock
directly (to age an animation past its runtime, or to assert a fidget timer is
scheduled in the future), so those were pointed at `clock_now_ms()` too. During
the unit tests the virtual clock is simply frozen, which is exactly what those
assertions want.

## Verification

The point of the change is that the result no longer depends on timing, so the
test:

- ran 12 times back to back, all passing, with byte-identical assertion output
  between the first and last run; and
- ran green five times under deliberate CPU load (eight busy loops in the
  background) — the condition that previously produced the failure.

## Scope

This fixes the native harness. The browser playthrough consumes the same JSON
script but runs in a real browser in real time, so it cannot use a virtual
clock; a deterministic version there would wait until the expected dialogue
appears rather than for a fixed duration. That is tracked separately and left
out of this change.

## Takeaway

A scripted simulation test is only as deterministic as its clock. If the
simulation reads wall-clock time — directly, or through frame deltas measured
from it — the test inherits the host's scheduling jitter, and fixed per-step
waits turn that jitter into flakiness. Routing time through a single seam and
driving it with a fixed timestep under test makes the run reproducible and,
usefully, faster.

The change: [potomak/VaniaVolpe#156](https://github.com/potomak/VaniaVolpe/pull/156)
(issue [#155](https://github.com/potomak/VaniaVolpe/issues/155)).
