---
title: Handling Touch Events
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/f1fyvq/adventure_game_development_using_spritekit/
  name: r/iOSProgramming
---

## Introduction

All games support some form of user interaction, right? In the case of classic point-and-click adventure games, the player should be able to move the cursor and click to interact with the game environment, talk to other characters, and select actions from the <acronym title="Head-up display">HUD</acronym>. In the next two posts, I'm going to add support for mouse and touch events, depending on the target device, for moving the cursor node. Let's start by handling touch events on iOS and tvOS.

## Controlling User Interaction on Nodes

`SKNode` subclasses `UIResponder` in iOS and tvOS, and `NSResponder` in macOS. This means that I can override the `touches*` or `mouse*` methods respectively for handling touch or mouse events. There are two main strategies for handling user interaction:

1. Centralize the handling in the scene node.
2. Delegate the handling to every node that needs to react to user interactions.

I've decided to adopt the first strategy because it seems simpler and more straightforward to implement.

## Moving the Cursor (on iOS and tvOS)

For touch devices, I'll change the position of the cursor node on `touchesBegan` and `touchesMoved`:

```swift
override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let location = touches.first?.location(in: self) else { return }
    cursor.position = location
}

override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let location = touches.first?.location(in: self) else { return }
    cursor.position = location
}
```

The implementation of both handlers is the same, so I could share their common implementation in a function. However, for simplicity, let's duplicate some code.

`touches` is a set of `UITouch` because iOS devices support multi-touch. For now, I only care about the first touch. The `guard` in the first line does exactly that. It assigns the position of the first touch in the set to `location` or returns if `touches` is empty.

`location(in: self)` is used to return a `CGPoint` for the position of the touch in the scene (`self`).

In the second line, I assign `location` to the cursor's `position` instance property, the easiest way to move the cursor node in the scene.

To reference `cursor` in these functions, I've updated the `setUpScene` implementation. I've replaced the assignment of a new `Cursor` instance to a local variable `cursor`:

```swift
let cursor = Cursor(120)
```

with a new private instance property `cursor` that's lazily initialized:

```swift
private lazy var cursor = Cursor(120)
```

This is the result on iPhone:

{% include video.html src='/adventure-game/assets/2020-02-09-iphone.mp4' %}

There's a small issue with cursor movements on tvOS. The cursor always starts moving from the center of the screen:

{% include video.html src='/adventure-game/assets/2020-02-09-tvos-broken.mp4' %}

This happens because, on tvOS, `touchesBegan` *resets* the position of touch events in the current touches series.

I couldn't find any official documentation for this behavior, so if you find something, let me know in the Reddit discussion.

An easy way to handle this issue is to make the touch position relative to the last cursor position. To do so, I add a `lastPosition` instance property in `Cursor`:

```swift
var lastPosition: CGPoint = .zero
```

This property keeps track of the last cursor position at the end of each touch events series. Its initial value is the cursor's position, assigned right after setting the initial cursor position in `setUpScene`:

```swift
cursor.position = CGPoint(x: frame.midX, y: frame.midY)
cursor.lastPosition = cursor.position
addChild(cursor)
```

`lastPosition` is updated in both `touchesEnded` and `touchesCancelled`, when a touch events series ends, with the current cursor position:

```swift
override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard touches.count == 1 else { return }
    cursor.lastPosition = cursor.position
}

override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard touches.count == 1 else { return }
    cursor.lastPosition = cursor.position
}
```

The new implementation of `touchesBegan` and `touchesMoved` calls `touchHandler`, a private instance method of `GameScene` (which I initially avoided creating), to update the cursor position relative to its last position if the device OS is `tvOS`:

```swift
override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let location = touches.first?.location(in: self) else { return }
    touchHandler(location)
}

override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let location = touches.first?.location(in: self) else { return }
    touchHandler(location)
}
```

```swift
private func touchHandler(_ location: CGPoint) {
    #if os(iOS)
    let nextPosition = location
    #elseif os(tvOS)
    let delta = CGPoint(
        x: location.x - frame.midX,
        y: location.y - frame.midY
    )
    let nextPosition = CGPoint(
        x: cursor.lastPosition.x + delta.x,
        y: cursor.lastPosition.y + delta.y
    )
    #endif

    cursor.position = nextPosition
}
```

If `os(iOS)` is true, nothing changes; the next cursor position is simply the touch event position. Alternatively, if `os(tvOS)` is true, the function computes the delta between the touch event position and the screen midpoint. This offsets the event position by `(frame.midX, frame.midY)` because `location` always starts at the screen midpoint. The function then computes the next cursor position by adding the delta to the cursor's last position.

This is the result on tvOS:

{% include video.html src='/adventure-game/assets/2020-02-09-tvos-fixed.mp4' %}

## Conclusion

Now the app can react to touch events by moving the cursor on the screen.

In the next post, I'll handle mouse events for moving the cursor on macOS.

## Resources

* [Controlling User Interaction on Nodes](https://developer.apple.com/documentation/spritekit/sknode/controlling_user_interaction_on_nodes)
* [`UITouch.location(in:)`](https://developer.apple.com/documentation/uikit/uitouch/1614836-location)
* [`SKNode.position`](https://developer.apple.com/documentation/spritekit/sknode/1483101-position)
