---
title: PO-33 K.O.! Cheat sheet, Notes and Practical Guide
description: Personal notes and a practical reference for the Teenage Engineering PO-33 K.O.! sampler and sequencer, covering interface basics, core operations, specs, advanced techniques, gotchas, and useful resources.
layout: post
---

I recently started using the **PO-33 K.O.!** by Teenage Engineering and decided to collect my notes in one place.

This post is a **personal reference and cheat sheet** rather than a full tutorial.

## Interface overview

### Buttons

* `Sound` - Select and edit sounds
* `Pattern` - Select patterns and chain them
* `BPM` - Tempo control
* `1-16` - Sound/pattern slots and effects
* `Record` - Sample audio, clear sounds or patterns
* `FX` - Apply performance effects
* `Play` - Start/stop playback
* `Write` - Write steps, copy data, set parameter locks

### Knobs

* `Knob A` - Volume, pitch, trim start, BPM (context-dependent)
* `Knob B` - Filter, slice count, trim end (context-dependent)

## Sound slots: melodic vs drum

The PO-33 has 16 sound slots divided into two sections.

### Melodic sounds (slots 1-8)

* Keys `1-16` represent pitches in a scale
* Each key plays the entire sound
* Suitable for bass lines, leads, chords, long samples

### Drum sounds (slots 9-16)

* Keys `1-16` represent slices of the sound
* Samples are automatically sliced on recording
* Suitable for drums and rhythmic material

## Interaction patterns

Most operations follow a consistent pattern.

* **Select** - `Sound`/`Pattern` + `1-16`
* **Copy selected** - `Write` + `Sound`/`Pattern` + `1-16` (destination)
  * `cpy` on the top right corner of the screen
* **Clear selected** - `Record` + `Sound`/`Pattern`
  * `clr` on the top right corner of the screen

## Basics

* **Record sound** - `Record` + `1-16`
* **Select sound** - `Sound` + `1-16`
* **Copy selected sound** - `Write` + `Sound` + `1–16` (destination)
* **Clear selected sound** - `Record` + `Sound`
* **Select pattern** - `Pattern` + `1-16`
* **Copy selected pattern** - `Write` + `Pattern` + `1–16` (destination)
* **Clear selected pattern** - `Record` + `Pattern`

### Chain patterns

* Hold `Pattern`
* Press patterns (`1-16`) in sequence (up to 128)

### Live recording (writing steps)

* `Play`
* Hold `Write`
* Trigger sounds (`1-16`)

Writes sound triggers into the active pattern.

### Change master volume

* Hold `BPM` + `1-16`

### BPM

* Press `BPM` to loop presets: HIP HOP (80 bpm), DISCO (120 bpm), TENCHO (140 bpm)
* To fine tune BPM hold `BPM` + turn `Knob B`

### Swing

* Hold `BPM` + turn `Knob A`

## Specs

* Connectors: 1 x 1/8" (3.5 mm) TRS Input, 1 x 1/8" (3.5 mm) TRS Output
* Power Source: 2 x AAA Batteries
* Sampling rate: ~23.5 kHz, 8-bit

### Storage

* ~40 seconds total sample memory
* Shared across all sounds

### Pattern chaining

* Up to 128 patterns per chain

## Backup and restore

### Backup

* Connect output to recorder
* `Write` + `Sound` + `Play`

Note: backup output is stereo.

### Restore

* `Write` + `Sound` + `Record`
* Play backup audio into input

Note: if the restore process fails, try at a higher volume. If it still fails restart your PC and retry.

## Resources

* [PO-33 Official Guide](https://teenage.engineering/guides/po-33/en)
* [Sound packs](https://teenage.engineering/downloads/po-33)
* [Useful PO-33 tips](https://www.youtube.com/watch?v=DnusVDcoyeQ)
