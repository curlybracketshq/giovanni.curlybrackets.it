---
layout: post
title: "On-Screen Dialogue Text with Karaoke-Style Word Highlighting"
---

When the talking animation started [following mouth-shape
cues]({% post_url /sdl-adventure-game/2026-07-05-the-fox-learns-to-talk %}), the same
spec called for a second half: the words themselves, on screen, with the one
being spoken highlighted karaoke-style. Not as a debugging aid and not only as
subtitles — as a **learn-to-read feature**. The game's audience is a child who
can't read yet; a line of text where a bright box hops from word to word in
time with the voice is how she starts connecting the sounds she knows to the
shapes she doesn't. This post ships that half.

![The same dialogue line photographed a second apart: the yellow highlight has moved from "Mi" to "chiave", following the voice.]({{ '/sdl-adventure-game/assets/speech-read-along.png' | relative_url }})

## The timing was already there

The hard part of a karaoke highlight is knowing *when each word is spoken* —
and that problem was already solved offline, in the
[first speech post]({% post_url /sdl-adventure-game/2026-07-05-the-fox-learns-to-talk %}).
Every dialogue WAV has a committed `.words` sidecar estimating each word's
start and end from the mouth cues (when speech happens) and the transcript
(what is said). The estimate distributes words over the speech spans, so the
highlight starts with the voice, pauses when the voice pauses, and lands
within a word of the truth — plenty for follow-along reading. The engine looks
up, every frame, which word is active at the current millisecond — a
cursor-cached lookup that was sitting in `lipsync.c` waiting for a caller.

## Rendering text with SDL2_ttf

This is the game's first on-screen text, which meant picking how to render
text at all. Pre-rendered PNGs per line — the pattern the localized buttons
use — would mean ~40 images per locale, regenerated on every script edit.
A bitmap-font blitter means owning glyph coverage forever. So the engine
gained its third SDL satellite library: **SDL2_ttf**, integrated exactly like
SDL2_image and SDL2_mixer before it (pkg-config natively, an Emscripten port
flag for the web, a forwarding header for the include style). The bundled
face is *Atkinson Hyperlegible* — designed for maximum legibility, covers
Italian diacritics, weighs 56 KB, and is OFL-licensed so it lives in the
repo next to its license file.

The overlay itself does its work once per line, not per frame. When a line
starts, `subtitle_show` splits it on spaces and renders every word **twice**
into tiny cached textures — white for normal, near-black for when it sits on
the yellow highlight — then wraps greedily at 700 px and centres the lines,
bottom-anchored. Per frame, rendering is just: black backing box, yellow box
under the active word, blit the words (the active one in its dark version).
The highlight pauses in the voice's pauses for free, because word windows
only ever cover speech.

One robustness rule earned its keep immediately in testing: the timing file
pairs with the displayed words *by index*, so if a transcript is edited and
its `.words` sidecar goes stale, the counts disagree — and the overlay
disables **just the highlight** for that line, logs once, and shows the text
anyway. Degrade the highlight, keep the text.

## Showing Gina's audio-less placeholder lines

My favourite consequence is the fallback. Gina's dialogue has always been a
placeholder — her Italian lines live in the code and play as a shared silent
WAV, so in the game she just… stands there, beak moving. The overlay rule is:
subtitles show per the setting, but a line with **no audio always shows**.
Combined with subtitles being on by default, every one of Gina's lines is now
readable in the game itself, wrapped and centred like any other — just
without a highlight until her real recordings land and bring timing data
with them.

![Gina's placeholder line, visible in the game at last, wrapped over two centred rows.]({{ '/sdl-adventure-game/assets/speech-gina-fallback.png' | relative_url }})

On by default is a deliberate stance: this is an accessibility and
learn-to-read feature, not a debugging overlay, so it ships enabled and the
*opt-out* is the setting — `--subtitles=0` on desktop, `?subtitles=0` on the
web, plumbed exactly like the language selection. And since the overlay is
screen-space UI, it draws after the
[camera]({% post_url /sdl-adventure-game/2026-07-08-wider-than-the-window %}) offset is
reset — a line reads the same whether the fox speaks it in a static room or
at the far end of a scrolling field.

What remains of the speech plan is art and audio, not code: real seven-frame
mouth sheets to replace the remapped three, and Gina's actual voice. When
those recordings arrive, the pipeline from the first post turns them into
cues and word timings, and everything in this post — the mouth, the text, the
bouncing highlight — simply starts being true for her too. For now, the
read-along text is driven entirely by the offline-generated timing.
