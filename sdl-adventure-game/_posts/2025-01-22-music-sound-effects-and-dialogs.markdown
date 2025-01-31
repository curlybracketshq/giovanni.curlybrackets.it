---
title: Music, Sound Effects, and Dialogs
layout: post
---

Today, I recorded music, sound effects, and dialogs for the game.

## Music Between Scenes

I used the same music for both the playground entrance and playground scenes. However, the audio recording stops and restarts during the transition between the two scenes. Ideally, the music should continue to play in a loop, so I should hoist the code that plays music from the scene level to the game level.

This issue doesn’t occur between the intro and the playground entrance scene because I use two different music tracks. It might be useful to be able to override a global game music track setting with a local scene music track setting.

## Chunk Length

When the fox actor talks, the "talking" animation plays. To accurately determine when to stop the animation, I decided to measure the length of audio chunks. I implemented a function, which calculates the length of a chunk in milliseconds, from the SDL forum: [discourse.libsdl.org/t/time-length-of-sdl-mixer-chunks/12852/2](https://discourse.libsdl.org/t/time-length-of-sdl-mixer-chunks/12852/2).

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

This approach works well, but at times when there is silence, the talking animation continues to play, which looks unnatural. The simplest solution I can think of is to split the dialog audio files into smaller, non-silent chunks, but this would require correctly timing the playback of all different chunks.

Alternatively, I could measure the amplitude of the wave and play the animation only when the value rises above a certain threshold. Both of these approaches are too complex to be implemented as part of the prototype, and I will keep them as to-do tasks.

## Recording and Audio Format

I'm using the default iPhone "Voice Memos" app to record all audio. I convert the output m4a audio files to wav using [cloudconvert.com/m4a-to-wav](https://cloudconvert.com/m4a-to-wav).

I considered using mp3 for the music, but I hesitated because I feared I might need to add a new library to the project to decode mp3 audio files.

The main difference between music and chunks is that chunks are decoded upon loading, while music is decoded as it plays.
