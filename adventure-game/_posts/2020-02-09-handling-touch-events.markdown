---
title: Handling touch events
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/f1fyvq/adventure_game_development_using_spritekit/
  name: r/iOSProgramming
---

## Introduction

All games support some kind of user interaction, right? Let's start by handling
touch events on iOS and tvOS.

`SKNode` subclasses `UIResponder` in iOS and tvOS, and `NSResponder` in macOS,
that means that I can override the methods `touches*` or `mouse*` respectively
for handling touch or mouse events.

There are two main strategies to handle user interaction:

1. Centralize the handling in the scene node
1. Delegate the handling to every node that needs to react to user interactions

I've decided to adopt the first strategy because it seems simpler and more
straight forward to implement.

## Moving the cursor (on iOS and tvOS)

For touch devices, I'll change the position of the cursor node on `touchesBegan`
and on `touchesMoved`:

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

The implementation of both handlers is the same, so I could share the common
implementation in a function, but for the sake of simplicity let's just
duplicate some code.

`touches` includes a set of `UITouch` because iOS devices have multi-touch
support, but for now I just care about the first touch. The `guard` in first
line of the function does exactly that. It assigns the location of the first
touch in the set to `location` or it returns if `touches` is empty.

`location(in: self)` is used to return a `CGPoint` for the position of the touch
in the scene (`self`).

In the second line I assign `location` to the cursor's `position` instance
property, that's the easiest way to move the cursor node in the scene.

In order to be able to reference `cursor` in these functions I've updated the
`setUpScene` implementation. I've replaced the assignment of a new `Cursor`
instance to the local variable `cursor`:

```swift
let cursor = Cursor(120)
```

with a new private instance property `cursor` that's lazily initialized in the
same way:

```swift
private lazy var cursor = Cursor(120)
```

This is the result on iPhone:

<video controls>
  <source src="{{ site.url }}/adventure-game/assets/2020-02-09-iphone.mp4" type="video/mp4">
  Sorry, your browser doesn't support embedded videos.
</video>

There's a little problem with the movements of the cursor on tvOS. The cursor
re-starts moving always from the center of the screen:

<video controls>
  <source src="{{ site.url }}/adventure-game/assets/2020-02-09-tvos-broken.mp4" type="video/mp4">
  Sorry, your browser doesn't support embedded videos.
</video>

The reason why this is happening is because on tvOS `touchesBegan` *resets* the
position of touch events in the current touches series.

I couldn't find any official documentation for this behavior, so if you find
something let me know in the Reddit discussion.

The easiest way I've found to handle this issue is to make the touch position
relative to the last cursor position. To do so I add a `lastPosition` instance
property in `Cursor`:

```swift
var lastPosition: CGPoint = .zero
```

initialize it with the initial cursor position in `setUpScene`:

```swift
cursor.lastPosition = CGPoint(x: frame.midX, y: frame.midY)
```

update it in both `touchesEnded` and `touchesCancelled`, when a touches series
ends, with the last cursor position:

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

and change the implementation of `touchesBegan` and `touchesMoved` to call
`touchHandler`, that is a private instance method (the one that I lazily refused
to create earlier) to update the cursor position relatively to its last position
if the device os is `tvOS`:

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

If `os(iOS)` nothing changes, the next cursor position is simply the touch
event's position. If `os(tvOS)` I compute the delta between the touch event's
position and the mid point on the screen. This offsets the event's position by
`(frame.midX, frame.midY)` because `location` starts always at the mid point of
the screen. Then I compute the next cursor position by adding the delta to the
cursor's last position.

This is the result on tvOS:

<video controls>
  <source src="{{ site.url }}/adventure-game/assets/2020-02-09-tvos-fixed.mp4" type="video/mp4">
  Sorry, your browser doesn't support embedded videos.
</video>

## Conclusion

Now the app can react to touch events by moving the cursor on the screen.

In the next post I'll handle mouse events for moving the cursor on macOS.

## Resources

* [Controlling User Interaction on Nodes](https://developer.apple.com/documentation/spritekit/sknode/controlling_user_interaction_on_nodes)
* [`UITouch.location(in:)`](https://developer.apple.com/documentation/uikit/uitouch/1614836-location)
* [`SKNode.position`](https://developer.apple.com/documentation/spritekit/sknode/1483101-position)
