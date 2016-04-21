---
title: "Android Experiments: Hashire Hamusuta post mortem"
layout: post
---

It all started about 10 days ago, when I first knew about the [Android
Experiments I/O challenge](https://www.androidexperiments.com/challenge).

### What is Hashire Hamusuta?

[*Hashire
Hamusuta*](https://play.google.com/store/apps/details?id=com.yeahright.hashirehamusutaa),
Japanese for "Run Hamster", is a game to help people to stay active and my
entry for the challenge.

You're a *hamster*, it runs when you're active and it sleeps otherwise. If you
walk, run, ride, the app will count your *steps* that will make you earn ⚡.

You can spend ⚡ at *the store* to buy hamsters to produce more ⚡ in your *power
plant*.

In your power plant you can *ping* lazy hamsters, those who are not active, to
receive a 100 ⚡ *bonus*, if the become active in less than 10 minutes.

You also have a *10,000 daily steps goal* that if you can achieve will make earn
a 100 ⚡ bonus those players who have you in their power plants.

### Interface design and illustrations

I wanted for the app to have a playful look and feel, the inspiration was [Neko
Atsume](https://play.google.com/store/apps/details?id=jp.co.hit_point.nekoatsume).

So I asked [Giorgia](http://twitter.com/sono_la_gii) to work on the
illustrations and I must say I love them! She perfectly interpreted my idea and
after some sketches she was already drawing the hamster animations and all the
other parts of the app's UI.

The first version of the app:

![Hashire Hamusuta 1.0](/assets/posts/hashire-hamusuta-1.0.png)

The latest version of the app:

![Hashire Hamusuta 2.2](/assets/posts/hashire-hamusuta-2.2.png)

### Go and Google App Engine

I wanted to try Google App Engine (again) to host the server app to collect
players info, steps measurements, etc.

The platform supports Java, Go, and Python by default, but I saw that they also
supported [custom
runtimes](https://cloud.google.com/appengine/docs/flexible/custom-runtimes/build),
so I first tried to use Haskell to build a simple Scotty HTTP API.

Unfortunately this has revealed to be a bad choice from the beginning when I
spent almost 4 hours trying to build and run the container that would have
hosted the app.

It should have been as easy as creating [a custom
`Dockerfile`](http://andywhardy.blogspot.com/2016/01/haskell-rest-api-on-google-app-engine.html),
but I got all sort of errors. At the beginning the container was too slow to
build using the Cloud Container Builder. I was getting a
[`DEADLINE_EXCEEDED`](https://groups.google.com/d/msg/google-cloud-sdk/DuOdQPy9PoQ/Y9PfXSiXKQAJ)
error that I *resolved* by avoid using Cloud Container Builder by setting the
`use_cloud_build` option to false. Then I started getting docker errors that now
I don't even remember. This very bad start, in conjunction with the idea of
working on this project in a *hackathon mode* (more about it later), made me
lean towards Go.

Apart from an issue with `GOPATH` and a problematic interaction between the
official Go tools and App Engine SDK's tools, everything worked like a charm.
Deployment of the app is fast and reliable, managing versions is easy, and
working with Go is relaxing.

### Messages with Google Cloud Messaging

Pinging a friend means sending an app notification to his/her device and I
wanted to show the live status of hamsters (running or sleeping) in the power
plant activity. To deliver and receive notifications I used Google Cloud
Messaging.

To deliver messages from the server I used a patched version of
[github.com/alexjlockwood/gcm](https://github.com/alexjlockwood/gcm). It was too
late when I finally found
[github.com/google/go-gcm](https://github.com/google/go-gcm) that I think is a
more official and up to date library to interact with GCM.

The server send updates to client using a topic for each player. Clients that
are interested about updates from one player, for instance when you buy a
hamster, subscribe to his/her channel to get notified when an event occurs.

To handle notifications client side I followed the example at
[github.com/googlesamples/google-services](https://github.com/googlesamples/google-services/tree/master/android/gcm)
and everything went fine. Well done Google.

### Getting data from the step sensor

To get user's activity and the number of steps I started by using the Fit API,
but I also wanted to get know when the user's status changes in background that
seems to be impossible with Fit API.

I fall back to getting raw events from the step counter sensor. I built a
background service inspired by
[github.com/googlesamples/android-BatchStepSensor](https://github.com/googlesamples/android-BatchStepSensor)
and the result is quite reliable on many devices where I tested the app with a
couple of exceptions.

### Drawable resources for different resolutions

I'm lazy so I was putting every drawable resource in the `res/drawable`
directory. Also because I'm lazy one day I didn't want to get up to get the USB
cable to test the app on my phone so I started using the emulator and I was
getting an OOM error right after app startup.

What was leaking memory?

Well, it turns out that drawable resources are stored as bitmaps in memory, so
a 100 Kb png image was occupying megabytes of memory to be drawn on the screen.

It also turns out that all the drawable resources that you put in the generic
`res/drawable` directory are handled as mdpi resources, and the system scales
the low density version to the target device density.

This meant that the 100 Kb 500x500 png image was getting scaled to a 9 Mb
1500x1500 image on a xx-hdpi device (Nexus 5) and the emulator was reserving
only 64 Mb of RAM for the app so I was hitting the limit only after a couple of
images.

The
[solution](https://bitbucket.org/potomak/hamusutaa-android/commits/1cd928761e17e330e052dea1d70b11ada8fb82db)
was to create a new `res/drawable-xxhdpi` directory and copy all the images
there. The size was fine because I always tested the app on xx-hdpi devices.
Note: I should have done this for all the resolutions, but let's wait for actual
crashes to do it, this way is more fun.

### What went right

* Go on Google App Engine
* Google Cloud Messaging
* Step counter background service
* Giorgia's illustrations

### What went wrong

* Haskell on Google App Engine
* Fit API
* Drawable resources resolutions

### Hackathon mode

What does *Hackathon mode* mean? Well, I don't know exactly. It's an excuse to
try new technologies on small/finite projects with a time constraint.

The *time constraint* part is interesting because it forces you to focus on
functional parts of the app to have "something" to test as soon as possible.

An approach that I found useful: start working on the riskiest parts of the
*hack*. In this project for example I started by building a couple of Android
prototypes to test GCM (👍), Fit API (👎), and Haskell on GAE (👎).
