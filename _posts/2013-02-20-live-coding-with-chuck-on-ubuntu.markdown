---
title: Live coding with ChucK on Ubuntu
layout: post
---

[live_coding]: http://en.wikipedia.org/wiki/Live_coding
[chuck]: http://chuck.cs.princeton.edu
[jack]: http://jackaudio.org


[**Live coding**][live_coding] is a programming practice centered upon the use
of improvised interactive programming. Live coding is often used to create sound
and image based digital media, and is particularly prevalent in computer music,
combining algorithmic composition with improvisation.

To start live coding I chose [**ChucK**][chuck].

ChucK is a concurrent, strongly timed audio programming language for real-time
synthesis, composition, and performance. It is designed to favor readability and
flexibility for the programmer over other considerations such as raw
performance. It natively supports deterministic concurrency and multiple,
simultaneous, dynamic control rates. Another key feature is the ability to live
code; adding, removing, and modifying code on the fly, while the program is
running, without stopping or restarting.

## Getting started with ChucK

If you don't need the latest version of ChucK you can choose to download and
install the apt package.

Run

    $ sudo apt-get install chuck
    Reading package lists... Done
    Building dependency tree       
    Reading state information... Done
    Suggested packages:
      jackd
    The following NEW packages will be installed:
      chuck
    0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
    Need to get 2,100 kB of archives.
    After this operation, 6,025 kB of additional disk space will be used.
    Get:1 http://it.archive.ubuntu.com/ubuntu/ precise/universe chuck i386 1.2.0.8.dfsg-1.4 [2,100 kB]
    Fetched 2,100 kB in 3s (613 kB/s)  
    Selecting previously unselected package chuck.
    (Reading database ... 763832 files and directories currently installed.)
    Unpacking chuck (from .../chuck_1.2.0.8.dfsg-1.4_i386.deb) ...
    Processing triggers for man-db ...
    Setting up chuck (1.2.0.8.dfsg-1.4) ...

    $ chuck
    [chuck]: no input files... (try --help)

As a starting point you can try running the examples

    $ cd /usr/share/doc/chuck/examples
    $ chuck otf_01.ck
    [chuck]: (via rtaudio): no devices found for compiled audio APIs!
    [chuck]: cannot initialize audio device (try using --silent/-s)

You're getting this error message because you're running ChucK without a running
`jackd`.

[**JACK Audio Connection Kit**][jack] (or JACK) is a professional sound server
daemon that provides real-time, low latency connections for both audio and MIDI
data between applications that implement its API.

As apt suggested you'll need the `jackd` package:

    $ sudo apt-get install jackd
    Reading package lists... Done
    Building dependency tree       
    Reading state information... Done
    The following extra packages will be installed:
      jackd2 jackd2-firewire libconfig++8 libffado2 libxml++2.6-2 qjackctl
    Suggested packages:
      jack-tools meterbridge
    The following NEW packages will be installed:
      jackd jackd2 jackd2-firewire libconfig++8 libffado2 libxml++2.6-2 qjackctl
    0 upgraded, 7 newly installed, 0 to remove and 0 not upgraded.
    Need to get 2,641 kB of archives.
    After this operation, 7,950 kB of additional disk space will be used.
    Do you want to continue [Y/n]?
    Get:1 http://it.archive.ubuntu.com/ubuntu/ precise/universe jackd2 i386 1.9.8~dfsg.1-1ubuntu1 [531 kB]
    Get:2 http://it.archive.ubuntu.com/ubuntu/ precise/universe jackd all 5 [2,072 B]
    Get:3 http://it.archive.ubuntu.com/ubuntu/ precise/main libconfig++8 i386 1.3.2-2ubuntu2 [36.0 kB]
    Get:4 http://it.archive.ubuntu.com/ubuntu/ precise/main libxml++2.6-2 i386 2.34.1-1build1 [58.3 kB]
    Get:5 http://it.archive.ubuntu.com/ubuntu/ precise/main libffado2 i386 2.0.99+svn2019-1ubuntu1 [1,425 kB]
    Get:6 http://it.archive.ubuntu.com/ubuntu/ precise/universe jackd2-firewire i386 1.9.8~dfsg.1-1ubuntu1 [20.1 kB]                                                        
    Get:7 http://it.archive.ubuntu.com/ubuntu/ precise/universe qjackctl i386 0.3.8-1 [567 kB]                                                                              
    Fetched 2,641 kB in 13s (202 kB/s)                                                                                                                                      
    Preconfiguring packages ...
    Selecting previously unselected package jackd2.
    (Reading database ... 764076 files and directories currently installed.)
    Unpacking jackd2 (from .../jackd2_1.9.8~dfsg.1-1ubuntu1_i386.deb) ...
    Selecting previously unselected package jackd.
    Unpacking jackd (from .../apt/archives/jackd_5_all.deb) ...
    Selecting previously unselected package libconfig++8.
    Unpacking libconfig++8 (from .../libconfig++8_1.3.2-2ubuntu2_i386.deb) ...
    Selecting previously unselected package libxml++2.6-2.
    Unpacking libxml++2.6-2 (from .../libxml++2.6-2_2.34.1-1build1_i386.deb) ...
    Selecting previously unselected package libffado2.
    Unpacking libffado2 (from .../libffado2_2.0.99+svn2019-1ubuntu1_i386.deb) ...
    Selecting previously unselected package jackd2-firewire.
    Unpacking jackd2-firewire (from .../jackd2-firewire_1.9.8~dfsg.1-1ubuntu1_i386.deb) ...
    Selecting previously unselected package qjackctl.
    Unpacking qjackctl (from .../qjackctl_0.3.8-1_i386.deb) ...
    Processing triggers for man-db ...
    Processing triggers for bamfdaemon ...
    Rebuilding /usr/share/applications/bamf.index...
    Processing triggers for desktop-file-utils ...
    Processing triggers for gnome-menus ...
    Processing triggers for hicolor-icon-theme ...
    Setting up jackd2 (1.9.8~dfsg.1-1ubuntu1) ...
    Setting up jackd (5) ...
    Setting up libconfig++8 (1.3.2-2ubuntu2) ...
    Setting up libxml++2.6-2 (2.34.1-1build1) ...
    Setting up libffado2 (2.0.99+svn2019-1ubuntu1) ...
    Setting up jackd2-firewire (1.9.8~dfsg.1-1ubuntu1) ...
    Setting up qjackctl (0.3.8-1) ...
    Processing triggers for libc-bin ...
    ldconfig deferred processing now taking place

Then you should start `jackd` daemon in another shell

    $ jackd -d alsa
    jackdmp 1.9.8
    Copyright 2001-2005 Paul Davis and others.
    Copyright 2004-2011 Grame.
    jackdmp comes with ABSOLUTELY NO WARRANTY
    This is free software, and you are welcome to redistribute it
    under certain conditions; see the file COPYING for details
    Cannot create thread 1 Operation not permitted
    Cannot create thread 1 Operation not permitted
    Cannot create thread 1 Operation not permitted
    JACK server starting in realtime mode with priority 10
    Cannot lock down 82241434 byte memory area (Cannot allocate memory)
    control device hw:0
    control device hw:0
    audio_reservation_init
    Acquire audio card Audio0
    creating alsa driver ... hw:0|hw:0|1024|2|48000|0|0|nomon|swmeter|-|32bit
    control device hw:0
    configuring for 48000Hz, period = 1024 frames (21.3 ms), buffer = 2 periods
    ALSA: final selected sample format for capture: 32bit integer little-endian
    ALSA: use 2 periods for capture
    ALSA: final selected sample format for playback: 32bit integer little-endian
    ALSA: use 2 periods for playback
    Cannot use real-time scheduling (RR/10)(1: Operation not permitted)

Now try running examples, you should start hearing some beats

    $ chuck otf_01.ck &
    [1] 7869
    $ chuck --add otf_02.ck
    [chuck](VM): sporking incoming shred: 2 (otf_02.ck)...
    $ chuck + otf_0[4567].ck
    [chuck](VM): sporking incoming shred: 3 (otf_04.ck)...
    [chuck](VM): sporking incoming shred: 4 (otf_05.ck)...
    [chuck](VM): sporking incoming shred: 5 (otf_06.ck)...
    [chuck](VM): sporking incoming shred: 6 (otf_07.ck)...
    $ chuck --kill
    [chuck](VM): removing all (6) shreds...
    [chuck](VM): KILL received....

    [1]+  Exit 1                  chuck otf_01.ck

You can find more resources about ChucK at
[http://chuck.cs.princeton.edu/doc/](http://chuck.cs.princeton.edu/doc/).
