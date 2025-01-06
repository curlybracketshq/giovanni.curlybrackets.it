---
title: Live Coding with ChucK on Ubuntu
layout: post
---

[live_coding]: http://en.wikipedia.org/wiki/Live_coding
[chuck]: http://chuck.cs.princeton.edu
[jack]: http://jackaudio.org

[**Live coding**][live_coding] is a programming practice focused on improvisational, interactive programming. It is often used for creating sound and image-based digital media and is particularly popular in computer music, combining algorithmic composition with improvisation.

To start live coding, I chose [**ChucK**][chuck].

ChucK is a concurrent, strongly timed audio programming language for real-time synthesis, composition, and performance. It emphasizes readability and flexibility for the programmer over other considerations, such as raw performance. It natively supports deterministic concurrency and multiple, simultaneous, dynamic control rates. Another key feature is the ability to *live code*: modifying code on the fly, while the program is running, without stopping or restarting.

## Getting Started with ChucK

If you don't need the latest version of ChucK, you can choose to download and install the user-friendly `apt` package.

Run:

```bash
$ sudo apt-get install chuck
```

After installation, you can start ChucK:

```bash
$ chuck
[chuck]: no input files... (try --help)
```

As a starting point, try running the examples:

```bash
$ cd /usr/share/doc/chuck/examples
$ chuck otf_01.ck
[chuck]: (via rtaudio): no devices found for compiled audio APIs!
[chuck]: cannot initialize audio device (try using --silent/-s)
```

You are getting this error because ChucK is running without a running `jackd`.

[**JACK Audio Connection Kit**][jack] (or JACK) is a professional sound server daemon that provides real-time, low-latency connections for both audio and MIDI data between applications that implement its API.

As `apt` suggested, you'll need the `jackd` package:

```bash
$ sudo apt-get install jackd
```

Next, start the `jackd` daemon in another shell:

```bash
$ jackd -d alsa
```

Now, try running the examples; you should start hearing some beats:

```bash
$ chuck otf_01.ck &
[chuck --add otf_02.ck
[chuck](VM): sporking incoming shred: 2 (otf_02.ck)...
$ chuck + otf_0[4567].ck
[chuck](VM): sporking incoming shred: 3 (otf_04.ck)...
[chuck](VM): sporking incoming shred: 4 (otf_05.ck)...
[chuck](VM): sporking incoming shred: 5 (otf_06.ck)...
[chuck](VM): sporking incoming shred: 6 (otf_07.ck)...
$ chuck --kill
[chuck](VM): removing all (6) shreds...
[chuck](VM): KILL received....
```

You can find more resources about ChucK at [http://chuck.cs.princeton.edu/doc/](http://chuck.cs.princeton.edu/doc/).
