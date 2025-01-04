---
title: Handling Mouse Events
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/f5ia1u/adventure_game_development_using_spritekit/
  name: r/iOSProgramming
---

## Introduction

Last week, I implemented the callbacks for [handling touch events]({% post_url adventure-game/2020-02-09-handling-touch-events %}) on iOS and tvOS. This week, I'm implementing a callback for handling mouse events on macOS.

## Moving the Cursor (on macOS)

The only method I need to override for now is `mouseMoved`, which informs the receiver that the mouse has moved. Each function call updates the position of the cursor node with the relative position of the mouse in the game scene:

```swift
#if os(OSX)
// Mouse-based event handling
extension GameScene {

    override func mouseMoved(with event: NSEvent) {
        cursor.position = event.location(in: self)
    }

}
#endif
```

The code is straightforward, but as soon as I build the app for the macOS target, I receive this compilation error:

```
GameScene.swift: Use of unresolved identifier 'nextPosition'
```

This error occurs because in the `touchHandler` method, I've defined `nextPosition` only if either `os(iOS)` or `os(tvOS)` is true, but it's still being used even when the target is macOS. To fix this issue, I can wrap the entire method definition in a `#if os(iOS) || os(tvOS)` block to conditionally compile that portion of the code only when the target is either iOS or tvOS:

```swift
#if os(iOS) || os(tvOS)
private func touchHandler(_ location: CGPoint) {
    // ...
}
#endif
```

Once this error is fixed, the app builds successfully. The app starts, a window appears on the screen, I move the mouse, and... nothing happens. :(

The cursor remains at the center of the game scene.

After a brief search, I found the solution: I'm missing a *tracking area*!

A [tracking area](https://developer.apple.com/documentation/appkit/nstrackingarea) is:

> A region of a view that generates mouse-tracking and cursor-update events when the pointer is over that region.

The game's tracking area covers the entire game scene and has the scene as its owner.

I added this code in `setUpScene` and wrapped it in a conditional compilation block that checks if `os(macOS)` is true:

```swift
#if os(OSX)
// Create a tracking area object with self as the owner
// (i.e., the recipient of mouse-tracking messages)
if let frame = view?.frame {
    let trackingArea = NSTrackingArea(
        rect: frame,
        options: [.activeInKeyWindow, .mouseMoved],
        owner: self,
        userInfo: nil
    )
    // Add the tracking area to the view
    view?.addTrackingArea(trackingArea)
}
#endif
```

This is the final result:

{% include video.html src='/adventure-game/assets/2020-02-17-macos.mp4' %}

## Hiding the Default Cursor

In the video above, you'll notice that both cursors—the default macOS cursor and the game cursor—are visible when the mouse is in the game window.

I would like to hide the default cursor as soon as the mouse enters the game's tracking area and reveal it when the mouse exits the tracking area.

To hide/unhide the cursor, one can call `NSCursor.hide()`/`NSCursor.unhide()`, so I first attempted to implement two more `NSResponder` event callbacks: `mouseEntered`/`mouseExited`:

```swift
override func mouseEntered(with event: NSEvent) {
    // Hide the default cursor
    NSCursor.hide()
}

override func mouseExited(with event: NSEvent) {
    // Show the default cursor
    NSCursor.unhide()
}
```

For some reason, these callbacks never run.

I searched for a solution, but I couldn't find anything that doesn't involve subclassing the main game view (`SKView`), so I've decided to leave it as is for now. I plan to revisit and fix this issue later. :)

## Conclusion

Now the app can react to mouse events by moving the cursor on the screen. However, there remains the issue that both the default cursor and the game cursor are visible within the game tracking area. I intend to address this later.

In the next post, I'll create the first sprite node for displaying the scene background.

## Resources

* [`NSResponder.mouseMoved(with:)`](https://developer.apple.com/documentation/appkit/nsresponder/1525114-mousemoved)
* [`NSTrackingArea`](https://developer.apple.com/documentation/appkit/nstrackingarea)
* [`NSCursor`](https://developer.apple.com/documentation/appkit/nscursor)
* [Swift Conditional Compilation Block](https://docs.swift.org/swift-book/ReferenceManual/Statements.html#grammar_compiler-control-statement)
