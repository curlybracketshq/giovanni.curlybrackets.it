---
title: Getting started with SpriteKit
layout: post
---

## SpriteKit

SpriteKit is

> a general-purpose framework for drawing shapes, particles, text, images, and
> video in two dimensions.

It's developed by Apple and it is supported on iOS, macOS, tvOS, and watchOS,
and it integrates well with frameworks such as GameplayKit and SceneKit.

I've chosen it to create a prototype adventure game that resembles those from
the late 80's, early 90's.

I guess that usually people choose SpriteKit for adding custom 2D content and
animations to their app, but for creating 2D games maybe it would make more
sense to use a framework that supports platforms outside the Apple ecosystem.

In my case these are the reasons why I've chosen SpriteKit:

* I like the idea of writing/learning Swift. It's a modern language, strongly
  typed, and with a lot of cool features
* I don't care much about supporting a lot of platforms
* I hope the development is going to be easier by eliminating the class of
  problems brought by supporting multiple platforms
* I'd like to keep it simple

## Getting started

I've never created any SpriteKit app. I've barely created any iOS app.

Lucky me that XCode offers a bunch of templates to start from. In my case I've
chosen the "Cross-platform Game" template.

The resulting project has three targets, one for each platform:

* iOS
* tvOS
* macOS

Note: I've excluded watchOS. Who will ever [be able to
play](https://twitter.com/grumpygamer/status/880182522528710662) an adventure
game on watchOS?

For each target there's some code that includes a storyboard with a single
controller that renders an `SKView`. `SKView` is a `UIView` subclass, that can
render a SpriteKit scene.

The rest of the code is in a shared folder and it includes the main game scene,
that is a subclass of `SKScene`.

`GameScene` displays the content from a scene file, that's a file with extension
`.sks` that can be configured in Xcode's scene editor. It also handles touch
events, to display an animated shape when the player touches the screen.

## Running the app on Apple TV

Step 0: login with my ([Giorgia](http://giorgia.curlybrackets.it)'s 🙂) Apple
Developer credentials to be able to sign the app.

Apple TV is my main development device. In order to be able to select it from
the list of target devices, I need to pair it first.

The pairing process is easy. The device and the laptop just have to be connected
to the same WiFi network, and then from the Apple TV settings start the pairing
process. After you've verified the device you can build and run the app.

## Clean slate

I don't think the scene editor will be very useful, at least at the beginning,
so the first thing I did was to delete the template scene and to start from
scratch.

I guess at some point I will regret this decision, but first I want to be able
to write code without having to keep track of external resources such as scene
files. When, and if, the game scales, I may reconsider this choice.

## Conclusion

In the next post I will introduce shape nodes and draw a simple cursor.
