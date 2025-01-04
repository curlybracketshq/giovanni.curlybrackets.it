---
title: Getting Started with SpriteKit
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/eqnmjj/adventure_game_development_using_spritekit_intro/
  name: r/iOSProgramming
---

## SpriteKit

SpriteKit is

> a general-purpose framework for drawing shapes, particles, text, images, and video in two dimensions.

Developed by Apple, SpriteKit is supported on iOS, macOS, tvOS, and watchOS, and it integrates well with frameworks like GameplayKit and SceneKit.

I've chosen it to create a prototype adventure game reminiscent of those from the late '80s and early '90s.

Typically, people choose SpriteKit for adding custom 2D content and animations to their app. However, for developing 2D games, it might make more sense to use a framework that supports platforms outside the Apple ecosystem.

Here are the reasons why I've chosen SpriteKit:

* I like the idea of learning and using Swift. It's a modern language, strongly typed, and packed with cool features.
* Supporting multiple platforms is not a priority for me.
* I hope development will be easier by eliminating the complexities brought by supporting multiple platforms.
* I'd like to keep it simple.

## Getting Started

I've never created a SpriteKit app before and have barely developed any iOS apps.

Thankfully, Xcode offers a range of templates to get started. In my case, I chose the "Cross-platform Game" template.

The resulting project has three targets, one for each platform:

* iOS
* tvOS
* macOS

Note: I've excluded watchOS. Who will ever [be able to play](https://twitter.com/grumpygamer/status/880182522528710662) an adventure game on watchOS?

Each target includes code containing a storyboard with a single controller that renders an `SKView`. `SKView` is a `UIView` subclass capable of rendering a SpriteKit scene.

The rest of the code is in a shared folder and includes the main game scene, which is a subclass of `SKScene`.

`GameScene` displays content from a scene file, with an `.sks` extension, which can be configured in Xcode's scene editor. It also handles touch events to display an animated shape when the player touches the screen.

## Running the App on Apple TV

Step 0: Log in with my ([Giorgia](http://giorgia.curlybrackets.it)'s 🙂) Apple Developer credentials to sign the app.

Apple TV is my primary development device. To select it from the list of target devices, I need to pair it first.

The pairing process is straightforward. The Apple TV and the laptop need to be connected to the same Wi-Fi network. From the Apple TV settings, start the pairing process. After verifying the device, you can build and run the app.

## Clean Slate

I don't think the scene editor will be very useful, at least initially, so the first thing I did was delete the template scene and start from scratch.

I might regret this decision later, but I want to be able to write code without managing external resources such as scene files. If and when the game scales, I may reconsider this choice.

## Conclusion

In the next post, I will introduce shape nodes and draw a simple cursor.
