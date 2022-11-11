---
title: "Android Experiments: Hashire Hamusuta post mortem"
layout: post
---

It all started about 10 days ago, when I first knew about the [Android
Experiments I/O challenge](https://www.androidexperiments.com/challenge).

## What is Hashire Hamusuta?

*Hashire Hamusuta*, Japanese for "Run Hamster", is a game to help people to stay
active and my entry for the challenge.

You're a *hamster*. It runs when you're active and it sleeps otherwise. If you
walk, run, ride, the app will count your *steps* and you will earn ⚡.

You can spend ⚡ at *the store* to buy hamsters to produce more ⚡ in your *power
plant*.

In your power plant you can *ping* lazy hamsters, those that are not active. You
receive a 100 ⚡ *bonus* if they become active in less than 10 minutes.

There's also a *10,000 daily steps goal* that if you achieve will earn 100 ⚡ for
those players who have you in their power plants.

## Interface design and illustrations

I wanted for the app to have a playful look and feel, the inspiration was [Neko
Atsume](https://play.google.com/store/apps/details?id=jp.co.hit_point.nekoatsume).

![Hamusuta]({{ '/assets/posts/hamusuta.png' | relative_url }})

[Giorgia](http://twitter.com/sono_la_gii) created all the illustrations that
perfectly interpret the style.

The first version of the app:

![Hashire Hamusuta 1.0]({{ '/assets/posts/hashire-hamusuta-1.0.png' | relative_url }})

The latest version of the app:

![Hashire Hamusuta 2.2]({{ '/assets/posts/hashire-hamusuta-2.2.png' | relative_url }})

## Go and Google App Engine

I wanted to try Google App Engine ([again]({% post_url
2016-04-25-the-daily-checklist %})) to host the app server that collects players
info, steps measurements, etc.

The platform supports Java, Go, and Python by default, but it also supports
[custom
runtimes](https://cloud.google.com/appengine/docs/flexible/custom-runtimes/build).

At first I tried to use Haskell to build a simple Scotty HTTP API, but after
spending almost half a day trying to build and run the container, I gave up.

It should have been as easy as creating [a custom
`Dockerfile`](http://andywhardy.blogspot.com/2016/01/haskell-rest-api-on-google-app-engine.html),
but I got all sort of errors. At the beginning the container was building too
slow using the Cloud Container Builder. I was getting a
[`DEADLINE_EXCEEDED`](https://groups.google.com/d/msg/google-cloud-sdk/DuOdQPy9PoQ/Y9PfXSiXKQAJ)
error that I *resolved* by setting the `use_cloud_build` option to false to
avoid using Cloud Container Builder. Then I started getting docker errors that
now I don't even remember. This very bad start, in conjunction with the idea of
working on this project in *hackathon mode* (more about it later), made me
lean toward Go.

Apart from an issue with `GOPATH`, and a problematic interaction between the
official Go tools and App Engine SDK's tools, everything else worked as expected
using Go. Deployment of the app is fast and reliable, and managing app versions
is easy.

## Google Cloud Messaging

Pinging a friend means sending an app notification to his/her device. I also
wanted to show the live status of hamsters (running or sleeping) in the power
plant activity. To deliver and receive notifications I used *Google Cloud
Messaging*.

To deliver messages from the server I used a patched version of
[github.com/alexjlockwood/gcm](https://github.com/alexjlockwood/gcm). It was too
late when I finally found
[github.com/google/go-gcm](https://github.com/google/go-gcm), that I think is a
more official and up to date version of the library to interact with GCM.

The server publishes updates on a topic for each player. Clients subscribe to
owned players' channels to get notified when a new event occurs.

To handle notifications on the client side I followed the example at
[github.com/googlesamples/google-services](https://github.com/googlesamples/google-services/tree/master/android/gcm).

## Getting data from the step sensor

To get user's activity and the number of steps I first tried using *Fit API*,
but I didn't find a way to handle background updates of user's activity. I need
to get those data in background in order to notify the system and other users of
current user's status changes.

I fell back to retrieve raw events from the step counter sensor with a
background service inspired by
[github.com/googlesamples/android-BatchStepSensor](https://github.com/googlesamples/android-BatchStepSensor).
The result is quite reliable on many devices where I tested the app with a
couple of exceptions.

## Drawable resources for different resolutions

I'm lazy so I was putting all drawable resource in the `res/drawable` directory.
Also because I'm lazy, one day I didn't want to get up to get the USB cable to
test the app on my phone so I tried using the emulator and that's when I started
noticing a lot of OOM errors.

What was leaking memory?

Well, it turns out that loaded drawable resources are stored as bitmaps in
memory, so a 100 Kb png image was filling megabytes of memory to be drawn on the
screen.

It also turns out that all the drawable resources that you put in the generic
`res/drawable` directory are handled as *mdpi* resources. Android by default
scales the low density drawable version to the target device's density.

This meant that a 100 Kb 500x500 png image was getting scaled to a 9 Mb
1500x1500 image on a *xx-hdpi* device (Nexus 5) and the emulator was reserving
only 64 Mb of RAM per app process so I was hitting the limit after loading just
a couple of images.

The [workaround
solution](https://bitbucket.org/potomak/hamusutaa-android/commits/1cd928761e17e330e052dea1d70b11ada8fb82db)
was to create a new `res/drawable-xxhdpi` directory and copy all the images
there. The size was fine because I always tested the app on xx-hdpi devices.

Note: In order to reduce memory usage of the app I could have done this for all
supported devices' resolutions, but I'll wait for actual crashes to do it.

## What went right

* Go on Google App Engine
* Google Cloud Messaging
* Step counter background service
* Giorgia's illustrations

## What went wrong

* Haskell on Google App Engine
* Fit API
* Drawable resources resolutions

## Hackathon mode

What does *Hackathon mode* mean? Well, I don't know exactly. It's an excuse to
try new technologies on small projects with a time constraint.

The *time constraint* part is interesting because it forces you to focus on
functional parts of the app to have "something" to test as soon as possible.

An approach that I found useful: start working on the riskiest parts of the
*hack* first. In this project for example I started by building a couple of
Android prototypes to test GCM (👍), Fit API (👎), and Haskell on GAE (👎).

## Sources

* [bitbucket.org/potomak/hamusutaa-api](https://bitbucket.org/potomak/hamusutaa-api)
* [bitbucket.org/potomak/hamusutaa-android](https://bitbucket.org/potomak/hamusutaa-android)
