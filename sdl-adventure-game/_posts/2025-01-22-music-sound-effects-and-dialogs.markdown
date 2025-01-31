---
title: Music, sound effects, and dialogs
layout: post
---

Today I recorded music, sound effects, and dialogs for the game.

## Music between scenes

I used the same music for the playground entrance and playground scenes, but the audio recording stops and restarts during the transition between the two scenes.

Ideally the music should continue to play in a loop, so I should hoist the code to play music from the scene level to the game level.

The issue doesn't exist between intro and playground entrance scene because I'm using two different music tracks.

It might make sense to override a global game music track setting with a local scene music track setting.

## Chunk length

I'm playing a "talking" fox animation while playing chunks of dialog. In order to correctly determine when to stop the animation I decided to measure the length of audio chunks. I used the implementation of a function which computes the length of a chunk in milliseconds that I found in the SDL forum: [discourse.libsdl.org/t/time-length-of-sdl-mixer-chunks/12852/2](https://discourse.libsdl.org/t/time-length-of-sdl-mixer-chunks/12852/2).

```c
Uint32 get_chunk_time_ms(Mix_Chunk *chunk) {
  Uint32 points = 0;
  Uint32 frames = 0;
  int freq = 0;
  Uint16 fmt = 0;
  int chans = 0;
  // Chunks are converted to audio device format...
  if (!Mix_QuerySpec(&freq, &fmt, &chans)) {
    // never called Mix_OpenAudio()?!
    return 0;
  }

  /* bytes / samplesize == sample points */
  points = (chunk->alen / ((fmt & 0xFF) / 8));

  /* sample points / channels == sample frames */
  frames = (points / chans);

  /* (sample frames * 1000) / frequency == play length in ms */
  return (frames * 1000) / freq;
}
```

This approach works fine, but there are some times, when there is silence and the talking animation continues to play, that look a bit unnatural.

The easiest approach to fix this issue I can think of is to split the dialog audio files into smaller chunks that don't contain silence, but then I would need code the correct timing to play all the different chunks.

Alternatively I could measure the amplitude of the wave and play the animation only when the value is above a certain threshold.

Both these approaces are too complex to be implemented as part of the prototype and I will keep them as to-do tasks.

## Recorder and Audio format

I'm using the default iPhone "Voice Memos" to record all audio.

I'm converting the output m4a audio files to wav using [cloudconvert.com/m4a-to-wav](https://cloudconvert.com/m4a-to-wav).

I could use mp3 for the music, but I didn't because I was afraid I would need to add a new library to the project to decode mp3 audio files.

The main difference between music and chunks is that chunks are decoded on loading, compared to music which is decoded while playing.
