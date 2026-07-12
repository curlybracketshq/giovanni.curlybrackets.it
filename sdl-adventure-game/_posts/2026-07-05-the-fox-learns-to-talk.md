---
layout: post
title: "Lip-Sync from Offline-Generated Mouth Cues"
---

{% include ai-disclaimer.html %}

Vania's dialogue audio has played since
[January 2025]({% post_url /sdl-adventure-game/2025-01-22-music-sound-effects-and-dialogs %}):
play the line's WAV, loop a three-frame talking animation for exactly as long
as the audio lasts, done. It worked, but it was the same mouth-flapping loop
whether the line was "Evviva!" or a two-sentence hint about the squirrel — and
it kept flapping straight through the pauses in the audio. This week the talking
animation was updated to follow the mouth shapes in the spoken line, instead of
looping on a timer. The problem split into two halves, and the harder one had
already been solved by an existing tool.

## Offline lip-sync generation instead of runtime speech recognition

Turning audio into mouth shapes is a speech-recognition problem, and I had no
intention of doing speech recognition inside a C99 game engine. The plan
(drafted with Claude, like the [pathfinding
one](https://github.com/potomak/VaniaVolpe/blob/main/MOVEMENT.md)) was to do it
**offline**: run a tool over each dialogue WAV once, commit its output as a
tiny text file next to the WAV, and have the engine merely *play* the result.

The tool is [Rhubarb Lip
Sync](https://github.com/DanielSWolf/rhubarb-lip-sync), which was built for
exactly this — 2D adventure games — and outputs precisely the thing I need:
not phonemes, but *mouth shapes with timestamps*. Its default recognizer
expects English; its `phonetic` recognizer is language-independent — it matches
sounds rather than words. That's what makes Italian (and any future locale) work
with zero per-language setup. A new script, `tools/gen_lipsync.py`, runs it
over every `dialog/*.wav` and writes a `.cues` sidecar in the same format
family as the `.anim` files — one thing per line, trivially parseable:

```
0 A
890 A
1040 F
1360 B
1500 E
```

Each line is "from this millisecond, hold this mouth shape". The sidecars are
committed, so the build, CI, and the web bundle never run Rhubarb; the
`--preload-file` directories pick the new files up without a Makefile change.
One thing the spec got wrong and the real recordings corrected: Rhubarb
doesn't always close a file with a rest cue, so the generator treats the WAV's
own duration as the end of the last speech span.

![The gate line's waveform, its mouth cues, and the estimated word timing.]({{ '/sdl-adventure-game/assets/speech-cue-timeline.png' | relative_url }})

That figure is real data: the waveform of "Il cancello è chiuso…", the cue
track Rhubarb heard in it, and a third row I'll get to at the end.

## Map seven phoneme shapes to three drawn mouth sprites

Rhubarb outputs six basic shapes — A through F, closed lips to puckered —
plus X for rest. So the talking animation stops being "three frames at 12
FPS" and becomes a *character set*: one frame per shape, in a canonical order,
with rest at index zero so a stopped animation naturally shows a closed
mouth.

That sounds like it needs new art. It doesn't, yet — and this was my favorite
part of the plan. An `.anim` file is just a list of source rectangles into
the sprite sheet, so nothing stops two frames from pointing at the *same*
rectangle. The fox has three drawn mouths: closed, open, and a small round
one. The new `talking.anim` is seven lines mapping the seven shapes onto
those three drawings:

![The three drawn mouths and which canonical shapes reuse each one.]({{ '/sdl-adventure-game/assets/speech-three-mouths.png' | relative_url }})

It's crude — E and F deserve their own pucker eventually — but the effect is
immediate: the mouth shuts during pauses and between sentences, opens on the
vowels, and moves in step with the audio content, not on a fixed timer. Real
per-shape art is now a redrawn sprite sheet with no code change attached.

## Playing cues instead of time

At runtime the talking animation is never "played" at all. `actor_talk`
checks whether the line has cues and the actor has a canonical seven-frame
sheet; if so, each update stamps the animation's `current_frame` with
whatever shape is active at `now - started_talking_at`. The lookup keeps a
cursor into the cue list, so it's one array step per frame, and it rewinds
itself when a new line starts.

Not calling `play_animation`/`stop_animation` in this mode had a pleasant
side effect. Those functions share a single global end-callback slot — a
[known footgun](https://github.com/potomak/VaniaVolpe/issues/35) where
stopping one animation can fire a callback that belongs to another. The
cue-driven path never touches it: no playback state, no callback, just a
frame index. Lines without cues, and actors without a canonical sheet (Gina,
for now), fall back to the exact looping behaviour the game has had since
January.

The parsers are deliberately strict, a lesson learned from the
[`.anim` parser]({% post_url /sdl-adventure-game/2025-01-17-parsing-animation-metadata %})
that accepted its input without validation: out-of-order timestamps, unknown
letters, oversized files, truncated lines — any of it rejects the whole sidecar
loudly, and the line degrades to the legacy loop instead of half-working.

## No visible animation with silent placeholder audio (locale mismatch)

Verification produced one good scare. The native test was green — a headless
probe showed the frame index tracking the cue list through the whole gate
line, twenty-two shape changes in four and a half seconds. Then I drove the
web build in a browser, took screenshots every 400 ms during the same line,
and diffed them: **nothing**. Ten identical frames. No log line either.

I stared at the pipeline for a while before looking at the obvious: the
browser's language is `en-US`, so the game had loaded the **English locale —
whose voice lines are silent placeholder WAVs**. Run over silent audio, Rhubarb
had output "closed, the whole time", and the engine was faithfully lip-syncing
that. The system wasn't broken; it was working with unreasonable precision. With
`?lang=it_IT` the Italian voice line played, the console logged it, and the
screenshot diffs lit up exactly over her sprite.

## Per-word timing, generated for later on-screen text

The third row in the figure above is the part that isn't wired up yet. Each
transcript now lives in a `.txt` sidecar next to its WAV (extracted from the
`DIALOGS.md` script), and the generator emits a `.words` file — per-word
start and end times, estimated by distributing the words across the speech
spans the cues already describe, proportionally to their length. No forced
aligner, no new tools; and if a locale ever wants studio-grade timing, an
aligner can emit the same file format and the engine won't know the
difference.

Those word timings exist for the next phase: on-screen dialogue text with the
currently spoken word highlighted, karaoke-style — partly accessibility,
mostly because this game's audience is learning to read, and a highlight that
moves with the voice helps a child connect the spoken sounds to the written
words. That one needs a font and a text renderer, so it gets its own post.
